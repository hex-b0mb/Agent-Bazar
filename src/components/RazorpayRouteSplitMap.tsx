import React, { useState } from 'react';
import { 
  GitFork, 
  Building2, 
  Truck, 
  Landmark, 
  Scale, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Coins, 
  Info, 
  Layers, 
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Transaction } from '../types';

interface Props {
  transaction?: Transaction | null;
  onSimulateTransferSuccess?: () => void;
}

export const RazorpayRouteSplitMap: React.FC<Props> = ({ 
  transaction,
  onSimulateTransferSuccess 
}) => {
  const totalAmount = transaction?.total_amount || 75600;
  const baseAmount = transaction?.base_amount || 72000;
  const isPaid = transaction?.payment_status === 'paid';

  // Sub-merchant route split distribution
  const supplierShare = Math.round(totalAmount * 0.85); // 85% to supplier bank account
  const logisticsEscrow = Math.round(totalAmount * 0.10); // 10% held until delivery PoD
  const apmcMandiFee = Math.round(totalAmount * 0.03); // 3% APMC cess
  const tdsSection51 = Math.round(totalAmount * 0.02); // 2% TDS under Section 51

  const [isExecutingTransfers, setIsExecutingTransfers] = useState<boolean>(false);
  const [transferStatus, setTransferStatus] = useState<'pending' | 'settled'>(isPaid ? 'settled' : 'pending');
  const [activeTransferId, setActiveTransferId] = useState<string>('trf_B2B_894129124');

  const handleExecuteRouteTransfers = () => {
    setIsExecutingTransfers(true);
    setTimeout(() => {
      setIsExecutingTransfers(false);
      setTransferStatus('settled');
      setActiveTransferId(`trf_B2B_${Date.now().toString().slice(-8)}`);
      if (onSimulateTransferSuccess) onSimulateTransferSuccess();
    }, 1200);
  };

  return (
    <div id="razorpay-route-split-map" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <GitFork className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Razorpay Route: Programmatic Sub-Merchant Fund Split
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold font-mono">
              Direct API Split & Escrow
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Automatically splits payments upon single buyer checkout into linked sub-merchant accounts (Supplier, Transporter Escrow, APMC Mandi, and Central TDS Treasury) without manual ledger reconciliation.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            id="btn-execute-route-transfers"
            onClick={handleExecuteRouteTransfers}
            disabled={isExecutingTransfers || transferStatus === 'settled'}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isExecutingTransfers ? 'animate-spin' : ''}`} />
            <span>
              {isExecutingTransfers
                ? 'Broadcasting Transfers...'
                : transferStatus === 'settled'
                ? '✓ Transfers Settled via Route'
                : 'Execute Route Split Now'}
            </span>
          </button>
        </div>
      </div>

      {/* Visual Fund Distribution Hierarchy */}
      <div className="space-y-4">
        {/* Source: Master Escrow Ingestion */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                Razorpay Smart Nodal Escrow Ingestion
              </div>
              <div className="text-lg font-black font-mono">
                ₹{totalAmount.toLocaleString('en-IN')}.00 INR
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              Account: <code className="text-indigo-300">acc_RazorpayNodal_B2B</code>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Captured (0% Dispute)</span>
            </span>
          </div>
        </div>

        {/* Arrow Divider */}
        <div className="flex items-center justify-center">
          <div className="px-3 py-1 bg-slate-100 rounded-full text-slate-500 text-[11px] font-bold flex items-center gap-1.5 border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Automatic Razorpay Route API Splits (`transfers[]` array)</span>
          </div>
        </div>

        {/* 4-Way Sub-Merchant Destination Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Node 1: Supplier Primary Settlement (85%) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between hover:border-indigo-300 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="p-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  85% Share
                </span>
                <span className="text-[10px] font-mono text-slate-500">acc_supplier_agro_941</span>
              </div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Supplier Settlement</span>
              </div>
              <div className="text-base font-black text-slate-900 font-mono">
                ₹{supplierShare.toLocaleString('en-IN')}.00
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Direct NEFT/RTGS bank credit to verified GST registered agricultural producer node.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Instant Payout Ready</span>
            </div>
          </div>

          {/* Node 2: Transporter Escrow Hold (10%) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between hover:border-indigo-300 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="p-1 rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                  10% Freight Escrow
                </span>
                <span className="text-[10px] font-mono text-slate-500">acc_vrl_logistics_338</span>
              </div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Transporter Escrow</span>
              </div>
              <div className="text-base font-black text-slate-900 font-mono">
                ₹{logisticsEscrow.toLocaleString('en-IN')}.00
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Locked in smart escrow. Released automatically upon destination weighbridge & OTP confirmation.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] font-bold text-blue-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>e-Way PoD Gated</span>
            </div>
          </div>

          {/* Node 3: APMC Mandi Cess (3%) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between hover:border-indigo-300 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="p-1 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                  3% APMC Cess
                </span>
                <span className="text-[10px] font-mono text-slate-500">acc_mandi_board_delhi</span>
              </div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                <span>APMC Mandi Board</span>
              </div>
              <div className="text-base font-black text-slate-900 font-mono">
                ₹{apmcMandiFee.toLocaleString('en-IN')}.00
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Autonomous statutory mandi infrastructure levy directly remitted to Agricultural Market Committee.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] font-bold text-amber-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tax Authority Verified</span>
            </div>
          </div>

          {/* Node 4: Section 51 TDS Withheld (2%) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between hover:border-indigo-300 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="p-1 rounded bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider">
                  2% TDS Sec 51
                </span>
                <span className="text-[10px] font-mono text-slate-500">acc_treasury_form26as</span>
              </div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Statutory TDS Withholding</span>
              </div>
              <div className="text-base font-black text-slate-900 font-mono">
                ₹{tdsSection51.toLocaleString('en-IN')}.00
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Withheld under CGST Section 51 and auto-credited to supplier Form 26AS portal.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] font-bold text-purple-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>GSTR-2B Auto-Reconciled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
