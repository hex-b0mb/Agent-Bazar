import { User, Product, Transaction, AgentAction, InvoiceData, BuyerRequest, LiveAuction, MultiVendorRFQ, ReconciliationRecord, WebhookEvent } from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'usr-seller-1',
    name: 'Rajesh Sharma',
    email: 'rajesh@agrihubindia.com',
    role: 'seller',
    business_name: 'AgriHub Super Grains Pvt Ltd',
    gstin: '07AAACA1234A1Z5',
    phone: '+91 98765 43210',
    address: 'Plot 42, APMC Grain Yard, Karnal, Haryana 132001',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'usr-seller-2',
    name: 'Vikram Patel',
    email: 'vikram@surattextiles.in',
    role: 'seller',
    business_name: 'Gujarat Apex Textiles LLP',
    gstin: '24AABCS8899K1ZV',
    phone: '+91 91234 56789',
    address: 'Mill Complex #12, Ring Road Textile Market, Surat, Gujarat 395002',
    created_at: '2026-01-12T11:30:00Z',
  },
  {
    id: 'usr-seller-3',
    name: 'Ananya Deshmukh',
    email: 'ananya@solarpowerpro.com',
    role: 'seller',
    business_name: 'Maharishi Clean Energy Tech',
    gstin: '27AAGCM4455E1ZQ',
    phone: '+91 94455 66778',
    address: 'Industrial Area Phase 2, Hinjawadi, Pune, Maharashtra 411057',
    created_at: '2026-01-15T09:15:00Z',
  },
  {
    id: 'usr-buyer-1',
    name: 'Amitabh Sen',
    email: 'amitabh@bengalhospitality.org',
    role: 'buyer',
    business_name: 'Bengal Royal Hotels & Banquets',
    gstin: '19AAECB7788J1ZR',
    phone: '+91 98300 11223',
    address: '14 Park Street, Kolkata, West Bengal 700016',
    created_at: '2026-01-18T14:20:00Z',
  },
  {
    id: 'usr-buyer-2',
    name: 'Priya Sundaram',
    email: 'priya@chennaicaterers.in',
    role: 'buyer',
    business_name: 'Sundaram Gourmet Kitchens',
    gstin: '33AABCS1122P1ZT',
    phone: '+91 94440 99887',
    address: '88 Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017',
    created_at: '2026-01-20T16:45:00Z',
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    seller_id: 'usr-seller-1',
    seller_name: 'Rajesh Sharma',
    seller_business: 'AgriHub Super Grains Pvt Ltd',
    seller_gstin: '07AAACA1234A1Z5',
    name: '1121 Supreme Aged Basmati Rice (Premium Export Grade)',
    category: 'Agricultural Commodities',
    description: 'Extra-long grain 8.4mm authentic basmati rice, 2-year moisture-controlled aging. Minimal breakage (<1%). Cleaned & graded for commercial banquets.',
    base_price: 85,
    min_price: 75, // Never go below 75 in negotiation
    stock: 5000,
    gst_percent: 5.0,
    transport_charge: 200,
    delivery_days: 3,
    is_active: true,
    unit: 'kg',
    created_at: '2026-02-01T08:00:00Z',
  },
  {
    id: 'prod-2',
    seller_id: 'usr-seller-1',
    seller_name: 'Rajesh Sharma',
    seller_business: 'AgriHub Super Grains Pvt Ltd',
    seller_gstin: '07AAACA1234A1Z5',
    name: 'Sharbati Wheat Grain (Unpolished High Protein)',
    category: 'Agricultural Commodities',
    description: 'Golden heavy-grain Sharbati wheat directly from Sehore farms. High gluten index, suitable for bakery & bulk atta milling.',
    base_price: 42,
    min_price: 36,
    stock: 8000,
    gst_percent: 5.0,
    transport_charge: 350,
    delivery_days: 4,
    is_active: true,
    unit: 'kg',
    created_at: '2026-02-05T09:30:00Z',
  },
  {
    id: 'prod-3',
    seller_id: 'usr-seller-2',
    seller_name: 'Vikram Patel',
    seller_business: 'Gujarat Apex Textiles LLP',
    seller_gstin: '24AABCS8899K1ZV',
    name: 'Commercial Poly-Cotton Table Linen Rolls (100% Spill Proof)',
    category: 'Hospitality Supplies',
    description: 'Heavy GSM jacquard woven tablecloth rolls with nanotech stain-repellent coating. Standard 60-inch width for luxury restaurant banquets.',
    base_price: 480,
    min_price: 410,
    stock: 350,
    gst_percent: 12.0,
    transport_charge: 150,
    delivery_days: 2,
    is_active: true,
    unit: 'meter',
    created_at: '2026-02-10T12:00:00Z',
  },
  {
    id: 'prod-4',
    seller_id: 'usr-seller-3',
    seller_name: 'Ananya Deshmukh',
    seller_business: 'Maharishi Clean Energy Tech',
    seller_gstin: '27AAGCM4455E1ZQ',
    name: 'Bi-Facial 550W Commercial Solar Monocrystalline PV Modules',
    category: 'Renewable Equipment',
    description: 'Tier-1 high efficiency solar panels with dual-sided power generation (+15% rear gain). IP68 junction boxes with 25-year linear warranty.',
    base_price: 13500,
    min_price: 11800,
    stock: 120,
    gst_percent: 18.0,
    transport_charge: 1200,
    delivery_days: 5,
    is_active: true,
    unit: 'panel',
    created_at: '2026-02-12T14:10:00Z',
  },
  {
    id: 'prod-5',
    seller_id: 'usr-seller-2',
    seller_name: 'Vikram Patel',
    seller_business: 'Gujarat Apex Textiles LLP',
    seller_gstin: '24AABCS8899K1ZV',
    name: 'Pure Supima Cotton 240 GSM Chef Uniform Sets',
    category: 'Industrial Workwear',
    description: 'Double-breasted heat-resistant chef coat & trousers set with breathable mesh vents and anti-microbial finish.',
    base_price: 1250,
    min_price: 980,
    stock: 450,
    gst_percent: 5.0,
    transport_charge: 180,
    delivery_days: 3,
    is_active: true,
    unit: 'set',
    created_at: '2026-02-15T10:00:00Z',
  }
];

