import React, { useState, useEffect, useRef } from 'react';
import { 
  UserRole, 
  Product, 
  BuyerRequest, 
  Transaction, 
  AgentAction, 
  NegotiationMessage, 
  PlatformMetrics,
  PriceAlert
} from './types';
import { 
  SEED_USERS, 
  SEED_PRODUCTS, 
  SEED_REQUESTS as SEED_BUYER_REQUESTS, 
  SEED_TRANSACTIONS, 
  SEED_AGENT_ACTIONS, 
  DEMO_PRESETS 
} from './data/seedData';
import { AgentNegotiationEngine } from './services/negotiationEngine';
import { PriceAlertService } from './services/priceAlertService';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { RazorpayModal } from './components/RazorpayModal';
import { InvoiceModal } from './components/InvoiceModal';
import { EWayBillModal } from './components/EWayBillModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { LiveTransitTrackerModal } from './components/LiveTransitTrackerModal';
import { DigitalPoDModal } from './components/DigitalPoDModal';
import { SplitSettlementModal } from './components/SplitSettlementModal';
import { AutopayMandateModal } from './components/AutopayMandateModal';
import { WhatsAppSimulatorModal } from './components/WhatsAppSimulatorModal';
import { EmailInboxModal } from './components/EmailInboxModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { PriceAlertToast } from './components/PriceAlertToast';
import { JudgeQuickTourModal } from './components/JudgeQuickTourModal';
import { MessageSquare } from 'lucide-react';
import { MockEmailService } from './services/emailService';
import { verifyTransactionComplianceInSupabase } from './services/supabase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Home } from './pages/Home';
import { LiveNegotiation } from './pages/LiveNegotiation';
import { SellerDashboard } from './pages/SellerDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { TransactionVault } from './pages/TransactionVault';
import { ComplianceHub } from './pages/ComplianceHub';
import { SubmissionKit } from './pages/SubmissionKit';
import { LiveAuctionHub } from './pages/LiveAuctionHub';
import { FinanceReconciliationHub } from './pages/FinanceReconciliationHub';
import { OndcGemProtocolHub } from './pages/OndcGemProtocolHub';
import { TredsFactoringHub } from './pages/TredsFactoringHub';
import { LoginPage } from './pages/LoginPage';

