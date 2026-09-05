import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  QrCode, 
  FileCheck2, 
  Printer, 
  Download, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Building2, 
  BadgeCheck, 
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  Barcode
} from 'lucide-react';
import { Transaction } from '../types';

interface EWayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const EWayBillModal: React.FC<EWayBillModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  const billNo = transaction.bill_no;
  const ewbNumber = `3410${Math.abs(hashString(billNo)).toString().slice(0, 8)}9102`;
  const ewbDate = new Date(transaction.created_at || Date.now());
  const validUntilDate = new Date(ewbDate.getTime() + 48 * 60 * 60 * 1000); // 48 Hours validity

  // HSN & Product classification
  const hsnCode = '1006.30.90';
  const vehicleNo = 'HR-02-AX-8941';
  const transporterName = 'VRL B2B Logistics & Supply Chain Pvt Ltd';
  const transporterGstin = '06AABCV9912K1Z9';
  const approxDistanceKm = 340;
  const dispatchState = '06 - Haryana';
  const deliveryState = '19 - West Bengal';

  const [activeSubView, setActiveSubView] = useState<'official_form' | 'qr_scanner_view'>('official_form');
  const [copiedEwb, setCopiedEwb] = useState(false);

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

  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const ewbData = {
      ewbNo: ewbNumber,
      ewbDate: ewbDate.toISOString(),
      validUntil: validUntilDate.toISOString(),
      supplyType: 'Outward - Sub-Supply (Autonomous B2B Clearance)',
      docType: 'Tax Invoice',
      docNo: transaction.bill_no,
      docDate: transaction.created_at.split('T')[0],
      fromGstin: transaction.invoice_data?.seller?.gstin || '07AAACA1234A1Z5',
      fromTrdName: transaction.invoice_data?.seller?.business_name || 'AgriHub Super Grains Pvt Ltd',
      fromAddr: transaction.invoice_data?.seller?.address || 'Plot 42, APMC Grain Complex, Karnal, Haryana',
      toGstin: transaction.invoice_data?.buyer?.gstin || '19AAECB7788J1ZR',
      toTrdName: transaction.invoice_data?.buyer?.business_name || 'Commercial Enterprise Ltd',
      toAddr: transaction.invoice_data?.buyer?.address || '14 Park Street, Kolkata, West Bengal',
      totalValue: transaction.base_amount,
      cgstValue: transaction.gst_amount / 2,
      sgstValue: transaction.gst_amount / 2,
      totInvValue: transaction.total_amount,
      transporterId: transporterGstin,
      transporterName: transporterName,
      vehicleNo: vehicleNo,
      hsnCode: hsnCode,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(ewbData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `eWayBill_Form_GST_EWB_01_${ewbNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ewaybill-modal-title"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh] cursor-default relative"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-md">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ewaybill-modal-title" className="font-bold text-base tracking-tight text-white">National e-Way Bill Inspector</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  FORM GST EWB-01
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span>Rule 138 of CGST Rules, 2017 • Autonomous Transit Clearance</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveSubView('official_form')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  activeSubView === 'official_form' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Official Form
              </button>
              <button
                type="button"
                onClick={() => setActiveSubView('qr_scanner_view')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  activeSubView === 'qr_scanner_view' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Gate Pass QR
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadJSON}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-slate-700"
              title="Download NIC Government JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              title="Print Gate Pass"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Dedicated Upper-Corner Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 rounded-lg transition-all cursor-pointer ml-1"
              title="Close e-Way Bill (Esc)"
              aria-label="Close e-Way Bill"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {activeSubView === 'official_form' ? (
            <div className="bg-white rounded-xl border border-slate-300 shadow-xs p-6 space-y-6 text-slate-900 text-xs font-sans">
              {/* Official Heading */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Government of India</span>
                    <h4 className="text-base font-black text-slate-900 uppercase">Goods and Services Tax Portal</h4>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      GENERATED & ACTIVE
                    </span>
                  </div>
                </div>
                <div className="bg-slate-900 text-white py-1.5 rounded mt-2 font-bold tracking-wider text-xs">
                  FORM GST EWB-01 (e-Way Bill for Movement of Goods)
                </div>
              </div>

              {/* Top Key Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">e-Way Bill No.</span>
                  <p className="font-mono font-bold text-indigo-900 text-xs sm:text-sm">{ewbNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Generated Date</span>
                  <p className="font-semibold text-slate-800">{ewbDate.toLocaleDateString('en-IN')} {ewbDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Valid Until</span>
                  <p className="font-bold text-emerald-700">{validUntilDate.toLocaleDateString('en-IN')} 23:59 IST</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Transit Distance</span>
                  <p className="font-mono font-bold text-slate-800">{approxDistanceKm} KMs (Approx)</p>
                </div>
              </div>

              {/* PART-A: Transaction & Commodity Details */}
              <div className="space-y-3">
                <div className="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>PART-A: Details of Consignment & Parties</span>
                  <span className="text-[10px] font-mono text-slate-300">Section 31 CGST</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">From (Supplier / Consignor)</span>
                    <p className="font-bold text-slate-900">{transaction.invoice_data?.seller?.business_name || 'AgriHub Super Grains Pvt Ltd'}</p>
                    <p className="text-slate-600">{transaction.invoice_data?.seller?.address || 'Plot 42, APMC Grain Complex, Karnal, Haryana'}</p>
                    <p className="font-mono font-semibold text-slate-800">GSTIN: {transaction.invoice_data?.seller?.gstin || '07AAACA1234A1Z5'}</p>
                    <p className="text-[11px] text-slate-500">Dispatch State: {dispatchState}</p>
                  </div>

                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">To (Recipient / Consignee)</span>
                    <p className="font-bold text-slate-900">{transaction.invoice_data?.buyer?.business_name || 'Commercial Enterprise Ltd'}</p>
                    <p className="text-slate-600">{transaction.invoice_data?.buyer?.address || '14 Park Street, Kolkata, West Bengal'}</p>
                    <p className="font-mono font-semibold text-slate-800">GSTIN: {transaction.invoice_data?.buyer?.gstin || '19AAECB7788J1ZR'}</p>
                    <p className="text-[11px] text-slate-500">Delivery State: {deliveryState}</p>
                  </div>
                </div>

                {/* Items & Tax breakdown */}
                <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">HSN Code</th>
                      <th className="p-2.5">Product Description</th>
                      <th className="p-2.5 text-right">Quantity</th>
                      <th className="p-2.5 text-right">Taxable Amt (₹)</th>
                      <th className="p-2.5 text-right">GST Rate</th>
                      <th className="p-2.5 text-right">Total Inv Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="divide-x divide-slate-200">
                      <td className="p-2.5 font-mono">{hsnCode}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{transaction.product_name}</td>
                      <td className="p-2.5 text-right font-mono">{transaction.quantity} units</td>
                      <td className="p-2.5 text-right font-mono">₹{transaction.base_amount.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono">{transaction.gst_percent}%</td>
                      <td className="p-2.5 text-right font-mono font-bold text-indigo-900">
                        ₹{transaction.total_amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* PART-B: Vehicle & Transporter Details */}
              <div className="space-y-3">
                <div className="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>PART-B: Vehicle & Transport Details</span>
                  <span className="text-[10px] font-mono text-emerald-400">GPS Tracked</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Transporter Name</span>
                    <p className="font-semibold text-slate-900">{transporterName}</p>
                    <p className="text-[11px] font-mono text-slate-500">ID: {transporterGstin}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Vehicle Registration No</span>
                    <p className="font-mono font-bold text-indigo-900 text-sm">{vehicleNo}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">Fastag RFID Tag Active</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Consignment Doc No</span>
                    <p className="font-mono text-slate-800 font-semibold">LR-2026-90412</p>
                    <p className="text-[10px] text-slate-500">Invoice: {transaction.bill_no}</p>
                  </div>
                </div>
              </div>

              {/* Verification Stamp & QR Code footer */}
              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-300 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-900 text-white p-1 rounded-lg flex flex-col items-center justify-center shrink-0">
                    <QrCode className="w-14 h-14 text-white" />
                    <span className="text-[7px] text-slate-300 font-mono tracking-tighter">NIC-SECURE</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Digital Signature Digest</span>
                    <p className="font-mono text-[9px] text-slate-600 max-w-xs break-all">
                      SHA256: 4f88e1a90c2b7405e6790ad9834cc7156ae2901c80b{ewbNumber}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified by National Informatics Centre (NIC) e-Way Bill System</span>
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="border border-slate-300 rounded p-2 bg-slate-50 inline-block text-left">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Auto-Cleared by:</span>
                    <span className="font-bold text-xs text-indigo-900">Agent Bazar Autonomous Engine</span>
                    <span className="text-[10px] text-slate-500 block">Smart Escrow Release on Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* QR Scanner & Gate Pass Check-in Inspector View */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                  <QrCode className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Official Toll & Gate Pass Digital Barcode</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Present this authenticated 2D QR code at state GST checkpoints, APMC gates, or warehouse intake bays.
                </p>
              </div>

              {/* Giant QR Canvas Mockup */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-sm mx-auto flex flex-col items-center space-y-4 shadow-xl border border-indigo-500/30">
                <div className="bg-white p-3 rounded-xl shadow-inner">
                  <div className="w-48 h-48 bg-slate-950 flex flex-col items-center justify-center p-2 rounded-lg relative overflow-hidden">
                    <QrCode className="w-40 h-40 text-slate-100" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent animate-pulse pointer-events-none" />
                  </div>
                </div>

                <div className="text-center space-y-1 w-full">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">e-Way Bill No</span>
                  <p className="font-mono font-black text-lg text-amber-400 tracking-wider">{ewbNumber}</p>
                  <p className="text-[11px] text-slate-300">Vehicle: <strong className="text-white font-mono">{vehicleNo}</strong></p>
                </div>

                <div className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Commodity:</span>
                    <span className="font-semibold text-slate-200">{transaction.product_name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Consignment Value:</span>
                    <span className="font-bold text-emerald-400 font-mono">₹{transaction.total_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax Status:</span>
                    <span className="text-emerald-300 font-bold uppercase">{transaction.payment_status}</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Gate Pass Physical Slip</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3.5 flex items-center justify-between gap-3 text-white no-print">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span>NIC e-Way Bill Active • Valid for Inter-State Transit</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
            >
              <X className="w-4 h-4" />
              <span>Close Gate Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