export const SEED_REQUESTS: BuyerRequest[] = [
  {
    id: 'req-101',
    buyer_id: 'usr-buyer-1',
    buyer_name: 'Amitabh Sen',
    query: 'Need 50kg authentic aged 1121 basmati rice for wedding catering banquet, budget around ₹80/kg, delivery in 3 days',
    max_budget: 82,
    quantity: 50,
    deadline: '2026-03-02',
    status: 'completed',
    created_at: '2026-02-25T10:14:00Z',
  },
  {
    id: 'req-102',
    buyer_id: 'usr-buyer-2',
    buyer_name: 'Priya Sundaram',
    query: 'Procure 25 meters heavy stain-proof banquet table linen in royal burgundy color, budget max ₹440/meter',
    max_budget: 450,
    quantity: 25,
    deadline: '2026-03-05',
    status: 'completed',
    created_at: '2026-02-26T08:30:00Z',
  },
];

export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-1001',
    bill_no: 'A2A-20260225-1042',
    negotiation_id: 'neg-101',
    buyer_id: 'usr-buyer-1',
    seller_id: 'usr-seller-1',
    product_id: 'prod-1',
    product_name: '1121 Supreme Aged Basmati Rice (Premium Export Grade)',
    quantity: 50,
    unit_price: 75,
    base_amount: 3750,
    gst_percent: 5.0,
    gst_amount: 187.5,
    transport_charge: 200,
    total_amount: 4137.5,
    razorpay_payment_id: 'pay_Nz82KxL829m1A',
    razorpay_payment_link: 'https://rzp.io/i/a2a_bazaar_test_1042',
    payment_status: 'paid',
    created_at: '2026-02-25T10:18:22Z',
    audit_trail: [
      {
        id: 'act-1',
        negotiation_id: 'neg-101',
        action_by: 'buyer_agent',
        action_type: 'search',
        details: {
          message: 'Scanned 5 supplier listings. Matched AgriHub Super Grains product "1121 Supreme Aged Basmati Rice" (Stock: 5000kg, Rating: 4.9).',
          reason: 'Meets 8.4mm aging and delivery timeline constraint.'
        },
        timestamp: '2026-02-25T10:14:05Z'
      },
      {
        id: 'act-2',
        negotiation_id: 'neg-101',
        action_by: 'buyer_agent',
        action_type: 'offer',
        round: 1,
        price: 70,
        details: {
          message: 'Initial bid of ₹70/kg for 50kg batch.',
          reason: 'Starting bid anchored at 85% of buyer max budget (₹82/kg) to maximize buyer surplus.'
        },
        timestamp: '2026-02-25T10:14:30Z'
      },
      {
        id: 'act-3',
        negotiation_id: 'neg-101',
        action_by: 'seller_agent',
        action_type: 'counter',
        round: 1,
        price: 78,
        details: {
          message: 'Floor is strictly protected. Counter-offered ₹78/kg.',
          reason: 'Buyer offer ₹70 < minimum floor price ₹75. Computed counter at midpoint between floor and base price ₹85.'
        },
        timestamp: '2026-02-25T10:15:10Z'
      },
      {
        id: 'act-4',
        negotiation_id: 'neg-101',
        action_by: 'buyer_agent',
        action_type: 'counter',
        round: 2,
        price: 74,
        details: {
          message: 'Incremented bid to ₹74/kg.',
          reason: 'Scaled offer upward by 5.7% to maintain momentum while staying safely below ceiling.'
        },
        timestamp: '2026-02-25T10:15:45Z'
      },
      {
        id: 'act-5',
        negotiation_id: 'neg-101',
        action_by: 'seller_agent',
        action_type: 'counter',
        round: 2,
        price: 75,
        details: {
          message: 'Best and final offer presented at ₹75/kg.',
          reason: 'Reached seller minimum threshold boundary. Ready to close for fast inventory clearance.'
        },
        timestamp: '2026-02-25T10:16:15Z'
      },
      {
        id: 'act-6',
        negotiation_id: 'neg-101',
        action_by: 'buyer_agent',
        action_type: 'accept',
        round: 3,
        price: 75,
        details: {
          message: 'Deal accepted at ₹75/kg.',
          reason: 'Total Landed Cost = ₹75 + 5% GST (₹3.75) + ₹4.00 transport/kg = ₹82.75 total landed, within target envelope.'
        },
        timestamp: '2026-02-25T10:16:50Z'
      },
      {
        id: 'act-7',
        negotiation_id: 'neg-101',
        action_by: 'system',
        action_type: 'deal_agreed',
        price: 75,
        details: {
          message: 'Consensus confirmed by cryptographic negotiation engine contract.',
          reason: 'Generated Razorpay Test Order and issued instant payment trigger.'
        },
        timestamp: '2026-02-25T10:17:00Z'
      },
      {
        id: 'act-8',
        negotiation_id: 'neg-101',
        transaction_id: 'txn-1001',
        action_by: 'system',
        action_type: 'payment_success',
        details: {
          message: 'Razorpay webhook signature verified: pay_Nz82KxL829m1A',
          reason: 'Autonomous debit confirmed via Razorpay Test Gateway.'
        },
        timestamp: '2026-02-25T10:18:22Z'
      },
      {
        id: 'act-9',
        negotiation_id: 'neg-101',
        transaction_id: 'txn-1001',
        action_by: 'system',
        action_type: 'invoice_generated',
        details: {
          message: 'Generated GST Tax Invoice A2A-20260225-1042 with digital seal.',
          reason: 'Invoice archived to immutable Transaction Vault.'
        },
        timestamp: '2026-02-25T10:18:25Z'
      }
    ],
    invoice_data: {
      bill_no: 'A2A-20260225-1042',
      invoice_date: '2026-02-25',
      seller: {
        name: 'Rajesh Sharma',
        business_name: 'AgriHub Super Grains Pvt Ltd',
        gstin: '07AAACA1234A1Z5',
        phone: '+91 98765 43210',
        address: 'Plot 42, APMC Grain Yard, Karnal, Haryana 132001'
      },
      buyer: {
        name: 'Amitabh Sen',
        business_name: 'Bengal Royal Hotels & Banquets',
        gstin: '19AAECB7788J1ZR',
        phone: '+91 98300 11223',
        address: '14 Park Street, Kolkata, West Bengal 700016'
      },
      item: {
        product_id: 'prod-1',
        name: '1121 Supreme Aged Basmati Rice (Premium Export Grade)',
        hsn_code: '1006.30',
        quantity: 50,
        unit: 'kg',
        unit_price: 75,
        base_amount: 3750,
        gst_percent: 5.0,
        cgst_percent: 2.5,
        cgst_amount: 93.75,
        sgst_percent: 2.5,
        sgst_amount: 93.75,
        transport_charge: 200,
        total_amount: 4137.5
      },
      payment: {
        razorpay_payment_id: 'pay_Nz82KxL829m1A',
        razorpay_order_id: 'order_A2A_829910',
        payment_status: 'paid',
        paid_at: '2026-02-25 15:48:22 IST',
        method: 'Razorpay UPI Autopay'
      },
      audit_summary: {
        total_rounds: 3,
        base_price: 85,
        agreed_price: 75,
        discount_secured: 500,
        discount_percent: 11.76,
        settlement_timestamp: '2026-02-25T10:16:50Z'
      }
    }
  },
  {
    id: 'txn-1002',
    bill_no: 'A2A-20260226-7819',
    negotiation_id: 'neg-102',
    buyer_id: 'usr-buyer-2',
    seller_id: 'usr-seller-2',
    product_id: 'prod-3',
    product_name: 'Commercial Poly-Cotton Table Linen Rolls (100% Spill Proof)',
    quantity: 25,
    unit_price: 420,
    base_amount: 10500,
    gst_percent: 12.0,
    gst_amount: 1260,
    transport_charge: 150,
    total_amount: 11910,
    razorpay_payment_id: 'pay_Px99Qm4312v8B',
    razorpay_payment_link: 'https://rzp.io/i/a2a_bazaar_test_7819',
    payment_status: 'paid',
    created_at: '2026-02-26T08:34:10Z',
    audit_trail: [
      {
        id: 'act-201',
        negotiation_id: 'neg-102',
        action_by: 'buyer_agent',
        action_type: 'search',
        details: { message: 'Found Gujarat Apex Textiles linen listing matching 25m burgundy requirements.' },
        timestamp: '2026-02-26T08:30:10Z'
      },
      {
        id: 'act-202',
        negotiation_id: 'neg-102',
        action_by: 'buyer_agent',
        action_type: 'offer',
        round: 1,
        price: 390,
        details: { message: 'Bid ₹390/m', reason: '88% of target budget.' },
        timestamp: '2026-02-26T08:30:40Z'
      },
      {
        id: 'act-203',
        negotiation_id: 'neg-102',
        action_by: 'seller_agent',
        action_type: 'counter',
        round: 1,
        price: 430,
        details: { message: 'Counter ₹430/m', reason: 'Floor is ₹410, base is ₹480.' },
        timestamp: '2026-02-26T08:31:20Z'
      },
      {
        id: 'act-204',
        negotiation_id: 'neg-102',
        action_by: 'buyer_agent',
        action_type: 'counter',
        round: 2,
        price: 420,
        details: { message: 'Counter ₹420/m', reason: 'Fits total budget with 12% GST.' },
        timestamp: '2026-02-26T08:32:00Z'
      },
      {
        id: 'act-205',
        negotiation_id: 'neg-102',
        action_by: 'seller_agent',
        action_type: 'accept',
        round: 2,
        price: 420,
        details: { message: 'Accepted at ₹420/m', reason: 'Satisfies seller margin of ₹410.' },
        timestamp: '2026-02-26T08:32:30Z'
      },
      {
        id: 'act-206',
        negotiation_id: 'neg-102',
        transaction_id: 'txn-1002',
        action_by: 'system',
        action_type: 'payment_success',
        details: { message: 'Razorpay payment verified: pay_Px99Qm4312v8B' },
        timestamp: '2026-02-26T08:34:10Z'
      }
    ],
    invoice_data: {
      bill_no: 'A2A-20260226-7819',
      invoice_date: '2026-02-26',
      seller: {
        name: 'Vikram Patel',
        business_name: 'Gujarat Apex Textiles LLP',
        gstin: '24AABCS8899K1ZV',
        phone: '+91 91234 56789',
        address: 'Mill Complex #12, Ring Road Textile Market, Surat, Gujarat 395002'
      },
      buyer: {
        name: 'Priya Sundaram',
        business_name: 'Sundaram Gourmet Kitchens',
        gstin: '33AABCS1122P1ZT',
        phone: '+91 94440 99887',
        address: '88 Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017'
      },
      item: {
        product_id: 'prod-3',
        name: 'Commercial Poly-Cotton Table Linen Rolls (100% Spill Proof)',
        hsn_code: '5208.52',
        quantity: 25,
        unit: 'meter',
        unit_price: 420,
        base_amount: 10500,
        gst_percent: 12.0,
        cgst_percent: 6.0,
        cgst_amount: 630,
        sgst_percent: 6.0,
        sgst_amount: 630,
        transport_charge: 150,
        total_amount: 11910
      },
      payment: {
        razorpay_payment_id: 'pay_Px99Qm4312v8B',
        razorpay_order_id: 'order_A2A_992144',
        payment_status: 'paid',
        paid_at: '2026-02-26 14:04:10 IST',
        method: 'Razorpay Corporate Netbanking'
      },
      audit_summary: {
        total_rounds: 2,
        base_price: 480,
        agreed_price: 420,
        discount_secured: 1500,
        discount_percent: 12.5,
        settlement_timestamp: '2026-02-26T08:32:30Z'
      }
    }
  },
  {
    id: 'txn-1003',
    bill_no: 'A2A-20260224-4190',
    negotiation_id: 'neg-103',
    buyer_id: 'usr-buyer-1',
    seller_id: 'usr-seller-3',
    product_id: 'prod-4',
    product_name: 'Bi-Facial 550W Commercial Solar Monocrystalline PV Modules',
    quantity: 4,
    unit_price: 12200,
    base_amount: 48800,
    gst_percent: 18.0,
    gst_amount: 8784,
    transport_charge: 1200,
    total_amount: 58784,
    razorpay_payment_link: 'https://rzp.io/i/a2a_bazaar_sol_4190',
    payment_status: 'pending',
    created_at: new Date(Date.now() - 38 * 3600 * 1000).toISOString(),
    audit_trail: [
      {
        id: 'act-301',
        negotiation_id: 'neg-103',
        action_by: 'buyer_agent',
        action_type: 'offer',
        round: 1,
        price: 11900,
        details: { message: 'Bid ₹11,900/panel for 4 units', reason: 'High capacity commercial requirement' },
        timestamp: new Date(Date.now() - 38.5 * 3600 * 1000).toISOString()
      },
      {
        id: 'act-302',
        negotiation_id: 'neg-103',
        action_by: 'seller_agent',
        action_type: 'counter',
        round: 1,
        price: 12400,
        details: { message: 'Counter-offered ₹12,400/panel', reason: 'Floor is ₹11,800' },
        timestamp: new Date(Date.now() - 38.3 * 3600 * 1000).toISOString()
      },
      {
        id: 'act-303',
        negotiation_id: 'neg-103',
        action_by: 'buyer_agent',
        action_type: 'accept',
        round: 2,
        price: 12200,
        details: { message: 'Consensus agreed at ₹12,200/panel', reason: 'Within institutional procurement envelope' },
        timestamp: new Date(Date.now() - 38.1 * 3600 * 1000).toISOString()
      },
      {
        id: 'act-304',
        negotiation_id: 'neg-103',
        action_by: 'system',
        action_type: 'deal_agreed',
        price: 12200,
        details: { message: 'Contract minted. Generated Razorpay Payment Link.', reason: 'Awaiting buyer treasury disbursement.' },
        timestamp: new Date(Date.now() - 38 * 3600 * 1000).toISOString()
      }
    ],
    invoice_data: {
      bill_no: 'A2A-20260224-4190',
      invoice_date: new Date(Date.now() - 38 * 3600 * 1000).toISOString().split('T')[0],
      seller: {
        name: 'Ananya Deshmukh',
        business_name: 'Maharishi Clean Energy Tech',
        gstin: '27AAGCM4455E1ZQ',
        phone: '+91 98220 33445',
        address: 'Electronic Zone, MIDC Bhosari, Pune, Maharashtra 411026'
      },
      buyer: {
        name: 'Amitabh Sen',
        business_name: 'Bengal Royal Hotels & Banquets',
        gstin: '19AAECB7788J1ZR',
        phone: '+91 98300 11223',
        address: '14 Park Street, Kolkata, West Bengal 700016'
      },
      item: {
        product_id: 'prod-4',
        name: 'Bi-Facial 550W Commercial Solar Monocrystalline PV Modules',
        hsn_code: '8541.40',
        quantity: 4,
        unit: 'panel',
        unit_price: 12200,
        base_amount: 48800,
        gst_percent: 18.0,
        cgst_percent: 9.0,
        cgst_amount: 4392,
        sgst_percent: 9.0,
        sgst_amount: 4392,
        transport_charge: 1200,
        total_amount: 58784
      },
      payment: {
        razorpay_payment_link: 'https://rzp.io/i/a2a_bazaar_sol_4190',
        payment_status: 'pending',
        method: 'Razorpay Autonomous Smart Escrow (Awaiting Authorization)'
      },
      audit_summary: {
        total_rounds: 2,
        base_price: 13500,
        agreed_price: 12200,
        discount_secured: 5200,
        discount_percent: 9.63,
        settlement_timestamp: new Date(Date.now() - 38 * 3600 * 1000).toISOString()
      }
    }
  },
  {
    id: 'txn-1004',
    bill_no: 'A2A-20260227-9021',
    negotiation_id: 'neg-104',
    buyer_id: 'usr-buyer-1',
    seller_id: 'usr-seller-2',
    product_id: 'prod-5',
    product_name: 'Pure Supima Cotton 240 GSM Chef Uniform Sets',
    quantity: 20,
    unit_price: 1020,
    base_amount: 20400,
    gst_percent: 5.0,
    gst_amount: 1020,
    transport_charge: 180,
    total_amount: 21600,
    razorpay_payment_link: 'https://rzp.io/i/a2a_bazaar_chef_9021',
    payment_status: 'pending',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    audit_trail: [
      {
        id: 'act-401',
        negotiation_id: 'neg-104',
        action_by: 'buyer_agent',
        action_type: 'offer',
        round: 1,
        price: 990,
        details: { message: 'Bid ₹990/set for 20 sets', reason: 'Hospitality bulk expansion' },
        timestamp: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString()
      },
      {
        id: 'act-402',
        negotiation_id: 'neg-104',
        action_by: 'seller_agent',
        action_type: 'counter',
        round: 1,
        price: 1050,
        details: { message: 'Counter ₹1050/set', reason: 'Floor margin ₹980' },
        timestamp: new Date(Date.now() - 4.2 * 3600 * 1000).toISOString()
      },
      {
        id: 'act-403',
        negotiation_id: 'neg-104',
        action_by: 'buyer_agent',
        action_type: 'accept',
        round: 2,
        price: 1020,
        details: { message: 'Deal agreed at ₹1020/set', reason: 'Excellent 18.4% discount' },
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
      }
    ],
    invoice_data: {
      bill_no: 'A2A-20260227-9021',
      invoice_date: new Date(Date.now() - 4 * 3600 * 1000).toISOString().split('T')[0],
      seller: {
        name: 'Vikram Patel',
        business_name: 'Gujarat Apex Textiles LLP',
        gstin: '24AABCS8899K1ZV',
        phone: '+91 91234 56789',
        address: 'Mill Complex #12, Surat, Gujarat 395002'
      },
      buyer: {
        name: 'Amitabh Sen',
        business_name: 'Bengal Royal Hotels & Banquets',
        gstin: '19AAECB7788J1ZR',
        phone: '+91 98300 11223',
        address: '14 Park Street, Kolkata, West Bengal 700016'
      },
      item: {
        product_id: 'prod-5',
        name: 'Pure Supima Cotton 240 GSM Chef Uniform Sets',
        hsn_code: '6211.32',
        quantity: 20,
        unit: 'set',
        unit_price: 1020,
        base_amount: 20400,
        gst_percent: 5.0,
        cgst_percent: 2.5,
        cgst_amount: 510,
        sgst_percent: 2.5,
        sgst_amount: 510,
        transport_charge: 180,
        total_amount: 21600
      },
      payment: {
        razorpay_payment_link: 'https://rzp.io/i/a2a_bazaar_chef_9021',
        payment_status: 'pending',
        method: 'Razorpay Autonomous Smart Escrow (Recent Deal)'
      },
      audit_summary: {
        total_rounds: 2,
        base_price: 1250,
        agreed_price: 1020,
        discount_secured: 4600,
        discount_percent: 18.4,
        settlement_timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
      }
    }
  }
];

