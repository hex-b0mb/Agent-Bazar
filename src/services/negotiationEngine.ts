import { Product, BuyerRequest, NegotiationMessage, AgentAction, Transaction, InvoiceData } from '../types';

export interface NegotiationResult {
  status: 'agreed' | 'failed';
  rounds: number;
  finalPrice: number | null;
  messages: NegotiationMessage[];
  actions: AgentAction[];
  failureReason?: string;
  transaction?: Transaction;
}

export class AgentNegotiationEngine {
  /**
   * Simulates/orchestrates a realistic, strictly bounded multi-round negotiation
   * between the Buyer AI Agent and the Seller AI Agent.
   */
  static async executeRoundByRound(
    product: Product,
    request: BuyerRequest,
    onStep?: (msg: NegotiationMessage, action: AgentAction, round: number) => void
  ): Promise<NegotiationResult> {
    const negotiationId = 'neg-' + Math.random().toString(36).substring(2, 9);
    const messages: NegotiationMessage[] = [];
    const actions: AgentAction[] = [];

    const basePrice = product.base_price;
    const minPrice = product.min_price; // HARD FLOOR
    const maxBudget = request.max_budget; // HARD CEILING
    const quantity = request.quantity;
    const gstPercent = product.gst_percent;
    const transportCharge = product.transport_charge;
    const transportPerUnit = quantity > 0 ? transportCharge / quantity : 0;

    // Log Search Action
    const searchAction: AgentAction = {
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      negotiation_id: negotiationId,
      action_by: 'buyer_agent',
      action_type: 'search',
      details: {
        message: `Discovered supplier listing "${product.name}" from ${product.seller_business || product.seller_name}.`,
        reason: `Available stock (${product.stock} ${product.unit}) fulfills order requirement (${quantity} ${product.unit}). Delivery window (${product.delivery_days} days) within target.`,
        product_name: product.name,
      },
      timestamp: new Date().toISOString(),
    };
    actions.push(searchAction);

    let round = 1;
    let dealAgreed = false;
    let finalAgreedPrice: number | null = null;
    let lastSellerOffer = basePrice;
    let currentBuyerOffer = 0;

    // Helper to calculate landed cost
    const getLandedCost = (unitPrice: number) => {
      const gstAmt = unitPrice * (gstPercent / 100);
      const totalCost = unitPrice + gstAmt + transportPerUnit;
      return {
        unit_price: unitPrice,
        gst_amount: Number(gstAmt.toFixed(2)),
        transport_per_unit: Number(transportPerUnit.toFixed(2)),
        total_unit_cost: Number(totalCost.toFixed(2)),
      };
    };

    while (round <= 5 && !dealAgreed) {
      // ----------------------------------------------------
      // STEP 1: BUYER AGENT PROPOSES / COUNTERS
      // ----------------------------------------------------
      let buyerActionType: 'offer' | 'counter' | 'accept' | 'reject' = round === 1 ? 'offer' : 'counter';
      let buyerMessageText = '';
      let buyerReason = '';

      if (round === 1) {
        // Start offer at ~85% of budget or discount from base
        const startTarget = Math.min(maxBudget * 0.86, basePrice * 0.82);
        currentBuyerOffer = Math.max(Math.round(startTarget), Math.round(minPrice * 0.92));
        buyerMessageText = `Greetings. Representing verified procurement for ${quantity} ${product.unit}. We submit a firm initial purchase bid of ₹${currentBuyerOffer}/${product.unit}.`;
        buyerReason = `Starting bid anchored at ~85% of max budget constraint (₹${maxBudget}) to test merchant pricing elasticity.`;
      } else {
        // If previous seller offer already fits nicely in budget
        const landedAtSellerPrice = lastSellerOffer * (1 + gstPercent / 100) + transportPerUnit;
        if (landedAtSellerPrice <= maxBudget) {
          // Can accept or make one tight counter
          if (round >= 3 || Math.abs(lastSellerOffer - currentBuyerOffer) <= 2) {
            currentBuyerOffer = lastSellerOffer;
            buyerActionType = 'accept';
            buyerMessageText = `Agreed. We accept the rate of ₹${currentBuyerOffer}/${product.unit} for this ${quantity} ${product.unit} purchase batch.`;
            buyerReason = `Landed cost with ${gstPercent}% GST and freight is ₹${landedAtSellerPrice.toFixed(2)}/${product.unit}, strictly within ₹${maxBudget} ceiling.`;
          } else {
            // Increment upward by 3-5%
            const increment = Math.max(1, Math.round((lastSellerOffer - currentBuyerOffer) * 0.45));
            currentBuyerOffer = Math.min(currentBuyerOffer + increment, lastSellerOffer);
            buyerMessageText = `We can elevate our procurement commitment to ₹${currentBuyerOffer}/${product.unit} with immediate payment clearance.`;
            buyerReason = `Incremented offer by ₹${increment} to converge on seller counter while preserving buyer margin.`;
          }
        } else {
          // Seller price exceeds budget, push highest feasible offer under budget
          const maxFeasibleRaw = Math.floor((maxBudget - transportPerUnit) / (1 + gstPercent / 100));
          currentBuyerOffer = Math.min(currentBuyerOffer + 2, maxFeasibleRaw);
          if (currentBuyerOffer < minPrice && round >= 4) {
            buyerActionType = 'reject';
            buyerMessageText = `We cannot match the requested rate as total landed costs exceed our strict ceiling of ₹${maxBudget}/${product.unit}.`;
            buyerReason = `Ceiling constraint breached: Landed cost required exceeds max budget.`;
          } else {
            buyerMessageText = `Our fiduciary mandate permits a maximum counter of ₹${currentBuyerOffer}/${product.unit} all-inclusive.`;
            buyerReason = `Bounded counter calibrated to keep total landed cost <= ₹${maxBudget}.`;
          }
        }
      }

      const buyerMsg: NegotiationMessage = {
        id: 'msg-' + Math.random().toString(36).substring(2, 9),
        sender: 'buyer_agent',
        round,
        action: buyerActionType,
        price: currentBuyerOffer,
        message: buyerMessageText,
        reason: buyerReason,
        timestamp: new Date().toISOString(),
        landed_cost: getLandedCost(currentBuyerOffer),
      };
      messages.push(buyerMsg);

      const buyerActionRecord: AgentAction = {
        id: 'act-' + Math.random().toString(36).substring(2, 9),
        negotiation_id: negotiationId,
        action_by: 'buyer_agent',
        action_type: buyerActionType,
        round,
        price: currentBuyerOffer,
        details: {
          message: buyerMessageText,
          reason: buyerReason,
          landed_cost: buyerMsg.landed_cost?.total_unit_cost,
          budget_limit: maxBudget,
        },
        timestamp: new Date().toISOString(),
      };
      actions.push(buyerActionRecord);
      onStep?.(buyerMsg, buyerActionRecord, round);

      if (buyerActionType === 'accept') {
        dealAgreed = true;
        finalAgreedPrice = currentBuyerOffer;
        break;
      }
      if (buyerActionType === 'reject') {
        break;
      }

      // ----------------------------------------------------
      // STEP 2: SELLER AGENT RESPONDS / COUNTERS
      // ----------------------------------------------------
      let sellerActionType: 'accept' | 'counter' | 'reject' = 'counter';
      let sellerOfferPrice = minPrice;
      let sellerMessageText = '';
      let sellerReason = '';

      if (currentBuyerOffer >= basePrice) {
        // Buyer offered base price or above -> Instant accept
        sellerActionType = 'accept';
        sellerOfferPrice = currentBuyerOffer;
        sellerMessageText = `Offer accepted at ₹${sellerOfferPrice}/${product.unit}. Our warehouse will prioritize dispatch within ${product.delivery_days} business days.`;
        sellerReason = `Buyer offer meets or exceeds standard listed base price (₹${basePrice}). Zero discount required.`;
      } else if (currentBuyerOffer >= minPrice) {
        // Buyer offer is above floor price
        if (round >= 3 || currentBuyerOffer >= basePrice * 0.95 || Math.abs(currentBuyerOffer - lastSellerOffer) <= 2) {
          sellerActionType = 'accept';
          sellerOfferPrice = currentBuyerOffer;
          sellerMessageText = `Confirmed at ₹${sellerOfferPrice}/${product.unit}. We accept this commercial terms for ${quantity} ${product.unit}.`;
          sellerReason = `Offer ₹${sellerOfferPrice} is at or above floor margin threshold (₹${minPrice}). Approved for fast inventory velocity.`;
        } else {
          // Counter at midpoint between buyer offer and current seller expectation
          sellerOfferPrice = Math.max(minPrice, Math.round((currentBuyerOffer + lastSellerOffer) / 2));
          lastSellerOffer = sellerOfferPrice;
          sellerMessageText = `Our certified batch specifications require a rate of ₹${sellerOfferPrice}/${product.unit} to cover processing & quality assurance.`;
          sellerReason = `Counter-offered at midpoint (₹${sellerOfferPrice}). Floor price (₹${minPrice}) securely protected.`;
        }
      } else {
        // Buyer offer is strictly BELOW the secret minimum floor price
        if (round >= 4) {
          // Final counter at the absolute floor price
          sellerOfferPrice = minPrice;
          lastSellerOffer = minPrice;
          sellerMessageText = `Our absolute minimum institutional rate is ₹${minPrice}/${product.unit}. We cannot operate below this floor.`;
          sellerReason = `Floor threshold enforced: Proposed ₹${minPrice} as take-it-or-leave-it floor limit.`;
        } else {
          // Counter midway between min_price and base_price
          sellerOfferPrice = Math.max(minPrice, Math.round((minPrice + basePrice) / 2));
          lastSellerOffer = sellerOfferPrice;
          sellerMessageText = `We are unable to accept ₹${currentBuyerOffer}/${product.unit}. We can extend a preferential bulk rate of ₹${sellerOfferPrice}/${product.unit}.`;
          sellerReason = `Buyer bid ₹${currentBuyerOffer} < floor price ₹${minPrice}. Counter positioned at ₹${sellerOfferPrice} to steer back into viable zone.`;
        }
      }

      const sellerMsg: NegotiationMessage = {
        id: 'msg-' + Math.random().toString(36).substring(2, 9),
        sender: 'seller_agent',
        round,
        action: sellerActionType,
        price: sellerOfferPrice,
        message: sellerMessageText,
        reason: sellerReason,
        timestamp: new Date().toISOString(),
        landed_cost: getLandedCost(sellerOfferPrice),
      };
      messages.push(sellerMsg);

      const sellerActionRecord: AgentAction = {
        id: 'act-' + Math.random().toString(36).substring(2, 9),
        negotiation_id: negotiationId,
        action_by: 'seller_agent',
        action_type: sellerActionType,
        round,
        price: sellerOfferPrice,
        details: {
          message: sellerMessageText,
          reason: sellerReason,
          floor_price_enforced: sellerOfferPrice >= minPrice,
        },
        timestamp: new Date().toISOString(),
      };
      actions.push(sellerActionRecord);
      onStep?.(sellerMsg, sellerActionRecord, round);

      if (sellerActionType === 'accept') {
        dealAgreed = true;
        finalAgreedPrice = sellerOfferPrice;
        break;
      }

      round++;
    }

    // ----------------------------------------------------
    // FINAL SETTLEMENT & TRANSACTION GENERATION
    // ----------------------------------------------------
    if (dealAgreed && finalAgreedPrice !== null) {
      const baseAmount = Number((finalAgreedPrice * quantity).toFixed(2));
      const gstAmount = Number((baseAmount * (gstPercent / 100)).toFixed(2));
      const totalAmount = Number((baseAmount + gstAmount + transportCharge).toFixed(2));
      const billNo = `A2A-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const transactionId = 'txn-' + Math.random().toString(36).substring(2, 9);
      const razorpayPaymentId = `pay_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

      // System deal agreed action
      const dealAction: AgentAction = {
        id: 'act-' + Math.random().toString(36).substring(2, 9),
        negotiation_id: negotiationId,
        transaction_id: transactionId,
        action_by: 'system',
        action_type: 'deal_agreed',
        price: finalAgreedPrice,
        details: {
          message: `Autonomous deal closed at ₹${finalAgreedPrice}/${product.unit} (Total: ₹${totalAmount} incl. ${gstPercent}% GST & transport).`,
          reason: `Both agents verified math against fiduciary constraints and confirmed bilateral agreement.`,
        },
        timestamp: new Date().toISOString(),
      };
      actions.push(dealAction);

      const invoiceData: InvoiceData = {
        bill_no: billNo,
        invoice_date: new Date().toISOString().split('T')[0],
        seller: {
          name: product.seller_name || 'Enterprise Seller',
          business_name: product.seller_business || 'AgriHub Super Grains Pvt Ltd',
          gstin: product.seller_gstin || '07AAACA1234A1Z5',
          phone: '+91 98765 43210',
          address: 'APMC Market Complex, Sector 18, Commercial Hub, India',
        },
        buyer: {
          name: request.buyer_name || 'Procurement Officer',
          business_name: 'Commercial Enterprise Ltd',
          gstin: '19AAECB7788J1ZR',
          phone: '+91 98300 11223',
          address: 'B2B Logistics Park, Unit 4B, Metro Area, India',
        },
        item: {
          product_id: product.id,
          name: product.name,
          hsn_code: product.category === 'Agricultural Commodities' ? '1006.30' : '5208.52',
          quantity,
          unit: product.unit,
          unit_price: finalAgreedPrice,
          base_amount: baseAmount,
          gst_percent: gstPercent,
          cgst_percent: gstPercent / 2,
          cgst_amount: Number((gstAmount / 2).toFixed(2)),
          sgst_percent: gstPercent / 2,
          sgst_amount: Number((gstAmount / 2).toFixed(2)),
          transport_charge: transportCharge,
          total_amount: totalAmount,
        },
        payment: {
          razorpay_payment_id: razorpayPaymentId,
          razorpay_order_id: `order_A2A_${Math.floor(100000 + Math.random() * 900000)}`,
          payment_status: 'paid',
          paid_at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          method: 'Razorpay UPI Autopay / Netbanking',
        },
        audit_summary: {
          total_rounds: round > 5 ? 5 : round,
          base_price: basePrice,
          agreed_price: finalAgreedPrice,
          discount_secured: Number(((basePrice - finalAgreedPrice) * quantity).toFixed(2)),
          discount_percent: Number((((basePrice - finalAgreedPrice) / basePrice) * 100).toFixed(2)),
          settlement_timestamp: new Date().toISOString(),
        },
      };

      const transaction: Transaction = {
        id: transactionId,
        bill_no: billNo,
        negotiation_id: negotiationId,
        buyer_id: request.buyer_id,
        seller_id: product.seller_id,
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: finalAgreedPrice,
        base_amount: baseAmount,
        gst_percent: gstPercent,
        gst_amount: gstAmount,
        transport_charge: transportCharge,
        total_amount: totalAmount,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_payment_link: `https://rzp.io/i/test_${billNo.toLowerCase()}`,
        payment_status: 'paid',
        invoice_data: invoiceData,
        audit_trail: [...actions],
        created_at: new Date().toISOString(),
      };

      return {
        status: 'agreed',
        rounds: round > 5 ? 5 : round,
        finalPrice: finalAgreedPrice,
        messages,
        actions,
        transaction,
      };
    } else {
      const failReason = `Reached maximum round limit (5/5) without consensus. Seller floor (₹${minPrice}) exceeded buyer ceiling (₹${maxBudget}).`;
      const failAction: AgentAction = {
        id: 'act-' + Math.random().toString(36).substring(2, 9),
        negotiation_id: negotiationId,
        action_by: 'system',
        action_type: 'no_deal_found',
        details: {
          message: 'Negotiation terminated without settlement.',
          reason: failReason,
        },
        timestamp: new Date().toISOString(),
      };
      actions.push(failAction);

      return {
        status: 'failed',
        rounds: 5,
        finalPrice: null,
        messages,
        actions,
        failureReason: failReason,
      };
    }
  }

