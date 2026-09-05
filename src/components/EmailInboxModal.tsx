import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  X, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Building2, 
  User, 
  Send, 
  Eye, 
  ShieldCheck, 
  FileText,
  Trash2,
  Check
} from 'lucide-react';
import { MockEmailService, EmailMessage } from '../services/emailService';

interface EmailInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterBillNo?: string;
}

export const EmailInboxModal: React.FC<EmailInboxModalProps> = ({
  isOpen,
  onClose,
  filterBillNo,
}) => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'buyer' | 'seller'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const all = MockEmailService.getSentEmails();
      if (filterBillNo) {
        const filtered = all.filter((e) => e.billNo === filterBillNo);
        setEmails(filtered.length > 0 ? filtered : all);
        if (filtered.length > 0) setSelectedEmail(filtered[0]);
        else if (all.length > 0) setSelectedEmail(all[0]);
      } else {
        setEmails(all);
        if (all.length > 0) setSelectedEmail(all[0]);
      }
    }
  }, [isOpen, filterBillNo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayEmails = emails.filter((e) => {
    if (filterType === 'buyer') return e.recipientType === 'buyer';
    if (filterType === 'seller') return e.recipientType === 'seller';
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    MockEmailService.clearEmails();
    setEmails([]);
    setSelectedEmail(null);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[700px] max-h-[90vh] cursor-default"
      >
        {/* Modal Top Bar */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Transactional Email Dispatch Hub</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  MOCK SMTP ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated payment receipts & dispatch notifications sent to Buyer & Seller counterparties
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {emails.length > 0 && (
              <button
                onClick={handleClear}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Clear mock dispatch log"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Log</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          {/* Left Column: Email List */}
          <div className="w-full md:w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
            {/* Filter Tabs */}
            <div className="p-3 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50/70">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                All ({emails.length})
              </button>
              <button
                onClick={() => setFilterType('buyer')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'buyer'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Buyer
              </button>
              <button
                onClick={() => setFilterType('seller')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'seller'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Seller
              </button>
            </div>

            {/* Email Items Scroll */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {displayEmails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Mail className="w-8 h-8 mx-auto text-slate-300 opacity-60" />
                  <p className="text-xs font-medium">No emails dispatched yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Pay any transaction to trigger live dual-party confirmations!
                  </p>
                </div>
              ) : (
                displayEmails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  const isBuyer = email.recipientType === 'buyer';
                  return (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-3.5 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                            isBuyer
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {email.recipientType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(email.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {email.recipientName}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {email.recipientEmail}
                      </p>
                      <p className="text-[11px] text-slate-700 font-medium truncate mt-1">
                        {email.subject}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Preview Pane */}
          <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Information */}
                <div className="bg-white p-4 border-b border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {selectedEmail.subject}
                    </h3>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Delivered</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400">To: </span>
                      <strong className="text-slate-900 font-medium">{selectedEmail.recipientName}</strong>{' '}
                      <span className="text-slate-500 font-mono text-[11px]">({selectedEmail.recipientEmail})</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Entity: </span>
                      <span className="text-slate-800 font-medium">{selectedEmail.businessName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Invoice Ref: </span>
                      <span className="text-indigo-700 font-bold font-mono">{selectedEmail.billNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Payment ID: </span>
                      <span className="text-slate-800 font-mono text-[11px]">{selectedEmail.paymentId}</span>
                    </div>
                  </div>
                </div>

                {/* Rendered HTML Preview */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="max-w-2xl mx-auto shadow-sm rounded-xl overflow-hidden bg-white">
                    <div 
                      dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Mail className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-600">Select an email to view preview</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Every time a deal is settled or paid on the platform, transactional confirmations are dispatched to both parties.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