export const SEED_AGENT_ACTIONS: AgentAction[] = [
  ...SEED_TRANSACTIONS[0].audit_trail,
  ...SEED_TRANSACTIONS[1].audit_trail,
];

export const INITIAL_METRICS = {
  totalNegotiations: 28,
  dealSuccessRate: 92.8,
  averageRounds: 2.6,
  totalGMV: 184550,
  averageDiscountPercent: 12.4,
  totalGSTProcessed: 22146,
  voiceQueriesCount: 64,
};

export const SEED_AUCTIONS: LiveAuction[] = [
  {
    id: 'auction-1',
    title: '🌾 Bulk 500kg Premium 1121 Aged Basmati Rice Lot',
    product_id: 'prod-1',
    product_name: '1121 Supreme Aged Basmati Rice (Premium Export Grade)',
    category: 'Agricultural Commodities',
    seller_id: 'usr-seller-1',
    seller_name: 'Rajesh Sharma',
    seller_business: 'AgriHub Super Grains Pvt Ltd',
    quantity: 500,
    unit: 'kg',
    base_starting_price: 65,
    reserve_price: 74, // Must meet ₹74/kg
    current_highest_bid: 78,
    current_winning_bidder_id: 'usr-buyer-1',
    current_winning_bidder_name: 'Bengal Royal Hotels AI Agent',
    current_winning_bidder_type: 'buyer_agent',
    status: 'live',
    ends_at_seconds: 75,
    gst_percent: 5.0,
    transport_charge: 600,
    auto_bidding_agents_enabled: true,
    total_bids_count: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    bids: [
      {
        id: 'bid-1',
        bidder_id: 'usr-buyer-2',
        bidder_name: 'Sundaram Kitchens AI',
        bidder_type: 'buyer_agent',
        bid_amount: 68,
        total_bid_value: 34000,
        timestamp: new Date(Date.now() - 1000 * 180).toLocaleTimeString('en-IN'),
        strategy_reason: 'Initial probe bid 4% above opening price.',
      },
      {
        id: 'bid-2',
        bidder_id: 'usr-buyer-3',
        bidder_name: 'Metro Cash & Carry Procurement Bot',
        bidder_type: 'buyer_agent',
        bid_amount: 72,
        total_bid_value: 36000,
        timestamp: new Date(Date.now() - 1000 * 120).toLocaleTimeString('en-IN'),
        strategy_reason: 'Aggressive volume bid for weekly retail restock.',
      },
      {
        id: 'bid-3',
        bidder_id: 'usr-buyer-1',
        bidder_name: 'Bengal Royal Hotels AI Agent',
        bidder_type: 'buyer_agent',
        bid_amount: 75,
        total_bid_value: 37500,
        timestamp: new Date(Date.now() - 1000 * 60).toLocaleTimeString('en-IN'),
        strategy_reason: 'High banquet demand for weekend wedding season.',
      },
      {
        id: 'bid-4',
        bidder_id: 'usr-buyer-2',
        bidder_name: 'Sundaram Kitchens AI',
        bidder_type: 'buyer_agent',
        bid_amount: 77,
        total_bid_value: 38500,
        timestamp: new Date(Date.now() - 1000 * 25).toLocaleTimeString('en-IN'),
        strategy_reason: 'Counter-bid staying strictly below ceiling budget of ₹80/kg.',
      },
      {
        id: 'bid-5',
        bidder_id: 'usr-buyer-1',
        bidder_name: 'Bengal Royal Hotels AI Agent',
        bidder_type: 'buyer_agent',
        bid_amount: 78,
        total_bid_value: 39000,
        timestamp: new Date(Date.now() - 1000 * 5).toLocaleTimeString('en-IN'),
        strategy_reason: 'Optimal counter-bid capturing lot advantage before timer expiry.',
        is_winning: true,
      },
    ],
  },
  {
    id: 'auction-2',
    title: '☀️ Lot of 25x 550W Commercial Bi-Facial Solar PV Modules',
    product_id: 'prod-4',
    product_name: 'Bi-Facial 550W Commercial Solar Monocrystalline PV Modules',
    category: 'Renewable Equipment',
    seller_id: 'usr-seller-3',
    seller_name: 'Ananya Deshmukh',
    seller_business: 'Maharishi Clean Energy Tech',
    quantity: 25,
    unit: 'panel',
    base_starting_price: 10500,
    reserve_price: 11600,
    current_highest_bid: 11950,
    current_winning_bidder_id: 'usr-buyer-4',
    current_winning_bidder_name: 'Apex Green Infra Bot',
    current_winning_bidder_type: 'buyer_agent',
    status: 'live',
    ends_at_seconds: 140,
    gst_percent: 18.0,
    transport_charge: 2500,
    auto_bidding_agents_enabled: true,
    total_bids_count: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    bids: [
      {
        id: 'bid-201',
        bidder_id: 'usr-buyer-5',
        bidder_name: 'SunPower Rooftops AI',
        bidder_type: 'buyer_agent',
        bid_amount: 11000,
        total_bid_value: 275000,
        timestamp: new Date(Date.now() - 1000 * 200).toLocaleTimeString('en-IN'),
        strategy_reason: 'Entry bid on Tier-1 bi-facial hardware.',
      },
      {
        id: 'bid-202',
        bidder_id: 'usr-buyer-4',
        bidder_name: 'Apex Green Infra Bot',
        bidder_type: 'buyer_agent',
        bid_amount: 11950,
        total_bid_value: 298750,
        timestamp: new Date(Date.now() - 1000 * 45).toLocaleTimeString('en-IN'),
        strategy_reason: 'Pre-approved commercial EPC budget allocation.',
        is_winning: true,
      },
    ],
  },
  {
    id: 'auction-3',
    title: '🧵 100m High-GSM Poly-Cotton Banquet Table Linen Rolls',
    product_id: 'prod-3',
    product_name: 'Commercial Poly-Cotton Table Linen Rolls',
    category: 'Hospitality Supplies',
    seller_id: 'usr-seller-2',
    seller_name: 'Vikram Patel',
    seller_business: 'Gujarat Apex Textiles LLP',
    quantity: 100,
    unit: 'meter',
    base_starting_price: 360,
    reserve_price: 410,
    current_highest_bid: 425,
    current_winning_bidder_id: 'usr-buyer-1',
    current_winning_bidder_name: 'Bengal Royal Hotels AI Agent',
    current_winning_bidder_type: 'buyer_agent',
    status: 'ended',
    ends_at_seconds: 0,
    gst_percent: 12.0,
    transport_charge: 350,
    auto_bidding_agents_enabled: true,
    total_bids_count: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    settlement_transaction_id: 'tx-001',
    bids: [
      {
        id: 'bid-301',
        bidder_id: 'usr-buyer-1',
        bidder_name: 'Bengal Royal Hotels AI Agent',
        bidder_type: 'buyer_agent',
        bid_amount: 425,
        total_bid_value: 42500,
        timestamp: '11:45 AM',
        strategy_reason: 'Met reserve requirements; auction closed.',
        is_winning: true,
      },
    ],
  },
];

