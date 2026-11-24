'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  Bot as BotIcon,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Cpu,
  Download,
  FileCode2,
  Plug,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Terminal,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  MCP_QUICK_PRESETS,
  buildMcpJsonExport,
  parseSkillMarkdown,
  slugifyExtensionId,
  validateAiProviderDraft,
  validateMcpDraft,
  type AiProviderItem,
  type AiProviderProtocol,
  type McpCategory,
  type McpTransport,
  type SkillCategory,
  type WorkspaceExtensionsController,
} from '@/lib/extensions/extensionsStore';
import type { Office3DBot } from '@/lib/office3d/types';
import type { WorkspaceUiTheme } from '@/types/workspace';

interface ExtensionsHubProps {
  extensions: WorkspaceExtensionsController;
  bots: Office3DBot[];
  uiTheme: WorkspaceUiTheme;
}

type SubTab = 'mcp' | 'skills' | 'ai';

const MCP_CATEGORY_LABELS: Record<McpCategory, string> = {
  browser: 'Trình duyệt & QA',
  ui: 'Giao diện & 3D',
  data: 'Dữ liệu & SQL',
  productivity: 'Văn phòng & Email',
  system: 'Hệ thống & Tối ưu',
  custom: 'Tùy chỉnh',
};

const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  operations: 'Điều phối',
  ecommerce: 'TMĐT & Thanh toán',
  seo: 'SEO & Nội dung',
  education: 'Giáo dục',
  qa: 'Kiểm định QA',
  optimization: 'Tối ưu Token',
  custom: 'Tùy chỉnh',
};

const PROTOCOL_LABELS: Record<AiProviderProtocol, string> = {
  builtin: 'Tích hợp sẵn (0 thiết lập)',
  openai_compatible: 'OpenAI-Compatible API',
  gemini: 'Google Gemini API',
  anthropic: 'Anthropic Claude API',
  openrouter: 'OpenRouter Multi-AI',
  ollama_local: 'Ollama / Local AI',
};

