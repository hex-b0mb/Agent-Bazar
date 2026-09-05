import React, { useState } from 'react';
import { Product, Transaction, AgentAction } from '../types';
import { 
  Store, 
  Plus, 
  Package, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Lock, 
  IndianRupee, 
  Truck, 
  AlertCircle, 
  Eye, 
  ReceiptText 
} from 'lucide-react';
import { AuditTrailViewer } from '../components/AuditTrailViewer';
import { SellerPerformanceAnalytics } from '../components/SellerPerformanceAnalytics';

interface SellerDashboardProps {
  products: Product[];
  transactions: Transaction[];
  agentActions: AgentAction[];
  onAddProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  onToggleProductActive: (id: string) => void;
  onViewInvoice: (tx: Transaction) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  products,
  transactions,
  agentActions,
  onAddProduct,
  onToggleProductActive,
  onViewInvoice,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Agricultural Commodities');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number | ''>(85);
  const [minPrice, setMinPrice] = useState<number | ''>(75);
  const [stock, setStock] = useState<number | ''>(1000);
  const [gstPercent, setGstPercent] = useState<number>(5.0);
  const [transportCharge, setTransportCharge] = useState<number>(200);
  const [deliveryDays, setDeliveryDays] = useState<number>(3);
  const [unit, setUnit] = useState('kg');

