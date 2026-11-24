import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceEntitlements } from '@/lib/server/quota-guard';
import { DEFAULT_PLANS, getSupabaseAdmin, memoryStore } from '@/lib/server/db';
import { verifyOwnerPasskey } from '@/lib/ownerAccess';
import type { Workspace } from '@/types/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp workspaceId' },
        { status: 400 }
      );
    }

    const entitlements = await getWorkspaceEntitlements(workspaceId);
    const isOwnerRequest = verifyOwnerPasskey(req.headers.get('x-owner-key'));

    if (isOwnerRequest) {
      return NextResponse.json({
        success: true,
        isOwnerUnlimited: true,
        entitlements: {
          ...entitlements,
          tier: 'business_byok',
          plan: DEFAULT_PLANS.business_byok,
          canAddBot: true,
          canCreateRoom: true,
          canUseCloudCron: true,
        },
      });
    }

    return NextResponse.json({ success: true, entitlements });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, ownerId } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Tên không gian và slug là bắt buộc' },
        { status: 400 }
      );
    }

    const isOwnerRequest = verifyOwnerPasskey(req.headers.get('x-owner-key'));
    const tier: Workspace['tier'] = isOwnerRequest ? 'business_byok' : 'desktop_free';

    const supabase = getSupabaseAdmin();
    const resolvedOwnerId = ownerId || '00000000-0000-0000-0000-000000000001';

    if (supabase) {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name,
          slug,
          owner_id: resolvedOwnerId,
          tier,
        })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, workspace: data }, { status: 201 });
    }

    // In-memory fallback
    const id = `ws-${Date.now()}`;
    const newWs: Workspace = {
      id,
      name,
      slug,
      owner_id: resolvedOwnerId,
      tier,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryStore.workspaces.set(id, newWs);
    return NextResponse.json({ success: true, workspace: newWs }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