export const ExtensionsHub: React.FC<ExtensionsHubProps> = ({
  extensions,
  bots,
  uiTheme,
}) => {
  const isLight = uiTheme === 'light';
  const [subTab, setSubTab] = useState<SubTab>('mcp');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [assigningItem, setAssigningItem] = useState<{
    kind: 'mcp' | 'skill';
    id: string;
    name: string;
    assigned: 'all' | string[];
  } | null>(null);

  // Add MCP modal state
  const [showAddMcp, setShowAddMcp] = useState(false);
  const [mcpName, setMcpName] = useState('');
  const [mcpSlug, setMcpSlug] = useState('');
  const [mcpCategory, setMcpCategory] = useState<McpCategory>('custom');
  const [mcpTransport, setMcpTransport] = useState<McpTransport>('stdio');
  const [mcpCommand, setMcpCommand] = useState('npx');
  const [mcpArgsText, setMcpArgsText] = useState('-y @modelcontextprotocol/server-everything');
  const [mcpUrl, setMcpUrl] = useState('');
  const [mcpToolsText, setMcpToolsText] = useState('search, read, execute');
  const [mcpDesc, setMcpDesc] = useState('');
  const [mcpError, setMcpError] = useState<string | null>(null);

  // Add Skill modal state
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState<SkillCategory>('custom');
  const [skillDesc, setSkillDesc] = useState('');
  const [skillTriggersText, setSkillTriggersText] = useState('');
  const [skillInstructions, setSkillInstructions] = useState('');
  const [skillError, setSkillError] = useState<string | null>(null);
  const skillFileInputRef = useRef<HTMLInputElement | null>(null);

  // Add / Configure AI modal state
  const [showAddAi, setShowAddAi] = useState(false);
  const [aiName, setAiName] = useState('');
  const [aiProtocol, setAiProtocol] = useState<AiProviderProtocol>('openai_compatible');
  const [aiBaseUrl, setAiBaseUrl] = useState('https://api.openai.com/v1');
  const [aiModelsText, setAiModelsText] = useState('gpt-4o-mini, gpt-4o');
  const [aiDesc, setAiDesc] = useState('');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiSetDefault, setAiSetDefault] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Edit existing AI provider inline modal
  const [editingAi, setEditingAi] = useState<AiProviderItem | null>(null);
  const [editAiBaseUrl, setEditAiBaseUrl] = useState('');
  const [editAiModelsText, setEditAiModelsText] = useState('');
  const [editAiDefaultModel, setEditAiDefaultModel] = useState('');
  const [editAiApiKey, setEditAiApiKey] = useState('');

  // Export mcp.json modal
  const [showExportJson, setShowExportJson] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const q = searchQuery.trim().toLowerCase();

  const filteredMcps = useMemo(() => {
    if (!q) return extensions.state.mcps;
    return extensions.state.mcps.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tools.some((t) => t.toLowerCase().includes(q))
    );
  }, [extensions.state.mcps, q]);

  const filteredSkills = useMemo(() => {
    if (!q) return extensions.state.skills;
    return extensions.state.skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.triggers.some((t) => t.toLowerCase().includes(q))
    );
  }, [extensions.state.skills, q]);

  const filteredAis = useMemo(() => {
    if (!q) return extensions.state.aiProviders;
    return extensions.state.aiProviders.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.models.some((m) => m.toLowerCase().includes(q))
    );
  }, [extensions.state.aiProviders, q]);

  const handleApplyMcpPreset = (preset: (typeof MCP_QUICK_PRESETS)[number]) => {
    setMcpName(preset.name);
    setMcpSlug(preset.slug);
    setMcpCategory(preset.category);
    setMcpTransport(preset.transport);
    setMcpCommand(preset.command || 'npx');
    setMcpArgsText((preset.args || []).join(' '));
    setMcpUrl(preset.url || '');
    setMcpToolsText(preset.tools.join(', '));
    setMcpDesc(preset.description);
    setMcpError(null);
  };

  const handleCreateMcp = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateMcpDraft({
      name: mcpName,
      transport: mcpTransport,
      command: mcpCommand,
      url: mcpUrl,
    });
    if (err) {
      setMcpError(err);
      return;
    }

    const args = mcpArgsText
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const tools = mcpToolsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const created = extensions.addMcp({
      name: mcpName.trim(),
      slug: slugifyExtensionId(mcpSlug || mcpName, 'custom-mcp'),
      category: mcpCategory,
      description: mcpDesc.trim() || 'Kết nối MCP tùy chỉnh do người dùng thêm vào hệ thống.',
      transport: mcpTransport,
      command: mcpTransport === 'stdio' ? mcpCommand.trim() : undefined,
      args: mcpTransport === 'stdio' ? args : undefined,
      url: mcpTransport !== 'stdio' ? mcpUrl.trim() : undefined,
      tools: tools.length > 0 ? tools : ['custom_tool'],
      enabled: true,
      assignedBotIds: 'all',
    });

    setShowAddMcp(false);
    setMcpName('');
    setMcpSlug('');
    setMcpDesc('');
    setMcpError(null);
    notify(`Đã tích hợp MCP "${created.name}" (${created.slug}) vào không gian làm việc.`);
  };

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) {
      setSkillError('Vui lòng nhập tên kỹ năng (Skill).');
      return;
    }
    if (!skillInstructions.trim()) {
      setSkillError('Vui lòng nhập nội dung hướng dẫn / quy tắc cho Skill.');
      return;
    }
    const triggers = skillTriggersText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const created = extensions.addSkill({
      name: skillName.trim(),
      slug: slugifyExtensionId(skillName, 'custom-skill'),
      category: skillCategory,
      description: skillDesc.trim() || 'Kỹ năng chuyên môn tùy chỉnh áp dụng cho đội bot.',
      triggers: triggers.length > 0 ? triggers : ['tùy chỉnh'],
      instructions: skillInstructions.trim(),
      enabled: true,
      assignedBotIds: 'all',
    });
    setShowAddSkill(false);
    setSkillName('');
    setSkillDesc('');
    setSkillTriggersText('');
    setSkillInstructions('');
    setSkillError(null);
    notify(`Đã thêm Skill "${created.name}" và kích hoạt cho đội bot.`);
  };

  const handleImportSkillFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseSkillMarkdown(text, file.name.replace(/\.md$/i, ''));
      const created = extensions.addSkill({
        name: parsed.name,
        slug: parsed.slug,
        category: 'custom',
        description: parsed.description,
        triggers: parsed.triggers.length > 0 ? parsed.triggers : ['tệp skill'],
        instructions: parsed.instructions,
        enabled: true,
        assignedBotIds: 'all',
      });
      notify(`Đã nhập Skill "${created.name}" từ tệp ${file.name}.`);
    } catch {
      notify('Không thể đọc tệp .md, vui lòng thử lại.');
    } finally {
      e.target.value = '';
    }
  };

  const handleDownloadSkillMd = (skill: { slug: string; name: string; description: string; triggers: string[]; instructions: string }) => {
    const md = `---\nname: ${skill.name}\ndescription: ${skill.description}\ntriggers: [${skill.triggers.join(', ')}]\n---\n\n${skill.instructions}\n`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.slug}-SKILL.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateAiProvider = (e: React.FormEvent) => {
    e.preventDefault();
    const models = aiModelsText
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    const err = validateAiProviderDraft({
      name: aiName,
      protocol: aiProtocol,
      baseUrl: aiBaseUrl,
      models,
    });
    if (err) {
      setAiError(err);
      return;
    }

    const created = extensions.addAiProvider({
      name: aiName.trim(),
      protocol: aiProtocol,
      baseUrl: aiBaseUrl.trim() || undefined,
      models,
      defaultModel: models[0],
      description:
        aiDesc.trim() ||
        `Nhà cung cấp AI tùy chỉnh (${PROTOCOL_LABELS[aiProtocol]}), sẵn sàng chọn cho từng nhân viên bot.`,
      enabled: true,
      isDefault: aiSetDefault,
      requiresKey: aiProtocol !== 'ollama_local' && aiProtocol !== 'builtin',
      apiKey: aiApiKey.trim() || undefined,
      assignedBotIds: 'all',
    });

    setShowAddAi(false);
    setAiName('');
    setAiDesc('');
    setAiApiKey('');
    setAiSetDefault(false);
    setAiError(null);
    notify(`Đã thêm nhà cung cấp AI "${created.name}" (${created.models.length} model).`);
  };

  const openEditAiModal = (provider: AiProviderItem) => {
    setEditingAi(provider);
    setEditAiBaseUrl(provider.baseUrl || '');
    setEditAiModelsText(provider.models.join(', '));
    setEditAiDefaultModel(provider.defaultModel);
    setEditAiApiKey(provider.apiKey || '');
  };

  const handleSaveEditAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAi) return;
    const models = editAiModelsText
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    const finalModels = models.length > 0 ? models : editingAi.models;
    extensions.updateAiProvider(editingAi.id, {
      baseUrl: editAiBaseUrl.trim() || editingAi.baseUrl,
      models: finalModels,
      defaultModel: finalModels.includes(editAiDefaultModel) ? editAiDefaultModel : finalModels[0],
      apiKey: editAiApiKey.trim() || undefined,
    });
    notify(`Đã cập nhật cấu hình cho ${editingAi.name}.`);
    setEditingAi(null);
  };

  const mcpJsonString = useMemo(
    () => buildMcpJsonExport(extensions.state.mcps),
    [extensions.state.mcps]
  );

  const handleCopyMcpJson = async () => {
    try {
      await navigator.clipboard.writeText(mcpJsonString);
      setCopiedJson(true);
      window.setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleDownloadMcpJson = () => {
    const blob = new Blob([mcpJsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcp.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const surfaceCard = isLight
    ? 'bg-white border-slate-200 text-slate-900'
    : 'bg-[#071429]/90 border-cyan-500/20 text-slate-100';
  const mutedText = isLight ? 'text-slate-600' : 'text-slate-300';

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-hidden ${
        isLight ? 'bg-[#f4f6f9] text-slate-900' : 'bg-[#020914] text-slate-100'
      }`}
    >
      {/* TOP HEADER */}
      <div
        className={`px-4 md:px-6 pt-4 pb-3 border-b flex-shrink-0 space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#030c1a] border-cyan-500/20'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Plug size={19} className={isLight ? 'text-indigo-700' : 'text-cyan-400'} />
              <h1 className="text-base md:text-lg font-extrabold tracking-tight">
                Trung Tâm Tích Hợp MCP, Skill &amp; Nhà Cung Cấp AI
              </h1>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/35'
                }`}
              >
                Sẵn sàng mở rộng không giới hạn
              </span>
            </div>
            <p className={`text-xs mt-1 ${mutedText}`}>
              Tích hợp sẵn toàn bộ {extensions.state.mcps.length} MCP, {extensions.state.skills.length}{' '}
              Skill chuyên môn &amp; {extensions.state.aiProviders.length} động cơ AI — tự do thêm mới
              MCP ngoài, nhập tệp SKILL.md và kết nối bất kỳ model AI nào.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExportJson(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCode2 size={14} /> Xuất mcp.json
            </button>
            <button
              type="button"
              onClick={() => {
                extensions.resetDefaults();
                notify('Đã khôi phục bộ MCP, Skill và AI tích hợp mặc định.');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <RotateCcw size={13} /> Khôi phục mặc định
            </button>
          </div>
        </div>

        {/* SUB-TABS + SEARCH + PRIMARY ADD BUTTON */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Danh mục mở rộng">
            <button
              type="button"
              role="tab"
              aria-selected={subTab === 'mcp'}
              onClick={() => setSubTab('mcp')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                subTab === 'mcp'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                  : isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Plug size={14} />
              MCP Servers ({extensions.enabledMcpCount}/{extensions.state.mcps.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={subTab === 'skills'}
              onClick={() => setSubTab('skills')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                subTab === 'skills'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                  : isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Wand2 size={14} />
              Kho Skills ({extensions.enabledSkillCount}/{extensions.state.skills.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={subTab === 'ai'}
              onClick={() => setSubTab('ai')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                subTab === 'ai'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                  : isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Cpu size={14} />
              Model &amp; Hãng AI ({extensions.enabledAiCount}/{extensions.state.aiProviders.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial justify-end">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs min-w-[200px] ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-slate-900 border-slate-700 text-slate-100'
              }`}
            >
              <Search size={13} aria-hidden="true" className={mutedText} />
              <input
                id="extensions-hub-search"
                name="extensionsHubSearch"
                aria-label="Tìm kiếm MCP, Skill hoặc model AI"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm MCP, công cụ, Skill, model..."
                className={`w-full bg-transparent outline-none text-xs ${
                  isLight ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'
                }`}
              />
            </div>

            {subTab === 'mcp' && (
              <button
                type="button"
                onClick={() => setShowAddMcp(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus size={14} /> Thêm MCP mới
              </button>
            )}

            {subTab === 'skills' && (
              <>
                <input
                  ref={skillFileInputRef}
                  id="import-skill-md-file"
                  name="importSkillMdFile"
                  type="file"
                  accept=".md,.txt"
                  onChange={handleImportSkillFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => skillFileInputRef.current?.click()}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                      : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Upload size={13} /> Nhập SKILL.md
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSkill(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus size={14} /> Thêm Skill mới
                </button>
              </>
            )}

            {subTab === 'ai' && (
              <button
                type="button"
                onClick={() => setShowAddAi(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus size={14} /> Thêm AI khác
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TOAST BANNER */}
      {toast && (
        <div className="px-4 md:px-6 pt-3">
          <div
            className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between gap-2 ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} /> {toast}
            </span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Đóng thông báo"
              className="min-w-[26px] min-h-[26px] flex items-center justify-center rounded-lg hover:bg-black/10"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* MAIN SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* TAB 1: MCP SERVERS */}
        {subTab === 'mcp' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMcps.map((mcp) => (
              <div
                key={mcp.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition ${surfaceCard} ${
                  !mcp.enabled ? 'opacity-70' : ''
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-extrabold">{mcp.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            isLight
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-slate-800 text-cyan-300'
                          }`}
                        >
                          {mcp.slug}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            mcp.transport === 'stdio'
                              ? isLight
                                ? 'bg-indigo-50 text-indigo-800'
                                : 'bg-indigo-500/20 text-indigo-200'
                              : isLight
                                ? 'bg-sky-50 text-sky-800'
                                : 'bg-sky-500/20 text-sky-200'
                          }`}
                        >
                          {mcp.transport}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${mutedText}`}>
                        {mcp.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => extensions.toggleMcp(mcp.id)}
                      aria-pressed={mcp.enabled}
                    aria-label={mcp.enabled ? `Đang bật — ${mcp.name}` : `Đang tắt — ${mcp.name}`}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border flex-shrink-0 transition ${
                        mcp.enabled
                          ? 'bg-emerald-700 border-emerald-600 text-white hover:bg-emerald-800'
                          : isLight
                            ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {mcp.enabled ? 'Đang bật' : 'Đang tắt'}
                    </button>
                  </div>

                  {/* Endpoint / Command preview */}
                  <div
                    className={`rounded-xl px-3 py-2 font-mono text-[11px] truncate border ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    {mcp.transport === 'stdio'
                      ? `$ ${mcp.command || 'npx'} ${(mcp.args || []).join(' ')}`
                      : `URL: ${mcp.url}`}
                  </div>

                  {/* Tool chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {mcp.tools.slice(0, 6).map((tool) => (
                      <span
                        key={tool}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                          isLight
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer bar: Category + Bot Assignment + Delete custom */}
                <div
                  className={`pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${
                    isLight ? 'border-slate-200' : 'border-slate-800'
                  }`}
                >
                  <span className={`font-semibold ${mutedText}`}>
                    Nhóm: {MCP_CATEGORY_LABELS[mcp.category]}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setAssigningItem({
                          kind: 'mcp',
                          id: mcp.id,
                          name: mcp.name,
                          assigned: mcp.assignedBotIds,
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg font-semibold border flex items-center gap-1 transition ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                          : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <BotIcon size={12} />
                      {mcp.assignedBotIds === 'all'
                        ? 'Tất cả bot'
                        : `${mcp.assignedBotIds.length} bot được gán`}
                    </button>

                    {!mcp.isBuiltIn && (
                      <button
                        type="button"
                        onClick={() => {
                          extensions.deleteMcp(mcp.id);
                          notify(`Đã xóa MCP tùy chỉnh "${mcp.name}".`);
                        }}
                        aria-label={`Xóa MCP ${mcp.name}`}
                        className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: SKILLS */}
        {subTab === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSkills.map((skill) => {
              const isExpanded = expandedSkillId === skill.id;
              return (
                <div
                  key={skill.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition ${surfaceCard} ${
                    !skill.enabled ? 'opacity-70' : ''
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-extrabold">{skill.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isLight
                                ? 'bg-indigo-50 text-indigo-800'
                                : 'bg-indigo-500/20 text-indigo-200'
                            }`}
                          >
                            {SKILL_CATEGORY_LABELS[skill.category]}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${mutedText}`}>
                          {skill.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => extensions.toggleSkill(skill.id)}
                        aria-pressed={skill.enabled}
                    aria-label={skill.enabled ? `Đang bật — ${skill.name}` : `Đang tắt — ${skill.name}`}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border flex-shrink-0 transition ${
                          skill.enabled
                            ? 'bg-emerald-700 border-emerald-600 text-white hover:bg-emerald-800'
                            : isLight
                              ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {skill.enabled ? 'Đang bật' : 'Đang tắt'}
                      </button>
                    </div>

                    {/* Triggers */}
                    <div className="flex flex-wrap gap-1.5">
                      {skill.triggers.map((trig) => (
                        <span
                          key={trig}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isLight
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-emerald-500/15 text-emerald-300'
                          }`}
                        >
                          #{trig}
                        </span>
                      ))}
                    </div>

                    {/* Expandable SKILL.md preview */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                        className={`text-[11px] font-bold flex items-center gap-1 ${
                          isLight ? 'text-indigo-700 hover:underline' : 'text-cyan-300 hover:underline'
                        }`}
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        {isExpanded ? 'Thu gọn quy tắc SKILL.md' : 'Xem quy tắc SKILL.md'}
                      </button>
                      {isExpanded && (
                        <pre
                          className={`mt-2 rounded-xl p-3 text-[11px] whitespace-pre-wrap font-sans leading-relaxed border ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800'
                              : 'bg-slate-950/90 border-slate-800 text-slate-200'
                          }`}
                        >
                          {skill.instructions}
                        </pre>
                      )}
                    </div>
                  </div>

                  <div
                    className={`pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleDownloadSkillMd(skill)}
                      className={`font-semibold flex items-center gap-1 hover:underline ${
                        isLight ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      <Download size={12} /> Tải SKILL.md
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setAssigningItem({
                            kind: 'skill',
                            id: skill.id,
                            name: skill.name,
                            assigned: skill.assignedBotIds,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg font-semibold border flex items-center gap-1 transition ${
                          isLight
                            ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <BotIcon size={12} />
                        {skill.assignedBotIds === 'all'
                          ? 'Tất cả bot'
                          : `${skill.assignedBotIds.length} bot được gán`}
                      </button>

                      {!skill.isBuiltIn && (
                        <button
                          type="button"
                          onClick={() => {
                            extensions.deleteSkill(skill.id);
                            notify(`Đã xóa Skill tùy chỉnh "${skill.name}".`);
                          }}
                          aria-label={`Xóa Skill ${skill.name}`}
                          className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: AI PROVIDERS & MODELS */}
        {subTab === 'ai' && (
          <div className="space-y-4">
            <div
              className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
                isLight
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                  : 'bg-indigo-950/40 border-indigo-400/35 text-indigo-100'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong>Động cơ AI mặc định đang chạy:</strong>{' '}
                  <span className="font-extrabold">{extensions.defaultAiProvider.name}</span> (
                  {extensions.defaultAiProvider.defaultModel}). Mọi tính năng đều hoạt động sẵn ngay từ
                  đầu; bạn có thể tùy chọn thêm OpenAI, Gemini, Claude, DeepSeek, OpenRouter, Ollama cục
                  bộ hoặc bất kỳ cổng AI tương thích OpenAI nào để gán riêng cho từng bot.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAi(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 flex-shrink-0"
              >
                <Plus size={14} /> Thêm nhà cung cấp AI khác
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAis.map((ai) => (
                <div
                  key={ai.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition ${surfaceCard} ${
                    ai.isDefault
                      ? isLight
                        ? 'ring-2 ring-indigo-600/30 border-indigo-500'
                        : 'ring-2 ring-cyan-400/30 border-cyan-400/60'
                      : ''
                  } ${!ai.enabled ? 'opacity-70' : ''}`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-extrabold">{ai.name}</span>
                          {ai.isDefault && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-emerald-700 text-white">
                              Mặc định
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isLight
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-slate-800 text-cyan-300'
                            }`}
                          >
                            {PROTOCOL_LABELS[ai.protocol]}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${mutedText}`}>
                          {ai.description}
                        </p>
                      </div>

                      {ai.id !== 'ai-builtin' && (
                        <button
                          type="button"
                          onClick={() => extensions.toggleAiProvider(ai.id)}
                          aria-pressed={ai.enabled}
                    aria-label={ai.enabled ? `Đang bật — ${ai.name}` : `Đang tắt — ${ai.name}`}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border flex-shrink-0 transition ${
                            ai.enabled
                              ? 'bg-emerald-700 border-emerald-600 text-white'
                              : isLight
                                ? 'bg-slate-100 border-slate-300 text-slate-700'
                                : 'bg-slate-900 border-slate-700 text-slate-300'
                          }`}
                        >
                          {ai.enabled ? 'Đang bật' : 'Đang tắt'}
                        </button>
                      )}
                    </div>

                    {ai.baseUrl && (
                      <div
                        className={`rounded-xl px-3 py-1.5 font-mono text-[11px] truncate border ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        Endpoint: {ai.baseUrl}
                      </div>
                    )}

                    {/* Models list */}
                    <div className="flex flex-wrap gap-1.5">
                      {ai.models.map((model) => (
                        <span
                          key={model}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                            model === ai.defaultModel
                              ? isLight
                                ? 'bg-indigo-100 text-indigo-900 font-bold'
                                : 'bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/35'
                              : isLight
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-slate-900 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}
                  >
                    <span className={`font-semibold ${mutedText}`}>
                      {ai.protocol === 'builtin'
                        ? 'Chạy ngay · Không cần khóa kết nối'
                        : ai.protocol === 'ollama_local'
                          ? 'Chạy cục bộ trên máy tính · 0đ phí gọi AI'
                          : ai.apiKey
                            ? 'Đã lưu khóa kết nối cục bộ trên trình duyệt'
                            : 'Sẵn sàng chọn model (tùy chọn gắn khóa kết nối)'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {ai.id !== 'ai-builtin' && (
                        <button
                          type="button"
                          onClick={() => openEditAiModal(ai)}
                          className={`px-2.5 py-1 rounded-lg font-semibold border transition ${
                            isLight
                              ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                              : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          Cấu hình / Model
                        </button>
                      )}
                      {!ai.isDefault && (
                        <button
                          type="button"
                          onClick={() => {
                            extensions.setDefaultAiProvider(ai.id);
                            notify(`Đã đặt "${ai.name}" làm động cơ AI ưu tiên.`);
                          }}
                          className="px-2.5 py-1 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition"
                        >
                          Đặt mặc định
                        </button>
                      )}
                      {!ai.isBuiltIn && (
                        <button
                          type="button"
                          onClick={() => {
                            extensions.deleteAiProvider(ai.id);
                            notify(`Đã xóa nhà cung cấp AI "${ai.name}".`);
                          }}
                          aria-label={`Xóa AI ${ai.name}`}
                          className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL: ADD MCP SERVER ───────────────────────────────────────────── */}
      {showAddMcp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateMcp}
            className="w-full max-w-xl my-auto rounded-2xl bg-[#041224] border border-cyan-500/40 p-5 space-y-4 shadow-2xl text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plug size={17} className="text-cyan-400" />
                <h2 className="text-sm font-black text-white">Thêm Kết Nối MCP Mới</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMcp(false)}
                aria-label="Đóng cửa sổ thêm MCP"
                className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                Chọn nhanh mẫu MCP phổ biến (1 chạm):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {MCP_QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.slug}
                    type="button"
                    onClick={() => handleApplyMcpPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400/50 text-xs font-semibold text-cyan-200 transition"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="add-mcp-name" className="block text-slate-200 font-semibold mb-1">
                    Tên hiển thị MCP *
                  </label>
                  <input
                    id="add-mcp-name"
                    name="mcpName"
                    type="text"
                    required
                    value={mcpName}
                    onChange={(e) => {
                      setMcpName(e.target.value);
                      if (!mcpSlug) setMcpSlug(slugifyExtensionId(e.target.value, ''));
                    }}
                    placeholder="VD: GitHub MCP, CRM Nội Bộ..."
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label htmlFor="add-mcp-slug" className="block text-slate-200 font-semibold mb-1">
                    Mã định danh (slug)
                  </label>
                  <input
                    id="add-mcp-slug"
                    name="mcpSlug"
                    type="text"
                    value={mcpSlug}
                    onChange={(e) => setMcpSlug(e.target.value)}
                    placeholder="vd: github_mcp"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="add-mcp-transport" className="block text-slate-200 font-semibold mb-1">
                    Giao thức kết nối
                  </label>
                  <select
                    id="add-mcp-transport"
                    name="mcpTransport"
                    value={mcpTransport}
                    onChange={(e) => setMcpTransport(e.target.value as McpTransport)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="stdio">STDIO (Lệnh npx / node / python)</option>
                    <option value="http">Streamable HTTP (URL đám mây)</option>
                    <option value="sse">SSE (Server-Sent Events URL)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="add-mcp-category" className="block text-slate-200 font-semibold mb-1">
                    Phân nhóm
                  </label>
                  <select
                    id="add-mcp-category"
                    name="mcpCategory"
                    value={mcpCategory}
                    onChange={(e) => setMcpCategory(e.target.value as McpCategory)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                  >
                    {Object.entries(MCP_CATEGORY_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {mcpTransport === 'stdio' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="add-mcp-command" className="block text-slate-200 font-semibold mb-1">
                      Lệnh chạy *
                    </label>
                    <input
                      id="add-mcp-command"
                      name="mcpCommand"
                      type="text"
                      value={mcpCommand}
                      onChange={(e) => setMcpCommand(e.target.value)}
                      placeholder="npx"
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="add-mcp-args" className="block text-slate-200 font-semibold mb-1">
                      Tham số (Args)
                    </label>
                    <input
                      id="add-mcp-args"
                      name="mcpArgs"
                      type="text"
                      value={mcpArgsText}
                      onChange={(e) => setMcpArgsText(e.target.value)}
                      placeholder="-y @modelcontextprotocol/server-github"
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="add-mcp-url" className="block text-slate-200 font-semibold mb-1">
                    Địa chỉ MCP Server URL *
                  </label>
                  <input
                    id="add-mcp-url"
                    name="mcpUrl"
                    type="url"
                    value={mcpUrl}
                    onChange={(e) => setMcpUrl(e.target.value)}
                    placeholder="https://mcp.example.com/sse"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              <div>
                <label htmlFor="add-mcp-tools" className="block text-slate-200 font-semibold mb-1">
                  Danh sách công cụ (cách nhau bằng dấu phẩy)
                </label>
                <input
                  id="add-mcp-tools"
                  name="mcpTools"
                  type="text"
                  value={mcpToolsText}
                  onChange={(e) => setMcpToolsText(e.target.value)}
                  placeholder="search_pages, create_page, query"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label htmlFor="add-mcp-desc" className="block text-slate-200 font-semibold mb-1">
                  Mô tả công dụng
                </label>
                <textarea
                  id="add-mcp-desc"
                  name="mcpDesc"
                  rows={2}
                  value={mcpDesc}
                  onChange={(e) => setMcpDesc(e.target.value)}
                  placeholder="Mô tả ngắn để các bot biết khi nào cần dùng MCP này..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>

              {mcpError && (
                <div className="rounded-xl bg-rose-500/15 border border-rose-400/40 px-3 py-2 text-rose-200 font-semibold">
                  {mcpError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddMcp(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-extrabold"
              >
                Lưu &amp; Tích hợp MCP
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: ADD SKILL ────────────────────────────────────────────────── */}
      {showAddSkill && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateSkill}
            className="w-full max-w-xl my-auto rounded-2xl bg-[#041224] border border-emerald-500/40 p-5 space-y-4 shadow-2xl text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wand2 size={17} className="text-emerald-400" />
                <h2 className="text-sm font-black text-white">Tạo Kỹ Năng Mới (SKILL.md)</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSkill(false)}
                aria-label="Đóng cửa sổ thêm Skill"
                className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="add-skill-name" className="block text-slate-200 font-semibold mb-1">
                    Tên kỹ năng (Skill) *
                  </label>
                  <input
                    id="add-skill-name"
                    name="skillName"
                    type="text"
                    required
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    placeholder="VD: Chốt đơn Livestream Mỹ Phẩm"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label htmlFor="add-skill-cat" className="block text-slate-200 font-semibold mb-1">
                    Lĩnh vực
                  </label>
                  <select
                    id="add-skill-cat"
                    name="skillCategory"
                    value={skillCategory}
                    onChange={(e) => setSkillCategory(e.target.value as SkillCategory)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-emerald-400"
                  >
                    {Object.entries(SKILL_CATEGORY_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="add-skill-desc" className="block text-slate-200 font-semibold mb-1">
                  Mô tả ngắn
                </label>
                <input
                  id="add-skill-desc"
                  name="skillDesc"
                  type="text"
                  value={skillDesc}
                  onChange={(e) => setSkillDesc(e.target.value)}
                  placeholder="Tóm tắt mục tiêu và đầu ra của kỹ năng này..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label htmlFor="add-skill-triggers" className="block text-slate-200 font-semibold mb-1">
                  Từ khóa kích hoạt (cách nhau bằng dấu phẩy)
                </label>
                <input
                  id="add-skill-triggers"
                  name="skillTriggers"
                  type="text"
                  value={skillTriggersText}
                  onChange={(e) => setSkillTriggersText(e.target.value)}
                  placeholder="livestream, chốt đơn, mỹ phẩm, kịch bản"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label htmlFor="add-skill-body" className="block text-slate-200 font-semibold mb-1">
                  Quy trình &amp; Chỉ dẫn chuyên môn (Markdown) *
                </label>
                <textarea
                  id="add-skill-body"
                  name="skillInstructions"
                  rows={6}
                  required
                  value={skillInstructions}
                  onChange={(e) => setSkillInstructions(e.target.value)}
                  placeholder="# Quy tắc thực thi&#10;- Bước 1: Phân tích tệp khách hàng...&#10;- Bước 2: Kiểm tra chính sách & định dạng đầu ra..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-emerald-400"
                />
              </div>

              {skillError && (
                <div className="rounded-xl bg-rose-500/15 border border-rose-400/40 px-3 py-2 text-rose-200 font-semibold">
                  {skillError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddSkill(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold"
              >
                Lưu &amp; Kích hoạt Skill
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: ADD OTHER AI PROVIDER ────────────────────────────────────── */}
      {showAddAi && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateAiProvider}
            className="w-full max-w-xl my-auto rounded-2xl bg-[#041224] border border-cyan-500/40 p-5 space-y-4 shadow-2xl text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu size={17} className="text-cyan-400" />
                <h2 className="text-sm font-black text-white">Thêm Nhà Cung Cấp / Model AI Khác</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAi(false)}
                aria-label="Đóng cửa sổ thêm AI"
                className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="add-ai-name" className="block text-slate-200 font-semibold mb-1">
                    Tên nhà cung cấp AI *
                  </label>
                  <input
                    id="add-ai-name"
                    name="aiName"
                    type="text"
                    required
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    placeholder="VD: xAI Grok, Mistral, Qwen Cloud, vLLM Nội bộ..."
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label htmlFor="add-ai-protocol" className="block text-slate-200 font-semibold mb-1">
                    Chuẩn kết nối
                  </label>
                  <select
                    id="add-ai-protocol"
                    name="aiProtocol"
                    value={aiProtocol}
                    onChange={(e) => {
                      const next = e.target.value as AiProviderProtocol;
                      setAiProtocol(next);
                      if (next === 'ollama_local') setAiBaseUrl('http://localhost:11434/v1');
                      else if (next === 'openrouter') setAiBaseUrl('https://openrouter.ai/api/v1');
                      else if (next === 'gemini') setAiBaseUrl('https://generativelanguage.googleapis.com/v1beta');
                      else if (next === 'anthropic') setAiBaseUrl('https://api.anthropic.com/v1');
                    }}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="openai_compatible">OpenAI-Compatible (xAI, DeepSeek, Groq, vLLM...)</option>
                    <option value="ollama_local">Ollama / LM Studio (AI cục bộ trên máy)</option>
                    <option value="openrouter">OpenRouter (Đa model)</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="anthropic">Anthropic Claude</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="add-ai-baseurl" className="block text-slate-200 font-semibold mb-1">
                  Endpoint Base URL
                </label>
                <input
                  id="add-ai-baseurl"
                  name="aiBaseUrl"
                  type="url"
                  value={aiBaseUrl}
                  onChange={(e) => setAiBaseUrl(e.target.value)}
                  placeholder="https://api.x.ai/v1 hoặc http://localhost:11434/v1"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label htmlFor="add-ai-models" className="block text-slate-200 font-semibold mb-1">
                  Danh sách mã Model (cách nhau bằng dấu phẩy) *
                </label>
                <input
                  id="add-ai-models"
                  name="aiModels"
                  type="text"
                  required
                  value={aiModelsText}
                  onChange={(e) => setAiModelsText(e.target.value)}
                  placeholder="grok-3-mini, qwen-2.5-72b, mistral-large"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label htmlFor="add-ai-key" className="block text-slate-200 font-semibold mb-1">
                  Mã truy cập (Tùy chọn — để trống nếu dùng AI cục bộ hoặc chỉ thêm vào danh sách model)
                </label>
                <input
                  id="add-ai-key"
                  name="aiApiKey"
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder="Tùy chọn (chỉ lưu cục bộ trên trình duyệt của bạn)"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label htmlFor="add-ai-desc" className="block text-slate-200 font-semibold mb-1">
                  Ghi chú thế mạnh
                </label>
                <input
                  id="add-ai-desc"
                  name="aiDesc"
                  type="text"
                  value={aiDesc}
                  onChange={(e) => setAiDesc(e.target.value)}
                  placeholder="VD: Dùng riêng cho phòng Lập trình & phân tích tài chính"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                <input
                  id="add-ai-default"
                  name="aiSetDefault"
                  type="checkbox"
                  checked={aiSetDefault}
                  onChange={(e) => setAiSetDefault(e.target.checked)}
                  className="rounded border-slate-600"
                />
                <span>Đặt làm nhà cung cấp AI mặc định cho phòng chat</span>
              </label>

              {aiError && (
                <div className="rounded-xl bg-rose-500/15 border border-rose-400/40 px-3 py-2 text-rose-200 font-semibold">
                  {aiError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddAi(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-extrabold"
              >
                Thêm AI vào hệ thống
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: CONFIGURE EXISTING AI PROVIDER ───────────────────────────── */}
      {editingAi && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditAi}
            className="w-full max-w-md rounded-2xl bg-[#041224] border border-cyan-500/40 p-5 space-y-4 shadow-2xl text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-black text-white">Cấu hình {editingAi.name}</h2>
              <button
                type="button"
                onClick={() => setEditingAi(null)}
                aria-label="Đóng cửa sổ cấu hình AI"
                className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="edit-ai-url" className="block text-slate-200 font-semibold mb-1">
                  Endpoint Base URL
                </label>
                <input
                  id="edit-ai-url"
                  name="editAiUrl"
                  type="url"
                  value={editAiBaseUrl}
                  onChange={(e) => setEditAiBaseUrl(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label htmlFor="edit-ai-models" className="block text-slate-200 font-semibold mb-1">
                  Danh sách Model (phân cách bằng dấu phẩy)
                </label>
                <input
                  id="edit-ai-models"
                  name="editAiModels"
                  type="text"
                  value={editAiModelsText}
                  onChange={(e) => setEditAiModelsText(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label htmlFor="edit-ai-default-model" className="block text-slate-200 font-semibold mb-1">
                  Model mặc định của hãng này
                </label>
                <input
                  id="edit-ai-default-model"
                  name="editAiDefaultModel"
                  type="text"
                  value={editAiDefaultModel}
                  onChange={(e) => setEditAiDefaultModel(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                />
              </div>
              {editingAi.requiresKey && (
                <div>
                  <label htmlFor="edit-ai-key" className="block text-slate-200 font-semibold mb-1">
                    Mã truy cập riêng (Tùy chọn · lưu cục bộ trình duyệt)
                  </label>
                  <input
                    id="edit-ai-key"
                    name="editAiKey"
                    type="password"
                    value={editAiApiKey}
                    onChange={(e) => setEditAiApiKey(e.target.value)}
                    placeholder="Để trống nếu không cần thay đổi"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-white outline-none focus:border-cyan-400"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingAi(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-extrabold"
              >
                Lưu cấu hình
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: ASSIGN TO SPECIFIC BOTS ──────────────────────────────────── */}
      {assigningItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#041224] border border-cyan-500/40 p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-black text-white">Phân quyền sử dụng cho Bot</h2>
                <p className="text-xs text-slate-300 mt-0.5">{assigningItem.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningItem(null)}
                aria-label="Đóng cửa sổ phân quyền bot"
                className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
              <button
                type="button"
                onClick={() => setAssigningItem({ ...assigningItem, assigned: 'all' })}
                className={`w-full text-left px-3 py-2 rounded-xl border font-bold flex items-center justify-between ${
                  assigningItem.assigned === 'all'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <span>Áp dụng cho Tất cả nhân viên Bot</span>
                {assigningItem.assigned === 'all' && <Check size={14} />}
              </button>

              {bots.map((bot) => {
                const selectedList = assigningItem.assigned === 'all' ? [] : assigningItem.assigned;
                const isChecked = assigningItem.assigned === 'all' || selectedList.includes(bot.id);
                return (
                  <button
                    key={bot.id}
                    type="button"
                    onClick={() => {
                      const current =
                        assigningItem.assigned === 'all'
                          ? bots.map((b) => b.id)
                          : [...assigningItem.assigned];
                      const next = current.includes(bot.id)
                        ? current.filter((x) => x !== bot.id)
                        : [...current, bot.id];
                      setAssigningItem({
                        ...assigningItem,
                        assigned: next.length === bots.length ? 'all' : next,
                      });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl border flex items-center justify-between ${
                      isChecked
                        ? 'bg-slate-900 border-emerald-500/40 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{bot.name}</div>
                      <div className="text-[11px] text-slate-300">
                        {bot.roleBadge} · {bot.departmentName}
                      </div>
                    </div>
                    {isChecked && <Check size={14} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAssigningItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (assigningItem.kind === 'mcp') {
                    extensions.updateMcpBots(assigningItem.id, assigningItem.assigned);
                  } else {
                    extensions.updateSkillBots(assigningItem.id, assigningItem.assigned);
                  }
                  notify(`Đã lưu phân quyền bot cho "${assigningItem.name}".`);
                  setAssigningItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-extrabold"
              >
                Lưu phân quyền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: EXPORT MCP.JSON ──────────────────────────────────────────── */}
      {showExportJson && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#041224] border border-cyan-500/40 p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal size={17} className="text-cyan-400" />
                <h2 className="text-sm font-black text-white">
                  Cấu hình chuẩn mcp.json (Bản Cài Máy / Desktop / IDE)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowExportJson(false)}
                aria-label="Đóng cửa sổ xuất mcp.json"
                className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <pre className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-[11px] font-mono text-cyan-200 max-h-80 overflow-auto">
              {mcpJsonString}
            </pre>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleCopyMcpJson}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5"
              >
                {copiedJson ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedJson ? 'Đã sao chép!' : 'Sao chép JSON'}
              </button>
              <button
                type="button"
                onClick={handleDownloadMcpJson}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5"
              >
                <Download size={14} /> Tải tệp mcp.json
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
