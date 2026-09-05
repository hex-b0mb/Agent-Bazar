import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  Package, 
  ScrollText, 
  Building2, 
  ShoppingBag, 
  Bot, 
  ArrowRight, 
  Receipt, 
  Tag, 
  Sparkles,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShieldCheck,
  Store,
  FileSpreadsheet
} from 'lucide-react';
import { Product, Transaction, BuyerRequest, User } from '../types';
import { scoreItem } from '../utils/fuzzySearch';

export type SearchCategory = 'all' | 'products' | 'bills' | 'demands' | 'businesses';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  transactions: Transaction[];
  buyerRequests: BuyerRequest[];
  users: User[];
  onSelectProduct: (product: Product) => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onSelectBuyerDemand: (request: BuyerRequest, matchedProduct?: Product) => void;
  onSelectBusiness: (businessName: string, role: 'buyer' | 'seller') => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  transactions,
  buyerRequests,
  users,
  onSelectProduct,
  onSelectTransaction,
  onSelectBuyerDemand,
  onSelectBusiness,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute businesses list from users, products, and transactions
  const businessesList = useMemo(() => {
    const map = new Map<string, {
      name: string;
      role: 'buyer' | 'seller';
      gstin: string;
      contactPerson: string;
      city?: string;
      associatedItemsCount: number;
    }>();

    // From Users
    users.forEach(u => {
      if (u.business_name) {
        map.set(u.business_name.toLowerCase(), {
          name: u.business_name,
          role: u.role as 'buyer' | 'seller',
          gstin: u.gstin || '07AAACA1234A1Z5',
          contactPerson: u.name,
          city: u.address?.split(',').slice(-2, -1)[0]?.trim(),
          associatedItemsCount: 1,
        });
      }
    });

    // From Products
    products.forEach(p => {
      if (p.seller_business) {
        const key = p.seller_business.toLowerCase();
        const existing = map.get(key);
        if (existing) {
          existing.associatedItemsCount += 1;
        } else {
          map.set(key, {
            name: p.seller_business,
            role: 'seller',
            gstin: p.seller_gstin || '24AABCS8899K1ZV',
            contactPerson: p.seller_name || 'Verified Vendor',
            associatedItemsCount: 1,
          });
        }
      }
    });

    // From Transactions
    transactions.forEach(t => {
      if (t.invoice_data?.buyer.business_name) {
        const bKey = t.invoice_data.buyer.business_name.toLowerCase();
        if (!map.has(bKey)) {
          map.set(bKey, {
            name: t.invoice_data.buyer.business_name,
            role: 'buyer',
            gstin: t.invoice_data.buyer.gstin,
            contactPerson: t.invoice_data.buyer.name,
            associatedItemsCount: 1,
          });
        }
      }
      if (t.invoice_data?.seller.business_name) {
        const sKey = t.invoice_data.seller.business_name.toLowerCase();
        if (!map.has(sKey)) {
          map.set(sKey, {
            name: t.invoice_data.seller.business_name,
            role: 'seller',
            gstin: t.invoice_data.seller.gstin,
            contactPerson: t.invoice_data.seller.name,
            associatedItemsCount: 1,
          });
        }
      }
    });

    return Array.from(map.values());
  }, [users, products, transactions]);

  // Filter & Rank Results using fuzzy match
  const searchResults = useMemo(() => {
    const q = query.trim();

    // 1. Matched Products
    const productResults = products
      .map(p => {
        const score = q ? scoreItem([
          { text: p.name, weight: 3.0 },
          { text: p.category, weight: 1.8 },
          { text: p.description, weight: 1.2 },
          { text: p.seller_business || '', weight: 1.5 },
          { text: p.seller_name || '', weight: 1.0 },
          { text: `₹${p.base_price}`, weight: 1.2 },
          { text: p.unit, weight: 1.0 },
        ], q) : 1;

        return { type: 'product' as const, item: p, score };
      })
      .filter(r => (q ? r.score > 0 : true));

    // 2. Matched Transaction Bills
    const billResults = transactions
      .map(t => {
        const score = q ? scoreItem([
          { text: t.bill_no, weight: 4.0 },
          { text: t.razorpay_payment_id || '', weight: 3.5 },
          { text: t.product_name, weight: 2.5 },
          { text: t.invoice_data?.buyer.business_name || '', weight: 2.0 },
          { text: t.invoice_data?.seller.business_name || '', weight: 2.0 },
          { text: t.payment_status, weight: 1.2 },
          { text: `₹${t.total_amount}`, weight: 1.5 },
        ], q) : 1;

        return { type: 'bill' as const, item: t, score };
      })
      .filter(r => (q ? r.score > 0 : true));

    // 3. Matched Buyer Demands / Required Products
    const demandResults = buyerRequests
      .map(req => {
        const matchedProd = products.find(p => {
          const qLower = req.query.toLowerCase();
          return (
            qLower.includes(p.name.toLowerCase().split(' ')[0]) ||
            qLower.includes(p.category.toLowerCase().split(' ')[0])
          );
        }) || products[0];

        const score = q ? scoreItem([
          { text: req.query, weight: 3.5 },
          { text: req.buyer_name || '', weight: 2.0 },
          { text: req.buyer_business || '', weight: 2.5 },
          { text: matchedProd?.name || '', weight: 2.2 },
          { text: `₹${req.max_budget}`, weight: 1.5 },
          { text: `${req.quantity}`, weight: 1.2 },
          { text: req.status, weight: 1.0 },
        ], q) : 1;

        return { 
          type: 'demand' as const, 
          item: req, 
          matchedProduct: matchedProd,
          score 
        };
      })
      .filter(r => (q ? r.score > 0 : true));

    // 4. Matched Businesses (Buyers & Sellers)
    const businessResults = businessesList
      .map(b => {
        const score = q ? scoreItem([
          { text: b.name, weight: 3.5 },
          { text: b.gstin, weight: 3.0 },
          { text: b.contactPerson, weight: 2.0 },
          { text: b.role, weight: 1.2 },
          { text: b.city || '', weight: 1.5 },
        ], q) : 1;

        return { type: 'business' as const, item: b, score };
      })
      .filter(r => (q ? r.score > 0 : true));

    // Sort by score descending
    productResults.sort((a, b) => b.score - a.score);
    billResults.sort((a, b) => b.score - a.score);
    demandResults.sort((a, b) => b.score - a.score);
    businessResults.sort((a, b) => b.score - a.score);

    return {
      products: productResults,
      bills: billResults,
      demands: demandResults,
      businesses: businessResults,
      totalCount: productResults.length + billResults.length + demandResults.length + businessResults.length,
    };
  }, [query, products, transactions, buyerRequests, businessesList]);

  // Filtered unified list based on activeCategory
  const flatDisplayList = useMemo(() => {
    let list: Array<{
      type: 'product' | 'bill' | 'demand' | 'business';
      item: any;
      matchedProduct?: Product;
      score: number;
    }> = [];

    if (activeCategory === 'all' || activeCategory === 'demands') {
      list = list.concat(searchResults.demands);
    }
    if (activeCategory === 'all' || activeCategory === 'products') {
      list = list.concat(searchResults.products);
    }
    if (activeCategory === 'all' || activeCategory === 'bills') {
      list = list.concat(searchResults.bills);
    }
    if (activeCategory === 'all' || activeCategory === 'businesses') {
      list = list.concat(searchResults.businesses);
    }

    if (activeCategory === 'all') {
      list.sort((a, b) => b.score - a.score);
    }

    return list;
  }, [activeCategory, searchResults]);

  // Handle keyboard list navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatDisplayList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatDisplayList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatDisplayList.length > 0 && flatDisplayList[selectedIndex]) {
        executeSelection(flatDisplayList[selectedIndex]);
      }
    }
  };

  const executeSelection = (entry: typeof flatDisplayList[0]) => {
    if (!entry) return;
    onClose();

    if (entry.type === 'product') {
      onSelectProduct(entry.item as Product);
    } else if (entry.type === 'bill') {
      onSelectTransaction(entry.item as Transaction);
    } else if (entry.type === 'demand') {
      onSelectBuyerDemand(entry.item as BuyerRequest, entry.matchedProduct);
    } else if (entry.type === 'business') {
      onSelectBusiness(entry.item.name, entry.item.role);
    }
  };

  const handleQuickSuggestion = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-10 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-5 h-5 text-indigo-600 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search products, transaction bills, buyer requirements, or GSTINs..."
            className="w-full pl-3 pr-10 py-1.5 text-base text-slate-900 placeholder:text-slate-400 bg-transparent border-none focus:outline-hidden font-medium"
          />
          <div className="flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer flex items-center justify-center"
              title="Close search modal (Esc)"
              aria-label="Close search modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-white border-b border-slate-100 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => { setActiveCategory('all'); setSelectedIndex(0); }}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Results</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeCategory === 'all' ? 'bg-indigo-700/60 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {searchResults.totalCount}
            </span>
          </button>

          <button
            onClick={() => { setActiveCategory('demands'); setSelectedIndex(0); }}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'demands'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buyer Demands</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeCategory === 'demands' ? 'bg-amber-700/60 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {searchResults.demands.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveCategory('products'); setSelectedIndex(0); }}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'products'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeCategory === 'products' ? 'bg-blue-700/60 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {searchResults.products.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveCategory('bills'); setSelectedIndex(0); }}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'bills'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Bills & Invoices</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeCategory === 'bills' ? 'bg-emerald-700/60 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {searchResults.bills.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveCategory('businesses'); setSelectedIndex(0); }}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'businesses'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Businesses</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeCategory === 'businesses' ? 'bg-purple-700/60 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {searchResults.businesses.length}
            </span>
          </button>
        </div>

        {/* Results Container */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-100">
          {/* Empty Query Suggestions */}
          {!query && (
            <div className="p-3 mb-2 bg-indigo-50/50 rounded-xl border border-indigo-100/80 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-950 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Popular & Quick Search Terms:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '1121 Basmati Rice',
                  'Table Linen',
                  'Bi-Facial Solar',
                  'A2A-20260225-1042',
                  'Bengal Royal Hotels',
                  'Gujarat Apex Textiles',
                  'Need 50kg basmati',
                  'Sharbati Wheat',
                  'Chef Uniform Sets',
                  'AgriHub Super Grains'
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleQuickSuggestion(term)}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200/80 text-indigo-900 rounded-lg text-[11px] font-medium transition-all cursor-pointer shadow-2xs"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Result Items */}
          {flatDisplayList.length > 0 ? (
            flatDisplayList.map((entry, index) => {
              const isSelected = index === selectedIndex;

              if (entry.type === 'demand') {
                const req = entry.item as BuyerRequest;
                const prod = entry.matchedProduct;

                return (
                  <div
                    key={`demand-${req.id}`}
                    onClick={() => executeSelection(entry)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected ? 'bg-amber-50/90 border border-amber-300 shadow-xs' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                            Buyer Demand / RFQ
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {req.buyer_business || req.buyer_name || 'Enterprise Buyer'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN') : ''}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-relaxed">
                          "{req.query}"
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-600">
                          <span className="font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Qty: <strong>{req.quantity} {prod?.unit || 'units'}</strong>
                          </span>
                          <span className="font-semibold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                            Target Budget: ₹{req.max_budget}/{prod?.unit || 'unit'}
                          </span>
                          {prod && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <span>Matched Product:</span>
                              <strong className="text-slate-700 truncate max-w-[140px]">{prod.name}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1 text-right">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" />
                        <span>Negotiate Deal</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Launch in Arena</span>
                    </div>
                  </div>
                );
              }

              if (entry.type === 'product') {
                const prod = entry.item as Product;

                return (
                  <div
                    key={`prod-${prod.id}`}
                    onClick={() => executeSelection(entry)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-blue-50/90 border border-blue-300 shadow-xs' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                            {prod.category}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 truncate">
                            Sold by {prod.seller_business || prod.seller_name}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="font-mono font-bold text-sm text-slate-900">
                        ₹{prod.base_price} <span className="text-[10px] font-sans font-normal text-slate-500">/{prod.unit}</span>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {prod.stock} in stock
                      </span>
                    </div>
                  </div>
                );
              }

              if (entry.type === 'bill') {
                const tx = entry.item as Transaction;
                const isPaid = tx.payment_status === 'paid';

                return (
                  <div
                    key={`bill-${tx.id}`}
                    onClick={() => executeSelection(entry)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-emerald-50/90 border border-emerald-300 shadow-xs' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {tx.bill_no}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {isPaid ? 'PAID & SETTLED' : 'PENDING ESCROW'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">
                          {tx.product_name} • {tx.quantity} units
                        </p>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Buyer: {tx.invoice_data?.buyer.business_name || 'Verified Buyer'} • GST: ₹{tx.gst_amount}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="font-mono font-bold text-sm text-slate-900">
                        ₹{tx.total_amount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-indigo-600 font-semibold hover:underline flex items-center justify-end gap-1">
                        <span>View GST Tax Invoice</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              }

              if (entry.type === 'business') {
                const b = entry.item;
                const isBuyer = b.role === 'buyer';

                return (
                  <div
                    key={`biz-${b.name}`}
                    onClick={() => executeSelection(entry)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-purple-50/90 border border-purple-300 shadow-xs' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isBuyer ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {isBuyer ? <ShoppingBag className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {b.name}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isBuyer ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {isBuyer ? 'Buyer Account' : 'Supplier / Vendor'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span>Contact: <strong>{b.contactPerson}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-slate-600">GSTIN: {b.gstin}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg">
                        {isBuyer ? 'Explore Demand' : 'View Catalog'}
                      </span>
                    </div>
                  </div>
                );
              }

              return null;
            })
          ) : (
            <div className="text-center py-12 px-4">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No matching records found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Try searching with partial keywords (e.g. "basmati", "1042", "solar", "textiles", "rice", "bengal").
              </p>
            </div>
          )}
        </div>

        {/* Footer info and keyboard guide */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-700">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-700">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-700">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-700">ESC</kbd>
              <span>to close</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fuzzy Engine v1.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
