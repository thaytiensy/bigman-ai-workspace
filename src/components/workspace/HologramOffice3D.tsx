'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Building2,
  ChevronDown,
  Compass,
  Contrast,
  Edit3,
  Eye,
  LayoutGrid,
  Lock,
  MessageSquare,
  Minus,
  Play,
  Plus,
  RotateCcw,
  RotateCw,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  createHologramOfficeScene,
  type HologramOfficeController,
} from '@/lib/office3d/scene';
import { DUTY_META } from '@/lib/office3d/officeStore';
import type { WorkspaceOrgState } from '@/lib/office3d/useWorkspaceOrg';
import type {
  CameraPreset,
  Office3DBot,
  OfficeDepartment,
} from '@/lib/office3d/types';
import { OfficeFloor2D } from './OfficeFloor2D';
import {
  LivePeekModal,
  MeetingMinutesModal,
} from './OfficeModals';
import { OfficeKpiModal } from './OfficeExtraViews';
import type { ByokClientSettings } from './ByokSettingsModal';
import type { Bot, WorkspaceMode, WorkspaceUiTheme } from '@/types/workspace';

interface HologramOffice3DProps {
  bots: Bot[];
  org: WorkspaceOrgState;
  workspaceMode: WorkspaceMode;
  uiTheme: WorkspaceUiTheme;
  onToggleUiTheme: () => void;
  byokConfigured: boolean;
  byokSettings: ByokClientSettings;
  selectedBotId: string | null;
  onSelectBotId: (botId: string | null) => void;
  onToggleBotActive: (botId: string) => void;
  onOpenUpgradeModal: () => void;
  onSelectBotForChat: (bot: Bot) => void;
  onRequestAddDepartment: () => void;
  onRequestAddBot: (defaultDeptId?: string) => void;
  onRequestEditBot: (bot: Office3DBot) => void;
}

interface MentionOption {
  id: string;
  kind: 'everyone' | 'dept' | 'bot';
  insertText: string;
  label: string;
  sublabel: string;
  colorHex: string;
}

interface LiveCommandReply {
  id: string;
  prompt: string;
  targetSummary: string;
  responderName: string;
  responderBadge: string;
  responderBotId: string;
  departmentId: string;
  replyText: string;
  isStreaming: boolean;
  pushedToKanban?: boolean;
}

