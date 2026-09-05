import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Bot, 
  Sparkles, 
  TrendingDown, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Scale, 
  Award, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Check, 
  Layers,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { Product, BuyerRequest, MultiVendorRFQ, VendorQuote } from '../types';
import { SEED_PRODUCTS, SEED_RFQS } from '../data/seedData';

interface MultiSupplierAuctionMatrixProps {
  currentRequest?: BuyerRequest | null;
  onSelectWinningQuote?: (quote: VendorQuote, rfq: MultiVendorRFQ) => void;
}

interface SupplierCompetitorState {
  id: string;
  sellerName: string;
  sellerBusiness: string;
  sellerGstin: string;
  sellerRating: number;
  catalogBasePrice: number;
  currentCounterPrice: number;
  deliveryDays: number;
  transportCharge: number;
  gstPercent: number;
  status: 'countering' | 'holding' | 'conceded' | 'winning';
  counterRounds: number;
  currentMessage: string;
  avatarColor: string;
  score: number;
}

export const MultiSupplierAuctionMatrix: React.FC<MultiSupplierAuctionMatrixProps> = ({
  currentRequest,
  onSelectWinningQuote,
}) => {
  const [rfqTarget, setRfqTarget] = useState({
    productName: currentRequest?.query || 'Sharbati Whole Wheat Grain Lot',
    quantity: currentRequest?.quantity || 500,
    unit: 'kg',
    buyerTargetPrice: 38,
    maxBudget: currentRequest?.max_budget || 44,
    deadlineDays: currentRequest?.deadline_days || 3,
  });

  const [currentRound, setCurrentRound] = useState(1);
  const [isSimulatingAuction, setIsSimulatingAuction] = useState(false);
  const [auctionPhase, setAuctionPhase] = useState<'idle' | 'round_active' | 'consensus_awarded'>('idle');

  // 3 Distinct Supplier AI Agents
  const [suppliers, setSuppliers] = useState<SupplierCompetitorState[]>([
    {
      id: 'supp-1-agrihub',
      sellerName: 'AgriHub Super Mills AI',
      sellerBusiness: 'AgriHub Super Grains Pvt Ltd',
      sellerGstin: '07AAACA1234A1Z5',
      sellerRating: 4.9,
      catalogBasePrice: 46,
      currentCounterPrice: 44,
      deliveryDays: 2,
      transportCharge: 250,
      gstPercent: 5,
      status: 'countering',
      counterRounds: 1,
      currentMessage: 'Opening offer: High-grade lab tested lot with 48hr express dispatch.',
      avatarColor: 'from-blue-600 to-indigo-700',
      score: 82,
    },
    {
      id: 'supp-2-bharat',
      sellerName: 'Bharat Kisan Wholesale AI',
      sellerBusiness: 'Bharat Kisan Commodities Ltd',
      sellerGstin: '06AAECB5566K1ZN',
      sellerRating: 4.7,
      catalogBasePrice: 45,
      currentCounterPrice: 42,
      deliveryDays: 3,
      transportCharge: 180,
      gstPercent: 5,
      status: 'winning',
      counterRounds: 1,
      currentMessage: 'Aggressive volume discount: Direct mandi procurement rate.',
      avatarColor: 'from-amber-600 to-orange-700',
      score: 89,
    },
    {
      id: 'supp-3-panipat',
      sellerName: 'Northern Mega Agro AI',
      sellerBusiness: 'Northern Agro Warehousing LLP',
      sellerGstin: '03AAJCN8899P1ZK',
      sellerRating: 4.6,
      catalogBasePrice: 47,
      currentCounterPrice: 43,
      deliveryDays: 4,
      transportCharge: 320,
      gstPercent: 5,
      status: 'countering',
      counterRounds: 1,
      currentMessage: 'Silo stored moisture-controlled wheat, standard 4-day delivery.',
      avatarColor: 'from-emerald-600 to-teal-700',
      score: 79,
    },
  ]);

  // Dynamic Multi-Agent Autonomous Round Step
  const runNextReverseAuctionRound = () => {
    if (currentRound >= 4) {
      setAuctionPhase('consensus_awarded');
      return;
    }

    setIsSimulatingAuction(true);
    setAuctionPhase('round_active');

    setTimeout(() => {
      setSuppliers((prev) => {
        const updated = prev.map((s, idx) => {
          // Autonomous counter bidding behavior per supplier persona
          let priceDrop = 0;
          let newMsg = s.currentMessage;
          let newStatus: SupplierCompetitorState['status'] = 'countering';

          if (idx === 0) {
            // AgriHub drops 1-2 rupees, emphasizes speed & GST compliance
            priceDrop = currentRound === 1 ? 2 : currentRound === 2 ? 1 : 1;
            newMsg = `Counter round ${currentRound + 1}: Slashed to ₹${s.currentCounterPrice - priceDrop}/kg. Guaranteed 2-day doorstep delivery.`;
          } else if (idx === 1) {
            // Bharat Kisan aims to be lowest cost leader
            priceDrop = currentRound === 1 ? 2 : currentRound === 2 ? 1 : 0.5;
            newMsg = `Mandi margin squeeze: ₹${s.currentCounterPrice - priceDrop}/kg. Matching buyer target price of ₹${rfqTarget.buyerTargetPrice}.`;
          } else {
            // Northern Agro holds or drops small
            priceDrop = currentRound === 1 ? 1 : currentRound === 2 ? 0.5 : 0;
            if (priceDrop === 0) {
              newStatus = 'holding';
              newMsg = `Holding firm at ₹${s.currentCounterPrice}/kg. Floor margin reached for grade-A stock.`;
            } else {
              newMsg = `Reduced to ₹${s.currentCounterPrice - priceDrop}/kg with bundled transit insurance.`;
            }
          }

          const newPrice = Math.max(rfqTarget.buyerTargetPrice, s.currentCounterPrice - priceDrop);
          
          // Re-calculate Pareto Composite Score (Price 45%, Speed 30%, Rating 25%)
          const priceScore = Math.max(0, 100 - ((newPrice - rfqTarget.buyerTargetPrice) * 12));
          const speedScore = Math.max(0, 100 - (s.deliveryDays * 12));
          const ratingScore = (s.sellerRating / 5.0) * 100;
          const composite = Math.round((priceScore * 0.45) + (speedScore * 0.30) + (ratingScore * 0.25));

          return {
            ...s,
            currentCounterPrice: newPrice,
            counterRounds: s.counterRounds + 1,
            currentMessage: newMsg,
            status: newStatus,
            score: composite,
          };
        });

        // Determine leader
        const highestScore = Math.max(...updated.map((s) => s.score));
        return updated.map((s) => ({
          ...s,
          status: s.score === highestScore ? 'winning' : s.status === 'holding' ? 'holding' : 'countering',
        }));
      });

      setCurrentRound((prev) => prev + 1);
      setIsSimulatingAuction(false);

      if (currentRound + 1 >= 4) {
        setAuctionPhase('consensus_awarded');
      }
    }, 900);
  };

  const handleResetAuction = () => {
    setCurrentRound(1);
    setAuctionPhase('idle');
    setSuppliers([
      {
        id: 'supp-1-agrihub',
        sellerName: 'AgriHub Super Mills AI',
        sellerBusiness: 'AgriHub Super Grains Pvt Ltd',
        sellerGstin: '07AAACA1234A1Z5',
        sellerRating: 4.9,
        catalogBasePrice: 46,
        currentCounterPrice: 44,
        deliveryDays: 2,
        transportCharge: 250,
        gstPercent: 5,
        status: 'countering',
        counterRounds: 1,
        currentMessage: 'Opening offer: High-grade lab tested lot with 48hr express dispatch.',
        avatarColor: 'from-blue-600 to-indigo-700',
        score: 82,
      },
      {
        id: 'supp-2-bharat',
        sellerName: 'Bharat Kisan Wholesale AI',
        sellerBusiness: 'Bharat Kisan Commodities Ltd',
        sellerGstin: '06AAECB5566K1ZN',
        sellerRating: 4.7,
        catalogBasePrice: 45,
        currentCounterPrice: 42,
        deliveryDays: 3,
        transportCharge: 180,
        gstPercent: 5,
        status: 'winning',
        counterRounds: 1,
        currentMessage: 'Aggressive volume discount: Direct mandi procurement rate.',
        avatarColor: 'from-amber-600 to-orange-700',
        score: 89,
      },
      {
        id: 'supp-3-panipat',
        sellerName: 'Northern Mega Agro AI',
        sellerBusiness: 'Northern Agro Warehousing LLP',
        sellerGstin: '03AAJCN8899P1ZK',
        sellerRating: 4.6,
        catalogBasePrice: 47,
        currentCounterPrice: 43,
        deliveryDays: 4,
        transportCharge: 320,
        gstPercent: 5,
        status: 'countering',
        counterRounds: 1,
        currentMessage: 'Silo stored moisture-controlled wheat, standard 4-day delivery.',
        avatarColor: 'from-emerald-600 to-teal-700',
        score: 79,
      },
    ]);
  };

  const winningSupplier = suppliers.reduce((prev, current) => (prev.score > current.score ? prev : current));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                Live 1 Buyer vs. 3 Suppliers Reverse Auction Matrix
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold font-mono">
                Concurrent RFQ Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Issue 1 demand broadcast to 3 competing Supplier AI Agents simultaneously. Watch autonomous counter-bidding in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-xs pr-2 hidden sm:block">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Round Progress</span>
            <span className="font-bold font-mono text-indigo-700">Round {currentRound}/4</span>
          </div>

          <button
            onClick={handleResetAuction}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Reset Reverse Auction"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {auctionPhase !== 'consensus_awarded' ? (
            <button
              onClick={runNextReverseAuctionRound}
              disabled={isSimulatingAuction}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              {isSimulatingAuction ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Agents Counter-Bidding...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Execute Round {currentRound} Counter</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Consensus Reached</span>
            </div>
          )}
        </div>
      </div>

      {/* RFQ Parameters Mini Bar */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Broadcast Commodity:</span>
          <strong className="text-slate-900 font-semibold">{rfqTarget.productName}</strong>
          <span className="text-slate-400 font-mono">({rfqTarget.quantity} {rfqTarget.unit})</span>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Target Purchase Price:</span>
            <span className="font-bold text-indigo-700 font-mono">₹{rfqTarget.buyerTargetPrice}/{rfqTarget.unit}</span>
          </div>
          <div className="w-px h-6 bg-slate-300"></div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Ceiling Budget:</span>
            <span className="font-bold text-slate-800 font-mono">₹{rfqTarget.maxBudget}/{rfqTarget.unit}</span>
          </div>
          <div className="w-px h-6 bg-slate-300"></div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Max SLA Delivery:</span>
            <span className="font-bold text-emerald-700">{rfqTarget.deadlineDays} Days</span>
          </div>
        </div>
      </div>

      {/* 3-Column Live Reverse Bidding Arena */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suppliers.map((supp, index) => {
          const isWinner = supp.status === 'winning' || (auctionPhase === 'consensus_awarded' && supp.id === winningSupplier.id);
          const totalOrderCost = (supp.currentCounterPrice * rfqTarget.quantity) + 
            ((supp.currentCounterPrice * rfqTarget.quantity * supp.gstPercent) / 100) + 
            supp.transportCharge;

          return (
            <div
              key={supp.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                isWinner
                  ? 'border-indigo-600 bg-indigo-50/30 shadow-lg ring-2 ring-indigo-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Winner Header Ribbon */}
              {isWinner && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-blue-600 text-white font-black text-[9px] px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-300" />
                  <span>PARETO LEADER ({supp.score}/100)</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Supplier Identity */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${supp.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{supp.sellerBusiness}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-bold">
                        ★ {supp.sellerRating}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">GST Verified</span>
                    </div>
                  </div>
                </div>

                {/* Price Counter Dial */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Current AI Counter Offer
                  </span>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{supp.currentCounterPrice}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">/{rfqTarget.unit}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-700 font-medium pt-0.5">
                    <TrendingDown className="w-3 h-3" />
                    <span>Saved ₹{supp.catalogBasePrice - supp.currentCounterPrice} ({Math.round(((supp.catalogBasePrice - supp.currentCounterPrice) / supp.catalogBasePrice) * 100)}% off catalog)</span>
                  </div>
                </div>

                {/* Logistics & SLA Parameters */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery SLA:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{supp.deliveryDays} Business Days</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Freight Charge:</span>
                    <span className="font-semibold text-slate-800 font-mono">₹{supp.transportCharge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax Breakdown:</span>
                    <span className="font-semibold text-slate-800 font-mono">{supp.gstPercent}% GST</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                    <span className="text-slate-700">Total Order Landed:</span>
                    <span className="text-indigo-700 font-mono">₹{totalOrderCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                {/* AI Agent Real-time Reasoning Speech Bubble */}
                <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed italic flex items-start gap-2">
                  <Bot className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <p>"{supp.currentMessage}"</p>
                </div>
              </div>

              {/* Award Contract Button */}
              <div className="pt-4 mt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (onSelectWinningQuote) {
                      onSelectWinningQuote(
                        {
                          seller_id: supp.id,
                          seller_name: supp.sellerName,
                          seller_business: supp.sellerBusiness,
                          seller_gstin: supp.sellerGstin,
                          seller_rating: supp.sellerRating,
                          quoted_price: supp.currentCounterPrice,
                          delivery_days: supp.deliveryDays,
                          gst_percent: supp.gstPercent,
                          transport_charge: supp.transportCharge,
                          landed_cost_per_unit: supp.currentCounterPrice + ((supp.currentCounterPrice * supp.gstPercent) / 100),
                          total_order_cost: totalOrderCost,
                          counter_rounds_conducted: supp.counterRounds,
                          score: supp.score,
                          is_recommended: isWinner,
                          notes: supp.currentMessage,
                        },
                        {
                          id: `rfq-${Date.now()}`,
                          buyer_query: rfqTarget.productName,
                          category: 'Agriculture & Grains',
                          quantity: rfqTarget.quantity,
                          unit: rfqTarget.unit,
                          max_budget: rfqTarget.maxBudget,
                          deadline_days: rfqTarget.deadlineDays,
                          quotes: [],
                          status: 'selected',
                          created_at: new Date().toISOString(),
                        }
                      );
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                    isWinner
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Award Contract (₹{totalOrderCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
