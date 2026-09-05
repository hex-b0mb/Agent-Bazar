export interface PriceAlert {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  target_price: number;
  current_base_price: number;
  buyer_email: string;
  buyer_name?: string;
  buyer_business?: string;
  unit: string;
  created_at: string;
  status: 'active' | 'triggered' | 'dismissed';
  triggered_deal_price?: number;
  triggered_at?: string;
  bill_no?: string;
  enable_browser_notifications?: boolean;
}

export type UserRole = 'buyer' | 'seller' | 'admin' | 'broker';

export type TradeCategory = 
  | 'wholesaler_godown' 
  | 'mandi_stall' 
  | 'broker_commission' 
  | 'buyer_enterprise';

export interface WholesalerDetails {
  company_name: string;
  shop_number: string;
  godown_address: string;
  godown_capacity_mt: string;
  fssai_license?: string;
  storage_type: 'cold_storage' | 'dry_warehouse' | 'silo' | 'open_shed';
  primary_commodities: string[];
}

export interface MandiTraderDetails {
  mandi_name: string; // e.g. "Azadpur APMC Mandi, Delhi"
  mandi_state: string;
  mandi_gate_number: string; // e.g. "Gate 3 / East Terminal"
  stall_gala_number: string; // e.g. "Stall / Shed #B-142 (Kisan Phad)"
  apmc_license_number: string; // e.g. "APMC/DL/AZD/2024/774"
  weighbridge_assigned: string; // e.g. "Electronic Weighbridge #2"
  commission_agent_name?: string; // Aadath Name
}

export interface BrokerDetails {
  brokerage_firm_name: string;
  broker_license_number: string; // e.g. "NAB-BRK-9921-ND"
  apmc_association_name: string; // e.g. "Grain & Oilseeds Brokers Association"
  commission_rate_percent: number; // e.g. 1.5%
  operating_mandis: string; // e.g. "Azadpur, Vashi, Khanna, Unjha"
  upi_id: string; // for instant brokerage payout settlement
  pan_number?: string;
}

export interface BuyerEnterpriseDetails {
  procurement_type: 'retail_kirana' | 'flour_mill' | 'food_processor' | 'distributor';
  factory_godown_address: string;
  monthly_procurement_mt: string;
  unloading_bay_details?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  trade_category?: TradeCategory;
  business_name: string;
  gstin: string;
  pan_number?: string;
  phone: string;
  city?: string;
  state?: string;
  address: string;
  preferred_language?: string;
  wholesaler_details?: WholesalerDetails;
  mandi_details?: MandiTraderDetails;
  broker_details?: BrokerDetails;
  buyer_details?: BuyerEnterpriseDetails;
  created_at: string;
  is_onboarded?: boolean;
  avatar_url?: string;
  verification_tier?: 'standard' | 'enterprise_gold' | 'kyc_verified';
  fraud_risk_score?: number;
  auth_method?: 'google_oauth' | 'enterprise_sso' | 'demo_fastpass';
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name?: string;
  seller_business?: string;
  seller_gstin?: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  min_price: number; // Strictly private to seller agent, never leaked
  stock: number;
  gst_percent: number;
  transport_charge: number;
  delivery_days: number;
  is_active: boolean;
  unit: string;
  created_at: string;
}

export type BuyerRequestStatus = 'searching' | 'negotiating' | 'completed' | 'failed';

export interface BuyerRequest {
  id: string;
  buyer_id: string;
  buyer_name?: string;
  buyer_business?: string;
  buyer_gstin?: string;
  query: string;
  max_budget: number; // Max total budget per unit including taxes or total target
  quantity: number;
  deadline?: string;
  deadline_days?: number;
  status: BuyerRequestStatus;
  created_at: string;
}

export type AgentActionType =
  | 'search'
  | 'offer'
  | 'counter'
  | 'accept'
  | 'reject'
  | 'payment_initiated'
  | 'payment_success'
  | 'payment_link_resent'
  | 'invoice_generated'
  | 'deal_agreed'
  | 'no_deal_found';

