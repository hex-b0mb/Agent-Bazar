import React, { useState, useRef, useEffect } from 'react';
import { Product, BuyerRequest, NegotiationMessage, AgentAction, Transaction } from '../types';
import { 
  Bot, 
  Store, 
  Cpu, 
  CreditCard, 
  CheckCircle2, 
  ReceiptText, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  Sparkles,
  User,
  Send,
  MessageSquare,
  TrendingDown,
  ShieldAlert,
  Sliders,
  Check,
  AlertCircle,
  Lock,
  ShieldCheck,
  KeyRound,
  FileCheck,
  Percent,
  Copy,
  Truck
} from 'lucide-react';
import { AuditTrailViewer } from '../components/AuditTrailViewer';
import { CashDiscountingCard } from '../components/CashDiscountingCard';
import { useAuth } from '../context/AuthContext';

export type AgentPolicyType = 'aggressive' | 'balanced' | 'margin_protector' | 'liquidity_speed';

interface LiveNegotiationProps {
  currentRequest: BuyerRequest | null;
  currentProduct: Product | null;
  messages: NegotiationMessage[];
  actions: AgentAction[];
  isNegotiating: boolean;
  dealStatus: 'idle' | 'ongoing' | 'agreed' | 'failed';
  finalPrice: number | null;
  onStartNegotiation: () => void;
  onOpenPaymentModal: () => void;
  onViewInvoice: (tx: Transaction) => void;
  onOpenEWayBill?: (tx: Transaction) => void;
  latestTransaction: Transaction | null;
  currentRound: number;
  negotiationMode: 'human_to_ai' | 'agent_to_agent';
  onSetNegotiationMode: (mode: 'human_to_ai' | 'agent_to_agent') => void;
  onHumanOffer: (offerPrice: number, messageText: string) => void;
  onResetNegotiation: () => void;
}

