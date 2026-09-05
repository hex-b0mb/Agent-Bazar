import React from 'react';
import { AgentAction } from '../types';
import { 
  ShieldCheck, 
  Clock, 
  Activity 
} from 'lucide-react';

interface AuditTrailViewerProps {
  actions: AgentAction[];
  title?: string;
  maxHeight?: string;
}

export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({
  actions,
  title = 'System Audit Trail',
  maxHeight = 'max-h-[520px]',
}) => {
  if (!actions || actions.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 text-center text-slate-400 text-xs shadow-xl">
        <Clock className="w-6 h-6 text-slate-600 mx-auto mb-2" />
        <p className="font-mono text-[11px]">System Audit Trail Initialized. Awaiting agent activity...</p>
      </div>
    );
  }

  const getActionColor = (type: string, by: string) => {
    if (by === 'system') {
      if (type === 'payment_success' || type === 'deal_agreed' || type === 'invoice_generated') {
        return 'text-emerald-400';
      }
      return 'text-indigo-400';
    }
    if (by === 'buyer_agent') {
      if (type === 'accept') return 'text-emerald-400';
      return 'text-slate-300';
    }
    if (by === 'seller_agent') {
      if (type === 'accept') return 'text-emerald-400';
      if (type === 'counter') return 'text-amber-400';
      if (type === 'reject') return 'text-rose-400';
      return 'text-blue-400';
    }
    return 'text-slate-400';
  };

  return (
    <section className="bg-slate-900 rounded-xl overflow-hidden flex flex-col shadow-2xl border border-slate-800">
      {/* Terminal Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h2 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-mono">
            {title}
          </h2>
        </div>
        <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
          {actions.length} Events
        </span>
      </div>

      {/* Terminal Log Stream */}
      <div className={`p-4 font-mono text-[11px] space-y-2.5 overflow-y-auto ${maxHeight} text-slate-300`}>
        {actions.map((act, index) => {
          const colorClass = getActionColor(act.action_type, act.action_by);
          const timeString = act.timestamp 
            ? new Date(act.timestamp).toTimeString().split(' ')[0] 
            : '14:20:00';
          
          let prefix = 'SYSTEM';
          if (act.action_by === 'buyer_agent') prefix = 'BUYER';
          if (act.action_by === 'seller_agent') prefix = 'SELLER';
          if (act.action_type === 'search') prefix = 'SEARCH';
          if (act.action_type === 'payment_success') prefix = 'RAZORPAY';

          return (
            <div key={act.id || index} className="leading-relaxed border-l border-slate-800 pl-2 ml-0.5">
              <span className="text-slate-500 text-[10px]">[{timeString}] </span>
              <span className={`font-bold ${colorClass}`}>{prefix}: </span>
              <span className={colorClass}>
                {act.details?.message || `${act.action_type.replace('_', ' ').toUpperCase()} ${act.price ? `₹${act.price}/unit` : ''}`}
              </span>
              {act.details?.reason && (
                <div className="text-[10px] text-slate-500 pl-3 italic mt-0.5">
                  ↳ policy: {act.details.reason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Terminal Latency Footer */}
      <div className="p-3.5 bg-slate-800/60 border-t border-slate-800">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">Protocol Latency</span>
          <span className="text-emerald-400 text-[10px] font-bold font-mono">240ms SLA</span>
        </div>
        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full w-4/5 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};
