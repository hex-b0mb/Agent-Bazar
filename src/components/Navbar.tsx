import React, { useEffect, useState } from 'react';
import { UserRole } from '../types';
import { 
  Bot, 
  Store, 
  ShoppingBag, 
  ScrollText, 
  Sparkles, 
  ShieldCheck, 
  IndianRupee,
  Gavel,
  Building2,
  Lock,
  LogOut,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  Search,
  Mail,
  MessageSquare,
  Network,
  Play,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, APP_LANGUAGES } from '../context/LanguageContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  onOpenSearchModal?: () => void;
  onOpenEmailInbox?: () => void;
  onOpenWhatsApp?: () => void;
  onLaunchDemo?: () => void;
  onOpenJudgeTour?: () => void;
  isNegotiating?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  onOpenSearchModal,
  onOpenEmailInbox,
  onOpenWhatsApp,
  onLaunchDemo,
  onOpenJudgeTour,
  isNegotiating = false,
}) => {
  const { user, isAuthenticated, logout, setIsAuthModalOpen, setIsOnboardingModalOpen } = useAuth();
  const { language, setLanguage, t, activeLanguageConfig } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Global hotkey ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearchModal?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearchModal]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('home')}
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
              <span className="font-extrabold text-base tracking-tighter">AB</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">Agent Bazar</h1>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold hidden md:block">
                Autonomous Commerce Engine
              </p>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
            <button
              id="nav-home"
              onClick={() => setActiveTab('home')}
              className={`text-sm font-medium transition-colors py-5 border-b-2 ${
                activeTab === 'home'
                  ? 'text-indigo-600 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 border-transparent'
              }`}
            >
              Overview
            </button>

            <button
              id="nav-live-arena"
              onClick={() => setActiveTab('arena')}
              className={`text-sm font-medium transition-colors py-5 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'arena'
                  ? 'text-indigo-600 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 border-transparent'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Live Arena</span>
              {isNegotiating && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </button>

            <button
              id="nav-buyer-dashboard"
              onClick={() => setActiveTab('buyer')}
              className={`text-sm font-medium transition-colors py-5 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'buyer'
                  ? 'text-indigo-600 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 border-transparent'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buyer Hub</span>
            </button>

            <button
              id="nav-seller-dashboard"
              onClick={() => setActiveTab('seller')}
              className={`text-sm font-medium transition-colors py-5 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'seller'
                  ? 'text-indigo-600 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 border-transparent'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Seller Hub</span>
            </button>

            <button
              id="nav-vault"
              onClick={() => setActiveTab('vault')}
              className={`text-sm font-medium transition-colors py-5 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'vault'
                  ? 'text-indigo-600 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 border-transparent'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              <span>Invoices Vault</span>
            </button>

            <button
              id="nav-finance-reconciliation"
              onClick={() => setActiveTab('finance')}
              className={`text-sm font-medium transition-colors py-5 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'finance'
                  ? 'text-indigo-600 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 border-transparent'
              }`}
            >
              <IndianRupee className="w-4 h-4" />
              <span>3-Way Recon</span>
            </button>

            <button
              id="nav-submission-kit"
              onClick={() => setActiveTab('submission-kit')}
              className={`text-sm font-medium transition-colors py-5 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'submission-kit'
                  ? 'text-indigo-700 border-indigo-600 font-bold'
                  : 'text-indigo-600 hover:text-indigo-700 border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Submission Kit</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
                All Tools
              </span>
            </button>
          </nav>

          {/* Right Controls: Language, Search, Voice, Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Multilingual Dialect Switcher Dropdown */}
            <div className="relative">
              <button
                id="lang-select-btn"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Switch Language / Dialect"
              >
                <span>{activeLanguageConfig.flag}</span>
                <span className="hidden sm:inline font-semibold">{activeLanguageConfig.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Select Mandi Dialect
                  </div>
                  {APP_LANGUAGES.map((langOpt) => (
                    <button
                      key={langOpt.code}
                      onClick={() => {
                        setLanguage(langOpt.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        language === langOpt.code
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{langOpt.flag}</span>
                        <div>
                          <div>{langOpt.nativeName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{langOpt.name}</div>
                        </div>
                      </div>
                      {language === langOpt.code && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Global Search Trigger */}
            <button
              id="nav-global-search-btn"
              onClick={onOpenSearchModal}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/90 hover:text-slate-900 border border-slate-200 rounded-xl transition-all cursor-pointer group shadow-2xs"
              title="Search products, invoices, and businesses (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
              <span className="truncate">Search</span>
              <kbd className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-white border border-slate-200 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Authenticated User Pill or Sign In Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-all cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                      <span>{user.name.split(' ')[0]}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium capitalize truncate max-w-[150px]">
                      {user.trade_category === 'wholesaler_godown' && `🏬 Godown (${user.wholesaler_details?.godown_capacity_mt || 'Wholesale'})`}
                      {user.trade_category === 'mandi_stall' && `🌾 ${user.mandi_details?.stall_gala_number || 'Mandi Stall'}`}
                      {user.trade_category === 'broker_commission' && `🤝 Broker (${user.broker_details?.commission_rate_percent || '1.5'}%)`}
                      {user.trade_category === 'buyer_enterprise' && `🛒 Mill (${user.buyer_details?.monthly_procurement_mt || 'Buyer'})`}
                      {!user.trade_category && `${user.role} • Verified`}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-black text-slate-900">{user.name}</div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          KYC Active
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email} • {user.phone}</div>
                      <div className="mt-1.5 text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded w-fit truncate max-w-full">
                        {user.business_name}
                      </div>

                      {/* Role-Specific Mini Details */}
                      <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-600 space-y-0.5">
                        {user.trade_category === 'wholesaler_godown' && (
                          <>
                            <div><span className="font-semibold">Godown:</span> {user.wholesaler_details?.godown_address || user.address}</div>
                            <div><span className="font-semibold">Capacity:</span> {user.wholesaler_details?.godown_capacity_mt}</div>
                          </>
                        )}
                        {user.trade_category === 'mandi_stall' && (
                          <>
                            <div><span className="font-semibold">Yard:</span> {user.mandi_details?.mandi_name}</div>
                            <div><span className="font-semibold">Location:</span> {user.mandi_details?.stall_gala_number} ({user.mandi_details?.mandi_gate_number})</div>
                          </>
                        )}
                        {user.trade_category === 'broker_commission' && (
                          <>
                            <div><span className="font-semibold">License:</span> {user.broker_details?.broker_license_number}</div>
                            <div><span className="font-semibold">Commission:</span> {user.broker_details?.commission_rate_percent}% • UPI: {user.broker_details?.upi_id}</div>
                          </>
                        )}
                        {user.trade_category === 'buyer_enterprise' && (
                          <>
                            <div><span className="font-semibold">Intake Mill:</span> {user.buyer_details?.factory_godown_address || user.address}</div>
                            <div><span className="font-semibold">Target:</span> {user.buyer_details?.monthly_procurement_mt}</div>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsOnboardingModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-xs text-left text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Edit Facility Profile, Stall / Godown</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-xs text-left text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                      <span>Switch Enterprise Role</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-100 gap-2 no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'home' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-100 text-slate-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'arena' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-100 text-slate-700'}`}
          >
            Live Arena
          </button>
          <button
            onClick={() => setActiveTab('buyer')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'buyer' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-100 text-slate-700'}`}
          >
            Buyer View
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'seller' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-100 text-slate-700'}`}
          >
            Seller Hub
          </button>
          <button
            onClick={() => setActiveTab('auctions')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'auctions' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-100 text-slate-700'}`}
          >
            Auctions & RFQs
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'finance' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-100 text-slate-700'}`}
          >
            3-Way Recon
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'vault' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-100 text-slate-700'}`}
          >
            Vault
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1 ${activeTab === 'compliance' ? 'bg-emerald-600 text-white font-medium' : 'bg-slate-100 text-slate-700'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Compliance 6/6</span>
          </button>
          <button
            onClick={() => setActiveTab('ondc-gem')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1 ${activeTab === 'ondc-gem' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-100 text-slate-700'}`}
          >
            <Network className="w-3.5 h-3.5 text-emerald-500" />
            <span>ONDC & GeM</span>
          </button>
          <button
            onClick={() => setActiveTab('treds')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1 ${activeTab === 'treds' ? 'bg-amber-600 text-white font-medium' : 'bg-slate-100 text-slate-700'}`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>TReDS Factoring</span>
          </button>
          <button
            onClick={() => setActiveTab('submission-kit')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'submission-kit' ? 'bg-amber-600 text-white font-medium' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}
          >
            Submission Kit
          </button>
        </div>
      </div>
    </header>
  );
};