export const SEED_RFQS: MultiVendorRFQ[] = [
  {
    id: 'rfq-001',
    buyer_query: '100kg Pure Sharbati Wheat Grain (Bakery & Milling Grade)',
    category: 'Agricultural Commodities',
    quantity: 100,
    unit: 'kg',
    max_budget: 40,
    deadline_days: 3,
    status: 'comparing',
    created_at: '2026-02-20T10:00:00Z',
    quotes: [
      {
        seller_id: 'usr-seller-1',
        seller_name: 'Rajesh Sharma',
        seller_business: 'AgriHub Super Grains Pvt Ltd',
        seller_gstin: '07AAACA1234A1Z5',
        seller_rating: 4.9,
        quoted_price: 37,
        delivery_days: 3,
        gst_percent: 5.0,
        transport_charge: 250,
        landed_cost_per_unit: 39.35,
        total_order_cost: 3935,
        counter_rounds_conducted: 3,
        score: 96,
        is_recommended: true,
        notes: 'Lowest landed cost, highest quality test certificate, delivery in 3 days.',
      },
      {
        seller_id: 'usr-seller-4',
        seller_name: 'Harpreet Singh',
        seller_business: 'Punjab Agri Corp Ltd',
        seller_gstin: '03AABCP9900L1ZQ',
        seller_rating: 4.6,
        quoted_price: 38.5,
        delivery_days: 2,
        gst_percent: 5.0,
        transport_charge: 350,
        landed_cost_per_unit: 41.92,
        total_order_cost: 4192,
        counter_rounds_conducted: 2,
        score: 84,
        is_recommended: false,
        notes: 'Faster 2-day delivery but higher freight charges.',
      },
      {
        seller_id: 'usr-seller-5',
        seller_name: 'Kailash Meena',
        seller_business: 'Jaipur Grain Mandi Exporters',
        seller_gstin: '08AACCK5544P1ZM',
        seller_rating: 4.4,
        quoted_price: 39.0,
        delivery_days: 5,
        gst_percent: 5.0,
        transport_charge: 400,
        landed_cost_per_unit: 44.95,
        total_order_cost: 4495,
        counter_rounds_conducted: 2,
        score: 72,
        is_recommended: false,
        notes: '5-day delivery window exceeds preference SLA.',
      },
    ],
  },
];

