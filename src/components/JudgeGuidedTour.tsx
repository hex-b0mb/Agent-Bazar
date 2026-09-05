import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Bot, 
  CreditCard, 
  ReceiptText, 
  Scale, 
  MessageSquare, 
  X, 
  ShieldCheck,
  Zap,
  Flame,
  FileSpreadsheet
} from 'lucide-react';

export interface JudgeGuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
  onTriggerAction: (actionType: string) => void;
}

export const TOUR_STEPS = [
  {
    title: "1. Intent Recognition & Agent Policy Tuning",
    badge: "Buyer & Seller AI Setup",
    icon: Bot,
    description: "Enterprise buyers configure procurement requirements with autonomous policy tuning (Aggressive, Balanced, or SLA-First) that dynamically shapes counter-offer thresholds.",
    targetTab: "arena",
    highlightAction: "configure_policy",
    actionLabel: "Launch Negotiation Demo",
    metrics: "Sub-second AI Intent Extraction & Dynamic Budget Boundary Setting"
  },
  {
    title: "2. Autonomous B2B Multi-Agent Arena",
    badge: "Live Machine Negotiation",
    icon: Flame,
    description: "Buyer AI and Seller AI conduct multi-round price bargaining, logistics fee allocation, and delivery timeline trade-offs completely autonomously.",
    targetTab: "arena",
    highlightAction: "start_negotiation",
    actionLabel: "Simulate Live Round",
    metrics: "4-Round Dynamic Convergence to Pareto-Optimal Clearing Rate"
  },
  {
    title: "3. Cryptographic Consensus & Deal Handshake",
    badge: "SHA-256 Consensus Proof",
    icon: ShieldCheck,
    description: "Upon agreed terms, both agent signatures create an immutable SHA-256 digital certificate locking the price, volume, and logistics milestones before payment.",
    targetTab: "arena",
    highlightAction: "verify_consensus",
    actionLabel: "Inspect Digital Signature",
    metrics: "Tamper-proof Machine Consensus with 100% Contract Auditability"
  },
  {
    title: "4. Autonomous Razorpay Smart Escrow Milestone Rails",
    badge: "FinTech & Payment Rails",
    icon: CreditCard,
    description: "Trigger Razorpay Smart Escrow with multi-tier milestone releases (20% Advance on PO, 30% on e-Way Bill, 50% on Delivery OTP).",
    targetTab: "vault",
    highlightAction: "open_payment",
    actionLabel: "View Escrow Settlement",
    metrics: "Razorpay Node-to-Node Escrow Protocol with Automated Webhooks"
  },
  {
    title: "5. Section 31 GST & Cross-Border FX Tax Invoicing",
    badge: "Dual-Currency Statutory Engine",
    icon: ReceiptText,
    description: "Instant generation of Indian GST tax invoices and Cross-Border Export Bills with real-time FX parity (USD, EUR, AED), Incoterms (CIF, FOB, EXW, DDP), zero-rated LUT export codes, and dual-currency PDF/JSON export.",
    targetTab: "vault",
    highlightAction: "view_invoice",
    actionLabel: "Open Tax Invoice Modal",
    metrics: "100% Section 31 CGST & Section 16 IGST Export Compliance with Real-Time FX Parity"
  },
  {
    title: "6. 3-Way AI Finance Reconciliation & WhatsApp Dispatch",
    badge: "Autonomous Audit & Dispatch",
    icon: Scale,
    description: "Automated 3-way matching between Purchase Order, Razorpay Payouts, Bank Statement UTRs, and GSTR-2B Input Tax Credits (ITC), paired with WhatsApp alerts.",
    targetTab: "reconciliation",
    highlightAction: "open_reconciliation",
    actionLabel: "View 3-Way Match Hub",
    metrics: "99.85% Automated Audit Match Rate with Zero Human Intervention"
  }
];

export const JudgeGuidedTour: React.FC<JudgeGuidedTourProps> = ({
  isOpen,
  onClose,
  currentStep,
  onStepChange,
  onTriggerAction,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play timer for presentation mode
  useEffect(() => {
    let interval: any = null;
    if (isOpen && isPlaying) {
      interval = setInterval(() => {
        onStepChange((currentStep + 1) % TOUR_STEPS.length);
      }, 7000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isPlaying, currentStep, onStepChange]);

  if (!isOpen) return null;

  const activeStepData = TOUR_STEPS[currentStep] || TOUR_STEPS[0];
  const StepIcon = activeStepData.icon;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      onStepChange(currentStep + 1);
    } else {
      onStepChange(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-indigo-500/40 p-4 sm:p-5 flex flex-col gap-4 ring-1 ring-white/10">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Trophy className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">Judge Guided Tour Mode</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-300 border border-indigo-500/40">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">60-Second Walkthrough of Autonomous Commerce Architecture</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Auto-Play' : 'Auto Play'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-6 gap-1.5">
          {TOUR_STEPS.map((step, idx) => (
            <button
              key={idx}
              onClick={() => onStepChange(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? 'bg-indigo-500 ring-2 ring-indigo-400/50'
                  : idx < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-slate-800'
              }`}
              title={step.title}
            />
          ))}
        </div>

        {/* Active Step Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <StepIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-100">{activeStepData.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded font-medium">
                  {activeStepData.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {activeStepData.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-amber-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{activeStepData.metrics}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => onTriggerAction(activeStepData.highlightAction)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{activeStepData.actionLabel}</span>
            </button>
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Milestone</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500">
            Tip: Press Esc or Close anytime to interact freely
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
          >
            <span>{currentStep === TOUR_STEPS.length - 1 ? 'Restart Tour' : 'Next Milestone'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
