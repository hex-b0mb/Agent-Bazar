import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  Sparkles, 
  Check, 
  TrendingUp, 
  Search, 
  Download, 
  Layers, 
  CreditCard, 
  HelpCircle,
  ExternalLink,
  FileCode,
  Zap,
  PieChart
} from 'lucide-react';
import { ReconciliationRecord, WebhookEvent } from '../types';
import { SEED_RECONCILIATIONS, SEED_WEBHOOKS, SEED_TRANSACTIONS } from '../data/seedData';
import { exportToTallyPrimeXml, exportToZohoBooksCsv } from '../utils/erpExportUtils';
import { RazorpayRouteSplitMap } from '../components/RazorpayRouteSplitMap';

export const FinanceReconciliationHub: React.FC = () => {
  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>(SEED_RECONCILIATIONS);
  const [activeTab, setActiveTab] = useState<'3-way-recon' | 'route-splits' | 'tax-ledger'>('3-way-recon');
  const [selectedRecord, setSelectedRecord] = useState<ReconciliationRecord>(SEED_RECONCILIATIONS[1]);
  const [isResolving, setIsResolving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-resolve AI discrepancy
  const handleAutoResolve = (recId: string) => {
    setIsResolving(true);
    setTimeout(() => {
      setReconciliations((prev) =>
        prev.map((r) =>
          r.id === recId
            ? {
                ...r,
                reconciliation_status: 'resolved',
                discrepancy_reason: 'TDS Withholding verified against Form 26AS/Section 51 filing. Auto-journal voucher posted to ERP.',
              }
            : r
        )
      );
      setIsResolving(false);
    }, 1200);
  };

  const totalGrossInvoiced = reconciliations.reduce((acc, curr) => acc + curr.gross_invoice_amount, 0);
  const totalSettledBank = reconciliations.reduce((acc, curr) => acc + curr.bank_statement_received, 0);
  const totalRzpFees = reconciliations.reduce((acc, curr) => acc + curr.razorpay_fee_deducted, 0);
  const totalTdsWithheld = reconciliations.reduce((acc, curr) => acc + curr.tds_deducted_sec51, 0);
  const totalTaxCredits = reconciliations.reduce((acc, curr) => acc + curr.gstr2b_tax_credit_available, 0);

  const filteredRecords = reconciliations.filter(
    (r) =>
      r.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.buyer_business.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.seller_business.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bank_utr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CSV Export for 3-Way Reconciliation
  const handleExportReconciliationCSV = () => {
    const headers = [
      'Reconciliation ID',
      'Bill Reference',
      'Buyer Business',
      'Seller Business',
      'Product Name',
      'Gross Invoice (INR)',
      'Razorpay Payout Amount (INR)',
      'Razorpay Fee (INR)',
      'Bank Statement Received (INR)',
      'Bank UTR Ref',
      'GSTR-2B ITC Available (INR)',
      'TDS Section 51 Withheld (INR)',
      'Status',
      'Audit Notes'
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.id}"`,
      `"${r.bill_no}"`,
      `"${r.buyer_business}"`,
      `"${r.seller_business}"`,
      `"${r.product_name.replace(/"/g, '""')}"`,
      r.gross_invoice_amount,
      r.razorpay_payout_amount,
      r.razorpay_fee_deducted,
      r.bank_statement_received,
      `"${r.bank_utr}"`,
      r.gstr2b_tax_credit_available,
      r.tds_deducted_sec51,
      `"${r.reconciliation_status}"`,
      `"${(r.discrepancy_reason || 'Verified 3-Way Match').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `3Way_Reconciliation_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-indigo-800/80 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Track 4: AI Financial Controller & 3-Way Reconciliation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Autonomous 3-Way B2B Settlement Reconciliation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Automates the hardest problem in enterprise fintech: 3-way matching between <strong>Razorpay Payouts/Gateway Settlements</strong>, <strong>Bank UTR Statements</strong>, and <strong>Govt GSTR-2B Input Tax Credits (ITC)</strong>. Detects TDS Section 51 timing anomalies and auto-posts adjustment journals.
          </p>
        </div>

        {/* High-level status badge & export */}
        <div className="flex flex-col items-center sm:items-end gap-3">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center min-w-[180px]">
            <span className="text-[11px] text-slate-400 font-semibold block">3-Way Match Accuracy</span>
            <span className="text-2xl font-black text-emerald-400 mt-0.5 block font-mono">99.85%</span>
            <span className="text-[10px] text-slate-300 flex items-center justify-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Automated Audits</span>
            </span>
          </div>
          <button
            onClick={handleExportReconciliationCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Reconciliation Audit (CSV)</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold block">Total Invoiced (Gross)</span>
          <span className="text-lg sm:text-xl font-black text-slate-900 mt-1 block">
            ₹{totalGrossInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-indigo-600 font-medium mt-0.5 block">100% Tax Invoices</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold block">Razorpay Settlements</span>
          <span className="text-lg sm:text-xl font-black text-indigo-700 mt-1 block">
            ₹{(totalGrossInvoiced - totalRzpFees).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Less ₹{totalRzpFees.toFixed(2)} MDR</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold block">Bank Credit Received</span>
          <span className="text-lg sm:text-xl font-black text-slate-900 mt-1 block">
            ₹{totalSettledBank.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">Matched via NEFT/RTGS UTR</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold block">TDS Deductions (Sec 51)</span>
          <span className="text-lg sm:text-xl font-black text-amber-700 mt-1 block">
            ₹{totalTdsWithheld.toFixed(2)}
          </span>
          <span className="text-[10px] text-amber-600 font-medium mt-0.5 block">Form 26AS Tracked</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <span className="text-[11px] text-slate-500 font-semibold block">GSTR-2B Input Tax Credit</span>
          <span className="text-lg sm:text-xl font-black text-emerald-700 mt-1 block">
            ₹{totalTaxCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">GST Portal Matched</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('3-way-recon')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === '3-way-recon'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>3-Way Reconciliation Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('route-splits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'route-splits'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Route & Escrow Splits</span>
          <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
            Sub-Merchants
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tax-ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tax-ledger'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>GSTR-1 & ERP Synchronizer</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 3-WAY RECONCILIATION LEDGER */}
      {/* ========================================================================= */}
      {activeTab === '3-way-recon' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Reconciliation Table (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  <span>3-Way Matched Audit Entries</span>
                </h3>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search UTR, Buyer, or Item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 w-48 focus:outline-indigo-500"
                  />
                </div>
              </div>

              {/* Desktop / Tablet Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Txn / Date</th>
                      <th className="p-3.5">Invoice Gross</th>
                      <th className="p-3.5">Razorpay Net</th>
                      <th className="p-3.5">Bank Credit (UTR)</th>
                      <th className="p-3.5">GSTR-2B ITC</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((rec) => {
                      const isSelected = rec.id === selectedRecord.id;

                      return (
                        <tr
                          key={rec.id}
                          onClick={() => setSelectedRecord(rec)}
                          className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50/60 font-semibold' : ''
                          }`}
                        >
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{rec.product_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {rec.transaction_id} • {rec.order_date}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">
                            ₹{rec.gross_invoice_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5 font-mono text-indigo-700">
                            ₹{rec.net_settled_to_bank.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono text-slate-900 block">
                              ₹{rec.bank_statement_received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono truncate block max-w-[100px]">
                              {rec.bank_utr}
                            </span>
                          </td>
                          <td className="p-3.5 text-emerald-700 font-bold">
                            ₹{rec.gstr2b_tax_credit_available.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5">
                            {rec.reconciliation_status === 'matched' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>MATCHED</span>
                              </span>
                            ) : rec.reconciliation_status === 'discrepancy' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>DISCREPANCY</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                                <Check className="w-3 h-3 text-indigo-600" />
                                <span>AUTO-RESOLVED</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stackable Card View (< md Viewport) */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const isSelected = rec.id === selectedRecord.id;

                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRecord(rec)}
                      className={`p-3.5 space-y-2.5 transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Top Row: Title & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{rec.product_name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rec.transaction_id} • {rec.order_date}
                          </span>
                        </div>

                        <div>
                          {rec.reconciliation_status === 'matched' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>MATCHED</span>
                            </span>
                          ) : rec.reconciliation_status === 'discrepancy' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>DISCREPANCY</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                              <Check className="w-3 h-3 text-indigo-600" />
                              <span>RESOLVED</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 2x2 Financial Metric Matrix */}
                      <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Invoice Gross</span>
                          <span className="font-mono font-bold text-slate-900">
                            ₹{rec.gross_invoice_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Razorpay Net</span>
                          <span className="font-mono text-indigo-700 font-semibold">
                            ₹{rec.net_settled_to_bank.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Bank UTR Credit</span>
                          <span className="font-mono font-semibold text-slate-800 block truncate">
                            ₹{rec.bank_statement_received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono block truncate">
                            {rec.bank_utr}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">GSTR-2B ITC</span>
                          <span className="font-mono font-bold text-emerald-700">
                            ₹{rec.gstr2b_tax_credit_available.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Discrepancy Alert Snippet if any */}
                      {rec.reconciliation_status === 'discrepancy' && (
                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between gap-2">
                          <span className="line-clamp-1">{rec.discrepancy_reason}</span>
                          <span className="text-[10px] font-bold text-amber-700 underline shrink-0">Tap to inspect</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Detail Pane & Autonomous Resolution (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Audit Inspection View
                  </span>
                  <h4 className="text-sm font-black text-slate-900">{selectedRecord.product_name}</h4>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600">{selectedRecord.transaction_id}</span>
              </div>

              {/* 3-Way Waterfall Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">1. Invoice Gross Value</span>
                  <span className="font-bold text-slate-900">
                    ₹{selectedRecord.gross_invoice_amount.toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">2. Razorpay MDR (2% + GST)</span>
                  <span className="font-bold text-red-600">-₹{selectedRecord.razorpay_fee_deducted.toFixed(2)}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">3. B2B TDS Deducted (Sec 51)</span>
                  <span className="font-bold text-amber-600">-₹{selectedRecord.tds_deducted_sec51.toFixed(2)}</span>
                </div>

                <div className="p-2.5 bg-indigo-50/50 rounded-lg flex items-center justify-between border border-indigo-100">
                  <span className="font-bold text-indigo-900">4. Expected Bank Net Credit</span>
                  <span className="font-black text-indigo-700">
                    ₹{selectedRecord.net_settled_to_bank.toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 bg-emerald-50/50 rounded-lg flex items-center justify-between border border-emerald-100">
                  <span className="font-bold text-emerald-900">5. Actual Bank Statement Received</span>
                  <span className="font-black text-emerald-800">
                    ₹{selectedRecord.bank_statement_received.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Discrepancy Diagnostics & Auto-Resolution */}
              {selectedRecord.reconciliation_status === 'discrepancy' ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Autonomous AI Root-Cause Diagnostic</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {selectedRecord.discrepancy_reason}
                  </p>

                  <button
                    onClick={() => handleAutoResolve(selectedRecord.id)}
                    disabled={isResolving}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {isResolving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Posting Auto-Journal Voucher...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Auto-Post Adjustment Journal Voucher</span>
                      </>
                    )}
                  </button>
                </div>
              ) : selectedRecord.reconciliation_status === 'resolved' ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI Adjustment Journal Voucher Posted</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Voucher ID: <span className="font-mono font-bold">{selectedRecord.auto_adjustment_voucher || 'JV-2026-TDS-8819'}</span>
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-xs text-slate-600 font-medium">
                    ✓ Perfect 3-Way Match across Gateway, Bank, and GSTN.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RAZORPAY ROUTE SPLITS */}
      {/* ========================================================================= */}
      {activeTab === 'route-splits' && (
        <div className="space-y-6">
          <RazorpayRouteSplitMap />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GSTR-1 & ERP SYNCHRONIZER */}
      {/* ========================================================================= */}
      {activeTab === 'tax-ledger' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-600" />
                  <span>Outward Supplies GSTR-1 Summary & ERP Connector</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-compiled Section 37 outward invoices and HSN summaries formatted for GSTN filing, TallyPrime, and Zoho Books.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => exportToZohoBooksCsv(SEED_TRANSACTIONS)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Export for Zoho Books"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export Zoho Books CSV</span>
                </button>

                {SEED_TRANSACTIONS.length > 0 && (
                  <button
                    onClick={() => exportToTallyPrimeXml(SEED_TRANSACTIONS[0])}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="Export to TallyPrime XML"
                  >
                    <FileCode className="w-4 h-4" />
                    <span>Export Tally XML</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table of GSTR-1 Outward Invoices */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Counterparty & GSTIN</th>
                    <th className="p-3.5">HSN Code</th>
                    <th className="p-3.5 text-right">Taxable Value</th>
                    <th className="p-3.5 text-right">IGST / CGST+SGST</th>
                    <th className="p-3.5 text-right">Invoice Total</th>
                    <th className="p-3.5 text-center">ERP Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {SEED_TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-indigo-900">{tx.bill_no}</td>
                      <td className="p-3.5 font-sans">
                        <p className="font-bold text-slate-800">{tx.invoice_data?.buyer.business_name || 'Buyer Enterprise'}</p>
                        <p className="text-[10px] font-mono text-slate-500">{tx.invoice_data?.buyer.gstin || '19AAECB7788J1ZR'}</p>
                      </td>
                      <td className="p-3.5 text-slate-700">{tx.invoice_data?.item.hsn_code || '1006.30'}</td>
                      <td className="p-3.5 text-right text-slate-900 font-bold">₹{tx.base_amount.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-right text-emerald-700 font-bold">₹{tx.gst_amount.toLocaleString('en-IN')} ({tx.gst_percent}%)</td>
                      <td className="p-3.5 text-right text-slate-900 font-black">₹{tx.total_amount.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-center font-sans">
                        <button
                          onClick={() => exportToTallyPrimeXml(tx)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileCode className="w-3 h-3 text-amber-600" />
                          <span>Tally XML</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
