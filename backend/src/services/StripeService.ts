import Stripe from "stripe";
import { config } from "../config";

// Supported currencies with their minor-unit multiplier
const CURRENCY_CONFIG: Record<string, { multiplier: number; symbol: string }> = {
  eur: { multiplier: 100, symbol: "€" },
  usd: { multiplier: 100, symbol: "$" },
  gbp: { multiplier: 100, symbol: "£" },
  chf: { multiplier: 100, symbol: "CHF" },
  jpy: { multiplier: 1, symbol: "¥" }, // JPY has no subunits
};

const DEFAULT_CURRENCY = "eur";

/**
 * StripeService — Handles Stripe payment operations.
 * - Creates PaymentIntents with automatic_payment_methods enabled
 *   so ALL configured methods (card, Bancontact, Klarna, iDEAL, etc.) are shown
 * - Supports multiple currencies
 * - Stripe automatically handles taxes via Stripe Tax if enabled in dashboard
 */
export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!config.stripeSecretKey) {
      console.warn("⚠️  STRIPE_SECRET_KEY not set. Stripe payments will fail.");
    }
    this.stripe = new Stripe(config.stripeSecretKey);
  }

  /**
   * Convert a human-readable amount to Stripe minor units.
   * e.g. 500 EUR → 50000 cents, 500 JPY → 500 yen
   */
  private toMinorUnits(amount: number, currency: string): number {
    const cfg = CURRENCY_CONFIG[currency.toLowerCase()];
    const multiplier = cfg ? cfg.multiplier : 100;
    return Math.round(amount * multiplier);
  }

  /**
   * Create a PaymentIntent for an investment.
   * Uses automatic_payment_methods to show ALL available methods
   * (card, Bancontact, Klarna, iDEAL, EPS, SEPA, Sofort, etc.)
   */
  async createPaymentIntent(params: {
    amount: number;
    currency?: string;
    userId: string;
    assetId: string;
    transactionId: string;
    description?: string;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const currency = (params.currency || DEFAULT_CURRENCY).toLowerCase();
    const amountMinor = this.toMinorUnits(params.amount, currency);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountMinor,
      currency,
      automatic_payment_methods: {
        enabled: true, // Stripe auto-shows all methods enabled in dashboard
      },
      metadata: {
        userId: params.userId,
        assetId: params.assetId,
        transactionId: params.transactionId,
        platform: "asthia",
      },
      description:
        params.description ||
        `Investissement Asthia — ${params.amount} ${(CURRENCY_CONFIG[currency]?.symbol || currency.toUpperCase())}`,
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe did not return a client_secret");
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Create a PaymentIntent specifically for a marketplace (secondary market) purchase.
   */
  async createMarketplacePaymentIntent(params: {
    amount: number;
    currency?: string;
    buyerId: string;
    sellerId: string;
    listingId: string;
    transactionId: string;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const currency = (params.currency || DEFAULT_CURRENCY).toLowerCase();
    const amountMinor = this.toMinorUnits(params.amount, currency);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountMinor,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        buyerId: params.buyerId,
        sellerId: params.sellerId,
        listingId: params.listingId,
        transactionId: params.transactionId,
        platform: "asthia",
        type: "marketplace",
      },
      description: `Achat Marché Secondaire Asthia — ${params.amount} ${(CURRENCY_CONFIG[currency]?.symbol || currency.toUpperCase())}`,
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe did not return a client_secret");
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Retrieve a PaymentIntent to check its status.
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Verify and construct a webhook event from Stripe.
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripeWebhookSecret
    );
  }

  /**
   * Get the list of supported currencies.
   */
  getSupportedCurrencies() {
    return Object.entries(CURRENCY_CONFIG).map(([code, cfg]) => ({
      code,
      symbol: cfg.symbol,
    }));
  }
}