export const LiveNegotiation: React.FC<LiveNegotiationProps> = ({
  currentRequest,
  currentProduct,
  messages,
  actions,
  isNegotiating,
  dealStatus,
  finalPrice,
  onStartNegotiation,
  onOpenPaymentModal,
  onViewInvoice,
  onOpenEWayBill,
  latestTransaction,
  currentRound,
  negotiationMode,
  onSetNegotiationMode,
  onHumanOffer,
  onResetNegotiation,
}) => {
  const { user, requireAuth, isAuthenticated } = useAuth();
  const [agentPolicy, setAgentPolicy] = useState<AgentPolicyType>('balanced');
  const [copiedHash, setCopiedHash] = useState(false);

  const gstRate = currentProduct?.gst_percent ?? 5;
  const basePrice = currentProduct?.base_price ?? 75;
  const minPrice = currentProduct?.min_price ?? 70;
  const unitPrice = finalPrice ?? (messages.length > 0 ? messages[messages.length - 1].price : basePrice);
  const quantity = currentRequest?.quantity ?? 100;
  const totalBase = (latestTransaction?.final_price ?? unitPrice) * quantity;
  const gstAmount = latestTransaction?.gst_amount ?? (totalBase * gstRate) / 100;
  const transportCharge = latestTransaction?.transport_charge ?? currentProduct?.transport_charge ?? 200;
  const grandTotal = latestTransaction?.total_amount ?? (totalBase + gstAmount + transportCharge);

  // Simulated Cryptographic Consensus Hash
  const consensusHash = `0x8f2a9c3d4e7b1a0f96812e9bca4023dd88e1${(unitPrice * quantity).toString(16)}`;

  // Interactive Human Offer state
  const [customPrice, setCustomPrice] = useState<number>(Math.round(basePrice * 0.94));
  const [customText, setCustomText] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom smoothly when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isNegotiating]);

  // Quick Hinglish Bargaining Prompts
  const quickHinglishPrompts = [
    { text: `Bhaiya ₹${Math.max(minPrice, Math.round(basePrice * 0.92))} me do, abhi 100kg cash/UPI pe confirm karta hu`, price: Math.max(minPrice, Math.round(basePrice * 0.92)) },
    { text: `Bulk ${quantity} ${currentProduct?.unit || 'units'} lena hai, ₹${Math.max(minPrice, Math.round(basePrice * 0.95))} final rate done karo`, price: Math.max(minPrice, Math.round(basePrice * 0.95)) },
    { text: `Agar ${currentProduct?.delivery_days || 2} din me delivery doge toh ₹${Math.round(basePrice * 0.96)} chalega`, price: Math.round(basePrice * 0.96) },
    { text: `Let's meet midway at ₹${Math.round((basePrice + minPrice) / 2)} per ${currentProduct?.unit || 'kg'} and seal the deal`, price: Math.round((basePrice + minPrice) / 2) },
  ];

  const handleSendHumanOffer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    requireAuth(() => {
      const priceToSubmit = customPrice > 0 ? customPrice : Math.round(basePrice * 0.94);
      const messageToSubmit = customText.trim() 
        ? customText.trim() 
        : `I propose a purchase price of ₹${priceToSubmit}/${currentProduct?.unit || 'unit'} with immediate payment clearance.`;
      
      onHumanOffer(priceToSubmit, messageToSubmit);
      setCustomText('');
    });
  };

  const handleProtectedStartNegotiation = () => {
    requireAuth(() => {
      onStartNegotiation();
    });
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(consensusHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleSelectQuickPrompt = (prompt: { text: string; price: number }) => {
    setCustomPrice(prompt.price);
    setCustomText(prompt.text);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Context & Mode Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-md ${
            negotiationMode === 'human_to_ai' ? 'bg-indigo-600' : 'bg-slate-800'
          }`}>
            {negotiationMode === 'human_to_ai' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {currentProduct?.name || 'Commercial Procurement'}
              </h2>
              {isNegotiating && (
                <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Round {currentRound}/5 Active
                </span>
              )}
              {dealStatus === 'agreed' && (
                <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Consensus Reached
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {negotiationMode === 'human_to_ai' 
                ? 'Human vs. Seller AI — You haggle directly with the AI Merchant in Hinglish or English' 
                : 'Autonomous AI vs. AI — Buyer & Seller AI agents negotiate on autopilot'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Toggle */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              onSetNegotiationMode('human_to_ai');
              onResetNegotiation();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              negotiationMode === 'human_to_ai'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>👤 Human ↔ 🤖 Seller AI</span>
          </button>

          <button
            onClick={() => {
              onSetNegotiationMode('agent_to_agent');
              onResetNegotiation();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              negotiationMode === 'agent_to_agent'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>🤖 AI ↔ 🤖 AI Autopilot</span>
          </button>
        </div>
      </div>

      {/* Agent Strategy & Policy Tuner Bar (When in AI-to-AI Mode) */}
      {negotiationMode === 'agent_to_agent' && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Buyer Agent Strategy Policy</span>
                <span className="text-[10px] bg-indigo-900/80 px-2 py-0.2 rounded-full border border-indigo-400/40 text-amber-300 font-mono">
                  Autonomous Tuning
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Adjust how hard the Buyer Agent bargains on price versus SLA and repeat trade terms.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setAgentPolicy('aggressive')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                agentPolicy === 'aggressive'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Aggressive Volume Discounter - Pushes for minimum floor price"
            >
              🔥 Aggressive
            </button>
            <button
              onClick={() => setAgentPolicy('balanced')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                agentPolicy === 'balanced'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Balanced Pareto - Fair win-win margin equilibrium"
            >
              ⚖️ Balanced
            </button>
            <button
              onClick={() => setAgentPolicy('margin_protector')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                agentPolicy === 'margin_protector'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Firm Margin Protector - Strict floor price defense"
            >
              🛡️ Margin Guard
            </button>
            <button
              onClick={() => setAgentPolicy('liquidity_speed')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                agentPolicy === 'liquidity_speed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Liquidity Speed Demon - Instant settlement discount"
            >
              ⚡ Instant Pay
            </button>
          </div>
        </div>
      )}

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Audit Trail (3 cols) */}
        <div className="lg:col-span-3">
          <AuditTrailViewer actions={actions} title="Pricing & Margin Audit" maxHeight="max-h-[640px]" />
        </div>

        {/* Center Column: Live Negotiation Experience & Chat (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[620px]">
            {/* Card Sub-Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <div className="flex gap-3 items-center">
                <div className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold font-mono">
                  #NX-B2B
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-xs">
                    {currentProduct?.name} ({quantity} {currentProduct?.unit})
                  </h3>
                  <span className="text-[10px] text-slate-500 block">
                    Listed Catalog Base: <strong className="text-slate-700">₹{basePrice}/{currentProduct?.unit}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium italic">
                  Round {currentRound}/5
                </span>
                <button
                  onClick={onResetNegotiation}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Stream Messages */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[400px] bg-white">
              {messages.length === 0 && !isNegotiating && (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
                    {negotiationMode === 'human_to_ai' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">
                    {negotiationMode === 'human_to_ai' ? 'Bargaining Arena Ready' : 'Autonomous AI Arena Ready'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {negotiationMode === 'human_to_ai'
                      ? 'Type your counter-offer below or choose a quick Hinglish bargaining chip to negotiate directly with the Seller AI!'
                      : 'Click "Launch Autonomous Haggling" to let both AI agents negotiate at 240ms latency.'}
                  </p>
                  {negotiationMode === 'agent_to_agent' && (
                    <button
                      onClick={handleProtectedStartNegotiation}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
                    >
                      Launch Autonomous Haggling
                    </button>
                  )}
                </div>
              )}

              {messages.map((msg, index) => {
                const isBuyer = msg.sender === 'buyer_agent';
                const isAgreed = msg.action === 'accept' || (dealStatus === 'agreed' && index === messages.length - 1);

                if (isBuyer) {
                  return (
                    <div key={msg.id || index} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-1 duration-200">
                      <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 shadow-md border-2 border-white text-white text-xs font-bold">
                        {negotiationMode === 'human_to_ai' ? 'YOU' : 'BA'}
                      </div>
                      <div className={`p-3.5 rounded-2xl rounded-tl-none border max-w-[85%] ${
                        msg.action === 'accept' 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-indigo-50 border-indigo-100'
                      }`}>
                        <div className="text-[10px] font-bold text-indigo-700 mb-1 flex items-center justify-between">
                          <span>{negotiationMode === 'human_to_ai' ? 'You (Buyer)' : 'Buyer AI Agent'}</span>
                          <span className="text-slate-400 font-mono">Round {msg.round}</span>
                        </div>
                        <p className={`text-xs sm:text-sm leading-relaxed ${
                          msg.action === 'accept' ? 'text-emerald-900 font-medium' : 'text-indigo-950'
                        }`}>
                          "{msg.message}"
                        </p>
                        <div className={`mt-2 text-[10px] font-bold uppercase tracking-tighter flex items-center justify-between ${
                          msg.action === 'accept' ? 'text-emerald-600 font-mono' : 'text-indigo-500'
                        }`}>
                          <span>Action: {msg.action.toUpperCase()}</span>
                          <span>• Proposed: ₹{msg.price}/{currentProduct?.unit || 'unit'}</span>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={msg.id || index} className="flex gap-3 justify-end items-start animate-in fade-in slide-in-from-bottom-1 duration-200">
                      <div className={`p-3.5 rounded-2xl rounded-tr-none border max-w-[85%] text-left ${
                        msg.action === 'accept' 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="text-[10px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                          <span>Seller AI Agent ({currentProduct?.seller_business || 'Merchant'})</span>
                          <span className="text-slate-400 font-mono">Round {msg.round}</span>
                        </div>
                        <p className={`text-xs sm:text-sm leading-relaxed ${
                          msg.action === 'accept' ? 'text-emerald-900 font-medium' : 'text-slate-800'
                        }`}>
                          "{msg.message}"
                        </p>
                        <div className={`mt-2 text-[10px] font-bold uppercase tracking-tighter flex items-center justify-between ${
                          msg.action === 'accept' ? 'text-emerald-600 font-mono' : 'text-slate-500'
                        }`}>
                          <span>Action: {msg.action.toUpperCase()}</span>
                          <span>• Counter: ₹{msg.price}/{currentProduct?.unit || 'unit'}</span>
                        </div>
                      </div>
                      <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center shrink-0 shadow-md border-2 border-white text-white text-xs font-bold">
                        SA
                      </div>
                    </div>
                  );
                }
              })}

              {/* Live Calculating Pulse */}
              {isNegotiating && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs w-fit animate-pulse">
                  <Cpu className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span>Seller AI evaluating margin floor & landed cost impact...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ========================================================================= */}
            {/* HUMAN-TO-AI INTERACTIVE BARGAINING INPUT CONSOLE */}
            {/* ========================================================================= */}
            {negotiationMode === 'human_to_ai' && dealStatus !== 'agreed' && (
              <div className="p-4 bg-slate-50/90 border-t border-slate-200 space-y-3">
                {/* Quick Hinglish Prompt Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                    Quick Chips:
                  </span>
                  {quickHinglishPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuickPrompt(p)}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] text-slate-700 whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-2xs"
                    >
                      {p.text.length > 35 ? p.text.slice(0, 35) + '...' : p.text}
                    </button>
                  ))}
                </div>

                {/* Price Selector & Custom Offer Bar */}
                <form onSubmit={handleSendHumanOffer} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {/* Price Slider / Numeric Input */}
                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shrink-0 shadow-2xs">
                      <span className="text-xs font-bold text-slate-500">Your Offer: ₹</span>
                      <input
                        type="number"
                        min="1"
                        max="99999"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        className="w-16 font-mono font-bold text-indigo-700 text-sm focus:outline-none"
                      />
                      <span className="text-[11px] text-slate-400">/{currentProduct?.unit || 'unit'}</span>
                    </div>

                    {/* Text input for custom message / Hinglish query */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Type counter-offer in Hinglish or English (e.g., '₹72 me do, abhi order karta hu')..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-indigo-500 shadow-2xs"
                      />
                    </div>

                    {/* Submit Offer Button */}
                    <button
                      type="submit"
                      disabled={isNegotiating}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                    >
                      <span>Counter AI</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Bottom Settlement Metrics & Action Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 sm:gap-6">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold tracking-tight">Active Rate</div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                    ₹{unitPrice.toLocaleString('en-IN')}/{currentProduct?.unit || 'unit'}
                  </div>
                </div>
                <div className="w-px h-7 bg-slate-300"></div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold tracking-tight">GST ({gstRate}%)</div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                    ₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="w-px h-7 bg-slate-300"></div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold tracking-tight">Grand Total</div>
                  <div className="text-lg sm:text-xl font-black text-indigo-600 font-mono">
                    ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              {dealStatus === 'agreed' && latestTransaction?.payment_status === 'pending' ? (
                <button 
                  onClick={onOpenPaymentModal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay with Razorpay (₹{latestTransaction.total_amount.toLocaleString('en-IN')})</span>
                </button>
              ) : dealStatus === 'agreed' && latestTransaction?.payment_status === 'paid' ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => latestTransaction && onViewInvoice(latestTransaction)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ReceiptText className="w-4 h-4" />
                    <span>View Tax Invoice</span>
                  </button>

                  {onOpenEWayBill && (
                    <button
                      onClick={() => latestTransaction && onOpenEWayBill(latestTransaction)}
                      className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 px-4 py-2 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-amber-400" />
                      <span>e-Way Bill QR</span>
                    </button>
                  )}
                </div>
              ) : negotiationMode === 'agent_to_agent' ? (
                <button 
                  onClick={handleProtectedStartNegotiation}
                  disabled={isNegotiating}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isNegotiating ? 'Negotiating...' : 'Run Auto Negotiation'}</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Dynamic Early-Payment Cash Discounting Widget (2/10 Net 30) */}
          {dealStatus === 'agreed' && (
            <CashDiscountingCard
              product={currentProduct}
              baseAgreedPrice={unitPrice}
              quantity={quantity}
              gstRate={gstRate}
              transportCharge={transportCharge}
            />
          )}
        </div>

        {/* Right Column: Stats, Crypto Consensus Proof & Smart Escrow (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Cryptographic Machine Handshake Box when Deal is Agreed */}
          {dealStatus === 'agreed' && (
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-emerald-500/50 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Consensus Handshake</span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Consensus Rate:</span>
                  <span className="font-bold text-emerald-300 font-mono">₹{unitPrice}/{currentProduct?.unit}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Total Settlement:</span>
                  <span className="font-bold text-slate-100 font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Working Capital Term:</span>
                  <span className="font-bold text-amber-300 font-mono">2% 24hr Quick Pay</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>SHA-256 Contract Digest:</span>
                  <button
                    onClick={handleCopyHash}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-[10px] text-emerald-400 truncate break-all">
                  {consensusHash}
                </div>
              </div>
            </div>
          )}

          {/* B2B Counterparty Credit Score & Trust Index */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Counterparty Credit & Trust Score</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
                AAA PRIME
              </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 text-white flex flex-col items-center justify-center font-bold shadow-xs shrink-0">
                <span className="text-base font-black leading-none">94</span>
                <span className="text-[8px] font-mono opacity-80">/100</span>
              </div>
              <div className="min-w-0 text-xs">
                <p className="font-bold text-slate-900 truncate">AgriHub Verified Node</p>
                <p className="text-[10px] text-slate-500">48 Trades • 0 Disputes • Instant Mandate</p>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between py-0.5">
                <span>On-Time e-PoD Acceptance</span>
                <span className="font-bold text-emerald-700 font-mono">99.4%</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>GST Tax Compliance Index</span>
                <span className="font-bold text-indigo-700 font-mono">100% GSTR-1 Verified</span>
              </div>
            </div>
          </div>

          {/* Real-time B2B Guardrails Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Seller AI Margin Guardrails</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Catalog Base Price</span>
                <span className="font-bold text-slate-800">₹{basePrice}/{currentProduct?.unit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Confidential Floor</span>
                <span className="font-bold text-indigo-700 font-mono">₹{minPrice}/{currentProduct?.unit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>GST Tax Bracket</span>
                <span className="font-bold text-slate-800">{gstRate}% HSN Tax</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Max Round SLA</span>
                <span className="font-bold text-emerald-700">5 Rounds</span>
              </div>
            </div>
          </div>

          {/* Autonomous Smart Milestone Escrow Execution */}
          <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-800/80 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <CreditCard className="w-4 h-4" />
                <span>Smart Milestone Escrow</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                RBI Compliant
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-[11px] text-slate-300">Advance Escrow Hold (20%)</span>
                <span className="font-mono font-bold text-amber-300">₹{(grandTotal * 0.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-[11px] text-slate-300">Post-Delivery Release (80%)</span>
                <span className="font-mono font-bold text-emerald-300">₹{(grandTotal * 0.8).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-indigo-900/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Settlement SLA</span>
              <span className="text-emerald-400 font-semibold font-mono">T+0 Instant Disbursal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
