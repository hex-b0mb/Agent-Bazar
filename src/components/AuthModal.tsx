import React from 'react';
import { 
  ShieldCheck, 
  X, 
  UserCheck, 
  Store, 
  Sparkles, 
  Lock, 
  Building2, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    loginWithGoogle, 
    loginAsDemo, 
    isLoading,
    isSupabaseConnected 
  } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-indigo-300" />
          </div>

          <h3 className="text-lg font-bold tracking-tight">
            Enterprise Authentication
          </h3>
          <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
            Securely authenticate to authorize autonomous AI negotiations, sign B2B purchase orders, and generate Section 31 GST tax invoices.
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Supabase Auth & Google OAuth Secured</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Google OAuth Button */}
          <button
            onClick={loginWithGoogle}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs shadow-xs hover:shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99]"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google OAuth</span>
          </button>
          
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium bg-slate-50 border border-slate-100 py-1.5 px-2 rounded-lg">
            <Building2 className="w-3 h-3 text-indigo-500" />
            <span>New accounts complete required GSTIN & Business Onboarding</span>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider shrink-0">
              Or Fast Enterprise Sign-in
            </span>
          </div>

          {/* Quick Verified Profiles */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => loginAsDemo('buyer')}
              className="p-3 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
                <UserCheck className="w-4 h-4" />
                <span>Verified Buyer</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                Sharma Agro Foods (GSTIN: 07AAACS1429B1Z8)
              </p>
            </button>

            <button
              onClick={() => loginAsDemo('seller')}
              className="p-3 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
                <Store className="w-4 h-4" />
                <span>Verified Merchant</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                AgriHub Super Grains (GSTIN: 07AAACA1234A1Z5)
              </p>
            </button>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 text-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>256-Bit Encrypted B2B Token Clearance</span>
          </div>
        </div>
      </div>
    </div>
  );
};
