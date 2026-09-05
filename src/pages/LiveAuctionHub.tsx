import React, { useState, useEffect, useRef } from 'react';
import { 
  Gavel, 
  Flame, 
  Clock, 
  Trophy, 
  Users, 
  Bot, 
  ShieldCheck, 
  Zap, 
  Plus, 
  ArrowUpRight, 
  Sparkles, 
  IndianRupee, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Scale,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { LiveAuction, LiveAuctionBid, Product, MultiVendorRFQ, VendorQuote } from '../types';
import { SEED_AUCTIONS, SEED_PRODUCTS, SEED_RFQS } from '../data/seedData';
import { RazorpayModal } from '../components/RazorpayModal';
import { InvoiceModal } from '../components/InvoiceModal';
import { MultiSupplierAuctionMatrix } from '../components/MultiSupplierAuctionMatrix';
import confetti from 'canvas-confetti';

interface LiveAuctionHubProps {
  onViewInvoice?: (billNo: string) => void;
}

export const LiveAuctionHub: React.FC<LiveAuctionHubProps> = ({ onViewInvoice }) => {
  const [activeSubTab, setActiveSubTab] = useState<'forward-auction' | 'multi-vendor-rfq'>('forward-auction');
  const [auctions, setAuctions] = useState<LiveAuction[]>(SEED_AUCTIONS);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>(SEED_AUCTIONS[0].id);
  const [customBidAmount, setCustomBidAmount] = useState<number>(80);
  const [isCreatingAuction, setIsCreatingAuction] = useState(false);
  const [autoAgentActive, setAutoAgentActive] = useState(true);

  // New Auction Form
  const [newProduct, setNewProduct] = useState(SEED_PRODUCTS[1].id);
  const [newQuantity, setNewQuantity] = useState(200);
  const [newStartingPrice, setNewStartingPrice] = useState(38);
  const [newReservePrice, setNewReservePrice] = useState(41);
  const [newDuration, setNewDuration] = useState(60);

  // Settlement & Invoicing Modals
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [settledAuction, setSettledAuction] = useState<LiveAuction | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [activeBillNo, setActiveBillNo] = useState<string>('BILL-AUC-991');

  // RFQ State
  const [rfqs, setRfqs] = useState<MultiVendorRFQ[]>(SEED_RFQS);
  const [selectedRfqId, setSelectedRfqId] = useState<string>(SEED_RFQS[0].id);
  const [isSimulatingRFQ, setIsSimulatingRFQ] = useState(false);

  const selectedAuction = auctions.find((a) => a.id === selectedAuctionId) || auctions[0];
  const selectedRfq = rfqs.find((r) => r.id === selectedRfqId) || rfqs[0];

  // Active Countdown Timer for the selected live auction
  useEffect(() => {
    const timer = setInterval(() => {
      setAuctions((prevAuctions) =>
        prevAuctions.map((auc) => {
          if (auc.status === 'live' && auc.ends_at_seconds > 0) {
            const nextSec = auc.ends_at_seconds - 1;
            if (nextSec === 0) {
              return {
                ...auc,
                ends_at_seconds: 0,
                status: 'ended',
              };
            }
            return {
              ...auc,
              ends_at_seconds: nextSec,
            };
          }
          return auc;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Autonomous Agent Bidding Simulation Loop
  useEffect(() => {
    if (!autoAgentActive || selectedAuction.status !== 'live' || selectedAuction.ends_at_seconds <= 3) {
      return;
    }

    const agentBidTimeout = setTimeout(() => {
      // 40% chance of competitor agent counter-bid
      const competitors = [
        { name: 'Sundaram Gourmet AI Agent', id: 'usr-buyer-2', maxBudget: 84 },
        { name: 'ITC Grand Supermarkets Bot', id: 'usr-buyer-6', maxBudget: 86 },
        { name: 'Bengal Royal Banquets AI', id: 'usr-buyer-1', maxBudget: 88 },
        { name: 'Metro Cash & Carry B2B Agent', id: 'usr-buyer-3', maxBudget: 85 },
      ];

      const chosenAgent = competitors[Math.floor(Math.random() * competitors.length)];
      const nextBid = selectedAuction.current_highest_bid + (Math.random() > 0.5 ? 1 : 2);

      if (nextBid <= chosenAgent.maxBudget && nextBid > selectedAuction.current_highest_bid) {
        const newBid: LiveAuctionBid = {
          id: `bid-${Date.now()}`,
          bidder_id: chosenAgent.id,
          bidder_name: chosenAgent.name,
          bidder_type: 'buyer_agent',
          bid_amount: nextBid,
          total_bid_value: nextBid * selectedAuction.quantity,
          timestamp: new Date().toLocaleTimeString('en-IN'),
          strategy_reason: `Autonomous margin calculation: outbidding to secure ${selectedAuction.quantity}${selectedAuction.unit} lot.`,
          is_winning: true,
        };

        setAuctions((prev) =>
          prev.map((auc) => {
            if (auc.id === selectedAuction.id) {
              return {
                ...auc,
                current_highest_bid: nextBid,
                current_winning_bidder_id: chosenAgent.id,
                current_winning_bidder_name: chosenAgent.name,
                current_winning_bidder_type: 'buyer_agent',
                total_bids_count: auc.total_bids_count + 1,
                bids: [newBid, ...auc.bids.map((b) => ({ ...b, is_winning: false }))],
              };
            }
            return auc;
          })
        );
      }
    }, 4500);

    return () => clearTimeout(agentBidTimeout);
  }, [selectedAuction.current_highest_bid, selectedAuction.ends_at_seconds, autoAgentActive]);

  // Place Manual / Human Bid
  const handlePlaceBid = (increment = 1) => {
    const bidValue = selectedAuction.current_highest_bid + increment;
    const newBid: LiveAuctionBid = {
      id: `bid-human-${Date.now()}`,
      bidder_id: 'usr-buyer-current',
      bidder_name: 'You (Verified B2B Buyer)',
      bidder_type: 'human',
      bid_amount: bidValue,
      total_bid_value: bidValue * selectedAuction.quantity,
      timestamp: new Date().toLocaleTimeString('en-IN'),
      strategy_reason: 'Manual instantaneous bid override via live auction console.',
      is_winning: true,
    };

    setAuctions((prev) =>
      prev.map((auc) => {
        if (auc.id === selectedAuction.id) {
          return {
            ...auc,
            current_highest_bid: bidValue,
            current_winning_bidder_id: 'usr-buyer-current',
            current_winning_bidder_name: 'You (Verified B2B Buyer)',
            current_winning_bidder_type: 'human',
            total_bids_count: auc.total_bids_count + 1,
            bids: [newBid, ...auc.bids.map((b) => ({ ...b, is_winning: false }))],
          };
        }
        return auc;
      })
    );
  };

  // Create New Auction Submission
  const handleCreateAuction = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = SEED_PRODUCTS.find((p) => p.id === newProduct) || SEED_PRODUCTS[0];

    const newAuc: LiveAuction = {
      id: `auction-${Date.now()}`,
      title: `⚡ Live Lot: ${newQuantity} ${prod.unit} of ${prod.name}`,
      product_id: prod.id,
      product_name: prod.name,
      category: prod.category,
      seller_id: prod.seller_id,
      seller_name: prod.seller_name || 'Verified Merchant',
      seller_business: prod.seller_business || 'Apex Wholesale Mart',
      quantity: Number(newQuantity),
      unit: prod.unit,
      base_starting_price: Number(newStartingPrice),
      reserve_price: Number(newReservePrice),
      current_highest_bid: Number(newStartingPrice),
      status: 'live',
      ends_at_seconds: Number(newDuration),
      gst_percent: prod.gst_percent,
      transport_charge: prod.transport_charge,
      auto_bidding_agents_enabled: true,
      total_bids_count: 1,
      created_at: new Date().toISOString(),
      bids: [
        {
          id: `bid-initial-${Date.now()}`,
          bidder_id: 'usr-seller-init',
          bidder_name: 'Opening Reserve Bid',
          bidder_type: 'buyer_agent',
          bid_amount: Number(newStartingPrice),
          total_bid_value: Number(newStartingPrice) * Number(newQuantity),
          timestamp: new Date().toLocaleTimeString('en-IN'),
          strategy_reason: 'Floor opening price established by seller.',
          is_winning: true,
        },
      ],
    };

    setAuctions([newAuc, ...auctions]);
    setSelectedAuctionId(newAuc.id);
    setIsCreatingAuction(false);
  };

  // Trigger Instant Razorpay Settlement for Winning Bid
  const handleTriggerSettlement = (auc: LiveAuction) => {
    setSettledAuction(auc);
    setSettlementModalOpen(true);
  };

  const handleSettlementSuccess = (paymentId: string) => {
    setSettlementModalOpen(false);
    if (settledAuction) {
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === settledAuction.id
            ? { ...a, status: 'settled', settlement_transaction_id: paymentId }
            : a
        )
      );
      setActiveBillNo(`BILL-AUC-${Math.floor(1000 + Math.random() * 9000)}`);
      setTimeout(() => {
        setInvoiceModalOpen(true);
      }, 500);
    }
  };

  // Landed Cost calculations for auction
  const winningBaseTotal = selectedAuction.current_highest_bid * selectedAuction.quantity;
  const gstAmount = (winningBaseTotal * selectedAuction.gst_percent) / 100;
  const totalLandedCost = winningBaseTotal + gstAmount + selectedAuction.transport_charge;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 border border-indigo-800 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Gavel className="w-4 h-4 text-amber-400" />
            <span>Autonomous B2B Auction & RFQ Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Live Multi-Agent Auctions & Reverse RFQ Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Sellers can arrange live competitive auctions where multiple Buyer AI Agents and humans bid in real-time with automated Razorpay settlement upon highest bid. Buyers can also launch Multi-Vendor RFQs to compare 3 suppliers simultaneously.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatingAuction(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Live Product Auction</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('forward-auction')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'forward-auction'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>Multi-Buyer Live Auction Arena</span>
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {auctions.filter((a) => a.status === 'live').length} LIVE
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('multi-vendor-rfq')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'multi-vendor-rfq'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Multi-Vendor Reverse RFQ Matrix</span>
            <span className="bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              3 Quotes
            </span>
          </button>
        </div>

        {activeSubTab === 'forward-auction' && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold">Auto-Agent Competitors:</span>
            <button
              onClick={() => setAutoAgentActive(!autoAgentActive)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                autoAgentActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-100 text-slate-500 border-slate-300'
              }`}
            >
              {autoAgentActive ? '🟢 AI Bidders Active' : '⚪ Paused'}
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FORWARD LIVE AUCTION ARENA */}
      {/* ========================================================================= */}
      {activeSubTab === 'forward-auction' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Active Auction List (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Active Lots & Auctions</span>
              <span className="text-[10px] text-indigo-600 font-bold">{auctions.length} Available</span>
            </h3>

            <div className="space-y-3">
              {auctions.map((auc) => {
                const isSelected = auc.id === selectedAuctionId;
                const isLive = auc.status === 'live';

                return (
                  <div
                    key={auc.id}
                    onClick={() => setSelectedAuctionId(auc.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {auc.category}
                      </span>
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full animate-pulse border border-red-200">
                          <Flame className="w-3 h-3 text-red-600" />
                          <span>{auc.ends_at_seconds}s LEFT</span>
                        </span>
                      ) : auc.status === 'settled' ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                          SETTLED
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                          ENDED
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{auc.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Seller: <span className="font-semibold text-slate-700">{auc.seller_business}</span>
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Current High Bid</span>
                        <span className="text-sm font-black text-indigo-700">
                          ₹{auc.current_highest_bid}/{auc.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Lot Quantity</span>
                        <span className="text-xs font-bold text-slate-800">
                          {auc.quantity} {auc.unit}s
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Auction Bidding Stage (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Stage Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                      {selectedAuction.category}
                    </span>
                    {selectedAuction.status === 'live' ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 font-bold px-2.5 py-0.5 rounded-full border border-red-200 animate-pulse">
                        <Flame className="w-3.5 h-3.5" />
                        <span>LIVE AUCTION IN PROGRESS</span>
                      </span>
                    ) : (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                        {selectedAuction.status === 'settled' ? '✓ SETTLED & PAID' : 'AUCTION CONCLUDED'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">{selectedAuction.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Listed by <span className="font-semibold text-slate-800">{selectedAuction.seller_business}</span> • GSTIN: <span className="font-mono">{SEED_PRODUCTS.find(p => p.id === selectedAuction.product_id)?.seller_gstin || '07AAACA1234A1Z5'}</span>
                  </p>
                </div>

                {/* Live Countdown Clock */}
                <div className="bg-slate-950 text-white p-3.5 rounded-xl border border-slate-800 text-center min-w-[130px] shadow-md">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Timer Remaining</span>
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight text-amber-400">
                    00:{selectedAuction.ends_at_seconds < 10 ? `0${selectedAuction.ends_at_seconds}` : selectedAuction.ends_at_seconds}
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Strict SLA Timeout</span>
                </div>
              </div>

              {/* High Bid Hero Metric Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Current Winning Bid</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-indigo-700">₹{selectedAuction.current_highest_bid}</span>
                    <span className="text-xs text-slate-500 font-bold">/ {selectedAuction.unit}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+₹{selectedAuction.current_highest_bid - selectedAuction.base_starting_price} over opening</span>
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Current Leading Bidder</span>
                  <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span className="truncate">{selectedAuction.current_winning_bidder_name || 'No bids yet'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                    {selectedAuction.total_bids_count} bids recorded
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Total Lot Value (incl. GST)</span>
                  <span className="text-lg font-black text-slate-900 block mt-1">
                    ₹{totalLandedCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Base ₹{(winningBaseTotal).toLocaleString('en-IN')} + {selectedAuction.gst_percent}% GST + ₹{selectedAuction.transport_charge} Freight
                  </span>
                </div>
              </div>

              {/* Bidding Interaction Buttons */}
              {selectedAuction.status === 'live' ? (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-700 block">Place Real-time Increment Bid</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handlePlaceBid(1)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Outbid by +₹1 (₹{selectedAuction.current_highest_bid + 1}/{selectedAuction.unit})</span>
                    </button>

                    <button
                      onClick={() => handlePlaceBid(5)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Aggressive +₹5 (₹{selectedAuction.current_highest_bid + 5}/{selectedAuction.unit})</span>
                    </button>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="number"
                        value={customBidAmount}
                        onChange={(e) => setCustomBidAmount(Number(e.target.value))}
                        className="w-20 px-2.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 font-bold text-center"
                        min={selectedAuction.current_highest_bid + 1}
                      />
                      <button
                        onClick={() => handlePlaceBid(customBidAmount - selectedAuction.current_highest_bid)}
                        disabled={customBidAmount <= selectedAuction.current_highest_bid}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs disabled:opacity-50 cursor-pointer"
                      >
                        Set Bid
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedAuction.status === 'ended' ? (
                /* Auction Concluded -> Settlement Trigger */
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                      <Trophy className="w-4 h-4 text-amber-600" />
                      <span>AUCTION WON by {selectedAuction.current_winning_bidder_name}!</span>
                    </div>
                    <p className="text-xs text-amber-800">
                      Reserve price met (₹{selectedAuction.reserve_price}/{selectedAuction.unit}). Instant autonomous settlement ready.
                    </p>
                  </div>

                  <button
                    onClick={() => handleTriggerSettlement(selectedAuction)}
                    className="px-5 py-2.5 bg-[#0c2340] hover:bg-[#133560] text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Pay ₹{totalLandedCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })} via Razorpay</span>
                  </button>
                </div>
              ) : (
                /* Already Settled */
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Settled via Razorpay ({selectedAuction.settlement_transaction_id}) • GST Tax Invoice Generated</span>
                  </div>
                  <button
                    onClick={() => setInvoiceModalOpen(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    View Official Invoice
                  </button>
                </div>
              )}
            </div>

            {/* Live Bid Stream & Multi-Agent History */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Real-time Multi-Agent Bidding Ledger</span>
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedAuction.bids.length} Autonomous Bids
                </span>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {selectedAuction.bids.map((bid, index) => {
                  const isTop = index === 0;

                  return (
                    <div
                      key={bid.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                        isTop
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-100 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isTop
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {bid.bidder_type === 'human' ? '👤' : '🤖'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{bid.bidder_name}</span>
                            {isTop && (
                              <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded">
                                HIGHEST BID
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{bid.strategy_reason}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-indigo-700 block">
                          ₹{bid.bid_amount}/{selectedAuction.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Total: ₹{bid.total_bid_value.toLocaleString('en-IN')} • {bid.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MULTI-VENDOR REVERSE RFQ MATRIX */}
      {/* ========================================================================= */}
      {activeSubTab === 'multi-vendor-rfq' && (
        <div className="space-y-6">
          <MultiSupplierAuctionMatrix
            onSelectWinningQuote={(quote, rfq) => {
              setActiveBillNo(`BILL-REV-AUC-${Math.floor(1000 + Math.random() * 9000)}`);
              setSettledAuction({
                id: `rev-auc-${Date.now()}`,
                title: `Reverse Auction: ${rfq.buyer_query}`,
                product_id: 'prod-wheat',
                product_name: rfq.buyer_query,
                category: rfq.category,
                seller_id: quote.seller_id,
                seller_name: quote.seller_name,
                seller_business: quote.seller_business,
                quantity: rfq.quantity,
                unit: rfq.unit,
                base_starting_price: quote.quoted_price,
                reserve_price: quote.quoted_price,
                current_highest_bid: quote.quoted_price,
                status: 'live',
                ends_at_seconds: 0,
                gst_percent: quote.gst_percent,
                transport_charge: quote.transport_charge,
                auto_bidding_agents_enabled: true,
                total_bids_count: quote.counter_rounds_conducted,
                created_at: new Date().toISOString(),
                bids: [],
              });
              setSettlementModalOpen(true);
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW PRODUCT AUCTION */}
      {/* ========================================================================= */}
      {isCreatingAuction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Create New Live B2B Product Auction</h3>
              </div>
              <button onClick={() => setIsCreatingAuction(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAuction} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Product Lot from Catalog</label>
                <select
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  {SEED_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Base: ₹{p.base_price}/{p.unit} • Floor: ₹{p.min_price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lot Quantity</label>
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
                    min={1}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Seconds)</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value={45}>45 Seconds (Fast Demo)</option>
                    <option value={60}>60 Seconds (Standard)</option>
                    <option value={120}>2 Minutes (Extended)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Starting Price (₹/unit)</label>
                  <input
                    type="number"
                    value={newStartingPrice}
                    onChange={(e) => setNewStartingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Confidential Reserve Price (₹/unit)</label>
                  <input
                    type="number"
                    value={newReservePrice}
                    onChange={(e) => setNewReservePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                  <span className="text-[10px] text-slate-500">Won't sell if bids stay below this.</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Autonomous Multi-Agent Bidders Included</span>
                </div>
                <p className="text-[11px] text-indigo-700">
                  Multiple verified Buyer AI Agents will automatically discover and bid against each other dynamically.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreatingAuction(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Start Live Auction Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Settlement Modal */}
      {settledAuction && (
        <RazorpayModal
          isOpen={settlementModalOpen}
          onClose={() => setSettlementModalOpen(false)}
          billNo={activeBillNo}
          totalAmount={
            settledAuction.current_highest_bid * settledAuction.quantity * (1 + settledAuction.gst_percent / 100) +
            settledAuction.transport_charge
          }
          productName={settledAuction.product_name}
          quantity={settledAuction.quantity}
          onPaymentSuccess={handleSettlementSuccess}
        />
      )}

      {/* Official Section 31 CGST Invoice Modal */}
      {invoiceModalOpen && settledAuction && (
        <InvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          invoice={{
            bill_no: activeBillNo,
            invoice_date: new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            seller: {
              name: settledAuction.seller_name,
              business_name: settledAuction.seller_business,
              gstin: '07AAACA1234A1Z5',
              phone: '+91 98765 43210',
              address: 'Plot 42, APMC Grain Yard, Karnal, Haryana 132001',
            },
            buyer: {
              name: 'Amitabh Sen',
              business_name: 'Bengal Royal Hotels & Banquets',
              gstin: '19AAECB7788J1ZR',
              phone: '+91 98300 11223',
              address: '14 Park Street, Kolkata, West Bengal 700016',
            },
            item: {
              product_id: settledAuction.product_id,
              name: settledAuction.product_name,
              hsn_code: '1006.30.20',
              quantity: settledAuction.quantity,
              unit: settledAuction.unit,
              unit_price: settledAuction.current_highest_bid,
              base_amount: settledAuction.current_highest_bid * settledAuction.quantity,
              gst_percent: settledAuction.gst_percent,
              cgst_percent: settledAuction.gst_percent / 2,
              cgst_amount: (settledAuction.current_highest_bid * settledAuction.quantity * (settledAuction.gst_percent / 2)) / 100,
              sgst_percent: settledAuction.gst_percent / 2,
              sgst_amount: (settledAuction.current_highest_bid * settledAuction.quantity * (settledAuction.gst_percent / 2)) / 100,
              transport_charge: settledAuction.transport_charge,
              total_amount:
                settledAuction.current_highest_bid * settledAuction.quantity * (1 + settledAuction.gst_percent / 100) +
                settledAuction.transport_charge,
            },
            payment: {
              razorpay_payment_id: `pay_AUC_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
              payment_status: 'paid',
              paid_at: new Date().toLocaleTimeString('en-IN'),
              method: 'Razorpay UPI Autopay Instant Settlement',
            },
            audit_summary: {
              total_rounds: settledAuction.total_bids_count,
              base_price: settledAuction.base_starting_price,
              agreed_price: settledAuction.current_highest_bid,
              discount_secured: Math.max(0, settledAuction.base_starting_price - settledAuction.current_highest_bid),
              discount_percent: 0,
              settlement_timestamp: new Date().toISOString(),
            },
          }}
        />
      )}
    </div>
  );
};