export interface AgentAction {
  id: string;
  negotiation_id: string;
  transaction_id?: string;
  action_by: 'buyer_agent' | 'seller_agent' | 'system';
  action_type: AgentActionType;
  round?: number;
  price?: number;
  details: {
    message?: string;
    reason?: string;
    landed_cost?: number;
    budget_limit?: number;
    floor_price_enforced?: boolean;
    product_name?: string;
    [key: string]: any;
  };
  timestamp: string;
}

export interface NegotiationMessage {
  id: string;
  sender: 'buyer_agent' | 'seller_agent' | 'system';
  round: number;
  action: 'offer' | 'counter' | 'accept' | 'reject' | 'info';
  price: number;
  message: string;
  reason: string;
  timestamp: string;
  landed_cost?: {
    unit_price: number;
    gst_amount: number;
    transport_per_unit: number;
    total_unit_cost: number;
  };
}

export type NegotiationStatus = 'ongoing' | 'agreed' | 'failed';

export interface Negotiation {
  id: string;
  buyer_request_id: string;
  product_id: string;
  product?: Product;
  seller_id: string;
  seller?: User;
  buyer_id: string;
  buyer?: User;
  messages: NegotiationMessage[];
  rounds: number;
  final_price: number | null;
  status: NegotiationStatus;
  failure_reason?: string;
  created_at: string;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD' | 'SAR' | 'JPY' | 'CAD' | 'AUD';

export type IncotermType = 'FOB' | 'CIF' | 'EXW' | 'DDP' | 'CFR';

export interface CrossBorderInvoiceDetails {
  is_cross_border: boolean;
  export_currency: CurrencyCode;
  exchange_rate_to_inr: number; // 1 Foreign Currency = X INR (e.g. 87.25 for USD)
  inr_to_foreign_rate: number; // 1 INR = Y Foreign Currency (e.g. 0.01146 for USD)
  fx_provider: string; // e.g. "Fixer.io Live B2B FX API" | "RBI Reference Rate Engine"
  fx_timestamp: string;
  fx_spread_percent: number; // e.g. 0.5% hedging spread
  incoterm: IncotermType;
  port_of_loading: string; // e.g. "Nhava Sheva (JNPT), Mumbai [INNSA1]"
  port_of_discharge: string; // e.g. "Jebel Ali Port, Dubai [AEJEA]"
  destination_country: string; // e.g. "United Arab Emirates"
  iec_number: string; // 10-digit Importer-Exporter Code
  lut_arn_number: string; // GST LUT ARN for Zero-Rated Export (e.g. "AD070824001982X")
  foreign_unit_price: number;
  foreign_base_amount: number;
  foreign_transport_charge: number;
  foreign_total_amount: number;
  primary_inr_ledger_total: number; // Strict statutory INR base ledger amount
}

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface InvoiceData {
  bill_no: string;
  invoice_date: string;
  cross_border?: CrossBorderInvoiceDetails;
  seller: {
    name: string;
    business_name: string;
    gstin: string;
    phone: string;
    address: string;
  };
  buyer: {
    name: string;
    business_name: string;
    gstin: string;
    phone: string;
    address: string;
  };
  item: {
    product_id: string;
    name: string;
    hsn_code: string;
    quantity: number;
    unit: string;
    unit_price: number;
    base_amount: number;
    gst_percent: number;
    cgst_percent: number;
    cgst_amount: number;
    sgst_percent: number;
    sgst_amount: number;
    transport_charge: number;
    total_amount: number;
  };
  payment: {
    razorpay_payment_id?: string;
    razorpay_payment_link?: string;
    razorpay_order_id?: string;
    payment_status: PaymentStatus;
    paid_at?: string;
    method?: string;
  };
  audit_summary: {
    total_rounds: number;
    base_price: number;
    agreed_price: number;
    discount_secured: number;
    discount_percent: number;
    settlement_timestamp: string;
  };
}

export interface Transaction {
  id: string;
  bill_no: string;
  negotiation_id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  base_amount: number;
  gst_percent: number;
  gst_amount: number;
  transport_charge: number;
  total_amount: number;
  razorpay_payment_id?: string;
  razorpay_payment_link?: string;
  payment_status: PaymentStatus;
  cross_border?: CrossBorderInvoiceDetails;
  invoice_data?: InvoiceData;
  audit_trail: AgentAction[];
  created_at: string;
}

export interface LiveAuctionBid {
  id: string;
  bidder_id: string;
  bidder_name: string;
  bidder_type: 'human' | 'buyer_agent';
  bid_amount: number; // unit price
  total_bid_value: number;
  timestamp: string;
  strategy_reason?: string;
  is_winning?: boolean;
}

export interface LiveAuction {
  id: string;
  title: string;
  product_id: string;
  product_name: string;
  category: string;
  seller_id: string;
  seller_name: string;
  seller_business: string;
  quantity: number;
  unit: string;
  base_starting_price: number; // starting bid per unit
  reserve_price: number; // minimum reserve floor price per unit (confidential)
  current_highest_bid: number; // per unit
  current_winning_bidder_id?: string;
  current_winning_bidder_name?: string;
  current_winning_bidder_type?: 'human' | 'buyer_agent';
  status: 'upcoming' | 'live' | 'ended' | 'settled';
  ends_at_seconds: number; // countdown remaining
  bids: LiveAuctionBid[];
  gst_percent: number;
  transport_charge: number;
  auto_bidding_agents_enabled: boolean;
  total_bids_count: number;
  created_at: string;
  settlement_transaction_id?: string;
}

export interface VendorQuote {
  seller_id: string;
  seller_name: string;
  seller_business: string;
  seller_gstin: string;
  seller_rating: number;
  quoted_price: number;
  delivery_days: number;
  gst_percent: number;
  transport_charge: number;
  landed_cost_per_unit: number;
  total_order_cost: number;
  counter_rounds_conducted: number;
  score: number; // 0-100 composite score
  is_recommended: boolean;
  notes: string;
}

export interface MultiVendorRFQ {
  id: string;
  buyer_query: string;
  category: string;
  quantity: number;
  unit: string;
  max_budget: number;
  deadline_days: number;
  quotes: VendorQuote[];
  selected_seller_id?: string;
  status: 'comparing' | 'selected' | 'settled';
  created_at: string;
}

export interface ReconciliationRecord {
  id: string;
  transaction_id: string;
  order_date: string;
  product_name: string;
  buyer_business: string;
  seller_business: string;
  gross_invoice_amount: number;
  razorpay_captured_amount: number;
  razorpay_fee_deducted: number; // 2% gateway fee + GST
  tds_deducted_sec51: number; // 1% or 0.1% TDS on B2B
  net_settled_to_bank: number;
  bank_statement_received: number;
  bank_utr: string;
  gstr2b_tax_credit_available: number;
  reconciliation_status: 'matched' | 'discrepancy' | 'resolved' | 'pending_bank';
  discrepancy_reason?: string;
  auto_adjustment_voucher?: string;
}

export interface WebhookEvent {
  id: string;
  event_name: 'payment.captured' | 'payment.failed' | 'settlement.processed' | 'refund.processed' | 'invoice.generated';
  timestamp: string;
  payload: Record<string, any>;
  signature_verified: boolean;
  http_status: number;
  latency_ms: number;
}

export interface PlatformMetrics {

  totalNegotiations: number;
  dealSuccessRate: number; // percentage
  averageRounds: number;
  totalGMV: number; // in Rupees
  averageDiscountPercent: number;
  totalGSTProcessed: number; // in Rupees
  voiceQueriesCount?: number;
  voiceQueriesAnswered?: number;
}
