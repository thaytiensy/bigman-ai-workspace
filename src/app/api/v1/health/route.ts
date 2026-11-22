import { NextResponse } from 'next/server';
import { BRANDING } from '@/config/branding';
import { getSupabaseAdmin } from '@/lib/server/db';
import { getVietQRConfig } from '@/lib/server/vietqr-sepay';
import { isPlatformAiConfigured } from '@/lib/server/ai-provider';

export const runtime = 'nodejs';

/**
 * Endpoint kiểm tra trạng thái sẵn sàng hạ tầng sản xuất (KHÔNG tiết lộ bất kỳ bí mật nào).
 */
export async function GET() {
  const supabaseConfigured = Boolean(getSupabaseAdmin());
  const vietqrConfigured = getVietQRConfig().configured;
  const sepayWebhookConfigured = Boolean((process.env.SEPAY_WEBHOOK_SECRET || '').trim());
  const platformAiConfigured = isPlatformAiConfigured();

  return NextResponse.json(
    {
      ok: true,
      brand: BRANDING.appName,
      version: '2.5.0',
      readiness: {
        supabaseConfigured,
        vietqrConfigured,
        sepayWebhookConfigured,
        platformAiConfigured,
        byokClientSupported: true,
      },
      contact: {
        zalo: BRANDING.contact.zalo,
        email: BRANDING.contact.email,
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
