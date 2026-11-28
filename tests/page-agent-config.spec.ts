import { describe, expect, it, vi } from 'vitest';
import {
  buildPageAgentSystemInstructions,
  GEMINI_OPENAI_ENDPOINT,
  GOOGLE_WORKSPACE_AFFILIATE,
  normalizeOpenAiEndpoint,
  transformGeminiRequestBody,
  verifyGeminiApiKey,
} from '../src/lib/page-agent/gemini-config';

describe('Cấu hình Page Agent & Google Gemini Affiliate (Tổ Chức Nhân Viên AI)', () => {
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

  it('tạo hướng dẫn hệ thống thuần tiếng Việt cho ứng dụng', () => {
    const prompt = buildPageAgentSystemInstructions(
      'Tổ Chức Nhân Viên AI',
      'Nền tảng đa bot',
    );
    expect(prompt).toContain('tiếng Việt');
    expect(prompt).toContain('Tổ Chức Nhân Viên AI');
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
