import React, { useState } from 'react';
import { 
  Network, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Globe2,
  Clock,
  Landmark
} from 'lucide-react';
import { Transaction } from '../types';

interface OndcGemProtocolHubProps {
  transactions?: Transaction[];
  onViewInvoice?: (tx: Transaction) => void;
  onNavigateToArena?: () => void;
  onStartLiveNegotiation?: () => void;
}

export const OndcGemProtocolHub: React.FC<OndcGemProtocolHubProps> = ({
  transactions = [],
  onViewInvoice,
  onNavigateToArena,
  onStartLiveNegotiation,
}) => {
  const [activeTab, setActiveTab] = useState<'gem_punchout' | 'interop_registry'>('gem_punchout');
  const [gemMinistry, setGemMinistry] = useState<'railways' | 'fci' | 'sail' | 'defence'>('railways');
  const [gemPoGenerated, setGemPoGenerated] = useState<string | null>(null);

  const handleGoToArena = onNavigateToArena || onStartLiveNegotiation;

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Network className="w-3.5 h-3.5" />
              <span>ONDC B2B & GeM v4.0 Gateway Certified</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>ONDC B2B & GeM Protocol Gateway</span>
              <span className="text-xs bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 px-2 py-0.5 rounded-md font-mono font-bold">
                Interoperable Node
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Seamless interoperability across India's Open Network for Digital Commerce (ONDC) B2B grid and the Government e-Marketplace (GeM). Enables direct public procurement, MSME statutory preference compliance, and decentralized buyer/seller node connectivity.
            </p>
          </div>

          {/* Quick Navigation CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab('gem_punchout')}
              className="px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Landmark className="w-4 h-4" />
              <span>GeM Punchout Engine</span>
            </button>

            {handleGoToArena && (
              <button
                onClick={handleGoToArena}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Live Negotiation Arena</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Protocol Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px]">ONDC B2B Spec</div>
              <div className="font-mono font-bold text-slate-200">v1.2.0 Compliant</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <Landmark className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px]">GeM v4.0 Compliance</div>
              <div className="font-mono font-bold text-slate-200">Rule 173(i) GFR Active</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px]">MSME Preference</div>
              <div className="font-mono font-bold text-slate-200">25% Quota Auto-Mapped</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px]">Gateway Latency</div>
              <div className="font-mono font-bold text-slate-200">&lt; 38 ms Round-Trip</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Module Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-bold">
        <button
          onClick={() => setActiveTab('gem_punchout')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'gem_punchout'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>GeM (Government e-Marketplace) Punchout Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('interop_registry')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'interop_registry'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>ONDC Network BAP / BPP Node Registry</span>
        </button>
      </div>

      {/* TAB 1: GeM (Government e-Marketplace) Punchout Engine */}
      {activeTab === 'gem_punchout' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-600" />
                  <span>GeM Direct Purchase & L1 Reverse Match Engine</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory adherence to Public Procurement Policy for MSEs Order & Rule 173(i) of General Financial Rules (GFR) 2017.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Select Public Sector Buyer:</span>
                <select
                  value={gemMinistry}
                  onChange={(e) => setGemMinistry(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
                >
                  <option value="railways">Indian Railways (Northern Zone Rail Godown)</option>
                  <option value="fci">Food Corporation of India (FCI Depot #22)</option>
                  <option value="sail">Steel Authority of India Ltd (SAIL Durgapur)</option>
                  <option value="defence">Defence Canteen Stores Dept (CSD Logistics)</option>
                </select>
              </div>
            </div>

            {/* GeM Statutory Exemption Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>25% MSME Mandatory Quota</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-snug">
                  4% allocated to SC/ST entrepreneurs, 3% to Women MSEs. Automatic preferential price band of L1 + 15%.
                </p>
              </div>

              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 space-y-1">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Prior Turnover Exemption</span>
                </div>
                <p className="text-[11px] text-indigo-700 leading-snug">
                  Exempted under Rule 173(i) GFR 2017 for DPIIT-recognized verified suppliers meeting quality specs.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>Earnest Money Deposit (EMD) Waiver</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-snug">
                  100% EMD fee exemption backed by autonomous Razorpay smart escrow contract guarantees.
                </p>
              </div>
            </div>

            {/* Direct GeM PO Generator Simulation */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">GeM Direct Purchase Contract Generation</h4>
                  <p className="text-xs text-slate-500">Autonomous L1 Price Matching for 20 MT Basmati Rice (Grade-A)</p>
                </div>

                <button
                  onClick={() => setGemPoGenerated(`GEM-PO-${Date.now().toString().slice(-6)}`)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute GeM Punchout & Issue PO</span>
                </button>
              </div>

              {gemPoGenerated && (
                <div className="p-4 bg-white rounded-xl border border-emerald-300 shadow-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>GeM Statutory Purchase Order Issued Successfully</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      PO #{gemPoGenerated}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Contract locked with CPSE Buyer Department (<strong>{gemMinistry.toUpperCase()}</strong>) at L1 rate of ₹48,500/MT. Razorpay smart escrow holding 20% advance with automated PFMS (Public Financial Management System) disbursement.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Network Interoperability Registry */}
      {activeTab === 'interop_registry' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-indigo-600" />
              <span>ONDC Network BAP & BPP Participant Registry</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live peer-to-peer interoperability routing table across Indian commodity hubs and B2B seller applications.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-3">Participant Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Subscriber ID</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">KYC / GSTIN</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr className="hover:bg-indigo-50/40 transition-colors font-sans">
                  <td className="p-3 font-bold text-slate-900">Agent Bazar Autonomous Engine</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono font-bold text-[10px]">BAP (Buyer App)</span></td>
                  <td className="p-3 text-slate-600 font-mono">bap.agentbazar.in</td>
                  <td className="p-3 text-slate-600">nic2004:52110 (Agro / Steel)</td>
                  <td className="p-3 text-emerald-700 font-bold">19AAACB4412M1Z5</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">ONLINE (Node 1)</span></td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors font-sans">
                  <td className="p-3 font-bold text-slate-900">AgriHub Mandi Super Grains</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-mono font-bold text-[10px]">BPP (Seller App)</span></td>
                  <td className="p-3 text-slate-600 font-mono">bpp.agrihubmandi.ondc.in</td>
                  <td className="p-3 text-slate-600">Agriculture & Mandi Grains</td>
                  <td className="p-3 text-emerald-700 font-bold">07AABCU9603R1ZM</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">ONLINE</span></td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors font-sans">
                  <td className="p-3 font-bold text-slate-900">Tata Steel Industrial BPP</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-mono font-bold text-[10px]">BPP (Seller App)</span></td>
                  <td className="p-3 text-slate-600 font-mono">bpp.tatasteel.ondc.in</td>
                  <td className="p-3 text-slate-600">Metals, Billets & Rebar</td>
                  <td className="p-3 text-emerald-700 font-bold">27AAACT2727Q1ZW</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">ONLINE</span></td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors font-sans">
                  <td className="p-3 font-bold text-slate-900">Delhivery Fastag Logistics</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono font-bold text-[10px]">BPP (Logistics LSP)</span></td>
                  <td className="p-3 text-slate-600 font-mono">lsp.delhivery.ondc.in</td>
                  <td className="p-3 text-slate-600">Interstate Freight / Fastag</td>
                  <td className="p-3 text-emerald-700 font-bold">06AAACD9914L1Z2</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">ONLINE</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
