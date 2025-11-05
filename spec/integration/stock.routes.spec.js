/**
 * Integration Tests for Stock Routes
 * Tests stock-related endpoints using supertest
 */

const request = require('supertest');
const app = require('../../src/app');

describe('Stock Routes Integration Tests', () => {
  describe('POST /stocks/search', () => {
    it('should validate valid stock tickers', async () => {
      const response = await request(app)
        .post('/stocks/search')
        .send({
          tickers: ['AAPL', 'MSFT']
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should return 400 when tickers is not an array', async () => {
      const response = await request(app)
        .post('/stocks/search')
        .send({
          tickers: 'AAPL'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when tickers array is empty', async () => {
      const response = await request(app)
        .post('/stocks/search')
        .send({
          tickers: []
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when tickers is missing', async () => {
      const response = await request(app)
        .post('/stocks/search')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /stocks/popular', () => {
    it('should return list of popular stocks', async () => {
      const response = await request(app)
        .get('/stocks/popular')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.stocks).toBeDefined();
      expect(Array.isArray(response.body.stocks)).toBe(true);
      expect(response.body.stocks.length).toBeGreaterThan(0);
    });
  });

  describe('GET /stocks/available', () => {
    it('should return list of available stocks from database', async () => {
      const response = await request(app)
        .get('/stocks/available')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.stocks).toBeDefined();
      expect(Array.isArray(response.body.stocks)).toBe(true);
    });

    it('should include stock metadata', async () => {
      const response = await request(app)
        .get('/stocks/available')
        .expect(200);

      if (response.body.stocks && response.body.stocks.length > 0) {
        const stock = response.body.stocks[0];
        expect(stock.ticker).toBeDefined();
      }
    });
  });
});

