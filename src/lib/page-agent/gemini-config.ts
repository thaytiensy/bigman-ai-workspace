export const GEMINI_OPENAI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/openai/';

export type GeminiModelId = 'gemini-2.0-flash' | 'gemini-1.5-flash';

export interface GeminiModelOption {
  id: GeminiModelId;
  label: string;
  description: string;
}

export const GEMINI_MODEL_OPTIONS: GeminiModelOption[] = [
  {
    id: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    description: 'Khuyên dùng · Phản hồi nhanh và thao tác chính xác',
  },
  {
    id: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    description: 'Ổn định · Phù hợp tác vụ nhẹ và tiết kiệm hạn mức',
  },
];

export interface AffiliatePlanCoupon {
  id: 'starter' | 'standard' | 'plus';
  name: string;
  englishName: string;
  code: string;
  highlight: string;
}

export const GOOGLE_WORKSPACE_AFFILIATE = {
  url: 'https://sharegoogleworkspace.advocate.impact.com/mzZOnzJ',
  title: 'Ưu đãi Google Workspace & Gemini AI',
  subtitle: 'Giảm ngay 10% chi phí năm đầu tiên qua liên kết đối tác chính thức',
  plans: [
    {
      id: 'starter',
      name: 'Gói Khởi nghiệp',
      englishName: 'Business Starter',
      code: 'JA7YJEWHXXGKRNR',
      highlight: 'Giảm 10% năm đầu',
    },
    {
      id: 'standard',
      name: 'Gói Tiêu chuẩn',
      englishName: 'Business Standard',
      code: 'H9EAXXKKTKHGA3C',
      highlight: 'Giảm 10% năm đầu',
    },
    {
      id: 'plus',
      name: 'Gói Nâng cao',
      englishName: 'Business Plus',
      code: 'H3CNTKW6D3KL74X',
      highlight: 'Giảm 10% năm đầu',
    },
  ] as AffiliatePlanCoupon[],
};

export interface GeminiAuthConfig {
  apiKey: string;
  model: GeminiModelId;
  endpoint: string;
  verifiedAt?: string;
}

const STORAGE_KEY = 'bigman_page_agent_gemini_auth_v1';

export function normalizeOpenAiEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();
  if (!trimmed) {
    return 'https://generativelanguage.googleapis.com/v1beta/openai';
  }
  return trimmed.replace(/\/+$/, '');
}

export function transformGeminiRequestBody(
  requestBody: Record<string, unknown>,
): Record<string, unknown> {
  const nextBody: Record<string, unknown> = { ...requestBody };
  const model = typeof nextBody.model === 'string' ? nextBody.model.toLowerCase() : '';
  if (model.startsWith('gemini-1.5') || model.startsWith('gemini-2.0')) {
    delete nextBody.reasoning_effort;
  }
  return nextBody;
}

export function loadGeminiAuthConfig(): GeminiAuthConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GeminiAuthConfig>;
    if (!parsed || typeof parsed.apiKey !== 'string' || !parsed.apiKey.trim()) {
      return null;
    }
    const model: GeminiModelId =
      parsed.model === 'gemini-1.5-flash' ? 'gemini-1.5-flash' : 'gemini-2.0-flash';
    return {
      apiKey: parsed.apiKey.trim(),
      model,
      endpoint: GEMINI_OPENAI_ENDPOINT,
      verifiedAt: typeof parsed.verifiedAt === 'string' ? parsed.verifiedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function saveGeminiAuthConfig(config: {
  apiKey: string;
  model: GeminiModelId;
  verifiedAt?: string;
}): GeminiAuthConfig {
  const normalized: GeminiAuthConfig = {
    apiKey: config.apiKey.trim(),
    model: config.model === 'gemini-1.5-flash' ? 'gemini-1.5-flash' : 'gemini-2.0-flash',
    endpoint: GEMINI_OPENAI_ENDPOINT,
    verifiedAt: config.verifiedAt,
  };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function clearGeminiAuthConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Bỏ qua lỗi bộ nhớ trình duyệt bị khóa
  }
}

export async function verifyGeminiApiKey(
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { ok: false, message: 'Vui lòng nhập khóa API Google Gemini trước khi kiểm tra.' };
  }

  try {
    const base = normalizeOpenAiEndpoint(GEMINI_OPENAI_ENDPOINT);
    const response = await fetchImpl(`${base}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cleanKey}`,
      },
    });

    if (response.ok) {
      return {
        ok: true,
        message: 'Xác thực Google Gemini thành công! Trợ lý AI đã sẵn sàng thao tác trang.',
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        message: 'Khóa API chưa hợp lệ hoặc chưa được cấp quyền Gemini. Vui lòng kiểm tra lại.',
      };
    }

    if (response.status === 429) {
      return {
        ok: false,
        message: 'Khóa API đang chạm giới hạn lượt gọi. Vui lòng thử lại sau ít phút.',
      };
    }

    return {
      ok: false,
      message: `Không thể xác thực kết nối (mã HTTP ${response.status}).`,
    };
  } catch {
    return {
      ok: false,
      message: 'Lỗi kết nối mạng tới máy chủ Google Gemini. Vui lòng kiểm tra Internet.',
    };
  }
}

export function buildPageAgentSystemInstructions(appName: string, appContext: string): string {
  return [
    `Bạn là Trợ lý AI thao tác trang web (Page Agent) tích hợp bên trong ứng dụng "${appName}".`,
    `Bối cảnh ứng dụng: ${appContext}`,
    'Quy tắc bắt buộc:',
    '1. Luôn suy luận, phản hồi, hỏi lại người dùng (nếu cần) và tóm tắt kết quả 100% bằng tiếng Việt tự nhiên, ngắn gọn, dễ hiểu.',
    '2. Chỉ thao tác trên các phần tử giao diện thực sự hiện diện trên trang web hiện tại theo đúng yêu cầu của người dùng.',
    '3. Không tự ý thực hiện hành động xóa dữ liệu vĩnh viễn nếu người dùng chưa yêu cầu rõ ràng; khi không chắc chắn hãy dùng công cụ hỏi người dùng bằng tiếng Việt.',
    '4. Sau khi hoàn thành thao tác, báo cáo ngắn gọn những bước đã làm.',
  ].join('\n');
}
