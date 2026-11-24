import {
  getBotActiveContext,
  type WorkspaceExtensionsState,
} from './extensionsStore';

export interface ChatStreamExtensionsPayload {
  activeMcps: string[];
  activeSkills: Array<{ name: string; instructions: string }>;
  byok?: {
    provider: 'openai' | 'gemini' | 'anthropic' | 'openrouter' | 'custom';
    apiKey?: string;
    model?: string;
    baseUrl?: string;
  };
}

export function buildChatStreamExtras(
  state: WorkspaceExtensionsState,
  botId?: string | null
): ChatStreamExtensionsPayload {
  const ctx = getBotActiveContext(state, botId);
  const activeMcps = ctx.mcps.map((m) => m.slug);
  const activeSkills = ctx.skills.map((s) => ({
    name: s.name,
    instructions: s.instructions,
  }));

  const p = ctx.defaultProvider;
  let byok: ChatStreamExtensionsPayload['byok'];

  if (p && p.protocol !== 'builtin') {
    const key = p.apiKey?.trim() || '';
    const baseUrl = p.baseUrl?.trim();
    if (p.protocol === 'ollama_local' && baseUrl) {
      byok = {
        provider: 'custom',
        apiKey: key || 'ollama-local',
        model: p.defaultModel,
        baseUrl,
      };
    } else if (
      (p.protocol === 'gemini' || p.protocol === 'anthropic' || p.protocol === 'openrouter') &&
      key.length >= 10
    ) {
      byok = {
        provider: p.protocol,
        apiKey: key,
        model: p.defaultModel,
      };
    } else if (p.protocol === 'openai_compatible' && key.length >= 8) {
      if (!baseUrl || baseUrl === 'https://api.openai.com/v1') {
        byok = {
          provider: 'openai',
          apiKey: key,
          model: p.defaultModel,
        };
      } else {
        byok = {
          provider: 'custom',
          apiKey: key,
          model: p.defaultModel,
          baseUrl,
        };
      }
    }
  }

  return { activeMcps, activeSkills, byok };
}
