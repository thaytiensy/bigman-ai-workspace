import { NextRequest, NextResponse } from 'next/server';
import { assertCanCreateRoom, QuotaExceededError } from '@/lib/server/quota-guard';
import { getSupabaseAdmin, memoryStore } from '@/lib/server/db';
import type { Room } from '@/types/database';

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

    const supabase = getSupabaseAdmin();

    if (supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, rooms: data });
    }

    // In-memory fallback
    const result: Room[] = [];
    for (const room of memoryStore.rooms.values()) {
      if (room.workspace_id === workspaceId) {
        result.push(room);
      }
    }

    return NextResponse.json({ success: true, rooms: result });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, name, description, createdBy } = body;

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: 'workspaceId và name là bắt buộc' },
        { status: 400 }
      );
    }

    // CHỐT CHẶN QUOTA GUARD PHÍA SERVER: Giới hạn số phòng họp theo gói
    await assertCanCreateRoom(workspaceId);

    const supabase = getSupabaseAdmin();

    if (supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          workspace_id: workspaceId,
          name,
          description: description || '',
          created_by: createdBy || null,
        })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, room: data }, { status: 201 });
    }

    // In-memory fallback
    const roomId = `room-${Date.now()}`;
    const newRoom: Room = {
      id: roomId,
      workspace_id: workspaceId,
      name,
      description: description || '',
      created_by: createdBy || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryStore.rooms.set(roomId, newRoom);
    return NextResponse.json({ success: true, room: newRoom }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          currentCount: err.currentCount,
          limit: err.limit,
          currentTier: err.currentTier,
          upgradeUrl: err.upgradeUrl,
        },
        { status: 403 }
      );
    }

    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
