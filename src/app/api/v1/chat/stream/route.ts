import { NextRequest } from 'next/server';
import { assertLoopSafetyGuard } from '@/lib/server/quota-guard';
import {
  buildBotSystemPrompt,
  resolveProviderConfig,
  streamProviderResponse,
  type BotPersonaContext,
  type ByokInput,
  type ChatTurn,
} from '@/lib/server/ai-provider';
import { BYOKVault } from '@/lib/server/byok-vault';
import { BRANDING } from '@/config/branding';

export const runtime = 'nodejs';

function buildRoleAwareDemoReply(bot: BotPersonaContext | undefined, lastUserMessage: string): string {
  const botName = bot?.name || 'Minh';
  const botRole = bot?.roleTitle || 'Quản lý & Điều phối tổng';
  const lower = lastUserMessage.toLowerCase();

  if (
    botName.toLowerCase() === 'lan' ||
    botName.toLowerCase().includes('sunny') ||
    lower.includes('tiktok') ||
    lower.includes('shop')
  ) {
    return `Tôi là **${botName}** (${botRole}). Phân tích nhanh cho yêu cầu "${lastUserMessage}":

1. **Chuẩn hóa Listing & Shop Tab:** Tối ưu tiêu đề 60–120 ký tự theo công thức \`[Loại sản phẩm] + [Thương hiệu] + [USP nổi bật] + [Đối tượng] + [Quy cách]\`, tránh tuyệt đối từ cấm cam kết tuyệt đối.
2. **Bảo vệ Biên Lợi Nhuận (Unit Economics):** Kiểm soát cộng dồn *Phí sàn + Voucher Shop + Hoa hồng KOC* để giữ biên lợi nhuận ròng tối thiểu 25%–35%.
3. **Tăng chuyển đổi (CR):** Bổ sung đủ 7–9 ảnh giải tỏa nỗi sợ mua hàng + Voucher Khách Hàng Mới + kiểm soát tỷ lệ giao trễ (LDR) < 4%.

> 💡 *Đang chạy ở **Chế độ Demo**. Bấm nút **"Cài đặt API Key (BYOK)"** ở góc trên để cắm OpenAI / Gemini / Claude / OpenRouter và trò chuyện trực tiếp với AI thực!*`;
  }

  if (
    botName.toLowerCase() === 'nam' ||
    botName.toLowerCase().includes('listing') ||
    lower.includes('seo')
  ) {
    return `Tôi là **${botName}** (${botRole}). Đề xuất tối ưu cho yêu cầu "${lastUserMessage}":

- **Phân tầng từ khóa:** Tách rõ bộ từ khóa Nhận diện (Informational), Cân nhắc (Navigational) và Chốt đơn (Commercial Intent).
- **35 ký tự đầu tiên:** Đưa từ khóa chính có lượng tìm kiếm cao nhất lên đầu tiêu đề để tối ưu hiển thị trên di động.
- **Internal Link & Entity:** Kết nối chặt giữa bài trụ cột (Pillar) và trang sản phẩm/dịch vụ để đẩy thứ hạng bền vững.

> 💡 *Đang chạy ở **Chế độ Demo**. Bấm nút **"Cài đặt API Key (BYOK)"** ở góc trên để kích hoạt AI thực theo thời gian thực!*`;
  }

  return `Tôi là **${botName}** (${botRole}) thuộc **${BRANDING.appName}**. Tôi đã tiếp nhận yêu cầu: *"${lastUserMessage}"*.

**Kế hoạch triển khai đề xuất:**
- **Bước 1:** Rà soát mục tiêu định lượng và dữ liệu đầu vào cốt lõi.
- **Bước 2:** Phân rã đầu việc cụ thể và bàn giao chéo cho các phòng ban liên quan trong Văn Phòng 3D.
- **Bước 3:** Theo dõi kết quả và tổng hợp báo cáo tự động vào cuối ngày.

> 💡 *Đang chạy ở **Chế độ Demo**. Bấm nút **"Cài đặt API Key (BYOK)"** ở góc trên để cắm khóa OpenAI / Gemini / Claude / OpenRouter và chạy AI thực ngay lập tức!*`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspaceId,
      botId,
      threadId,
      messages,
      iterationCount = 1,
      byok,
      botProfile,
    } = body as {
      workspaceId?: string;
      botId?: string;
      threadId?: string;
      messages?: ChatTurn[];
      iterationCount?: number;
      byok?: ByokInput;
      botProfile?: BotPersonaContext;
    };

    if (!workspaceId || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'workspaceId và messages (mảng) là bắt buộc.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // CHỐT CHẶN AN TOÀN: Kiểm tra số vòng lặp tối đa 15 vòng/tác vụ
    assertLoopSafetyGuard(Number(iterationCount));

    const resolvedProvider = resolveProviderConfig(byok);
    const systemPrompt = buildBotSystemPrompt(botProfile);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (payload: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        };

        try {
          sendEvent({
            type: 'start',
            threadId: threadId || `thread-${Date.now()}`,
            botId: botId || 'default-bot',
            mode: resolvedProvider ? 'live_ai' : 'demo',
            provider: resolvedProvider?.provider || 'demo',
            model: resolvedProvider?.model || 'demo-local',
          });

          if (resolvedProvider) {
            const { emittedChars } = await streamProviderResponse({
              config: resolvedProvider,
              systemPrompt,
              messages,
              onToken: (text) => {
                sendEvent({ type: 'token', text });
              },
            });

            if (emittedChars === 0) {
              sendEvent({
                type: 'token',
                text: 'AI đã kết nối thành công nhưng chưa trả về nội dung. Vui lòng thử gửi lại câu hỏi ngắn gọn hơn.',
              });
            }

            sendEvent({
              type: 'done',
              metadata: {
                mode: 'live_ai',
                provider: resolvedProvider.provider,
                model: resolvedProvider.model,
                source: resolvedProvider.source,
                tokensEstimated: Math.max(1, Math.ceil(emittedChars / 3.5)),
                supportZalo: BRANDING.contact.zalo,
              },
            });
          } else {
            const lastUserMessage =
              messages[messages.length - 1]?.content?.trim() || 'Xin chào';
            const responseText = buildRoleAwareDemoReply(botProfile, lastUserMessage);

            const chunks = responseText.split(' ');
            for (const word of chunks) {
              sendEvent({ type: 'token', text: `${word} ` });
              await new Promise((resolve) => setTimeout(resolve, 18));
            }

            sendEvent({
              type: 'done',
              metadata: {
                mode: 'demo',
                provider: 'demo',
                model: 'demo-local',
                tokensEstimated: chunks.length * 2,
                supportZalo: BRANDING.contact.zalo,
              },
            });
          }

          controller.close();
        } catch (streamErr: unknown) {
          const rawMsg =
            streamErr instanceof Error ? streamErr.message : 'Lỗi trong quá trình streaming';
          const safeMsg = BYOKVault.sanitizeString(rawMsg);
          sendEvent({
            type: 'error',
            error: safeMsg,
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return new Response(JSON.stringify({ error: BYOKVault.sanitizeString(rawMsg) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
