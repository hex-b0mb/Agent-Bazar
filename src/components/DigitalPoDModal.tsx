import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  X, 
  PenTool, 
  RotateCcw, 
  ShieldCheck, 
  Lock, 
  Building2, 
  Truck, 
  Sparkles, 
  Check, 
  AlertCircle,
  IndianRupee
} from 'lucide-react';
import { Transaction } from '../types';
import confetti from 'canvas-confetti';

interface DigitalPoDModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onPoDVerified?: (tx: Transaction) => void;
}

export const DigitalPoDModal: React.FC<DigitalPoDModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onPoDVerified,
}) => {
  const [otpValue, setOtpValue] = useState<string>('849201');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  
  // Inspection Checklist State
  const [qcChecklist, setQcChecklist] = useState({
    bagCountMatched: true,
    moistureWithinLimits: true,
    holographicSealsIntact: true,
    weightBridgeSlipAttached: true,
  });

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

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

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#312e81'; // Deep indigo ink
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  if (!isOpen || !transaction) return null;

  const billNo = transaction.bill_no;
  const buyerName = transaction.invoice_data?.buyer.business_name || 'Procurement Enterprises Ltd';
  const sellerName = transaction.invoice_data?.seller.business_name || 'AgriHub Super Grains Pvt Ltd';
  const totalAmount = transaction.total_amount;

  const handleVerifyAndReleaseEscrow = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      onPoDVerified?.(transaction);
    }, 1200);
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
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh] cursor-default relative"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Digital Proof of Delivery (e-PoD)</h3>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 px-2 py-0.5 rounded font-mono font-bold">
                  NPCI UAP SMART-POD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Consignment Acceptance for Bill #{billNo} • Amount: ₹{totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 rounded-lg transition-all cursor-pointer"
            title="Close PoD (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status banner */}
          {isVerified ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 flex items-start gap-3 animate-in fade-in duration-300">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-950">e-PoD Signed & Smart Escrow Released!</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Cryptographic receipt generated. ₹{totalAmount.toLocaleString('en-IN')} has been autonomously debited via UPI Autopay and deposited to {sellerName}'s virtual nodal account.
                </p>
                <p className="text-[11px] font-mono text-emerald-700 mt-2 bg-emerald-100/60 p-2 rounded border border-emerald-200">
                  Transaction Settlement Hash: 0x9e12a4b87c10d3f66a89c201d44bc09a
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-indigo-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Delivery verified by Receiver Mandi Gate Agent. Entering OTP & signing executes autonomous settlement.
                </span>
              </div>
            </div>
          )}

          {/* Consignment Overview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Receiver Enterprise</span>
              <p className="font-bold text-slate-900 truncate mt-0.5">{buyerName}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Commodity & Lot</span>
              <p className="font-bold text-slate-900 truncate mt-0.5">{transaction.product_name}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Billed Quantity</span>
              <p className="font-bold text-slate-900 mt-0.5">{transaction.quantity} units (Gross Tare Passed)</p>
            </div>
          </div>

          {/* Quality & Physical Inspection Checklist */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Receiving Bay Quality & Seal Checklist</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={qcChecklist.bagCountMatched}
                  onChange={(e) => setQcChecklist({ ...qcChecklist, bagCountMatched: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">Physical bag count matches gate pass</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={qcChecklist.moistureWithinLimits}
                  onChange={(e) => setQcChecklist({ ...qcChecklist, moistureWithinLimits: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">Moisture & grain purity test passed</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={qcChecklist.holographicSealsIntact}
                  onChange={(e) => setQcChecklist({ ...qcChecklist, holographicSealsIntact: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">Tamper-evident truck seals intact</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={qcChecklist.weightBridgeSlipAttached}
                  onChange={(e) => setQcChecklist({ ...qcChecklist, weightBridgeSlipAttached: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">Electronic weighbridge slip verified</span>
              </label>
            </div>
          </div>

          {/* 6-Digit Delivery OTP Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                6-Digit Receiver Delivery OTP
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Dispatched to Buyer +91 98300 11223</span>
            </div>
            <input
              type="text"
              maxLength={6}
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full text-center tracking-widest text-lg font-mono font-bold py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            />
          </div>

          {/* Digital Signature Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-indigo-600" />
                <span>Authorized Receiver Signature</span>
              </label>
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Ink</span>
              </button>
            </div>

            <div className="border border-slate-300 rounded-2xl overflow-hidden bg-slate-50 relative">
              <canvas
                ref={canvasRef}
                width={560}
                height={130}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-32 bg-white cursor-crosshair touch-none"
              />
              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-400 font-medium">
                  Draw signature here with mouse or finger to sign acceptance
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Digital Signature legally binding under IT Act 2000 Section 3A</span>
          </div>

          <div className="flex items-center gap-2">
            {!isVerified ? (
              <button
                type="button"
                disabled={isVerifying || otpValue.length < 6}
                onClick={handleVerifyAndReleaseEscrow}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
              >
                {isVerifying ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Verifying & Settling Escrow...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Acceptance & Release ₹{totalAmount.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
