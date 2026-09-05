import React from 'react';
import { 
  Bot, 
  Store, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  ReceiptText, 
  CreditCard, 
  Cpu, 
  TrendingUp, 
  CheckCircle2, 
  IndianRupee,
  MessageSquare,
  Network,
  Banknote
} from 'lucide-react';
import { DEMO_PRESETS } from '../data/seedData';
import { PlatformMetrics, UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HomeProps {
  onSelectPreset: (presetId: string) => void;
  onNavigate: (tab: string) => void;
  setActiveRole: (role: UserRole) => void;
  metrics: PlatformMetrics;
}

export const Home: React.FC<HomeProps> = ({
  onSelectPreset,
  onNavigate,
  setActiveRole,
  metrics,
}) => {
  const { t, activeLanguageConfig } = useLanguage();
  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 lg:p-14 border border-slate-800 shadow-2xl">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Razorpay AI Builder Internship 2026 • Track 1: AI Growth & Agentic Commerce</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15]">
            India's First <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">AI-to-AI Autonomous</span> Commerce Platform
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Zero human clicks from procurement intent to Razorpay payment settlement. AI Buyer Agents and AI Seller Agents autonomously negotiate prices within strict mathematical boundaries, generate GST-compliant invoices, and maintain an immutable audit trail.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-buyer-btn"
              onClick={() => {
                setActiveRole('buyer');
                onNavigate('buyer');
              }}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buyer Hub — Submit Intent</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-seller-btn"
              onClick={() => {
                setActiveRole('seller');
                onNavigate('seller');
              }}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
            >
              <Store className="w-4 h-4 text-indigo-400" />
              <span>Seller Hub — Catalog & Margins</span>
            </button>

            <button
              id="hero-submission-btn"
              onClick={() => onNavigate('submission-kit')}
              className="px-5 py-3 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 active:scale-98 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Submission Kit & Tool Suite</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                All Tools
              </span>
            </button>
          </div>

          {/* Value Props Badges */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bounded Fiduciary Limits</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Razorpay Test Autopay</span>
            </div>
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-sky-400 shrink-0" />
              <span>GST Tax Invoices</span>
            </div>
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ONDC & GeM Gateway</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
              <span>5 Rounds SLA Protocol</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Platform Metrics Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Platform Performance & Settlement Metrics</h2>
            <p className="text-xs text-slate-500">Autonomous multi-agent protocol settlement efficacy</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-700 uppercase">Live Network</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight block">Negotiations</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900">{metrics.totalNegotiations}</span>
              <span className="text-[10px] text-emerald-600 font-bold">Deals</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight block">Success Rate</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900">{metrics.dealSuccessRate}%</span>
              <span className="text-[10px] text-emerald-600 font-bold">settled</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight block">Avg Rounds</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900">{metrics.averageRounds}</span>
              <span className="text-[10px] text-slate-400 font-medium">/ 5 max</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight block">Live Volume</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900">₹{(metrics.totalGMV / 1000).toFixed(1)}k</span>
              <span className="text-[10px] text-slate-400 font-medium">INR</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight block">Avg Discount</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900">{metrics.averageDiscountPercent}%</span>
              <span className="text-[10px] text-emerald-600 font-bold">saved</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight block">Total GST</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900">₹{(metrics.totalGSTProcessed / 1000).toFixed(1)}k</span>
              <span className="text-[10px] text-slate-400 font-medium">ITC</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Interactive Process Architecture */}
      <section className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Autonomous Workflow</span>
          <h3 className="text-xl font-bold text-slate-900">Protocol: Request to Razorpay Settlement</h3>
          <p className="text-xs text-slate-500">Autonomous execution under mathematical constraints.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-slate-50/70 rounded-xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-slate-900">1. Natural Language Procurement Intent</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Buyer inputs prompt in natural language or Hinglish (e.g. <em>"Need 50kg basmati rice under ₹80/kg in 3 days"</em>). Buyer AI Agent extracts specs, volume, and calculates landed budget caps.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50/70 rounded-xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-slate-900">2. Autonomous AI-to-AI Multi-Round Bidding</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Buyer Agent and Seller Agent exchange counter-offers up to 5 rounds. Seller Agent mathematically enforces minimum confidential margins (min_price), while Buyer Agent ensures total landed cost stays within budget.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50/70 rounded-xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-slate-900">3. Razorpay Autopay & GST Tax Invoice</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consensus instantly triggers Razorpay Test Mode Payment link, updates payment status, logs every single agent decision to the cryptographic audit trail, and generates an official Indian GST Tax Invoice.
            </p>
          </div>
        </div>
      </section>

      {/* Evaluation Scenarios */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Interactive Evaluation Scenarios (Click to Launch)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pre-configured commercial scenarios showcasing autonomous price convergence, GST calculations, and Razorpay triggers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className="bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md p-5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors block">
                  {preset.title}
                </span>
                <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-[11px]">
                  "{preset.prompt}"
                </p>
                <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Budget Target:</span>
                    <span className="font-bold text-slate-800">₹{preset.max_budget}/unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Quantity:</span>
                    <span className="font-bold text-slate-800">{preset.quantity} units</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                <span>Run Autonomous Flow</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
