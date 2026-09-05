import React, { useState } from 'react';
import { Transaction, InvoiceData, CurrencyCode, IncotermType, CrossBorderInvoiceDetails } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Building2, 
  Bot, 
  ReceiptText,
  BadgeCheck,
  Clock,
  Lock,
  CreditCard,
  Check,
  Truck,
  FileCheck2,
  ExternalLink,
  FileDown,
  Loader2,
  Mail,
  Globe2,
  ArrowRightLeft,
  Ship,
  Anchor,
  TrendingUp,
  Percent,
  RefreshCw
} from 'lucide-react';
import { EWayBillModal } from './EWayBillModal';
import { downloadInvoicePdf } from '../utils/invoicePdfGenerator';
import { exportToTallyPrimeXml } from '../utils/erpExportUtils';
import { Navigation, PieChart, FileCode } from 'lucide-react';
import { currencyService, SUPPORTED_CURRENCIES } from '../services/currencyService';
import { CurrencySelector } from './CurrencySelector';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onOpenTransitTracker?: (tx: Transaction) => void;
  onOpenPoD?: (tx: Transaction) => void;
  onOpenSplitSettlement?: (tx: Transaction) => void;
  onOpenEmailInbox?: (tx?: Transaction) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onOpenTransitTracker,
  onOpenPoD,
  onOpenSplitSettlement,
  onOpenEmailInbox,
}) => {
  const [showEwbModal, setShowEwbModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('INR');
  const [selectedIncoterm, setSelectedIncoterm] = useState<IncotermType>('CIF');
  const [spreadPercent, setSpreadPercent] = useState<number>(0);
  const [showFxSettings, setShowFxSettings] = useState(false);

  // Keyboard Escape listener to close modal smoothly
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showEwbModal) {
          setShowEwbModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showEwbModal, onClose]);

  if (!isOpen || !transaction) return null;

  const isPaid = transaction.payment_status === 'paid';
  const paymentId = transaction.razorpay_payment_id || transaction.invoice_data?.payment?.razorpay_payment_id || 'pay_AUTO_SETTLED';
  const paymentMethod = transaction.invoice_data?.payment?.method || 'Razorpay Autonomous Smart-Escrow (Test Mode)';
  const paymentTimestamp = transaction.invoice_data?.payment?.paid_at || transaction.created_at;

  const baseInvoice: InvoiceData = transaction.invoice_data || {
    bill_no: transaction.bill_no,
    invoice_date: transaction.created_at.split('T')[0],
    seller: {
      name: 'AgriHub Merchant',
      business_name: 'AgriHub Super Grains Pvt Ltd',
      gstin: '07AAACA1234A1Z5',
      phone: '+91 98765 43210',
      address: 'Plot 42, APMC Grain Complex, Karnal, Haryana',
    },
    buyer: {
      name: 'Procurement Officer',
      business_name: 'Commercial Enterprise Ltd',
      gstin: '19AAECB7788J1ZR',
      phone: '+91 98300 11223',
      address: '14 Park Street, Kolkata, West Bengal',
    },
    item: {
      product_id: transaction.product_id,
      name: transaction.product_name,
      hsn_code: '1006.30',
      quantity: transaction.quantity,
      unit: 'units',
      unit_price: transaction.unit_price,
      base_amount: transaction.base_amount,
      gst_percent: transaction.gst_percent,
      cgst_percent: transaction.gst_percent / 2,
      cgst_amount: transaction.gst_amount / 2,
      sgst_percent: transaction.gst_percent / 2,
      sgst_amount: transaction.gst_amount / 2,
      transport_charge: transaction.transport_charge,
      total_amount: transaction.total_amount,
    },
    payment: {
      razorpay_payment_id: paymentId,
      payment_status: transaction.payment_status,
      paid_at: paymentTimestamp,
      method: paymentMethod,
    },
    audit_summary: {
      total_rounds: 3,
      base_price: transaction.unit_price * 1.15,
      agreed_price: transaction.unit_price,
      discount_secured: (transaction.unit_price * 0.15) * transaction.quantity,
      discount_percent: 13.0,
      settlement_timestamp: transaction.created_at,
    },
  };

  // Cross-Border calculation
  const crossBorderDetails: CrossBorderInvoiceDetails = currencyService.calculateCrossBorderDetails(
    baseInvoice.item.unit_price,
    baseInvoice.item.base_amount,
    baseInvoice.item.transport_charge,
    baseInvoice.item.total_amount,
    selectedCurrency,
    selectedIncoterm,
    spreadPercent
  );

  const invoice: InvoiceData = {
    ...baseInvoice,
    cross_border: crossBorderDetails,
  };

  const isCrossBorder = selectedCurrency !== 'INR';
  const currencyCfg = SUPPORTED_CURRENCIES[selectedCurrency];

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      // Give a tiny tick so the spinner renders smoothly
      await new Promise((resolve) => setTimeout(resolve, 50));
      downloadInvoicePdf(invoice, transaction);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoice, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GST_Invoice_${invoice.bill_no}_${selectedCurrency}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col cursor-default relative"
      >
        {/* Action Header */}
        <div className="bg-slate-900 text-white p-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <ReceiptText className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="invoice-modal-title" className="font-bold text-sm text-white">
                  {isCrossBorder ? 'Cross-Border Export B2B Tax Invoice' : 'Official GST Tax Invoice'}
                </h3>
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                  {invoice.bill_no}
                </span>
                {isCrossBorder && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded font-bold">
                    Zero-Rated LUT Export
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isCrossBorder 
                  ? 'Section 16 IGST Act 2017 & Foreign Trade Policy (FTP) Compliant'
                  : 'Section 31 CGST Act Compliant B2B Bill'}
              </p>
            </div>
          </div>

          {/* Header Action Buttons & Prominent Upper-Corner Close */}
          <div className="flex items-center flex-wrap gap-2">
            {isPaid ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold shadow-xs">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                <span>Payment: <strong className="text-white font-mono uppercase">VERIFIED</strong></span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/90 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Payment: <strong className="text-white uppercase">PENDING</strong></span>
              </div>
            )}

            {onOpenTransitTracker && transaction && (
              <button
                type="button"
                onClick={() => onOpenTransitTracker(transaction)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg transition-colors cursor-pointer border border-slate-700"
                title="Live GPS & FASTag Transit Tracking"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>GPS Track</span>
              </button>
            )}

            {onOpenPoD && transaction && (
              <button
                type="button"
                onClick={() => onOpenPoD(transaction)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg transition-colors cursor-pointer border border-slate-700"
                title="Digital Proof of Delivery (e-PoD & Signature)"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>e-PoD</span>
              </button>
            )}

            {onOpenSplitSettlement && transaction && (
              <button
                type="button"
                onClick={() => onOpenSplitSettlement(transaction)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg transition-colors cursor-pointer border border-slate-700"
                title="View Split Settlement Breakdown"
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
            )}

            {onOpenEmailInbox && transaction && (
              <button
                type="button"
                onClick={() => onOpenEmailInbox(transaction)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg transition-colors cursor-pointer border border-slate-700"
                title="View Dispatched Dual-Party Confirmation Emails"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Emails</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowEwbModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors cursor-pointer"
              title="Inspect National e-Way Bill (GST EWB-01) & QR Code"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>e-Way Bill QR</span>
            </button>

            {transaction && (
              <button
                type="button"
                onClick={() => exportToTallyPrimeXml(transaction)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg transition-colors cursor-pointer border border-slate-700"
                title="Export directly to TallyPrime XML Voucher"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Tally XML</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              title="Download official high-resolution PDF Tax Invoice"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-700"
              title="Download structured machine-readable JSON for ERP integrations"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-700"
              title="Print invoice on physical paper"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Dedicated Upper-Corner Close Button (High contrast, clearly visible) */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition-all cursor-pointer shadow-xs flex items-center justify-center ml-1"
              title="Close Tax Invoice (Esc)"
              aria-label="Close Tax Invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cross-Border Currency & Incoterms Switcher Ribbon (Interactive) */}
        <div className="bg-slate-800/95 text-slate-200 px-6 py-2.5 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-bold text-white">Cross-Border FX Invoicing:</span>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onSelectCurrency={setSelectedCurrency}
              variant="pills"
            />
          </div>

          <div className="flex items-center gap-3">
            {isCrossBorder && (
              <>
                {/* Incoterm Selector */}
                <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700">
                  <Ship className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] text-slate-400 font-medium">Incoterm:</span>
                  {(['CIF', 'FOB', 'EXW', 'DDP'] as IncotermType[]).map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSelectedIncoterm(term)}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                        selectedIncoterm === term
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>

                {/* Hedging Spread Margin Selector */}
                <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-slate-400 font-medium">FX Spread:</span>
                  {[0, 0.5, 1.0, 1.5].map((spread) => (
                    <button
                      key={spread}
                      type="button"
                      onClick={() => setSpreadPercent(spread)}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                        spreadPercent === spread
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spread}%
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Live Exchange Rate Indicator */}
            {isCrossBorder && (
              <div className="text-[11px] font-mono text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800 flex items-center gap-1.5">
                <span>1 {selectedCurrency} = <strong>₹{crossBorderDetails.exchange_rate_to_inr.toFixed(4)} INR</strong></span>
                <span className="text-[9px] text-indigo-400 opacity-80">({crossBorderDetails.fx_provider})</span>
              </div>
            )}
          </div>
        </div>

        {/* Printable Tax Invoice Paper Body */}
        <div className="p-8 space-y-6 text-slate-900 font-sans text-xs bg-white" id="tax-invoice-printable">
          {/* Header Bar */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 uppercase">
                  {isCrossBorder ? 'CROSS-BORDER EXPORT TAX INVOICE' : 'TAX INVOICE'}
                </span>
                <span className="text-xs bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  {isCrossBorder ? `Dual-Currency (INR / ${selectedCurrency})` : 'Original for Recipient'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isCrossBorder
                  ? 'Issued under Section 16 of IGST Act, 2017 (Zero-Rated Export under Letter of Undertaking - LUT)'
                  : 'Issued in accordance with Section 31 of CGST Act, 2017'}
              </p>
            </div>

            <div className="text-right space-y-1">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Invoice Number</span>
                <span className="text-sm font-mono font-extrabold text-indigo-950">{invoice.bill_no}</span>
              </div>
              <span className="text-[11px] text-slate-600 block">Date: {invoice.invoice_date}</span>
            </div>
          </div>

          {/* Cross-Border Customs & FX Conversion Strip (When in foreign currency mode) */}
          {isCrossBorder && (
            <div className="bg-gradient-to-r from-indigo-50/90 to-teal-50/90 border-2 border-indigo-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-indigo-700" />
                  <span className="font-bold text-xs text-indigo-950 uppercase tracking-tight">
                    Cross-Border Export Customs & FX Parity Declaration
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold">
                    Incoterm: {selectedIncoterm}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Primary Statutory Ledger: <strong className="text-slate-900">INR (₹)</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] pt-1">
                <div className="p-2 bg-white/80 rounded-lg border border-indigo-100">
                  <span className="text-slate-500 block text-[10px]">Benchmark FX Rate</span>
                  <span className="font-mono font-bold text-indigo-950">1 {selectedCurrency} = ₹{crossBorderDetails.exchange_rate_to_inr.toFixed(4)}</span>
                  <span className="text-[9px] text-slate-400 block truncate">{crossBorderDetails.fx_provider}</span>
                </div>

                <div className="p-2 bg-white/80 rounded-lg border border-indigo-100">
                  <span className="text-slate-500 block text-[10px]">Port of Lading & Exit</span>
                  <span className="font-semibold text-slate-800 text-[10px] block">{crossBorderDetails.port_of_loading}</span>
                  <span className="text-[9px] text-slate-400 block">Customs EDI: INNSA1</span>
                </div>

                <div className="p-2 bg-white/80 rounded-lg border border-indigo-100">
                  <span className="text-slate-500 block text-[10px]">Destination Port</span>
                  <span className="font-semibold text-slate-800 text-[10px] block truncate">{crossBorderDetails.port_of_discharge}</span>
                  <span className="text-[9px] text-slate-400 block truncate">{crossBorderDetails.destination_country}</span>
                </div>

                <div className="p-2 bg-white/80 rounded-lg border border-indigo-100">
                  <span className="text-slate-500 block text-[10px]">Export IEC & LUT ARN</span>
                  <span className="font-mono font-bold text-slate-800 text-[10px] block">IEC: {crossBorderDetails.iec_number}</span>
                  <span className="font-mono text-emerald-700 text-[9px] block">LUT: {crossBorderDetails.lut_arn_number}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Verification Highlight Banner (When Paid) */}
          {isPaid && (
            <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-emerald-950 tracking-tight uppercase">
                      Payment Verification
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                      AUTHENTICATED & PAID
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    Settled ₹{transaction.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} via {paymentMethod}
                  </p>
                </div>
              </div>

              <div className="text-right text-[10px] font-mono text-emerald-900 border-l border-emerald-200 pl-4">
                <div><span className="text-emerald-700 font-sans">Payment Ref: </span><strong>{paymentId}</strong></div>
                <div><span className="text-emerald-700 font-sans">Timestamp: </span>{new Date(paymentTimestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</div>
              </div>
            </div>
          )}

          {/* Seller & Buyer Grid */}
          <div className="grid grid-cols-2 gap-6 border border-slate-300 rounded-lg p-4 bg-slate-50/50">
            {/* Supplier / Seller Details */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                SUPPLIER / EXPORTER DETAILS
              </span>
              <h4 className="font-bold text-sm text-slate-900">{invoice.seller.business_name}</h4>
              <p className="text-slate-600 leading-tight">{invoice.seller.address}</p>
              <p className="text-slate-700 font-semibold pt-1">
                GSTIN: <span className="font-mono text-indigo-900">{invoice.seller.gstin}</span>
              </p>
              <p className="text-slate-600">Contact: {invoice.seller.phone}</p>
            </div>

            {/* Buyer Details */}
            <div className="space-y-1 border-l border-slate-200 pl-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {isCrossBorder ? 'CONSIGNEE / FOREIGN BUYER DETAILS' : 'BILLED TO / BUYER DETAILS'}
              </span>
              <h4 className="font-bold text-sm text-slate-900">{invoice.buyer.business_name}</h4>
              <p className="text-slate-600 leading-tight">
                {isCrossBorder 
                  ? `${invoice.buyer.address}, ${crossBorderDetails.destination_country}` 
                  : invoice.buyer.address}
              </p>
              <p className="text-slate-700 font-semibold pt-1">
                {isCrossBorder ? 'VAT / Tax ID: ' : 'GSTIN: '}
                <span className="font-mono text-indigo-900">
                  {isCrossBorder ? `VAT-${invoice.buyer.gstin.slice(2, 12)}` : invoice.buyer.gstin}
                </span>
              </p>
              <p className="text-slate-600">Contact: {invoice.buyer.phone}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Description of Goods</th>
                  <th className="p-3">HSN</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">
                    {isCrossBorder ? `Rate (${selectedCurrency} / ₹)` : 'Agreed Rate'}
                  </th>
                  <th className="p-3 text-right">
                    {isCrossBorder ? `Taxable (${selectedCurrency})` : 'Taxable Value'}
                  </th>
                  <th className="p-3 text-right">
                    {isCrossBorder ? 'Export GST' : `GST (${invoice.item.gst_percent}%)`}
                  </th>
                  <th className="p-3 text-right">
                    {isCrossBorder ? `Total (${selectedCurrency})` : 'Total (₹)'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-500">1</td>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">{invoice.item.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {isCrossBorder 
                        ? `Export Grade Commercial Batch | Incoterm: ${selectedIncoterm}` 
                        : 'Autonomous B2B Cleared Batch'}
                    </p>
                  </td>
                  <td className="p-3 font-mono text-slate-700">{invoice.item.hsn_code}</td>
                  <td className="p-3 text-right font-medium">{invoice.item.quantity} {invoice.item.unit}</td>
                  <td className="p-3 text-right font-mono">
                    {isCrossBorder ? (
                      <div>
                        <span className="font-bold text-indigo-950">
                          {currencyCfg.symbol}{crossBorderDetails.foreign_unit_price.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-slate-400">₹{invoice.item.unit_price.toFixed(2)}</span>
                      </div>
                    ) : (
                      `₹${invoice.item.unit_price.toFixed(2)}`
                    )}
                  </td>
                  <td className="p-3 text-right font-mono font-medium">
                    {isCrossBorder ? (
                      <div>
                        <span className="font-bold text-slate-900">
                          {currencyCfg.symbol}{crossBorderDetails.foreign_base_amount.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-slate-400">₹{invoice.item.base_amount.toFixed(2)}</span>
                      </div>
                    ) : (
                      `₹${invoice.item.base_amount.toFixed(2)}`
                    )}
                  </td>
                  <td className="p-3 text-right font-mono">
                    {isCrossBorder ? (
                      <div>
                        <span className="text-emerald-700 font-bold">0.00</span>
                        <span className="block text-[9px] text-emerald-600">LUT (0%)</span>
                      </div>
                    ) : (
                      `₹${(invoice.item.cgst_amount + invoice.item.sgst_amount).toFixed(2)}`
                    )}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {isCrossBorder ? (
                      <div>
                        <span className="text-indigo-950 font-bold text-sm">
                          {currencyCfg.symbol}{crossBorderDetails.foreign_base_amount.toFixed(2)}
                        </span>
                        <span className="block text-[10px] font-normal text-slate-500">
                          ₹{invoice.item.base_amount.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      `₹${(invoice.item.base_amount + invoice.item.cgst_amount + invoice.item.sgst_amount).toFixed(2)}`
                    )}
                  </td>
                </tr>

                {/* Freight / Transport Line */}
                {invoice.item.transport_charge > 0 && (
                  <tr className="bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-500">2</td>
                    <td className="p-3 font-medium text-slate-800" colSpan={4}>
                      {isCrossBorder 
                        ? `International Port Logistics & Marine Freight Surcharge (${selectedIncoterm})`
                        : 'Commercial Freight & Transport Handling Charge'}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {isCrossBorder 
                        ? `${currencyCfg.symbol}${crossBorderDetails.foreign_transport_charge.toFixed(2)}`
                        : `₹${invoice.item.transport_charge.toFixed(2)}`}
                    </td>
                    <td className="p-3 text-right text-slate-400">0.00</td>
                    <td className="p-3 text-right font-mono font-medium text-slate-900">
                      {isCrossBorder 
                        ? `${currencyCfg.symbol}${crossBorderDetails.foreign_transport_charge.toFixed(2)}`
                        : `₹${invoice.item.transport_charge.toFixed(2)}`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tax Calculation & Settlement Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Payment & Verification Seal Stamp */}
            <div className={`border rounded-xl p-4 space-y-2.5 ${
              isPaid ? 'border-emerald-300 bg-emerald-50/50' : 'border-amber-300 bg-amber-50/40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isPaid ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {isPaid ? <BadgeCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">
                      {isPaid ? 'Payment Verification: Verified' : 'Payment Verification: Pending'}
                    </h5>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isPaid ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      Status: {transaction.payment_status}
                    </span>
                  </div>
                </div>

                {isPaid && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Settled
                  </span>
                )}
              </div>

              <div className="pt-2 text-[11px] text-slate-700 space-y-1 bg-white/70 p-2.5 rounded-lg border border-slate-200/80 font-sans">
                <p className="flex justify-between">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="font-mono font-bold text-slate-900">{paymentId}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-medium text-slate-800">{paymentMethod}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Verification Time:</span>
                  <span className="text-slate-700 font-mono text-[10px]">{paymentTimestamp}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Verified Amount:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹{transaction.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Cryptographically verified via Razorpay Smart Escrow & NPCI UAP Protocol.</span>
              </div>
            </div>

            {/* Subtotals & Grand Total */}
            <div className="space-y-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl p-4">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal ({isCrossBorder ? selectedCurrency : 'INR'}):</span>
                <span className="font-mono font-medium">
                  {isCrossBorder 
                    ? `${currencyCfg.symbol}${crossBorderDetails.foreign_base_amount.toFixed(2)}` 
                    : `₹${invoice.item.base_amount.toFixed(2)}`}
                </span>
              </div>

              {!isCrossBorder ? (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Central GST (CGST @ {invoice.item.cgst_percent}%):</span>
                    <span className="font-mono">₹{invoice.item.cgst_amount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>State GST (SGST @ {invoice.item.sgst_percent}%):</span>
                    <span className="font-mono">₹{invoice.item.sgst_amount.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-emerald-700 bg-emerald-50/60 px-2 py-1 rounded border border-emerald-200/60">
                  <span className="font-semibold">Integrated GST (IGST Export under LUT):</span>
                  <span className="font-mono font-bold">0.00 (Zero-Rated)</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Freight / Ocean Logistics:</span>
                <span className="font-mono">
                  {isCrossBorder 
                    ? `${currencyCfg.symbol}${crossBorderDetails.foreign_transport_charge.toFixed(2)}` 
                    : `₹${invoice.item.transport_charge.toFixed(2)}`}
                </span>
              </div>

              {isCrossBorder && (
                <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline font-bold text-sm text-indigo-950">
                  <span>Export Billing ({selectedCurrency}):</span>
                  <span className="font-extrabold text-indigo-900 font-mono text-lg">
                    {currencyCfg.symbol}{crossBorderDetails.foreign_total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className={`pt-2 ${isCrossBorder ? 'border-t border-dashed border-slate-200' : 'border-t border-slate-300'} flex justify-between items-baseline font-bold text-xs text-slate-700`}>
                <span>Statutory Ledger (Primary INR):</span>
                <span className={`font-mono ${isCrossBorder ? 'text-slate-600 text-xs font-semibold' : 'text-indigo-950 font-extrabold text-base'}`}>
                  ₹{invoice.item.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Embedded Cryptographic Agent Audit Summary */}
          <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-700" />
                <span className="font-bold text-xs text-indigo-950">Autonomous Agent Negotiation Record</span>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-900 border border-indigo-200 font-mono px-2 py-0.5 rounded font-semibold">
                {invoice.audit_summary.total_rounds} Multi-Agent Rounds
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center pt-1 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-indigo-100">
                <span className="text-slate-500 block text-[10px]">Listed Base Rate</span>
                <span className="font-mono font-bold text-slate-800">₹{invoice.audit_summary.base_price}/unit</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-indigo-100">
                <span className="text-slate-500 block text-[10px]">Agreed Deal Rate</span>
                <span className="font-mono font-bold text-emerald-700">₹{invoice.audit_summary.agreed_price}/unit</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-indigo-100">
                <span className="text-slate-500 block text-[10px]">Buyer Direct Savings</span>
                <span className="font-mono font-bold text-emerald-700">₹{invoice.audit_summary.discount_secured}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-indigo-100">
                <span className="text-slate-500 block text-[10px]">Discount Margin</span>
                <span className="font-mono font-bold text-indigo-700">{invoice.audit_summary.discount_percent}%</span>
              </div>
            </div>
          </div>

          {/* Smart Escrow Milestone Release Schedule */}
          <div className="border border-slate-200 bg-slate-50/80 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-700" />
                <span className="font-bold text-xs text-slate-900 uppercase tracking-tight">
                  Razorpay Smart Escrow Milestone Release Schedule
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2-Tier Settlement Protocol</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className={`p-2.5 rounded-lg border ${
                isPaid ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex justify-between items-center font-bold">
                  <span>Milestone 1: 20% Advance Lock</span>
                  <span className="font-mono">₹{(invoice.item.total_amount * 0.20).toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">
                  Condition: Agreement confirmation. {isPaid ? '✓ Disbursed to Supplier Escrow.' : 'Pending Buyer payment.'}
                </p>
              </div>

              <div className={`p-2.5 rounded-lg border ${
                isPaid ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex justify-between items-center font-bold">
                  <span>Milestone 2: 80% Delivery Release</span>
                  <span className="font-mono">₹{(invoice.item.total_amount * 0.80).toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">
                  Condition: Destination e-Way bill & QC clearance. {isPaid ? '✓ Auto-settled via Razorpay.' : 'Triggered on delivery OTP.'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-3 flex justify-between items-center">
            <span>This is an auto-generated computer invoice created via Agent Bazar Autonomous Engine.</span>
            <span className="font-semibold text-slate-700">NPCI UAP Certified Autonomous Commerce Node</span>
          </div>
        </div>

        {/* Modal Bottom Sticky Close & Quick Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically sealed & logged in Immutable Vault.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-indigo-200"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
            >
              <X className="w-4 h-4" />
              <span>Close Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded e-Way Bill Inspector Modal */}
      {showEwbModal && (
        <EWayBillModal
          isOpen={showEwbModal}
          onClose={() => setShowEwbModal(false)}
          transaction={transaction}
        />
      )}
    </div>
  );
};

