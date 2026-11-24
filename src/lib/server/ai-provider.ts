/**
 * ==============================================================================
 * REAL AI STREAMING PROVIDER ENGINE (MULTI-PROVIDER + CUSTOM ENDPOINT + SKILLS/MCP)
 * DỰ ÁN: TỔ CHỨC NHÂN VIÊN AI
 * LIÊN HỆ: Zalo 0353205414 | Email: thaytiensy@gmail.com
 * ==============================================================================
 * Hỗ trợ gọi AI thực thời gian thực (SSE Streaming) với nhiều nhà cung cấp:
 * - OpenAI (gpt-4o-mini, gpt-4o, ...)
 * - Google Gemini (gemini-2.5-flash, gemini-2.5-pro, ...)
 * - Anthropic Claude (claude-3-5-sonnet-latest, claude-3-5-haiku-latest, ...)
 * - OpenRouter (deepseek/deepseek-chat-v3-0324, anthropic/claude-3.7-sonnet, ...)
 * - Custom OpenAI-Compatible / Local Ollama (DeepSeek, Groq, Together, vLLM, Ollama...)
 *
 * Bảo mật:
 * - Không bao giờ ghi log API Key thô.
 * - Mọi thông báo lỗi đều đi qua BYOKVault.sanitizeString() trước khi trả về client.
 * - Chặn SSRF đối với các dải IP nội bộ/metadata khi dùng Custom Endpoint.
 */

import { BYOKVault } from './byok-vault';
import { BRANDING } from '@/config/branding';

export type AiProviderId =
  | 'auto'
  | 'openai'
  | 'gemini'
  | 'anthropic'
  | 'openrouter'
  | 'custom';
export type ResolvedAiProvider = Exclude<AiProviderId, 'auto'>;

export interface ChatTurn {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface BotSkillInstruction {
  name: string;
  instructions: string;
}

export interface BotPersonaContext {
  name?: string;
  roleTitle?: string;
  department?: string;
  systemPrompt?: string;
  activeMcps?: string[];
  activeSkills?: BotSkillInstruction[];
}

export interface ByokInput {
  provider?: AiProviderId;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface ResolvedProviderConfig {
  provider: ResolvedAiProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  source: 'byok' | 'server_env';
}

export const DEFAULT_MODELS: Record<ResolvedAiProvider, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.5-flash',
  anthropic: 'claude-3-5-sonnet-latest',
  openrouter: 'deepseek/deepseek-chat-v3-0324',
  custom: 'deepseek-chat',
};

/**
 * Kiểm tra an toàn SSRF cho Custom AI Endpoint:
 * - Cho phép HTTPS tới tên miền công khai.
 * - Cho phép HTTP chỉ với localhost / 127.0.0.1 (Ollama, LM Studio nội bộ).
 * - Chặn tuyệt đối các dải IP metadata/mạng nội bộ (169.254.x.x, 10.x, 192.168.x, 172.16-31.x, 0.0.0.0).
 */
export function isSafeCustomAiBaseUrl(rawUrl?: string): boolean {
  if (!rawUrl) return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  if (!host) return false;

  const isLoopback = host === 'localhost' || host === '127.0.0.1';
  if (parsed.protocol === 'http:') {
    return isLoopback;
  }
  if (parsed.protocol !== 'https:') {
    return false;
  }

  if (
    host === '0.0.0.0' ||
    host === 'metadata.google.internal' ||
    host.endsWith('.internal') ||
    host.startsWith('169.254.') ||
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    host.startsWith('fc') ||
    host.startsWith('fd') ||
    host.startsWith('fe80') ||
    host.includes(':')
  ) {
    return false;
  }

  const m172 = host.match(/^172\.(\d+)\./);
  if (m172) {
    const secondOctet = Number(m172[1]);
    if (secondOctet >= 16 && secondOctet <= 31) return false;
  }

  return true;
}

export function isLocalLoopbackUrl(rawUrl?: string): boolean {
  if (!rawUrl) return false;
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

export function buildOpenAiCompatibleChatUrl(baseUrl: string): string {
  const clean = baseUrl.trim().replace(/\/+$/, '');
  if (clean.endsWith('/chat/completions')) return clean;
  return `${clean}/chat/completions`;
}

/**
 * Tự động nhận diện nhà cung cấp AI từ tiền tố API Key
 */
export function detectProviderFromKey(apiKey: string): ResolvedAiProvider {
  const key = apiKey.trim();
  if (key.startsWith('AIza')) return 'gemini';
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('sk-or-')) return 'openrouter';
  return 'openai';
}

/**
 * Xác định cấu hình AI thực tế (ưu tiên cấu hình AI mở rộng từ người dùng, sau đó tới biến môi trường máy chủ).
 * Trả về null nếu dùng chế độ AI tích hợp sẵn của nền tảng.
 */
export function resolveProviderConfig(byok?: ByokInput): ResolvedProviderConfig | null {
  const userKey = byok?.apiKey?.trim() || '';
  const customBaseUrl = byok?.baseUrl?.trim();

  if (byok?.provider === 'custom' && customBaseUrl && isSafeCustomAiBaseUrl(customBaseUrl)) {
    const isLocal = isLocalLoopbackUrl(customBaseUrl);
    if (isLocal || userKey.length >= 8) {
      return {
        provider: 'custom',
        apiKey: userKey || 'ollama-local',
        model: byok.model?.trim() || DEFAULT_MODELS.custom,
        baseUrl: customBaseUrl,
        source: 'byok',
      };
    }
  }

  if (userKey.length >= 10) {
    const provider: ResolvedAiProvider =
      byok?.provider && byok.provider !== 'auto' && byok.provider !== 'custom'
        ? byok.provider
        : detectProviderFromKey(userKey);
    const model = byok?.model?.trim() || DEFAULT_MODELS[provider];
    return {
      provider,
      apiKey: userKey,
      model,
      source: 'byok',
    };
  }

  // Fallback sang biến môi trường máy chủ (nếu chủ hệ thống cấu hình trên Vercel)
  const envCandidates: Array<{ provider: ResolvedAiProvider; key?: string; model?: string }> = [
    {
      provider: 'gemini',
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_DEFAULT_MODEL,
    },
    {
      provider: 'openai',
      key: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_DEFAULT_MODEL,
    },
    {
      provider: 'anthropic',
      key: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_DEFAULT_MODEL,
    },
    {
      provider: 'openrouter',
      key: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_DEFAULT_MODEL,
    },
  ];

  for (const cand of envCandidates) {
    const k = cand.key?.trim();
    if (k && k.length >= 10) {
      return {
        provider: cand.provider,
        apiKey: k,
        model: cand.model?.trim() || DEFAULT_MODELS[cand.provider],
        source: 'server_env',
      };
    }
  }

  return null;
}

/**
 * Kiểm tra nhanh xem máy chủ có cấu hình sẵn ít nhất một AI Provider Key không (không lộ giá trị key)
 */
export function isPlatformAiConfigured(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim() ||
      process.env.ANTHROPIC_API_KEY?.trim() ||
      process.env.OPENROUTER_API_KEY?.trim()
  );
}

