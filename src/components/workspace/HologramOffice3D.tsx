'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Box,
  Building2,
  Camera,
  ClipboardList,
  Edit3,
  Eye,
  GitBranch,
  Kanban,
  LayoutGrid,
  Lock,
  MessageSquare,
  Play,
  Plus,
  RotateCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  createHologramOfficeScene,
  type HologramOfficeController,
} from '@/lib/office3d/scene';
import {
  computeBotDuty,
  DUTY_META,
  generateStructuredMeetingMinutes,
  INITIAL_A2A_TRANSCRIPTS,
  INITIAL_APPROVALS,
  INITIAL_KANBAN_TASKS,
  runOfficeDoctor,
  runOfficeSelfRepair,
} from '@/lib/office3d/officeStore';
import type {
  A2ATranscriptEntry,
  ApprovalItem,
  AvatarStyle,
  CameraPreset,
  HandoffLink,
  HologramScreenKind,
  KanbanStatus,
  KanbanTask,
  MeetingMinutes,
  Office3DBot,
  OfficeDepartment,
  OfficeViewMode,
  SelfRepairReport,
} from '@/lib/office3d/types';
import { OfficeKanbanBoard } from './OfficeKanbanBoard';
import { OfficeFloor2D } from './OfficeFloor2D';
import {
  EditBotModal,
  EditDepartmentModal,
  LivePeekModal,
  MeetingMinutesModal,
  SystemDoctorModal,
} from './OfficeModals';
import { BRANDING } from '@/config/branding';
import type { Bot, WorkspaceMode } from '@/types/workspace';

interface HologramOffice3DProps {
  bots: Bot[];
  workspaceMode: WorkspaceMode;
  byokConfigured?: boolean;
  onToggleBotActive: (botId: string) => void;
  onAddBot: (bot: Bot) => void;
  onUpdateBot?: (botId: string, patch: Partial<Bot>) => void;
  onRemoveBot?: (botId: string) => void;
  onUpdateBotDepartment: (botId: string, deptName: Bot['department']) => void;
  onOpenUpgradeModal: () => void;
  onSelectBotForChat: (bot: Bot) => void;
}

const STORAGE_KEY = 'tochuc_nvai_office3d_org_v2';

const DEFAULT_DEPARTMENTS: OfficeDepartment[] = [
  {
    id: 'dept-exec',
    name: 'Ban Điều Hành Tổng',
    shortLabel: 'Điều hành',
    colorHex: '#00f5ff',
    description: 'Giám sát trạng thái, phân bổ việc chéo và tổng hợp báo cáo toàn hệ thống.',
  },
  {
    id: 'dept-growth',
    name: 'Phòng Tăng Trưởng & Marketing',
    shortLabel: 'Marketing & SEO',
    colorHex: '#38bdf8',
    description: 'SEO Top Google, SEO sàn TMĐT, kịch bản video ngắn và chuốt nội dung tự nhiên.',
  },
  {
    id: 'dept-commerce',
    name: 'Phòng Kinh Doanh & CSKH',
    shortLabel: 'Shop & CSKH',
    colorHex: '#34d399',
    description: 'Vận hành TikTok Shop, nghiên cứu KOC Affiliate, tư vấn chốt đơn và chăm sóc 24/7.',
  },
  {
    id: 'dept-tech',
    name: 'Phòng Kỹ Thuật & Sản Phẩm',
    shortLabel: 'Kỹ thuật & QA',
    colorHex: '#818cf8',
    description: 'Kiến trúc hệ thống, phát triển ứng dụng Web/Desktop và kiểm thử an toàn.',
  },
];

const DEFAULT_HANDOFFS: HandoffLink[] = [
  {
    id: 'hf-1',
    fromDeptId: 'dept-commerce',
    toDeptId: 'dept-growth',
    label: 'Dữ liệu thị trường & KOC → SEO / Content',
  },
  {
    id: 'hf-2',
    fromDeptId: 'dept-growth',
    toDeptId: 'dept-tech',
    label: 'Landing & Bài Pillar → Đẩy Web / App',
  },
  {
    id: 'hf-3',
    fromDeptId: 'dept-tech',
    toDeptId: 'dept-commerce',
    label: 'Bản phát hành mới → Chốt đơn & CSKH',
  },
  {
    id: 'hf-4',
    fromDeptId: 'dept-commerce',
    toDeptId: 'dept-exec',
    label: 'Báo cáo GMV & SLA → Ban Điều Hành',
  },
];

const NEON_COLORS = ['#00f5ff', '#38bdf8', '#34d399', '#818cf8', '#f472b6', '#fbbf24'];

function inferDefaultDepartmentId(bot: Bot): string {
  if (bot.codeName === 'orbit') return 'dept-exec';
  if (bot.department === 'Marketing & SEO') return 'dept-growth';
  if (bot.department === 'Shop TMĐT & TikTok' || bot.department === 'Vận Hành & CSKH') {
    return 'dept-commerce';
  }
  return 'dept-tech';
}

function inferRoleVisuals(bot: Bot): {
  badge: string;
  screen: HologramScreenKind;
  avatarStyle: AvatarStyle;
} {
  const cn = bot.codeName.toLowerCase();
  if (cn.includes('orbit')) {
    return {
      badge: bot.roleBadge || 'AI Manager',
      screen: 'manager',
      avatarStyle: bot.avatarStyle || 'male',
    };
  }
  if (cn.includes('listing') || cn.includes('echo')) {
    return {
      badge: bot.roleBadge || 'AI Marketer',
      screen: 'marketer',
      avatarStyle: bot.avatarStyle || 'female',
    };
  }
  if (cn.includes('wren')) {
    return {
      badge: bot.roleBadge || 'AI Researcher',
      screen: 'researcher',
      avatarStyle: bot.avatarStyle || 'female',
    };
  }
  if (cn.includes('sale') || cn.includes('cskh')) {
    return {
      badge: bot.roleBadge || 'AI Customer Support',
      screen: 'support',
      avatarStyle: bot.avatarStyle || 'female',
    };
  }
  if (cn.includes('sunny')) {
    return {
      badge: bot.roleBadge || 'AI Commerce',
      screen: 'commerce',
      avatarStyle: bot.avatarStyle || 'female',
    };
  }
  return {
    badge: bot.roleBadge || 'AI Engineer',
    screen: 'code',
    avatarStyle: bot.avatarStyle || 'male',
  };
}

