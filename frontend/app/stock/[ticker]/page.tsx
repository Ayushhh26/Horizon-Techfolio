'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Package
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { getStockDetails, StockDetails } from '@/lib/api/stocks';
import { useWalletStore } from '@/lib/store/walletStore';

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params.ticker as string)?.toUpperCase();
  const [stock, setStock] = useState<StockDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradingViewLoaded, setTradingViewLoaded] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const { wallet, buyStock, sellStock, isLoading: isTrading } = useWalletStore();

  useEffect(() => {
    const loadStockDetails = async () => {
      if (!ticker) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getStockDetails(ticker);
        setStock(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load stock details');
      } finally {
        setIsLoading(false);
      }
    };

    loadStockDetails();
  }, [ticker]);

  // Initialize TradingView widget when script is loaded
  useEffect(() => {
    if (!tradingViewLoaded || !chartContainerRef.current || !ticker) return;

    // Clean up previous widget if it exists
    if (widgetRef.current) {
      widgetRef.current.remove();
      widgetRef.current = null;
    }

    // Create new TradingView widget
    if (window.TradingView && chartContainerRef.current) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: ticker,
        interval: 'D',
        timezone: 'America/New_York',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#1e293b',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: 'tradingview-widget',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        studies: [
          {
            name: 'Volume',
            id: 'volume@tv-basicstudies'
          },
          {
            name: 'RSI',
            id: 'RSI@tv-basicstudies'
          }
        ]
      });
    }

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        widgetRef.current = null;
      }
    };
  }, [tradingViewLoaded, ticker]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Loading size="lg" text="Loading stock details..." />
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <GlassCard className="p-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-slate-400 mb-6">{error || 'Stock not found'}</p>
          <Button onClick={() => router.push('/watchlist')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Watchlist
          </Button>
        </GlassCard>
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* TradingView Script */}
      <Script
        src="https://s3.tradingview.com/tv.js"
        strategy="lazyOnload"
        onLoad={() => setTradingViewLoaded(true)}
      />

      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/watchlist')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {stock.ticker}
                </h1>
                <p className="text-sm text-slate-400 mt-1">{stock.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push(`/trading?ticker=${stock.ticker}`)}
              >
                <Activity className="w-4 h-4 mr-2" />
                Trade
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Price Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-6">
            <p className="text-sm text-slate-400 mb-2">Current Price</p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(stock.currentPrice)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <Badge variant={isPositive ? 'success' : 'danger'}>
                {formatPercent(stock.changePercent)}
              </Badge>
              <span className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{formatCurrency(stock.change)}
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <p className="text-sm text-slate-400 mb-2">Previous Close</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(stock.previousClose)}
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <p className="text-sm text-slate-400 mb-2">52W High</p>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(stock.high52w)}
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <p className="text-sm text-slate-400 mb-2">52W Low</p>
            <p className="text-2xl font-bold text-red-400">
              {formatCurrency(stock.low52w)}
            </p>
          </GlassCard>
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4">
            <p className="text-xs text-slate-400 mb-1">Open</p>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(stock.open)}
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-xs text-slate-400 mb-1">High</p>
            <p className="text-lg font-semibold text-green-400">
              {formatCurrency(stock.high)}
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-xs text-slate-400 mb-1">Low</p>
            <p className="text-lg font-semibold text-red-400">
              {formatCurrency(stock.low)}
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-xs text-slate-400 mb-1">Volume</p>
            <p className="text-lg font-semibold text-white">
              {stock.volume.toLocaleString()}
            </p>
          </GlassCard>
        </div>

        {/* TradingView Chart */}
        <GlassCard className="p-0 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Price Chart</h2>
              </div>
              <Badge variant="info" showIcon={false}>
                {stock.date}
              </Badge>
            </div>
          </div>
          <div 
            id="tradingview-widget"
            ref={chartContainerRef}
            className="h-[600px] w-full"
            style={{ minHeight: '600px' }}
          />
        </GlassCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Buy {stock.ticker}</h3>
                <p className="text-sm text-slate-400">Available: {formatCurrency(wallet?.balance || 0)}</p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push(`/trading?ticker=${stock.ticker}&action=buy`)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Now
            </Button>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <Package className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Sell {stock.ticker}</h3>
                <p className="text-sm text-slate-400">Check your holdings</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => router.push(`/trading?ticker=${stock.ticker}&action=sell`)}
            >
              <Package className="w-4 h-4 mr-2" />
              Sell Now
            </Button>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

// Extend Window interface for TradingView
declare global {
  interface Window {
    TradingView: any;
  }
}