/**
 * Dựng System Prompt chuẩn thương hiệu Tổ Chức Nhân Viên AI cho từng Bot chuyên môn,
 * tự động tích hợp các MCP và Skills đang bật cho nhân viên AI đó.
 */
export function buildBotSystemPrompt(bot?: BotPersonaContext): string {
  const name = bot?.name?.trim() || 'Minh';
  const role = bot?.roleTitle?.trim() || 'Quản lý & Điều phối tổng';
  const dept = bot?.department?.trim() || 'Ban Điều Hành Tổng';
  const custom = bot?.systemPrompt?.trim();

  const base = [
    `Bạn là ${name} — ${role} thuộc phòng ${dept} của nền tảng ${BRANDING.appName}.`,
    'Trả lời bằng tiếng Việt rõ ràng, súc tích, thực chiến, định dạng Markdown dễ đọc với gạch đầu dòng và kế hoạch hành động cụ thể.',
    'Nếu nhiệm vụ cần phối hợp phòng ban khác, hãy nêu rõ bước bàn giao cho đồng nghiệp bot phù hợp.',
  ];

  if (custom) {
    base.push(`Chỉ dẫn chuyên môn bổ sung: ${custom}`);
  }

  const mcps = (bot?.activeMcps || [])
    .map((m) => String(m).trim())
    .filter(Boolean)
    .slice(0, 12);
  if (mcps.length > 0) {
    base.push(`Kết nối MCP đang bật cho vai trò của bạn: ${mcps.join(', ')}.`);
  }

  const skills = (bot?.activeSkills || [])
    .filter((s) => s && typeof s.name === 'string' && typeof s.instructions === 'string')
    .slice(0, 6);
  if (skills.length > 0) {
    base.push('Các kỹ năng chuyên môn (Skills) đang kích hoạt cần tuân thủ:');
    for (const sk of skills) {
      base.push(`- [${sk.name.slice(0, 80)}]: ${sk.instructions.slice(0, 480)}`);
    }
  }

  return base.join('\n');
}

