import { PriceAlert, Product, Transaction } from '../types';
import { MockEmailService, EmailMessage } from './emailService';
import { SEED_PRODUCTS } from '../data/seedData';

const PRICE_ALERT_STORAGE_KEY = 'agent_bazar_price_alerts';

const INITIAL_PRICE_ALERTS: PriceAlert[] = [
  {
    id: 'alert-seed-1',
    product_id: 'prod-1',
    product_name: '1121 Supreme Aged Basmati Rice (Premium Export Grade)',
    category: 'Agricultural Commodities',
    target_price: 78,
    current_base_price: 85,
    buyer_email: 'procurement@bengalhospitality.org',
    buyer_name: 'Amitabh Sen',
    buyer_business: 'Bengal Royal Hotels & Banquets',
    unit: 'kg',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'active',
    enable_browser_notifications: true,
  },
  {
    id: 'alert-seed-2',
    product_id: 'prod-2',
    product_name: 'Sharbati Wheat Grain (Unpolished High Protein)',
    category: 'Agricultural Commodities',
    target_price: 38,
    current_base_price: 42,
    buyer_email: 'priya@chennaicaterers.in',
    buyer_name: 'Priya Sundaram',
    buyer_business: 'Sundaram Gourmet Kitchens',
    unit: 'kg',
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    status: 'active',
    enable_browser_notifications: true,
  },
  {
    id: 'alert-seed-3',
    product_id: 'prod-3',
    product_name: 'Organic Desi Toor Dal (Unpolished Premium Bold)',
    category: 'Agricultural Commodities',
    target_price: 135,
    current_base_price: 145,
    buyer_email: 'amitabh@bengalhospitality.org',
    buyer_name: 'Amitabh Sen',
    buyer_business: 'Bengal Royal Hotels & Banquets',
    unit: 'kg',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'active',
    enable_browser_notifications: true,
  },
];

