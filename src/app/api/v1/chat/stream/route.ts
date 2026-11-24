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

function buildRoleAwareBuiltInReply(
  bot: BotPersonaContext | undefined,
  lastUserMessage: string
): string {
  const botName = bot?.name || 'Minh';
  const botRole = bot?.roleTitle || 'Quản lý & Điều phối tổng';
  const lower = lastUserMessage.toLowerCase();

  if (
    botName.toLowerCase() === 'lan' ||
    botName.toLowerCase().includes('sunny') ||
    lower.includes('tiktok') ||
    lower.includes('shop') ||
    lower.includes('lãi') ||
    lower.includes('giá bán') ||
    lower.includes('flash sale')
  ) {
    return `Tôi là **${botName}** (${botRole}). Phân tích thực chiến cho yêu cầu *"${lastUserMessage}"*:

1. **Kiểm soát Biên Lợi Nhuận (Chống lỗ ngầm):** Kiểm tra kỹ cộng dồn *Chiết khấu Flash Sale + Voucher Shop + Phí sàn & thanh toán + Hoa hồng KOC* trước khi bấm lưu khuyến mãi để giữ lãi ròng an toàn tối thiểu 20%–30%.
2. **Chuẩn hóa Listing & Shop Tab:** Dùng tiêu đề 60–120 ký tự theo công thức \`[Loại sản phẩm] + [Thương hiệu] + [USP nổi bật] + [Đối tượng] + [Quy cách]\`, tránh hoàn toàn từ cấm cam kết tuyệt đối.
3. **Tăng chuyển đổi (CR):** Đủ 7–9 ảnh giải tỏa nỗi sợ mua hàng + Voucher khách mới + kiểm soát tỷ lệ giao trễ (LDR) < 4%.

👉 Mở mục **Xưởng Việc Thật** ở cột bên trái để tôi tính bảng lãi/lỗ chi tiết và **xuất file Excel (.csv)** ngay lập tức.`;
  }

  if (
    botName.toLowerCase() === 'nam' ||
    botName.toLowerCase().includes('listing') ||
    lower.includes('seo') ||
    lower.includes('từ khóa') ||
    lower.includes('từ cấm')
  ) {
    return `Tôi là **${botName}** (${botRole}). Phương án tối ưu cho yêu cầu *"${lastUserMessage}"*:

- **Phân tầng từ khóa:** Tách rõ nhóm Nhận diện (Informational), Cân nhắc (Navigational) và Chốt đơn (Commercial Intent).
- **35 ký tự đầu tiên:** Đặt từ khóa chính có lượng tìm kiếm cao nhất lên đầu tiêu đề để tối ưu hiển thị trên di động.
- **Bộ lọc an toàn chính sách:** Loại bỏ toàn bộ từ cam kết tuyệt đối (*100%, tốt nhất, trị dứt điểm, cam kết khỏi hẳn*) và tuyệt đối không kéo giao dịch ngoài sàn.

👉 Mở **Xưởng Việc Thật → Nam (Quét Từ Cấm & Chấm SEO)** để chấm điểm 0–100, viết lại bản sạch và **tải báo cáo Word (.doc)** ngay.`;
  }

  if (
    botName.toLowerCase() === 'trang' ||
    botName.toLowerCase() === 'hùng' ||
    lower.includes('koc') ||
    lower.includes('video') ||
    lower.includes('kịch bản') ||
    lower.includes('affiliate')
  ) {
    return `Tôi là **${botName}** (${botRole}). Đề xuất triển khai cho yêu cầu *"${lastUserMessage}"*:

- **3 giây đầu (Hook):** Mở thẳng bằng nỗi đau thực tế hoặc con số cụ thể để giữ chân người xem lướt nguồn cấp.
- **Thân bài 25–35 giây:** Chứng minh trực quan chất liệu/trải nghiệm thật, không dùng từ ngữ thổi phồng vi phạm chính sách.
- **Mời KOC Affiliate:** Gửi lời mời Cộng tác mục tiêu với mức hoa hồng nhỉnh hơn Cộng tác mở 3%–5% kèm mẫu thử cho nhóm KOC đúng ngách.

👉 Mở **Xưởng Việc Thật → Trang & Hùng** để xuất ngay 3 Hook, phân cảnh 45s và 2 mẫu tin mời KOC dạng **file Word (.doc)**.`;
  }

  if (
    botName.toLowerCase() === 'phong' ||
    botName.toLowerCase() === 'vy' ||
    lower.includes('giáo án') ||
    lower.includes('lớp') ||
    lower.includes('phụ huynh') ||
    lower.includes('gvcn') ||
    lower.includes('tt27')
  ) {
    return `Tôi là **${botName}** (${botRole}). Kế hoạch hỗ trợ cho yêu cầu *"${lastUserMessage}"*:

- **Quản lý lớp & phụ huynh:** Chuẩn hóa thông báo tuần ngắn gọn, tích cực, phân rõ lịch học – lưu ý rèn nề nếp – lời khen khích lệ học sinh.
- **Đánh giá chuẩn Thông tư 27:** Phân nhóm nhận xét T/H/C sát thực tế, tránh lặp mẫu khô cứng.

👉 Mở **Xưởng Việc Thật → Phong & Vy (Giáo dục / GVCN)** để tạo kế hoạch chủ nhiệm tuần, 3 mẫu Zalo phụ huynh và **tải file Word (.doc)** dùng ngay.`;
  }

  return `Tôi là **${botName}** (${botRole}) thuộc **${BRANDING.appName}**. Tôi đã tiếp nhận yêu cầu: *"${lastUserMessage}"*.

**Kế hoạch triển khai đề xuất:**
- **Bước 1:** Rà soát mục tiêu định lượng, nguồn lực và dữ liệu đầu vào cốt lõi.
- **Bước 2:** Phân rã đầu việc cụ thể và bàn giao chéo cho các phòng ban liên quan ngay trong Văn Phòng 3D.
- **Bước 3:** Theo dõi tiến độ, kiểm duyệt chất lượng (QA) và xuất file kết quả vào **Tệp của nhóm**.

👉 Bạn có thể mở **Xưởng Việc Thật** ở cột bên trái để tạo ngay file Excel/Word hoàn chỉnh theo đúng nhu cầu.`;
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
            mode: resolvedProvider ? 'live_ai' : 'builtin',
            provider: resolvedProvider?.provider || 'builtin',
            model: resolvedProvider?.model || 'tochuc-ai-builtin',
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
                text: 'Hệ thống đã tiếp nhận yêu cầu nhưng chưa nhận được phản hồi đầy đủ. Vui lòng thử gửi lại câu hỏi ngắn gọn hơn.',
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
            const responseText = buildRoleAwareBuiltInReply(botProfile, lastUserMessage);

            const chunks = responseText.split(' ');
            for (const word of chunks) {
              sendEvent({ type: 'token', text: `${word} ` });
              await new Promise((resolve) => setTimeout(resolve, 14));
            }

            sendEvent({
              type: 'done',
              metadata: {
                mode: 'builtin',
                provider: 'builtin',
                model: 'tochuc-ai-builtin',
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
