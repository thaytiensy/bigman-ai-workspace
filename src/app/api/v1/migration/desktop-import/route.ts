import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, memoryStore } from '@/lib/server/db';
import { encryptApiKey } from '@/lib/server/byok-crypto';
import type { ModelProvider } from '@/types/database';

export interface DesktopExportBundle {
  version: string;
  exportedAt: string;
  sourceApp: string; // 'ToChucNhanVienAI-Desktop'
  workspace: {
    name: string;
    slug: string;
  };
  bots: Array<{
    name: string;
    codeName: string;
    department?: string;
    roleTitle?: string;
    systemPrompt: string;
    modelProvider?: ModelProvider;
    modelName?: string;
    temperature?: number;
  }>;
  memories?: Array<{
    scope?: 'workspace' | 'bot_private';
    memoryKey: string;
    content: string;
  }>;
  byokKeys?: Record<string, string>; // { openai: 'sk-...', gemini: '...' }
}

const VALID_PROVIDERS: ReadonlySet<string> = new Set([
  'openai',
  'anthropic',
  'gemini',
  'deepseek',
  'openrouter',
  'ollama',
]);

function normalizeProvider(provider?: string): ModelProvider {
  if (provider && VALID_PROVIDERS.has(provider)) {
    return provider as ModelProvider;
  }
  return 'openai';
}

export async function POST(req: NextRequest) {
  try {
    const bundle: DesktopExportBundle = await req.json();

    if (!bundle || !bundle.workspace || !Array.isArray(bundle.bots)) {
      return NextResponse.json(
        { error: 'Gói dữ liệu di chuyển từ Bản Cài Máy không đúng định dạng chuẩn.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const importedBotsCount = bundle.bots.length;
    const importedMemoriesCount = bundle.memories?.length || 0;

    // Mã hóa bảo mật các API Key BYOK gửi lên (nếu có)
    const encryptedKeys: Record<string, ReturnType<typeof encryptApiKey>> = {};
    if (bundle.byokKeys) {
      for (const [provider, key] of Object.entries(bundle.byokKeys)) {
        if (typeof key === 'string' && key.trim()) {
          encryptedKeys[provider] = encryptApiKey(key.trim());
        }
      }
    }

    if (supabase) {
      // 1. Tạo Workspace mới trên Cloud
      const { data: ws, error: wsErr } = await supabase
        .from('workspaces')
        .insert({
          name: bundle.workspace.name || 'Workspace Nhập Từ Desktop',
          slug: `${bundle.workspace.slug || 'ws'}-${Date.now()}`,
          owner_id: '00000000-0000-0000-0000-000000000001',
          tier: 'starter_byok', // Tự động kích hoạt gói Cloud cho bản nâng cấp
          encrypted_byok_keys: encryptedKeys,
        })
        .select('*')
        .single();

      if (wsErr || !ws) {
        return NextResponse.json(
          { error: `Lỗi tạo Workspace: ${wsErr?.message || 'Không xác định'}` },
          { status: 500 }
        );
      }

      // 2. Chèn danh sách Bot
      const botsToInsert = bundle.bots.map((b) => ({
        workspace_id: ws.id,
        name: b.name,
        code_name: b.codeName,
        department: b.department || 'General',
        role_title: b.roleTitle || '',
        system_prompt: b.systemPrompt,
        model_provider: normalizeProvider(b.modelProvider),
        model_name: b.modelName || 'gpt-4o-mini',
        temperature: b.temperature ?? 0.7,
        is_active: true,
      }));

      await supabase.from('bots').insert(botsToInsert);

      // 3. Chèn danh sách Tri thức / Bộ nhớ
      if (bundle.memories && bundle.memories.length > 0) {
        const memoriesToInsert = bundle.memories.map((m) => ({
          workspace_id: ws.id,
          scope: m.scope || 'workspace',
          memory_key: m.memoryKey,
          content: m.content,
        }));
        await supabase.from('memories').insert(memoriesToInsert);
      }

      return NextResponse.json({
        success: true,
        message: 'Nâng cấp 1-chạm dữ liệu từ Bản Cài Máy lên Cloud thành công!',
        workspaceId: ws.id,
        importedStats: {
          botsCount: importedBotsCount,
          memoriesCount: importedMemoriesCount,
          byokKeysCount: Object.keys(encryptedKeys).length,
        },
      });
    }

    // In-memory fallback
    const targetWsId = `ws-cloud-${Date.now()}`;
    memoryStore.workspaces.set(targetWsId, {
      id: targetWsId,
      name: bundle.workspace.name || 'Workspace Nhập Từ Desktop',
      slug: `${bundle.workspace.slug || 'ws'}-${Date.now()}`,
      owner_id: '00000000-0000-0000-0000-000000000001',
      tier: 'starter_byok',
      is_active: true,
      encrypted_byok_keys: encryptedKeys,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    for (const b of bundle.bots) {
      const bId = `bot-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      memoryStore.bots.set(bId, {
        id: bId,
        workspace_id: targetWsId,
        name: b.name,
        code_name: b.codeName,
        department: b.department || 'General',
        role_title: b.roleTitle || '',
        avatar_url: null,
        system_prompt: b.systemPrompt,
        model_provider: normalizeProvider(b.modelProvider),
        model_name: b.modelName || 'gpt-4o-mini',
        temperature: b.temperature ?? 0.7,
        tools_config: {},
        is_active: true,
        is_template: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Nâng cấp 1-chạm dữ liệu từ Bản Cài Máy vào bộ nhớ thành công!',
      workspaceId: targetWsId,
      importedStats: {
        botsCount: importedBotsCount,
        memoriesCount: importedMemoriesCount,
        byokKeysCount: Object.keys(encryptedKeys).length,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi di chuyển dữ liệu';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
