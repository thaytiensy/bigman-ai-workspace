import { describe, it, expect, beforeEach } from 'vitest';
import {
  SePayWebhookHandler,
  type SePayWebhookPayload,
  type StoredOrder,
} from '../src/lib/server/sepay-handler';

describe('VietQR / SePay Payment Webhook & Idempotency Test Suite', () => {
  let handler: SePayWebhookHandler;
  const secretApiKey = 'sepay_live_secret_key_vietqr_2026';
  const orderCode = 'BIGMAN9832';

  beforeEach(() => {
    handler = new SePayWebhookHandler(secretApiKey);

    const pendingOrder: StoredOrder = {
      orderCode,
      workspaceId: 'ws-shop-vietnam',
      planId: 'cloud_pro',
      amountVnd: 799000,
      status: 'pending',
      creditAdded: 0,
      subscriptionDaysAdded: 0,
    };

    handler.registerOrder(pendingOrder);
  });

  describe('1. Webhook Authentication & Signature Guard', () => {
    const validPayload: SePayWebhookPayload = {
      id: 1001,
      gateway: 'TEST_BANK',
      transactionDate: '2026-11-22 15:30:00',
      accountNumber: '0000000000',
      content: `Chuyen khoan BIGMAN ${orderCode}`,
      transferType: 'in',
      transferAmount: 799000,
      accumulated: 15000000,
    };

    it('Rejects requests with missing Authorization header (401)', async () => {
      const result = await handler.handleWebhook(validPayload);
      expect(result.statusCode).toBe(401);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unauthorized');
    });

    it('Rejects requests with forged / invalid API Key (401)', async () => {
      const result = await handler.handleWebhook(validPayload, 'Apikey fake_unauthorized_key');
      expect(result.statusCode).toBe(401);
      expect(result.success).toBe(false);
    });

    it('Accepts valid webhook with correct Apikey header (200)', async () => {
      const result = await handler.handleWebhook(validPayload, `Apikey ${secretApiKey}`);
      expect(result.statusCode).toBe(200);
      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(false);
    });
  });

  describe('2. Webhook Idempotency: Anti-Duplicate Payment Test', () => {
    it('Handles 5 duplicate webhooks for the same order without double-crediting or multiplying subscription', async () => {
      const duplicatePayload: SePayWebhookPayload = {
        id: 88881,
        gateway: 'Vietcombank',
        transactionDate: '2026-11-22 15:35:10',
        accountNumber: '0000000000',
        content: `Thanh toan don hang BIGMAN ${orderCode}`,
        transferType: 'in',
        transferAmount: 799000,
        accumulated: 25000000,
      };

      const authHeader = `Apikey ${secretApiKey}`;

      // 1st Webhook: Successfully fulfills order
      const res1 = await handler.handleWebhook(duplicatePayload, authHeader);
      expect(res1.statusCode).toBe(200);
      expect(res1.success).toBe(true);
      expect(res1.duplicate).toBe(false);

      // Verify DB state after 1st call
      const orderAfterFirst = handler.getOrder(orderCode)!;
      expect(orderAfterFirst.status).toBe('paid');
      expect(orderAfterFirst.creditAdded).toBe(10_000_000);
      expect(orderAfterFirst.subscriptionDaysAdded).toBe(30);

      // 2nd to 5th Duplicate Webhooks: Must return 200 with duplicate flag, 0 extra credits!
      for (let i = 2; i <= 5; i++) {
        const resDup = await handler.handleWebhook(duplicatePayload, authHeader);
        expect(resDup.statusCode).toBe(200);
        expect(resDup.success).toBe(true);
        expect(resDup.duplicate).toBe(true);
      }

      // Final DB state verification: EXACTLY 10M tokens and 30 days, NOT 50M tokens or 150 days!
      const finalOrder = handler.getOrder(orderCode)!;
      expect(finalOrder.creditAdded).toBe(10_000_000);
      expect(finalOrder.subscriptionDaysAdded).toBe(30);
    });

    it('Handles separate transaction IDs pointing to the already paid order (Order-level idempotency)', async () => {
      const authHeader = `Apikey ${secretApiKey}`;

      // Fulfill with first transaction
      await handler.handleWebhook(
        {
          id: 9001,
          gateway: 'TPBank',
          transactionDate: '2026-11-22 15:40:00',
          accountNumber: '0000000000',
          content: `BIGMAN ${orderCode}`,
          transferType: 'in',
          transferAmount: 799000,
          accumulated: 10000000,
        },
        authHeader
      );

      // Second transaction with different ID but same order code
      const resRetry = await handler.handleWebhook(
        {
          id: 9002, // Different transaction id
          gateway: 'TPBank',
          transactionDate: '2026-11-22 15:40:02',
          accountNumber: '0000000000',
          content: `BIGMAN ${orderCode}`,
          transferType: 'in',
          transferAmount: 799000,
          accumulated: 10000000,
        },
        authHeader
      );

      expect(resRetry.statusCode).toBe(200);
      expect(resRetry.duplicate).toBe(true);

      const order = handler.getOrder(orderCode)!;
      expect(order.creditAdded).toBe(10_000_000);
      expect(order.subscriptionDaysAdded).toBe(30);
    });
  });

  describe('3. Order Validation & Underpayment Prevention', () => {
    it('Detects underpayment: does NOT activate subscription if amount transferred is less than order amount', async () => {
      const underpaidPayload: SePayWebhookPayload = {
        id: 77771,
        gateway: 'TEST_BANK',
        transactionDate: '2026-11-22 15:45:00',
        accountNumber: '0000000000',
        content: `BIGMAN ${orderCode}`,
        transferType: 'in',
        transferAmount: 499000, // Needs 799,000 VND
        accumulated: 5000000,
      };

      const result = await handler.handleWebhook(underpaidPayload, `Apikey ${secretApiKey}`);
      expect(result.statusCode).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Underpaid');

      const order = handler.getOrder(orderCode)!;
      expect(order.status).toBe('underpaid');
      expect(order.creditAdded).toBe(0);
      expect(order.subscriptionDaysAdded).toBe(0);
    });

    it('Rejects payment with unrecognized order code (404)', async () => {
      const unknownPayload: SePayWebhookPayload = {
        id: 77772,
        gateway: 'TEST_BANK',
        transactionDate: '2026-11-22 15:46:00',
        accountNumber: '0000000000',
        content: 'BIGMAN UNKNOWN_ORDER_99999',
        transferType: 'in',
        transferAmount: 799000,
        accumulated: 5000000,
      };

      const result = await handler.handleWebhook(unknownPayload, `Apikey ${secretApiKey}`);
      expect(result.statusCode).toBe(404);
      expect(result.success).toBe(false);
    });

    it('Cleanly ignores outgoing bank transfers (transferType: out)', async () => {
      const outPayload: SePayWebhookPayload = {
        id: 77773,
        gateway: 'TEST_BANK',
        transactionDate: '2026-11-22 15:47:00',
        accountNumber: '0000000000',
        content: 'Chuyen tien thanh toan tien nha',
        transferType: 'out',
        transferAmount: 5000000,
        accumulated: 10000000,
      };

      const result = await handler.handleWebhook(outPayload, `Apikey ${secretApiKey}`);
      expect(result.statusCode).toBe(200);
      expect(result.message).toContain('Not an incoming payment');
    });
  });
});
