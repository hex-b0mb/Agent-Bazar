import React, { useState } from 'react';
import { 
  Building2, 
  IndianRupee, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  SlidersHorizontal, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  Layers,
  Banknote,
  Download,
  Share2,
  Lock
} from 'lucide-react';
import { SEED_TRANSACTIONS } from '../data/seedData';
import { Transaction } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const TredsFactoringHub: React.FC<{
  onViewInvoice?: (tx: Transaction) => void;
}> = ({ onViewInvoice }) => {
  const { t } = useLanguage();
  const [selectedTx, setSelectedTx] = useState<Transaction>(SEED_TRANSACTIONS[0]);
  const [earlyDays, setEarlyDays] = useState<number>(30); // 15, 30, 45 days
  const [selectedPlatform, setSelectedPlatform] = useState<'rxil' | 'm1xchange' | 'invoicemart' | 'razorpay_capital'>('razorpay_capital');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [factoredSuccess, setFactoredSuccess] = useState<boolean>(false);
  const [generatedUtr, setGeneratedUtr] = useState<string>('');

  // Financial Calculations
  const invoiceTotal = selectedTx.total_amount;
  // Dynamic annual discount rate: 9.5% p.a. -> prorated for early days
  const annualRate = selectedPlatform === 'razorpay_capital' ? 0.085 : 0.092;
  const discountRatePercent = (annualRate * (earlyDays / 365)) * 100;
  const factoringFeeAmount = Math.round(invoiceTotal * (discountRatePercent / 100));
  const processingFee = Math.round(invoiceTotal * 0.001); // 0.1% platform fee
  const netInstantPayout = invoiceTotal - factoringFeeAmount - processingFee;

  const handleExecuteFactoring = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const utr = `TREDS-UTR-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setGeneratedUtr(utr);
      setIsProcessing(false);
      setFactoredSuccess(true);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-slate-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>MSMED Act 2006 (Sec 15/16) Compliant</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-900/80 text-indigo-200 border border-indigo-700">
                TReDS / RBI Factoring Rails
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              TReDS MSME Invoice Factoring & Early Liquidity
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
              Unlock same-day working capital for Indian farmers, millers, and MSME suppliers by discounting verified B2B receivables on Razorpay Capital and TReDS exchange gateways.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shrink-0">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Avg Settlement Time</div>
              <div className="text-lg font-bold text-amber-300 mt-0.5">T+0 (Instant)</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Factoring Rate</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">8.5% p.a.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Factoring Interactive Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Invoice Selector & Discount Calculator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Verified Receivable */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>1. Select Verified B2B Trade Receivable</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Showing {SEED_TRANSACTIONS.length} Verified Invoices
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SEED_TRANSACTIONS.map((tx) => {
                const isSelected = selectedTx.id === tx.id;
                return (
                  <button
                    key={tx.id}
                    onClick={() => {
                      setSelectedTx(tx);
                      setFactoredSuccess(false);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-700">{tx.bill_no}</span>
                      <span className="text-xs font-extrabold text-indigo-700">
                        ₹{tx.total_amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 mt-1 truncate">
                      {tx.product_name} ({tx.quantity} {tx.invoice_data?.item?.unit || 'Units'})
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      <span>Buyer: {tx.invoice_data?.buyer?.business_name || tx.buyer_id}</span>
                      <span className="text-emerald-700 font-semibold">6/6 Compliance Verified</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Early Settlement Days & Discount Rate Slider */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                <span>2. Configure Early Settlement Term</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                {earlyDays} Days Early Liquidity
              </span>
            </div>

            {/* Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                <span>10 Days Early</span>
                <span className="text-indigo-600 font-bold">Standard 30 Days</span>
                <span>60 Days Early (Max MSMED)</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={earlyDays}
                onChange={(e) => {
                  setEarlyDays(Number(e.target.value));
                  setFactoredSuccess(false);
                }}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Low Discount Fee (0.23%)</span>
                <span>Standard Factoring</span>
                <span>Max Advance (1.40%)</span>
              </div>
            </div>

            {/* Step 3: TReDS Clearing Platform Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2.5">
                Select Discounting & Liquidity Rail:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'razorpay_capital', name: 'Razorpay Capital', rate: '8.5% p.a.', badge: 'Fastest T+0' },
                  { id: 'rxil', name: 'RXIL Exchange', rate: '9.0% p.a.', badge: 'RBI Regulated' },
                  { id: 'm1xchange', name: 'M1xchange', rate: '9.2% p.a.', badge: 'Digital Bid' },
                  { id: 'invoicemart', name: 'Invoicemart', rate: '9.4% p.a.', badge: 'Axis / mjunction' },
                ].map((plat) => {
                  const isCur = selectedPlatform === plat.id;
                  return (
                    <button
                      key={plat.id}
                      onClick={() => {
                        setSelectedPlatform(plat.id as any);
                        setFactoredSuccess(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isCur
                          ? 'border-indigo-600 bg-indigo-50/80 font-semibold ring-2 ring-indigo-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{plat.name}</div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-0.5">{plat.rate}</div>
                      <div className="text-[9px] text-slate-500 mt-1">{plat.badge}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Instant Settlement Summary & Execution Box */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Instant Payout Breakdown</span>
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                T+0 Settlement
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Invoice Gross Value</span>
                <span className="font-semibold text-white font-mono">
                  ₹{invoiceTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Early Discount Fee ({discountRatePercent.toFixed(2)}%)</span>
                <span className="font-semibold text-rose-400 font-mono">
                  - ₹{factoringFeeAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Platform Processing (0.1%)</span>
                <span className="font-semibold text-rose-400 font-mono">
                  - ₹{processingFee.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px]">Net Instant Bank Credit</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
                    ₹{netInstantPayout.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Factoring Action Button */}
            {!factoredSuccess ? (
              <button
                onClick={handleExecuteFactoring}
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-sm rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Transmitting to TReDS Gateway...</span>
                  </>
                ) : (
                  <>
                    <Banknote className="w-4 h-4" />
                    <span>Disburse ₹{netInstantPayout.toLocaleString('en-IN')} Now</span>
                  </>
                )}
              </button>
            ) : (
              <div className="bg-emerald-950/80 border border-emerald-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Early Payout Disbursed via RTGS!</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                  <div>Bank UTR: <span className="text-amber-300 font-bold">{generatedUtr}</span></div>
                  <div>Settled Account: HDFC Bank ******9941</div>
                  <div>GSTR-2B Note: Adjusted under Sec 15 MSMED</div>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-400 flex items-start gap-2 pt-2 border-t border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Non-recourse factoring: Buyer liability transfers to the clearing exchange upon disbursement.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
