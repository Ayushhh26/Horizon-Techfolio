/**
 * PriceDataService - Manages price data storage and retrieval with MongoDB
 * Implements Solution 1: Store full historical data, update only recent days
 */

const PriceDataModel = require('../db/models/PriceDataModel');
const MarketDataProvider = require('./MarketDataProvider');
const { isDBConnected } = require('../db/connection');
const config = require('../../config/config');

class PriceDataService {
  constructor() {
    this.marketDataProvider = new MarketDataProvider();
    this.useDatabase = isDBConnected();
  }

  /**
   * Get price data for a ticker within a date range
   * First checks database, then cache, then API
   */
  async getPriceData(ticker, startDate, endDate, interval = 'daily') {
    // Try database first
    if (this.useDatabase) {
      const dbData = await this.getFromDatabase(ticker, startDate, endDate, interval);
      if (dbData && dbData.length > 0) {
        console.log(`✅ Retrieved ${dbData.length} data points from database for ${ticker}`);
        return dbData;
      }
    }

    // Try cache (file-based fallback)
    const cachedData = await this.marketDataProvider.get_prices(ticker, startDate, endDate, interval);
    if (cachedData && cachedData.length > 0) {
      // Also save to database for future use
      if (this.useDatabase) {
        await this.saveToDatabase(ticker, cachedData, interval);
      }
      return cachedData;
    }

    // If no data found, return empty array
    return [];
  }

  /**
   * Get price data from database
   */
  async getFromDatabase(ticker, startDate, endDate, interval = 'daily') {
    try {
      const priceDataDoc = await PriceDataModel.findOne({ ticker, interval });
      if (!priceDataDoc) {
        return null;
      }

      // Filter to requested date range
      const filteredData = priceDataDoc.data.filter(point => {
        return point.date >= startDate && point.date <= endDate;
      });

      return filteredData;
    } catch (error) {
      console.error(`Error retrieving price data from database for ${ticker}:`, error.message);
      return null;
    }
  }

  /**
   * Save price data to database
   */
  async saveToDatabase(ticker, priceData, interval = 'daily') {
    if (!this.useDatabase || !priceData || priceData.length === 0) {
      return;
    }

    try {
      // Get existing data
      const existing = await PriceDataModel.findOne({ ticker, interval });
      
      if (existing) {
        // Merge with existing data (avoid duplicates)
        const existingDates = new Set(existing.data.map(p => p.date));
        const newDataPoints = priceData.filter(p => !existingDates.has(p.date));
        
        if (newDataPoints.length > 0) {
          existing.data.push(...newDataPoints);
          existing.data.sort((a, b) => new Date(a.date) - new Date(b.date));
          existing.lastDate = existing.data[existing.data.length - 1].date;
          existing.firstDate = existing.data[0].date;
          existing.totalDataPoints = existing.data.length;
          existing.lastUpdated = new Date();
          await existing.save();
          console.log(`✅ Updated ${ticker}: Added ${newDataPoints.length} new data points`);
        }
      } else {
        // Create new document
        const priceDataDoc = new PriceDataModel({
          ticker,
          interval,
          data: priceData,
          firstDate: priceData[0].date,
          lastDate: priceData[priceData.length - 1].date,
          totalDataPoints: priceData.length,
          lastUpdated: new Date()
        });
        await priceDataDoc.save();
        console.log(`✅ Saved ${ticker}: ${priceData.length} data points to database`);
      }
    } catch (error) {
      console.error(`Error saving price data to database for ${ticker}:`, error.message);
    }
  }

