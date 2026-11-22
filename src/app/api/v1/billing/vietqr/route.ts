import { NextRequest, NextResponse } from 'next/server';
import { createVietQROrder } from '@/lib/server/vietqr-sepay';
import type { PlanTier } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, planId, billingCycle } = body;

    if (!workspaceId || !planId) {
      return NextResponse.json(
        { error: 'workspaceId và planId là bắt buộc.' },
        { status: 400 }
      );
    }

    const order = await createVietQROrder({
      workspaceId,
      planId: planId as PlanTier,
      billingCycle: billingCycle || 'monthly',
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi khởi tạo đơn hàng VietQR';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