  const sellerActions = agentActions.filter((a) => a.action_by === 'seller_agent');
  const totalRevenue = transactions.reduce((acc, t) => acc + (t.payment_status === 'paid' ? t.base_amount : 0), 0);
  const totalGST = transactions.reduce((acc, t) => acc + (t.payment_status === 'paid' ? t.gst_amount : 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePrice || !minPrice || !stock) return;

    if (Number(minPrice) > Number(basePrice)) {
      alert('Minimum floor price cannot be higher than base price.');
      return;
    }

    onAddProduct({
      seller_id: 'usr-seller-1',
      seller_name: 'Rajesh Sharma',
      seller_business: 'AgriHub Super Grains Pvt Ltd',
      seller_gstin: '07AAACA1234A1Z5',
      name,
      category,
      description,
      base_price: Number(basePrice),
      min_price: Number(minPrice),
      stock: Number(stock),
      gst_percent: Number(gstPercent),
      transport_charge: Number(transportCharge),
      delivery_days: Number(deliveryDays),
      is_active: true,
      unit,
    });

    // Reset Form
    setName('');
    setDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Merchant Hub & Inventory Rules</h2>
            <p className="text-xs text-slate-500">
              AgriHub Super Grains Pvt Ltd • GSTIN: <span className="font-mono text-purple-900 font-bold">07AAACA1234A1Z5</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Listing Form' : 'List New Wholesale Product'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Seller Revenue</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="text-xs text-emerald-600 font-semibold">Net Cleared</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">GST Tax Remitted</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-purple-600">₹{totalGST.toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-500 font-semibold">Input Credit</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Catalog Items</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{products.filter((p) => p.is_active).length}</span>
            <span className="text-xs text-blue-600 font-semibold">Live on Bazaar</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Autonomous Sales Completed</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-emerald-600">{transactions.length}</span>
            <span className="text-xs text-slate-500 font-semibold">Orders</span>
          </div>
        </div>
      </div>

      {/* Add Product Modal / Collapsible Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-md animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-base text-slate-900">List New Product with Autonomous Agent Pricing Bounds</h3>
            <span className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 font-semibold">
              Floor Price Protected
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100kg Premium Sharbati Wheat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Agricultural Commodities">Agricultural Commodities</option>
                  <option value="Hospitality Supplies">Hospitality Supplies</option>
                  <option value="Renewable Equipment">Renewable Equipment</option>
                  <option value="Industrial Workwear">Industrial Workwear</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description & Quality Specifications</label>
              <textarea
                rows={2}
                placeholder="Moisture grade, certification, grain size, packaging specifications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Pricing Bounds Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-purple-50/50 rounded-xl border border-purple-200">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Listed Base Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Standard catalog rate</span>
              </div>

              <div>
                <label className="font-bold text-purple-900 block mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-purple-700" />
                  <span>Min Floor Price (₹) *</span>
                </label>
                <input
                  type="number"
                  required
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg text-xs bg-white font-mono font-bold text-purple-900"
                />
                <span className="text-[10px] text-purple-700 mt-0.5 block">Confidential agent floor</span>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Stock Units *</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Available inventory</span>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Unit of Measure</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="kg, meter, panel, set"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>

            {/* GST & Freight Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Applicable GST Rate (%)</label>
                <select
                  value={gstPercent}
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value={5.0}>5.0% (Grains, Food, Textiles)</option>
                  <option value={12.0}>12.0% (Processed Goods, Linens)</option>
                  <option value={18.0}>18.0% (Standard Equipment, Solar)</option>
                  <option value={28.0}>28.0% (Luxury / Heavy Commercial)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transport / Freight (₹)</label>
                <input
                  type="number"
                  value={transportCharge}
                  onChange={(e) => setTransportCharge(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dispatch Window (Days)</label>
                <input
                  type="number"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                Save & Deploy AI Sales Agent
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Performance Analytics & Intelligence Section */}
      <SellerPerformanceAnalytics transactions={transactions} />

      {/* Listed Products Table */}
      {/* Active Listed Inventory Table & Mobile Stackable Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">Active Listed Inventory & Agent Floor Rules</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">{products.length} Products Configured</span>
        </div>

        {/* Desktop / Tablet View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Listed Base Rate</th>
                <th className="p-4 text-right">Confidential Floor</th>
                <th className="p-4 text-right">Stock</th>
                <th className="p-4">GST %</th>
                <th className="p-4">Agent Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{prod.name}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{prod.description}</p>
                  </td>
                  <td className="p-4 text-slate-600">{prod.category}</td>
                  <td className="p-4 text-right font-mono font-bold text-slate-900">
                    ₹{prod.base_price}/{prod.unit}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-purple-700">
                    <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      ₹{prod.min_price}/{prod.unit}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium text-slate-800">
                    {prod.stock} {prod.unit}
                  </td>
                  <td className="p-4 font-mono text-slate-600">{prod.gst_percent}%</td>
                  <td className="p-4">
                    {prod.is_active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[10px] border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        AI Agent Active
                      </span>
                    ) : (
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                        Paused
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onToggleProductActive(prod.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        prod.is_active
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {prod.is_active ? 'Pause Agent' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stackable Card View (< md Viewport) */}
        <div className="md:hidden divide-y divide-slate-100">
          {products.map((prod) => (
            <div key={prod.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{prod.name}</h4>
                  <span className="text-[10px] text-slate-500">{prod.category}</span>
                </div>
                <div>
                  {prod.is_active ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[10px] border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Active
                    </span>
                  ) : (
                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                      Paused
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2">{prod.description}</p>

              {/* Pricing & Stock Matrix */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Listed Base Rate</span>
                  <span className="font-mono font-bold text-slate-900">₹{prod.base_price}/{prod.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-700 block font-medium">Confidential Floor</span>
                  <span className="font-mono font-bold text-purple-700">₹{prod.min_price}/{prod.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Available Inventory</span>
                  <span className="font-medium text-slate-800">{prod.stock} {prod.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">GST Rate</span>
                  <span className="font-mono font-semibold text-slate-700">{prod.gst_percent}%</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <button
                  onClick={() => onToggleProductActive(prod.id)}
                  className={`w-full py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    prod.is_active
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {prod.is_active ? 'Pause Autonomous AI Agent' : 'Activate AI Negotiator'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seller Agent Actions Today */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Autonomous Orders Received Today</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">{transactions.length} Cleared</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-all text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{tx.bill_no}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        PAID
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{tx.product_name} • {tx.quantity} units</p>
                    <p className="text-[10px] text-slate-400 font-mono">Razorpay ID: {tx.razorpay_payment_id}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 font-mono text-sm block">
                      ₹{tx.total_amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => onViewInvoice(tx)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold mt-1 flex items-center gap-1"
                    >
                      <ReceiptText className="w-3 h-3" />
                      <span>View Invoice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <AuditTrailViewer
            actions={sellerActions}
            title="What My AI Seller Agent Did Today"
            maxHeight="max-h-[420px]"
          />
        </div>
      </div>
    </div>
  );
};