export const HologramOffice3D: React.FC<HologramOffice3DProps> = ({
  bots,
  org,
  workspaceMode,
  uiTheme,
  onToggleUiTheme,
  byokConfigured,
  byokSettings,
  selectedBotId,
  onSelectBotId,
  onToggleBotActive,
  onOpenUpgradeModal,
  onSelectBotForChat,
  onRequestAddDepartment,
  onRequestAddBot,
  onRequestEditBot,
}) => {
  const isLight = uiTheme === 'light';
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelOverlayRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<HologramOfficeController | null>(null);
  const commandInputRef = useRef<HTMLInputElement | null>(null);

  const [viewMode, setViewMode] = useState<'3d' | 'floor2d'>('3d');
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('hero');
  const [autoRotate, setAutoRotate] = useState(false);
  const [highlightDeptId, setHighlightDeptId] = useState<string | null>(null);
  const [desksMenuOpen, setDesksMenuOpen] = useState(false);

  // Modals
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showKpiModal, setShowKpiModal] = useState(false);
  const [kpiInitialSection, setKpiInitialSection] = useState<'kpi' | 'kanban' | 'doctor'>('kpi');
  const [peekBotId, setPeekBotId] = useState<string | null>(null);
  const [isSimulatingDemo, setIsSimulatingDemo] = useState(false);

  // Floating @mention command bar state
  const [commandInput, setCommandInput] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [liveReply, setLiveReply] = useState<LiveCommandReply | null>(null);

  const selectedOfficeBot = useMemo(
    () => org.officeBots.find((b) => b.id === selectedBotId) || null,
    [org.officeBots, selectedBotId]
  );

  const selectedRawBot = useMemo(
    () => bots.find((b) => b.id === selectedBotId) || null,
    [bots, selectedBotId]
  );

  const peekBot = useMemo(
    () => org.officeBots.find((b) => b.id === peekBotId) || null,
    [org.officeBots, peekBotId]
  );

  const workingCount = useMemo(
    () =>
      org.officeBots.filter((b) => b.isActive && !b.isLocked && b.duty !== 'idle').length,
    [org.officeBots]
  );

  // Mount Three.js 3D Hologram Hero Office when in 3D view
  useEffect(() => {
    if (viewMode !== '3d') return;
    const host = canvasHostRef.current;
    const canvas = canvasRef.current;
    const labelOverlay = labelOverlayRef.current;
    if (!host || !canvas || !labelOverlay) return;

    let controller: HologramOfficeController | null = null;
    try {
      setSceneError(null);
      controller = createHologramOfficeScene(canvas, labelOverlay, {
        onSelectBot: (botId: string) => {
          onSelectBotId(botId);
          controller?.focusBot(botId);
        },
        onSelectLockedBot: (botId: string) => {
          onSelectBotId(botId);
          controller?.say(botId, '🔒 Nâng cấp Cloud 24/7 để mở khóa bot này', 3200);
        },
        onPeekBot: (botId: string) => {
          setPeekBotId(botId);
        },
        onClickMeetingTable: () => {
          setShowMeetingModal(true);
        },
        onSceneReady: () => setSceneReady(true),
      });
      controllerRef.current = controller;
    } catch (err) {
      console.error('Office3D init error:', err);
      setSceneError('Trình duyệt hiện chưa bật WebGL 3D. Đang sẵn sàng chế độ Sơ đồ 2D.');
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        controller?.resize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    observer.observe(host);

    return () => {
      observer.disconnect();
      controller?.dispose();
      controllerRef.current = null;
      setSceneReady(false);
    };
  }, [viewMode, onSelectBotId]);

  // Keep 3D bots synchronized
  useEffect(() => {
    if (viewMode !== '3d') return;
    controllerRef.current?.syncBots(org.officeBots, selectedBotId, highlightDeptId);
  }, [viewMode, org.officeBots, selectedBotId, highlightDeptId]);

  // Focus bot when selected from sidebar
  useEffect(() => {
    if (viewMode === '3d' && selectedBotId) {
      controllerRef.current?.focusBot(selectedBotId);
    }
  }, [viewMode, selectedBotId]);

  const handleCameraPreset = useCallback((preset: CameraPreset) => {
    setCameraPreset(preset);
    controllerRef.current?.setCameraPreset(preset);
  }, []);

  const handleToggleAutoRotate = useCallback(() => {
    setAutoRotate((prev) => {
      const next = !prev;
      controllerRef.current?.setAutoRotate(next);
      return next;
    });
  }, []);

  // "Xem thử hoạt động" — Animated multi-department A2A showcase
  const handleSimulateActivity = useCallback(() => {
    if (isSimulatingDemo || org.handoffs.length === 0) return;
    setIsSimulatingDemo(true);
    if (viewMode !== '3d') setViewMode('3d');
    handleCameraPreset('hero');

    const involvedBotIds: string[] = [];
    org.handoffs.forEach((link, index) => {
      const fromBot = org.officeBots.find((b) => b.departmentId === link.fromDeptId);
      const toBot = org.officeBots.find((b) => b.departmentId === link.toDeptId);
      const fromDept = org.departments.find((d) => d.id === link.fromDeptId);
      const toDept = org.departments.find((d) => d.id === link.toDeptId);
      if (!fromBot || !toBot) return;

      involvedBotIds.push(fromBot.id, toBot.id);

      window.setTimeout(() => {
        org.setActiveA2ABotIds([fromBot.id, toBot.id]);
        org.setBotLiveActivity((prev) => ({
          ...prev,
          [fromBot.id]: `Bàn giao → ${toBot.name}`,
          [toBot.id]: `Tiếp nhận: ${link.label.slice(0, 32)}`,
        }));
        controllerRef.current?.triggerHandoffBeam({
          fromBotId: fromBot.id,
          toBotId: toBot.id,
          colorHex: fromDept?.colorHex || '#00f5ff',
          label: link.label,
        });
        org.appendBotLog(fromBot.id, `Bàn giao A2A → ${toBot.name}: ${link.label}`);
        org.setA2ATranscripts((prev) => [
          {
            id: `a2a-${Date.now()}-${index}`,
            fromBotId: fromBot.id,
            fromBotName: fromBot.name,
            toBotId: toBot.id,
            toBotName: toBot.name,
            departmentFlow: `${fromDept?.shortLabel || 'Nguồn'} → ${toDept?.shortLabel || 'Đích'}`,
            message: link.label,
            timestamp: new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: 'acknowledged',
          },
          ...prev.slice(0, 24),
        ]);
      }, index * 1250);
    });

    window.setTimeout(() => {
      org.setActiveA2ABotIds([]);
      setIsSimulatingDemo(false);
    }, org.handoffs.length * 1250 + 2400);
  }, [isSimulatingDemo, org, viewMode, handleCameraPreset]);

  // ── @Mention Autocomplete Options ──────────────────────────────────────────
  const mentionOptions: MentionOption[] = useMemo(() => {
    const opts: MentionOption[] = [
      {
        id: 'everyone',
        kind: 'everyone',
        insertText: '@everyone ',
        label: '@everyone',
        sublabel: `Toàn bộ tổ chức (${org.officeBots.length} bot · ${org.departments.length} phòng ban)`,
        colorHex: '#00f5ff',
      },
      ...org.departments.map((d) => ({
        id: `dept-${d.id}`,
        kind: 'dept' as const,
        insertText: `@${d.shortLabel} `,
        label: `@${d.shortLabel}`,
        sublabel: `${d.name} (${org.officeBots.filter((b) => b.departmentId === d.id).length} bot)`,
        colorHex: d.colorHex,
      })),
      ...org.officeBots.map((b) => ({
        id: `bot-${b.id}`,
        kind: 'bot' as const,
        insertText: `@${b.name} `,
        label: `@${b.name}`,
        sublabel: `${b.roleBadge} · ${b.departmentName}`,
        colorHex: b.accentHex,
      })),
    ];

    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return opts
      .filter(
        (o) =>
          o.label.toLowerCase().includes(q) || o.sublabel.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [org.departments, org.officeBots, mentionQuery]);

  const handleCommandInputChange = (val: string) => {
    setCommandInput(val);
    const match = val.match(/@([^\s@]*)$/);
    if (match) {
      setMentionQuery(match[1]);
    } else {
      setMentionQuery(null);
    }
  };

  const handlePickMention = (opt: MentionOption) => {
    const updated = commandInput.replace(/@([^\s@]*)$/, opt.insertText);
    setCommandInput(updated);
    setMentionQuery(null);
    commandInputRef.current?.focus();
  };

  // Dispatch command from Floating @mention Command Bar
  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commandInput.trim();
    if (!text) return;

    setCommandInput('');
    setMentionQuery(null);

    const lower = text.toLowerCase();
    let targets: Office3DBot[] = [];
    const targetLabels: string[] = [];

    if (lower.includes('@everyone')) {
      targets = org.officeBots.filter((b) => !b.isLocked);
      if (targets.length === 0) targets = org.officeBots.slice(0, 3);
      targetLabels.push('@everyone');
    } else {
      // Match tagged departments
      org.departments.forEach((d) => {
        if (
          lower.includes(`@${d.shortLabel.toLowerCase()}`) ||
          lower.includes(`@${d.name.toLowerCase()}`)
        ) {
          targetLabels.push(`@${d.shortLabel}`);
          org.officeBots
            .filter((b) => b.departmentId === d.id)
            .forEach((b) => {
              if (!targets.some((t) => t.id === b.id)) targets.push(b);
            });
        }
      });
      // Match tagged bots
      org.officeBots.forEach((b) => {
        if (
          lower.includes(`@${b.name.toLowerCase()}`) ||
          lower.includes(`@${b.codeName.toLowerCase()}`)
        ) {
          targetLabels.push(`@${b.name}`);
          if (!targets.some((t) => t.id === b.id)) targets.push(b);
        }
      });
    }

    if (targets.length === 0) {
      const lead =
        org.officeBots.find((b) => b.screenKind === 'manager') || org.officeBots[0];
      if (lead) {
        targets = [lead];
        targetLabels.push(`@${lead.name}`);
      }
    }

    const primary = targets[0];
    if (!primary) return;

    const cleanPrompt = text.slice(0, 60);
    // Light up all target bots in 3D & Sidebar immediately!
    targets.forEach((t, idx) => {
      org.setBotLiveActivity((prev) => ({ ...prev, [t.id]: cleanPrompt }));
      org.appendBotLog(t.id, `Nhận lệnh trực tiếp: "${text}"`);
      controllerRef.current?.say(
        t.id,
        idx === 0 ? `⚡ Đang xử lý: "${cleanPrompt}"` : `🤝 Phối hợp: ${cleanPrompt}`,
        5200
      );
    });

    if (targets.length > 1) {
      org.setActiveA2ABotIds(targets.map((t) => t.id));
      targets.slice(1, 4).forEach((peer) => {
        controllerRef.current?.triggerHandoffBeam({
          fromBotId: primary.id,
          toBotId: peer.id,
          colorHex: primary.accentHex,
          label: cleanPrompt,
        });
      });
      window.setTimeout(() => org.setActiveA2ABotIds([]), 4500);
    } else {
      controllerRef.current?.focusBot(primary.id);
    }

    const replyId = `cmd-${Date.now()}`;
    setLiveReply({
      id: replyId,
      prompt: text,
      targetSummary: targetLabels.join(', '),
      responderName: primary.name,
      responderBadge: primary.roleBadge,
      responderBotId: primary.id,
      departmentId: primary.departmentId,
      replyText: 'Đang tổng hợp dữ liệu và điều phối phòng ban...',
      isStreaming: true,
    });

    org.pushInbox({
      kind: 'command',
      title: `Lệnh giao cho ${targetLabels.join(', ')}`,
      body: text,
      senderName: 'Chủ nhân',
      senderBadge: 'Trực tiếp 3D',
      targetLabels,
      unread: false,
      botId: primary.id,
    });

    // Try real BYOK streaming if configured, else fast executive simulation
    let finalReply = '';
    if (byokConfigured && byokSettings.apiKey.trim().length >= 10) {
      try {
        const res = await fetch('/api/v1/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text,
            botName: primary.name,
            botRole: primary.roleTitle,
            byok: byokSettings,
          }),
        });
        if (res.ok && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let acc = '';
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const payload = line.slice(6).trim();
                if (payload && payload !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(payload) as { delta?: string; content?: string };
                    acc += parsed.delta || parsed.content || '';
                  } catch {
                    acc += payload;
                  }
                }
              }
            }
            if (acc) {
              setLiveReply((prev) =>
                prev && prev.id === replyId ? { ...prev, replyText: acc } : prev
              );
            }
          }
          finalReply = acc.trim();
        }
      } catch {
        // Fall back to clean local executive reply
      }
    }

    if (!finalReply) {
      const peerList =
        targets.length > 1
          ? ` cùng ${targets
              .slice(1)
              .map((t) => t.name)
              .join(', ')}`
          : '';
      finalReply = `Đã tiếp nhận lệnh tại ${primary.departmentName}${peerList}.\n• Hạng mục: "${text}"\n• Trạng thái: Đang thực thi trực tiếp trên bàn làm việc 3D, mọi thao tác nhạy cảm tài chính/xuất bản sẽ gửi về Hàng đợi Phê duyệt trước khi bấm lưu.`;
    }

    setLiveReply((prev) =>
      prev && prev.id === replyId
        ? { ...prev, replyText: finalReply, isStreaming: false }
        : prev
    );

    org.pushInbox({
      kind: 'reply',
      title: `${primary.name} đã nhận lệnh: ${cleanPrompt}`,
      body: finalReply,
      senderName: primary.name,
      senderBadge: primary.roleBadge,
      targetLabels,
      unread: true,
      botId: primary.id,
    });
  };

  const handleIntervene = (botId: string, instruction: string) => {
    org.setBotLiveActivity((prev) => ({ ...prev, [botId]: instruction.slice(0, 48) }));
    org.appendBotLog(botId, `Lệnh can thiệp trực tiếp: "${instruction}"`);
    controllerRef.current?.say(botId, `⚡ Đã chỉnh hướng: ${instruction}`, 4500);
  };

  const handleStartMeeting = (topic: string, participantIds: string[]) => {
    org.startRoundtableMeeting(topic, participantIds);
    participantIds.forEach((id) => {
      controllerRef.current?.say(id, `📋 Họp: ${topic}`, 5000);
    });
  };

  const activeDeptFilter: OfficeDepartment | null =
    org.departments.find((d) => d.id === highlightDeptId) || null;

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-hidden transition-colors ${
        isLight ? 'bg-[#f4f6f9] text-slate-900' : 'bg-[#020914] text-slate-100'
      }`}
    >
      {/* ─── TOP APP HEADER (EXACT MATCH TO SCREENSHOT) ───────────────────────── */}
      <div
        className={`px-4 md:px-6 pt-3.5 pb-3 border-b flex-shrink-0 space-y-2.5 ${
          isLight
            ? 'bg-white border-slate-200/90'
            : 'bg-[#030c1a] border-cyan-500/20'
        }`}
      >
        {/* Row 1: Title + Bot Count + Live Green Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Building2 size={18} className="text-blue-600 dark:text-cyan-400" />
              <h1 className="text-base md:text-lg font-extrabold tracking-tight">
                Văn phòng 3D
              </h1>
              <span
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {org.officeBots.length} bot · {org.departments.length} phòng ban
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {workingCount} đang làm việc
              </span>
              {org.pendingApprovalsCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setKpiInitialSection('kanban');
                    setShowKpiModal(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/35 hover:bg-amber-500/25 transition"
                >
                  <ShieldAlert size={12} /> {org.pendingApprovalsCount} chờ duyệt
                </button>
              )}
            </div>
            <p
              className={`text-xs mt-0.5 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Quan sát các bot làm việc trực tiếp tại bàn, xoay góc nhìn 3D và giao việc / họp nhóm ngay tại chỗ.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRequestAddDepartment}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Plus size={13} className="text-cyan-500" /> Phòng ban
            </button>
            <button
              type="button"
              onClick={() => onRequestAddBot(highlightDeptId || undefined)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1 shadow-xs transition"
            >
              <UserPlus size={13} /> Tuyển Bot
            </button>
          </div>
        </div>

        {/* Row 2: Action Pill Bar matching screenshot 1:1 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMeetingModal(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <Users size={14} className="opacity-75" /> Họp bàn tròn
          </button>

          <button
            type="button"
            onClick={() => {
              setKpiInitialSection('kpi');
              setShowKpiModal(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <BarChart3 size={14} className="opacity-75" /> Bảng KPI
          </button>

          <button
            type="button"
            onClick={handleSimulateActivity}
            disabled={isSimulatingDemo}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
              isSimulatingDemo
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-600 dark:text-cyan-300'
                : isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <Play size={13} className="opacity-80" />
            {isSimulatingDemo ? 'Đang chạy hoạt động...' : 'Xem thử hoạt động'}
          </button>

          <button
            type="button"
            onClick={onToggleUiTheme}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <Contrast size={14} className="opacity-75" />
            {isLight ? 'Theo giao diện (Sáng)' : 'Theo giao diện (Tối)'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (viewMode !== '3d') setViewMode('3d');
              handleCameraPreset('hero');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <Compass size={14} className="opacity-75" /> Góc nhìn chuẩn
          </button>

          <button
            type="button"
            onClick={() => setViewMode((m) => (m === '3d' ? 'floor2d' : '3d'))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
              viewMode === 'floor2d'
                ? 'bg-cyan-500 text-slate-950 border-cyan-500 font-bold'
                : isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <LayoutGrid size={14} />
            {viewMode === 'floor2d' ? 'Quay lại 3D Hologram' : 'Sơ đồ 2D'}
          </button>
        </div>
      </div>

      {/* ─── MAIN WORKSPACE BODY (3D HOLOGRAM HERO OR 2D FLOORPLAN) ───────────── */}
      {viewMode === 'floor2d' ? (
        <OfficeFloor2D
          departments={org.departments}
          bots={org.officeBots}
          handoffs={org.handoffs}
          onPeekBot={(id: string) => setPeekBotId(id)}
          onChatBot={(id: string) => {
            const raw = bots.find((b) => b.id === id);
            if (raw) onSelectBotForChat(raw);
          }}
          onEditBot={(id: string) => {
            const ob = org.officeBots.find((b) => b.id === id);
            if (ob) onRequestEditBot(ob);
          }}
          onEditDept={() => onRequestAddDepartment()}
          onOpenNewDept={onRequestAddDepartment}
          onOpenNewBot={() => onRequestAddBot()}
          onOpenUpgrade={onOpenUpgradeModal}
          onRunHandoff={handleSimulateActivity}
        />
      ) : (
        <div className="flex-1 p-2.5 md:p-3.5 min-h-0 flex flex-col">
          <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden bg-[#020914] border border-cyan-500/25 shadow-xl">
            {/* Three.js Hologram Hero Canvas */}
            <div ref={canvasHostRef} className="absolute inset-0 w-full h-full">
              <canvas ref={canvasRef} className="block w-full h-full" />
              <div ref={labelOverlayRef} className="pointer-events-none absolute inset-0 overflow-hidden" />
            </div>

            {!sceneReady && !sceneError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020914]/90 z-10 gap-3 pointer-events-none">
                <div className="h-9 w-9 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <p className="text-xs font-semibold text-cyan-200">
                  Đang dựng không gian 3D Hologram Tổ Chức Nhân Viên AI...
                </p>
              </div>
            )}

            {sceneError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-10 p-6 text-center gap-3">
                <p className="text-sm text-amber-300 font-semibold">{sceneError}</p>
                <button
                  type="button"
                  onClick={() => setViewMode('floor2d')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"
                >
                  Chuyển sang Sơ đồ 2D ngay
                </button>
              </div>
            )}

            {/* TOP-LEFT FLOATING DROPDOWN: "Bàn làm việc · N ⌄" (Exact match to screenshot!) */}
            <div className="absolute top-3.5 left-3.5 z-20">
              <button
                type="button"
                onClick={() => setDesksMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/85 hover:bg-slate-900/95 backdrop-blur-md border border-cyan-400/45 text-white text-xs font-bold shadow-lg transition"
              >
                <span>
                  {activeDeptFilter
                    ? `${activeDeptFilter.shortLabel} · ${
                        org.officeBots.filter((b) => b.departmentId === activeDeptFilter.id).length
                      }`
                    : `Bàn làm việc · ${org.officeBots.length}`}
                </span>
                <ChevronDown size={14} className="text-cyan-300" />
              </button>

              {desksMenuOpen && (
                <div className="mt-2 w-64 p-2 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-cyan-500/35 shadow-2xl space-y-1.5 text-slate-100">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">
                    Lọc khu vực phòng ban ({org.departments.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHighlightDeptId(null);
                      setDesksMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      highlightDeptId === null
                        ? 'bg-cyan-500/20 text-cyan-200 font-bold'
                        : 'hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <span>Tất cả bàn làm việc</span>
                    <span className="font-mono text-[11px]">{org.officeBots.length}</span>
                  </button>
                  <div className="max-h-44 overflow-y-auto space-y-0.5">
                    {org.departments.map((d) => {
                      const cnt = org.officeBots.filter((b) => b.departmentId === d.id).length;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setHighlightDeptId((prev) => (prev === d.id ? null : d.id));
                            setDesksMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                            highlightDeptId === d.id
                              ? 'bg-cyan-500/20 text-white font-bold'
                              : 'hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: d.colorHex }}
                            />
                            <span className="truncate">{d.name}</span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">{cnt}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1.5 border-t border-slate-800 space-y-1">
                    <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Góc quay nhanh
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {(
                        [
                          ['hero', 'Hero chuẩn'],
                          ['table', 'Bàn tròn'],
                          ['overview', 'Toàn cảnh'],
                          ['skyline', 'Skyline'],
                        ] as Array<[CameraPreset, string]>
                      ).map(([preset, lbl]) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            handleCameraPreset(preset);
                            setDesksMenuOpen(false);
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${
                            cameraPreset === preset
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleAutoRotate}
                      className={`w-full py-1.5 rounded-lg text-[11px] font-semibold border ${
                        autoRotate
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {autoRotate ? '⏸ Tắt tự xoay 3D' : '🔄 Bật tự xoay 3D'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* TOP-RIGHT FLOATING BOT INSPECTOR CARD (Shows only when a bot is selected) */}
            {selectedOfficeBot && (
              <div className="absolute top-3.5 right-3.5 z-20 w-72 rounded-2xl bg-slate-950/92 backdrop-blur-xl border border-cyan-500/40 p-3.5 shadow-2xl text-slate-100 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-black text-white truncate">
                        {selectedOfficeBot.name}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/35 font-bold">
                        {selectedOfficeBot.roleBadge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {selectedOfficeBot.roleTitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectBotId(null)}
                    className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                    title="Đóng bảng chi tiết"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className="px-2 py-0.5 rounded-full font-semibold border"
                    style={{
                      borderColor: `${DUTY_META[selectedOfficeBot.duty].colorHex}55`,
                      color: DUTY_META[selectedOfficeBot.duty].colorHex,
                      background: `${DUTY_META[selectedOfficeBot.duty].colorHex}18`,
                    }}
                  >
                    ● {DUTY_META[selectedOfficeBot.duty].label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedOfficeBot.model || 'Claude 3.7'}
                  </span>
                </div>

                {/* Quick Department Reassign */}
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400 flex-shrink-0">Phòng ban:</span>
                  <select
                    value={selectedOfficeBot.departmentId}
                    onChange={(e) =>
                      org.assignBotDepartment(selectedOfficeBot.id, e.target.value)
                    }
                    className="flex-1 min-w-0 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-white outline-none focus:border-cyan-400"
                  >
                    {org.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {selectedOfficeBot.isLocked ? (
                    <button
                      type="button"
                      onClick={onOpenUpgradeModal}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Lock size={13} /> Mở khóa Cloud 24/7
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setPeekBotId(selectedOfficeBot.id)}
                        className="flex-1 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1"
                      >
                        <Eye size={13} /> Soi màn hình
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedRawBot) onSelectBotForChat(selectedRawBot);
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={13} /> Chat 1-1
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onRequestEditBot(selectedOfficeBot)}
                    title="Chỉnh sửa tên, dáng Hologram, màn hình HUD"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 hover:border-cyan-400"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>

                {!selectedOfficeBot.isLocked && (
                  <button
                    type="button"
                    onClick={() => onToggleBotActive(selectedOfficeBot.id)}
                    className={`w-full py-1.5 rounded-xl text-[11px] font-semibold border transition ${
                      selectedOfficeBot.isActive
                        ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    {selectedOfficeBot.isActive
                      ? 'Tạm cho nghỉ (0 token)'
                      : 'Kích hoạt bot ngay'}
                  </button>
                )}
              </div>
            )}

            {/* LIVE REPLY CARD ABOVE FLOATING @MENTION BAR */}
            {liveReply && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-[min(92%,640px)] rounded-2xl bg-slate-950/94 backdrop-blur-xl border border-cyan-500/45 p-3.5 shadow-2xl text-slate-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Sparkles size={14} className="text-cyan-400" />
                    <span className="text-xs font-extrabold text-white">
                      {liveReply.responderName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                      {liveReply.responderBadge}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      → {liveReply.targetSummary}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLiveReply(null)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                </div>
                <p className="text-xs text-slate-200 mt-2 whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                  {liveReply.replyText}
                </p>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-emerald-300">
                    {liveReply.isStreaming
                      ? '● Bot đang phản hồi trực tiếp...'
                      : '✓ Đã đồng bộ vào Hộp thư & bàn làm việc 3D'}
                  </span>
                  {!liveReply.isStreaming && (
                    <button
                      type="button"
                      disabled={liveReply.pushedToKanban}
                      onClick={() => {
                        org.createKanbanTask({
                          title: liveReply.prompt.slice(0, 72),
                          description: liveReply.replyText,
                          departmentId: liveReply.departmentId,
                          assigneeBotId: liveReply.responderBotId,
                          priority: 'P1',
                        });
                        setLiveReply((prev) =>
                          prev ? { ...prev, pushedToKanban: true } : null
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        liveReply.pushedToKanban
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {liveReply.pushedToKanban ? '✓ Đã đẩy Kanban' : '+ Đẩy vào Kanban'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* BOTTOM-LEFT 3D CAMERA CONTROL BAR (EXACT MATCH TO SCREENSHOT) */}
            <div className="hidden sm:flex flex-col gap-1.5 absolute bottom-3.5 left-3.5 z-20">
              <div className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/35 shadow-lg text-slate-200">
                <button
                  type="button"
                  onClick={() => controllerRef.current?.rotateCamera(-0.28)}
                  title="Xoay trái"
                  className="p-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-200 transition"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => controllerRef.current?.rotateCamera(0.28)}
                  title="Xoay phải"
                  className="p-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-200 transition"
                >
                  <RotateCw size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => controllerRef.current?.tiltCamera(-0.14)}
                  title="Nâng góc nhìn lên"
                  className="p-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-200 transition"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => controllerRef.current?.tiltCamera(0.14)}
                  title="Hạ góc nhìn xuống"
                  className="p-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-200 transition"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => controllerRef.current?.zoomCamera(0.84)}
                  title="Phóng to"
                  className="p-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-200 transition"
                >
                  <Plus size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => controllerRef.current?.zoomCamera(1.18)}
                  title="Thu nhỏ"
                  className="p-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-200 transition"
                >
                  <Minus size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleCameraPreset('hero')}
                  title="Đưa về góc nhìn Hero chuẩn"
                  className="p-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-200 transition"
                >
                  <Compass size={14} />
                </button>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-sm text-[10px] text-slate-300/90 border border-slate-800/70">
                Kéo chuột trái/phải để xoay góc 3D · Giữ Shift kéo để trượt ngang · Nhấp đúp bot để soi màn hình
              </div>
            </div>

            {/* BOTTOM-CENTER FLOATING @MENTION COMMAND BAR (EXACT SIGNATURE FEATURE!) */}
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 w-[min(92%,560px)]">
              {/* Autocomplete popup when typing @ */}
              {mentionOptions.length > 0 && (
                <div className="mb-2 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-cyan-500/45 shadow-2xl p-1.5 max-h-56 overflow-y-auto space-y-0.5">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    Gắn thẻ nhanh (@everyone, phòng ban hoặc nhân viên AI)
                  </div>
                  {mentionOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handlePickMention(opt)}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-cyan-500/15 flex items-center justify-between gap-2 transition"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: opt.colorHex }}
                        />
                        <span className="text-xs font-bold text-white truncate">
                          {opt.label}
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {opt.sublabel}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleSendCommand}
                className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-white/95 dark:bg-slate-950/92 backdrop-blur-xl border border-cyan-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
              >
                <input
                  ref={commandInputRef}
                  type="text"
                  value={commandInput}
                  onChange={(e) => handleCommandInputChange(e.target.value)}
                  placeholder="Nhắn cho các bot: gắn thẻ bằng @, một phòng ban hoặc @everyone"
                  className="flex-1 bg-transparent outline-none text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!commandInput.trim()}
                  title="Gửi lệnh trực tiếp tới các bot được gắn thẻ"
                  className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 flex items-center justify-center flex-shrink-0 transition shadow-sm"
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </form>
            </div>

            {/* BOTTOM-RIGHT VERSION CHIP */}
            <div className="hidden lg:block absolute bottom-3.5 right-3.5 z-10 px-2.5 py-1 rounded-lg bg-slate-950/75 border border-slate-800 text-[10px] font-mono text-slate-400">
              v2.6 · {workspaceMode === 'cloud_247' ? 'Cloud 24/7' : 'Desktop Free'}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODALS ────────────────────────────────────────────────────────────── */}
      {peekBot && (
        <LivePeekModal
          bot={peekBot}
          logs={org.botLogs[peekBot.id] || []}
          onClose={() => setPeekBotId(null)}
          onSendIntervention={handleIntervene}
          onSetIdle={(botId: string) => {
            org.setBotIdle(botId);
            controllerRef.current?.say(botId, '?? ?? chuy?n Ngh? ng?i (0 token)', 2800);
          }}
          onOpenDirectChat={(botId: string) => {
            const raw = bots.find((b) => b.id === botId);
            if (raw) onSelectBotForChat(raw);
          }}
        />
      )}

      {showMeetingModal && (
        <MeetingMinutesModal
          onClose={() => setShowMeetingModal(false)}
          bots={org.officeBots}
          departments={org.departments}
          minutesList={org.minutesList}
          a2aTranscripts={org.a2aTranscripts}
          onStartMeeting={handleStartMeeting}
          onPushActionToKanban={org.pushActionItemToKanban}
        />
      )}

      <OfficeKpiModal
        isOpen={showKpiModal}
        onClose={() => setShowKpiModal(false)}
        org={org}
        byokConfigured={byokConfigured}
        initialSection={kpiInitialSection}
      />
    </div>
  );
};
