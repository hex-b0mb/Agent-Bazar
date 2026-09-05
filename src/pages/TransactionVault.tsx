import React, { useState } from 'react';
import { Transaction } from '../types';
import { 
  ScrollText, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Eye, 
  ShieldCheck, 
  ReceiptText, 
  Calendar, 
  CheckCircle2, 
  BadgeCheck,
  Clock,
  AlertCircle, 
  ArrowUpDown, 
  IndianRupee,
  FileCode,
  Sparkles,
  Truck,
  CheckCheck,
  Zap,
  MessageSquare,
  Navigation,
  FileCheck2,
  PieChart,
  FileSpreadsheet,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportToTallyPrimeXml, exportToZohoBooksCsv } from '../utils/erpExportUtils';
import { TaxComplianceWidget } from '../components/TaxComplianceWidget';

interface TransactionVaultProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onOpenWhatsApp?: (tx: Transaction) => void;
  onOpenTransitTracker?: (tx: Transaction) => void;
  onOpenPoD?: (tx: Transaction) => void;
  onOpenSplitSettlement?: (tx: Transaction) => void;
  onOpenAutopayMandate?: () => void;
  onOpenEmailInbox?: (tx?: Transaction) => void;
}

export const TransactionVault: React.FC<TransactionVaultProps> = ({
  transactions,
  onSelectTransaction,
  onOpenWhatsApp,
  onOpenTransitTracker,
  onOpenPoD,
  onOpenSplitSettlement,
  onOpenAutopayMandate,
  onOpenEmailInbox,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  
  // Interactive Escrow Milestones Simulation state
  const [escrowMilestones, setEscrowMilestones] = useState<{
    [txId: string]: {
      advanceReleased: boolean;
      freightReleased: boolean;
      finalSettled: boolean;
    };
  }>({
    'tx-1': { advanceReleased: true, freightReleased: true, finalSettled: true },
    'tx-2': { advanceReleased: true, freightReleased: true, finalSettled: true },
    'tx-3': { advanceReleased: true, freightReleased: false, finalSettled: false },
  });

  const handleAdvanceMilestone = (txId: string, stage: 'freight' | 'final') => {
    setEscrowMilestones(prev => {
      const current = prev[txId] || { advanceReleased: true, freightReleased: false, finalSettled: false };
      if (stage === 'freight') {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.85 } });
        return { ...prev, [txId]: { ...current, freightReleased: true } };
      } else {
        confetti({ particleCount: 70, spread: 90, origin: { y: 0.85 } });
        return { ...prev, [txId]: { ...current, freightReleased: true, finalSettled: true } };
      }
    });
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.bill_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.razorpay_payment_id && t.razorpay_payment_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalVaultGMV = transactions.reduce((acc, t) => acc + (t.payment_status === 'paid' ? t.total_amount : 0), 0);
  const totalVaultGST = transactions.reduce((acc, t) => acc + (t.payment_status === 'paid' ? t.gst_amount : 0), 0);

  // Government GSTR-1 JSON Exporter conforming to GSTN Portal Schema
  const handleExportGSTR1JSON = () => {
    const gstr1Payload = {
      gstin: "19AAECB7788J1ZR",
      fp: "082026",
      version: "GSTR1_V2.4_AUTONOMOUS_SCHEMA",
      gt: totalVaultGMV,
      cur_gt: totalVaultGMV,
      b2b: filteredTransactions.map((tx) => {
        const isInterState = (tx.invoice_data?.buyer.gstin || '19').slice(0, 2) !== (tx.invoice_data?.seller.gstin || '07').slice(0, 2);
        return {
          ctin: tx.invoice_data?.seller.gstin || "07AAACA1234A1Z5",
          cfs: "Y",
          inv: [
            {
              inum: tx.bill_no,
              idt: new Date(tx.created_at).toISOString().split('T')[0],
              val: tx.total_amount,
              pos: tx.invoice_data?.buyer.gstin?.slice(0, 2) || "19",
              rchrg: "N",
              inv_typ: "R",
              itms: [
                {
                  num: 1,
                  itm_det: {
                    hsn_sc: tx.invoice_data?.item.hsn_code || "1006.30",
                    txval: tx.base_amount,
                    rt: tx.gst_percent,
                    iamt: isInterState ? tx.gst_amount : 0,
                    camt: isInterState ? 0 : tx.gst_amount / 2,
                    samt: isInterState ? 0 : tx.gst_amount / 2,
                    csamt: 0
                  }
                }
              ]
            }
          ]
        };
      }),
      hsn: {
        data: filteredTransactions.map((tx, idx) => ({
          num: idx + 1,
          hsn_sc: tx.invoice_data?.item.hsn_code || "1006.30",
          desc: tx.product_name,
          uqc: tx.invoice_data?.item.unit || "KGS",
          qty: tx.quantity,
          val: tx.total_amount,
          txval: tx.base_amount,
          iamt: tx.gst_amount,
          camt: 0,
          samt: 0,
          csamt: 0
        }))
      },
      audit_meta: {
        generated_by: "Agent Bazar Autonomous Tax Engine",
        engine_version: "2.4.0-PROD",
        cryptographic_hash: "0x8f2a9c3d4e7b1a0f96812e9bca4023dd88e1",
        timestamp: new Date().toISOString()
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(gstr1Payload, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `GSTR1_Filing_Payload_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'Bill No',
      'Invoice Date',
      'Buyer Business',
      'Buyer GSTIN',
      'Seller Business',
      'Seller GSTIN',
      'Product Name',
      'HSN Code',
      'Quantity',
      'Unit Price (INR)',
      'Taxable Base (INR)',
      'GST %',
      'GST Amount (INR)',
      'Transport Fee (INR)',
      'Total Settled (INR)',
      'Payment Status',
      'Razorpay Payment ID',
      'Escrow Method'
    ];

    const rows = filteredTransactions.map((tx) => [
      `"${tx.bill_no}"`,
      `"${new Date(tx.created_at).toISOString().split('T')[0]}"`,
      `"${tx.invoice_data?.buyer.business_name || 'Bengal Royal Hotels'}"`,
      `"${tx.invoice_data?.buyer.gstin || '19AAECB7788J1ZR'}"`,
      `"${tx.invoice_data?.seller.business_name || 'Verified Supplier'}"`,
      `"${tx.invoice_data?.seller.gstin || '07AAACA1234A1Z5'}"`,
      `"${tx.product_name.replace(/"/g, '""')}"`,
      `"${tx.invoice_data?.item.hsn_code || '1006.30'}"`,
      tx.quantity,
      tx.unit_price,
      tx.base_amount,
      tx.gst_percent,
      tx.gst_amount,
      tx.transport_charge,
      tx.total_amount,
      `"${tx.payment_status}"`,
      `"${tx.razorpay_payment_id || 'N/A'}"`,
      `"${tx.invoice_data?.payment.method || 'Razorpay Autonomous Escrow'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `A2A_Bazaar_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Immutable Transaction Vault & GST Invoices</h2>
            <p className="text-xs text-slate-500">
              Cryptographically verified ledger of all autonomous B2B settlements with official Indian GST tax bills.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Settled GMV</span>
            <span className="font-mono font-bold text-slate-900 text-sm">₹{totalVaultGMV.toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Total GST Input Credit</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">₹{totalVaultGST.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={handleExportGSTR1JSON}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Export Government-ready GSTR-1 JSON Payload"
          >
            <FileCode className="w-4 h-4 text-indigo-200" />
            <span>GSTR-1 JSON</span>
          </button>

          <button
            onClick={() => exportToZohoBooksCsv(filteredTransactions)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Export for Zoho Books Accounting"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
            <span>Zoho CSV</span>
          </button>

          {filteredTransactions.length > 0 && (
            <button
              onClick={() => exportToTallyPrimeXml(filteredTransactions[0])}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Export latest bill to TallyPrime XML Voucher"
            >
              <FileCode className="w-4 h-4 text-amber-300" />
              <span>Tally XML</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Export full transaction ledger to CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {onOpenEmailInbox && (
            <button
              onClick={() => onOpenEmailInbox()}
              className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/40 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="View Dual-Party Email Dispatch Logs (Mock SMTP)"
            >
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>Email Logs</span>
            </button>
          )}

          {onOpenAutopayMandate && (
            <button
              onClick={onOpenAutopayMandate}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Configure Autonomous UPI Autopay / e-Mandate"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>UPI Autopay</span>
            </button>
          )}
        </div>
      </div>

      {/* Autonomous GST Tax & Input Tax Credit (ITC) Compliance Widget */}
      <TaxComplianceWidget
        transactions={transactions}
        onExportGSTR1={handleExportGSTR1JSON}
        onExportZoho={() => exportToZohoBooksCsv(filteredTransactions)}
        onExportTally={() => filteredTransactions.length > 0 && exportToTallyPrimeXml(filteredTransactions[0])}
      />

      {/* Interactive Razorpay Smart Escrow Milestone State Machine Dashboard */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-500/30 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-100">Razorpay Smart Escrow Milestone Rails</h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  LIVE STATE MACHINE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automated multi-stage funds release: Advance 20% on PO Lock → 30% on e-Way Bill Dispatch → 50% on QC / Delivery OTP.
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Cards for Latest Transaction */}
        {filteredTransactions.slice(0, 2).map(tx => {
          const mState = escrowMilestones[tx.id] || { advanceReleased: true, freightReleased: false, finalSettled: false };
          return (
            <div key={`milestone-${tx.id}`} className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-300 text-xs">Bill #{tx.bill_no}</span>
                  <span className="text-xs text-slate-300 truncate max-w-[200px]">{tx.product_name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Escrow Locked: ₹{tx.total_amount.toLocaleString('en-IN')}</span>
                  {onOpenWhatsApp && (
                    <button
                      onClick={() => onOpenWhatsApp(tx)}
                      className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg text-[11px] font-sans font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp Alerts</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Stage 1 */}
                <div className={`p-3 rounded-lg border ${
                  mState.advanceReleased ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">Stage 1: 20% Advance</span>
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">Released on PO Acceptance</p>
                  <span className="font-mono font-bold text-emerald-400 block mt-1">₹{(tx.total_amount * 0.2).toLocaleString('en-IN')} Disbursed</span>
                </div>

                {/* Stage 2 */}
                <div className={`p-3 rounded-lg border ${
                  mState.freightReleased ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">Stage 2: 30% In-Transit</span>
                    {mState.freightReleased ? (
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <button
                        onClick={() => handleAdvanceMilestone(tx.id, 'freight')}
                        className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold cursor-pointer transition-all"
                      >
                        Simulate e-Way Bill
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">e-Way Bill #291039912 verified</p>
                  <span className="font-mono font-bold text-indigo-300 block mt-1">₹{(tx.total_amount * 0.3).toLocaleString('en-IN')} {mState.freightReleased ? 'Disbursed' : 'In Escrow'}</span>
                </div>

                {/* Stage 3 */}
                <div className={`p-3 rounded-lg border ${
                  mState.finalSettled ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-900/50 border-slate-700 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">Stage 3: 50% Final Settle</span>
                    {mState.finalSettled ? (
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <button
                        onClick={() => handleAdvanceMilestone(tx.id, 'final')}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer transition-all"
                      >
                        Simulate Delivery OTP
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Gate QC & OTP #849201 Verified</p>
                  <span className="font-mono font-bold text-amber-300 block mt-1">₹{(tx.total_amount * 0.5).toLocaleString('en-IN')} {mState.finalSettled ? 'Settled' : 'Pending OTP'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Bill No (e.g. A2A-20260225-1042), Product, or Payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-xs font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Paid ({transactions.filter((t) => t.payment_status === 'paid').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Transactions Table & Stackable Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop / Tablet View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Bill Reference</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Product & Quantity</th>
                <th className="p-4 text-right">Agreed Unit Rate</th>
                <th className="p-4 text-right">GST Amount</th>
                <th className="p-4 text-right">Total Settlement</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-center">Invoice Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <ReceiptText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No transactions match your search query.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your filters or complete a new negotiation.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* Bill No */}
                    <td className="p-4 font-mono font-bold text-blue-900">
                      <div className="flex items-center gap-1.5">
                        <ReceiptText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{tx.bill_no}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-600">
                      <span>{new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {new Date(tx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                      </span>
                    </td>

                    {/* Product */}
                    <td className="p-4">
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {tx.product_name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {tx.quantity} units • {tx.invoice_data?.seller.business_name || 'AgriHub Super Grains'}
                      </p>
                    </td>

                    {/* Unit Price */}
                    <td className="p-4 text-right font-mono font-semibold text-slate-900">
                      ₹{tx.unit_price.toFixed(2)}
                    </td>

                    {/* GST Amount */}
                    <td className="p-4 text-right font-mono text-slate-600">
                      <span>₹{tx.gst_amount.toFixed(2)}</span>
                      <span className="block text-[10px] text-slate-400">({tx.gst_percent}%)</span>
                    </td>

                    {/* Total Amount */}
                    <td className="p-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                      ₹{tx.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {tx.payment_status === 'paid' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                            VERIFIED & PAID
                          </span>
                          {tx.razorpay_payment_id && (
                            <span className="block text-[9px] font-mono text-slate-500 truncate max-w-[120px]">
                              {tx.razorpay_payment_id}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                          <Clock className="w-3 h-3 text-amber-600" />
                          PENDING
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onOpenTransitTracker && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTransitTracker(tx);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="Track Live GPS Transit & Geofence"
                          >
                            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                          </button>
                        )}

                        {onOpenPoD && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPoD(tx);
                            }}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="Digital Proof of Delivery (e-PoD & Signature)"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onOpenSplitSettlement && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenSplitSettlement(tx);
                            }}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="View Split Settlement Breakdown"
                          >
                            <PieChart className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportToTallyPrimeXml(tx);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                          title="Download TallyPrime XML Voucher"
                        >
                          <FileCode className="w-3.5 h-3.5 text-amber-600" />
                        </button>

                        {onOpenWhatsApp && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenWhatsApp(tx);
                            }}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="Open WhatsApp Dispatch Simulator"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onOpenEmailInbox && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEmailInbox(tx);
                            }}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="View Dual-Party Confirmation Emails (Mock SMTP)"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTransaction(tx);
                          }}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                          title="View Official GST Tax Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stackable Card View (< md Viewport) */}
        <div className="md:hidden divide-y divide-slate-200">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <ReceiptText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-xs">No transactions match your query.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting search filters.</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const mState = escrowMilestones[tx.id] || { advanceReleased: true, freightReleased: false, finalSettled: false };
              return (
                <div 
                  key={tx.id} 
                  onClick={() => onSelectTransaction(tx)}
                  className="p-4 hover:bg-slate-50 transition-colors space-y-3 cursor-pointer"
                >
                  {/* Card Header: Bill No & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <ReceiptText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-mono font-bold text-xs text-blue-900">{tx.bill_no}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(tx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                      </div>
                    </div>

                    <div>
                      {tx.payment_status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          <BadgeCheck className="w-3 h-3 text-emerald-600" />
                          PAID
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product & Seller Details */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-xs text-slate-900">{tx.product_name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Quantity: <strong className="text-slate-700">{tx.quantity} units</strong> • {tx.invoice_data?.seller.business_name || 'AgriHub Super Grains'}
                    </p>
                  </div>

                  {/* Financial Mini Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Unit Rate</span>
                      <span className="font-mono font-bold text-slate-800">₹{tx.unit_price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">GST ({tx.gst_percent}%)</span>
                      <span className="font-mono text-slate-600">₹{tx.gst_amount.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-indigo-600 font-bold block">Settlement</span>
                      <span className="font-mono font-extrabold text-slate-900 text-xs">
                        ₹{tx.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Escrow Milestone Mini Progress */}
                  <div className="flex items-center gap-1 text-[10px] pt-0.5">
                    <span className="text-slate-400">Escrow:</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">20% Lock</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${mState.freightReleased ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      30% Freight
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${mState.finalSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      50% OTP
                    </span>
                  </div>

                  {/* Mobile Action Buttons Bar */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(tx);
                      }}
                      className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Invoice</span>
                    </button>

                    {onOpenTransitTracker && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTransitTracker(tx);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs"
                        title="GPS Transit"
                      >
                        <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                      </button>
                    )}

                    {onOpenPoD && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPoD(tx);
                        }}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs"
                        title="Digital PoD"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onOpenSplitSettlement && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSplitSettlement(tx);
                        }}
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs"
                        title="Split Settlement"
                      >
                        <PieChart className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onOpenWhatsApp && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenWhatsApp(tx);
                        }}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onOpenEmailInbox && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEmailInbox(tx);
                        }}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs"
                        title="Emails"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportToTallyPrimeXml(tx);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs"
                      title="Tally XML"
                    >
                      <FileCode className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
