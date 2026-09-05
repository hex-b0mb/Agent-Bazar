import React from 'react';
import { 
  Bell, 
  X, 
  Sparkles, 
  ArrowRight, 
  Mail, 
  ReceiptText, 
  CheckCircle2 
} from 'lucide-react';
import { PriceAlert } from '../types';

interface PriceAlertToastProps {
  alert: PriceAlert | null;
  dealPrice?: number;
  onClose: () => void;
  onOpenEmailInbox?: () => void;
}

export const PriceAlertToast: React.FC<PriceAlertToastProps> = ({
  alert,
  dealPrice,
  onClose,
  onOpenEmailInbox,
}) => {
  if (!alert) return null;

  const realizedPrice = dealPrice || alert.triggered_deal_price || alert.target_price;
  const savings = Math.max(0, alert.current_base_price - realizedPrice);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-purple-500/40 p-4 space-y-3 relative overflow-hidden backdrop-blur-md">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-400/40 flex items-center justify-center shrink-0">
              <Bell className="w-4.5 h-4.5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Price Target Triggered!</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                  DEAL SEALED
                </span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1">
                {alert.product_name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 flex items-center justify-between text-xs font-mono relative z-10">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Negotiated Deal Rate</span>
            <span className="font-extrabold text-emerald-400 text-sm">
              ₹{realizedPrice}/{alert.unit}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-sans">Target Ceiling</span>
            <span className="font-bold text-purple-300">
              ≤ ₹{alert.target_price}/{alert.unit}
            </span>
          </div>

          {savings > 0 && (
            <div className="text-right pl-2 border-l border-slate-700">
              <span className="text-[10px] text-slate-400 block font-sans">Saved</span>
              <span className="font-bold text-amber-400">
                ₹{savings}/{alert.unit}
              </span>
            </div>
          )}
        </div>

        {/* Dispatch Channel Indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5 relative z-10">
          <span className="flex items-center gap-1 text-slate-400">
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[170px]">{alert.buyer_email}</span>
          </span>

          {onOpenEmailInbox && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEmailInbox();
              }}
              className="text-purple-300 hover:text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Open Email</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
