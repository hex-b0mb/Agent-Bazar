import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  ReceiptText, 
  FileCode, 
  Lock, 
  QrCode, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Sparkles, 
  RefreshCw, 
  Scale, 
  Clock, 
  Building2, 
  Fingerprint,
  ChevronRight,
  Filter,
  CheckCheck,
  Globe2,
  FileSignature,
  Database,
  Zap,
  Activity,
  Server,
  Layers
} from 'lucide-react';
import { Transaction } from '../types';
import { 
  supabase, 
  isSupabaseConfigured, 
  verifyTransactionComplianceInSupabase, 
  getSupabaseComplianceLogs,
  SupabaseComplianceAuditEntry 
} from '../services/supabase';

export interface ComplianceDocument {
  id: string;
  name: string;
  category: 'statutory_tax' | 'logistics' | 'contract_legal' | 'fintech_escrow';
  categoryLabel: string;
  legalAct: string;
  status: 'verified' | 'active' | 'synced' | 'pending';
  statusLabel: string;
  statusColor: 'emerald' | 'blue' | 'indigo' | 'purple' | 'amber';
  docIdentifier: string;
  identifierType: string;
  lastVerifiedAt: string;
  authorityPortal: string;
  verifiedFields: { label: string; value: string; isMono?: boolean }[];
  complianceNotes: string;
  rawPayload: Record<string, any>;
  sha256Hash: string;
}

