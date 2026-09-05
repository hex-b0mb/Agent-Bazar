import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  CreditCard, 
  IndianRupee, 
  Lock, 
  Clock, 
  Building2, 
  Radio, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AutopayMandateModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerBusinessName?: string;
  defaultDebitLimit?: number;
}

export const AutopayMandateModal: React.FC<AutopayMandateModalProps> = ({
  isOpen,
  onClose,
  buyerBusinessName = 'Commercial Enterprise Ltd',
  defaultDebitLimit = 250000,
}) => {
  const [maxDebitLimit, setMaxDebitLimit] = useState<number>(defaultDebitLimit);
  const [triggerCondition, setTriggerCondition] = useState<'geofence_arrival' | 'pod_otp_verified' | 'both'>('both');
  const [selectedBank, setSelectedBank] = useState<'hdfc' | 'icici' | 'sbi'>('hdfc');
  const [upiVpa, setUpiVpa] = useState<string>('procure.enterprise@okhdfcbank');
  const [isMandateActive, setIsMandateActive] = useState<boolean>(true);
  const [lastAutonomousDebit, setLastAutonomousDebit] = useState<string | null>('₹76,150 debited today at 09:14 AM (Trigger: Verified Mandi Gate Weighbridge)');

  // Keyboard Escape listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mandateUmn = 'UMN: UAP899472910@npci.autopay';

  const handleUpdateMandate = () => {
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.7 } });
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh] cursor-default relative"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Autonomous UPI Autopay & e-Mandate</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  NPCI UAP AUTOPAY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Zero-Click Settlement Node for <span className="text-slate-200 font-semibold">{buyerBusinessName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 rounded-lg transition-all cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-700">
          {/* Active Mandate Status Badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-950 text-sm">NPCI e-Mandate Active & Registered</h4>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  STANDING INSTRUCTION
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 font-mono">{mandateUmn}</p>
              <p className="text-[11px] text-emerald-700 mt-1">
                Linked VPA: <span className="font-bold">{upiVpa}</span> (HDFC Bank Corporate Current A/c #9948)
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-4">
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Per-Transaction Autonomous Debit Cap (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={maxDebitLimit}
                  onChange={(e) => setMaxDebitLimit(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Any autonomous deal agreed by your Buyer Agent below this threshold executes with zero human intervention.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Autonomous Escrow Release Trigger Rules
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTriggerCondition('geofence_arrival')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    triggerCondition === 'geofence_arrival'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-xs">📍 Geofence Arrival</p>
                  <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                    Truck enters Mandi radius (&lt; 200m)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTriggerCondition('pod_otp_verified')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    triggerCondition === 'pod_otp_verified'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-xs">✍️ Digital e-PoD Signature</p>
                  <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                    Receiver signs tare weigh slip
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTriggerCondition('both')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    triggerCondition === 'both'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-xs">🛡️ Multi-Sig Consensus</p>
                  <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                    Geofence + e-PoD OTP match
                  </span>
                </button>
              </div>
            </div>

            {/* Execution history snippet */}
            {lastAutonomousDebit && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500">Last Execution Ledger</span>
                <p className="text-xs text-slate-800 font-medium mt-0.5">{lastAutonomousDebit}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3.5 flex items-center justify-between text-white">
          <span className="text-xs text-slate-400">NPCI Unified Autonomous Protocol Ready</span>
          <button
            type="button"
            onClick={handleUpdateMandate}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Save Mandate Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
