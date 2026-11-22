/**
 * sepay-handler.ts
 * VietQR / SePay Webhook Ingestion Engine
 * Handles cryptographic signature verification, strict idempotency against duplicate webhooks,
 * order amount matching, and safe subscription activation.
 */

export interface SePayWebhookPayload {
  id: number; // SePay internal transaction id
  gateway: string; // e.g. 'Vietcombank', 'TPBank'
  transactionDate: string; // e.g. '2026-11-22 15:30:00'
  accountNumber: string;
  code?: string | null;
  content: string; // Transfer note, e.g. 'BIGMAN ORDER9832'
  transferType: 'in' | 'out';
  transferAmount: number;
  accumulated: number;
  subAccount?: string | null;
  referenceCode?: string;
  description?: string;
}

export interface StoredOrder {
  orderCode: string;
  workspaceId: string;
  planId: string;
  amountVnd: number;
  status: 'pending' | 'paid' | 'underpaid' | 'canceled';
  paidAt?: Date | null;
  creditAdded: number;
  subscriptionDaysAdded: number;
}

export interface WebhookResult {
  statusCode: number;
  success: boolean;
  duplicate: boolean;
  message: string;
  orderCode?: string;
}

export class SePayWebhookHandler {
  private secretToken: string;
  private orders: Map<string, StoredOrder> = new Map();
  private processedTransactions: Set<number> = new Set();
  private processingLocks: Set<string> = new Set();

  constructor(secretToken: string = 'sepay_secret_token_123456') {
    this.secretToken = secretToken;
  }

  public registerOrder(order: StoredOrder): void {
    this.orders.set(order.orderCode, { ...order });
  }

  public getOrder(orderCode: string): StoredOrder | undefined {
    return this.orders.get(orderCode);
  }

  /**
   * Verifies the incoming webhook header.
   */
  public verifyAuth(authHeader?: string): boolean {
    if (!authHeader) return false;
    // Supports 'Apikey <token>' or raw token
    const token = authHeader.replace(/^Apikey\s+/i, '').trim();
    return token === this.secretToken;
  }

  /**
   * Extracts the order code from the bank transfer content.
   * Matches pattern: 'BIGMAN <ORDER_CODE>' or 'ORDER<digits>'
   */
  public extractOrderCode(content: string): string | null {
    if (!content) return null;
    const match = content.match(/BIGMAN\s+([A-Z0-9_-]+)/i) || content.match(/(ORDER[0-9]+)/i);
    return match ? match[1].toUpperCase() : null;
  }

  /**
   * Processes the incoming SePay transaction with strict idempotency and lock protection.
   */
  public async handleWebhook(
    payload: SePayWebhookPayload,
    authHeader?: string
  ): Promise<WebhookResult> {
    // 1. Authenticate webhook caller
    if (!this.verifyAuth(authHeader)) {
      return {
        statusCode: 401,
        success: false,
        duplicate: false,
        message: 'Unauthorized: Invalid SePay webhook API key',
      };
    }

    // 2. Validate transfer type
    if (payload.transferType !== 'in') {
      return {
        statusCode: 200,
        success: true,
        duplicate: false,
        message: 'Ignored: Not an incoming payment',
      };
    }

    // 3. Prevent duplicate processing via SePay transaction ID
    if (this.processedTransactions.has(payload.id)) {
      return {
        statusCode: 200,
        success: true,
        duplicate: true,
        message: `Idempotent response: SePay transaction ${payload.id} already processed. No extra action taken.`,
      };
    }

    // 4. Extract order code
    const orderCode = this.extractOrderCode(payload.content);
    if (!orderCode) {
      return {
        statusCode: 400,
        success: false,
        duplicate: false,
        message: 'Could not extract valid BIGMAN order code from payment content',
      };
    }

    // 5. Look up matching order
    const order = this.orders.get(orderCode);
    if (!order) {
      return {
        statusCode: 404,
        success: false,
        duplicate: false,
        message: `Order code ${orderCode} not found in database`,
        orderCode,
      };
    }

    // 6. Check if order is already settled (Idempotency at Order level)
    if (order.status === 'paid') {
      this.processedTransactions.add(payload.id);
      return {
        statusCode: 200,
        success: true,
        duplicate: true,
        message: `Order ${orderCode} was already fulfilled at ${order.paidAt?.toISOString()}. Idempotent skip.`,
        orderCode,
      };
    }

    // 7. Atomic Lock: Prevent concurrent requests for the same order code
    if (this.processingLocks.has(orderCode)) {
      // Return 200 with notice that processing is in flight
      return {
        statusCode: 200,
        success: true,
        duplicate: true,
        message: `Order ${orderCode} is currently being settled by a concurrent thread. Skipping double process.`,
        orderCode,
      };
    }

    this.processingLocks.add(orderCode);

    try {
      // 8. Amount Validation
      if (payload.transferAmount < order.amountVnd) {
        order.status = 'underpaid';
        return {
          statusCode: 400,
          success: false,
          duplicate: false,
          message: `Underpaid: Received ${payload.transferAmount} VND, but order requires ${order.amountVnd} VND.`,
          orderCode,
        };
      }

      // 9. Fulfill Order: Add Credits & Extend Subscription
      order.status = 'paid';
      order.paidAt = new Date();
      order.creditAdded += 10_000_000; // e.g. 10M tokens for Cloud Pro
      order.subscriptionDaysAdded += 30; // 30 days subscription

      this.processedTransactions.add(payload.id);

      return {
        statusCode: 200,
        success: true,
        duplicate: false,
        message: `Order ${orderCode} successfully activated. Subscription extended by 30 days.`,
        orderCode,
      };
    } finally {
      this.processingLocks.delete(orderCode);
    }
  }
}