export class PriceAlertService {
  /**
   * Loads all price alerts from local storage or returns initial seed alerts
   */
  static getPriceAlerts(): PriceAlert[] {
    try {
      const stored = localStorage.getItem(PRICE_ALERT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[PriceAlertService] Failed to read stored alerts:', e);
    }
    this.savePriceAlerts(INITIAL_PRICE_ALERTS);
    return INITIAL_PRICE_ALERTS;
  }

  /**
   * Persists price alerts to local storage
   */
  static savePriceAlerts(alerts: PriceAlert[]): void {
    try {
      localStorage.setItem(PRICE_ALERT_STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('[PriceAlertService] Failed to save alerts:', e);
    }
  }

  /**
   * Creates a new price alert
   */
  static createPriceAlert(
    alertData: Omit<PriceAlert, 'id' | 'created_at' | 'status'>
  ): PriceAlert {
    const alerts = this.getPriceAlerts();
    
    // Check if active alert already exists for this product & email
    const existingIndex = alerts.findIndex(
      (a) => a.product_id === alertData.product_id && a.buyer_email === alertData.buyer_email && a.status === 'active'
    );

    const newAlert: PriceAlert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      status: 'active',
    };

    if (existingIndex >= 0) {
      alerts[existingIndex] = newAlert;
    } else {
      alerts.unshift(newAlert);
    }

    this.savePriceAlerts(alerts);
    this.requestBrowserNotificationPermission();
    return newAlert;
  }

  /**
   * Deletes a price alert by ID
   */
  static deletePriceAlert(alertId: string): PriceAlert[] {
    const alerts = this.getPriceAlerts().filter((a) => a.id !== alertId);
    this.savePriceAlerts(alerts);
    return alerts;
  }

  /**
   * Toggles active / dismissed state
   */
  static toggleAlertStatus(alertId: string): PriceAlert[] {
    const alerts = this.getPriceAlerts().map((a) => {
      if (a.id === alertId) {
        return {
          ...a,
          status: (a.status === 'active' ? 'dismissed' : 'active') as 'active' | 'dismissed',
        };
      }
      return a;
    });
    this.savePriceAlerts(alerts);
    return alerts;
  }

  /**
   * Requests desktop browser notification permission gracefully
   */
  static async requestBrowserNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Fires a native browser notification
   */
  static dispatchBrowserNotification(title: string, body: string, iconUrl?: string) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: iconUrl || '/favicon.ico',
            badge: '/favicon.ico',
          });
        } catch (e) {
          console.log('[PriceAlertService] Native notification suppressed:', e);
        }
      }
    }
  }

  /**
   * Evaluates all active alerts against a newly agreed unit price.
   * If the agreed price is at or below the buyer's target price, triggers the alert,
   * sends a mock email, and emits a browser notification.
   */
  static checkAndTriggerAlerts(
    product: Product,
    agreedUnitPrice: number,
    tx?: Transaction
  ): { triggeredAlerts: PriceAlert[]; emailsDispatched: EmailMessage[] } {
    const alerts = this.getPriceAlerts();
    const triggeredAlerts: PriceAlert[] = [];
    const emailsDispatched: EmailMessage[] = [];

    const updatedAlerts = alerts.map((alert) => {
      const isMatch =
        alert.status === 'active' &&
        (alert.product_id === product.id || alert.product_name.toLowerCase() === product.name.toLowerCase()) &&
        agreedUnitPrice <= alert.target_price;

      if (isMatch) {
        const now = new Date().toISOString();
        const updatedAlert: PriceAlert = {
          ...alert,
          status: 'triggered',
          triggered_deal_price: agreedUnitPrice,
          triggered_at: now,
          bill_no: tx?.bill_no,
        };

        triggeredAlerts.push(updatedAlert);

        // 1. Dispatch Email via MockEmailService
        try {
          const email = MockEmailService.sendPriceAlertEmail(updatedAlert, agreedUnitPrice, product, tx);
          emailsDispatched.push(email);
        } catch (err) {
          console.error('[PriceAlertService] Failed to dispatch price alert email:', err);
        }

        // 2. Dispatch Desktop Browser Notification
        if (alert.enable_browser_notifications !== false) {
          this.dispatchBrowserNotification(
            `🔔 Price Target Met: ₹${agreedUnitPrice}/${product.unit}!`,
            `Agent deal sealed for "${product.name}" at ₹${agreedUnitPrice}/${product.unit} (Target was ≤₹${alert.target_price}). Dispatch logged to ${alert.buyer_email}.`
          );
        }

        return updatedAlert;
      }
      return alert;
    });

    if (triggeredAlerts.length > 0) {
      this.savePriceAlerts(updatedAlerts);
    }

    return { triggeredAlerts, emailsDispatched };
  }

  /**
   * Explicitly simulates an agent match for demonstration purposes
   */
  static simulateAlertMatch(
    alertId: string,
    customDealPrice?: number
  ): { alert: PriceAlert; email: EmailMessage } | null {
    const alerts = this.getPriceAlerts();
    const targetAlert = alerts.find((a) => a.id === alertId);
    if (!targetAlert) return null;

    const product =
      SEED_PRODUCTS.find((p) => p.id === targetAlert.product_id) || {
        id: targetAlert.product_id,
        seller_id: 'usr-seller-1',
        seller_business: 'AgriHub Super Grains Pvt Ltd',
        seller_gstin: '07AAACA1234A1Z5',
        name: targetAlert.product_name,
        category: targetAlert.category || 'Agricultural Commodities',
        description: 'Quality assured wholesale commodity.',
        base_price: targetAlert.current_base_price,
        min_price: targetAlert.target_price - 2,
        stock: 5000,
        gst_percent: 5.0,
        transport_charge: 200,
        delivery_days: 3,
        is_active: true,
        unit: targetAlert.unit,
        created_at: new Date().toISOString(),
      };

    const simulatedDealPrice = customDealPrice || Math.max(1, targetAlert.target_price - 1);
    const simulatedBillNo = `A2A-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const simulatedTx: Transaction = {
      id: `tx-alert-sim-${Date.now()}`,
      bill_no: simulatedBillNo,
      negotiation_id: `neg-sim-${Date.now()}`,
      buyer_id: 'usr-buyer-1',
      seller_id: product.seller_id,
      product_id: product.id,
      product_name: product.name,
      quantity: 50,
      unit_price: simulatedDealPrice,
      base_amount: simulatedDealPrice * 50,
      gst_percent: product.gst_percent,
      gst_amount: Number(((simulatedDealPrice * 50 * product.gst_percent) / 100).toFixed(2)),
      transport_charge: product.transport_charge,
      total_amount: Number((simulatedDealPrice * 50 * (1 + product.gst_percent / 100) + product.transport_charge).toFixed(2)),
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      audit_trail: [],
    };

    const result = this.checkAndTriggerAlerts(product, simulatedDealPrice, simulatedTx);
    if (result.triggeredAlerts.length > 0) {
      return {
        alert: result.triggeredAlerts[0],
        email: result.emailsDispatched[0],
      };
    }

    return null;
  }
}