export const SEED_RECONCILIATIONS: ReconciliationRecord[] = [
  {
    id: 'rec-001',
    transaction_id: 'txn-101',
    order_date: '2026-08-25',
    product_name: 'Premium Basmati Rice (1121 Steam Grade)',
    buyer_business: 'Bengal Royal Hotels & Banquets',
    seller_business: 'Karnal Agri-Commodities Wholesale Ltd',
    gross_invoice_amount: 8087.50,
    razorpay_captured_amount: 8087.50,
    razorpay_fee_deducted: 190.87, // 2% + GST
    tds_deducted_sec51: 8.09, // 0.1% TDS
    net_settled_to_bank: 7888.54,
    bank_statement_received: 7888.54,
    bank_utr: 'UTR_HDFC_992817264501',
    gstr2b_tax_credit_available: 385.00,
    reconciliation_status: 'matched',
  },
  {
    id: 'rec-002',
    transaction_id: 'txn-102',
    order_date: '2026-08-25',
    product_name: '550W Commercial Bi-Facial Solar Panels',
    buyer_business: 'Bengal Royal Hotels & Banquets',
    seller_business: 'Surat CleanTech Hardware Mart',
    gross_invoice_amount: 142200.00,
    razorpay_captured_amount: 142200.00,
    razorpay_fee_deducted: 3355.92,
    tds_deducted_sec51: 142.20,
    net_settled_to_bank: 138701.88,
    bank_statement_received: 138559.68, // Discrepancy: ₹142.20 TDS withholding timing mismatch
    bank_utr: 'UTR_ICICI_883719203912',
    gstr2b_tax_credit_available: 21600.00,
    reconciliation_status: 'discrepancy',
    discrepancy_reason: 'TDS Section 51 ₹142.20 withheld at source by buyer before bank credit. Auto-journal voucher generated.',
    auto_adjustment_voucher: 'JV-2026-TDS-8819',
  },
  {
    id: 'rec-003',
    transaction_id: 'txn-103',
    order_date: '2026-08-24',
    product_name: 'Heavy Duty Stainless Steel Commercial Kitchen Worktable',
    buyer_business: 'Sundaram Gourmet Fast-Casual Chain',
    seller_business: 'Apex Fabricators & Steel Works',
    gross_invoice_amount: 54100.00,
    razorpay_captured_amount: 54100.00,
    razorpay_fee_deducted: 1276.76,
    tds_deducted_sec51: 54.10,
    net_settled_to_bank: 52769.14,
    bank_statement_received: 52769.14,
    bank_utr: 'UTR_SBI_774910293819',
    gstr2b_tax_credit_available: 8100.00,
    reconciliation_status: 'matched',
  },
  {
    id: 'rec-004',
    transaction_id: 'txn-104',
    order_date: '2026-08-23',
    product_name: 'Commercial Grade Spill-Proof Banquet Table Linen',
    buyer_business: 'Bengal Royal Hotels & Banquets',
    seller_business: 'LoomKraft Textiles Ltd',
    gross_invoice_amount: 9478.00,
    razorpay_captured_amount: 9478.00,
    razorpay_fee_deducted: 223.68,
    tds_deducted_sec51: 9.48,
    net_settled_to_bank: 9244.84,
    bank_statement_received: 9244.84,
    bank_utr: 'UTR_AXIS_661029384721',
    gstr2b_tax_credit_available: 1008.00,
    reconciliation_status: 'matched',
  }
];

