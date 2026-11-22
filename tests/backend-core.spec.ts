import { describe, it, expect, afterEach } from "vitest";
import { encryptApiKey, decryptApiKey, maskApiKey } from "../src/lib/server/byok-crypto";
import { assertLoopSafetyGuard } from "../src/lib/server/quota-guard";
import {
  generateOrderCode,
  verifySePayWebhookKey,
  createVietQROrder,
  getVietQRConfig,
} from "../src/lib/server/vietqr-sepay";

describe("Backend Core (BYOK Crypto, Loop Guard, Env-only VietQR & SePay)", () => {
  const savedEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...savedEnv };
  });

  it("encrypts and decrypts BYOK API keys with AES-256-GCM and masks safely", () => {
    const testApiKey = "sk-proj-vietnam-ai-workspace-1234567890abcdef-secret";
    const encrypted = encryptApiKey(testApiKey);
    expect(encrypted.ciphertext.length).toBeGreaterThan(0);
    expect(decryptApiKey(encrypted)).toBe(testApiKey);
    expect(maskApiKey(testApiKey)).toBe("sk-proj...cret");
  });

  it("enforces Loop Safety Guard max 15 iterations", () => {
    expect(() => assertLoopSafetyGuard(10)).not.toThrow();
    expect(() => assertLoopSafetyGuard(15)).not.toThrow();
    expect(() => assertLoopSafetyGuard(16)).toThrow();
  });

  it("generates valid NVAI order codes", () => {
    const code = generateOrderCode();
    expect(code).toMatch(/^NVAI\d{6}$/);
  });

  it("never hardcodes bank info when NEXT_PUBLIC_VIETQR_* env vars are unset", async () => {
    delete process.env.NEXT_PUBLIC_VIETQR_BANK_BIN;
    delete process.env.NEXT_PUBLIC_VIETQR_BANK_NAME;
    delete process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO;
    delete process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME;

    const cfg = getVietQRConfig();
    expect(cfg.configured).toBe(false);

    const order = await createVietQROrder({
      workspaceId: "00000000-0000-0000-0000-000000000001",
      planId: "pro_team_byok",
      billingCycle: "monthly",
    });

    expect(order.vietqrConfigured).toBe(false);
    expect(order.qrImageUrl).toBeNull();
    expect(order.bankInfo).toBeNull();
    expect(order.contactSupport.zalo).toBe("0353205414");
    expect(order.contactSupport.email).toBe("thaytiensy@gmail.com");
  });

  it("generates VietQR URL strictly from env vars when configured", async () => {
    process.env.NEXT_PUBLIC_VIETQR_BANK_BIN = "970400";
    process.env.NEXT_PUBLIC_VIETQR_BANK_NAME = "TESTBANK";
    process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO = "123456789";
    process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME = "DEMO ACCOUNT";

    const order = await createVietQROrder({
      workspaceId: "00000000-0000-0000-0000-000000000001",
      planId: "starter_byok",
      billingCycle: "monthly",
    });

    expect(order.vietqrConfigured).toBe(true);
    expect(order.qrImageUrl).toContain("https://img.vietqr.io/image/970400-123456789");
    expect(order.bankInfo?.bankName).toBe("TESTBANK");
    expect(order.bankInfo?.accountNo).toBe("123456789");
  });

  it("fails closed on SePay webhook verification when SEPAY_WEBHOOK_SECRET is unset", () => {
    delete process.env.SEPAY_WEBHOOK_SECRET;
    expect(verifySePayWebhookKey("Apikey anything")).toBe(false);

    process.env.SEPAY_WEBHOOK_SECRET = "super_secret_sepay_2026";
    expect(verifySePayWebhookKey("Apikey wrong_key")).toBe(false);
    expect(verifySePayWebhookKey("Apikey super_secret_sepay_2026")).toBe(true);
  });
});
