import React, { useState, useEffect } from 'react';
import { BuyerRequest, Transaction, AgentAction, Product, PriceAlert } from '../types';
import { DEMO_PRESETS, SEED_PRODUCTS } from '../data/seedData';
import { PaymentCheckService, ResendPaymentLinkResult } from '../services/paymentCheckService';
import { 
  ShoppingBag, 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  ReceiptText,
  AlertTriangle,
  Send,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
  Mail,
  Zap,
  X,
  Bell,
  Sliders,
  Filter,
  Search,
  CheckCheck,
  Trash2,
  TrendingDown
} from 'lucide-react';

interface BuyerDashboardProps {
  requests: BuyerRequest[];
  onSubmitRequest: (query: string, maxBudget: number, quantity: number, deadlineDays: number) => void;
  onSelectPreset: (presetId: string) => void;
  onNavigateToArena: () => void;
  transactions: Transaction[];
  onViewInvoice: (tx: Transaction) => void;
  onUpdateTransaction?: (tx: Transaction) => void;
  onPayTransaction?: (tx: Transaction) => void;
  products?: Product[];
  priceAlerts?: PriceAlert[];
  onOpenPriceAlertModal?: (product: Product) => void;
  onSimulateAlertMatch?: (alertId: string) => void;
  onOpenEmailInbox?: () => void;
  onDeleteAlert?: (alertId: string) => void;
  onSelectProductForProcurement?: (product: Product) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  requests,
  onSubmitRequest,
  onSelectPreset,
  onNavigateToArena,
  transactions,
  onViewInvoice,
  onUpdateTransaction,
  onPayTransaction,
  products = SEED_PRODUCTS,
  priceAlerts = [],
  onOpenPriceAlertModal,
  onSimulateAlertMatch,
  onOpenEmailInbox,
  onDeleteAlert,
  onSelectProductForProcurement,
}) => {
  const [query, setQuery] = useState('I need 50kg authentic aged 1121 basmati rice under ₹80/kg, deliver within 3 days to Mumbai kitchen.');
  const [maxBudget, setMaxBudget] = useState<number | ''>(82);
  const [quantity, setQuantity] = useState<number | ''>(50);
  const [deadlineDays, setDeadlineDays] = useState<number>(3);

  // Catalog search and filter state
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter tab for transactions
  const [txFilter, setTxFilter] = useState<'all' | 'overdue' | 'pending' | 'paid'>('all');

  // Background Check state
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toLocaleTimeString());
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Resend Payment Link state & modal
  const [resendingTxId, setResendingTxId] = useState<string | null>(null);
  const [resendResult, setResendResult] = useState<ResendPaymentLinkResult | null>(null);
  const [isResendModalOpen, setIsResendModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Background Check Engine: Scan transactions every 30 seconds for pending payments > 24 hours
  useEffect(() => {
    const runBackgroundCheck = () => {
      setIsScanning(true);
      setLastCheckTime(new Date().toLocaleTimeString());
      setTimeout(() => {
        setIsScanning(false);
      }, 600);
    };

    runBackgroundCheck();
    const interval = setInterval(runBackgroundCheck, 30000);
    return () => clearInterval(interval);
  }, [transactions]);

  // Derived collections via PaymentCheckService
  const overdueTransactions = PaymentCheckService.getOverdueTransactions(transactions, 24);
  const pendingTransactions = transactions.filter((t) => t.payment_status === 'pending');
  const paidTransactions = transactions.filter((t) => t.payment_status === 'paid');

  // Keyboard Escape listener for resend modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isResendModalOpen) {
        setIsResendModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResendModalOpen]);

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'overdue') return PaymentCheckService.isPendingOverdue(tx, 24);
    if (txFilter === 'pending') return tx.payment_status === 'pending';
    if (txFilter === 'paid') return tx.payment_status === 'paid';
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !maxBudget || !quantity) return;
    onSubmitRequest(query, Number(maxBudget), Number(quantity), Number(deadlineDays));
  };

  // Handler to resend payment link for a specific transaction
  const handleResendLink = (tx: Transaction) => {
    setResendingTxId(tx.id);
    setTimeout(() => {
      const result = PaymentCheckService.resendPaymentLink(tx);
      setResendingTxId(null);
      setResendResult(result);
      setIsResendModalOpen(true);
      if (onUpdateTransaction) {
        onUpdateTransaction(result.updatedTransaction);
      }
    }, 500);
  };

  // Handler to batch-resend all overdue transactions
  const handleResendAllOverdue = () => {
    if (overdueTransactions.length === 0) return;
    setResendingTxId('batch_all');
    setTimeout(() => {
      overdueTransactions.forEach((tx) => {
        const result = PaymentCheckService.resendPaymentLink(tx);
        if (onUpdateTransaction) {
          onUpdateTransaction(result.updatedTransaction);
        }
      });
      setResendingTxId(null);
      const lastRes = PaymentCheckService.resendPaymentLink(overdueTransactions[0]);
      setResendResult({
        ...lastRes,
        message: `Successfully regenerated & dispatched payment links for all ${overdueTransactions.length} overdue orders via SMS, Email, and WhatsApp.`
      });
      setIsResendModalOpen(true);
    }, 800);
  };

  // Copy link helper
  const handleCopyLink = (linkText: string) => {
    navigator.clipboard.writeText(linkText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Add test overdue transaction for demo evaluators
  const handleAddTestOverdue = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const testOverdueTx: Transaction = {
      id: `txn-test-overdue-${Date.now()}`,
      bill_no: `A2A-20260223-${randomSuffix}`,
      negotiation_id: `neg-demo-${randomSuffix}`,
      buyer_id: 'usr-buyer-1',
      seller_id: 'usr-seller-1',
      product_id: 'prod-1',
      product_name: '1121 Supreme Aged Basmati Rice (Premium Export Grade)',
      quantity: 100,
      unit_price: 76,
      base_amount: 7600,
      gst_percent: 5.0,
      gst_amount: 380,
      transport_charge: 250,
      total_amount: 8230,
      razorpay_payment_link: `https://rzp.io/i/a2a_bazaar_demo_${randomSuffix}`,
      payment_status: 'pending',
      created_at: new Date(Date.now() - 32 * 3600 * 1000).toISOString(), // 32 hours ago
      audit_trail: [
        {
          id: `act-demo-${Date.now()}`,
          negotiation_id: `neg-demo-${randomSuffix}`,
          action_by: 'system',
          action_type: 'deal_agreed',
          price: 76,
          details: { message: 'Consensus sealed. Payment link generated.', reason: 'Awaiting buyer treasury approval.' },
          timestamp: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
        }
      ],
      invoice_data: {
        bill_no: `A2A-20260223-${randomSuffix}`,
        invoice_date: new Date(Date.now() - 32 * 3600 * 1000).toISOString().split('T')[0],
        seller: {
          name: 'Rajesh Sharma',
          business_name: 'AgriHub Super Grains Pvt Ltd',
          gstin: '07AAACA1234A1Z5',
          phone: '+91 98765 43210',
          address: 'Plot 42, APMC Grain Yard, Karnal, Haryana 132001'
        },
        buyer: {
          name: 'Amitabh Sen',
          business_name: 'Bengal Royal Hotels & Banquets',
          gstin: '19AAECB7788J1ZR',
          phone: '+91 98300 11223',
          address: '14 Park Street, Kolkata, West Bengal 700016'
        },
        item: {
          product_id: 'prod-1',
          name: '1121 Supreme Aged Basmati Rice (Premium Export Grade)',
          hsn_code: '1006.30',
          quantity: 100,
          unit: 'kg',
          unit_price: 76,
          base_amount: 7600,
          gst_percent: 5.0,
          cgst_percent: 2.5,
          cgst_amount: 190,
          sgst_percent: 2.5,
          sgst_amount: 190,
          transport_charge: 250,
          total_amount: 8230
        },
        payment: {
          razorpay_payment_link: `https://rzp.io/i/a2a_bazaar_demo_${randomSuffix}`,
          payment_status: 'pending',
          method: 'Razorpay Autonomous Smart Escrow'
        },
        audit_summary: {
          total_rounds: 2,
          base_price: 85,
          agreed_price: 76,
          discount_secured: 900,
          discount_percent: 10.5,
          settlement_timestamp: new Date(Date.now() - 32 * 3600 * 1000).toISOString()
        }
      }
    };

    if (onUpdateTransaction) {
      onUpdateTransaction(testOverdueTx);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header with Live Background Monitor Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Buyer Procurement Hub</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <span className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                24h Payment Audit Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Bengal Royal Hotels & Banquets • GSTIN: <span className="font-mono text-indigo-900 font-bold">19AAECB7788J1ZR</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAddTestOverdue}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            title="Create a simulated transaction created 32 hours ago with pending status"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Simulate Overdue (&gt;24h)</span>
          </button>

          <button
            onClick={onNavigateToArena}
            className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>Live Agent Arena</span>
          </button>
        </div>
      </div>

      {/* ⚠️ HIGH-PRIORITY ACTION BANNER: Overdue Pending Payments (> 24 Hours) */}
      {overdueTransactions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
                    Action Required: Overdue Pending Payments (&gt;24 hrs)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                    {overdueTransactions.length} {overdueTransactions.length === 1 ? 'DEAL' : 'DEALS'} OVERDUE
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  Autonomous background scanner identified pending payments exceeding the 24-hour settlement window. Dispatch updated Razorpay links to expedite procurement fulfillment.
                </p>
              </div>
            </div>

            {overdueTransactions.length > 1 && (
              <button
                onClick={handleResendAllOverdue}
                disabled={resendingTxId === 'batch_all'}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {resendingTxId === 'batch_all' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Resend All Overdue Links ({overdueTransactions.length})</span>
              </button>
            )}
          </div>

          {/* List of Overdue Transactions Cards inside Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {overdueTransactions.map((tx) => {
              const elapsedHours = PaymentCheckService.getElapsedHours(tx);
              const isResending = resendingTxId === tx.id;

              return (
                <div
                  key={tx.id}
                  className="bg-white/95 rounded-xl border border-amber-300 p-4 shadow-2xs flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{tx.bill_no}</span>
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-extrabold">
                          <Clock className="w-3 h-3 text-amber-700" />
                          {elapsedHours.toFixed(0)}h Overdue
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 mt-1 line-clamp-1">
                        {tx.product_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Qty: {tx.quantity} • Seller: <span className="text-slate-700">{tx.invoice_data?.seller.business_name || 'Verified Supplier'}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-sm text-slate-900 font-mono block">
                        ₹{tx.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {PaymentCheckService.formatTimeElapsed(tx.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar for Overdue Item */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onViewInvoice(tx)}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <ReceiptText className="w-3.5 h-3.5" />
                      <span>View Invoice</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {onPayTransaction && (
                        <button
                          onClick={() => onPayTransaction(tx)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Pay Now</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleResendLink(tx)}
                        disabled={isResending}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isResending ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Resend Payment Link</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Request Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Procurement Engine</span>
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900">What would you like your AI Agent to procure?</h3>
          <p className="text-xs text-slate-600">
            Submit your requirements in natural language or Hinglish. Your AI Buyer Agent will search registered suppliers, enforce landed budget calculations, and autonomously negotiate.
          </p>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Click a standard commercial benchmark prompt:
          </span>
          <div className="flex flex-wrap gap-2">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setQuery(p.prompt);
                  setMaxBudget(p.max_budget);
                  setQuantity(p.quantity);
                  setDeadlineDays(p.deadline_days);
                }}
                className="text-xs bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-xl px-3 py-2 font-medium transition-all text-left active:scale-98 cursor-pointer"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Query Text Area */}
          <div>
            <label className="font-bold text-slate-800 block mb-1 text-sm">
              Procurement Request & Commercial Intent *
            </label>
            <textarea
              rows={3}
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Need 50kg basmati rice under ₹80/kg, deliver within 3 days to Mumbai catering kitchen."
              className="w-full p-4 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-hidden transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Budget & Quantity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div>
              <label className="font-bold text-indigo-950 block mb-1">
                Max Landed Budget per Unit (₹) *
              </label>
              <input
                type="number"
                required
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-indigo-200 rounded-xl bg-white font-mono text-sm font-bold text-indigo-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-indigo-700 mt-1 block font-medium">
                Strict ceiling (includes GST & transport)
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Required Batch Quantity *
              </label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white font-mono text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Units required for purchase order
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Max Delivery Days SLA
              </label>
              <input
                type="number"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Logistics dispatch window
              </span>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <Bot className="w-5 h-5 text-white" />
              <span>Let My AI Agent Find & Negotiate Best Deal</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Live Wholesale Commodities & Smart Price Alerts Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" />
                <span>Price Alert Telemetry</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Autonomous B2B Market Radar
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Wholesale Commodity Catalog & Price Alerts
            </h3>
            <p className="text-xs text-slate-500">
              Set target price triggers on registered commodities. When an autonomous negotiation reaches your price, receive an instant email and browser notification.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenEmailInbox && (
              <button
                type="button"
                onClick={onOpenEmailInbox}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Email Inbox Logs</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Search wholesale commodities, spices, grains, textiles, or suppliers..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'Agricultural Commodities', 'Textiles & Fabrics', 'Industrial Supplies'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Commodities' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products
            .filter((p) => {
              const matchesSearch =
                catalogSearch === '' ||
                p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                p.category.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                (p.seller_business && p.seller_business.toLowerCase().includes(catalogSearch.toLowerCase()));
              const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
              return matchesSearch && matchesCategory;
            })
            .map((prod) => {
              const activeAlert = priceAlerts.find(
                (a) => a.product_id === prod.id && a.status === 'active'
              );
              const triggeredAlert = priceAlerts.find(
                (a) => a.product_id === prod.id && a.status === 'triggered'
              );

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group relative"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category & Alert Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {prod.category}
                      </span>

                      {activeAlert && (
                        <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <Bell className="w-3 h-3 text-purple-600" />
                          <span>≤ ₹{activeAlert.target_price}/{prod.unit}</span>
                        </span>
                      )}

                      {!activeAlert && triggeredAlert && (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Triggered @ ₹{triggeredAlert.triggered_deal_price || triggeredAlert.target_price}</span>
                        </span>
                      )}
                    </div>

                    {/* Product Title & Details */}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors leading-snug">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Supplier Meta */}
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex justify-between">
                        <span>Supplier:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                          {prod.seller_business || 'APMC Registered'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST / ITC:</span>
                        <span className="font-mono font-medium text-slate-700">{prod.gst_percent}% GST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dispatch SLA:</span>
                        <span className="font-medium text-slate-700">{prod.delivery_days} Days Delivery</span>
                      </div>
                    </div>

                    {/* Pricing Strip */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Catalog Rate</span>
                        <div className="text-xl font-black text-slate-900 font-mono">
                          ₹{prod.base_price}
                          <span className="text-xs font-normal text-slate-500">/{prod.unit}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">Available Stock</span>
                        <span className="text-xs font-bold text-slate-700 font-mono">
                          {prod.stock.toLocaleString()} {prod.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions: Set Alert & Negotiate */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenPriceAlertModal && onOpenPriceAlertModal(prod)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeAlert
                          ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300'
                          : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5 text-purple-600" />
                      <span>{activeAlert ? 'Edit Alert' : 'Price Alert'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectProductForProcurement) {
                          onSelectProductForProcurement(prod);
                        } else {
                          setQuery(`Need 50 ${prod.unit} of ${prod.name} under ₹${Math.round(prod.base_price * 0.93)}/${prod.unit}, deliver in ${prod.delivery_days} days.`);
                          setMaxBudget(Math.round(prod.base_price * 0.93));
                          setQuantity(50);
                          setDeadlineDays(prod.delivery_days);
                        }
                      }}
                      className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-98 shadow-2xs"
                      title="Procure with AI Agent"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Procure</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Active Price Alerts Radar Panel */}
        {priceAlerts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  Active Price Alerts & Market Monitoring Radar
                </h4>
              </div>
              <span className="text-xs text-purple-700 font-mono font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {priceAlerts.filter(a => a.status === 'active').length} Active Triggers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {priceAlerts.map((alert) => {
                const isActive = alert.status === 'active';
                const isTriggered = alert.status === 'triggered';
                const savings = Math.max(0, alert.current_base_price - alert.target_price);

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      isTriggered
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isTriggered
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {isTriggered ? 'Triggered & Dispatched' : 'Active Radar'}
                        </span>
                        <h5 className="font-bold text-xs text-slate-900 line-clamp-1 mt-1">
                          {alert.product_name}
                        </h5>
                      </div>

                      {onDeleteAlert && (
                        <button
                          type="button"
                          onClick={() => onDeleteAlert(alert.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Target Price</span>
                        <span className="font-black text-purple-700">
                          ≤ ₹{alert.target_price}/{alert.unit}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-sans block">List Price</span>
                        <span className="text-slate-500 line-through">
                          ₹{alert.current_base_price}/{alert.unit}
                        </span>
                      </div>

                      <div className="text-right pl-2 border-l border-slate-100">
                        <span className="text-[10px] text-slate-400 font-sans block">Savings</span>
                        <span className="font-bold text-emerald-600">
                          -₹{savings}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span className="truncate max-w-[140px] font-mono">{alert.buyer_email}</span>
                      
                      {isActive && onSimulateAlertMatch && (
                        <button
                          type="button"
                          onClick={() => onSimulateAlertMatch(alert.id)}
                          className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>Simulate Match</span>
                        </button>
                      )}

                      {isTriggered && onOpenEmailInbox && (
                        <button
                          type="button"
                          onClick={onOpenEmailInbox}
                          className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          <Mail className="w-3 h-3 text-emerald-600" />
                          <span>View Email</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Historical Requests & Completed Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past Buyer Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Active & Recent Buyer Requests</span>
            </h4>
            <span className="text-xs text-slate-500 font-mono">{requests.length} Requests</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto flex-1">
            {requests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-400 text-[10px]">{req.id}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      req.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'negotiating'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="font-semibold text-slate-900">{req.query}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Quantity: <strong className="text-slate-800">{req.quantity}</strong></span>
                  <span>Max Budget: <strong className="text-blue-700 font-mono">₹{req.max_budget}/unit</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Procurement Orders & Invoices Vault */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Procurement Orders & Settlements</span>
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <span>Scan: {lastCheckTime}</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTxFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  txFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setTxFilter('overdue')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  txFilter === 'overdue' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>&gt;24h Overdue</span>
                {overdueTransactions.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-600 text-white font-bold">
                    {overdueTransactions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTxFilter('pending')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  txFilter === 'pending' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({pendingTransactions.length})
              </button>
              <button
                onClick={() => setTxFilter('paid')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  txFilter === 'paid' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paid ({paidTransactions.length})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto flex-1">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">No transactions found in this filter view.</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isOverdue = PaymentCheckService.isPendingOverdue(tx, 24);
                const isPending = tx.payment_status === 'pending';
                const isPaid = tx.payment_status === 'paid';
                const isResending = resendingTxId === tx.id;

                return (
                  <div key={tx.id} className="p-4 hover:bg-slate-50 transition-colors text-xs space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-slate-900">{tx.bill_no}</span>
                          
                          {isPaid && (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                              PAID (VERIFIED)
                            </span>
                          )}

                          {isPending && isOverdue && (
                            <span className="bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              &gt;24H OVERDUE
                            </span>
                          )}

                          {isPending && !isOverdue && (
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                              PENDING PAYMENT
                            </span>
                          )}
                        </div>

                        <p className="font-medium text-slate-800 mt-1">{tx.product_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Qty: {tx.quantity} • Unit: ₹{tx.unit_price} • {PaymentCheckService.formatTimeElapsed(tx.created_at)}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-slate-900 font-mono text-sm block">
                          ₹{tx.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>

                        <div className="flex items-center justify-end gap-1.5 mt-1.5">
                          <button
                            onClick={() => onViewInvoice(tx)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <ReceiptText className="w-3.5 h-3.5" />
                            <span>Bill</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons bar for pending orders */}
                    {isPending && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 bg-slate-50/80 -mx-4 -mb-4 p-3 px-4 rounded-b-xl">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Status: Awaiting buyer settlement</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {onPayTransaction && (
                            <button
                              onClick={() => onPayTransaction(tx)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Pay Now</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleResendLink(tx)}
                            disabled={isResending}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                              isOverdue
                                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {isResending ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>Resend Payment Link</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Resend Payment Link Confirmation & Dispatch Modal */}
      {isResendModalOpen && resendResult && (
        <div 
          onClick={() => setIsResendModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
          role="dialog"
          aria-modal="true"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 cursor-default my-auto"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Payment Link Dispatched</h3>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Razorpay Smart Escrow Extended
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsResendModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 transition-all cursor-pointer"
                title="Close dialog (Esc)"
                aria-label="Close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fresh Payment Link Successfully Generated!</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {resendResult.message}
                </p>
              </div>

              {/* Payment URL Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Secure Razorpay Payment URL (Valid for 24h)
                </label>
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={resendResult.newLink}
                    className="bg-transparent flex-1 font-mono text-[11px] text-slate-800 outline-hidden select-all"
                  />
                  <button
                    onClick={() => handleCopyLink(resendResult.newLink)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Delivery Receipt / Channels */}
              <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Automated Multi-Channel Dispatch Logs
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-[10px] block text-slate-800">WhatsApp Alert</span>
                      <span className="text-[9px] text-slate-500 font-mono">+91 98300...</span>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold text-[10px] block text-slate-800">Email Invoice</span>
                      <span className="text-[9px] text-slate-500 font-mono">procurement@...</span>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="font-bold text-[10px] block text-slate-800">Audit Trail</span>
                      <span className="text-[9px] text-slate-500 font-mono">Logged</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setIsResendModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>

                {onPayTransaction && resendResult.updatedTransaction && (
                  <button
                    onClick={() => {
                      setIsResendModalOpen(false);
                      onPayTransaction(resendResult.updatedTransaction);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Proceed to Pay (Test Settle)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
