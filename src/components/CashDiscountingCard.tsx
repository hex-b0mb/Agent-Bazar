import React, { useState } from 'react';
import { 
  Percent, 
  Zap, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  CreditCard, 
  Building2, 
  Sparkles,
  Info,
  BadgePercent
} from 'lucide-react';
import { Product, Transaction } from '../types';

interface CashDiscountingCardProps {
  product: Product | null;
  baseAgreedPrice: number;
  quantity: number;
  gstRate: number;
  transportCharge: number;
  onApplyDiscount?: (discountPercent: number, finalDiscountedTotal: number) => void;
  isApplied?: boolean;
}

export const CashDiscountingCard: React.FC<CashDiscountingCardProps> = ({
  product,
  baseAgreedPrice,
  quantity,
  gstRate,
  transportCharge,
  onApplyDiscount,
  isApplied = false,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<'instant_24h' | 'net_7d' | 'standard_30d'>('instant_24h');

  // Terms calculation
  // 1. Instant 24h UPI/Escrow: 2.0% Cash Discount (2/10 Net 30 standard MSME FinTech logic)
  // 2. Net 7 Days: 1.0% Cash Discount
  // 3. Standard Net 30 Days: 0% Discount
  const termsConfig = {
    instant_24h: {
      discountRate: 2.0,
      label: 'Instant 24-Hour Settlement (2/10 Net 30)',
      subtext: 'Auto-Debit / UPI via Razorpay Smart Escrow within 24h',
      tag: '⭐ Highest ROI for Seller & Buyer',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    net_7d: {
      discountRate: 1.0,
      label: '7-Day Working Capital Window',
      subtext: 'Settled within 7 banking days post-delivery',
      tag: 'Moderate Discount',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    standard_30d: {
      discountRate: 0.0,
      label: 'Standard Net 30 Days B2B Credit',
      subtext: 'Traditional 30-day invoice credit line',
      tag: 'Zero Working Capital Rebate',
      badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    },
  };

  const activeTerm = termsConfig[selectedTerm];

  const totalBaseBeforeDiscount = baseAgreedPrice * quantity;
  const cashDiscountAmount = (totalBaseBeforeDiscount * activeTerm.discountRate) / 100;
  const taxableAfterDiscount = totalBaseBeforeDiscount - cashDiscountAmount;
  const gstAmount = (taxableAfterDiscount * gstRate) / 100;
  const finalTotalAmount = taxableAfterDiscount + gstAmount + transportCharge;

  // Annualized Yield Calculation (APR Equivalent for Early Pay)
  // Formula: (Discount% / (100 - Discount%)) * (365 / (30 - 1))
  const annualizedYieldApr = activeTerm.discountRate > 0 
    ? ((activeTerm.discountRate / (100 - activeTerm.discountRate)) * (365 / 29) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-indigo-500/40 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
            <BadgePercent className="w-5 h-5 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white tracking-tight">Dynamic Early-Payment Cash Discounting</h4>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-mono font-bold">
                2/10 NET 30
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Autonomous Working Capital Optimization — Instant liquidity for Seller, cash savings for Buyer
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-1 rounded-lg border border-emerald-500/30">
          <Zap className="w-3.5 h-3.5" />
          <span>MSME Liquidity Active</span>
        </div>
      </div>

      {/* Credit Terms Selector Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {(Object.keys(termsConfig) as Array<keyof typeof termsConfig>).map((termKey) => {
          const item = termsConfig[termKey];
          const isSelected = selectedTerm === termKey;

          return (
            <button
              key={termKey}
              onClick={() => setSelectedTerm(termKey)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-indigo-600/30 border-amber-400/80 text-white shadow-md ring-1 ring-amber-400/50'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
              }`}
            >
              {item.discountRate > 0 && (
                <span className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-bl-lg">
                  SAVE {item.discountRate}%
                </span>
              )}
              <div className="font-bold text-xs flex items-center gap-1">
                <span>{termKey === 'instant_24h' ? '⚡' : termKey === 'net_7d' ? '⏱️' : '🗓️'}</span>
                <span className={isSelected ? 'text-amber-300 font-extrabold' : 'text-slate-200'}>
                  {termKey === 'instant_24h' ? '24h Early Pay' : termKey === 'net_7d' ? 'Net 7 Days' : 'Net 30 Days'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.subtext}</p>
            </button>
          );
        })}
      </div>

      {/* Breakdown Math Matrix */}
      <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2 text-xs">
        <div className="flex justify-between text-slate-300 pb-1 border-b border-slate-800/80">
          <span>Gross Base Value ({quantity} {product?.unit || 'units'} @ ₹{baseAgreedPrice}):</span>
          <span className="font-mono text-slate-200 font-semibold">₹{totalBaseBeforeDiscount.toLocaleString('en-IN')}</span>
        </div>

        {activeTerm.discountRate > 0 ? (
          <div className="flex justify-between text-emerald-400 font-bold pb-1 border-b border-slate-800/80">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Early Cash Settlement Discount ({activeTerm.discountRate}%):</span>
            </span>
            <span className="font-mono text-emerald-300">- ₹{cashDiscountAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
        ) : (
          <div className="flex justify-between text-slate-400 pb-1 border-b border-slate-800/80">
            <span>Cash Discount Applied:</span>
            <span className="font-mono text-slate-500">₹0.00 (Standard Net 30)</span>
          </div>
        )}

        <div className="flex justify-between text-slate-300 pb-1 border-b border-slate-800/80">
          <span>Net Taxable Base Value:</span>
          <span className="font-mono text-slate-200">₹{taxableAfterDiscount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between text-slate-300 pb-1 border-b border-slate-800/80">
          <span>GST ({gstRate}% on Net Taxable):</span>
          <span className="font-mono text-slate-200">₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between text-slate-300 pb-1 border-b border-slate-800/80">
          <span>Freight / Transport Charge:</span>
          <span className="font-mono text-slate-200">₹{transportCharge.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between items-center pt-1 text-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Final Escrow Amount Payable</span>
            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <span>Annualized Working Capital APR:</span>
              <strong className="font-mono text-white bg-amber-500/20 px-1 rounded">{annualizedYieldApr}% APR</strong>
            </span>
          </div>
          <span className="font-mono font-black text-xl text-emerald-400">
            ₹{finalTotalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Action / Auto-Apply Button */}
      {onApplyDiscount && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-indigo-400" />
            <span>Passed to Razorpay Escrow & Section 31 Tax Invoice</span>
          </span>

          <button
            onClick={() => onApplyDiscount(activeTerm.discountRate, finalTotalAmount)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>Lock {activeTerm.discountRate}% Working Capital Rebate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