export const SEED_WEBHOOKS: WebhookEvent[] = [
  {
    id: 'evt_pay_9921',
    event_name: 'payment.captured',
    timestamp: '2026-08-26T08:42:10Z',
    signature_verified: true,
    http_status: 200,
    latency_ms: 184,
    payload: {
      entity: 'event',
      account_id: 'acc_rzp_b2b_agent_01',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_OMN9B881729',
            amount: 808750,
            currency: 'INR',
            status: 'captured',
            order_id: 'order_B2B_1121_RICE',
            method: 'upi',
            bank: 'HDFC Bank Ltd',
            vpa: 'buyer.bengalbanquet@okhdfcbank',
            email: 'finance@bengalbanquets.com',
            contact: '+919830011223',
            fee: 19087,
            tax: 2912,
            notes: {
              bill_no: 'BILL-101',
              negotiated_rounds: 3,
              gstin: '19AAECB7788J1ZR'
            }
          }
        }
      }
    }
  },
  {
    id: 'evt_set_4492',
    event_name: 'settlement.processed',
    timestamp: '2026-08-26T08:45:00Z',
    signature_verified: true,
    http_status: 200,
    latency_ms: 210,
    payload: {
      entity: 'event',
      account_id: 'acc_rzp_b2b_agent_01',
      event: 'settlement.processed',
      contains: ['settlement'],
      payload: {
        settlement: {
          entity: {
            id: 'setl_992817264',
            amount: 788854,
            status: 'processed',
            utr: 'UTR_HDFC_992817264501',
            fees: 19087,
            tax: 2912
          }
        }
      }
    }
  }
];