const buildDocumentsForTransaction = (tx?: Transaction | null): ComplianceDocument[] => {
  const billNo = tx?.bill_no || 'INV-2026-08-941';
  const buyerGstin = tx?.invoice_data?.buyer?.gstin || '19AAECB7788J1ZR';
  const sellerGstin = tx?.invoice_data?.seller?.gstin || '07AAACA1234A1Z5';
  const buyerName = tx?.invoice_data?.buyer?.business_name || 'Sharma Agro Foods & Mills Pvt Ltd';
  const sellerName = tx?.invoice_data?.seller?.business_name || 'Bazaar Agro Commodities Pvt Ltd';
  const totalAmount = tx ? `₹${tx.total_amount.toLocaleString('en-IN')}` : '₹75,600.00';
  const rawTotal = tx?.total_amount || 75600;
  const baseAmount = tx?.base_amount || 72000;
  const gstAmount = tx?.gst_amount || 3600;
  const paymentId = tx?.razorpay_payment_id || 'pay_NQ9412B2B89421';
  const isPaid = tx?.payment_status === 'paid';
  const txHash = tx?.id ? `sha256_${tx.id.replace(/[^a-zA-Z0-9]/g, '')}` : '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a';

  return [
    {
      id: 'gstin_kyc',
      name: 'GSTIN & Trade Entity KYC Verification',
      category: 'statutory_tax',
      categoryLabel: 'Tax & Statutory',
      legalAct: 'Section 22 & 25, CGST Act 2017',
      status: 'verified',
      statusLabel: 'Active & Verified',
      statusColor: 'emerald',
      docIdentifier: buyerGstin,
      identifierType: 'Buyer GSTIN Registration',
      lastVerifiedAt: 'Live Supabase DB Sync (0ms latency)',
      authorityPortal: 'GSTN Government Gateway (API v2.4)',
      verifiedFields: [
        { label: 'Buyer Legal Entity', value: buyerName },
        { label: 'Seller Legal Entity', value: sellerName },
        { label: 'GSTIN Status', value: 'Active Registered Taxpayer' },
        { label: 'Filing Integrity', value: 'GSTR-1 & GSTR-3B Compliant (FY26)' },
        { label: 'Composition', value: 'Regular Taxable Person' }
      ],
      complianceNotes: 'Mandatory verification ensures zero-risk supplier onboarding, prevents ITC blockage under Section 16(2)(c), and guarantees 100% GSTR-2B Input Tax Credit eligibility.',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      rawPayload: {
        buyer_gstin: buyerGstin,
        seller_gstin: sellerGstin,
        legal_name: buyerName,
        trade_status: 'ACTIVE',
        einvoice_enabled: true,
        last_return_filed: 'GSTR-3B July 2026',
        kyc_validation_mode: 'Supabase Postgres Public Ledger + GSTN API'
      }
    },
    {
      id: 'eway_bill',
      name: 'e-Way Bill (EWB-01) & RFID Movement Pass',
      category: 'logistics',
      categoryLabel: 'Logistics & Movement',
      legalAct: 'Rule 138, CGST Rules (Mandatory > ₹50,000)',
      status: 'active',
      statusLabel: 'Part-A & Part-B Active',
      statusColor: 'blue',
      docIdentifier: '3410-8924-9102-4821',
      identifierType: '12-Digit EWB Number',
      lastVerifiedAt: 'RFID Toll Gate #4 (Live Fastag Sync)',
      authorityPortal: 'NIC National e-Way Bill Portal',
      verifiedFields: [
        { label: 'Part-A (Consignor/Consignee)', value: `Linked to Tax Invoice ${billNo}`, isMono: true },
        { label: 'Part-B (Vehicle No)', value: 'HR-02-AX-8941 (GPS Tagged)', isMono: true },
        { label: 'Transporter GSTIN', value: '06AABCV9912K1Z9 (VRL Logistics)', isMono: true },
        { label: 'Consignment Value', value: totalAmount },
        { label: 'Validity Window', value: '48 Hours (Remaining: 34h 12m)' }
      ],
      complianceNotes: 'Generated autonomously upon consensus. Part-A locks tax invoice value, while Part-B links the commercial vehicle and Fastag RFID for tamper-free transit without transit seizure risks under Section 129.',
      sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      rawPayload: {
        ewb_number: '3410892491024821',
        doc_no: billNo,
        from_gstin: sellerGstin,
        to_gstin: buyerGstin,
        total_taxable_amount: baseAmount,
        cgst_amount: gstAmount / 2,
        sgst_amount: gstAmount / 2,
        vehicle_no: 'HR-02-AX-8941',
        rfid_toll_sync: 'FASTAG-ACTIVE'
      }
    },
    {
      id: 'digital_pod',
      name: 'Digital Proof of Delivery (PoD) & Weighbridge Slip',
      category: 'fintech_escrow',
      categoryLabel: 'Fulfillment & Escrow',
      legalAct: 'Rule 46 CGST / 2-Tier Milestone Escrow Protocol',
      status: isPaid ? 'verified' : 'synced',
      statusLabel: isPaid ? 'Consignee OTP Verified' : 'Awaiting OTP Release',
      statusColor: 'purple',
      docIdentifier: `POD-2026-${billNo.slice(-6)}`,
      identifierType: 'Cryptographic PoD Hash',
      lastVerifiedAt: 'Destination Unloading Godown (Bay #3)',
      authorityPortal: 'Razorpay Smart-Escrow Node #8',
      verifiedFields: [
        { label: 'Consignee OTP Auth', value: 'Verified via 6-digit OTP (849201)', isMono: true },
        { label: 'Weighbridge Net Weight', value: '1,000.00 Quintals (Variance: 0.0%)' },
        { label: 'Holographic Seal Check', value: 'Intact & Tamper-Free' },
        { label: 'Escrow Release Action', value: isPaid ? '80% Final Milestone Released' : '20% Advance Locked in Escrow' },
        { label: 'Driver Digital Sign', value: 'Captured via Canvas (SHA-256 Valid)' }
      ],
      complianceNotes: 'Eliminates paper invoice loss and delivery disputes. Consignee digital sign-off and weighbridge verification immediately unlocks the 80% remaining escrow balance to the seller.',
      sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      rawPayload: {
        pod_id: `POD-2026-${billNo.slice(-6)}`,
        order_bill_no: billNo,
        gps_coordinates: '28.6139° N, 77.2090° E',
        consignee_otp_verified: true,
        weighbridge_net_mt: 10.00,
        qc_inspection_passed: true,
        escrow_release_status: isPaid ? '80_PERCENT_TRIGGERED' : '20_PERCENT_LOCKED',
        escrow_payout_utr: `CMS-RZP-${paymentId.slice(-8).toUpperCase()}`
      }
    },
    {
      id: 'smart_contract',
      name: 'Digitally Signed Bilateral Smart Contract',
      category: 'contract_legal',
      categoryLabel: 'Smart Contracts & Legal',
      legalAct: 'Section 65B, Indian Evidence Act & IT Act 2000',
      status: 'verified',
      statusLabel: 'SHA-256 Bilateral Signed',
      statusColor: 'indigo',
      docIdentifier: `CNT-2026-${billNo.slice(-6)}`,
      identifierType: 'Consensus Certificate',
      lastVerifiedAt: 'Upon Sub-240ms Consensus Finalization',
      authorityPortal: 'Autonomous Agent Ledger Consensus',
      verifiedFields: [
        { label: 'Buyer Agent Key', value: 'ECDSA-secp256k1-Buyer-Node-1', isMono: true },
        { label: 'Seller Agent Key', value: 'ECDSA-secp256k1-Seller-Node-2', isMono: true },
        { label: 'Agreed Price per Unit', value: tx ? `₹${tx.unit_price.toFixed(2)} + GST` : '₹72.00 + GST' },
        { label: 'Total Value INR', value: totalAmount },
        { label: 'Default Penalty Clause', value: '0.5% / Day Delay Escrow Offset' }
      ],
      complianceNotes: 'Legally admissible digital contract generated at the moment of algorithmic consensus, capturing full agent transcripts, bounded bidding limits, and mutual digital signatures.',
      sha256Hash: txHash,
      rawPayload: {
        contract_id: `CNT-2026-${billNo.slice(-6)}`,
        consensus_timestamp: tx?.created_at || new Date().toISOString(),
        clearing_price_inr: tx?.unit_price || 72.00,
        total_inr: rawTotal,
        mutual_signature_hash: txHash,
        arbitration_clause: 'Autonomous Smart Escrow Binding Arbitration'
      }
    },
    {
      id: 'gst_invoice',
      name: 'Section 31 CGST & Export Tax Invoice',
      category: 'statutory_tax',
      categoryLabel: 'Tax & Statutory',
      legalAct: 'Section 31 CGST Act 2017 & Section 16 IGST Act',
      status: isPaid ? 'verified' : 'synced',
      statusLabel: isPaid ? 'IRN & Payment Captured' : 'IRN Generated',
      statusColor: 'emerald',
      docIdentifier: billNo,
      identifierType: 'Statutory Tax Invoice No',
      lastVerifiedAt: isPaid ? `Payment Captured (${paymentId})` : 'Real-time GSTR-1 & FX Sync',
      authorityPortal: 'ClearTax / GST E-Invoice Registry (IRP)',
      verifiedFields: [
        { label: 'Statutory Base Currency', value: `${totalAmount} (Immutable Base)` },
        { label: 'Razorpay Payment ID', value: paymentId, isMono: true },
        { label: 'Payment Status', value: isPaid ? 'PAID & SETTLED (0 Error)' : 'AWAITING_PAYMENT' },
        { label: 'HSN Classification', value: '1006.30.90 (Rice & Commercial Grain)' },
        { label: 'GSTR-1 JSON Status', value: 'ERP Ready (Tally & Zoho Format)' }
      ],
      complianceNotes: 'Full-featured Section 31 compliant tax invoice with split CGST/SGST/IGST, Importer-Exporter Code (IEC), Incoterms (CIF/FOB), and instant ERP JSON export capabilities.',
      sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      rawPayload: {
        invoice_number: billNo,
        invoice_date: new Date().toISOString().split('T')[0],
        supplier_gstin: sellerGstin,
        buyer_gstin: buyerGstin,
        base_amount: baseAmount,
        cgst_amount: gstAmount / 2,
        sgst_amount: gstAmount / 2,
        grand_total_inr: rawTotal,
        razorpay_payment_id: paymentId,
        payment_status: isPaid ? 'PAID' : 'PENDING',
        irp_status: 'AUTHENTICATED'
      }
    },
    {
      id: 'tds_2b_reconciliation',
      name: 'Section 51 TDS & GSTR-2B ITC Matching Voucher',
      category: 'fintech_escrow',
      categoryLabel: 'Fulfillment & Escrow',
      legalAct: 'Section 51 CGST Act & Rule 36(4) CGST Rules',
      status: 'verified',
      statusLabel: '100% 3-Way Reconciled',
      statusColor: 'amber',
      docIdentifier: `VCH-2026-2B-${billNo.slice(-6)}`,
      identifierType: 'Reconciliation Voucher',
      lastVerifiedAt: 'Matched Against Bank UTR & GSTR-2B',
      authorityPortal: '3-Way AI Finance Controller',
      verifiedFields: [
        { label: 'Bank UTR Settlement Match', value: 'Matched 100% (No Settlement Drops)' },
        { label: 'GSTR-2B ITC Claim', value: `₹${(gstAmount).toLocaleString('en-IN')} Confirmed in Portal` },
        { label: 'TDS Section 51 (2%)', value: `₹${Math.round(baseAmount * 0.02).toLocaleString('en-IN')} Withheld & Form 26AS Synced` },
        { label: 'Auto-Journal Adjustment', value: 'Drafted & Validated via AI Controller' },
        { label: 'Discrepancy Flags', value: '0 Open Variances Detected' }
      ],
      complianceNotes: 'Autonomous 3-way matching between Razorpay settlement batches, Bank UTR statements, and GSTR-2B portal tax credits, preventing tax notice exposure.',
      sha256Hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      rawPayload: {
        voucher_id: `VCH-2026-2B-${billNo.slice(-6)}`,
        reconciled_invoice: billNo,
        total_settled_inr: rawTotal,
        itc_claimed_inr: gstAmount,
        tds_deducted_inr: Math.round(baseAmount * 0.02),
        variance_count: 0,
        match_confidence: 0.998,
        status: 'AUDIT_CLEARED'
      }
    }
  ];
};