  /**
   * Evaluates a human buyer's offer/counter in Interactive Bargain Mode.
   * Seller AI calculates margins, volume constraints, and responds naturally.
   */
  static respondToHumanOffer(
    product: Product,
    request: BuyerRequest,
    humanOfferPrice: number,
    humanText: string,
    currentRound: number,
    lastSellerPrice: number,
    existingActions: AgentAction[],
    negotiationId: string
  ): {
    sellerMessage: NegotiationMessage;
    sellerAction: AgentAction;
    isConsensus: boolean;
    isRejected: boolean;
    finalPrice: number | null;
    transaction?: Transaction;
  } {
    const basePrice = product.base_price;
    const minPrice = product.min_price;
    const quantity = request.quantity;
    const gstPercent = product.gst_percent;
    const transportCharge = product.transport_charge;
    const transportPerUnit = quantity > 0 ? transportCharge / quantity : 0;

    const getLandedCost = (price: number) => {
      const gstAmt = price * (gstPercent / 100);
      return {
        unit_price: price,
        gst_amount: Number(gstAmt.toFixed(2)),
        transport_per_unit: Number(transportPerUnit.toFixed(2)),
        total_unit_cost: Number((price + gstAmt + transportPerUnit).toFixed(2)),
      };
    };

    let actionType: 'accept' | 'counter' | 'reject' = 'counter';
    let sellerOfferPrice = minPrice;
    let messageText = '';
    let reasonText = '';

    // Check if buyer offer satisfies seller criteria
    if (humanOfferPrice >= basePrice) {
      actionType = 'accept';
      sellerOfferPrice = humanOfferPrice;
      messageText = `Deal pakka! We accept ₹${humanOfferPrice}/${product.unit} for ${quantity} ${product.unit}. Ready for instant dispatch!`;
      reasonText = `Buyer offer (₹${humanOfferPrice}) meets/exceeds catalog price (₹${basePrice}). 100% margin preserved.`;
    } else if (humanOfferPrice >= minPrice) {
      // Offer is above floor price
      if (
        currentRound >= 3 || 
        humanOfferPrice >= basePrice * 0.94 || 
        Math.abs(lastSellerPrice - humanOfferPrice) <= 1.5 ||
        humanText.toLowerCase().includes('final') ||
        humanText.toLowerCase().includes('accept')
      ) {
        actionType = 'accept';
        sellerOfferPrice = humanOfferPrice;
        messageText = `Agreed! Bilkul done karte hain at ₹${humanOfferPrice}/${product.unit} for this ${quantity} ${product.unit} order. Generating invoice now.`;
        reasonText = `Accepted rate ₹${humanOfferPrice} >= floor margin (₹${minPrice}). High inventory turnover achieved.`;
      } else {
        // Counter midway
        sellerOfferPrice = Math.max(minPrice, Math.round((humanOfferPrice + lastSellerPrice) / 2));
        actionType = 'counter';
        messageText = `Bhaiya, ₹${humanOfferPrice} thoda kam hai for this certified A-grade lot. How about we meet midway at ₹${sellerOfferPrice}/${product.unit}?`;
        reasonText = `Protected profit margin. Countered at midpoint (₹${sellerOfferPrice}) while acknowledging buyer interest.`;
      }
    } else {
      // Human offer is strictly below the secret minimum floor price
      if (currentRound >= 5) {
        sellerOfferPrice = minPrice;
        actionType = 'reject';
        messageText = `Negotiation limit reached. We cannot accept bids below ₹${minPrice}/${product.unit}.`;
        reasonText = `Enforced confidential floor ₹${minPrice}. Out of bounds bid ₹${humanOfferPrice} rejected.`;
      } else if (currentRound >= 4) {
        sellerOfferPrice = minPrice;
        actionType = 'counter';
        messageText = `Strict institutional floor: ₹${minPrice}/${product.unit} is our absolute break-even rate. We cannot sell below this.`;
        reasonText = `Enforced confidential floor ₹${minPrice}. Out of bounds bid ₹${humanOfferPrice} countered with floor.`;
      } else {
        sellerOfferPrice = Math.max(minPrice, Math.round((minPrice + basePrice) / 2));
        actionType = 'counter';
        messageText = `₹${humanOfferPrice} is unfortunately below our procurement cost. Best we can offer for bulk is ₹${sellerOfferPrice}/${product.unit}.`;
        reasonText = `Bid ₹${humanOfferPrice} < floor ₹${minPrice}. Directed user towards feasible rate (₹${sellerOfferPrice}).`;
      }
    }

    const sellerMsg: NegotiationMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      sender: 'seller_agent',
      round: currentRound,
      action: actionType,
      price: sellerOfferPrice,
      message: messageText,
      reason: reasonText,
      timestamp: new Date().toISOString(),
      landed_cost: getLandedCost(sellerOfferPrice),
    };

