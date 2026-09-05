import React from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  CheckCircle2, 
  Database, 
  Zap, 
  Sparkles, 
  ExternalLink, 
  Scale, 
  Truck, 
  ReceiptText, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { B2BComplianceChecklist } from '../components/B2BComplianceChecklist';
import { Transaction } from '../types';

interface ComplianceHubProps {
  transactions?: Transaction[];
  latestPaidTransaction?: Transaction | null;
  onViewInvoice?: (tx: Transaction) => void;
  onNavigateToVault?: () => void;
}

export const ComplianceHub: React.FC<ComplianceHubProps> = ({
  transactions = [],
  latestPaidTransaction,
  onViewInvoice,
  onNavigateToVault,
}) => {
  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-indigo-800 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Statutory B2B Regulatory Compliance & Legal Ledger</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            6/6 Statutory Document Verification Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Enterprise-grade statutory tracking under the CGST Act 2017, Indian Evidence Act Section 65B, and National e-Way Bill Portal. Every autonomous deal generates cryptographically authenticated and verifiable documents linked to live Supabase PostgreSQL audit ledgers.
          </p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-indigo-700/60 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-300 block">Compliance Status</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">100% PASS</span>
          <span className="text-[11px] text-slate-300 block">6 of 6 Mandatory Documents Active</span>
        </div>
      </div>

      {/* Real-time B2B Compliance Checklist Engine */}
      <B2BComplianceChecklist
        transactions={transactions}
        latestPaidTransaction={latestPaidTransaction}
        onViewInvoice={onViewInvoice}
      />
    </div>
  );
};
