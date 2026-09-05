import { Transaction, PriceAlert, Product } from '../types';

export interface EmailMessage {
  id: string;
  recipientType: 'buyer' | 'seller' | 'price_alert';
  recipientEmail: string;
  recipientName: string;
  businessName: string;
  subject: string;
  htmlContent: string;
  plainText: string;
  sentAt: string;
  transactionId?: string;
  billNo?: string;
  paymentId?: string;
  status: 'sent' | 'delivered';
  alertId?: string;
}

export interface EmailNotificationResult {
  success: boolean;
  buyerEmail: EmailMessage;
  sellerEmail: EmailMessage;
  dispatchedAt: string;
}

// In-memory or session storage log of all triggered emails
const EMAIL_STORE_KEY = 'agent_bazar_sent_emails';

function getStoredEmails(): EmailMessage[] {
  try {
    const raw = localStorage.getItem(EMAIL_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredEmails(emails: EmailMessage[]) {
  try {
    localStorage.setItem(EMAIL_STORE_KEY, JSON.stringify(emails.slice(0, 50)));
  } catch {
    // ignore
  }
}

export class MockEmailService {
  /**
   * Generates and sends mock confirmation emails to both Buyer and Seller
   * whenever a transaction status updates to 'paid'.
   */
  static sendPaymentConfirmationEmails(
    tx: Transaction,
    buyerEmailAddress?: string,
    sellerEmailAddress?: string
  ): EmailNotificationResult {
    const now = new Date().toISOString();
    const paymentId = tx.razorpay_payment_id || `PAY_${Date.now()}`;
    const invoice = tx.invoice_data;

    const buyerName = invoice?.buyer.name || 'Vikram Singhania';
    const buyerBusiness = invoice?.buyer.business_name || 'Bengal Royal Hotels & Banquets';
    const buyerEmail = buyerEmailAddress || 'procurement@bengalroyal.com';

    const sellerName = invoice?.seller.name || 'Rajesh Agrawal';
    const sellerBusiness = invoice?.seller.business_name || 'Agrawal Agro Trading Co.';
    const sellerEmail = sellerEmailAddress || 'sales@agrawalagro.in';

    const amountFormatted = `₹${tx.total_amount.toLocaleString('en-IN')}`;
    const baseAmountFormatted = `₹${tx.base_amount.toLocaleString('en-IN')}`;
    const gstFormatted = `₹${tx.gst_amount.toLocaleString('en-IN')}`;
    const transportFormatted = `₹${tx.transport_charge.toLocaleString('en-IN')}`;
    const dateFormatted = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. Email for BUYER
    const buyerSubject = `Payment Confirmed: Invoice ${tx.bill_no} for ${tx.quantity} MT ${tx.product_name}`;
    const buyerPlainText = `
Dear ${buyerName} (${buyerBusiness}),

Your payment of ${amountFormatted} for Invoice #${tx.bill_no} has been successfully processed and confirmed.

Transaction Summary:
- Item: ${tx.product_name} (${tx.quantity} MT @ ₹${tx.unit_price}/MT)
- Base Amount: ${baseAmountFormatted}
- GST (${tx.gst_percent}%): ${gstFormatted}
- Transport & Logistics: ${transportFormatted}
- Total Amount Paid: ${amountFormatted}
- Razorpay Payment Ref: ${paymentId}
- Payment Timestamp: ${dateFormatted}
- Seller: ${sellerBusiness} (${invoice?.seller.gstin || '07AAAAA0000A1Z5'})

Your shipment is now queued for immediate dispatch under electronic Proof of Delivery (e-PoD) protocol.

Thank you for trading on Agent Bazar!
`;

    const buyerHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background: #1e1b4b; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Agent Bazar</h1>
          <p style="color: #a5b4fc; margin: 4px 0 0 0; font-size: 13px;">Autonomous Multi-Agent B2B Settlement</p>
        </div>
        
        <div style="padding: 24px;">
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 20px; display: flex; align-items: center;">
            <div style="font-size: 24px; margin-right: 12px;">✅</div>
            <div>
              <h3 style="color: #065f46; margin: 0; font-size: 15px; font-weight: 700;">Payment Successful & Confirmed</h3>
              <p style="color: #047857; margin: 2px 0 0 0; font-size: 12px;">Payment ID: <strong style="font-family: monospace;">${paymentId}</strong></p>
            </div>
          </div>

          <p style="color: #334155; font-size: 14px; line-height: 1.5; margin-top: 0;">
            Dear <strong>${buyerName}</strong> (${buyerBusiness}),<br/>
            We have received your payment of <strong style="color: #0f172a; font-size: 16px;">${amountFormatted}</strong> for <strong>Invoice #${tx.bill_no}</strong>.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b;">Commodity / Order</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a;">${tx.product_name} (${tx.quantity} MT)</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b;">Agreed Rate</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a;">₹${tx.unit_price.toLocaleString('en-IN')} / MT</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b;">Taxable Base</td>
                <td style="padding: 8px 0; text-align: right; color: #334155;">${baseAmountFormatted}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b;">GST (${tx.gst_percent}%)</td>
                <td style="padding: 8px 0; text-align: right; color: #059669; font-weight: 600;">+${gstFormatted}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b;">Transport Logistics</td>
                <td style="padding: 8px 0; text-align: right; color: #334155;">+${transportFormatted}</td>
              </tr>
              <tr style="background: #f8fafc; font-weight: 700; font-size: 14px;">
                <td style="padding: 12px 8px; color: #0f172a;">Total Paid (INR)</td>
                <td style="padding: 12px 8px; text-align: right; color: #4338ca;">${amountFormatted}</td>
              </tr>
            </tbody>
          </table>

          <div style="background: #f8fafc; border-radius: 8px; padding: 14px; border: 1px dashed #cbd5e1; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 12px; color: #475569;">
              <strong>Counterparty Seller:</strong> ${sellerBusiness}<br/>
              <strong>GSTIN:</strong> ${invoice?.seller.gstin || '07AAAAA0000A1Z5'}<br/>
              <strong>Dispatch SLA:</strong> Next-day e-Way bill generated automatically.
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-bottom: 0;">
            This is an automated notification dispatched by Agent Bazar Transaction Engine.
          </p>
        </div>
      </div>
    `;

    // 2. Email for SELLER
    const sellerSubject = `Payment Received: ₹${tx.total_amount.toLocaleString('en-IN')} for Invoice ${tx.bill_no}`;
    const sellerPlainText = `
Dear ${sellerName} (${sellerBusiness}),

Good news! Payment of ${amountFormatted} for Invoice #${tx.bill_no} has been received and verified from buyer ${buyerBusiness}.

Transaction Summary:
- Buyer: ${buyerBusiness} (${buyerName})
- Buyer GSTIN: ${invoice?.buyer.gstin || '19AAECB7788J1ZR'}
- Item: ${tx.product_name} (${tx.quantity} MT @ ₹${tx.unit_price}/MT)
- Total Gross Collected: ${amountFormatted}
- Razorpay Payment Ref: ${paymentId}
- Timestamp: ${dateFormatted}

The autonomous escrow is now funded and ready for dispatch release upon buyer e-PoD verification.
`;

    const sellerHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background: #064e3b; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Agent Bazar</h1>
          <p style="color: #a7f3d0; margin: 4px 0 0 0; font-size: 13px;">Merchant Escrow & Settlement Notification</p>
        </div>
        
        <div style="padding: 24px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h3 style="color: #166534; margin: 0; font-size: 15px; font-weight: 700;">💰 Funds Received & Escrow Funded</h3>
            <p style="color: #15803d; margin: 4px 0 0 0; font-size: 12px;">Payment ID: <strong style="font-family: monospace;">${paymentId}</strong></p>
          </div>

          <p style="color: #334155; font-size: 14px; line-height: 1.5; margin-top: 0;">
            Dear <strong>${sellerName}</strong> (${sellerBusiness}),<br/>
            Buyer <strong>${buyerBusiness}</strong> has completed the full settlement of <strong style="color: #0f172a; font-size: 16px;">${amountFormatted}</strong> for <strong>Invoice #${tx.bill_no}</strong>.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b;">Buyer Enterprise</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a;">${buyerBusiness}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b;">Buyer GSTIN</td>
                <td style="padding: 8px 0; text-align: right; font-mono font-weight: 600; color: #0f172a;">${invoice?.buyer.gstin || '19AAECB7788J1ZR'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b;">Dispatched Commodity</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a;">${tx.product_name} (${tx.quantity} MT)</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b;">Base Sale Value</td>
                <td style="padding: 8px 0; text-align: right; color: #334155;">${baseAmountFormatted}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b;">GST Output Liability</td>
                <td style="padding: 8px 0; text-align: right; color: #059669; font-weight: 600;">+${gstFormatted}</td>
              </tr>
              <tr style="background: #f8fafc; font-weight: 700; font-size: 14px;">
                <td style="padding: 12px 8px; color: #0f172a;">Net Escrow Locked (INR)</td>
                <td style="padding: 12px 8px; text-align: right; color: #059669;">${amountFormatted}</td>
              </tr>
            </tbody>
          </table>

          <div style="background: #fffbeb; border-radius: 8px; padding: 14px; border: 1px solid #fde68a; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 12px; color: #92400e;">
              <strong>Next Steps:</strong> Please proceed to generate the e-Way bill and dispatch via assigned carrier. Escrow will release to your linked bank account upon e-PoD verification.
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-bottom: 0;">
            This is an automated notification dispatched by Agent Bazar Transaction Engine.
          </p>
        </div>
      </div>
    `;

    const buyerMessage: EmailMessage = {
      id: `email-buyer-${Date.now()}`,
      recipientType: 'buyer',
      recipientEmail: buyerEmail,
      recipientName: buyerName,
      businessName: buyerBusiness,
      subject: buyerSubject,
      htmlContent: buyerHtml,
      plainText: buyerPlainText,
      sentAt: now,
      transactionId: tx.id,
      billNo: tx.bill_no,
      paymentId,
      status: 'sent',
    };

    const sellerMessage: EmailMessage = {
      id: `email-seller-${Date.now()}`,
      recipientType: 'seller',
      recipientEmail: sellerEmail,
      recipientName: sellerName,
      businessName: sellerBusiness,
      subject: sellerSubject,
      htmlContent: sellerHtml,
      plainText: sellerPlainText,
      sentAt: now,
      transactionId: tx.id,
      billNo: tx.bill_no,
      paymentId,
      status: 'sent',
    };

    // Save to persistent storage
    const current = getStoredEmails();
    saveStoredEmails([buyerMessage, sellerMessage, ...current]);

    // Also log to console for debugging
    console.log(`[MockEmailService] 📧 Sent Buyer Confirmation to: ${buyerEmail} (${buyerSubject})`);
    console.log(`[MockEmailService] 📧 Sent Seller Confirmation to: ${sellerEmail} (${sellerSubject})`);

    return {
      success: true,
      buyerEmail: buyerMessage,
      sellerEmail: sellerMessage,
      dispatchedAt: now,
    };
  }

  /**
   * Generates and dispatches a price alert match notification email to the buyer
   * when an autonomous agent deal converges at or below their target price.
   */
  static sendPriceAlertEmail(
    alert: PriceAlert,
    agreedPrice: number,
    product: Product,
    tx?: Transaction
  ): EmailMessage {
    const now = new Date().toISOString();
    const recipientName = alert.buyer_name || 'Valued Trader';
    const businessName = alert.buyer_business || 'Verified Enterprise Buyer';
    const recipientEmail = alert.buyer_email || 'procurement@enterprise.com';
    const savingsPerUnit = Math.max(0, product.base_price - agreedPrice);
    const savingsPercent = Math.round((savingsPerUnit / product.base_price) * 100);

    const subject = `🔔 Price Alert Triggered: ${product.name} matched at ₹${agreedPrice}/${product.unit}!`;

    const plainText = `
Dear ${recipientName} (${businessName}),

Great news! An autonomous AI negotiation has matched your target price alert.

Deal Overview:
- Commodity: ${product.name} (${product.category})
- Your Target Price: ₹${alert.target_price}/${alert.unit}
- Realized Negotiated Deal Price: ₹${agreedPrice}/${product.unit} (₹${savingsPerUnit} below list price, ${savingsPercent}% saved)
- Seller / Supplier: ${product.seller_business || 'AgriHub Super Grains Pvt Ltd'} (GSTIN: ${product.seller_gstin || '07AAACA1234A1Z5'})
- Base Catalog Price: ₹${product.base_price}/${alert.unit}
${tx ? `- Transaction Bill No: ${tx.bill_no}` : ''}
${tx ? `- Total Settled Amount: ₹${tx.total_amount.toLocaleString('en-IN')}` : ''}

Log in to Agent Bazar to review this transaction, download your GST compliant invoice, or lock in procurement terms.

Agent Bazar - India's Autonomous B2B Commerce Platform
`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4338ca 0%, #312e81 100%); padding: 28px; text-align: left; color: #ffffff;">
          <div style="display: inline-block; background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #fde68a; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px;">
            🔔 Price Target Match Sealed
          </div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff;">
            Target Price Met by AI Agent!
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #c7d2fe;">
            Autonomous negotiation converged at or below your set threshold
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 28px;">
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-top: 0;">
            Dear <strong>${recipientName}</strong> (<span style="color: #64748b;">${businessName}</span>),
          </p>
          <p style="font-size: 13px; line-height: 1.6; color: #475569;">
            Your active price alert for <strong>${product.name}</strong> was triggered because the autonomous AI agent successfully negotiated a deal at <strong style="color: #10b981; font-size: 16px;">₹${agreedPrice}/${product.unit}</strong> (your target was <strong>≤ ₹${alert.target_price}/${product.unit}</strong>).
          </p>

          <!-- Deal Specs Card -->
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Commodity</span>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${product.name}</div>
              </div>
              <div style="text-align: right;">
                <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px;">
                  Saved ${savingsPercent}%
                </span>
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Your Alert Target:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #4338ca; text-align: right;">≤ ₹${alert.target_price}/${alert.unit}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Deal Unit Price:</td>
                <td style="padding: 6px 0; font-weight: 800; color: #059669; text-align: right; font-size: 14px;">₹${agreedPrice}/${alert.unit}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Catalog Base Price:</td>
                <td style="padding: 6px 0; text-decoration: line-through; color: #94a3b8; text-align: right;">₹${product.base_price}/${alert.unit}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Supplier / Godown:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #1e293b; text-align: right;">${product.seller_business || 'Verified APMC Wholesaler'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">GST Rate:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #1e293b; text-align: right;">${product.gst_percent}% (Full ITC Eligible)</td>
              </tr>
              ${tx ? `
              <tr style="border-top: 1px dashed #cbd5e1;">
                <td style="padding: 8px 0 0 0; color: #0f172a; font-weight: 700;">Settlement Bill No:</td>
                <td style="padding: 8px 0 0 0; font-weight: 800; color: #4338ca; text-align: right; font-family: monospace;">${tx.bill_no}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Direct CTA -->
          <div style="text-align: center; margin: 24px 0 16px 0;">
            <div style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
              ✓ Verified by Agent Bazar Autonomous Engine
            </div>
          </div>

          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-bottom: 0;">
            Notification generated by Agent Bazar B2B Market Telemetry. To manage alerts, visit your Buyer Dashboard.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 16px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
          <p style="margin: 0;">
            © 2026 Agent Bazar Technologies India Pvt Ltd. Autonomous B2B Commerce Network.
          </p>
        </div>
      </div>
    `;

    const alertEmail: EmailMessage = {
      id: `email-alert-${Date.now()}`,
      recipientType: 'price_alert',
      recipientEmail,
      recipientName,
      businessName,
      subject,
      htmlContent,
      plainText,
      sentAt: now,
      transactionId: tx?.id,
      billNo: tx?.bill_no,
      status: 'sent',
      alertId: alert.id,
    };

    // Save to persistent storage
    const current = getStoredEmails();
    saveStoredEmails([alertEmail, ...current]);

    console.log(`[MockEmailService] 🔔 Price Alert Email Dispatched to: ${recipientEmail} (${subject})`);

    return alertEmail;
  }

  /**
   * Retrieves all historical mock emails sent by the application.
   */
  static getSentEmails(): EmailMessage[] {
    return getStoredEmails();
  }

  /**
   * Clears email dispatch history.
   */
  static clearEmails() {
    try {
      localStorage.removeItem(EMAIL_STORE_KEY);
    } catch {
      // ignore
    }
  }
}