/**
 * Đọc các dòng SSE `data: ...` từ ReadableStream của nhà cung cấp AI
 */
async function consumeSseLines(
  body: ReadableStream<Uint8Array>,
  onData: (dataStr: string) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        onData(payload);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Gọi AI thực theo chế độ streaming và phát từng token qua callback `onToken`.
 * Trả về số ký tự đã phát.
 */
export async function streamProviderResponse(params: {
  config: ResolvedProviderConfig;
  systemPrompt: string;
  messages: ChatTurn[];
  onToken: (text: string) => void;
  signal?: AbortSignal;
}): Promise<{ emittedChars: number }> {
  const { config, systemPrompt, messages, onToken, signal } = params;
  const cleanMessages = messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
    .slice(-16)
    .map((m) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: m.content.slice(0, 8000),
    }));

  const timeoutSignal = signal || AbortSignal.timeout(45_000);
  let emittedChars = 0;

  const emit = (chunk: string) => {
    if (!chunk) return;
    emittedChars += chunk.length;
    onToken(chunk);
  };

  if (
    config.provider === 'openai' ||
    config.provider === 'openrouter' ||
    config.provider === 'custom'
  ) {
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    if (config.provider === 'openrouter') {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    } else if (config.provider === 'custom') {
      if (!config.baseUrl || !isSafeCustomAiBaseUrl(config.baseUrl)) {
        throw new Error('Địa chỉ Endpoint AI tùy chỉnh không hợp lệ hoặc không được phép.');
      }
      endpoint = buildOpenAiCompatibleChatUrl(config.baseUrl);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey && config.apiKey !== 'ollama-local') {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }

    if (config.provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://bigman-ai-workspace.vercel.app';
      headers['X-Title'] = BRANDING.appName;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      signal: timeoutSignal,
      body: JSON.stringify({
        model: config.model,
        stream: true,
        temperature: 0.6,
        max_tokens: 1400,
        messages: [{ role: 'system', content: systemPrompt }, ...cleanMessages],
      }),
    });

    if (!res.ok || !res.body) {
      const rawErr = await res.text().catch(() => '');
      throw new Error(
        BYOKVault.sanitizeString(
          `Nhà cung cấp ${config.provider.toUpperCase()} trả lỗi HTTP ${res.status}: ${rawErr.slice(0, 220)}`
        )
      );
    }

    await consumeSseLines(res.body, (dataStr) => {
      try {
        const parsed = JSON.parse(dataStr);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string') emit(delta);
      } catch {
        // Bỏ qua chunk không phải JSON hợp lệ
      }
    });

    return { emittedChars };
  }

  if (config.provider === 'gemini') {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      config.model
    )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(config.apiKey)}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: timeoutSignal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: cleanMessages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1400,
        },
      }),
    });

    if (!res.ok || !res.body) {
      const rawErr = await res.text().catch(() => '');
      throw new Error(
        BYOKVault.sanitizeString(
          `Google Gemini trả lỗi HTTP ${res.status}: ${rawErr.slice(0, 220)}`
        )
      );
    }

    await consumeSseLines(res.body, (dataStr) => {
      try {
        const parsed = JSON.parse(dataStr);
        const parts = parsed?.candidates?.[0]?.content?.parts;
        if (Array.isArray(parts)) {
          for (const p of parts) {
            if (typeof p?.text === 'string') emit(p.text);
          }
        }
      } catch {
        // Bỏ qua chunk lỗi
      }
    });

    return { emittedChars };
  }

  // Anthropic Claude Messages API (Streaming)
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    signal: timeoutSignal,
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1400,
      stream: true,
      system: systemPrompt,
      messages: cleanMessages,
    }),
  });

  if (!res.ok || !res.body) {
    const rawErr = await res.text().catch(() => '');
    throw new Error(
      BYOKVault.sanitizeString(
        `Anthropic Claude trả lỗi HTTP ${res.status}: ${rawErr.slice(0, 220)}`
      )
    );
  }

  await consumeSseLines(res.body, (dataStr) => {
    try {
      const parsed = JSON.parse(dataStr);
      if (parsed?.type === 'content_block_delta' && typeof parsed?.delta?.text === 'string') {
        emit(parsed.delta.text);
      }
    } catch {
      // Bỏ qua chunk lỗi
    }
  });

  return { emittedChars };
}
