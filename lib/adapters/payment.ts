/**
 * Payment adapter interface
 * Abstracts payment provider (Stripe, PayPal, etc.)
 */

export interface CheckoutSessionOptions {
  amount: number;
  currency: string;
  productName: string;
  productDescription?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string | null;
}

export interface IPaymentAdapter {
  /**
   * Create a checkout session
   */
  createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult>;

  /**
   * Verify a payment session
   */
  verifySession(sessionId: string): Promise<{ status: 'paid' | 'pending' | 'failed'; amount?: number }>;

  /**
   * Process a refund
   */
  processRefund(sessionId: string, amount?: number): Promise<{ success: boolean; refundId?: string }>;

  /**
   * Get adapter name/type
   */
  getName(): string;
}

/**
 * Mock payment adapter (for testing)
 */
export class MockPaymentAdapter implements IPaymentAdapter {
  async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult> {
    const sessionId = `mock_session_${Date.now()}`;
    return {
      sessionId,
      checkoutUrl: `/mock-checkout/${sessionId}`,
    };
  }

  async verifySession(sessionId: string) {
    return { status: 'paid' as const, amount: 5000 };
  }

  async processRefund(sessionId: string, amount?: number) {
    return { success: true, refundId: `mock_refund_${Date.now()}` };
  }

  getName() {
    return 'mock';
  }
}

// Singleton instance (can be swapped at runtime)
let paymentAdapter: IPaymentAdapter = new MockPaymentAdapter();

export function setPaymentAdapter(adapter: IPaymentAdapter) {
  paymentAdapter = adapter;
}

export function getPaymentAdapter(): IPaymentAdapter {
  return paymentAdapter;
}