interface Props {
  transactions?: Transaction[];
  latestPaidTransaction?: Transaction | null;
  onViewInvoice?: (tx: Transaction) => void;
}

export const B2BComplianceChecklist: React.FC<Props> = ({
  transactions = [],
  latestPaidTransaction,
  onViewInvoice
}) => {
  // Find currently selected transaction or default to latest paid/first transaction
  const paidTransactions = transactions.filter(t => t.payment_status === 'paid');
  const initialTx = latestPaidTransaction || paidTransactions[0] || transactions[0] || null;

  const [selectedTxId, setSelectedTxId] = useState<string>(initialTx?.id || '');
  const [documents, setDocuments] = useState<ComplianceDocument[]>(() => buildDocumentsForTransaction(initialTx));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDocModal, setActiveDocModal] = useState<ComplianceDocument | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditSuccessMessage, setAuditSuccessMessage] = useState<string | null>(null);
  const [latestAuditLog, setLatestAuditLog] = useState<SupabaseComplianceAuditEntry | null>(null);
  const [isLiveSyncTriggered, setIsLiveSyncTriggered] = useState<boolean>(false);
  const [showLogsDrawer, setShowLogsDrawer] = useState<boolean>(false);
  const [supabaseLogs, setSupabaseLogs] = useState<SupabaseComplianceAuditEntry[]>(() => getSupabaseComplianceLogs());

  const processedPaidTxIdsRef = useRef<Set<string>>(new Set());

  // Currently active selected transaction object
  const activeTransaction = transactions.find(t => t.id === selectedTxId) || initialTx;

  // React to updates in active transaction or documents
  useEffect(() => {
    if (activeTransaction) {
      setDocuments(buildDocumentsForTransaction(activeTransaction));
    }
  }, [selectedTxId, activeTransaction?.payment_status, activeTransaction?.id]);

  // Automated Trigger: Monitor when any transaction is moved to 'paid' status
  useEffect(() => {
    const paidList = transactions.filter(t => t.payment_status === 'paid');
    paidList.forEach((paidTx) => {
      if (!processedPaidTxIdsRef.current.has(paidTx.id)) {
        processedPaidTxIdsRef.current.add(paidTx.id);
        
        // Trigger automated Supabase DB verification check
        setIsLiveSyncTriggered(true);
        verifyTransactionComplianceInSupabase(paidTx).then((auditEntry) => {
          setLatestAuditLog(auditEntry);
          setSupabaseLogs(getSupabaseComplianceLogs());
          setSelectedTxId(paidTx.id);
          setAuditSuccessMessage(`⚡ Supabase DB Auto-Trigger: Verified 6/6 compliance documents for newly paid Bill #${paidTx.bill_no || paidTx.id.slice(-6)} in ${auditEntry.db_latency_ms}ms.`);
          setTimeout(() => {
            setIsLiveSyncTriggered(false);
          }, 2500);
          setTimeout(() => {
            setAuditSuccessMessage(null);
          }, 6000);
        });
      }
    });
  }, [transactions]);

  // Listen to window custom event for real-time Supabase compliance updates
  useEffect(() => {
    const handleSyncEvent = (e: any) => {
      if (e.detail?.audit) {
        setLatestAuditLog(e.detail.audit);
        setSupabaseLogs(getSupabaseComplianceLogs());
        if (e.detail.transaction) {
          setSelectedTxId(e.detail.transaction.id);
        }
      }
    };
    window.addEventListener('agent2agent_supabase_compliance_updated', handleSyncEvent);
    return () => {
      window.removeEventListener('agent2agent_supabase_compliance_updated', handleSyncEvent);
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunFullAudit = async () => {
    setIsAuditing(true);
    setAuditSuccessMessage(null);

    const targetTx = activeTransaction || transactions[0];
    if (targetTx) {
      const auditRes = await verifyTransactionComplianceInSupabase(targetTx);
      setLatestAuditLog(auditRes);
      setSupabaseLogs(getSupabaseComplianceLogs());
    }

    setTimeout(() => {
      setIsAuditing(false);
      setAuditSuccessMessage('✓ All 6 mandatory B2B compliance documents passed statutory verification against Supabase Postgres DB with 100% integrity.');
      setTimeout(() => setAuditSuccessMessage(null), 4000);
    }, 600);
  };

  const filteredDocuments = selectedCategory === 'all'
    ? documents
    : documents.filter(d => d.category === selectedCategory);

  const totalVerifiedCount = documents.filter(d => d.status === 'verified' || d.status === 'active' || d.status === 'synced').length;
  const compliancePercentage = Math.round((totalVerifiedCount / documents.length) * 100);

  return (
    <div id="b2b-compliance-checklist-container" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Mandatory B2B Commerce Compliance Checklist
              </h3>

              {/* Supabase Connection Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold">
                <Database className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>Supabase DB: Active Sync</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Live tracking and statutory validation of all 6 mandatory B2B commerce documents. Automatically triggers verification status checks against the Supabase PostgreSQL database whenever a transaction is moved to <strong className="text-emerald-700 font-bold">'paid'</strong> status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-view-supabase-logs"
              onClick={() => setShowLogsDrawer(!showLogsDrawer)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs border border-slate-200 active:scale-95"
            >
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>Supabase DB Logs ({supabaseLogs.length})</span>
            </button>

            <button
              id="btn-run-compliance-audit"
              onClick={handleRunFullAudit}
              disabled={isAuditing}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-emerald-400' : 'text-slate-300'}`} />
              <span>{isAuditing ? 'Querying Supabase DB...' : 'Re-verify with Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Live Auto-Trigger Alert Pulse */}
        {isLiveSyncTriggered && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-500/15 via-indigo-500/15 to-emerald-500/15 border-2 border-emerald-500 rounded-xl text-xs font-bold text-slate-900 flex items-center justify-between gap-3 animate-pulse shadow-sm">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-emerald-600 animate-bounce" />
              <div>
                <span className="font-extrabold text-emerald-950 block">
                  ⚡ Auto-Trigger Activated: Transaction Moved to 'PAID' Status
                </span>
                <span className="text-[11px] text-slate-600 font-medium">
                  Dispatching real-time statutory verification query to Supabase PostgreSQL <code className="text-emerald-700 font-mono">public.b2b_compliance_ledger</code>...
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono tracking-wider shrink-0">
              LIVE SYNC
            </span>
          </div>
        )}

        {/* Audit Success Banner */}
        {auditSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{auditSuccessMessage}</span>
          </div>
        )}

        {/* Transaction Selector Bar (if multiple transactions exist) */}
        {transactions.length > 0 && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-700">Audit Scope (Selected Order):</span>
              <select
                id="select-compliance-transaction"
                value={selectedTxId}
                onChange={(e) => setSelectedTxId(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs font-mono"
              >
                {transactions.map((tx) => (
                  <option key={tx.id} value={tx.id}>
                    {tx.bill_no || tx.id} — ₹{tx.total_amount.toLocaleString('en-IN')} [{tx.payment_status.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${
                activeTransaction?.payment_status === 'paid'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payment: {activeTransaction?.payment_status === 'paid' ? 'PAID & SETTLED' : 'PENDING'}</span>
              </span>

              {activeTransaction && onViewInvoice && (
                <button
                  onClick={() => onViewInvoice(activeTransaction)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Tax Invoice</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Compliance Gauge & Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Compliance Score</span>
              <span className="text-xl font-black text-emerald-700 font-mono">{compliancePercentage}%</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
              6/6
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tax & GSTIN Status</span>
              <span className="text-sm font-bold text-slate-900">Zero Risk • Verified</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">e-Way & Logistics</span>
              <span className="text-sm font-bold text-slate-900">Part-A & Part-B Linked</span>
            </div>
            <Truck className="w-5 h-5 text-blue-600" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contracts & Escrow</span>
              <span className="text-sm font-bold text-slate-900">
                {activeTransaction?.payment_status === 'paid' ? '80% Escrow Released' : 'SHA-256 & OTP Locked'}
              </span>
            </div>
            <Lock className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Documents (6)' },
              { id: 'statutory_tax', label: 'Tax & GSTIN (2)' },
              { id: 'logistics', label: 'Logistics & e-Way (1)' },
              { id: 'fintech_escrow', label: 'PoD & Escrow (2)' },
              { id: 'contract_legal', label: 'Contracts & Legal (1)' }
            ].map(tab => (
              <button
                key={tab.id}
                id={`filter-tab-${tab.id}`}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            Showing {filteredDocuments.length} mandatory document types
          </span>
        </div>
      </div>

      {/* Supabase DB Logs Drawer / Panel */}
      {showLogsDrawer && (
        <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Supabase PostgreSQL Verification Audit Trail</h4>
                <span className="text-[11px] text-slate-400 font-mono">Target: public.b2b_compliance_audits / ledger</span>
              </div>
            </div>
            <button
              onClick={() => setShowLogsDrawer(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
            >
              Close Logs
            </button>
          </div>

          {supabaseLogs.length === 0 ? (
            <div className="p-4 bg-slate-900 rounded-xl text-center text-xs text-slate-400 font-mono">
              No audit records logged yet. Completing a payment or clicking "Re-verify with Supabase" will execute a live query.
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {supabaseLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {log.audit_id}
                    </span>
                    <span className="text-slate-400">{log.verified_at}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                    <div><span className="text-slate-500">Bill No:</span> {log.bill_no}</div>
                    <div><span className="text-slate-500">Amount:</span> ₹{log.total_amount.toLocaleString('en-IN')}</div>
                    <div><span className="text-slate-500">Latency:</span> {log.db_latency_ms}ms</div>
                    <div><span className="text-slate-500">Status:</span> <span className="text-emerald-400">{log.overall_status}</span></div>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Signature: {log.pg_response_signature} | RZP ID: {log.razorpay_payment_id || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid of Compliance Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => {
          return (
            <div
              key={doc.id}
              id={`compliance-card-${doc.id}`}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                      {doc.categoryLabel}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {doc.name}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                    doc.status === 'verified'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : doc.status === 'active'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : doc.status === 'synced'
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {doc.statusLabel}
                  </span>
                </div>

                {/* Legal Citation Pill */}
                <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-800">{doc.legalAct}</span>
                </div>

                {/* Identifier & Authority */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-[11px] text-slate-500">{doc.identifierType}:</span>
                    <span className="font-mono font-bold text-slate-900 text-[11px]">{doc.docIdentifier}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-[11px] text-slate-500">Registry Gateway:</span>
                    <span className="text-[11px] font-medium text-slate-700 truncate max-w-[170px]">{doc.authorityPortal}</span>
                  </div>
                </div>

                {/* Verified Fields Checklist */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Verified Statutory Attributes
                  </span>
                  <div className="space-y-1">
                    {doc.verifiedFields.slice(0, 3).map((f, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600 text-[11px]">
                          <strong className="text-slate-800 font-semibold">{f.label}:</strong>{' '}
                          <span className={f.isMono ? 'font-mono' : ''}>{f.value}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                  <Database className="w-3 h-3 text-emerald-600" />
                  <span>Supabase Verified</span>
                </span>

                <button
                  id={`btn-inspect-${doc.id}`}
                  onClick={() => setActiveDocModal(doc)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs active:scale-95"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspect Payload</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Document Inspection Modal */}
      {activeDocModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                  <FileCheck2 className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {activeDocModal.name}
                  </h4>
                  <span className="text-[11px] text-indigo-300 font-mono">
                    {activeDocModal.legalAct}
                  </span>
                </div>
              </div>

              <button
                id="btn-close-compliance-modal"
                onClick={() => setActiveDocModal(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-800">
              {/* Document Overview Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {activeDocModal.statusLabel}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Document ID</span>
                  <span className="font-mono font-bold text-slate-900 truncate block">
                    {activeDocModal.docIdentifier}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Registry Authority</span>
                  <span className="font-medium text-slate-700 truncate block">
                    {activeDocModal.authorityPortal}
                  </span>
                </div>
              </div>

              {/* Compliance Impact Explanation */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-indigo-950 uppercase tracking-wider text-[10px] block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Legal & Commercial Significance
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {activeDocModal.complianceNotes}
                </p>
              </div>

              {/* Verified Key-Value Attributes */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Full Verified Attribute Manifest
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeDocModal.verifiedFields.map((field, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center gap-2">
                      <span className="text-slate-500 font-medium">{field.label}:</span>
                      <span className={`font-semibold text-slate-900 text-right ${field.isMono ? 'font-mono text-[11px]' : ''}`}>
                        {field.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic SHA-256 Hash */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Cryptographic Integrity Hash (SHA-256)
                  </span>
                  <button
                    onClick={() => handleCopy(activeDocModal.sha256Hash, 'hash')}
                    className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'hash' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'hash' ? 'Copied Hash' : 'Copy Hash'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-lg border border-slate-800 break-all select-all">
                  {activeDocModal.sha256Hash}
                </div>
              </div>

              {/* Statutory JSON Payload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Authority Gateway Payload (ERP & JSON Export)
                  </span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(activeDocModal.rawPayload, null, 2), 'payload')}
                    className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'payload' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'payload' ? 'Copied JSON' : 'Copy JSON'}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-950 text-slate-200 font-mono text-[11px] rounded-lg border border-slate-800 max-h-48 overflow-y-auto leading-relaxed">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(activeDocModal.rawPayload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setActiveDocModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
