'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { getAvailableStocks } from '@/lib/api/stocks';
import { Search, X, Plus, TrendingUp } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

interface StockOption {
  ticker: string;
  name?: string;
  exchange?: string;
  sector?: string;
  inception_date?: string;
  [key: string]: any; // Allow additional properties from backend
}

export default function CreatePortfolioModal({
  isOpen,
  onClose,
  onSuccess,
  userId
}: CreatePortfolioModalProps) {
  const { createPortfolio, isLoading } = usePortfolioStore();
  const { showToast } = useToast();
  
  const [portfolioName, setPortfolioName] = useState('');
  const [initialCapital, setInitialCapital] = useState('10000');
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [availableStocks, setAvailableStocks] = useState<StockOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);

  // Popular stock suggestions
  const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'JPM'];

  useEffect(() => {
    if (isOpen) {
      loadAvailableStocks();
    }
  }, [isOpen]);

  const loadAvailableStocks = async () => {
    setIsLoadingStocks(true);
    try {
      const response = await getAvailableStocks();
      if (response.stocks && Array.isArray(response.stocks)) {
        // Handle both string arrays and object arrays
        const stocksList = response.stocks.map((stock: any) => {
          if (typeof stock === 'string') {
            return { ticker: stock };
          } else if (stock && typeof stock === 'object' && stock.ticker) {
            return {
              ticker: stock.ticker,
              name: stock.name,
              exchange: stock.exchange,
              sector: stock.sector
            };
          }
          return null;
        }).filter(Boolean) as StockOption[];
        
        setAvailableStocks(stocksList);
      } else {
        // Fallback to popular stocks
        setAvailableStocks(popularStocks.map(ticker => ({ ticker })));
      }
    } catch (error) {
      console.error('Failed to load available stocks:', error);
      // Fallback to popular stocks
      setAvailableStocks(popularStocks.map(ticker => ({ ticker })));
    } finally {
      setIsLoadingStocks(false);
    }
  };

  const handleAddStock = (ticker: string) => {
    if (!selectedStocks.includes(ticker) && selectedStocks.length < 10) {
      setSelectedStocks([...selectedStocks, ticker]);
      setSearchTerm('');
    }
  };

  const handleRemoveStock = (ticker: string) => {
    setSelectedStocks(selectedStocks.filter(s => s !== ticker));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!portfolioName.trim()) {
      showToast('Please enter a portfolio name', 'error');
      return;
    }

    if (selectedStocks.length === 0) {
      showToast('Please select at least one stock', 'error');
      return;
    }

    const capital = parseFloat(initialCapital);
    if (isNaN(capital) || capital <= 0) {
      showToast('Please enter a valid initial capital', 'error');
      return;
    }

    try {
      await createPortfolio({
        userId,
        portfolioName: portfolioName.trim(),
        tickers: selectedStocks,
        initialCapital: capital
      });

      showToast('Portfolio created successfully!', 'success');
      
      // Reset form
      setPortfolioName('');
      setInitialCapital('10000');
      setSelectedStocks([]);
      setSearchTerm('');
      
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create portfolio';
      showToast(errorMsg, 'error');
    }
  };

  const filteredStocks = availableStocks.filter(stock =>
    stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedStocks.includes(stock.ticker)
  ).slice(0, 8);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Portfolio"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Portfolio Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Portfolio Name *
          </label>
          <Input
            type="text"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            placeholder="e.g., Tech Growth Portfolio"
            maxLength={50}
            disabled={isLoading}
          />
        </div>

        {/* Initial Capital */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Initial Capital *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              $
            </span>
            <Input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              placeholder="10000"
              min="100"
              step="100"
              className="pl-8"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Minimum: $100
          </p>
        </div>

        {/* Stock Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Stocks * ({selectedStocks.length}/10)
          </label>
          
          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stocks by ticker..."
              className="pl-10"
              disabled={isLoading || selectedStocks.length >= 10}
            />
          </div>

          {/* Selected Stocks */}
          {selectedStocks.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
              {selectedStocks.map(ticker => (
                <Badge
                  key={ticker}
                  variant="primary"
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5"
                >
                  {ticker}
                  <button
                    type="button"
                    onClick={() => handleRemoveStock(ticker)}
                    className="hover:text-red-400 transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Stock Suggestions */}
          {isLoadingStocks ? (
            <div className="flex justify-center py-8">
              <Loading size="sm" text="Loading stocks..." />
            </div>
          ) : (
            <>
              {/* Search Results */}
              {searchTerm && (
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2">Search Results</p>
                  <div className="grid grid-cols-4 gap-2">
                    {filteredStocks.length > 0 ? (
                      filteredStocks.map(stock => (
                        <button
                          key={stock.ticker}
                          type="button"
                          onClick={() => handleAddStock(stock.ticker)}
                          disabled={isLoading || selectedStocks.length >= 10}
                          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm font-medium text-white hover:border-blue-500/50 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {stock.ticker}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-4 text-sm text-slate-400 text-center py-4">
                        No stocks found
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Popular Stocks */}
              {!searchTerm && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-slate-400">Popular Stocks</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {popularStocks
                      .filter(ticker => !selectedStocks.includes(ticker))
                      .slice(0, 8)
                      .map(ticker => (
                        <button
                          key={ticker}
                          type="button"
                          onClick={() => handleAddStock(ticker)}
                          disabled={isLoading || selectedStocks.length >= 10}
                          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm font-medium text-white hover:border-blue-500/50 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ticker}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}

          <p className="text-xs text-slate-400 mt-3">
            Select 1-10 stocks for your portfolio
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || selectedStocks.length === 0 || !portfolioName.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <Loading size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Portfolio
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

