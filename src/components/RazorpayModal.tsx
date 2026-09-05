import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Lock, 
  Loader2, 
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Zap,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  billNo: string;
  totalAmount: number;
  productName: string;
  quantity: number;
  onPaymentSuccess: (paymentId: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  billNo,
  totalAmount,
  productName,
  quantity,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiVpa, setUpiVpa] = useState('buyer.business@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [generatedPaymentId, setGeneratedPaymentId] = useState('');
  
  // Track 3 AI Revenue Recovery Simulation State
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [recoveryState, setRecoveryState] = useState<'none' | 'failed' | 'recovering' | 'recovered'>('none');
  const [recoveryLog, setRecoveryLog] = useState<string[]>([]);

  // Keyboard Escape listener to close modal smoothly
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

  const handlePay = () => {
    setIsProcessing(true);
    const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}9B`;

    if (simulateFailure && recoveryState === 'none') {
      // Simulate Bank failure
      setTimeout(() => {
        setIsProcessing(false);
        setRecoveryState('failed');
        setRecoveryLog([
          '❌ Gateway Error: NPCI_UPI_SERVER_TIMEOUT (504)',
          '🤖 Razorpay AI Smart Recovery Agent Intercepted event',
          '⚡ Diagnosing failure: Issuer bank switch offline for @okhdfcbank',
          '🔄 Autonomous Action: Generating dynamic 1-click fallback via ICICI UPI & WhatsApp Pay Link'
        ]);
      }, 1200);
      return;
    }

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setGeneratedPaymentId(mockPaymentId);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onPaymentSuccess(mockPaymentId);
      }, 1800);
    }, 1400);
  };

  const handleSmartRecover = () => {
    setRecoveryState('recovering');
    setTimeout(() => {
      setRecoveryState('recovered');
      const mockRecoveryPaymentId = `pay_REC_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setGeneratedPaymentId(mockRecoveryPaymentId);
      setIsPaid(true);

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onPaymentSuccess(mockRecoveryPaymentId);
      }, 2000);
    }, 1500);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="razorpay-modal-title"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative cursor-default my-auto"
      >
        {/* Razorpay Branded Test Checkout Header */}
        <div className="bg-gradient-to-r from-[#0c2340] to-[#0b3363] text-white p-5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-black text-white text-sm shadow-sm">
                R
              </div>
              <div>
                <h3 id="razorpay-modal-title" className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  <span>Razorpay Standard Checkout</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-semibold">
                    TEST MODE
                  </span>
                </h3>
                <p className="text-[11px] text-blue-200">Agent2Agent Bazaar Autonomous Settlement</p>
              </div>
            </div>

            {/* Dedicated Upper-Corner Close Button (Always accessible) */}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer flex items-center justify-center border border-white/10"
              title="Close payment window"
              aria-label="Close payment modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount Badge */}
          <div className="mt-4 pt-3 border-t border-blue-900/60 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-blue-200 block">Total Amount Payable (incl. GST)</span>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-blue-300 block">Order Reference</span>
              <span className="text-xs font-mono font-bold text-white bg-blue-900/50 px-2 py-0.5 rounded border border-blue-700">
                {billNo}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Body */}
        {isPaid ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">
                {recoveryState === 'recovered' ? '⚡ Recovered & Settled by AI Agent!' : 'Autonomous Payment Verified!'}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                {recoveryState === 'recovered' 
                  ? 'Razorpay AI Revenue Recovery seamlessly switched rails and confirmed payment.' 
                  : 'Webhook signature validated by Razorpay Gateway.'}
              </p>
              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 inline-block text-left">
                <p className="text-[11px] text-slate-500 font-medium">Razorpay Payment ID:</p>
                <p className="text-xs font-mono font-bold text-blue-700">{generatedPaymentId}</p>
              </div>
            </div>

            <p className="text-xs text-emerald-600 font-medium animate-pulse">
              Generating Official GST Tax Invoice...
            </p>

            <button
              type="button"
              onClick={() => {
                onPaymentSuccess(generatedPaymentId || `pay_${Date.now()}`);
                onClose();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <span>View Tax Invoice & Receipt Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : recoveryState === 'failed' ? (
          /* Track 3 AI Revenue Recovery Interception View */
          <div className="p-5 space-y-4 animate-in fade-in duration-200">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Simulated Bank Rail Timeout (NPCI Code: 504)</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                The primary UPI bank server timed out. In standard checkout, this leads to payment drop-off.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Razorpay AI Revenue Recovery Agent</span>
                </span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded font-mono">
                  Track 3 Feature
                </span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                {recoveryLog.map((log, i) => (
                  <p key={i} className="text-slate-300">{log}</p>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleSmartRecover}
                disabled={recoveryState === 'recovering'}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                {recoveryState === 'recovering' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Executing 1-Click Alternate Rail Recovery...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Authorize Instant 1-Click WhatsApp / Alternate UPI</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setRecoveryState('none');
                  setSimulateFailure(false);
                }}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                Cancel and return to standard checkout
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Order Summary Recap */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Product</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{productName}</span>
              </div>
              <div className="flex justify-between text-slate-600 mt-1">
                <span>Batch Quantity</span>
                <span className="font-semibold text-slate-900">{quantity} units</span>
              </div>
              <div className="flex justify-between text-slate-600 mt-1">
                <span>Settlement Protocol</span>
                <span className="font-semibold text-blue-700">Agent Pre-Authorized Autopay</span>
              </div>
            </div>

            {/* Track 3 Test Simulation Toggle */}
            <div className="p-2.5 bg-indigo-50/60 border border-indigo-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Simulate Bank Drop & AI Recovery</span>
                  <span className="text-[10px] text-slate-500">Demonstrates Track 3 AI Revenue Recovery feature</span>
                </div>
              </div>
              <input
                type="checkbox"
                id="toggle-simulate-failure"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Select Payment Rail</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold">UPI Autopay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold">Corporate Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedMethod === 'netbanking'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold">Netbanking</span>
                </button>
              </div>
            </div>

            {/* Method Details */}
            {selectedMethod === 'upi' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 block">Buyer Verified VPA / UPI ID</label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 font-mono text-slate-800"
                />
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Agent pre-authorized recurring mandate for autonomous execution.</span>
                </div>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <p className="font-mono text-slate-800 font-bold">💳 4111 •••• •••• 1111 (Test Visa Commercial)</p>
                <p className="text-[11px] text-slate-500">Auto-tokenized for agent settlement protocol.</p>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <p className="font-bold text-slate-800">🏦 HDFC Bank Corporate Portal</p>
                <p className="text-[11px] text-slate-500">Direct RTGS / NEFT Autonomous B2B Clearing.</p>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-3 bg-[#0c2340] hover:bg-[#133560] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Authorizing via Razorpay Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Pay ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Test Mode)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>256-Bit SSL Encrypted • Razorpay Test Node 2026</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