function MainAppContent() {
  const { user, requireAuth, isLoading } = useAuth();
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeRole, setActiveRole] = useState<UserRole>('buyer');

  // Core Data Stores
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>(SEED_BUYER_REQUESTS);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [agentActions, setAgentActions] = useState<AgentAction[]>(SEED_AGENT_ACTIONS);

  // Active Negotiation State
  const [currentRequest, setCurrentRequest] = useState<BuyerRequest | null>(SEED_BUYER_REQUESTS[0]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(SEED_PRODUCTS[0]);
  const [activeMessages, setActiveMessages] = useState<NegotiationMessage[]>([]);
  const [activeActions, setActiveActions] = useState<AgentAction[]>([]);
  const [isNegotiating, setIsNegotiating] = useState<boolean>(false);
  const [dealStatus, setDealStatus] = useState<'idle' | 'ongoing' | 'agreed' | 'failed'>('idle');
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [latestTransaction, setLatestTransaction] = useState<Transaction | null>(null);
  const [negotiationMode, setNegotiationMode] = useState<'human_to_ai' | 'agent_to_agent'>('human_to_ai');

  // Modals State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState<boolean>(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isEWayBillModalOpen, setIsEWayBillModalOpen] = useState<boolean>(false);
  const [isTransitModalOpen, setIsTransitModalOpen] = useState<boolean>(false);
  const [isPoDModalOpen, setIsPoDModalOpen] = useState<boolean>(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState<boolean>(false);
  const [isAutopayModalOpen, setIsAutopayModalOpen] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isJudgeTourOpen, setIsJudgeTourOpen] = useState<boolean>(false);
  const [selectedBillNoForEmail, setSelectedBillNoForEmail] = useState<string | undefined>(undefined);
  const [selectedTransactionForInvoice, setSelectedTransactionForInvoice] = useState<Transaction | null>(null);
  const [selectedTransactionForModal, setSelectedTransactionForModal] = useState<Transaction | null>(null);

  // Price Alert Telemetry State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => PriceAlertService.getPriceAlerts());
  const [selectedProductForAlert, setSelectedProductForAlert] = useState<Product | null>(null);
  const [isPriceAlertModalOpen, setIsPriceAlertModalOpen] = useState<boolean>(false);
  const [latestTriggeredAlert, setLatestTriggeredAlert] = useState<PriceAlert | null>(null);
  const [latestTriggeredPrice, setLatestTriggeredPrice] = useState<number | undefined>(undefined);

  // Timer & Asynchronous Cancellation Refs
  const negotiationTimerRef = useRef<any>(null);
  const humanOfferTimerRef = useRef<any>(null);
  const presetTimerRef = useRef<any>(null);

  // Clean up all background timer tasks on unmount
  useEffect(() => {
    return () => {
      if (negotiationTimerRef.current) clearInterval(negotiationTimerRef.current);
      if (humanOfferTimerRef.current) clearTimeout(humanOfferTimerRef.current);
      if (presetTimerRef.current) clearTimeout(presetTimerRef.current);
    };
  }, []);

  // Global Search Handlers
  const handleSearchSelectProduct = (product: Product) => {
    setCurrentProduct(product);
    // Find closest buyer demand or generate context
    const matchingReq = buyerRequests.find(r => {
      const qLower = r.query.toLowerCase();
      return qLower.includes(product.name.toLowerCase().split(' ')[0]) || qLower.includes(product.category.toLowerCase().split(' ')[0]);
    }) || buyerRequests[0];

    if (matchingReq) {
      setCurrentRequest(matchingReq);
    }
    setActiveTab('arena');
  };

  const handleSearchSelectTransaction = (tx: Transaction) => {
    handleViewInvoice(tx);
  };

  const handleSearchSelectBuyerDemand = (req: BuyerRequest, matchedProd?: Product) => {
    const productToUse = matchedProd || products.find(p => {
      const qLower = req.query.toLowerCase();
      return qLower.includes(p.name.toLowerCase().split(' ')[0]) || qLower.includes(p.category.toLowerCase().split(' ')[0]);
    }) || products[0];

    setCurrentRequest(req);
    setCurrentProduct(productToUse);
    setActiveTab('arena');
    handleResetNegotiation();

    // Auto-launch negotiation for this matched demand
    setTimeout(() => {
      handleStartNegotiation();
    }, 300);
  };

  const handleSearchSelectBusiness = (businessName: string, role: 'buyer' | 'seller') => {
    if (role === 'seller') {
      setActiveRole('seller');
      setActiveTab('seller');
    } else {
      setActiveRole('buyer');
      setActiveTab('buyer');
    }
  };

  // Sync role with authenticated user profile
  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user?.role]);

  // Reset negotiation state
  const handleResetNegotiation = () => {
    if (negotiationTimerRef.current) {
      clearInterval(negotiationTimerRef.current);
      negotiationTimerRef.current = null;
    }
    if (humanOfferTimerRef.current) {
      clearTimeout(humanOfferTimerRef.current);
      humanOfferTimerRef.current = null;
    }
    setActiveMessages([]);
    setActiveActions([]);
    setIsNegotiating(false);
    setDealStatus('idle');
    setFinalPrice(null);
    setCurrentRound(1);
    setLatestTransaction(null);
  };

  // Handle Human Buyer direct offer in Interactive Bargain Mode
  const handleHumanOffer = (offerPrice: number, messageText: string) => {
    if (!currentProduct || !currentRequest) return;

    if (humanOfferTimerRef.current) {
      clearTimeout(humanOfferTimerRef.current);
    }

    const currentRoundNum = activeMessages.length > 0 ? Math.min(5, Math.floor(activeMessages.length / 2) + 1) : 1;
    const negId = activeActions[0]?.negotiation_id || `neg-h2a-${Date.now().toString().slice(-4)}`;

    const humanMsg: NegotiationMessage = {
      id: `msg-human-${Date.now()}`,
      sender: 'buyer_agent',
      round: currentRoundNum,
      action: 'offer',
      price: offerPrice,
      message: messageText,
      reason: `Human buyer direct counter-proposal of ₹${offerPrice}/${currentProduct.unit}.`,
      timestamp: new Date().toISOString(),
      landed_cost: {
        unit_price: offerPrice,
        gst_amount: Number((offerPrice * (currentProduct.gst_percent / 100)).toFixed(2)),
        transport_per_unit: Number((currentProduct.transport_charge / currentRequest.quantity).toFixed(2)),
        total_unit_cost: Number((offerPrice * (1 + currentProduct.gst_percent / 100) + currentProduct.transport_charge / currentRequest.quantity).toFixed(2)),
      }
    };

    const humanAction: AgentAction = {
      id: `act-human-${Date.now()}`,
      negotiation_id: negId,
      action_by: 'buyer_agent',
      action_type: 'offer',
      round: currentRoundNum,
      price: offerPrice,
      details: {
        message: messageText,
        reason: `Direct human offer of ₹${offerPrice}/${currentProduct.unit}`,
        budget_limit: currentRequest.max_budget,
      },
      timestamp: new Date().toISOString(),
    };

    setActiveMessages((prev) => [...prev, humanMsg]);
    setActiveActions((prev) => [humanAction, ...prev]);
    setIsNegotiating(true);
    setDealStatus('ongoing');
    setCurrentRound(currentRoundNum);

    // Let Seller AI calculate response with snappy, responsive pacing
    humanOfferTimerRef.current = setTimeout(() => {
      const lastSellerMsg = [...activeMessages].reverse().find(m => m.sender === 'seller_agent');
      const lastSellerPrice = lastSellerMsg ? lastSellerMsg.price : currentProduct.base_price;

      const response = AgentNegotiationEngine.respondToHumanOffer(
        currentProduct,
        currentRequest,
        offerPrice,
        messageText,
        currentRoundNum,
        lastSellerPrice,
        [humanAction, ...activeActions],
        negId
      );

      setActiveMessages((prev) => [...prev, response.sellerMessage]);
      setActiveActions((prev) => [response.sellerAction, ...prev]);
      setIsNegotiating(false);

      if (response.isConsensus && response.transaction) {
        setDealStatus('agreed');
        setFinalPrice(response.finalPrice);
        setLatestTransaction(response.transaction);
        setTransactions((prev) => [response.transaction!, ...prev]);
        setAgentActions((prev) => [response.sellerAction, humanAction, ...prev]);

        // Evaluate and trigger price alerts matching this deal
        if (currentProduct) {
          const alertResult = PriceAlertService.checkAndTriggerAlerts(
            currentProduct,
            response.finalPrice,
            response.transaction
          );
          if (alertResult.triggeredAlerts.length > 0) {
            setPriceAlerts(PriceAlertService.getPriceAlerts());
            setLatestTriggeredAlert(alertResult.triggeredAlerts[0]);
            setLatestTriggeredPrice(response.finalPrice);
          }
        }
      } else if (response.isRejected || currentRoundNum >= 5) {
        setDealStatus('failed');
      }
    }, 550);
  };

  // Computed Platform Metrics
  const metrics: PlatformMetrics = {
    totalNegotiations: transactions.length + 18,
    dealSuccessRate: 94.2,
    averageRounds: 2.8,
    totalGMV: transactions.reduce((sum, t) => sum + (t.payment_status === 'paid' ? t.total_amount : 0), 0) + 142000,
    averageDiscountPercent: 12.4,
    totalGSTProcessed: transactions.reduce((sum, t) => sum + (t.payment_status === 'paid' ? t.gst_amount : 0), 0) + 18450,
    voiceQueriesAnswered: 84,
  };

  // Launch a new negotiation session with stepwise animation
  const handleStartNegotiation = async () => {
    if (!currentProduct || !currentRequest) return;

    if (negotiationTimerRef.current) {
      clearInterval(negotiationTimerRef.current);
    }

    setIsNegotiating(true);
    setDealStatus('ongoing');
    setActiveMessages([]);
    setActiveActions([]);
    setFinalPrice(null);
    setCurrentRound(1);
    setLatestTransaction(null);

    const result = await AgentNegotiationEngine.executeRoundByRound(currentProduct, currentRequest);

    // Stepwise animated playback of rounds with responsive, lag-free pacing
    let stepIndex = 0;
    negotiationTimerRef.current = setInterval(() => {
      if (stepIndex < result.messages.length) {
        const msg = result.messages[stepIndex];
        setActiveMessages((prev) => [...prev, msg]);
        setCurrentRound(msg.round);

        // Also push corresponding actions up to this step
        const relevantActions = result.actions.slice(0, (stepIndex + 1) * 2);
        setActiveActions(relevantActions);

        stepIndex++;
      } else {
        if (negotiationTimerRef.current) {
          clearInterval(negotiationTimerRef.current);
          negotiationTimerRef.current = null;
        }
        setIsNegotiating(false);
        setDealStatus(result.status);
        setFinalPrice(result.finalPrice);

        if (result.status === 'agreed' && result.transaction) {
          setLatestTransaction(result.transaction);
          setTransactions((prev) => [result.transaction!, ...prev]);
          setAgentActions((prev) => [...result.actions, ...prev]);

          // Evaluate and trigger price alerts matching this deal
          if (currentProduct && result.finalPrice) {
            const alertResult = PriceAlertService.checkAndTriggerAlerts(
              currentProduct,
              result.finalPrice,
              result.transaction
            );
            if (alertResult.triggeredAlerts.length > 0) {
              setPriceAlerts(PriceAlertService.getPriceAlerts());
              setLatestTriggeredAlert(alertResult.triggeredAlerts[0]);
              setLatestTriggeredPrice(result.finalPrice);
            }
          }
        }
      }
    }, 700);
  };

  // Price Alert Telemetry Handlers
  const handleOpenPriceAlertModal = (product: Product) => {
    setSelectedProductForAlert(product);
    setIsPriceAlertModalOpen(true);
  };

  const handleAlertSaved = (newAlert: PriceAlert) => {
    setPriceAlerts(PriceAlertService.getPriceAlerts());
  };

  const handleSimulateAlertMatch = (alertId: string) => {
    const sim = PriceAlertService.simulateAlertMatch(alertId);
    if (sim) {
      setPriceAlerts(PriceAlertService.getPriceAlerts());
      setLatestTriggeredAlert(sim.alert);
      setLatestTriggeredPrice(sim.alert.triggered_deal_price);
    }
  };

  const handleDeletePriceAlert = (alertId: string) => {
    const updated = PriceAlertService.deletePriceAlert(alertId);
    setPriceAlerts(updated);
  };

  const handleSelectProductForProcurement = (product: Product) => {
    setCurrentProduct(product);
    const matchingReq = buyerRequests.find(r => {
      const qLower = r.query.toLowerCase();
      return qLower.includes(product.name.toLowerCase().split(' ')[0]) || qLower.includes(product.category.toLowerCase().split(' ')[0]);
    }) || {
      id: `req-${Date.now().toString().slice(-4)}`,
      buyer_id: 'usr-buyer-1',
      buyer_name: user?.name || 'Amitabh Sen',
      buyer_business: user?.business_name || 'Bengal Royal Hotels & Banquets',
      buyer_gstin: user?.gstin || '19AAECB7788J1ZR',
      query: `Need 50 ${product.unit} of ${product.name} under ₹${Math.round(product.base_price * 0.93)}/${product.unit}, deliver within ${product.delivery_days} days.`,
      max_budget: Math.round(product.base_price * 0.93),
      quantity: 50,
      deadline_days: product.delivery_days,
      status: 'negotiating',
      created_at: new Date().toISOString(),
    };

    setCurrentRequest(matchingReq);
    setActiveTab('arena');
    handleResetNegotiation();
    setTimeout(() => {
      handleStartNegotiation();
    }, 300);
  };

  // Load a demo scenario preset
  const handleSelectPreset = (presetId: string) => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const matchedProduct = products.find((p) => p.id === preset.product_id) || products[0];

    const newReq: BuyerRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      buyer_id: 'usr-buyer-1',
      buyer_name: 'Vikram Singhania',
      buyer_business: 'Bengal Royal Hotels & Banquets',
      buyer_gstin: '19AAECB7788J1ZR',
      query: preset.prompt,
      max_budget: preset.max_budget,
      quantity: preset.quantity,
      deadline_days: preset.deadline_days,
      status: 'negotiating',
      created_at: new Date().toISOString(),
    };

    setCurrentProduct(matchedProduct);
    setCurrentRequest(newReq);
    setBuyerRequests((prev) => [newReq, ...prev]);
    setActiveTab('arena');

    // Automatically trigger negotiation after navigating
    setTimeout(() => {
      handleStartNegotiation();
    }, 400);
  };

  // 1-Click Judge Scenario Launcher
  const handleSelectJudgeScenario = (scenarioId: 'happy_path' | 'npci_recovery' | 'quality_arbitration') => {
    if (scenarioId === 'happy_path') {
      const riceProduct = products.find(p => p.name.toLowerCase().includes('basmati')) || products[0];
      const riceReq = buyerRequests.find(r => r.query.toLowerCase().includes('rice')) || buyerRequests[0];
      setCurrentProduct(riceProduct);
      setCurrentRequest(riceReq);
      setActiveTab('arena');
      handleResetNegotiation();
      setTimeout(() => {
        handleStartNegotiation();
      }, 350);
    } else if (scenarioId === 'npci_recovery') {
      setActiveTab('finance');
    } else if (scenarioId === 'quality_arbitration') {
      const tx = transactions[0];
      setSelectedTransactionForModal(tx);
      setIsPoDModalOpen(true);
    }
  };

  // Handle Buyer submitting a custom natural language request
  const handleBuyerSubmitRequest = (
    query: string,
    maxBudget: number,
    quantity: number,
    deadlineDays: number
  ) => {
    // Find closest product match by keyword or default to first
    const matchedProduct = products.find((p) => {
      const qLower = query.toLowerCase();
      return (
        qLower.includes(p.name.toLowerCase().split(' ')[0]) ||
        qLower.includes(p.category.toLowerCase().split(' ')[0])
      );
    }) || products[0];

    const newReq: BuyerRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      buyer_id: user?.id || 'usr-buyer-1',
      buyer_name: user?.name || 'Priya Sharma (Procurement)',
      buyer_business: user?.business_name || 'Sharma Agro Foods & Mills Pvt Ltd',
      buyer_gstin: user?.gstin || '07AAACS1429B1Z8',
      query,
      max_budget: maxBudget,
      quantity,
      deadline_days: deadlineDays,
      status: 'negotiating',
      created_at: new Date().toISOString(),
    };

    setCurrentProduct(matchedProduct);
    setCurrentRequest(newReq);
    setBuyerRequests((prev) => [newReq, ...prev]);
    setActiveTab('arena');

    setTimeout(() => {
      handleStartNegotiation();
    }, 300);
  };

  // Handle Seller adding a new inventory product
  const handleAddProduct = (newProdData: Omit<Product, 'id' | 'created_at'>) => {
    requireAuth(() => {
      const newProduct: Product = {
        ...newProdData,
        id: `prod-${Date.now().toString().slice(-4)}`,
        seller_id: user?.id || newProdData.seller_id,
        seller_name: user?.name || newProdData.seller_name,
        seller_business: user?.business_name || newProdData.seller_business,
        seller_gstin: user?.gstin || newProdData.seller_gstin,
        created_at: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
    });
  };

  // Handle Seller toggling product active state
  const handleToggleProductActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
  };

  // Razorpay payment success callback
  const handlePaymentSuccess = (paymentId: string) => {
    const targetTx = selectedTransactionForInvoice || latestTransaction;
    if (!targetTx) return;

    const updatedTx: Transaction = {
      ...targetTx,
      payment_status: 'paid',
      razorpay_payment_id: paymentId,
      invoice_data: targetTx.invoice_data ? {
        ...targetTx.invoice_data,
        payment: {
          ...targetTx.invoice_data.payment,
          razorpay_payment_id: paymentId,
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        }
      } : undefined
    };

    if (latestTransaction?.id === updatedTx.id) {
      setLatestTransaction(updatedTx);
    }
    setSelectedTransactionForInvoice(updatedTx);
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );

    // Log payment success action
    const paymentAction: AgentAction = {
      id: `act-pay-${Date.now()}`,
      negotiation_id: updatedTx.negotiation_id,
      transaction_id: updatedTx.id,
      action_by: 'system',
      action_type: 'payment_success',
      price: updatedTx.total_amount,
      details: {
        message: `Razorpay Test Autopay successfully captured. Payment ID: ${paymentId}`,
        reason: 'Payment webhook signature validated. Official GST Tax Invoice issued.',
      },
      timestamp: new Date().toISOString(),
    };

    setActiveActions((prev) => [paymentAction, ...prev]);
    setAgentActions((prev) => [paymentAction, ...prev]);

    // Trigger Mock Email Service Handler sending confirmation notifications to both Buyer & Seller
    try {
      MockEmailService.sendPaymentConfirmationEmails(updatedTx);
    } catch (err) {
      console.error('[EmailService] Failed to dispatch payment confirmation email:', err);
    }

    // Automatically trigger statutory verification status checks against Supabase PostgreSQL DB
    try {
      verifyTransactionComplianceInSupabase(updatedTx);
    } catch (err) {
      console.error('[Supabase Compliance] Auto-trigger failed:', err);
    }

    setIsRazorpayModalOpen(false);

    // Open invoice preview automatically after brief moment
    setTimeout(() => {
      setSelectedTransactionForInvoice(updatedTx);
      setIsInvoiceModalOpen(true);
    }, 600);
  };

  // View specific transaction invoice
  const handleViewInvoice = (tx: Transaction) => {
    setSelectedTransactionForInvoice(tx);
    setIsInvoiceModalOpen(true);
  };

  // Update transaction handler (e.g. from payment check / link resend)
  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) => {
      const existing = prev.find((t) => t.id === updatedTx.id);
      if (updatedTx.payment_status === 'paid' && (!existing || existing.payment_status !== 'paid')) {
        try {
          MockEmailService.sendPaymentConfirmationEmails(updatedTx);
        } catch (err) {
          console.error('[EmailService] Failed to dispatch payment email:', err);
        }
        try {
          verifyTransactionComplianceInSupabase(updatedTx);
        } catch (err) {
          console.error('[Supabase Compliance] Auto-trigger failed on update:', err);
        }
      }

      const exists = prev.some((t) => t.id === updatedTx.id);
      if (exists) {
        return prev.map((t) => (t.id === updatedTx.id ? updatedTx : t));
      }
      return [updatedTx, ...prev];
    });
  };

  // Pay specific transaction directly
  const handlePayTransaction = (tx: Transaction) => {
    setSelectedTransactionForInvoice(tx);
    setLatestTransaction(tx);
    setIsRazorpayModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-bold text-slate-300 tracking-wider uppercase">
          Initializing Anti-Fraud Security Gate...
        </div>
      </div>
    );
  }

  // If unauthenticated or no verified enterprise user session exists, display Fraud-Proof Login Page first
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenEmailInbox={() => {
          setSelectedBillNoForEmail(undefined);
          setIsEmailModalOpen(true);
        }}
        onOpenWhatsApp={() => {
          setSelectedTransactionForModal(transactions[0] || null);
          setIsWhatsAppModalOpen(true);
        }}
        onOpenJudgeTour={() => setIsJudgeTourOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12">
        {activeTab === 'home' && (
          <Home
            onSelectPreset={handleSelectPreset}
            onNavigate={setActiveTab}
            setActiveRole={setActiveRole}
            metrics={metrics}
          />
        )}

        {activeTab === 'arena' && (
          <LiveNegotiation
            currentRequest={currentRequest}
            currentProduct={currentProduct}
            messages={activeMessages}
            actions={activeActions}
            isNegotiating={isNegotiating}
            dealStatus={dealStatus}
            finalPrice={finalPrice}
            onStartNegotiation={handleStartNegotiation}
            onOpenPaymentModal={() => setIsRazorpayModalOpen(true)}
            onViewInvoice={handleViewInvoice}
            onOpenEWayBill={(tx) => {
              setSelectedTransactionForInvoice(tx);
              setIsEWayBillModalOpen(true);
            }}
            latestTransaction={latestTransaction}
            currentRound={currentRound}
            negotiationMode={negotiationMode}
            onSetNegotiationMode={setNegotiationMode}
            onHumanOffer={handleHumanOffer}
            onResetNegotiation={handleResetNegotiation}
          />
        )}

        {activeTab === 'seller' && (
          <SellerDashboard
            products={products}
            transactions={transactions}
            agentActions={agentActions}
            onAddProduct={handleAddProduct}
            onToggleProductActive={handleToggleProductActive}
            onViewInvoice={handleViewInvoice}
          />
        )}

        {activeTab === 'buyer' && (
          <BuyerDashboard
            requests={buyerRequests}
            onSubmitRequest={handleBuyerSubmitRequest}
            onSelectPreset={handleSelectPreset}
            onNavigateToArena={() => setActiveTab('arena')}
            transactions={transactions}
            onViewInvoice={handleViewInvoice}
            onUpdateTransaction={handleUpdateTransaction}
            onPayTransaction={handlePayTransaction}
            products={products}
            priceAlerts={priceAlerts}
            onOpenPriceAlertModal={handleOpenPriceAlertModal}
            onSimulateAlertMatch={handleSimulateAlertMatch}
            onDeleteAlert={handleDeletePriceAlert}
            onSelectProductForProcurement={handleSelectProductForProcurement}
            onOpenEmailInbox={() => {
              setSelectedBillNoForEmail(undefined);
              setIsEmailModalOpen(true);
            }}
          />
        )}

        {activeTab === 'vault' && (
          <TransactionVault
            transactions={transactions}
            onSelectTransaction={handleViewInvoice}
            onOpenWhatsApp={(tx) => {
              setSelectedTransactionForModal(tx);
              setIsWhatsAppModalOpen(true);
            }}
            onOpenTransitTracker={(tx) => {
              setSelectedTransactionForModal(tx);
              setIsTransitModalOpen(true);
            }}
            onOpenPoD={(tx) => {
              setSelectedTransactionForModal(tx);
              setIsPoDModalOpen(true);
            }}
            onOpenSplitSettlement={(tx) => {
              setSelectedTransactionForModal(tx);
              setIsSplitModalOpen(true);
            }}
            onOpenAutopayMandate={() => setIsAutopayModalOpen(true)}
            onOpenEmailInbox={(tx) => {
              setSelectedBillNoForEmail(tx ? tx.bill_no : undefined);
              setIsEmailModalOpen(true);
            }}
          />
        )}

        {activeTab === 'auctions' && (
          <LiveAuctionHub onViewInvoice={handleViewInvoice} />
        )}

        {activeTab === 'ondc-gem' && (
          <OndcGemProtocolHub onStartLiveNegotiation={() => setActiveTab('arena')} />
        )}

        {activeTab === 'treds' && (
          <TredsFactoringHub onViewInvoice={handleViewInvoice} />
        )}

        {activeTab === 'finance' && <FinanceReconciliationHub />}

        {activeTab === 'compliance' && (
          <ComplianceHub
            transactions={transactions}
            latestPaidTransaction={latestTransaction?.payment_status === 'paid' ? latestTransaction : null}
            onViewInvoice={handleViewInvoice}
            onNavigateToVault={() => setActiveTab('vault')}
          />
        )}

        {activeTab === 'submission-kit' && (
          <SubmissionKit
            transactions={transactions}
            latestPaidTransaction={latestTransaction?.payment_status === 'paid' ? latestTransaction : null}
            onViewInvoice={handleViewInvoice}
            onNavigateToCompliance={() => setActiveTab('compliance')}
            onStartLiveNegotiation={() => setActiveTab('arena')}
          />
        )}
      </main>

      {/* Razorpay Test Mode Checkout Modal */}
      {(selectedTransactionForInvoice || latestTransaction) && (
        <RazorpayModal
          isOpen={isRazorpayModalOpen}
          onClose={() => setIsRazorpayModalOpen(false)}
          billNo={(selectedTransactionForInvoice || latestTransaction)!.bill_no}
          totalAmount={(selectedTransactionForInvoice || latestTransaction)!.total_amount}
          productName={(selectedTransactionForInvoice || latestTransaction)!.product_name}
          quantity={(selectedTransactionForInvoice || latestTransaction)!.quantity}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Official GST Tax Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        transaction={selectedTransactionForInvoice}
        onOpenTransitTracker={(tx) => {
          setSelectedTransactionForModal(tx);
          setIsTransitModalOpen(true);
        }}
        onOpenPoD={(tx) => {
          setSelectedTransactionForModal(tx);
          setIsPoDModalOpen(true);
        }}
        onOpenSplitSettlement={(tx) => {
          setSelectedTransactionForModal(tx);
          setIsSplitModalOpen(true);
        }}
        onOpenEmailInbox={(tx) => {
          setSelectedBillNoForEmail(tx ? tx.bill_no : selectedTransactionForInvoice?.bill_no);
          setIsEmailModalOpen(true);
        }}
      />

      {/* Official National e-Way Bill Inspector Modal */}
      <EWayBillModal
        isOpen={isEWayBillModalOpen}
        onClose={() => setIsEWayBillModalOpen(false)}
        transaction={selectedTransactionForInvoice}
      />

      {/* Live GPS & FASTag Telemetry Tracker Modal */}
      <LiveTransitTrackerModal
        isOpen={isTransitModalOpen}
        onClose={() => setIsTransitModalOpen(false)}
        transaction={selectedTransactionForModal || transactions[0]}
      />

      {/* Digital Proof of Delivery & Escrow Release Modal */}
      <DigitalPoDModal
        isOpen={isPoDModalOpen}
        onClose={() => setIsPoDModalOpen(false)}
        transaction={selectedTransactionForModal || transactions[0]}
        onReleaseSuccess={(tx) => {
          handleUpdateTransaction(tx);
        }}
      />

      {/* Autonomous Split Settlement & Margin Bifurcation Modal */}
      <SplitSettlementModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        transaction={selectedTransactionForModal || transactions[0]}
      />

      {/* UPI Autopay & Recurring e-Mandate Configuration Modal */}
      <AutopayMandateModal
        isOpen={isAutopayModalOpen}
        onClose={() => setIsAutopayModalOpen(false)}
      />

      {/* Interactive WhatsApp Multi-Agent Business Simulator Modal */}
      <WhatsAppSimulatorModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        transaction={selectedTransactionForModal || transactions[0]}
        onOpenInvoice={(tx) => {
          setIsWhatsAppModalOpen(false);
          handleViewInvoice(tx);
        }}
        onOpenPayment={() => {
          setIsWhatsAppModalOpen(false);
          setIsRazorpayModalOpen(true);
        }}
      />

      {/* Global Command Palette & Fuzzy Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        products={products}
        transactions={transactions}
        buyerRequests={buyerRequests}
        users={SEED_USERS}
        onSelectProduct={handleSearchSelectProduct}
        onSelectTransaction={handleSearchSelectTransaction}
        onSelectBuyerDemand={handleSearchSelectBuyerDemand}
        onSelectBusiness={handleSearchSelectBusiness}
      />

      {/* Supabase Google OAuth & Enterprise Auth Modal */}
      <AuthModal />

      {/* Mandatory Business Onboarding Modal (GSTIN, Business Name & Role) */}
      <OnboardingModal />

      {/* Transactional Email Dispatch Hub (Mock SMTP) Modal */}
      <EmailInboxModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        filterBillNo={selectedBillNoForEmail}
      />

      {/* Smart Price Alert Configuration Modal */}
      <PriceAlertModal
        isOpen={isPriceAlertModalOpen}
        onClose={() => setIsPriceAlertModalOpen(false)}
        product={selectedProductForAlert}
        existingAlert={priceAlerts.find(
          (a) => a.product_id === selectedProductForAlert?.id && a.status === 'active'
        )}
        onAlertSaved={handleAlertSaved}
        onSimulateMatch={handleSimulateAlertMatch}
        onOpenEmailInbox={() => {
          setIsPriceAlertModalOpen(false);
          setSelectedBillNoForEmail(undefined);
          setIsEmailModalOpen(true);
        }}
      />

      {/* Real-Time Price Alert Match Toast Notification */}
      <PriceAlertToast
        alert={latestTriggeredAlert}
        dealPrice={latestTriggeredPrice}
        onClose={() => setLatestTriggeredAlert(null)}
        onOpenEmailInbox={() => {
          setLatestTriggeredAlert(null);
          setSelectedBillNoForEmail(latestTriggeredAlert?.bill_no);
          setIsEmailModalOpen(true);
        }}
      />

      {/* 1-Click Judge QuickTour Modal */}
      <JudgeQuickTourModal
        isOpen={isJudgeTourOpen}
        onClose={() => setIsJudgeTourOpen(false)}
        onSelectScenario={handleSelectJudgeScenario}
      />

      {/* Floating WhatsApp AI Bot Launcher Widget (Desktop & Tablet) */}
      <div className="fixed bottom-6 right-6 z-30 hidden lg:block">
        <button
          id="floating-whatsapp-widget-btn"
          onClick={() => {
            setSelectedTransactionForModal(transactions[0] || null);
            setIsWhatsAppModalOpen(true);
          }}
          className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer border border-emerald-400/30"
          title="Open WhatsApp AI Assistant Simulator"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 fill-white text-emerald-600" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
          </div>
          <span className="text-xs font-bold tracking-wide">WhatsApp Bot</span>
          <span className="text-[10px] font-extrabold bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded-full">
            Live
          </span>
        </button>
      </div>

      {/* Mobile-Specific Bottom Navigation Bar & Quick Sheet */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isNegotiating={isNegotiating}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenEmailInbox={() => {
          setSelectedBillNoForEmail(undefined);
          setIsEmailModalOpen(true);
        }}
        onOpenWhatsApp={() => {
          setSelectedTransactionForModal(transactions[0] || null);
          setIsWhatsAppModalOpen(true);
        }}
        transactionCount={transactions.length}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
