import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  RefreshCw, 
  ChevronDown, 
  Check, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  CurrencyCode, 
  IncotermType 
} from '../types';
import { 
  currencyService, 
  SUPPORTED_CURRENCIES, 
  ExchangeRatesState 
} from '../services/currencyService';

interface CurrencySelectorProps {
  selectedCurrency: CurrencyCode;
  onSelectCurrency: (currency: CurrencyCode) => void;
  selectedIncoterm?: IncotermType;
  onSelectIncoterm?: (incoterm: IncotermType) => void;
  spreadPercent?: number;
  onSpreadChange?: (spread: number) => void;
  variant?: 'compact' | 'full' | 'pills' | 'badge';
  showFxRatesTicker?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onSelectCurrency,
  selectedIncoterm = 'CIF',
  onSelectIncoterm,
  spreadPercent = 0,
  onSpreadChange,
  variant = 'compact',
  showFxRatesTicker = false,
}) => {
  const [ratesState, setRatesState] = useState<ExchangeRatesState>(currencyService.getCurrentRates());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showConfigPopover, setShowConfigPopover] = useState(false);

  useEffect(() => {
    const unsubscribe = currencyService.subscribe((state) => {
      setRatesState(state);
    });
    return unsubscribe;
  }, []);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsRefreshing(true);
      await currencyService.fetchLiveRates(true);
      // Brief aesthetic pause for feedback
      await new Promise((res) => setTimeout(res, 400));
    } finally {
      setIsRefreshing(false);
    }
  };

  const currentConfig = SUPPORTED_CURRENCIES[selectedCurrency];
  const rateToInr = ratesState.ratesToInr[selectedCurrency] || currentConfig.baseRateToInr;

  // Variant: Simple Pills for Quick Selection (e.g. inside Invoice or Vault header)
  if (variant === 'pills') {
    const featuredCurrencies: CurrencyCode[] = ['INR', 'USD', 'EUR', 'AED', 'GBP', 'SGD', 'SAR'];
    return (
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
        {featuredCurrencies.map((code) => {
          const cfg = SUPPORTED_CURRENCIES[code];
          const isSelected = selectedCurrency === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => onSelectCurrency(code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>{cfg.flag}</span>
              <span>{code}</span>
              {code === 'INR' && <span className="text-[9px] opacity-70 ml-0.5">(Base)</span>}
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer ml-1"
          title={`Refresh Live FX Rates (${ratesState.source})`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>
    );
  }

  // Variant: Compact Dropdown for Navbar / Table Headers
  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
            selectedCurrency !== 'INR'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
          title="Switch currency & cross-border export view"
        >
          <Globe2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-sm leading-none">{currentConfig.flag}</span>
          <span className="font-mono">{selectedCurrency}</span>
          {selectedCurrency !== 'INR' && (
            <span className="text-[10px] bg-indigo-200/80 text-indigo-950 px-1 py-0.2 rounded font-mono">
              ₹{rateToInr.toFixed(2)}
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showFxRatesTicker && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title={`Refresh live rates from ${ratesState.source}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-2 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header: FX Source Info */}
            <div className="pb-2 px-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-indigo-600" />
                  Cross-Border Currencies
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE FX
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Primary statutory ledger remains in <strong className="text-slate-700">INR (₹)</strong> with live dual-currency export parity.
              </p>
            </div>

            {/* Currency Options */}
            <div className="py-1 max-h-56 overflow-y-auto space-y-0.5">
              {(Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]).map((code) => {
                const cfg = SUPPORTED_CURRENCIES[code];
                const isSelected = selectedCurrency === code;
                const rate = ratesState.ratesToInr[code] || cfg.baseRateToInr;

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      onSelectCurrency(code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-950 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base leading-none">{cfg.flag}</span>
                      <div className="truncate">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{code}</span>
                          <span className="text-slate-400 font-normal text-[11px] truncate">({cfg.name})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{cfg.country}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {code === 'INR' ? (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Base Ledger
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] font-semibold text-indigo-700 block">
                          ₹{rate.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* FX Engine Provider Footer */}
            <div className="pt-2 px-2 flex items-center justify-between text-[10px] text-slate-400">
              <span className="truncate">Engine: {ratesState.source}</span>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
