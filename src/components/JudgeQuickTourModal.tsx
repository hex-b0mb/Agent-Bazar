import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Truck, 
  Scale, 
  ReceiptText, 
  Landmark, 
  Layers, 
  Award,
  X
} from 'lucide-react';
import { Product, BuyerRequest, Transaction } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioId: 'happy_path' | 'npci_recovery' | 'quality_arbitration') => void;
}

export const JudgeQuickTourModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectScenario,
}) => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'rubric'>('scenarios');

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'happy_path' as const,
      badge: 'Scenario 1 (Core Track)',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      title: 'Full Autonomous B2B Settlement & Escrow',
      description: 'End-to-end B2B trade execution in seconds: Agent-to-Agent consensus at ₹72/kg, 20% advance escrow lock, Fastag RFID e-Way pass, destination PoD OTP release, and GSTR-3B tax offset.',
      flowSteps: [
        '1. Sub-240ms Agent Bounded Consensus (₹72/kg)',
        '2. Razorpay Smart Escrow Advance Lock (₹15,120)',
        '3. NIC e-Way Bill & Fastag RFID Toll Pass',
        '4. Destination Weighbridge & PoD OTP Release (80%)',
        '5. 3-Way Bank UTR & GSTR-2B ITC Matching'
      ],
      icon: Award,
      buttonText: 'Launch Happy Path Tour',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white'
    },
    {
      id: 'npci_recovery' as const,
      badge: 'Scenario 2 (Fintech Resilience)',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      title: 'NPCI UPI 504 Drop Recovery & Self-Healing',
      description: 'Simulates a live bank gateway drop during peak mandi hours. The AI Payment Self-Healing daemon detects the state mismatch, queries Razorpay Webhook APIs, and dispatches a 1-click fallback recovery link.',
      flowSteps: [
        '1. Simulates NPCI Bank 504 Timeout on UPI',
        '2. AI Agent detects pending ledger drop',
        '3. Autonomous Razorpay Webhook Poller verifies intent',
        '4. 1-Click WhatsApp / SMS Recovery link dispatched',
        '5. Payment recovered without duplicate debit'
      ],
      icon: Zap,
      buttonText: 'Launch NPCI Resilience Tour',
      buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white'
    },
    {
      id: 'quality_arbitration' as const,
      badge: 'Scenario 3 (Autonomous Arbitration)',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      title: 'Weighbridge QC Moisture Variance & Smart Offset',
      description: 'Destination godown weighbridge slip detects 2% excess moisture variance. Smart Contract autonomously recalculates penalty compensation and credits the buyer back from the held escrow balance.',
      flowSteps: [
        '1. Destination Weighbridge scans consignment',
        '2. Sensor flags 2% moisture variance vs Grade-A contract',
        '3. Smart Contract calculates ₹1,500 penalty offset',
        '4. Escrow releases adjusted ₹74,100 to seller',
        '5. ₹1,500 instant refund routed back to buyer'
      ],
      icon: Scale,
      buttonText: 'Launch Quality Arbitration Tour',
      buttonClass: 'bg-purple-600 hover:bg-purple-500 text-white'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-2xl border border-indigo-800 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-b border-indigo-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Razorpay AI Builder: 1-Click Judge QuickTour
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Rubric Aligned
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Experience every core capability of Agent2Agent B2B Commerce in interactive 30-second judge scenarios.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-3 bg-slate-950/60 border-b border-indigo-900/50 flex gap-2">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'scenarios'
                ? 'border-indigo-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Curated Demo Scenarios (3)
          </button>
          <button
            onClick={() => setActiveTab('rubric')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'rubric'
                ? 'border-indigo-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Razorpay Evaluation Checklist
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'scenarios' ? (
            <div className="space-y-4">
              {scenarios.map((sc) => {
                const IconComponent = sc.icon;
                return (
                  <div
                    key={sc.id}
                    className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-indigo-900/70 hover:border-indigo-500 transition-all space-y-3 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sc.badgeColor}`}>
                        {sc.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Estimated Demo Time: ~30s
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-indigo-400" />
                        <span>{sc.title}</span>
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">
                        {sc.description}
                      </p>
                    </div>

                    {/* Flow Steps */}
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                        Autonomous Execution Sequence:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300 font-mono">
                        {sc.flowSteps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 truncate">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          onSelectScenario(sc.id);
                          onClose();
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 ${sc.buttonClass}`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{sc.buttonText}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 bg-slate-950 rounded-xl border border-indigo-900 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Razorpay AI Builder Track Alignment Matrix</span>
                </h4>
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-900 rounded-lg flex items-start gap-2 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">1. Razorpay Core & Advanced APIs:</strong>
                      <span>Standard Checkout, Smart Route Transfers (`POST /transfers`), 2-Stage Escrow holds, Webhook HMAC-SHA256 authentication, and Payment Links API.</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg flex items-start gap-2 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">2. Autonomous Agentic AI Architecture:</strong>
                      <span>Dual-agent bounded negotiation algorithms, dynamic margin protection curves, Hinglish voice synthesis, and cryptographic consensus contracts.</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg flex items-start gap-2 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">3. Statutory Enterprise Compliance:</strong>
                      <span>Live Supabase PostgreSQL synchronization (`b2b_compliance_ledger`), GST Section 31 tax invoices, e-Way bills, and GSTR-2B 3-way reconciliation.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-indigo-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Clicking any scenario instantly pre-loads the full demo parameters.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
