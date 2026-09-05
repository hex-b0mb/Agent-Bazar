import React, { useState } from 'react';
import { 
  Bot, 
  Store, 
  ShoppingBag, 
  ScrollText, 
  Gavel, 
  IndianRupee, 
  Sparkles, 
  MoreHorizontal, 
  Search, 
  Mail, 
  X, 
  Building2, 
  Home, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  ShieldCheck,
  MessageSquare,
  Network,
  Play,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isNegotiating?: boolean;
  onOpenSearchModal?: () => void;
  onOpenEmailInbox?: () => void;
  onOpenWhatsApp?: () => void;
  transactionCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  isNegotiating = false,
  onOpenSearchModal,
  onOpenEmailInbox,
  onOpenWhatsApp,
  transactionCount = 0,
}) => {
  const { user, isAuthenticated, setIsAuthModalOpen, setIsOnboardingModalOpen } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const primaryNavItems = [
    {
      id: 'arena',
      label: 'Live Arena',
      shortLabel: 'Arena',
      icon: Bot,
      isPulsing: isNegotiating,
    },
    {
      id: 'buyer',
      label: 'Buyer Hub',
      shortLabel: 'Buyer',
      icon: ShoppingBag,
    },
    {
      id: 'seller',
      label: 'Seller Hub',
      shortLabel: 'Seller',
      icon: Store,
    },
    {
      id: 'auctions',
      label: 'Auctions',
      shortLabel: 'Auctions',
      icon: Gavel,
    },
    {
      id: 'vault',
      label: 'Invoices Vault',
      shortLabel: 'Vault',
      icon: ScrollText,
      badge: transactionCount > 0 ? transactionCount : undefined,
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Quick Action Drawer / Bottom Sheet for Secondary Navigation */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="fixed inset-0"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 z-10">
            {/* Sheet Handle & Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                  AB
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Agent Bazar Portal</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Wholesale B2B Autonomous Commerce</p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Mini Snippet */}
            {isAuthenticated && user ? (
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                      <span>{user.name}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{user.business_name}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsOnboardingModalOpen(true);
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 shrink-0"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="bg-indigo-50 rounded-2xl p-3.5 border border-indigo-100 flex items-center justify-between">
                <div className="text-xs text-indigo-950 font-medium">Sign in with verified GSTIN to unlock autonomous settlement</div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-xs"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Quick Action Utility Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              {onOpenSearchModal && (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenSearchModal();
                  }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[9px] font-bold text-slate-800">Search</span>
                </button>
              )}

              {onOpenWhatsApp && (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenWhatsApp();
                  }}
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[9px] font-bold text-emerald-950">WhatsApp</span>
                </button>
              )}

              {onOpenEmailInbox && (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenEmailInbox();
                  }}
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-700" />
                  <span className="text-[9px] font-bold text-indigo-900">Emails</span>
                </button>
              )}
            </div>

            {/* Full Portal Modules List */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Portal Modules
              </div>

              <button
                onClick={() => handleSelectTab('home')}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs font-semibold transition-all ${
                  activeTab === 'home'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-slate-500" />
                  <span>Overview & Metrics</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleSelectTab('ondc-gem')}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs font-semibold transition-all ${
                  activeTab === 'ondc-gem'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Network className="w-4 h-4 text-emerald-600" />
                  <span>ONDC B2B & GeM Protocol Gateway</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  B2B Node
                </span>
              </button>

              <button
                onClick={() => handleSelectTab('treds')}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs font-semibold transition-all ${
                  activeTab === 'treds'
                    ? 'bg-amber-50 text-amber-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>TReDS MSME Invoice Factoring & Early Liquidity</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                  T+0 Payout
                </span>
              </button>

              <button
                onClick={() => handleSelectTab('finance')}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs font-semibold transition-all ${
                  activeTab === 'finance'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  <span>Autonomous 3-Way Reconciliation Ledger</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  Track 4
                </span>
              </button>

              <button
                onClick={() => handleSelectTab('compliance')}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs font-semibold transition-all ${
                  activeTab === 'compliance'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Statutory Compliance & Legal Ledger Hub</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  6/6 Live
                </span>
              </button>

              <button
                onClick={() => handleSelectTab('submission-kit')}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs font-semibold transition-all ${
                  activeTab === 'submission-kit'
                    ? 'bg-amber-50 text-amber-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Hackathon Submission Kit & Docs</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Navigation Bar for Mobile & Tablet (below lg breakpoint) */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-150 cursor-pointer min-w-[56px] ${
                  isActive
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {/* Active Indicator Top Pill */}
                {isActive && (
                  <span className="absolute -top-1 w-6 h-1 bg-indigo-600 rounded-full" />
                )}

                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  
                  {/* Pulsing Live Agent Dot */}
                  {item.isPulsing && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}

                  {/* Badge Counter */}
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span className="text-[10px] tracking-tight mt-1 truncate">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-150 cursor-pointer min-w-[56px] ${
              ['home', 'finance', 'submission-kit'].includes(activeTab) || isDrawerOpen
                ? 'text-indigo-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5" />
              {['home', 'finance', 'submission-kit'].includes(activeTab) && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
