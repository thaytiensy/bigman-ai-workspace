import { NextRequest } from 'next/server';
import { assertLoopSafetyGuard } from '@/lib/server/quota-guard';
import { BRANDING } from '@/config/branding';

export const runtime = 'nodejs'; // Hoặc 'edge' tùy cấu hình Vercel

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspaceId,
      botId,
      threadId,
      messages,
      iterationCount = 1,
    } = body;

    if (!workspaceId || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'workspaceId và messages (mảng) là bắt buộc.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // CHỐT CHẶN AN TOÀN: Kiểm tra số vòng lặp tối đa 15 vòng/tác vụ
    assertLoopSafetyGuard(Number(iterationCount));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Bắt đầu phiên truyền tải SSE
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'start',
                threadId: threadId || `thread-${Date.now()}`,
                botId: botId || 'default-bot',
              })}\n\n`
            )
          );

          // Nội dung phản hồi mẫu kiến trúc từ Tổ Chức Nhân Viên AI
          const lastUserMessage = messages[messages.length - 1]?.content || 'Xin chào';
          const responseText = `[${BRANDING.appName}] Xin chào! Tôi đã nhận được yêu cầu: "${lastUserMessage}". Hệ thống Backend Đợt 2 đang hoạt động ổn định với đầy đủ cơ chế bảo vệ QuotaGuard, mã hóa BYOK AES-256-GCM và thanh toán VietQR tự động.`;

          // Mô phỏng chia nhỏ stream theo từ (token-by-token stream)
          const words = responseText.split(' ');
          for (const word of words) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'token',
                  text: `${word} `,
                })}\n\n`
              )
            );
            // Khoảng nghỉ nhỏ tạo hiệu ứng gõ phím mượt mà
            await new Promise((resolve) => setTimeout(resolve, 25));
          }

          // Kết thúc phiên truyền dữ liệu
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                metadata: {
                  tokensEstimated: words.length * 2,
                  supportZalo: BRANDING.contact.zalo,
                },
              })}\n\n`
            )
          );

          controller.close();
        } catch (streamErr: unknown) {
          const errMsg = streamErr instanceof Error ? streamErr.message : 'Lỗi trong quá trình streaming';
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: errMsg,
              })}\n\n`
            )
          );
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
    const errorMsg = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