export const DEMO_PRESETS = [
  {
    id: 'preset-rice',
    product_id: 'prod-1',
    title: '🌾 50kg Basmati Rice (Banquet Catering)',
    prompt: 'I need 50kg basmati rice under ₹80/kg, deliver within 3 days to Mumbai catering kitchen.',
    max_budget: 82,
    quantity: 50,
    deadline_days: 3,
    expected_outcome: 'Negotiates from ₹85 to ₹75 floor price, adds 5% GST + ₹200 transport.'
  },
  {
    id: 'preset-linen',
    product_id: 'prod-3',
    title: '🧵 20m Spill-Proof Tablecloth Rolls',
    prompt: 'Need 20 meters commercial stain-proof table linen for hotel banquet hall, budget max ₹440/m, deliver in 2 days.',
    max_budget: 450,
    quantity: 20,
    deadline_days: 2,
    expected_outcome: 'Negotiates from ₹480 base to ₹420, calculates 12% GST.'
  },
  {
    id: 'preset-solar',
    product_id: 'prod-4',
    title: '☀️ 10x 550W Bi-Facial Commercial Solar Panels',
    prompt: 'Looking for 10 units high-efficiency 550W bi-facial solar panels with IP68 junction boxes, target price ₹12,500/panel with 18% GST.',
    max_budget: 12500,
    quantity: 10,
    deadline_days: 5,
    expected_outcome: 'Autonomous multi-round haggling from ₹13,500 base down to ₹12,000 agreed price.'
  },
  {
    id: 'preset-uniforms',
    product_id: 'prod-5',
    title: '👨‍🍳 30 Sets Supima Chef Uniforms',
    prompt: 'Procure 30 sets of heat-resistant 240 GSM chef jackets & trousers, budget under ₹1100 per set.',
    max_budget: 1100,
    quantity: 30,
    deadline_days: 3,
    expected_outcome: 'Agent secures bulk concession from ₹1250 down to ₹1020/set.'
  }
];