    const sellerAction: AgentAction = {
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      negotiation_id: negotiationId,
      action_by: 'seller_agent',
      action_type: actionType,
      round: currentRound,
      price: sellerOfferPrice,
      details: {
        message: messageText,
        reason: reasonText,
        floor_price_enforced: sellerOfferPrice >= minPrice,
      },
      timestamp: new Date().toISOString(),
    };

    if (actionType === 'accept') {
      const baseAmount = Number((sellerOfferPrice * quantity).toFixed(2));
      const gstAmount = Number((baseAmount * (gstPercent / 100)).toFixed(2));
      const totalAmount = Number((baseAmount + gstAmount + transportCharge).toFixed(2));
      const billNo = `A2A-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const transactionId = 'txn-' + Math.random().toString(36).substring(2, 9);
      const razorpayPaymentId = `pay_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

      const invoiceData: InvoiceData = {
        bill_no: billNo,
        invoice_date: new Date().toISOString().split('T')[0],
        seller: {
          name: product.seller_name || 'Enterprise Seller',
          business_name: product.seller_business || 'AgriHub Super Grains Pvt Ltd',
          gstin: product.seller_gstin || '07AAACA1234A1Z5',
          phone: '+91 98765 43210',
          address: 'APMC Market Complex, Sector 18, Commercial Hub, India',
        },
        buyer: {
          name: request.buyer_name || 'Procurement Officer',
          business_name: request.buyer_business || 'Commercial Enterprise Ltd',
          gstin: request.buyer_gstin || '19AAECB7788J1ZR',
          phone: '+91 98300 11223',
          address: 'B2B Logistics Park, Unit 4B, Metro Area, India',
        },
        item: {
          product_id: product.id,
          name: product.name,
          hsn_code: product.category === 'Agricultural Commodities' ? '1006.30' : '5208.52',
          quantity,
          unit: product.unit,
          unit_price: sellerOfferPrice,
          base_amount: baseAmount,
          gst_percent: gstPercent,
          cgst_percent: gstPercent / 2,
          cgst_amount: Number((gstAmount / 2).toFixed(2)),
          sgst_percent: gstPercent / 2,
          sgst_amount: Number((gstAmount / 2).toFixed(2)),
          transport_charge: transportCharge,
          total_amount: totalAmount,
        },
        payment: {
          razorpay_payment_id: razorpayPaymentId,
          razorpay_order_id: `order_A2A_${Math.floor(100000 + Math.random() * 900000)}`,
          payment_status: 'paid',
          paid_at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          method: 'Razorpay UPI Autopay / Corporate Card',
        },
        audit_summary: {
          total_rounds: currentRound,
          base_price: basePrice,
          agreed_price: sellerOfferPrice,
          discount_secured: Number(((basePrice - sellerOfferPrice) * quantity).toFixed(2)),
          discount_percent: Number((((basePrice - sellerOfferPrice) / basePrice) * 100).toFixed(2)),
          settlement_timestamp: new Date().toISOString(),
        },
      };

      const transaction: Transaction = {
        id: transactionId,
        bill_no: billNo,
        negotiation_id: negotiationId,
        buyer_id: request.buyer_id,
        seller_id: product.seller_id,
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: sellerOfferPrice,
        base_amount: baseAmount,
        gst_percent: gstPercent,
        gst_amount: gstAmount,
        transport_charge: transportCharge,
        total_amount: totalAmount,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_payment_link: `https://rzp.io/i/test_${billNo.toLowerCase()}`,
        payment_status: 'paid',
        invoice_data: invoiceData,
        audit_trail: [...existingActions, sellerAction],
        created_at: new Date().toISOString(),
      };

      return {
        sellerMessage: sellerMsg,
        sellerAction,
        isConsensus: true,
        isRejected: false,
        finalPrice: sellerOfferPrice,
        transaction,
      };
    }

    return {
      sellerMessage: sellerMsg,
      sellerAction,
      isConsensus: false,
      isRejected: actionType === 'reject',
      finalPrice: null,
    };
  }

  async runNegotiation(product: Product, request: BuyerRequest): Promise<NegotiationResult> {
    return AgentNegotiationEngine.executeRoundByRound(product, request);
  }
}