interface BotVisualOverride {
  roleBadge?: string;
  screenKind?: HologramScreenKind;
  avatarStyle?: AvatarStyle;
}

interface SavedOrgConfig {
  departments: OfficeDepartment[];
  botDeptMap: Record<string, string>;
  botVisuals: Record<string, BotVisualOverride>;
  handoffs: HandoffLink[];
  tasks: KanbanTask[];
  approvals: ApprovalItem[];
  minutesList: MeetingMinutes[];
  a2aTranscripts: A2ATranscriptEntry[];
}

export const HologramOffice3D: React.FC<HologramOffice3DProps> = ({
  bots,
  workspaceMode,
  byokConfigured = false,
  onToggleBotActive,
  onAddBot,
  onUpdateBot,
  onRemoveBot,
  onUpdateBotDepartment,
  onOpenUpgradeModal,
  onSelectBotForChat,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<HologramOfficeController | null>(null);

  const [viewMode, setViewMode] = useState<OfficeViewMode>('3d');
  const [webglError, setWebglError] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('hero');
  const [autoRotate, setAutoRotate] = useState(false);
  const [highlightDeptId, setHighlightDeptId] = useState<string | null>(null);
  const [selectedBotId, setSelectedBotId] = useState<string | null>('bot-orbit');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);

  // Core expandable organization & Hermes-grade state
  const [departments, setDepartments] = useState<OfficeDepartment[]>(DEFAULT_DEPARTMENTS);
  const [botDeptMap, setBotDeptMap] = useState<Record<string, string>>({});
  const [botVisuals, setBotVisuals] = useState<Record<string, BotVisualOverride>>({});
  const [handoffs, setHandoffs] = useState<HandoffLink[]>(DEFAULT_HANDOFFS);
  const [tasks, setTasks] = useState<KanbanTask[]>(INITIAL_KANBAN_TASKS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [minutesList, setMinutesList] = useState<MeetingMinutes[]>([]);
  const [a2aTranscripts, setA2aTranscripts] = useState<A2ATranscriptEntry[]>(INITIAL_A2A_TRANSCRIPTS);

  // Live Duty overlays
  const [activeMeetingBotIds, setActiveMeetingBotIds] = useState<string[]>([]);
  const [activeA2ABotIds, setActiveA2ABotIds] = useState<string[]>([]);
  const [forcedIdleBotIds, setForcedIdleBotIds] = useState<string[]>([]);
  const [liveBotLogs, setLiveBotLogs] = useState<Record<string, string[]>>({});
  const [isRunningHandoff, setIsRunningHandoff] = useState(false);

  // Modals
  const [showNewDeptModal, setShowNewDeptModal] = useState(false);
  const [showNewBotModal, setShowNewBotModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [peekBotId, setPeekBotId] = useState<string | null>(null);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);

  // Doctor live health state
  const [healthState, setHealthState] = useState<{
    ok: boolean | null;
    supabaseConfigured?: boolean;
    vietqrConfigured?: boolean;
  }>({ ok: null });
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [lastRepair, setLastRepair] = useState<SelfRepairReport | null>(null);

  // Quick Add Dept & Add Bot Form states
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptColor, setNewDeptColor] = useState(NEON_COLORS[4]);

  const [newBotName, setNewBotName] = useState('');
  const [newBotRoleBadge, setNewBotRoleBadge] = useState('AI Marketer');
  const [newBotRoleTitle, setNewBotRoleTitle] = useState('');
  const [newBotDeptId, setNewBotDeptId] = useState('dept-growth');
  const [newBotScreenKind, setNewBotScreenKind] = useState<HologramScreenKind>('marketer');
  const [newBotAvatarStyle, setNewBotAvatarStyle] = useState<AvatarStyle>('female');
  const [newBotModel, setNewBotModel] = useState('Claude Sonnet / DeepSeek-V3');

  // Hydrate persisted org config once on client
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<SavedOrgConfig>;
      if (Array.isArray(parsed.departments) && parsed.departments.length > 0) {
        setDepartments(parsed.departments);
      }
      if (parsed.botDeptMap && typeof parsed.botDeptMap === 'object') {
        setBotDeptMap(parsed.botDeptMap);
      }
      if (parsed.botVisuals && typeof parsed.botVisuals === 'object') {
        setBotVisuals(parsed.botVisuals);
      }
      if (Array.isArray(parsed.handoffs)) setHandoffs(parsed.handoffs);
      if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (Array.isArray(parsed.approvals)) setApprovals(parsed.approvals);
      if (Array.isArray(parsed.minutesList)) setMinutesList(parsed.minutesList);
      if (Array.isArray(parsed.a2aTranscripts)) setA2aTranscripts(parsed.a2aTranscripts);
    } catch {
      // Ignore corrupt storage
    }
  }, []);

  // Persist changes
  useEffect(() => {
    try {
      const payload: SavedOrgConfig = {
        departments,
        botDeptMap,
        botVisuals,
        handoffs,
        tasks,
        approvals,
        minutesList,
        a2aTranscripts,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [departments, botDeptMap, botVisuals, handoffs, tasks, approvals, minutesList, a2aTranscripts]);

  // Compute live 3D bots enriched with strict 5-priority Duty State Machine
  const office3DBots: Office3DBot[] = useMemo(() => {
    const activeSet = new Set(bots.filter((b) => b.isActive).map((b) => b.id));
    const meetingSet = new Set(activeMeetingBotIds);
    const a2aSet = new Set(activeA2ABotIds);
    const forcedIdleSet = new Set(forcedIdleBotIds);
    const deptById = new Map(departments.map((d) => [d.id, d]));

    return bots.map((b) => {
      const deptId = botDeptMap[b.id] || inferDefaultDepartmentId(b);
      const dept = deptById.get(deptId) || departments[0];
      const inferred = inferRoleVisuals(b);
      const override = botVisuals[b.id];

      const isLocked =
        workspaceMode === 'desktop_free' &&
        !activeSet.has(b.id) &&
        activeSet.size >= BRANDING.system.desktopMaxFreeBots;

      const effectiveStatus = forcedIdleSet.has(b.id) ? 'ready' : b.status;
      const duty = forcedIdleSet.has(b.id)
        ? 'idle'
        : computeBotDuty(
            { id: b.id, isActive: b.isActive, isLocked, status: effectiveStatus },
            tasks,
            approvals,
            meetingSet,
            a2aSet
          );

      const currentTask = tasks.find(
        (t) => t.assigneeBotId === b.id && (t.status === 'in_progress' || t.status === 'review')
      );

      return {
        id: b.id,
        name: b.name,
        codeName: b.codeName,
        roleBadge: override?.roleBadge || inferred.badge,
        roleTitle: b.roleTitle,
        departmentId: dept?.id || 'dept-exec',
        departmentName: dept?.name || b.department,
        accentHex: dept?.colorHex || '#00f5ff',
        screenKind: override?.screenKind || inferred.screen,
        avatarStyle: override?.avatarStyle || inferred.avatarStyle,
        isActive: b.isActive,
        isLocked,
        status: effectiveStatus,
        duty,
        currentTaskTitle: currentTask?.title,
        model: b.model,
      };
    });
  }, [
    bots,
    botDeptMap,
    botVisuals,
    departments,
    workspaceMode,
    tasks,
    approvals,
    activeMeetingBotIds,
    activeA2ABotIds,
    forcedIdleBotIds,
  ]);

  const selectedOfficeBot = useMemo(
    () => office3DBots.find((b) => b.id === selectedBotId) || office3DBots[0] || null,
    [office3DBots, selectedBotId]
  );

  const selectedRawBot = useMemo(
    () => bots.find((b) => b.id === selectedOfficeBot?.id) || null,
    [bots, selectedOfficeBot]
  );

  const pendingApprovalsCount = useMemo(
    () => approvals.filter((a) => a.status === 'pending').length,
    [approvals]
  );

  // Initialize Three.js WebGL scene only when viewMode === '3d'
  useEffect(() => {
    if (viewMode !== '3d') return;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    let ctrl: HologramOfficeController | null = null;
    try {
      ctrl = createHologramOfficeScene(canvas, overlay, {
        onSelectBot: (botId) => {
          setSelectedBotId(botId);
          setDrawerOpen(true);
        },
        onSelectLockedBot: () => {
          onOpenUpgradeModal();
        },
        onPeekBot: (botId) => {
          setPeekBotId(botId);
        },
      });
      controllerRef.current = ctrl;
      setWebglError(null);
    } catch {
      setWebglError('Trình duyệt chưa hỗ trợ WebGL 3D — hãy chuyển sang chế độ Sơ đồ 2D Nhẹ Máy.');
      return;
    }

    const parent = canvas.parentElement;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        ctrl?.resize(width, height);
      }
    });
    if (parent) ro.observe(parent);

    return () => {
      ro.disconnect();
      ctrl?.dispose();
      controllerRef.current = null;
    };
  }, [viewMode, onOpenUpgradeModal]);

  // Sync bots into 3D scene whenever org / duty changes
  useEffect(() => {
    if (viewMode !== '3d') return;
    controllerRef.current?.syncBots(office3DBots, selectedBotId, highlightDeptId);
  }, [viewMode, office3DBots, selectedBotId, highlightDeptId]);

  useEffect(() => {
    controllerRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  const handleCameraPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    controllerRef.current?.setCameraPreset(preset);
  };

  // Run A2A inter-department handoff pulse sequence
  const handleRunHandoffChain = useCallback(() => {
    if (isRunningHandoff || handoffs.length === 0) return;
    setIsRunningHandoff(true);
    const deptById = new Map(departments.map((d) => [d.id, d]));

    handoffs.forEach((hf, idx) => {
      window.setTimeout(() => {
        const fromBot = office3DBots.find((b) => b.departmentId === hf.fromDeptId);
        const toBot = office3DBots.find((b) => b.departmentId === hf.toDeptId);
        if (fromBot && toBot) {
          setActiveA2ABotIds([fromBot.id, toBot.id]);
          controllerRef.current?.triggerHandoffBeam({
            fromBotId: fromBot.id,
            toBotId: toBot.id,
            colorHex: fromBot.accentHex,
            label: hf.label,
          });
          const fromDept = deptById.get(hf.fromDeptId)?.shortLabel || 'Phòng nguồn';
          const toDept = deptById.get(hf.toDeptId)?.shortLabel || 'Phòng đích';
          const nowLabel = new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          });
          setA2aTranscripts((prev) => [
            {
              id: `a2a-${Date.now()}-${idx}`,
              fromBotId: fromBot.id,
              fromBotName: fromBot.name,
              toBotId: toBot.id,
              toBotName: toBot.name,
              departmentFlow: `${fromDept} → ${toDept}`,
              message: `Bàn giao A2A: ${hf.label}`,
              timestamp: nowLabel,
              status: 'delivered',
            },
            ...prev.slice(0, 29),
          ]);
        }
        if (idx === handoffs.length - 1) {
          window.setTimeout(() => {
            setActiveA2ABotIds([]);
            setIsRunningHandoff(false);
          }, 2200);
        }
      }, idx * 1400);
    });
  }, [handoffs, departments, office3DBots, isRunningHandoff]);

  // Launch Round-Table Meeting + Auto-Generated Minutes
  const handleStartMeeting = (topic: string, participantIds: string[]) => {
    const participants = office3DBots.filter((b) => participantIds.includes(b.id));
    if (participants.length === 0) return;

    setActiveMeetingBotIds(participantIds);
    const minutes = generateStructuredMeetingMinutes(
      topic,
      participants.map((p) => ({
        id: p.id,
        name: p.name,
        roleBadge: p.roleBadge,
        departmentId: p.departmentId,
      })),
      departments
    );
    setMinutesList((prev) => [minutes, ...prev]);

    // Trigger speech bubbles & beams in 3D scene
    participants.forEach((p, idx) => {
      window.setTimeout(() => {
        controllerRef.current?.say(
          p.id,
          idx === 0
            ? `Chủ trì họp: "${topic.slice(0, 48)}"`
            : `Đã nhận đầu việc & đồng bộ phòng ${p.departmentName}`,
          4500
        );
        const nextP = participants[(idx + 1) % participants.length];
        if (nextP && nextP.id !== p.id) {
          controllerRef.current?.triggerHandoffBeam({
            fromBotId: p.id,
            toBotId: nextP.id,
            colorHex: p.accentHex,
          });
        }
      }, idx * 900);
    });

    window.setTimeout(() => {
      setActiveMeetingBotIds([]);
    }, participants.length * 1000 + 2800);
  };

  // Push meeting action item straight into Kanban
  const handlePushActionToKanban = (meetingId: string, actionId: string) => {
    const meeting = minutesList.find((m) => m.id === meetingId);
    const act = meeting?.actionItems.find((a) => a.id === actionId);
    if (!act || act.pushedToKanban) return;

    const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setTasks((prev) => [
      {
        id: `task-${Date.now()}`,
        title: act.title,
        description: `Sinh tự động từ Biên bản họp "${meeting?.topic}".`,
        departmentId: act.departmentId,
        assigneeBotId: act.ownerBotId,
        reviewerBotId: 'bot-orbit',
        status: 'backlog',
        priority: 'P1',
        evidence: [],
        verification: { status: 'unverified' },
        createdAt: nowLabel,
        updatedAt: nowLabel,
      },
      ...prev,
    ]);

    setMinutesList((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              actionItems: m.actionItems.map((a) =>
                a.id === actionId ? { ...a, pushedToKanban: true } : a
              ),
            }
          : m
      )
    );
  };

  // Create new custom department (unlimited!)
  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    const id = `dept-custom-${Date.now()}`;
    const dept: OfficeDepartment = {
      id,
      name: newDeptName.trim(),
      shortLabel: newDeptName.trim().slice(0, 18),
      colorHex: newDeptColor,
      description: newDeptDesc.trim() || 'Phòng ban chuyên trách mở rộng theo nhu cầu doanh nghiệp.',
      isCustom: true,
    };
    setDepartments((prev) => [...prev, dept]);
    setNewDeptName('');
    setNewDeptDesc('');
    setShowNewDeptModal(false);
  };

  // Edit / Delete department cleanly (migrating bots to first remaining dept)
  const handleSaveDepartment = (updated: OfficeDepartment) => {
    setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleDeleteDepartment = (deptId: string) => {
    if (departments.length <= 1) return;
    const remaining = departments.filter((d) => d.id !== deptId);
    const fallback = remaining[0];
    setDepartments(remaining);
    setBotDeptMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k] === deptId) next[k] = fallback.id;
      });
      return next;
    });
    setHandoffs((prev) => prev.filter((h) => h.fromDeptId !== deptId && h.toDeptId !== deptId));
    if (highlightDeptId === deptId) setHighlightDeptId(null);
  };

  // Recruit new AI bot (unlimited expansion!)
  const handleRecruitBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim()) return;
    const id = `bot-custom-${Date.now()}`;
    const codeName = newBotName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_');
    const dept = departments.find((d) => d.id === newBotDeptId) || departments[0];
    const activeCount = bots.filter((b) => b.isActive).length;
    const canActivateNow =
      workspaceMode === 'cloud_247' || activeCount < BRANDING.system.desktopMaxFreeBots;

    const created: Bot = {
      id,
      name: newBotName.trim(),
      codeName,
      roleBadge: newBotRoleBadge.trim() || 'AI Specialist',
      roleTitle: newBotRoleTitle.trim() || `Chuyên viên ${dept.name}`,
      department: dept.name,
      avatar: '🤖',
      avatarStyle: newBotAvatarStyle,
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      status: canActivateNow ? 'working' : 'ready',
      description: `Nhân viên AI mở rộng thuộc ${dept.name}.`,
      skills: [newBotRoleBadge, dept.shortLabel, 'Phối hợp A2A'],
      model: newBotModel.trim() || 'Claude Sonnet / DeepSeek-V3',
      isActive: canActivateNow,
      priorityOrder: bots.length + 1,
    };

    onAddBot(created);
    setBotDeptMap((prev) => ({ ...prev, [id]: dept.id }));
    setBotVisuals((prev) => ({
      ...prev,
      [id]: {
        roleBadge: newBotRoleBadge.trim() || 'AI Specialist',
        screenKind: newBotScreenKind,
        avatarStyle: newBotAvatarStyle,
      },
    }));
    setSelectedBotId(id);
    setNewBotName('');
    setNewBotRoleTitle('');
    setShowNewBotModal(false);
  };

  // Edit existing bot profile, department & hologram appearance
  const handleSaveBotEdit = (patch: {
    botId: string;
    name: string;
    roleBadge: string;
    roleTitle: string;
    departmentId: string;
    screenKind: HologramScreenKind;
    avatarStyle: AvatarStyle;
    model: string;
  }) => {
    const dept = departments.find((d) => d.id === patch.departmentId);
    setBotDeptMap((prev) => ({ ...prev, [patch.botId]: patch.departmentId }));
    setBotVisuals((prev) => ({
      ...prev,
      [patch.botId]: {
        roleBadge: patch.roleBadge,
        screenKind: patch.screenKind,
        avatarStyle: patch.avatarStyle,
      },
    }));
    if (dept) {
      onUpdateBotDepartment(patch.botId, dept.name);
    }
    onUpdateBot?.(patch.botId, {
      name: patch.name,
      roleBadge: patch.roleBadge,
      roleTitle: patch.roleTitle,
      department: dept?.name,
      avatarStyle: patch.avatarStyle,
      model: patch.model,
    });
  };

  // Live health fetch for System Doctor
  const refreshDoctorHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/v1/health', { cache: 'no-store' });
      if (!res.ok) {
        setHealthState({ ok: false });
      } else {
        const data = (await res.json()) as {
          ok?: boolean;
          readiness?: { supabaseConfigured?: boolean; vietqrConfigured?: boolean };
        };
        setHealthState({
          ok: Boolean(data.ok),
          supabaseConfigured: data.readiness?.supabaseConfigured,
          vietqrConfigured: data.readiness?.vietqrConfigured,
        });
      }
    } catch {
      setHealthState({ ok: false });
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    if (showDoctorModal && healthState.ok === null) {
      void refreshDoctorHealth();
    }
  }, [showDoctorModal, healthState.ok, refreshDoctorHealth]);

  const doctorChecks = useMemo(
    () =>
      runOfficeDoctor({
        departments,
        botIds: bots.map((b) => b.id),
        botDeptMap,
        handoffs,
        tasks,
        approvals,
        byokConfigured,
        healthOk: healthState.ok,
        supabaseConfigured: healthState.supabaseConfigured,
        vietqrConfigured: healthState.vietqrConfigured,
      }),
    [
      departments,
      bots,
      botDeptMap,
      handoffs,
      tasks,
      approvals,
      byokConfigured,
      healthState,
    ]
  );

  const handleRunSelfRepair = () => {
    const repaired = runOfficeSelfRepair({
      departments,
      botIds: bots.map((b) => b.id),
      botDeptMap,
      handoffs,
      tasks,
    });
    setBotDeptMap(repaired.botDeptMap);
    setHandoffs(repaired.handoffs);
    setTasks(repaired.tasks);
    setLastRepair(repaired.report);
  };

  // Kanban & Approval actions
  const handleCreateTask = (input: {
    title: string;
    description: string;
    departmentId: string;
    assigneeBotId: string;
    priority: 'P0' | 'P1' | 'P2';
  }) => {
    const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setTasks((prev) => [
      {
        id: `task-${Date.now()}`,
        title: input.title,
        description: input.description,
        departmentId: input.departmentId,
        assigneeBotId: input.assigneeBotId,
        reviewerBotId: 'bot-orbit',
        status: 'backlog',
        priority: input.priority,
        evidence: [],
        verification: { status: 'unverified' },
        createdAt: nowLabel,
        updatedAt: nowLabel,
      },
      ...prev,
    ]);
  };

  const handleMoveTask = (taskId: string, nextStatus: KanbanStatus) => {
    const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus, updatedAt: nowLabel } : t))
    );
  };

  const handleAddEvidence = (taskId: string, summary: string) => {
    const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              evidence: [
                ...t.evidence,
                { id: `ev-${Date.now()}`, kind: 'log', summary, createdAt: nowLabel },
              ],
              updatedAt: nowLabel,
            }
          : t
      )
    );
  };

  const handleVerifyTask = (
    taskId: string,
    verdict: 'verified' | 'changes_requested',
    note: string
  ) => {
    const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: verdict === 'verified' ? 'done' : 'in_progress',
              verification: {
                status: verdict,
                reviewerName: 'Orbit (AI Manager / QA)',
                note,
                verifiedAt: nowLabel,
              },
              updatedAt: nowLabel,
            }
          : t
      )
    );
  };

  const handleDecideApproval = (
    approvalId: string,
    status: 'approved' | 'rejected',
    note: string
  ) => {
    const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const item = approvals.find((a) => a.id === approvalId);
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === approvalId ? { ...a, status, decisionNote: note, decidedAt: nowLabel } : a
      )
    );
    if (item) {
      controllerRef.current?.say(
        item.requestedByBotId,
        status === 'approved' ? 'Đã nhận duyệt — tiếp tục thực thi!' : 'Đã nhận lệnh từ chối & ghi log.',
        4000
      );
    }
  };

  // Live Peek Intervention
  const handleSendIntervention = (botId: string, instruction: string) => {
    const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setForcedIdleBotIds((prev) => prev.filter((id) => id !== botId));
    setLiveBotLogs((prev) => ({
      ...prev,
      [botId]: [
        ...(prev[botId] || []),
        `[${nowLabel}] Lệnh chủ nhân: "${instruction}"`,
        `[${nowLabel}] Bot đã cập nhật hướng xử lý ưu tiên ngay lập tức.`,
      ],
    }));
    controllerRef.current?.say(botId, `Đã nhận chỉnh hướng: ${instruction.slice(0, 42)}`, 4500);
  };

  const handleSetIdle = (botId: string) => {
    const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setForcedIdleBotIds((prev) => (prev.includes(botId) ? prev : [...prev, botId]));
    setLiveBotLogs((prev) => ({
      ...prev,
      [botId]: [
        ...(prev[botId] || []),
        `[${nowLabel}] Chuyển sang trạng thái Nghỉ ngơi (0 token · không gọi AI).`,
      ],
    }));
  };

  const peekBot = peekBotId ? office3DBots.find((b) => b.id === peekBotId) || null : null;
  const editingDept = editingDeptId ? departments.find((d) => d.id === editingDeptId) || null : null;
  const editingBot = editingBotId ? office3DBots.find((b) => b.id === editingBotId) || null : null;
  const idleBotsCount = office3DBots.filter((b) => b.duty === 'idle').length;

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] bg-[#020914] text-slate-100 relative overflow-hidden">
      {/* ─── TOP COMMAND BAR (PINNED 3-VIEW SWITCHER + HERMES COMMAND CONTROLS) ─── */}
      <div className="px-3 md:px-4 py-2.5 bg-slate-950/95 border-b border-cyan-500/25 flex flex-wrap items-center justify-between gap-2 z-20">
        {/* Pinned 3 View Modes (never scrolls off screen!) */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-900 p-0.5 border border-cyan-500/30">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === '3d'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Box size={13} /> 3D Hologram
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'kanban'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Kanban size={13} /> Kanban ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('floor2d')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'floor2d'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid size={13} /> Sơ đồ 2D
            </button>
          </div>

          <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] text-cyan-200 font-semibold">
            <Building2 size={12} /> {departments.length} Phòng ban · {office3DBots.length} Bot
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowMeetingModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <ClipboardList size={13} /> Họp & Biên bản
          </button>

          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              pendingApprovalsCount > 0
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/50 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            }`}
          >
            <ShieldAlert size={13} /> Phê duyệt ({pendingApprovalsCount})
          </button>

          <button
            type="button"
            onClick={() => setShowDoctorModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/35 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Activity size={13} /> Sức khỏe
          </button>

          <button
            type="button"
            onClick={() => setShowNewDeptModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-cyan-500/35 text-xs font-semibold flex items-center gap-1 transition"
          >
            <Plus size={13} /> Phòng ban
          </button>

          <button
            type="button"
            onClick={() => setShowNewBotModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md shadow-cyan-500/20 transition"
          >
            <UserPlus size={13} /> Tuyển Bot
          </button>

          {viewMode === '3d' && (
            <button
              type="button"
              onClick={handleRunHandoffChain}
              disabled={isRunningHandoff}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs font-bold flex items-center gap-1 disabled:opacity-50 transition"
            >
              <Play size={12} /> {isRunningHandoff ? 'Đang chạy A2A...' : 'Chạy Bàn Giao'}
            </button>
          )}
        </div>
      </div>

      {/* ─── VIEW 1: 3D HOLOGRAM VIRTUAL OFFICE ─── */}
      {viewMode === '3d' && (
        <div className="flex-1 flex flex-col lg:flex-row relative min-h-[540px]">
          {/* 3D CANVAS STAGE */}
          <div className="flex-1 relative min-h-[460px] lg:min-h-[calc(100vh-8rem)] overflow-hidden">
            {webglError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#020914] gap-3">
                <p className="text-sm text-amber-300 font-semibold">{webglError}</p>
                <button
                  type="button"
                  onClick={() => setViewMode('floor2d')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"
                >
                  Mở Sơ Đồ 2D Nhẹ Máy Ngay
                </button>
              </div>
            ) : (
              <>
                <canvas ref={canvasRef} className="w-full h-full block outline-none" />
                <div
                  ref={overlayRef}
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                />
              </>
            )}

            {/* Floating Camera & Department Quick Filter HUD */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
              <div className="flex items-center gap-1 flex-wrap pointer-events-auto bg-slate-950/75 backdrop-blur-md p-1 rounded-xl border border-cyan-500/25">
                <button
                  type="button"
                  onClick={() => setHighlightDeptId(null)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                    highlightDeptId === null
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Tất cả ({office3DBots.length})
                </button>
                {departments.map((d) => {
                  const count = office3DBots.filter((b) => b.departmentId === d.id).length;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() =>
                        setHighlightDeptId((prev) => (prev === d.id ? null : d.id))
                      }
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                        highlightDeptId === d.id
                          ? 'bg-cyan-500/25 text-white border border-cyan-400'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: d.colorHex }}
                      />
                      {d.shortLabel} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 pointer-events-auto bg-slate-950/75 backdrop-blur-md p-1 rounded-xl border border-cyan-500/25">
                {(
                  [
                    ['hero', 'Hero'],
                    ['table', 'Bàn tròn'],
                    ['overview', 'Toàn cảnh'],
                    ['skyline', 'Skyline'],
                  ] as Array<[CameraPreset, string]>
                ).map(([preset, label]) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleCameraPreset(preset)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                      cameraPreset === preset
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Camera size={11} /> {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAutoRotate((v) => !v)}
                  className={`p-1.5 rounded-lg transition ${
                    autoRotate
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Tự động xoay góc nhìn 3D"
                >
                  <RotateCw size={12} />
                </button>
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="absolute bottom-3 left-3 pointer-events-none z-10 hidden sm:flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/25 text-[11px] text-slate-300">
              <Sparkles size={13} className="text-cyan-400" />
              <span>
                Bấm vào nhân viên AI để xem/chỉnh sửa · Nhấp đúp nhãn để{' '}
                <strong className="text-cyan-200">Soi màn hình trực tiếp</strong> · Tự giãn vòng
                phòng ban khi &gt; 8 bot
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              className="lg:hidden absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs font-bold text-cyan-200"
            >
              {drawerOpen ? 'Ẩn bảng quản trị' : 'Mở Phòng ban & Bot'}
            </button>
          </div>

          {/* RIGHT INSPECTOR PANEL (DEPARTMENTS + SELECTED BOT + A2A FLOW) */}
          {drawerOpen && (
            <aside className="w-full lg:w-80 xl:w-96 bg-slate-950/95 border-t lg:border-t-0 lg:border-l border-cyan-500/25 overflow-y-auto p-3.5 space-y-4 max-h-[calc(100vh-8rem)]">
              {/* SELECTED BOT INSPECTOR CARD */}
              {selectedOfficeBot && (
                <div className="rounded-2xl border border-cyan-500/35 bg-gradient-to-b from-[#061c30] to-slate-950 p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: selectedOfficeBot.accentHex }}
                        />
                        <h3 className="text-sm font-black text-white">{selectedOfficeBot.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
                          {selectedOfficeBot.roleBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        {selectedOfficeBot.roleTitle}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            DUTY_META[selectedOfficeBot.duty].badgeClass
                          }`}
                        >
                          {DUTY_META[selectedOfficeBot.duty].label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {selectedOfficeBot.model || 'Claude Sonnet / DeepSeek'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingBotId(selectedOfficeBot.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300"
                      title="Chỉnh sửa tên, dáng Hologram, màn hình HUD & phòng ban"
                    >
                      <Edit3 size={13} />
                    </button>
                  </div>

                  {/* Quick Department Reassign */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 shrink-0">Phòng ban:</span>
                    <select
                      value={selectedOfficeBot.departmentId}
                      onChange={(e) => {
                        const nextDeptId = e.target.value;
                        const nextDept = departments.find((d) => d.id === nextDeptId);
                        setBotDeptMap((prev) => ({
                          ...prev,
                          [selectedOfficeBot.id]: nextDeptId,
                        }));
                        if (nextDept) {
                          onUpdateBotDepartment(selectedOfficeBot.id, nextDept.name);
                        }
                      }}
                      className="flex-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {selectedOfficeBot.isLocked ? (
                      <button
                        type="button"
                        onClick={onOpenUpgradeModal}
                        className="col-span-2 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Lock size={13} /> Mở khóa Bot trên Cloud 24/7
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setPeekBotId(selectedOfficeBot.id)}
                          className="py-1.5 px-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 border border-cyan-400/40 text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Eye size={13} /> Soi màn hình
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedRawBot) onSelectBotForChat(selectedRawBot);
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare size={13} /> Chat 1-1
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleBotActive(selectedOfficeBot.id)}
                          className="col-span-2 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-semibold"
                        >
                          {selectedOfficeBot.isActive
                            ? 'Tạm tắt bot (nhường suất)'
                            : 'Kích hoạt bot ngay'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* EXPANDABLE DEPARTMENTS LIST */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={13} /> Phòng Ban Mở Rộng ({departments.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowNewDeptModal(true)}
                    className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-0.5"
                  >
                    <Plus size={12} /> Thêm mới
                  </button>
                </div>

                <div className="space-y-1.5">
                  {departments.map((d) => {
                    const members = office3DBots.filter((b) => b.departmentId === d.id);
                    return (
                      <div
                        key={d.id}
                        className={`rounded-xl border p-2.5 transition ${
                          highlightDeptId === d.id
                            ? 'bg-cyan-500/15 border-cyan-400'
                            : 'bg-slate-900/75 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setHighlightDeptId((prev) => (prev === d.id ? null : d.id))
                            }
                            className="flex items-center gap-2 text-left flex-1 min-w-0"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: d.colorHex }}
                            />
                            <span className="text-xs font-bold text-white truncate">{d.name}</span>
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-slate-400">{members.length} bot</span>
                            <button
                              type="button"
                              onClick={() => setEditingDeptId(d.id)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300"
                              title="Sửa màu/tên phòng ban"
                            >
                              <Edit3 size={11} />
                            </button>
                          </div>
                        </div>

                        {members.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {members.map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBotId(m.id);
                                  controllerRef.current?.focusBot(m.id);
                                }}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition ${
                                  selectedBotId === m.id
                                    ? 'bg-cyan-500/25 border-cyan-400 text-white'
                                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                                }`}
                              >
                                {m.name} {m.isLocked ? '🔒' : ''}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* A2A HANDOFF LINKS */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GitBranch size={13} /> Chuỗi Bàn Giao A2A ({handoffs.length})
                </h4>
                <div className="space-y-1.5">
                  {handoffs.map((hf) => (
                    <div
                      key={hf.id}
                      className="rounded-xl bg-slate-900/75 border border-slate-800 px-2.5 py-2 flex items-center justify-between gap-2 text-[11px]"
                    >
                      <span className="text-slate-200 flex items-center gap-1.5">
                        <Zap size={11} className="text-cyan-400 shrink-0" />
                        {hf.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setHandoffs((prev) => prev.filter((item) => item.id !== hf.id))
                        }
                        className="text-slate-500 hover:text-rose-400"
                        title="Gỡ tuyến bàn giao"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      )}

      {/* ─── VIEW 2: KANBAN + EVIDENCE + QA VERIFICATION + APPROVAL QUEUE ─── */}
      {viewMode === 'kanban' && (
        <OfficeKanbanBoard
          departments={departments}
          bots={office3DBots}
          tasks={tasks}
          approvals={approvals}
          onCreateTask={handleCreateTask}
          onMoveTask={handleMoveTask}
          onAddEvidence={handleAddEvidence}
          onVerifyTask={handleVerifyTask}
          onDecideApproval={handleDecideApproval}
          onPeekBot={(botId) => setPeekBotId(botId)}
        />
      )}

      {/* ─── VIEW 3: LIGHTWEIGHT 2D FLOORPLAN (LOW-END PC & MOBILE) ─── */}
      {viewMode === 'floor2d' && (
        <OfficeFloor2D
          departments={departments}
          bots={office3DBots}
          handoffs={handoffs}
          onPeekBot={(botId) => setPeekBotId(botId)}
          onChatBot={(botId) => {
            const raw = bots.find((b) => b.id === botId);
            if (raw) onSelectBotForChat(raw);
          }}
          onEditBot={(botId) => setEditingBotId(botId)}
          onEditDept={(deptId) => setEditingDeptId(deptId)}
          onOpenNewDept={() => setShowNewDeptModal(true)}
          onOpenNewBot={() => setShowNewBotModal(true)}
          onOpenUpgrade={onOpenUpgradeModal}
          onRunHandoff={handleRunHandoffChain}
        />
      )}

      {/* ─── MODALS ─── */}
      {peekBot && (
        <LivePeekModal
          bot={peekBot}
          logs={
            liveBotLogs[peekBot.id] || [
              `[21:40] Khởi chạy hồ sơ ${peekBot.name} (${peekBot.roleBadge}) trong ${peekBot.departmentName}.`,
              `[21:44] Trạng thái hiện tại: ${DUTY_META[peekBot.duty].label} — ${DUTY_META[peekBot.duty].tokenHint}.`,
              `[21:50] Sẵn sàng nhận lệnh chỉnh hướng trực tiếp từ chủ nhân.`,
            ]
          }
          onClose={() => setPeekBotId(null)}
          onSendIntervention={handleSendIntervention}
          onSetIdle={handleSetIdle}
          onOpenDirectChat={(botId) => {
            const raw = bots.find((b) => b.id === botId);
            if (raw) onSelectBotForChat(raw);
          }}
        />
      )}

      {showMeetingModal && (
        <MeetingMinutesModal
          departments={departments}
          bots={office3DBots}
          minutesList={minutesList}
          a2aTranscripts={a2aTranscripts}
          onStartMeeting={handleStartMeeting}
          onPushActionToKanban={handlePushActionToKanban}
          onClose={() => setShowMeetingModal(false)}
        />
      )}

      {showDoctorModal && (
        <SystemDoctorModal
          checks={doctorChecks}
          lastRepair={lastRepair}
          idleBotsCount={idleBotsCount}
          totalBotsCount={office3DBots.length}
          isCheckingHealth={isCheckingHealth}
          onRefreshChecks={() => void refreshDoctorHealth()}
          onRunSelfRepair={handleRunSelfRepair}
          onClose={() => setShowDoctorModal(false)}
        />
      )}

      {editingDept && (
        <EditDepartmentModal
          department={editingDept}
          canDelete={departments.length > 1}
          onSave={handleSaveDepartment}
          onDelete={handleDeleteDepartment}
          onClose={() => setEditingDeptId(null)}
        />
      )}

      {editingBot && (
        <EditBotModal
          bot={editingBot}
          departments={departments}
          onSave={handleSaveBotEdit}
          onRemoveBot={
            onRemoveBot && bots.length > 2
              ? (botId) => {
                  onRemoveBot(botId);
                  setSelectedBotId(null);
                }
              : undefined
          }
          onClose={() => setEditingBotId(null)}
        />
      )}

      {/* NEW DEPARTMENT MODAL */}
      {showNewDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDepartment}
            className="w-full max-w-md rounded-2xl border border-cyan-500/45 bg-[#041222] p-4 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Tạo Phòng Ban Mới (Không Giới Hạn)</h3>
              <button
                type="button"
                onClick={() => setShowNewDeptModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tên phòng ban</label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="VD: Phòng Livestream & Affiliate / Phòng Tài Chính"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mô tả nhiệm vụ</label>
                <input
                  type="text"
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  placeholder="Phụ trách kịch bản live, đối soát doanh thu, chăm sóc VIP..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Màu Hologram Neon</label>
                <div className="flex gap-2">
                  {NEON_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewDeptColor(c)}
                      className={`w-7 h-7 rounded-full border-2 ${
                        newDeptColor === c ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewDeptModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
              >
                Tạo phòng ban
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECRUIT NEW BOT MODAL */}
      {showNewBotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRecruitBot}
            className="w-full max-w-md rounded-2xl border border-cyan-500/45 bg-[#041222] p-4 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Tuyển Nhân Viên AI Mới (Tự Giãn 3D)</h3>
              <button
                type="button"
                onClick={() => setShowNewBotModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tên nhân viên AI</label>
                <input
                  type="text"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder="VD: Nova Ads"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nhãn Hologram 3D</label>
                <input
                  type="text"
                  value={newBotRoleBadge}
                  onChange={(e) => setNewBotRoleBadge(e.target.value)}
                  placeholder="AI Marketer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-slate-300 font-semibold block mb-1">Vai trò chuyên môn</label>
                <input
                  type="text"
                  value={newBotRoleTitle}
                  onChange={(e) => setNewBotRoleTitle(e.target.value)}
                  placeholder="VD: Chuyên gia chạy GMV Max & tối ưu ROAS"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phòng ban</label>
                <select
                  value={newBotDeptId}
                  onChange={(e) => setNewBotDeptId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Màn hình HUD 3D</label>
                <select
                  value={newBotScreenKind}
                  onChange={(e) => setNewBotScreenKind(e.target.value as HologramScreenKind)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="marketer">AI Marketer (Biểu đồ tăng trưởng)</option>
                  <option value="manager">AI Manager (KPI Gauges)</option>
                  <option value="researcher">AI Researcher (Nguyên tử & Lab)</option>
                  <option value="support">AI Customer Support (Chat & Mail)</option>
                  <option value="code">AI Engineer (Code & Laptop)</option>
                  <option value="commerce">AI Commerce (GMV TikTok Shop)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Dáng Hologram</label>
                <select
                  value={newBotAvatarStyle}
                  onChange={(e) => setNewBotAvatarStyle(e.target.value as AvatarStyle)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="female">Nữ Android (Marketer / CSKH)</option>
                  <option value="male">Nam Android (Manager / Engineer)</option>
                  <option value="android">Cyber Android tiêu chuẩn</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mô hình AI</label>
                <input
                  type="text"
                  value={newBotModel}
                  onChange={(e) => setNewBotModel(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewBotModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
              >
                Tuyển vào Văn Phòng 3D
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
