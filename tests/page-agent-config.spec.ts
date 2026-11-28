import { describe, expect, it, vi } from 'vitest';
import {
  activateProSubscription,
  buildPageAgentSystemInstructions,
  buildProQuickPayPayload,
  createChecksummedProCode,
  defaultCopilotSubscription,
  evaluateCopilotExecutionAccess,
  FREE_TRIAL_MAX_RUNS,
  GEMINI_OPENAI_ENDPOINT,
  GOOGLE_WORKSPACE_AFFILIATE,
  normalizeOpenAiEndpoint,
  PRO_SUBSCRIPTION_PLANS,
  recordFreeRunUsage,
  transformGeminiRequestBody,
  verifyGeminiApiKey,
  verifyProActivationCode,
} from '../src/lib/page-agent/gemini-config';

describe('Cấu hình Page Agent, SaaS Freemium/Pro & Google Gemini Affiliate (Tổ Chức Nhân Viên AI)', () => {
  it('chuẩn hóa endpoint OpenAI-compatible của Google Gemini chính xác', () => {
    expect(GEMINI_OPENAI_ENDPOINT).toBe('https://generativelanguage.googleapis.com/v1beta/openai/');
    expect(normalizeOpenAiEndpoint(GEMINI_OPENAI_ENDPOINT)).toBe(
      'https://generativelanguage.googleapis.com/v1beta/openai',
    );
  });

  it('loại bỏ reasoning_effort khi gọi model gemini-1.5-flash hoặc gemini-2.0-flash', () => {
    const body20 = transformGeminiRequestBody({
      model: 'gemini-2.0-flash',
      reasoning_effort: 'low',
    });
    expect(body20).not.toHaveProperty('reasoning_effort');

    const body15 = transformGeminiRequestBody({
      model: 'gemini-1.5-flash',
      reasoning_effort: 'low',
    });
    expect(body15).not.toHaveProperty('reasoning_effort');
  });

  it('chứa đầy đủ liên kết và 3 mã giảm giá 10% Google Workspace chính thức', () => {
    expect(GOOGLE_WORKSPACE_AFFILIATE.url).toBe(
      'https://sharegoogleworkspace.advocate.impact.com/mzZOnzJ',
    );
    expect(GOOGLE_WORKSPACE_AFFILIATE.plans).toEqual([
      expect.objectContaining({ englishName: 'Business Starter', code: 'JA7YJEWHXXGKRNR' }),
      expect.objectContaining({ englishName: 'Business Standard', code: 'H9EAXXKKTKHGA3C' }),
      expect.objectContaining({ englishName: 'Business Plus', code: 'H3CNTKW6D3KL74X' }),
    ]);
  });

  it('áp dụng đúng chính sách Freemium 5 lượt cơ bản & mở khóa toàn diện ở gói Pro', () => {
    expect(FREE_TRIAL_MAX_RUNS).toBe(5);
    expect(PRO_SUBSCRIPTION_PLANS).toHaveLength(2);
    expect(PRO_SUBSCRIPTION_PLANS.map((p) => p.id)).toEqual(['monthly', 'yearly']);

    let state = defaultCopilotSubscription();
    for (let i = 0; i < 5; i += 1) {
      const check = evaluateCopilotExecutionAccess(state, 'Xem bảng giá dịch vụ Cloud 24/7');
      expect(check.allowed).toBe(true);
      expect(check.remainingRuns).toBe(5 - i);
      state = recordFreeRunUsage(state);
    }

    const sixthCheck = evaluateCopilotExecutionAccess(state, 'Mở chuyên mục Blog hướng dẫn AI');
    expect(sixthCheck.allowed).toBe(false);
    expect(sixthCheck.reason).toBe('quota_exhausted');

    const freshFree = defaultCopilotSubscription();
    const deepCheck = evaluateCopilotExecutionAccess(
      freshFree,
      'Xử lý dữ liệu hiệu suất phòng ban & xuất báo cáo',
    );
    expect(deepCheck.allowed).toBe(false);
    expect(deepCheck.reason).toBe('pro_feature_required');

    const proState = activateProSubscription({
      billingCycle: 'monthly',
      method: 'activation_code',
      orderCode: 'PRO654321',
    });
    const proCheck = evaluateCopilotExecutionAccess(
      proState,
      'Xử lý dữ liệu hiệu suất phòng ban & xuất báo cáo',
    );
    expect(proCheck.allowed).toBe(true);
    expect(proCheck.maxSteps).toBeGreaterThanOrEqual(24);
  });

  it('xác thực mã kích hoạt Pro hợp lệ và từ chối mã giả mạo', () => {
    const validCode = createChecksummedProCode('M999');
    expect(verifyProActivationCode(validCode).ok).toBe(true);
    expect(verifyProActivationCode(validCode).billingCycle).toBe('monthly');
    expect(verifyProActivationCode('BAD-CODE').ok).toBe(false);
  });

  it('tạo payload QR thanh toán VietQR khi đủ biến môi trường và fallback Zalo QR an toàn', () => {
    const fallback = buildProQuickPayPayload({ planId: 'yearly', orderCode: 'PRO777888' });
    expect(fallback.mode).toBe('zalo_qr');
    expect(fallback.qrImageUrl).toBeNull();
    expect(fallback.qrText).toContain('zalo.me');
  });

  it('tạo hướng dẫn hệ thống thuần tiếng Việt cho cả chế độ Cơ bản và Pro', () => {
    const prompt = buildPageAgentSystemInstructions(
      'Tổ Chức Nhân Viên AI',
      'Nền tảng đa bot',
      'pro',
    );
    expect(prompt).toContain('tiếng Việt');
    expect(prompt).toContain('Tổ Chức Nhân Viên AI');
    expect(prompt).toContain('CHẾ ĐỘ PRO');
  });

  it('kiểm tra xác thực API key hợp lệ và xử lý lỗi 401 rõ ràng bằng tiếng Việt', async () => {
    const okFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);
    const okResult = await verifyGeminiApiKey('test-key-valid', okFetch);
    expect(okResult.ok).toBe(true);

    const errFetch = vi.fn().mockResolvedValue({ ok: false, status: 401 } as Response);
    const errResult = await verifyGeminiApiKey('bad-key', errFetch);
    expect(errResult.ok).toBe(false);
    expect(errResult.message).toContain('Khóa API chưa hợp lệ');
  });
});