  /**
   * Update ticker data with latest trading day
   * Only fetches the most recent data if needed
   */
  async updateLatestData(ticker, interval = 'daily') {
    try {
      const existing = await PriceDataModel.findOne({ ticker, interval });
      
      // Calculate yesterday's date (last trading day)
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (!existing) {
        // No data exists - initialize with full history
        console.log(`📥 No data exists for ${ticker}, initializing...`);
        await this.initializeTickerData(ticker, interval);
        return;
      }
      
      // Check if we need to update (data is older than yesterday)
      if (existing.lastDate < yesterdayStr) {
        console.log(`🔄 Updating ${ticker} with latest data (last date: ${existing.lastDate}, fetching up to ${yesterdayStr})`);
        
        // Fetch from lastDate to yesterday (API returns all data in range, but we'll filter duplicates)
        // Note: We fetch from lastDate (not lastDate+1) because Alpha Vantage requires a start date
        // The saveToDatabase method will filter out duplicates based on date
        const newData = await this.marketDataProvider.get_prices(ticker, existing.lastDate, yesterdayStr, interval);
        if (newData && newData.length > 0) {
          await this.saveToDatabase(ticker, newData, interval);
        } else {
          console.log(`⚠️  No new data returned from API for ${ticker}`);
        }
      } else {
        console.log(`✅ ${ticker} data is up to date (last date: ${existing.lastDate})`);
      }
    } catch (error) {
      console.error(`Error updating latest data for ${ticker}:`, error.message);
    }
  }

  /**
   * Batch update multiple tickers
   * Respects rate limits (5 calls/min)
   */
  async batchUpdateTickers(tickers, interval = 'daily') {
    console.log(`🔄 Batch updating ${tickers.length} tickers...`);
    
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      await this.updateLatestData(ticker, interval);
      
      // Rate limiting: wait 12 seconds between calls (5 calls/min = 1 call per 12 sec)
      if (i < tickers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 12000));
      }
    }
    
    console.log(`✅ Batch update complete for ${tickers.length} tickers`);
  }

  /**
   * Initialize full historical data for a ticker
   * Call this when first adding a ticker to portfolio
   */
  async initializeTickerData(ticker, interval = 'daily') {
    try {
      const existing = await PriceDataModel.findOne({ ticker, interval });
      
      if (existing && existing.totalDataPoints > 0) {
        console.log(`✅ ${ticker} already has ${existing.totalDataPoints} data points`);
        return existing;
      }

      console.log(`📥 Fetching full historical data for ${ticker}...`);
      // Fetch full history (20+ years)
      const startDate = '2000-01-01'; // Alpha Vantage supports data since 2000
      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      
      const priceData = await this.marketDataProvider.get_prices(ticker, startDate, endDate, interval);
      
      if (priceData && priceData.length > 0) {
        await this.saveToDatabase(ticker, priceData, interval);
        console.log(`✅ Initialized ${ticker} with ${priceData.length} data points`);
        return priceData;
      } else {
        console.warn(`⚠️ No data found for ${ticker}`);
        return null;
      }
    } catch (error) {
      console.error(`Error initializing data for ${ticker}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all tickers that need daily update
   */
  async getTickersNeedingUpdate() {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const tickers = await PriceDataModel.find({
        $or: [
          { lastUpdated: { $lt: yesterday } },
          { lastDate: { $lt: yesterday.toISOString().split('T')[0] } }
        ]
      }).select('ticker interval');
      
      return tickers.map(t => t.ticker);
    } catch (error) {
      console.error('Error finding tickers needing update:', error.message);
      return [];
    }
  }

  /**
   * Get the most recent price data point for a ticker
   * Used for getting current market price for trading
   */
  async getLatestPrice(ticker, interval = 'daily') {
    try {
      const priceDataDoc = await PriceDataModel.findOne({ ticker, interval });
      
      if (!priceDataDoc || !priceDataDoc.data || priceDataDoc.data.length === 0) {
        return null;
      }

      // Return the most recent data point (data is sorted by date)
      const latestDataPoint = priceDataDoc.data[priceDataDoc.data.length - 1];
      
      return latestDataPoint;
    } catch (error) {
      console.error(`Error getting latest price for ${ticker}:`, error.message);
      return null;
    }
  }
}

module.exports = PriceDataService;

