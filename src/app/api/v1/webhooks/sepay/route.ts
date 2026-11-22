import { NextRequest, NextResponse } from 'next/server';
import {
  verifySePayWebhookKey,
  processSePayWebhookPayment,
  SePayWebhookPayload,
} from '@/lib/server/vietqr-sepay';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');

    // 1. Xác thực bảo mật Webhook
    const isValidKey = verifySePayWebhookKey(authHeader);
    if (!isValidKey) {
      return NextResponse.json(
        { error: 'Truy cập bị từ chối: SePay Webhook API Key không hợp lệ.' },
        { status: 401 }
      );
    }

    const payload: SePayWebhookPayload = await req.json();

    // 2. Xử lý thanh toán có cơ chế Idempotency & Tự động nâng cấp gói
    const result = await processSePayWebhookPayment(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          orderCode: result.orderCode,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      isIdempotent: result.isIdempotent || false,
      orderCode: result.orderCode,
      upgradedTier: result.upgradedTier,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi xử lý Webhook SePay';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
