import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Store, 
  ShoppingBag, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Globe,
  Warehouse,
  Scale,
  Handshake,
  Check,
  FileBadge,
  Truck,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth, OnboardingData } from '../context/AuthContext';
import { 
  UserRole, 
  TradeCategory, 
  WholesalerDetails, 
  MandiTraderDetails, 
  BrokerDetails, 
  BuyerEnterpriseDetails 
} from '../types';

const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '06': 'Haryana',
  '07': 'Delhi NCR',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '19': 'West Bengal',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
};

const INDIAN_LANGUAGES = [
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'en', name: 'English' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
];

const PRESET_PERSONAS = [
  {
    id: 'wholesaler_preset',
    label: 'Wholesale Godown Trader',
    badge: '🏬 Wholesaler',
    role: 'seller' as UserRole,
    trade_category: 'wholesaler_godown' as TradeCategory,
    name: 'Rajesh Agrawal',
    email: 'rajesh.agrawal@agrihubgrains.in',
    phone: '+91 98765 43210',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    preferred_language: 'हिंदी (Hindi)',
    business_name: 'AgriHub Super Grains & Oilseeds Pvt Ltd',
    gstin: '27AAECB7788J1ZR',
    pan_number: 'AAECB7788J',
    address: 'Plot 88, Central Godown Sector, APMC Complex, Navi Mumbai - 400705',
    wholesaler_details: {
      company_name: 'AgriHub Super Grains & Oilseeds Pvt Ltd',
      shop_number: 'Shop #G-14 & Warehouse Bay 6',
      godown_address: 'Godown #4, Central Agro Logistics Park, Navi Mumbai',
      godown_capacity_mt: '850 Metric Tonnes',
      fssai_license: 'FSSAI-11522020000491',
      storage_type: 'dry_warehouse' as const,
      primary_commodities: ['Sharbati Wheat', 'Basmati Rice', 'Mustard Seeds', 'Soybean']
    }
  },
  {
    id: 'mandi_preset',
    label: 'APMC Mandi Stall Trader',
    badge: '🌾 Mandi Stall',
    role: 'seller' as UserRole,
    trade_category: 'mandi_stall' as TradeCategory,
    name: 'Harish Kumar Gupta',
    email: 'harish.gupta@azadpurmandi.in',
    phone: '+91 98110 54321',
    city: 'Delhi NCR',
    state: 'Delhi NCR',
    preferred_language: 'हिंदी (Hindi)',
    business_name: 'Gupta Mandi Commission Agency & Grains',
    gstin: '07AAACG5512B1Z3',
    pan_number: 'AAACG5512B',
    address: 'Gate 4, Block C, Shed #48, Azadpur APMC Mandi, Delhi - 110033',
    mandi_details: {
      mandi_name: 'Azadpur APMC Mandi (Asia\'s Largest Yard)',
      mandi_state: 'Delhi NCR',
      mandi_gate_number: 'Gate 4 / East Mandi Ingress',
      stall_gala_number: 'Stall / Shed #B-142 (Kisan Phad)',
      apmc_license_number: 'APMC/DL/AZD/TR-8821',
      weighbridge_assigned: 'APMC Electronic Weighbridge #2',
      commission_agent_name: 'Gupta & Sons Mandi Aadath'
    }
  },
  {
    id: 'broker_preset',
    label: 'Licensed Mandi Broker',
    badge: '🤝 Broker / Dalal',
    role: 'broker' as UserRole,
    trade_category: 'broker_commission' as TradeCategory,
    name: 'Vikramjit Singh Sandhu',
    email: 'vikram.sandhu@balajibrokers.in',
    phone: '+91 98140 88776',
    city: 'Khanna / Ludhiana',
    state: 'Punjab',
    preferred_language: 'ਪੰਜਾਬੀ (Punjabi)',
    business_name: 'Shree Balaji Agri Commodity Brokers',
    gstin: '03AABCS9182C1ZG',
    pan_number: 'AABCS9182C',
    address: 'Chamber 12, Mandi Vyapar Bhawan, GT Road, Khanna, Punjab - 141401',
    broker_details: {
      brokerage_firm_name: 'Shree Balaji Agri Commodity Brokers',
      broker_license_number: 'NAB-BRK-9921-PB',
      apmc_association_name: 'Northern India Grain & Oilseeds Dalal Association',
      commission_rate_percent: 1.5,
      operating_mandis: 'Khanna, Azadpur, Unjha, Vashi, Gulbarga',
      upi_id: 'balaji.brokers@okhdfcbank',
      pan_number: 'AABCS9182C'
    }
  },
  {
    id: 'buyer_preset',
    label: 'Food Mill & Enterprise Buyer',
    badge: '🛒 Procurement Buyer',
    role: 'buyer' as UserRole,
    trade_category: 'buyer_enterprise' as TradeCategory,
    name: 'Priya Sharma',
    email: 'priya.sharma@sharmaagrofoods.in',
    phone: '+91 98101 23456',
    city: 'New Delhi',
    state: 'Delhi NCR',
    preferred_language: 'English',
    business_name: 'Sharma Agro Foods & Modern Flour Mills Pvt Ltd',
    gstin: '07AAACS1429B1Z8',
    pan_number: 'AAACS1429B',
    address: 'Plot 42, Food Processing Industrial Park, Phase 2, Okhla, New Delhi - 110020',
    buyer_details: {
      procurement_type: 'flour_mill' as const,
      factory_godown_address: 'Flour Mill Intake Silo #3, Plot 42 Food Park, Okhla, New Delhi',
      monthly_procurement_mt: '150 Metric Tonnes / Month',
      unloading_bay_details: 'Bay 2 (Automatic Pneumatic Grain Unloader)'
    }
  }
];

