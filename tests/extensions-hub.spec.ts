import { describe, expect, it } from 'vitest';
import {
  BUILTIN_AI_PROVIDERS,
  BUILTIN_MCPS,
  BUILTIN_SKILLS,
  MCP_QUICK_PRESETS,
  buildMcpJsonExport,
  createDefaultExtensionsState,
  getAvailableModelOptions,
  getBotActiveContext,
  parseSkillMarkdown,
  slugifyExtensionId,
  validateAiProviderDraft,
  validateMcpDraft,
} from '@/lib/extensions/extensionsStore';
import { buildChatStreamExtras } from '@/lib/extensions/chatPayload';
import {
  buildBotSystemPrompt,
  buildOpenAiCompatibleChatUrl,
  isSafeCustomAiBaseUrl,
  resolveProviderConfig,
} from '@/lib/server/ai-provider';

describe('Extensions Hub — MCP, Skills & Multi-AI Registry', () => {
  it('includes all 11 built-in MCP servers (including code_rewind), 9 core skills, and 8 AI providers', () => {
    expect(BUILTIN_MCPS).toHaveLength(11);
    expect(BUILTIN_SKILLS).toHaveLength(9);
    expect(BUILTIN_AI_PROVIDERS).toHaveLength(8);
    expect(MCP_QUICK_PRESETS.length).toBeGreaterThanOrEqual(6);

    const mcpSlugs = BUILTIN_MCPS.map((m) => m.slug);
    expect(mcpSlugs).toEqual(
      expect.arrayContaining([
        'chrome_devtools',
        'magic_ui',
        'token_optimizer',
        'filesystem',
        'sqlite',
        'browser',
        'computer',
        'data',
        'composio',
        'openmode',
        'code_rewind',
      ])
    );

    const skillSlugs = BUILTIN_SKILLS.map((s) => s.slug);
    expect(skillSlugs).toEqual(
      expect.arrayContaining([
        'bot-supervision',
        'tiktok-shop-ops',
        'token-saver',
        'seo-master',
        'qa-devtools-audit',
        'vietqr-billing',
        'education-gvcn',
        'natural-copywriting',
        'code-loss-guard',
      ])
    );

    const defaultAi = BUILTIN_AI_PROVIDERS.find((p) => p.isDefault);
    expect(defaultAi?.id).toBe('ai-builtin');
    expect(defaultAi?.requiresKey).toBe(false);
  });

  it('validates custom MCP drafts for STDIO and SSE/HTTP transports', () => {
    expect(validateMcpDraft({ name: '', transport: 'stdio', command: 'npx' })).toBeTruthy();
    expect(validateMcpDraft({ name: 'GitHub', transport: 'stdio', command: '' })).toBeTruthy();
    expect(
      validateMcpDraft({ name: 'GitHub', transport: 'stdio', command: 'npx' })
    ).toBeNull();

    expect(
      validateMcpDraft({ name: 'n8n', transport: 'sse', url: 'ftp://invalid.example' })
    ).toBeTruthy();
    expect(
      validateMcpDraft({ name: 'n8n', transport: 'sse', url: 'https://n8n.example.com/mcp/sse' })
    ).toBeNull();
  });

  it('validates custom AI provider drafts cleanly', () => {
    expect(
      validateAiProviderDraft({ name: '', protocol: 'openai_compatible', models: ['m1'] })
    ).toBeTruthy();
    expect(
      validateAiProviderDraft({ name: 'Custom AI', protocol: 'openai_compatible', models: [] })
    ).toBeTruthy();
    expect(
      validateAiProviderDraft({
        name: 'Bad URL AI',
        protocol: 'openai_compatible',
        baseUrl: 'ws://bad',
        models: ['m1'],
      })
    ).toBeTruthy();
    expect(
      validateAiProviderDraft({
        name: 'Together AI',
        protocol: 'openai_compatible',
        baseUrl: 'https://api.together.xyz/v1',
        models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo'],
      })
    ).toBeNull();
  });

  it('parses SKILL.md YAML frontmatter and markdown heading fallback', () => {
    const withFrontmatter = `---
name: Chăm sóc khách hàng VIP
description: Quy trình phản hồi khách hàng VIP trong 3 phút
triggers: [vip, khieu-nai, hoan-tien]
---

Luôn xin lỗi chân thành và đề xuất phương án bù đắp hợp lý.`;

    const parsed = parseSkillMarkdown(withFrontmatter);
    expect(parsed.name).toBe('Chăm sóc khách hàng VIP');
    expect(parsed.slug).toBe('cham-soc-khach-hang-vip');
    expect(parsed.description).toContain('3 phút');
    expect(parsed.triggers).toEqual(['vip', 'khieu-nai', 'hoan-tien']);
    expect(parsed.instructions).toContain('Luôn xin lỗi chân thành');

    const headingOnly = '# Kỹ năng viết đề thi Toán\nTạo 10 câu trắc nghiệm kèm đáp án.';
    const parsedHeading = parseSkillMarkdown(headingOnly);
    expect(parsedHeading.name).toBe('Kỹ năng viết đề thi Toán');
    expect(slugifyExtensionId(parsedHeading.name)).toBe('ky-nang-viet-de-thi-toan');
  });

  it('exports standard mcp.json only for enabled MCP servers without leaking secrets', () => {
    const state = createDefaultExtensionsState();
    state.mcps[0].enabled = false;
    state.mcps.push({
      id: 'mcp-custom-gh',
      slug: 'github',
      name: 'GitHub MCP',
      category: 'custom',
      description: 'Repo manager',
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      envKeys: ['GITHUB_PERSONAL_ACCESS_TOKEN'],
      tools: ['list_issues'],
      enabled: true,
      isBuiltIn: false,
      assignedBotIds: 'all',
    });

    const exported = JSON.parse(buildMcpJsonExport(state.mcps)) as {
      mcpServers: Record<string, { command?: string; env?: Record<string, string> }>;
    };

    expect(exported.mcpServers.chrome_devtools).toBeUndefined();
    expect(exported.mcpServers.magic_ui?.command).toBe('npx');
    expect(exported.mcpServers.github?.env?.GITHUB_PERSONAL_ACCESS_TOKEN).toBe(
      '<DIEN_GITHUB_PERSONAL_ACCESS_TOKEN>'
    );
  });

  it('filters active MCPs/Skills per bot and surfaces newly added AI models', () => {
    const state = createDefaultExtensionsState();
    state.mcps[0].assignedBotIds = ['bot-qa'];
    state.skills[0].assignedBotIds = ['bot-lead'];
    state.aiProviders.unshift({
      id: 'ai-custom-together',
      name: 'Together AI',
      protocol: 'openai_compatible',
      baseUrl: 'https://api.together.xyz/v1',
      models: ['llama-3.3-70b-turbo'],
      defaultModel: 'llama-3.3-70b-turbo',
      description: 'Custom open-source AI',
      enabled: true,
      isDefault: false,
      isBuiltIn: false,
      requiresKey: true,
      assignedBotIds: 'all',
    });

    const qaCtx = getBotActiveContext(state, 'bot-qa');
    expect(qaCtx.mcps.some((m) => m.id === state.mcps[0].id)).toBe(true);
    expect(qaCtx.skills.some((s) => s.id === state.skills[0].id)).toBe(false);

    const otherCtx = getBotActiveContext(state, 'bot-other');
    expect(otherCtx.mcps.some((m) => m.id === state.mcps[0].id)).toBe(false);

    const modelOptions = getAvailableModelOptions(state.aiProviders);
    expect(modelOptions.some((opt) => opt.value === 'llama-3.3-70b-turbo')).toBe(true);
  });

  it('builds chat stream payloads for built-in AI, custom remote AI, and local Ollama', () => {
    const state = createDefaultExtensionsState();
    const builtInExtras = buildChatStreamExtras(state, 'bot-sunny');
    expect(builtInExtras.byok).toBeUndefined();
    expect(builtInExtras.activeMcps.length).toBeGreaterThan(0);
    expect(builtInExtras.activeSkills.length).toBeGreaterThan(0);

    // Switch default to local Ollama (no API key needed)
    state.aiProviders = state.aiProviders.map((p) => ({
      ...p,
      isDefault: p.id === 'ai-ollama-local',
    }));
    const ollamaExtras = buildChatStreamExtras(state, 'bot-sunny');
    expect(ollamaExtras.byok?.provider).toBe('custom');
    expect(ollamaExtras.byok?.baseUrl).toBe('http://localhost:11434/v1');
    expect(ollamaExtras.byok?.apiKey).toBe('ollama-local');
  });

  it('enforces SSRF protection on custom AI base URLs and injects skills/MCPs into system prompt', () => {
    expect(isSafeCustomAiBaseUrl('https://api.deepseek.com/v1')).toBe(true);
    expect(isSafeCustomAiBaseUrl('http://localhost:11434/v1')).toBe(true);
    expect(isSafeCustomAiBaseUrl('http://127.0.0.1:1234/v1')).toBe(true);

    expect(isSafeCustomAiBaseUrl('http://api.deepseek.com/v1')).toBe(false);
    expect(isSafeCustomAiBaseUrl('https://169.254.169.254/latest/meta-data')).toBe(false);
    expect(isSafeCustomAiBaseUrl('https://10.0.0.1/v1')).toBe(false);
    expect(isSafeCustomAiBaseUrl('https://192.168.1.10/v1')).toBe(false);
    expect(isSafeCustomAiBaseUrl('https://172.16.0.5/v1')).toBe(false);
    expect(isSafeCustomAiBaseUrl('https://metadata.google.internal/v1')).toBe(false);

    expect(buildOpenAiCompatibleChatUrl('https://api.deepseek.com/v1/')).toBe(
      'https://api.deepseek.com/v1/chat/completions'
    );
    expect(buildOpenAiCompatibleChatUrl('https://api.deepseek.com/v1/chat/completions')).toBe(
      'https://api.deepseek.com/v1/chat/completions'
    );

    const localResolved = resolveProviderConfig({
      provider: 'custom',
      baseUrl: 'http://localhost:11434/v1',
      model: 'qwen2.5:14b',
    });
    expect(localResolved?.provider).toBe('custom');
    expect(localResolved?.model).toBe('qwen2.5:14b');

    const prompt = buildBotSystemPrompt({
      name: 'Lan',
      roleTitle: 'Chuyên gia TikTok Shop',
      department: 'Shop TMĐT',
      activeMcps: ['chrome_devtools', 'magic_ui'],
      activeSkills: [{ name: 'TikTok Shop Ops', instructions: 'Kiểm soát biên lãi >= 25%.' }],
    });
    expect(prompt).toContain('chrome_devtools');
    expect(prompt).toContain('TikTok Shop Ops');
    expect(prompt).toContain('Kiểm soát biên lãi >= 25%');
  });
});
