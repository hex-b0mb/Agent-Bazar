import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Zap, 
  Clock, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Thermometer, 
  Droplets,
  ArrowRight,
  ExternalLink,
  Lock,
  Compass,
  FileText
} from 'lucide-react';
import { Transaction } from '../types';
import confetti from 'canvas-confetti';

interface LiveTransitTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onOpenPoD?: (tx: Transaction) => void;
  onOpenEWayBill?: (tx: Transaction) => void;
}

export const LiveTransitTrackerModal: React.FC<LiveTransitTrackerModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onOpenPoD,
  onOpenEWayBill,
}) => {
  const [transitProgress, setTransitProgress] = useState<number>(65);
  const [speedKmH, setSpeedKmH] = useState<number>(54);
  const [temperature, setTemperature] = useState<number>(24.2);
  const [humidity, setHumidity] = useState<number>(58);
  const [geofenceBreached, setGeofenceBreached] = useState<boolean>(false);
  const [isSimulatingMove, setIsSimulatingMove] = useState<boolean>(true);

  // Keyboard Escape listener to close modal smoothly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live telemetry pulse simulation
  useEffect(() => {
    if (!isOpen || !isSimulatingMove) return;

    const interval = setInterval(() => {
      setSpeedKmH(prev => Math.max(35, Math.min(68, prev + (Math.random() * 6 - 3))));
      setTemperature(prev => Number((24.0 + Math.random() * 0.5).toFixed(1)));
      setHumidity(prev => Math.round(57 + Math.random() * 3));
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, isSimulatingMove]);

  if (!isOpen || !transaction) return null;

  const billNo = transaction.bill_no;
  const productName = transaction.product_name;
  const origin = transaction.invoice_data?.seller.address || 'APMC Mandi Yard, Karnal, Haryana';
  const destination = transaction.invoice_data?.buyer.address || 'Central Unloading Bay, Azadpur Mandi, Delhi';

  const milestones = [
    {
      id: 1,
      title: 'Godown Dispatch & Gate Out',
      location: 'Karnal Grain Hub',
      time: 'Today, 06:30 AM',
      status: 'completed',
      detail: 'e-Way Bill EWB-901842091 Verified at Gate Weighbridge #1'
    },
    {
      id: 2,
      title: 'FASTag Toll Plaza Geofence Cross',
      location: 'Murthal Toll Plaza (NH-44)',
      time: 'Today, 08:45 AM',
      status: 'completed',
      detail: 'Automated RFID Toll deduction ₹380 • Vehicle HR-08-AU-9921'
    },
    {
      id: 3,
      title: 'In-Transit Highway Telemetry',
      location: 'NH-44 Highway Corridor (Km 42)',
      time: 'Live Now',
      status: 'active',
      detail: 'GPS Connected • Cold-Chain Sensors Nominal (24.2°C)'
    },
    {
      id: 4,
      title: 'Buyer Mandi Geofence Entry',
      location: 'Azadpur APMC North Terminal',
      time: geofenceBreached ? 'Triggered Just Now' : 'ETA ~ 25 mins',
      status: geofenceBreached ? 'completed' : 'pending',
      detail: geofenceBreached 
        ? 'Geofence Arrived! Autonomous Delivery OTP Dispatched' 
        : 'Automated escrow trigger armed for geofence radius (< 200m)'
    },
    {
      id: 5,
      title: 'Digital PoD & Smart Settlement',
      location: destination,
      time: geofenceBreached ? 'Ready for Receiver Signature' : 'Pending Gate Arrival',
      status: geofenceBreached ? 'active' : 'pending',
      detail: '6-digit OTP & Receiver QC checklist releases instant escrow'
    }
  ];

  const handleSimulateGeofenceArrival = () => {
    setTransitProgress(100);
    setSpeedKmH(0);
    setGeofenceBreached(true);
    setIsSimulatingMove(false);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
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
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh] cursor-default relative"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Truck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Live GPS Transit & Geofence Tracker</h3>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  <Radio className="w-3 h-3 animate-ping" /> LIVE IOT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Consignment for Bill #{billNo} • Vehicle: <span className="font-mono text-indigo-300 font-bold">HR-08-AU-9921</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEWayBill && (
              <button
                type="button"
                onClick={() => onOpenEWayBill(transaction)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>e-Way Bill</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 rounded-lg transition-all cursor-pointer"
              title="Close tracker (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Simulated Satellite Map Card */}
          <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner flex flex-col justify-between p-4">
            {/* Map Grid Pattern background */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Top Telemetry Overlay */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-white">
                <Compass className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="font-mono">NH-44 Southbound (Heading 182° S)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] text-emerald-300 font-mono">
                  <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{temperature}°C</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] text-cyan-300 font-mono">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{humidity}% RH</span>
                </div>
                <div className="flex items-center gap-1.5 bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-white font-mono font-bold">
                  <span>{Math.round(speedKmH)} km/h</span>
                </div>
              </div>
            </div>

            {/* Simulated Animated Road / Path */}
            <div className="relative z-10 my-auto px-4 sm:px-8">
              <div className="relative flex items-center justify-between">
                {/* Origin Marker */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-emerald-500/30">
                    A
                  </div>
                  <span className="text-[10px] text-slate-300 font-semibold mt-1">Karnal</span>
                </div>

                {/* Progress Track Line */}
                <div className="flex-1 mx-3 relative h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-indigo-400 transition-all duration-700 rounded-full relative"
                    style={{ width: `${transitProgress}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white animate-pulse" />
                  </div>
                </div>

                {/* Vehicle Pin positioned by progress */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 -ml-4"
                  style={{ left: `${Math.min(94, Math.max(6, transitProgress))}%` }}
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white border-2 border-white flex items-center justify-center shadow-xl shadow-indigo-600/50">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>

                {/* Destination Marker */}
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                    geofenceBreached ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-700 text-slate-300'
                  }`}>
                    B
                  </div>
                  <span className="text-[10px] text-slate-300 font-semibold mt-1">Azadpur</span>
                </div>
              </div>
            </div>

            {/* Bottom Floating Control */}
            <div className="relative z-10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Navigation className="w-4 h-4 text-indigo-400" />
                <span>
                  {geofenceBreached ? 'Consignment arrived inside Destination Geofence (< 50m)' : 'En Route via NH-44 Toll Corridor • FASTag Verified'}
                </span>
              </div>

              {!geofenceBreached ? (
                <button
                  type="button"
                  onClick={handleSimulateGeofenceArrival}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Simulate Geofence Arrival</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Geofence Check Passed
                </span>
              )}
            </div>
          </div>

          {/* Commodity Details & Vehicle Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Commodity</span>
              <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{productName}</p>
              <p className="text-[10px] text-slate-500">{transaction.quantity} units</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Driver / Contact</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">Gurpreet Singh</p>
              <p className="text-[10px] text-indigo-600 font-mono">+91 98120 44551</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">FASTag Balance</span>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">₹2,450 (Active)</p>
              <p className="text-[10px] text-slate-500">NPCI NETC Node</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Escrow Trigger</span>
              <p className={`text-xs font-bold mt-0.5 ${geofenceBreached ? 'text-emerald-600' : 'text-amber-600'}`}>
                {geofenceBreached ? 'Armed & Ready' : 'Armed (Auto-Debit)'}
              </p>
              <p className="text-[10px] text-slate-500">UPI Autopay Mandate</p>
            </div>
          </div>

          {/* Transit Milestones Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Consignment Checkpoints & Gate Verifications</span>
            </h4>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              {milestones.map((m) => (
                <div key={m.id} className="p-3.5 flex items-start gap-3">
                  <div className="mt-0.5">
                    {m.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : m.status === 'active' ? (
                      <Radio className="w-5 h-5 text-indigo-600 animate-pulse" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                        {m.id}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{m.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">{m.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{m.location}</p>
                    <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 p-1.5 rounded border border-slate-100 font-mono">
                      {m.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Autonomous IoT Geofence Escrow Protocol Enabled</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPoD && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPoD(transaction);
                }}
                className={`px-4 py-2 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98 ${
                  geofenceBreached ? 'bg-emerald-600 hover:bg-emerald-500 ring-2 ring-emerald-400' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Digital PoD & Sign</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