export const OnboardingModal: React.FC = () => {
  const { user, isOnboardingModalOpen, completeOnboarding } = useAuth();

  // Multi-step form management (Step 1: Role Archetype, Step 2: Personal Details, Step 3: Trade/Facility Details)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Common Personal Details
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [city, setCity] = useState<string>(user?.city || 'New Delhi');
  const [state, setState] = useState<string>(user?.state || 'Delhi NCR');
  const [preferredLanguage, setPreferredLanguage] = useState<string>(user?.preferred_language || 'हिंदी (Hindi)');
  
  // Trade Persona Selection
  const [role, setRole] = useState<UserRole>(user?.role || 'seller');
  const [tradeCategory, setTradeCategory] = useState<TradeCategory>(user?.trade_category || 'wholesaler_godown');
  
  // Common Legal / Tax Info
  const [businessName, setBusinessName] = useState<string>(user?.business_name || '');
  const [gstin, setGstin] = useState<string>(user?.gstin || '');
  const [panNumber, setPanNumber] = useState<string>(user?.pan_number || '');
  const [address, setAddress] = useState<string>(user?.address || '');

  // Role-Specific: Wholesaler Godown Details
  const [shopNumber, setShopNumber] = useState<string>(user?.wholesaler_details?.shop_number || '');
  const [godownAddress, setGodownAddress] = useState<string>(user?.wholesaler_details?.godown_address || '');
  const [godownCapacity, setGodownCapacity] = useState<string>(user?.wholesaler_details?.godown_capacity_mt || '500 Metric Tonnes');
  const [fssaiLicense, setFssaiLicense] = useState<string>(user?.wholesaler_details?.fssai_license || '');
  const [storageType, setStorageType] = useState<'cold_storage' | 'dry_warehouse' | 'silo' | 'open_shed'>(
    user?.wholesaler_details?.storage_type || 'dry_warehouse'
  );

  // Role-Specific: Mandi Stall Details
  const [mandiName, setMandiName] = useState<string>(user?.mandi_details?.mandi_name || 'Azadpur APMC Mandi, Delhi');
  const [mandiGateNumber, setMandiGateNumber] = useState<string>(user?.mandi_details?.mandi_gate_number || 'Gate 4 / East Gate');
  const [stallGalaNumber, setStallGalaNumber] = useState<string>(user?.mandi_details?.stall_gala_number || 'Stall #B-142 (Kisan Phad)');
  const [apmcLicense, setApmcLicense] = useState<string>(user?.mandi_details?.apmc_license_number || 'APMC/DL/AZD/2024/774');
  const [weighbridgeAssigned, setWeighbridgeAssigned] = useState<string>(user?.mandi_details?.weighbridge_assigned || 'Electronic Weighbridge #2');
  const [commissionAgentName, setCommissionAgentName] = useState<string>(user?.mandi_details?.commission_agent_name || '');

  // Role-Specific: Broker Details
  const [brokerLicense, setBrokerLicense] = useState<string>(user?.broker_details?.broker_license_number || 'NAB-BRK-9921-ND');
  const [brokerAssociation, setBrokerAssociation] = useState<string>(user?.broker_details?.apmc_association_name || 'Grain & Oilseeds Brokers Association');
  const [commissionRate, setCommissionRate] = useState<number>(user?.broker_details?.commission_rate_percent || 1.5);
  const [operatingMandis, setOperatingMandis] = useState<string>(user?.broker_details?.operating_mandis || 'Azadpur, Vashi, Khanna, Unjha');
  const [brokerUpi, setBrokerUpi] = useState<string>(user?.broker_details?.upi_id || 'broker.settlement@okhdfcbank');

  // Role-Specific: Buyer Enterprise Details
  const [procurementType, setProcurementType] = useState<'retail_kirana' | 'flour_mill' | 'food_processor' | 'distributor'>(
    user?.buyer_details?.procurement_type || 'flour_mill'
  );
  const [factoryGodownAddress, setFactoryGodownAddress] = useState<string>(user?.buyer_details?.factory_godown_address || '');
  const [monthlyVolume, setMonthlyVolume] = useState<string>(user?.buyer_details?.monthly_procurement_mt || '100 Metric Tonnes / Month');
  const [unloadingBay, setUnloadingBay] = useState<string>(user?.buyer_details?.unloading_bay_details || 'Bay 2 (Pneumatic Unloader)');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Prepopulate if user exists
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.city) setCity(user.city);
      if (user.state) setState(user.state);
      if (user.preferred_language) setPreferredLanguage(user.preferred_language);
      if (user.role) setRole(user.role);
      if (user.trade_category) setTradeCategory(user.trade_category);
      if (user.business_name) setBusinessName(user.business_name);
      if (user.gstin) setGstin(user.gstin);
      if (user.address) setAddress(user.address);
    }
  }, [user]);

  if (!isOnboardingModalOpen) return null;

  // Validation Helpers
  const cleanGstin = gstin.trim().toUpperCase();
  const stateCode = cleanGstin.slice(0, 2);
  const detectedState = GST_STATE_CODES[stateCode];

  // 1-Click Persona Pre-fill
  const handleApplyPreset = (preset: typeof PRESET_PERSONAS[0]) => {
    setRole(preset.role);
    setTradeCategory(preset.trade_category);
    setName(preset.name);
    setEmail(preset.email);
    setPhone(preset.phone);
    setCity(preset.city);
    setState(preset.state);
    setPreferredLanguage(preset.preferred_language);
    setBusinessName(preset.business_name);
    setGstin(preset.gstin);
    setPanNumber(preset.pan_number);
    setAddress(preset.address);

    if (preset.wholesaler_details) {
      setShopNumber(preset.wholesaler_details.shop_number);
      setGodownAddress(preset.wholesaler_details.godown_address);
      setGodownCapacity(preset.wholesaler_details.godown_capacity_mt);
      setFssaiLicense(preset.wholesaler_details.fssai_license || '');
      setStorageType(preset.wholesaler_details.storage_type);
    }

    if (preset.mandi_details) {
      setMandiName(preset.mandi_details.mandi_name);
      setMandiGateNumber(preset.mandi_details.mandi_gate_number);
      setStallGalaNumber(preset.mandi_details.stall_gala_number);
      setApmcLicense(preset.mandi_details.apmc_license_number);
      setWeighbridgeAssigned(preset.mandi_details.weighbridge_assigned);
      setCommissionAgentName(preset.mandi_details.commission_agent_name || '');
    }

    if (preset.broker_details) {
      setBrokerLicense(preset.broker_details.broker_license_number);
      setBrokerAssociation(preset.broker_details.apmc_association_name);
      setCommissionRate(preset.broker_details.commission_rate_percent);
      setOperatingMandis(preset.broker_details.operating_mandis);
      setBrokerUpi(preset.broker_details.upi_id);
    }

    if (preset.buyer_details) {
      setProcurementType(preset.buyer_details.procurement_type);
      setFactoryGodownAddress(preset.buyer_details.factory_godown_address);
      setMonthlyVolume(preset.buyer_details.monthly_procurement_mt);
      setUnloadingBay(preset.buyer_details.unloading_bay_details || '');
    }

    setErrorMsg('');
    setCurrentStep(3); // Jump to inspection & final confirmation
  };

  const handleStep1Next = () => {
    setErrorMsg('');
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Please enter your Full Legal Name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg('Please enter a valid WhatsApp / Mobile Number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Commercial Email Address.');
      return;
    }
    setCurrentStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!businessName.trim()) {
      setErrorMsg('Please enter your registered Business / Company / Firm Name.');
      return;
    }

    if (tradeCategory === 'wholesaler_godown') {
      if (!godownAddress.trim()) {
        setErrorMsg('Please enter your Warehouse / Godown physical address.');
        return;
      }
      if (!cleanGstin || cleanGstin.length < 15) {
        setErrorMsg('Please enter a valid 15-digit GSTIN for Wholesale Tax Invoicing.');
        return;
      }
    } else if (tradeCategory === 'mandi_stall') {
      if (!mandiName.trim()) {
        setErrorMsg('Please specify your APMC Mandi Yard Name.');
        return;
      }
      if (!stallGalaNumber.trim()) {
        setErrorMsg('Please specify your Mandi Stall / Gala / Shed Number.');
        return;
      }
      if (!apmcLicense.trim()) {
        setErrorMsg('Please specify your APMC Trader Registration / License Number.');
        return;
      }
    } else if (tradeCategory === 'broker_commission') {
      if (!brokerLicense.trim()) {
        setErrorMsg('Please provide your Broker / Dalal License Number.');
        return;
      }
      if (!brokerUpi.trim()) {
        setErrorMsg('Please provide your UPI ID or Bank account for instant brokerage payouts.');
        return;
      }
    } else if (tradeCategory === 'buyer_enterprise') {
      if (!factoryGodownAddress.trim() && !address.trim()) {
        setErrorMsg('Please provide your Delivery Receiving Mill / Godown address.');
        return;
      }
    }

    // Assemble payload
    const submissionData: OnboardingData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      city: city.trim(),
      state: state.trim(),
      preferred_language: preferredLanguage,
      role: tradeCategory === 'buyer_enterprise' ? 'buyer' : tradeCategory === 'broker_commission' ? 'broker' : 'seller',
      trade_category: tradeCategory,
      business_name: businessName.trim(),
      gstin: cleanGstin || (tradeCategory === 'broker_commission' ? '07AABCS9182C1ZG' : '07AAACS1429B1Z8'),
      pan_number: panNumber.trim().toUpperCase() || (cleanGstin ? cleanGstin.slice(2, 12) : 'AAACB1234F'),
      address: address.trim() || godownAddress.trim() || `${mandiName}, ${stallGalaNumber}`,
    };

    if (tradeCategory === 'wholesaler_godown') {
      submissionData.wholesaler_details = {
        company_name: businessName.trim(),
        shop_number: shopNumber.trim() || 'Shop #1',
        godown_address: godownAddress.trim(),
        godown_capacity_mt: godownCapacity.trim(),
        fssai_license: fssaiLicense.trim() || 'FSSAI-APPLIED-2024',
        storage_type: storageType,
        primary_commodities: ['Wheat', 'Rice', 'Mustard Oil', 'Pulses']
      };
    } else if (tradeCategory === 'mandi_stall') {
      submissionData.mandi_details = {
        mandi_name: mandiName.trim(),
        mandi_state: state.trim(),
        mandi_gate_number: mandiGateNumber.trim() || 'Gate 1',
        stall_gala_number: stallGalaNumber.trim(),
        apmc_license_number: apmcLicense.trim(),
        weighbridge_assigned: weighbridgeAssigned.trim() || 'APMC Certified Weighbridge',
        commission_agent_name: commissionAgentName.trim() || businessName.trim()
      };
    } else if (tradeCategory === 'broker_commission') {
      submissionData.broker_details = {
        brokerage_firm_name: businessName.trim(),
        broker_license_number: brokerLicense.trim(),
        apmc_association_name: brokerAssociation.trim(),
        commission_rate_percent: Number(commissionRate) || 1.5,
        operating_mandis: operatingMandis.trim(),
        upi_id: brokerUpi.trim(),
        pan_number: panNumber.trim().toUpperCase()
      };
    } else if (tradeCategory === 'buyer_enterprise') {
      submissionData.buyer_details = {
        procurement_type: procurementType,
        factory_godown_address: factoryGodownAddress.trim() || address.trim(),
        monthly_procurement_mt: monthlyVolume.trim(),
        unloading_bay_details: unloadingBay.trim()
      };
    }

    try {
      setIsSubmitting(true);
      await completeOnboarding(submissionData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register profile';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="mandatory-onboarding-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white relative shrink-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Agent Bazar • Mandatory KYC & Role Registration
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] text-amber-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Step {currentStep} of 3</span>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            Complete Your Trader Identity & Facility Profile
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Every participant must register their personal details and role-specific physical facility (Godown, Mandi Stall, Broker License, or Processing Mill) before entering live autonomous haggling.
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className={`h-1.5 flex-1 rounded-full transition-all ${currentStep >= 1 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all ${currentStep >= 2 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all ${currentStep >= 3 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
          </div>
        </div>

        {/* 1-Click Fast-Pass Presets Banner */}
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Quick 1-Click Trade Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_PERSONAS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-800 rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1"
                title={`Load pre-filled credentials for ${preset.label}`}
              >
                <span>{preset.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: ROLE ARCHETYPE SELECTION                                          */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Select Your Trade Category & Role <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Choose your trade role to configure the correct facility specifications, GST rules, and AI negotiation agents.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Wholesaler Godown */}
                  <button
                    type="button"
                    onClick={() => {
                      setTradeCategory('wholesaler_godown');
                      setRole('seller');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      tradeCategory === 'wholesaler_godown'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-600/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 font-black text-xs text-indigo-900">
                          <Warehouse className="w-4 h-4 text-indigo-600" />
                          <span>Wholesale Godown Trader</span>
                        </div>
                        {tradeCategory === 'wholesaler_godown' && (
                          <Check className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Commercial wholesale merchant with private warehouse/godown storage capacity in Metric Tonnes.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 mt-2 bg-indigo-100/70 w-fit px-1.5 py-0.5 rounded">
                      Role: Verified Seller
                    </span>
                  </button>

                  {/* APMC Mandi Stall */}
                  <button
                    type="button"
                    onClick={() => {
                      setTradeCategory('mandi_stall');
                      setRole('seller');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      tradeCategory === 'mandi_stall'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-600/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 font-black text-xs text-emerald-900">
                          <Store className="w-4 h-4 text-emerald-600" />
                          <span>APMC Mandi Stall Trader</span>
                        </div>
                        {tradeCategory === 'mandi_stall' && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Operating physically inside a state APMC Mandi yard with designated Gate, Stall, Gala, or Kisan Phad.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 mt-2 bg-emerald-100/70 w-fit px-1.5 py-0.5 rounded">
                      Role: Mandi Merchant
                    </span>
                  </button>

                  {/* Mandi Broker / Dalal */}
                  <button
                    type="button"
                    onClick={() => {
                      setTradeCategory('broker_commission');
                      setRole('broker');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      tradeCategory === 'broker_commission'
                        ? 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-600/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 font-black text-xs text-amber-900">
                          <Handshake className="w-4 h-4 text-amber-600" />
                          <span>Broker / Dalal / Aadathi</span>
                        </div>
                        {tradeCategory === 'broker_commission' && (
                          <Check className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Commission agent facilitating trades between farmers, millers, and wholesalers with automated brokerage escrow.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 mt-2 bg-amber-100/70 w-fit px-1.5 py-0.5 rounded">
                      Role: Licensed Broker
                    </span>
                  </button>

                  {/* Procurement Buyer / Mill */}
                  <button
                    type="button"
                    onClick={() => {
                      setTradeCategory('buyer_enterprise');
                      setRole('buyer');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      tradeCategory === 'buyer_enterprise'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 ring-2 ring-blue-600/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 font-black text-xs text-blue-900">
                          <ShoppingBag className="w-4 h-4 text-blue-600" />
                          <span>Procurement Buyer / Mill</span>
                        </div>
                        {tradeCategory === 'buyer_enterprise' && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Flour mill, food processor, retail chain, or bulk buyer deploying AI agents to procure at optimal landed rates.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 mt-2 bg-blue-100/70 w-fit px-1.5 py-0.5 rounded">
                      Role: Bulk Buyer
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to Personal Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PERSONAL IDENTITY & CONTACT DETAILS                               */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Trader Personal Details
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mandatory identification required for audit logs, digital signatures, and SMS/WhatsApp notifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Role</span>
                </button>
              </div>

              {/* Full Name & WhatsApp Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar Gupta"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden transition-all"
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    WhatsApp / Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98230 45678"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden transition-all"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Email & Preferred Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Commercial Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh@agritrade.in"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden transition-all"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Preferred Voice & AI Language <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden transition-all"
                    >
                      {INDIAN_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.name}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    City / Trading District <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New Delhi / Navi Mumbai / Khanna"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden transition-all"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Operating State (GST State) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Delhi NCR / Maharashtra / Punjab"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Next: Configure {tradeCategory.replace('_', ' ').toUpperCase()} Facility</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: ROLE-SPECIFIC FACILITY, COMPANY, GSTIN & STALL/GODOWN DETAILS    */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    {tradeCategory === 'wholesaler_godown' && <Warehouse className="w-4 h-4 text-indigo-600" />}
                    {tradeCategory === 'mandi_stall' && <Store className="w-4 h-4 text-emerald-600" />}
                    {tradeCategory === 'broker_commission' && <Handshake className="w-4 h-4 text-amber-600" />}
                    {tradeCategory === 'buyer_enterprise' && <ShoppingBag className="w-4 h-4 text-blue-600" />}
                    <span>
                      {tradeCategory === 'wholesaler_godown' && 'Wholesale Godown & Warehouse Details'}
                      {tradeCategory === 'mandi_stall' && 'APMC Mandi Stall & License Details'}
                      {tradeCategory === 'broker_commission' && 'Brokerage License & Payout Details'}
                      {tradeCategory === 'buyer_enterprise' && 'Procurement Mill & Receiving Details'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verify physical facility parameters to activate auto-invoicing, e-Way bills, and smart contracts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

              {/* Company / Business Entity Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Registered Firm / Company / Mandi Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. AgriHub Super Grains & Oilseeds Pvt Ltd"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SPECIFIC FIELDS: WHOLESALER GODOWN                            */}
              {/* ------------------------------------------------------------- */}
              {tradeCategory === 'wholesaler_godown' && (
                <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-3">
                  <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Warehouse className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Warehouse (Godown) Specifications</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Shop / Warehouse Bay Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={shopNumber}
                        onChange={(e) => setShopNumber(e.target.value)}
                        placeholder="Shop #G-14 & Warehouse Bay 6"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Godown Storage Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={godownCapacity}
                        onChange={(e) => setGodownCapacity(e.target.value)}
                        placeholder="e.g. 500 Metric Tonnes (10,000 Bags)"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Godown Physical Address & Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={godownAddress}
                      onChange={(e) => setGodownAddress(e.target.value)}
                      placeholder="Godown #4, Central Agro Logistics Park, Sector 18, Navi Mumbai"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Storage Facility Type
                      </label>
                      <select
                        value={storageType}
                        onChange={(e) => setStorageType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      >
                        <option value="dry_warehouse">Covered Dry Warehouse (Grain Godown)</option>
                        <option value="cold_storage">Cold Storage (Fruits / Seeds)</option>
                        <option value="silo">Automatic Grain Silo</option>
                        <option value="open_shed">Open Covered Shed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        FSSAI / Warehouse License No.
                      </label>
                      <input
                        type="text"
                        value={fssaiLicense}
                        onChange={(e) => setFssaiLicense(e.target.value)}
                        placeholder="e.g. FSSAI-11522020000491"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SPECIFIC FIELDS: MANDI STALL TRADER                           */}
              {/* ------------------------------------------------------------- */}
              {tradeCategory === 'mandi_stall' && (
                <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-3">
                  <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span>APMC Mandi Yard & Stall Location</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        APMC Mandi Yard Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={mandiName}
                        onChange={(e) => setMandiName(e.target.value)}
                        placeholder="e.g. Azadpur APMC Mandi, Delhi"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Stall / Gala / Shed / Phad No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={stallGalaNumber}
                        onChange={(e) => setStallGalaNumber(e.target.value)}
                        placeholder="e.g. Stall #B-142 (Kisan Phad)"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Mandi Gate / Block Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={mandiGateNumber}
                        onChange={(e) => setMandiGateNumber(e.target.value)}
                        placeholder="e.g. Gate 4 / Block C Ingress"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        APMC Trader License Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={apmcLicense}
                        onChange={(e) => setApmcLicense(e.target.value)}
                        placeholder="e.g. APMC/DL/AZD/TR-8821"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Weighbridge Assigned
                      </label>
                      <input
                        type="text"
                        value={weighbridgeAssigned}
                        onChange={(e) => setWeighbridgeAssigned(e.target.value)}
                        placeholder="e.g. Electronic Weighbridge #2"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Commission Agent / Aadath Affiliation
                      </label>
                      <input
                        type="text"
                        value={commissionAgentName}
                        onChange={(e) => setCommissionAgentName(e.target.value)}
                        placeholder="e.g. Gupta & Sons Mandi Aadath"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SPECIFIC FIELDS: BROKER / DALAL                               */}
              {/* ------------------------------------------------------------- */}
              {tradeCategory === 'broker_commission' && (
                <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-100 space-y-3">
                  <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Handshake className="w-3.5 h-3.5 text-amber-600" />
                    <span>Brokerage License & Payout Destination</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Broker Registration / License No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={brokerLicense}
                        onChange={(e) => setBrokerLicense(e.target.value)}
                        placeholder="e.g. NAB-BRK-9921-PB"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Brokerage Commission Rate (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="5.0"
                        required
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                        placeholder="1.5"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Operating Mandis / Agricultural Belts
                      </label>
                      <input
                        type="text"
                        value={operatingMandis}
                        onChange={(e) => setOperatingMandis(e.target.value)}
                        placeholder="Khanna, Azadpur, Unjha, Vashi, Gulbarga"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Settlement UPI ID (For Instant Payouts) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={brokerUpi}
                        onChange={(e) => setBrokerUpi(e.target.value)}
                        placeholder="e.g. balaji.brokers@okhdfcbank"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SPECIFIC FIELDS: BUYER ENTERPRISE / MILL                      */}
              {/* ------------------------------------------------------------- */}
              {tradeCategory === 'buyer_enterprise' && (
                <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 space-y-3">
                  <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                    <span>Procurement Facility & Receiving Gate</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Procurement Archetype
                      </label>
                      <select
                        value={procurementType}
                        onChange={(e) => setProcurementType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      >
                        <option value="flour_mill">Commercial Flour / Dal Mill</option>
                        <option value="food_processor">Food Processing Plant</option>
                        <option value="retail_kirana">Supermarket / Retail Chain</option>
                        <option value="distributor">Wholesale FMCG Distributor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Monthly Procurement Target (MT)
                      </label>
                      <input
                        type="text"
                        value={monthlyVolume}
                        onChange={(e) => setMonthlyVolume(e.target.value)}
                        placeholder="e.g. 150 Metric Tonnes / Month"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Delivery Receiving Godown / Mill Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={factoryGodownAddress}
                      onChange={(e) => setFactoryGodownAddress(e.target.value)}
                      placeholder="Flour Mill Intake Silo #3, Plot 42 Food Park, Okhla, New Delhi"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Unloading Bay & Crane Details
                    </label>
                    <input
                      type="text"
                      value={unloadingBay}
                      onChange={(e) => setUnloadingBay(e.target.value)}
                      placeholder="Bay 2 (Automatic Pneumatic Grain Unloader)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* GSTIN & Tax Identification */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    15-Digit GSTIN Number {tradeCategory === 'wholesaler_godown' && <span className="text-red-500">*</span>}
                  </label>
                  {cleanGstin.length >= 2 && (
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {detectedState ? `Jurisdiction: ${detectedState}` : `State Code: ${stateCode}`}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 07AAACS1429B1Z8"
                  className="w-full px-3.5 py-2.5 font-mono uppercase bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden transition-all shadow-2xs"
                />
              </div>

              {/* Compliance & Security Guarantee */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Section 31 CGST Act & APMC Yard Verified</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>SHA-256 Verified Identity</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !businessName.trim()}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? 'Registering & Validating Facility...' : 'Confirm Profile & Enter Agent Bazar'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
