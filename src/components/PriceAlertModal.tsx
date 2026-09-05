import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Sparkles, 
  ArrowDownRight, 
  ShieldCheck, 
  Mail, 
  Sliders, 
  IndianRupee, 
  Zap, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product, PriceAlert } from '../types';
import { PriceAlertService } from '../services/priceAlertService';
import { useAuth } from '../context/AuthContext';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  existingAlert?: PriceAlert;
  onAlertSaved: (newAlert: PriceAlert) => void;
  onSimulateMatch?: (alertId: string) => void;
  onOpenEmailInbox?: () => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  product,
  existingAlert,
  onAlertSaved,
  onSimulateMatch,
  onOpenEmailInbox,
}) => {
  const { user } = useAuth();
  
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [buyerName, setBuyerName] = useState<string>('');
  const [enableBrowserNotifs, setEnableBrowserNotifs] = useState<boolean>(true);
  const [notifPermissionGranted, setNotifPermissionGranted] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedAlertData, setSavedAlertData] = useState<PriceAlert | null>(null);

  useEffect(() => {
    if (product) {
      if (existingAlert) {
        setTargetPrice(existingAlert.target_price);
        setBuyerEmail(existingAlert.buyer_email);
        setBuyerName(existingAlert.buyer_name || user?.name || 'Enterprise Buyer');
        setEnableBrowserNotifs(existingAlert.enable_browser_notifications !== false);
      } else {
        // Default target to ~8% below base price
        const suggested = Math.round(product.base_price * 0.92);
        setTargetPrice(suggested);
        setBuyerEmail(user?.email || 'procurement@bengalhospitality.org');
        setBuyerName(user?.name || 'Amitabh Sen');
        setEnableBrowserNotifs(true);
      }
      setIsSaved(false);
      setSavedAlertData(null);
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermissionGranted(Notification.permission === 'granted');
    }
  }, [product, existingAlert, isOpen, user]);

  if (!isOpen || !product) return null;

  const currentPrice = product.base_price;
  const savingsPerUnit = Math.max(0, currentPrice - targetPrice);
  const savingsPercent = currentPrice > 0 ? Number(((savingsPerUnit / currentPrice) * 100).toFixed(1)) : 0;

  const handleRequestPermission = async () => {
    const granted = await PriceAlertService.requestBrowserNotificationPermission();
    setNotifPermissionGranted(granted);
    if (granted) {
      PriceAlertService.dispatchBrowserNotification(
        '🔔 Desktop Notifications Enabled!',
        'You will receive instant desktop alerts when AI agents negotiate deals at your target price.'
      );
    }
  };

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice || targetPrice <= 0 || !buyerEmail) return;

    const alert = PriceAlertService.createPriceAlert({
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      target_price: targetPrice,
      current_base_price: product.base_price,
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      buyer_business: user?.business_name || 'Bengal Royal Hotels & Banquets',
      unit: product.unit,
      enable_browser_notifications: enableBrowserNotifs,
    });

    onAlertSaved(alert);
    setSavedAlertData(alert);
    setIsSaved(true);
  };

  const handleTestMatch = () => {
    const alertId = savedAlertData?.id || existingAlert?.id;
    if (alertId && onSimulateMatch) {
      onSimulateMatch(alertId);
    } else {
      // Save and trigger
      const alert = PriceAlertService.createPriceAlert({
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        target_price: targetPrice,
        current_base_price: product.base_price,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        buyer_business: user?.business_name || 'Bengal Royal Hotels & Banquets',
        unit: product.unit,
        enable_browser_notifications: enableBrowserNotifs,
      });
      onAlertSaved(alert);
      if (onSimulateMatch) {
        onSimulateMatch(alert.id);
      }
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 cursor-default my-auto text-slate-800"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-5 flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">Set Smart Price Alert</h3>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-purple-400/30">
                  AI TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Get notified when autonomous agent negotiation hits your target unit rate
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-rose-600 border border-slate-800 hover:border-rose-500 transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Target Product Summary Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-1.5 line-clamp-1">
                {product.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Supplier: <span className="font-semibold text-slate-700">{product.seller_business || 'APMC Registered Supplier'}</span>
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">List Base Price</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                ₹{product.base_price}
                <span className="text-xs font-normal text-slate-500">/{product.unit}</span>
              </span>
            </div>
          </div>

          {!isSaved ? (
            <form onSubmit={handleSaveAlert} className="space-y-4 text-xs">
              {/* Target Price Input & Savings Calculator */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-indigo-950 block text-xs">
                    Your Target Price per {product.unit} (₹) *
                  </label>
                  {savingsPerUnit > 0 && (
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3" />
                      Save ₹{savingsPerUnit}/{product.unit} ({savingsPercent}%)
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-900 font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    required
                    min={1}
                    max={product.base_price * 1.5}
                    value={targetPrice || ''}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-16 py-2.5 bg-white border border-indigo-200 rounded-xl font-mono text-base font-black text-indigo-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                    placeholder="Enter target price"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-medium">
                    /{product.unit}
                  </div>
                </div>

                {/* Quick Target Percentage Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-indigo-900 font-semibold">Quick Set:</span>
                  {[5, 10, 15].map((pct) => {
                    const price = Math.round(product.base_price * (1 - pct / 100));
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTargetPrice(price)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          targetPrice === price
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-indigo-800 border border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        -{pct}% (₹{price})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification Channel: Buyer Email */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Notification Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="procurement@enterprise.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-500 block">
                  Dispatches transactional alert via Mock SMTP & Email Inbox modal immediately upon deal convergence.
                </span>
              </div>

              {/* Desktop Browser Notification Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Browser Desktop Notifications
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Pop-up system banner when agent closes deal below target
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!notifPermissionGranted ? (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Enable Browser Alerts
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Enabled
                    </span>
                  )}
                  <input
                    type="checkbox"
                    checked={enableBrowserNotifs}
                    onChange={(e) => setEnableBrowserNotifs(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {/* Submit & Test CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Bell className="w-4 h-4" />
                  <span>Activate Live Price Alert</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestMatch}
                  className="w-full sm:w-auto px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  title="Simulates an autonomous negotiation that hits this price immediately"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Simulate Match Now</span>
                </button>
              </div>
            </form>
          ) : (
            /* Saved Confirmation State */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Price Alert Successfully Activated!</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your AI Buyer Agent is actively monitoring market bids for <strong>{product.name}</strong>. The moment an autonomous counter-offer reaches <strong>≤ ₹{targetPrice}/{product.unit}</strong>, an alert will be dispatched to <strong>{buyerEmail}</strong>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestMatch}
                  className="w-full sm:flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Simulate Instant Agent Match</span>
                </button>

                {onOpenEmailInbox && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEmailInbox();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Email Dispatch Hub</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
