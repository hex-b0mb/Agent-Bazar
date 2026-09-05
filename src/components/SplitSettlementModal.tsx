import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  CreditCard, 
  DollarSign, 
  IndianRupee, 
  PieChart, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  Check, 
  ExternalLink, 
  Download,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction } from '../types';

interface SplitSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const SplitSettlementModal: React.FC<SplitSettlementModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  // Keyboard Escape listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const totalAmount = transaction.total_amount;
  const baseAmount = transaction.base_amount;
  const gstAmount = transaction.gst_amount;
  const transportCharge = transaction.transport_charge;

  // Split Settlement Math
  const platformFee = Math.round(totalAmount * 0.015); // 1.5% marketplace escrow fee
  const tdsSection51 = Math.round(baseAmount * 0.01); // 1% GST TDS under Sec 51
  const freightShare = transportCharge;
  const supplierNetPayout = totalAmount - platformFee - tdsSection51 - freightShare;

  const splits = [
    {
      id: 'supplier-net',
      recipient: transaction.invoice_data?.seller.business_name || 'AgriHub Super Grains Pvt Ltd',
      role: 'Merchant / Seller Share',
      amount: supplierNetPayout,
      percent: Number(((supplierNetPayout / totalAmount) * 100).toFixed(1)),
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      bgColor: 'bg-emerald-50',
      utr: `UTR-IND-SBIN-${transaction.id.slice(-6)}-901`,
      status: 'Auto-Settled to Nodal Account'
    },
    {
      id: 'freight-carrier',
      recipient: 'Bharat Logistics Fleet (HR-08-AU-9921)',
      role: 'Transporter Escrow',
      amount: freightShare,
      percent: Number(((freightShare / totalAmount) * 100).toFixed(1)),
      color: 'bg-indigo-500',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200',
      bgColor: 'bg-indigo-50',
      utr: `UTR-TRK-HDFC-${transaction.id.slice(-6)}-882`,
      status: 'Released on e-PoD Verification'
    },
    {
      id: 'platform-fee',
      recipient: 'Agent Bazar Autonomous Nodal Escrow',
      role: 'Marketplace Protocol Fee (1.5%)',
      amount: platformFee,
      percent: 1.5,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      utr: `UTR-ESC-ICIC-${transaction.id.slice(-6)}-334`,
      status: 'Instant Autonomous Deduction'
    },
    {
      id: 'govt-tds',
      recipient: 'Govt of India (GSTN Section 51 TDS Pool)',
      role: 'GST TDS Withholding (1.0%)',
      amount: tdsSection51,
      percent: Number(((tdsSection51 / totalAmount) * 100).toFixed(1)),
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50',
      utr: `CHLN-GSTN-26AS-${transaction.id.slice(-6)}`,
      status: 'Auto-Deposited to Govt Ledger'
    }
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh] cursor-default relative"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Autonomous Split-Settlement Ledger</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  INSTANT BIFURCATION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gross Inflow: ₹{totalAmount.toLocaleString('en-IN')} for Bill #{transaction.bill_no}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 rounded-lg transition-all cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Visual Percentage Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Automated Fund Distribution</span>
              <span className="font-mono text-indigo-600">100% Balanced</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
              {splits.map((s) => (
                <div 
                  key={s.id}
                  style={{ width: `${s.percent}%` }}
                  className={`${s.color} transition-all`}
                  title={`${s.role}: ₹${s.amount.toLocaleString('en-IN')} (${s.percent}%)`}
                />
              ))}
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="space-y-3">
            {splits.map((s) => (
              <div key={s.id} className={`p-3.5 rounded-xl border ${s.borderColor} ${s.bgColor} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">{s.recipient}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-white/80 border border-slate-200 rounded font-semibold text-slate-600 shrink-0">
                      {s.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-600">
                    <span>{s.utr}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{s.status}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-base font-bold text-slate-900">
                    ₹{s.amount.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">({s.percent}% of gross)</p>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance & Section 51 Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Autonomous Escrow Routing Engine</span>
              <p className="mt-0.5">
                Funds deposited through Razorpay Nodal Escrow are bifurcated instantaneously at the smart contract level. No manual reconciliation or manual vendor transfer batches required.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3.5 flex items-center justify-between text-white">
          <span className="text-xs text-slate-400">NPCI Smart Escrow Settlement Protocol</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
