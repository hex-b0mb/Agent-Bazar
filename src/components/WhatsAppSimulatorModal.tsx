import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Check, 
  CheckCheck, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  CreditCard, 
  Bot, 
  Sparkles,
  Phone,
  Video,
  MoreVertical,
  Download,
  IndianRupee,
  Lock,
  Truck,
  MapPin,
  RefreshCw,
  Building2,
  Copy,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Navigation
} from 'lucide-react';
import { Transaction, Product } from '../types';

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  onOpenInvoice?: (tx: Transaction) => void;
  onOpenPayment?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'system' | 'user' | 'agent' | 'transporter' | 'supplier';
  senderName?: string;
  type: 'text' | 'deal_card' | 'invoice_card' | 'otp_card' | 'fastag_ping' | 'quick_action_response';
  text?: string;
  time: string;
  dealData?: {
    billNo: string;
    product: string;
    amount: number;
    escrowAdvance: number;
    escrowBalance: number;
    gstinBuyer: string;
    gstinSeller: string;
  };
  fastagData?: {
    tollPlaza: string;
    vehicleNo: string;
    distanceRemaining: string;
    eta: string;
  };
}

export const WhatsAppSimulatorModal: React.FC<WhatsAppSimulatorModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onOpenInvoice,
  onOpenPayment,
}) => {
  const [activeChannel, setActiveChannel] = useState<'buyer' | 'seller' | 'transporter'>('buyer');
  const [outgoingText, setOutgoingText] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const billNo = transaction?.bill_no || 'A2A-20260225-1042';
  const productName = transaction?.product_name || '1121 Supreme Aged Basmati Rice (Grade-A)';
  const totalAmount = transaction?.total_amount || 76150;
  const buyerBiz = transaction?.invoice_data?.buyer.business_name || 'Bengal Royal Hotels Ltd';
  const sellerBiz = transaction?.invoice_data?.seller.business_name || 'AgriHub Super Grains Pvt Ltd';
  const isPaid = transaction?.payment_status === 'paid';

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize customized conversation tailored to the channel
  useEffect(() => {
    if (!isOpen) return;

    const initialMessages: ChatMessage[] = [
      {
        id: 'sys-enc',
        sender: 'system',
        type: 'text',
        text: '🔒 Messages and calls are end-to-end encrypted with Agent Bazar Autonomous Consensus Key (SHA-256).',
        time: '12:40 PM'
      },
      {
        id: 'msg-deal',
        sender: 'agent',
        senderName: 'Agent Bazar Meta Bot',
        type: 'deal_card',
        time: '12:41 PM',
        dealData: {
          billNo: billNo,
          product: productName,
          amount: totalAmount,
          escrowAdvance: Math.round(totalAmount * 0.20),
          escrowBalance: Math.round(totalAmount * 0.80),
          gstinBuyer: '19AAACB4412M1Z5',
          gstinSeller: '07AABCU9603R1ZM'
        }
      },
      {
        id: 'msg-dispatch-1',
        sender: 'supplier',
        senderName: 'Suresh Verma (Godown Incharge)',
        type: 'text',
        time: '12:42 PM',
        text: 'Namaste sir, 20 MT Basmati Rice dispatch ho chuka hai Delhi godown se. Electronic weighbridge slip aur e-Way bill generate ho gaya hai.'
      },
      {
        id: 'msg-fastag',
        sender: 'transporter',
        senderName: 'Delhivery Fastag Fleet #HR-55-AJ-9021',
        type: 'fastag_ping',
        time: '12:43 PM',
        fastagData: {
          tollPlaza: 'Panipat Plaza (NH-44)',
          vehicleNo: 'HR-55-AJ-9021 (Containerized Trailer)',
          distanceRemaining: '46 km',
          eta: '1 hr 15 mins'
        }
      },
      {
        id: 'msg-otp',
        sender: 'agent',
        senderName: 'Agent Bazar Meta Bot',
        type: 'otp_card',
        time: '12:44 PM'
      }
    ];

    setMessages(initialMessages);
  }, [isOpen, billNo, productName, totalAmount]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!outgoingText.trim()) return;

    const userText = outgoingText.trim();
    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      type: 'text',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setOutgoingText('');
    setIsTyping(true);

    // Context-aware AI Agent reply generator
    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';
      const lower = userText.toLowerCase();

      if (lower.includes('status') || lower.includes('track') || lower.includes('location')) {
        replyText = `🚚 Consignment for Bill #${billNo} is in transit on NH-44. Vehicle HR-55-AJ-9021 passed Panipat Toll Plaza at 12:43 PM. ETA is 1 hr 15 mins.`;
      } else if (lower.includes('invoice') || lower.includes('bill') || lower.includes('gst')) {
        replyText = `📄 Official Section 31 CGST Tax Invoice for ₹${totalAmount.toLocaleString('en-IN')} has been generated. Both Buyer (19AAACB4412M1Z5) and Seller (07AABCU9603R1ZM) GSTINs are verified.`;
      } else if (lower.includes('escrow') || lower.includes('payment') || lower.includes('pay')) {
        replyText = `🛡️ Smart Escrow Status: 20% advance (₹${Math.round(totalAmount * 0.2).toLocaleString('en-IN')}) is locked in Razorpay Escrow Vault. 80% balance (₹${Math.round(totalAmount * 0.8).toLocaleString('en-IN')}) will release automatically upon Gate OTP verification.`;
      } else if (lower.includes('counter') || lower.includes('offer') || lower.includes('price') || lower.includes('discount')) {
        replyText = `🤝 AI Market Maker: Your counter-proposal has been transmitted to Supplier AI. Based on wholesale order volume of 20 MT, seller agent is willing to settle at ₹${(totalAmount * 0.96).toFixed(0)} with 100% Escrow guarantee.`;
      } else {
        replyText = `🤖 Agent Bazar Assistant: Received your query "${userText}". All statutory checks (6/6 KYC, Fastag EWB, and Section 65B smart contract) are active on the autonomous ledger.`;
      }

      const replyMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        senderName: 'Agent Bazar Meta Bot',
        type: 'text',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 750);
  };

  const handleQuickAction = (actionType: string, promptText: string) => {
    setOutgoingText(promptText);
    setTimeout(() => {
      const formEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSendMessage(formEvent);
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0b141a] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col h-[700px] max-h-[92vh] cursor-default relative text-slate-100 font-sans"
      >
        {/* WhatsApp Top Header Bar */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between text-white border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#202c33] rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-100">Agent Bazar Commerce</h3>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                  Official Business
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Meta Cloud API • Autonomous B2B Node</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-Party Channel Switcher */}
        <div className="bg-[#111b21] px-4 py-2 flex items-center justify-between border-b border-slate-800 text-xs shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Perspective:</span>
            <button
              onClick={() => setActiveChannel('buyer')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer font-bold text-[11px] flex items-center gap-1 ${
                activeChannel === 'buyer' ? 'bg-[#00a884] text-white shadow-xs' : 'text-slate-400 hover:bg-[#202c33]'
              }`}
            >
              <span>🛒 Buyer (Procurement)</span>
            </button>
            <button
              onClick={() => setActiveChannel('seller')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer font-bold text-[11px] flex items-center gap-1 ${
                activeChannel === 'seller' ? 'bg-[#00a884] text-white shadow-xs' : 'text-slate-400 hover:bg-[#202c33]'
              }`}
            >
              <span>🏬 Mandi Supplier</span>
            </button>
            <button
              onClick={() => setActiveChannel('transporter')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer font-bold text-[11px] flex items-center gap-1 ${
                activeChannel === 'transporter' ? 'bg-[#00a884] text-white shadow-xs' : 'text-slate-400 hover:bg-[#202c33]'
              }`}
            >
              <span>🚛 Fastag Logistics</span>
            </button>
          </div>
        </div>

        {/* Quick Trader Action Chips */}
        <div className="bg-[#182229] px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-800 text-[11px]">
          <button
            onClick={() => handleQuickAction('track', 'Where is my consignment right now? Send Fastag live status.')}
            className="px-2.5 py-1 bg-[#202c33] hover:bg-[#2a3942] text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer transition-colors active:scale-95"
          >
            <Truck className="w-3 h-3 text-sky-400" />
            <span>Track Fastag GPS</span>
          </button>
          <button
            onClick={() => handleQuickAction('counter', 'Counter-offer ₹52,000/MT with 15-day Escrow milestone.')}
            className="px-2.5 py-1 bg-[#202c33] hover:bg-[#2a3942] text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer transition-colors active:scale-95"
          >
            <TrendingDown className="w-3 h-3 text-emerald-400" />
            <span>Counter-Offer ₹52k</span>
          </button>
          <button
            onClick={() => handleQuickAction('escrow', 'Explain 20% Advance / 80% PoD Escrow milestone breakdown.')}
            className="px-2.5 py-1 bg-[#202c33] hover:bg-[#2a3942] text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer transition-colors active:scale-95"
          >
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>Escrow Breakdown</span>
          </button>
          <button
            onClick={() => handleQuickAction('invoice', 'Provide GST Tax Invoice and E-Way Bill download details.')}
            className="px-2.5 py-1 bg-[#202c33] hover:bg-[#2a3942] text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer transition-colors active:scale-95"
          >
            <FileText className="w-3 h-3 text-indigo-400" />
            <span>GST Tax Invoice</span>
          </button>
        </div>

        {/* WhatsApp Chat Wallpaper & Scrollable Feed */}
        <div 
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#0b141a] bg-opacity-95"
        >
          {messages.map((m) => {
            if (m.type === 'deal_card' && m.dealData) {
              return (
                <div key={m.id} className="bg-[#202c33] text-slate-100 rounded-2xl p-3.5 max-w-[94%] border border-slate-700 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>B2B Autonomous Contract Executed</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{m.dealData.billNo}</span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    AI Procurement Node has matched trade parameters with <strong>{sellerBiz}</strong>:
                  </p>

                  <div className="bg-[#111b21] p-3 rounded-xl my-2 border border-slate-800 text-xs space-y-1.5 font-mono">
                    <div className="text-emerald-300 font-bold text-sm">{m.dealData.product}</div>
                    <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
                      <span>Total Agreed GMV:</span>
                      <span className="font-bold text-white">₹{m.dealData.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-amber-300">
                      <span>🔒 Advance Escrow (20%):</span>
                      <span className="font-bold">₹{m.dealData.escrowAdvance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-sky-300">
                      <span>🚚 PoD Balance (80%):</span>
                      <span className="font-bold">₹{m.dealData.escrowBalance.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => {
                        if (transaction && onOpenInvoice) onOpenInvoice(transaction);
                      }}
                      className="w-full py-2 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View GST Tax PDF</span>
                    </button>

                    {!isPaid ? (
                      <button
                        onClick={() => {
                          if (onOpenPayment) onOpenPayment();
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Authorize Escrow</span>
                      </button>
                    ) : (
                      <div className="py-2 bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Escrow Funded</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end items-center gap-1 text-[10px] text-slate-400 mt-2">
                    <span>{m.time}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              );
            }

            if (m.type === 'fastag_ping' && m.fastagData) {
              return (
                <div key={m.id} className="bg-[#202c33] text-slate-100 rounded-2xl p-3.5 max-w-[90%] border border-slate-700 shadow-md">
                  <div className="flex items-center justify-between text-xs font-bold text-sky-400 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Fastag RFID Geofence Ping</span>
                    </div>
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">
                      LIVE
                    </span>
                  </div>

                  <div className="bg-[#111b21] p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="font-bold">{m.fastagData.tollPlaza}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Truck: {m.fastagData.vehicleNo}</div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-sky-300">
                      <span>Distance: {m.fastagData.distanceRemaining}</span>
                      <span className="font-bold text-white">ETA: {m.fastagData.eta}</span>
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-1 text-[10px] text-slate-400 mt-2">
                    <span>{m.time}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              );
            }

            if (m.type === 'otp_card') {
              return (
                <div key={m.id} className="bg-[#202c33] text-slate-100 rounded-2xl p-3.5 max-w-[90%] border border-slate-700 shadow-md">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1">
                    <span>🔐 Delivery Inspection & Gate OTP</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Share this OTP with the unloading supervisor at weighbridge to release the remaining 80% escrow:
                  </p>
                  
                  <div className="bg-[#111b21] p-2.5 rounded-xl my-2 text-center border border-slate-800 flex items-center justify-between px-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gate Delivery OTP</span>
                      <span className="font-mono text-2xl font-black tracking-widest text-emerald-400">849201</span>
                    </div>
                    <button
                      onClick={() => handleCopy('849201', 'otp')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedText === 'otp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedText === 'otp' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex justify-end items-center gap-1 text-[10px] text-slate-400 mt-1">
                    <span>{m.time}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              );
            }

            if (m.sender === 'system') {
              return (
                <div key={m.id} className="bg-[#182229] border border-amber-500/20 text-amber-300 text-[11px] p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-2xs">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{m.text}</span>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`rounded-2xl p-3 max-w-[85%] text-xs shadow-md ${
                  m.sender === 'user'
                    ? 'ml-auto bg-[#005c4b] text-white'
                    : 'bg-[#202c33] text-slate-200 border border-slate-700'
                }`}
              >
                {m.senderName && m.sender !== 'user' && (
                  <div className="text-[10px] font-bold text-emerald-400 mb-0.5">{m.senderName}</div>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                <div className="flex justify-end items-center gap-1 text-[10px] text-slate-400 mt-1">
                  <span>{m.time}</span>
                  {m.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="bg-[#202c33] text-slate-400 rounded-2xl px-4 py-2.5 max-w-[120px] text-xs flex items-center gap-1.5 border border-slate-700 animate-pulse">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
        </div>

        {/* Interactive Chat Input Form */}
        <form onSubmit={handleSendMessage} className="bg-[#202c33] p-3 flex items-center gap-2 border-t border-slate-700 shrink-0">
          <input
            type="text"
            value={outgoingText}
            onChange={(e) => setOutgoingText(e.target.value)}
            placeholder="Ask agent: counter ₹50k, track truck, download GST invoice..."
            className="flex-1 bg-[#2a3942] text-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-hidden focus:border-[#00a884] placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!outgoingText.trim()}
            className="p-2.5 bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
