import { NextRequest, NextResponse } from 'next/server';
import { assertCanActivateBot, QuotaExceededError } from '@/lib/server/quota-guard';
import { getSupabaseAdmin, memoryStore } from '@/lib/server/db';
import type { Bot } from '@/types/database';

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
        .from('bots')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, bots: data });
    }

    // In-memory fallback
    const result: Bot[] = [];
    for (const bot of memoryStore.bots.values()) {
      if (bot.workspace_id === workspaceId) {
        result.push(bot);
      }
    }

    return NextResponse.json({ success: true, bots: result });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspaceId,
      name,
      codeName,
      department,
      roleTitle,
      systemPrompt,
      modelProvider,
      modelName,
      temperature,
    } = body;

    if (!workspaceId || !name || !codeName || !systemPrompt) {
      return NextResponse.json(
        { error: 'Thiếu các trường bắt buộc: workspaceId, name, codeName, systemPrompt' },
        { status: 400 }
      );
    }

    // CHỐT CHẶN QUOTA GUARD PHÍA SERVER: Kiểm tra giới hạn số Bot hoạt động
    await assertCanActivateBot(workspaceId);

    const supabase = getSupabaseAdmin();

    if (supabase) {
      const { data, error } = await supabase
        .from('bots')
        .insert({
          workspace_id: workspaceId,
          name,
          code_name: codeName,
          department: department || 'General',
          role_title: roleTitle || '',
          system_prompt: systemPrompt,
          model_provider: modelProvider || 'openai',
          model_name: modelName || 'gpt-4o-mini',
          temperature: typeof temperature === 'number' ? temperature : 0.7,
          is_active: true,
        })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, bot: data }, { status: 201 });
    }

    // In-memory fallback
    const botId = `bot-${Date.now()}`;
    const newBot: Bot = {
      id: botId,
      workspace_id: workspaceId,
      name,
      code_name: codeName,
      department: department || 'General',
      role_title: roleTitle || '',
      avatar_url: null,
      system_prompt: systemPrompt,
      model_provider: modelProvider || 'openai',
      model_name: modelName || 'gpt-4o-mini',
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      tools_config: {},
      is_active: true,
      is_template: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryStore.bots.set(botId, newBot);
    return NextResponse.json({ success: true, bot: newBot }, { status: 201 });
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
