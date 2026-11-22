import { describe, it, expect, afterEach } from 'vitest';
import {
  buildBotSystemPrompt,
  detectProviderFromKey,
  resolveProviderConfig,
  DEFAULT_MODELS,
} from '../src/lib/server/ai-provider';
import { BYOKVault } from '../src/lib/server/byok-vault';
import { processSePayWebhookPayment } from '../src/lib/server/vietqr-sepay';

describe('Phase 3 — Real AI BYOK Provider Routing & Payment Hardening', () => {
  const savedEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...savedEnv };
  });

  it('auto-detects AI provider from API key prefix accurately', () => {
    expect(detectProviderFromKey('AIzaSyFakeGeminiKey1234567890')).toBe('gemini');
    expect(detectProviderFromKey('sk-ant-api03-FakeAnthropicKey123456')).toBe('anthropic');
    expect(detectProviderFromKey('sk-or-v1-FakeOpenRouterKey123456')).toBe('openrouter');
    expect(detectProviderFromKey('sk-proj-FakeOpenAIKey1234567890')).toBe('openai');
  });

  it('prioritizes client BYOK key over server env and falls back cleanly to demo mode when unset', () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    // 1. No keys -> graceful Demo fallback (null)
    expect(resolveProviderConfig()).toBeNull();
    expect(resolveProviderConfig({ apiKey: 'short' })).toBeNull();

    // 2. Server env fallback
    process.env.GEMINI_API_KEY = 'AIzaSyServerFallbackKey1234567890';
    const envResolved = resolveProviderConfig();
    expect(envResolved?.provider).toBe('gemini');
    expect(envResolved?.source).toBe('server_env');
    expect(envResolved?.model).toBe(DEFAULT_MODELS.gemini);

    // 3. Client BYOK overrides server env
    const byokResolved = resolveProviderConfig({
      provider: 'auto',
      apiKey: 'sk-ant-api03-UserPrivateKey1234567890',
      model: 'claude-3-5-haiku-latest',
    });
    expect(byokResolved?.provider).toBe('anthropic');
    expect(byokResolved?.source).toBe('byok');
    expect(byokResolved?.model).toBe('claude-3-5-haiku-latest');
  });

  it('builds brand-compliant Vietnamese system prompts for custom bot personas', () => {
    const prompt = buildBotSystemPrompt({
      name: 'Sunny',
      roleTitle: 'Chuyên gia Vận hành TikTok Shop',
      department: 'Phòng Kinh Doanh & CSKH',
      systemPrompt: 'Tập trung tối ưu tỷ lệ chuyển đổi CR và biên lợi nhuận.',
    });
    expect(prompt).toContain('Sunny');
    expect(prompt).toContain('Tổ Chức Nhân Viên AI');
    expect(prompt).toContain('biên lợi nhuận');
  });

  it('sanitizes raw provider API keys from any error string (zero-leak guarantee)', () => {
    const raw =
      'Google Gemini HTTP 401 for key AIzaSyD83kLmNoPqRsTuVwXyZ1234567890 and Bearer sk-proj-supersecretkey9988776655443322';
    const sanitized = BYOKVault.sanitizeString(raw);
    expect(sanitized).not.toContain('AIzaSyD83kLmNoPqRsTuVwXyZ1234567890');
    expect(sanitized).not.toContain('sk-proj-supersecretkey9988776655443322');
    expect(sanitized).toContain('REDACTED');
  });

  it('ignores outgoing bank transfers (transferType: out) in SePay webhook processor', async () => {
    const res = await processSePayWebhookPayment({
      id: 999888,
      transferType: 'out',
      content: 'NVAI123456',
      transferAmount: 499000,
    });
    expect(res.success).toBe(true);
    expect(res.isIdempotent).toBe(true);
    expect(res.upgradedTier).toBeUndefined();
  });
});
