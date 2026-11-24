'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  computeBotDuty,
  generateStructuredMeetingMinutes,
  INITIAL_A2A_TRANSCRIPTS,
  INITIAL_APPROVALS,
  INITIAL_KANBAN_TASKS,
  runOfficeDoctor,
  runOfficeSelfRepair,
} from './officeStore';
import type {
  A2ATranscriptEntry,
  ApprovalItem,
  AvatarStyle,
  HandoffLink,
  HologramScreenKind,
  KanbanStatus,
  KanbanTask,
  MeetingMinutes,
  Office3DBot,
  OfficeDepartment,
  SelfRepairReport,
} from './types';
import {
  DEFAULT_INDUSTRY_ID,
  inferScreenKindFromBadge,
  type IndustryTemplate,
} from '@/data/industryTemplates';
import type { Bot, InboxEntry, WorkspaceMode } from '@/types/workspace';

export const ORG_STORAGE_KEY = 'tochuc_nvai_office3d_org_v4';

export const DEFAULT_DEPARTMENTS: OfficeDepartment[] = [
  {
    id: 'dept-exec',
    name: 'Ban Điều Hành Tổng',
    shortLabel: 'Điều hành',
    colorHex: '#00f5ff',
    description: 'Giám sát trạng thái, phân bổ việc chéo và tổng hợp báo cáo toàn hệ thống.',
  },
  {
    id: 'dept-commerce',
    name: 'Phòng Kinh Doanh & CSKH',
    shortLabel: 'Shop & CSKH',
    colorHex: '#34d399',
    description: 'Vận hành TikTok Shop, nghiên cứu KOC Affiliate, tư vấn chốt đơn và chăm sóc 24/7.',
  },
  {
    id: 'dept-growth',
    name: 'Phòng Tăng Trưởng & Marketing',
    shortLabel: 'Marketing & SEO',
    colorHex: '#38bdf8',
    description: 'SEO Top Google, SEO sàn TMĐT, kịch bản video ngắn và chuốt nội dung tự nhiên.',
  },
  {
    id: 'dept-tech',
    name: 'Phòng Kỹ Thuật & Sản Phẩm',
    shortLabel: 'Kỹ thuật & QA',
    colorHex: '#818cf8',
    description: 'Kiến trúc hệ thống, phát triển ứng dụng Web/Desktop và kiểm thử an toàn.',
  },
];

export const DEFAULT_HANDOFFS: HandoffLink[] = [
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

export const NEON_COLORS = ['#00f5ff', '#38bdf8', '#34d399', '#818cf8', '#f472b6', '#fbbf24'];

export const INITIAL_INBOX_ENTRIES: InboxEntry[] = [
  {
    id: 'inb-1',
    kind: 'handoff',
    title: 'Điều phối sáng toàn hệ thống (08:30)',
    body: 'Minh đã kiểm tra tính sẵn sàng của toàn bộ phòng ban. Lan & Hùng đang xử lý phân tích biên lợi nhuận Flash Sale và lọc 25 KOC mục tiêu.',
    senderName: 'Minh',
    senderBadge: 'AI Manager',
    targetLabels: ['@everyone'],
    timestamp: '08:30',
    unread: true,
    botId: 'bot-orbit',
  },
  {
    id: 'inb-2',
    kind: 'approval',
    title: 'Chờ phê duyệt: Flash Sale -18% cho 5 mã Hero SKU',
    body: 'Lan đã tính biên lợi nhuận ròng còn +24% sau phí sàn & hoa hồng Affiliate. Bot tự tạm dừng chờ bạn xác nhận trước khi bấm lưu.',
    senderName: 'Lan',
    senderBadge: 'AI Commerce',
    targetLabels: ['@Ban Điều Hành Tổng'],
    timestamp: '09:12',
    unread: true,
    botId: 'bot-sunny',
  },
];

export interface BotVisualOverride {
  roleBadge?: string;
  screenKind?: HologramScreenKind;
  avatarStyle?: AvatarStyle;
}

interface SavedOrgConfig {
  activeIndustryId?: string;
  departments: OfficeDepartment[];
  botDeptMap: Record<string, string>;
  botVisuals: Record<string, BotVisualOverride>;
  handoffs: HandoffLink[];
  tasks: KanbanTask[];
  approvals: ApprovalItem[];
  minutesList: MeetingMinutes[];
  a2aTranscripts: A2ATranscriptEntry[];
  inboxEntries?: InboxEntry[];
}

export function inferDefaultDepartmentId(bot: Bot): string {
  const cn = bot.codeName.toLowerCase();
  if (cn === 'minh' || cn === 'orbit' || bot.department === 'Ban Điều Hành Tổng') return 'dept-exec';
  if (
    bot.department === 'Phòng Tăng Trưởng & Marketing' ||
    bot.department === 'Marketing & SEO'
  ) {
    return 'dept-growth';
  }
  if (
    bot.department === 'Phòng Kinh Doanh & CSKH' ||
    bot.department === 'Shop TMĐT & TikTok' ||
    bot.department === 'Vận Hành & CSKH'
  ) {
    return 'dept-commerce';
  }
  return 'dept-tech';
}

export function inferRoleVisuals(bot: Bot): {
  badge: string;
  screen: HologramScreenKind;
  avatarStyle: AvatarStyle;
} {
  if (bot.roleBadge) {
    return {
      badge: bot.roleBadge,
      screen: inferScreenKindFromBadge(bot.roleBadge),
      avatarStyle: bot.avatarStyle || 'male',
    };
  }
  const cn = bot.codeName.toLowerCase();
  if (cn === 'minh' || cn.includes('orbit')) {
    return {
      badge: 'AI Manager',
      screen: 'manager',
      avatarStyle: bot.avatarStyle || 'male',
    };
  }
  if (cn === 'nam' || cn === 'trang' || cn.includes('listing') || cn.includes('echo')) {
    return {
      badge: 'AI Marketer',
      screen: 'marketer',
      avatarStyle: bot.avatarStyle || (cn === 'nam' ? 'male' : 'female'),
    };
  }
  if (cn === 'hung' || cn.includes('wren')) {
    return {
      badge: 'AI Researcher',
      screen: 'researcher',
      avatarStyle: bot.avatarStyle || 'male',
    };
  }
  if (cn === 'thao' || cn.includes('sale') || cn.includes('cskh')) {
    return {
      badge: 'AI Customer Support',
      screen: 'support',
      avatarStyle: bot.avatarStyle || 'female',
    };
  }
  if (cn === 'lan' || cn.includes('sunny')) {
    return {
      badge: 'AI Commerce',
      screen: 'commerce',
      avatarStyle: bot.avatarStyle || 'female',
    };
  }
  return {
    badge: 'AI Engineer',
    screen: 'code',
    avatarStyle: bot.avatarStyle || (cn === 'ha' || cn === 'linh' ? 'female' : 'male'),
  };
}

interface UseWorkspaceOrgParams {
  bots: Bot[];
  workspaceMode: WorkspaceMode;
  byokConfigured: boolean;
  onAddBot: (bot: Bot) => void;
  onUpdateBot: (botId: string, patch: Partial<Bot>) => void;
  onRemoveBot: (botId: string) => void;
  onUpdateBotDepartment: (botId: string, deptName: Bot['department']) => void;
}

export function useWorkspaceOrg({
  bots,
  workspaceMode,
  byokConfigured,
  onAddBot,
  onUpdateBot,
  onRemoveBot,
  onUpdateBotDepartment,
}: UseWorkspaceOrgParams) {
  const [activeIndustryId, setActiveIndustryId] = useState<string>(DEFAULT_INDUSTRY_ID);
  const [departments, setDepartments] = useState<OfficeDepartment[]>(DEFAULT_DEPARTMENTS);
  const [botDeptMap, setBotDeptMap] = useState<Record<string, string>>({});
  const [botVisuals, setBotVisuals] = useState<Record<string, BotVisualOverride>>({});
  const [handoffs, setHandoffs] = useState<HandoffLink[]>(DEFAULT_HANDOFFS);
  const [tasks, setTasks] = useState<KanbanTask[]>(INITIAL_KANBAN_TASKS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [minutesList, setMinutesList] = useState<MeetingMinutes[]>([]);
  const [a2aTranscripts, setA2ATranscripts] = useState<A2ATranscriptEntry[]>(INITIAL_A2A_TRANSCRIPTS);
  const [inboxEntries, setInboxEntries] = useState<InboxEntry[]>(INITIAL_INBOX_ENTRIES);

  // Live Duty States & Activity strings
  const [activeMeetingBotIds, setActiveMeetingBotIds] = useState<string[]>([]);
  const [activeA2ABotIds, setActiveA2ABotIds] = useState<string[]>([]);
  const [botLiveActivity, setBotLiveActivity] = useState<Record<string, string>>({
    'bot-orbit': 'Điều phối sáng toàn hệ thống (08:30)...',
    'bot-sunny': 'Kiểm tra biên lợi nhuận Flash Sale SKU',
    'bot-wren': 'Lọc 25 KOC mục tiêu ngành hàng chính',
  });
  const [botLogs, setBotLogs] = useState<Record<string, string[]>>({});
  const [lastRepair, setLastRepair] = useState<SelfRepairReport | null>(null);

  // Hydrate saved org from localStorage (v4 only — clean Vietnamese staff defaults)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ORG_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<SavedOrgConfig>;
      if (typeof parsed.activeIndustryId === 'string' && parsed.activeIndustryId) {
        setActiveIndustryId(parsed.activeIndustryId);
      }
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
      if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) setTasks(parsed.tasks);
      if (Array.isArray(parsed.approvals)) setApprovals(parsed.approvals);
      if (Array.isArray(parsed.minutesList)) setMinutesList(parsed.minutesList);
      if (Array.isArray(parsed.a2aTranscripts)) setA2ATranscripts(parsed.a2aTranscripts);
      if (Array.isArray(parsed.inboxEntries) && parsed.inboxEntries.length > 0) {
        setInboxEntries(parsed.inboxEntries);
      }
    } catch {
      // Ignore corrupted localStorage
    }
  }, []);

  // Persist org changes automatically
  useEffect(() => {
    try {
      const payload: SavedOrgConfig = {
        activeIndustryId,
        departments,
        botDeptMap,
        botVisuals,
        handoffs,
        tasks,
        approvals,
        minutesList,
        a2aTranscripts,
        inboxEntries,
      };
      window.localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    activeIndustryId,
    departments,
    botDeptMap,
    botVisuals,
    handoffs,
    tasks,
    approvals,
    minutesList,
    a2aTranscripts,
    inboxEntries,
  ]);

  const appendBotLog = useCallback((botId: string, line: string) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setBotLogs((prev) => ({
      ...prev,
      [botId]: [...(prev[botId] || []).slice(-18), `[${time}] ${line}`],
    }));
  }, []);

  const pushInbox = useCallback((entry: Omit<InboxEntry, 'id' | 'timestamp'>) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setInboxEntries((prev) => [
      {
        ...entry,
        id: `inb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: time,
      },
      ...prev.slice(0, 40),
    ]);
  }, []);

  // ── Switch Entire Office to Any of the 8 Industry Templates (1 Click) ─────
  const applyIndustryOrg = useCallback(
    (payload: {
      template: IndustryTemplate;
      departments: OfficeDepartment[];
      bots: Bot[];
      botDeptMap: Record<string, string>;
      handoffs: HandoffLink[];
    }) => {
      const lead = payload.bots[0];
      const second = payload.bots[1];
      setActiveIndustryId(payload.template.id);
      setDepartments(payload.departments);
      setBotDeptMap(payload.botDeptMap);
      setBotVisuals({});
      setHandoffs(payload.handoffs);
      setActiveMeetingBotIds([]);
      setActiveA2ABotIds([]);
      setBotLiveActivity(
        lead
          ? {
              [lead.id]: `Khởi tạo vận hành mẫu ${payload.template.shortName}`,
              ...(second ? { [second.id]: `Sẵn sàng nhận lệnh tại ${second.department}` } : {}),
            }
          : {}
      );
      setTasks(
        lead
          ? [
              {
                id: `task-${Date.now()}-1`,
                title: `Triển khai quy trình mẫu ${payload.template.name}`,
                description: payload.template.tagline,
                departmentId: payload.departments[0]?.id || 'dept-exec',
                assigneeBotId: lead.id,
                reviewerBotId: lead.id,
                status: 'in_progress',
                priority: 'P0',
                evidence: [],
                verification: { status: 'unverified' },
                createdAt: new Date().toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                updatedAt: new Date().toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              },
            ]
          : []
      );
      setApprovals([]);
      setA2ATranscripts([]);
      pushInbox({
        kind: 'handoff',
        title: `Đã chuyển sang mẫu ngành: ${payload.template.name}`,
        body: `Khởi tạo thành công ${payload.departments.length} phòng ban & ${payload.bots.length} nhân viên AI (${payload.bots.map((b) => b.name).join(', ')}). Gõ @Tên ngay phía dưới Văn phòng 3D để bắt đầu.`,
        senderName: lead?.name || 'Hệ thống',
        senderBadge: lead?.roleBadge || 'AI Manager',
        targetLabels: ['@everyone'],
        unread: true,
        botId: lead?.id,
      });
    },
    [pushInbox]
  );

  // Compute unified Office3DBot list with strict 5-priority Duty State Machine
  const officeBots: Office3DBot[] = useMemo(() => {
    const deptById = new Map(departments.map((d) => [d.id, d]));
    const firstBotPerDept = new Set<string>();
    const seenDepts = new Set<string>();

    return bots.map((bot) => {
      const mappedDeptId = botDeptMap[bot.id] || inferDefaultDepartmentId(bot);
      const dept = deptById.get(mappedDeptId) || departments[0];
      const baseVis = inferRoleVisuals(bot);
      const override = botVisuals[bot.id];
      const isLocked = workspaceMode === 'desktop_free' && !bot.isActive;

      if (!seenDepts.has(dept.id)) {
        seenDepts.add(dept.id);
        firstBotPerDept.add(bot.id);
      }

      const assignedInProgress = tasks.find(
        (t) => t.assigneeBotId === bot.id && t.status === 'in_progress'
      );
      const assignedReview = tasks.find(
        (t) =>
          (t.reviewerBotId === bot.id || t.assigneeBotId === bot.id) &&
          t.status === 'review' &&
          t.verification.status !== 'verified'
      );

      const meetingSet = new Set(activeMeetingBotIds);
      const a2aSet = new Set(activeA2ABotIds);
      const effectiveStatus =
        botLiveActivity[bot.id] && bot.isActive && !isLocked ? 'working' : bot.status;
      const duty = computeBotDuty(
        { id: bot.id, isActive: bot.isActive, isLocked, status: effectiveStatus },
        tasks,
        approvals,
        meetingSet,
        a2aSet
      );

      const currentTaskTitle =
        botLiveActivity[bot.id] || assignedInProgress?.title || assignedReview?.title;

      return {
        id: bot.id,
        name: bot.name,
        codeName: bot.codeName,
        roleBadge: override?.roleBadge || baseVis.badge,
        roleTitle: bot.roleTitle,
        departmentId: dept.id,
        departmentName: dept.name,
        accentHex: dept.colorHex,
        screenKind: override?.screenKind || baseVis.screen,
        avatarStyle: override?.avatarStyle || baseVis.avatarStyle,
        isActive: bot.isActive,
        isLocked,
        isLead: bot.isLead || baseVis.screen === 'manager' || firstBotPerDept.has(bot.id),
        status: bot.status,
        duty,
        currentTaskTitle,
        model: bot.model,
      };
    });
  }, [
    bots,
    departments,
    botDeptMap,
    botVisuals,
    workspaceMode,
    tasks,
    activeMeetingBotIds,
    activeA2ABotIds,
    botLiveActivity,
    approvals,
  ]);

  const pendingApprovalsCount = useMemo(
    () => approvals.filter((a) => a.status === 'pending').length,
    [approvals]
  );

  const unreadInboxCount = useMemo(
    () => inboxEntries.filter((e) => e.unread).length + pendingApprovalsCount,
    [inboxEntries, pendingApprovalsCount]
  );

  const doctorChecks = useMemo(
    () =>
      runOfficeDoctor({
        departments,
        botIds: bots.map((b) => b.id),
        botDeptMap,
        tasks,
        approvals,
        handoffs,
        byokConfigured,
        healthOk: true,
      }),
    [departments, bots, botDeptMap, tasks, approvals, handoffs, byokConfigured]
  );

  // ── Unlimited Department CRUD ──────────────────────────────────────────────
  const addDepartment = useCallback(
    (input: { name: string; description: string; colorHex: string }) => {
      const id = `dept-custom-${Date.now()}`;
      const newDept: OfficeDepartment = {
        id,
        name: input.name.trim(),
        shortLabel: input.name.trim().slice(0, 18),
        colorHex: input.colorHex,
        description:
          input.description.trim() || 'Phòng ban AI chuyên trách mở rộng linh hoạt.',
        isCustom: true,
      };
      setDepartments((prev) => [...prev, newDept]);
      return newDept;
    },
    []
  );

  const updateDepartment = useCallback(
    (deptId: string, patch: { name: string; description: string; colorHex: string }) => {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === deptId
            ? {
                ...d,
                name: patch.name.trim(),
                shortLabel: patch.name.trim().slice(0, 18),
                description: patch.description.trim(),
                colorHex: patch.colorHex,
              }
            : d
        )
      );
    },
    []
  );

  const deleteDepartment = useCallback(
    (deptId: string) => {
      if (departments.length <= 1) return;
      const fallbackDept = departments.find((d) => d.id !== deptId) || departments[0];
      setDepartments((prev) => prev.filter((d) => d.id !== deptId));
      setBotDeptMap((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((bId) => {
          if (next[bId] === deptId) next[bId] = fallbackDept.id;
        });
        return next;
      });
      setHandoffs((prev) =>
        prev.filter((h) => h.fromDeptId !== deptId && h.toDeptId !== deptId)
      );
    },
    [departments]
  );

  // ── Unlimited Bot CRUD ─────────────────────────────────────────────────────
  const addBotToDepartment = useCallback(
    (input: {
      name: string;
      roleBadge: string;
      roleTitle: string;
      departmentId: string;
      screenKind: HologramScreenKind;
      avatarStyle: AvatarStyle;
      model: string;
    }) => {
      const targetDept = departments.find((d) => d.id === input.departmentId) || departments[0];
      const newId = `bot-custom-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
      const newBot: Bot = {
        id: newId,
        name: input.name.trim(),
        codeName: input.name.trim().toLowerCase().replace(/\s+/g, '-'),
        roleTitle: input.roleTitle.trim() || `Chuyên viên ${targetDept.name}`,
        roleBadge: input.roleBadge.trim() || 'AI Specialist',
        department: targetDept.name,
        avatar: '🤖',
        avatarStyle: input.avatarStyle,
        badgeColor: 'cyan',
        status: workspaceMode === 'cloud_247' ? 'working' : 'ready',
        description: `Nhân viên AI thuộc ${targetDept.name}, vận hành theo chuẩn Tổ Chức Nhân Viên AI.`,
        skills: [targetDept.shortLabel, input.roleBadge.trim() || 'AI Specialist', 'Bàn giao A2A'],
        model: input.model || 'Claude 3.7 Sonnet',
        isActive: workspaceMode === 'cloud_247',
        priorityOrder: bots.length + 1,
      };
      onAddBot(newBot);
      setBotDeptMap((prev) => ({ ...prev, [newId]: targetDept.id }));
      setBotVisuals((prev) => ({
        ...prev,
        [newId]: {
          roleBadge: input.roleBadge.trim() || 'AI Specialist',
          screenKind: input.screenKind,
          avatarStyle: input.avatarStyle,
        },
      }));
      return newBot;
    },
    [departments, workspaceMode, bots.length, onAddBot]
  );

  const assignBotDepartment = useCallback(
    (botId: string, deptId: string) => {
      const dept = departments.find((d) => d.id === deptId);
      setBotDeptMap((prev) => ({ ...prev, [botId]: deptId }));
      if (dept) onUpdateBotDepartment(botId, dept.name);
    },
    [departments, onUpdateBotDepartment]
  );

  const editBotFull = useCallback(
    (
      botId: string,
      patch: {
        name: string;
        roleBadge: string;
        roleTitle: string;
        departmentId: string;
        screenKind: HologramScreenKind;
        avatarStyle: AvatarStyle;
        model: string;
      }
    ) => {
      const dept = departments.find((d) => d.id === patch.departmentId);
      setBotDeptMap((prev) => ({ ...prev, [botId]: patch.departmentId }));
      setBotVisuals((prev) => ({
        ...prev,
        [botId]: {
          roleBadge: patch.roleBadge,
          screenKind: patch.screenKind,
          avatarStyle: patch.avatarStyle,
        },
      }));
      onUpdateBot(botId, {
        name: patch.name,
        roleBadge: patch.roleBadge,
        roleTitle: patch.roleTitle,
        avatarStyle: patch.avatarStyle,
        model: patch.model,
        department: dept ? dept.name : undefined,
      });
    },
    [departments, onUpdateBot]
  );

  const removeBot = useCallback(
    (botId: string) => {
      onRemoveBot(botId);
    },
    [onRemoveBot]
  );

  // ── Deploy Ready-made Department + Bots Pack (from Ứng dụng đã xuất bản) ──
  const deployDepartmentPack = useCallback(
    (pack: {
      deptName: string;
      deptDesc: string;
      colorHex: string;
      bots: Array<{
        name: string;
        roleBadge: string;
        roleTitle: string;
        screenKind: HologramScreenKind;
        avatarStyle: AvatarStyle;
        model: string;
      }>;
    }) => {
      const existing = departments.find(
        (d) => d.name.toLowerCase() === pack.deptName.toLowerCase()
      );
      const dept =
        existing ||
        addDepartment({
          name: pack.deptName,
          description: pack.deptDesc,
          colorHex: pack.colorHex,
        });

      pack.bots.forEach((b) => {
        addBotToDepartment({
          ...b,
          departmentId: dept.id,
        });
      });

      pushInbox({
        kind: 'handoff',
        title: `Đã triển khai gói "${pack.deptName}" (${pack.bots.length} bot)`,
        body: `Phòng ban ${pack.deptName} cùng ${pack.bots.length} nhân viên AI đã được bổ sung trực tiếp vào Văn phòng 3D & Sơ đồ team.`,
        senderName: 'Hệ thống',
        senderBadge: 'Deploy Pack',
        targetLabels: [`@${pack.deptName}`],
        unread: true,
      });

      return dept;
    },
    [departments, addDepartment, addBotToDepartment, pushInbox]
  );

  // ── Kanban & Approval Handlers ─────────────────────────────────────────────
  const createKanbanTask = useCallback(
    (input: {
      title: string;
      description: string;
      departmentId: string;
      assigneeBotId: string;
      priority: 'P0' | 'P1' | 'P2';
    }) => {
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const newTask: KanbanTask = {
        id: `task-${Date.now()}`,
        title: input.title,
        description: input.description,
        departmentId: input.departmentId,
        assigneeBotId: input.assigneeBotId,
        status: 'in_progress',
        priority: input.priority,
        evidence: [],
        verification: { status: 'unverified' },
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [newTask, ...prev]);
      setBotLiveActivity((prev) => ({ ...prev, [input.assigneeBotId]: input.title }));
      appendBotLog(input.assigneeBotId, `Nhận thẻ Kanban [${input.priority}]: ${input.title}`);
    },
    [appendBotLog]
  );

  const moveKanbanTask = useCallback((taskId: string, nextStatus: KanbanStatus) => {
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus, updatedAt: now } : t))
    );
  }, []);

  const addTaskEvidence = useCallback((taskId: string, summary: string) => {
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              evidence: [
                ...t.evidence,
                { id: `ev-${Date.now()}`, kind: 'artifact', summary, createdAt: now },
              ],
              updatedAt: now,
            }
          : t
      )
    );
  }, []);

  const verifyKanbanTask = useCallback(
    (
      taskId: string,
      verdict: 'verified' | 'changes_requested',
      note: string,
      reviewerName = 'Minh (QA Độc lập)'
    ) => {
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: verdict === 'verified' ? 'done' : 'in_progress',
                verification: { status: verdict, reviewerName, note, verifiedAt: now },
                updatedAt: now,
              }
            : t
        )
      );
    },
    []
  );

  const decideApproval = useCallback(
    (approvalId: string, decision: 'approved' | 'rejected') => {
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const target = approvals.find((a) => a.id === approvalId);
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === approvalId
            ? {
                ...a,
                status: decision,
                decidedAt: now,
                decisionNote:
                  decision === 'approved'
                    ? 'Chủ nhân đã phê duyệt cho bot thực thi.'
                    : 'Chủ nhân từ chối — bot hủy lệnh an toàn.',
              }
            : a
        )
      );
      if (target) {
        appendBotLog(
          target.requestedByBotId,
          decision === 'approved'
            ? `✅ Chủ nhân đã PHÊ DUYỆT: "${target.title}"`
            : `⛔ Chủ nhân đã TỪ CHỐI: "${target.title}"`
        );
        pushInbox({
          kind: 'approval',
          title:
            decision === 'approved'
              ? `Đã duyệt: ${target.title}`
              : `Đã từ chối: ${target.title}`,
          body:
            decision === 'approved'
              ? `${target.requestedByName} đã nhận lệnh tiếp tục thực thi an toàn.`
              : `${target.requestedByName} đã dừng lệnh theo chỉ đạo.`,
          senderName: 'Chủ nhân',
          senderBadge: 'Command Control',
          unread: false,
        });
      }
    },
    [approvals, appendBotLog, pushInbox]
  );

  // ── Round-table Meeting & Self-Repair ──────────────────────────────────────
  const startRoundtableMeeting = useCallback(
    (topic: string, participantIds: string[]) => {
      const participants = officeBots.filter((b) => participantIds.includes(b.id));
      const minutes = generateStructuredMeetingMinutes(topic, participants, departments);
      setMinutesList((prev) => [minutes, ...prev]);
      setActiveMeetingBotIds(participantIds);
      participants.forEach((b) => {
        setBotLiveActivity((prev) => ({ ...prev, [b.id]: `Họp: ${topic}` }));
        appendBotLog(b.id, `Tham gia họp bàn tròn: "${topic}" → Đã xuất biên bản tự động.`);
      });
      pushInbox({
        kind: 'meeting',
        title: `Biên bản họp: ${topic}`,
        body: `${participants.map((p) => p.name).join(', ')} đã chốt ${minutes.decisions.length} quyết định & ${minutes.actionItems.length} đầu việc hành động.`,
        senderName: 'Họp Bàn Tròn',
        senderBadge: `${participants.length} bot`,
        unread: true,
      });
      window.setTimeout(() => setActiveMeetingBotIds([]), 7500);
      return minutes;
    },
    [officeBots, departments, appendBotLog, pushInbox]
  );

  const pushActionItemToKanban = useCallback(
    (minutesId: string, itemId: string) => {
      const targetMin = minutesList.find((m) => m.id === minutesId);
      const item = targetMin?.actionItems.find((a) => a.id === itemId);
      if (!targetMin || !item || item.pushedToKanban) return;
      createKanbanTask({
        title: item.title,
        description: `Sinh tự động từ biên bản họp "${targetMin.topic}" lúc ${targetMin.createdAt}.`,
        departmentId: item.departmentId,
        assigneeBotId: item.ownerBotId,
        priority: 'P1',
      });
      setMinutesList((prev) =>
        prev.map((m) =>
          m.id === minutesId
            ? {
                ...m,
                actionItems: m.actionItems.map((a) =>
                  a.id === itemId ? { ...a, pushedToKanban: true } : a
                ),
              }
            : m
        )
      );
    },
    [minutesList, createKanbanTask]
  );

  const runSelfRepair = useCallback(() => {
    const result = runOfficeSelfRepair({
      departments,
      botIds: bots.map((b) => b.id),
      botDeptMap,
      tasks,
      handoffs,
    });
    setBotDeptMap(result.botDeptMap);
    setTasks(result.tasks);
    setHandoffs(result.handoffs);
    setLastRepair(result.report);
  }, [departments, bots, botDeptMap, tasks, handoffs]);

  const setBotIdle = useCallback(
    (botId: string) => {
      setBotLiveActivity((prev) => {
        const next = { ...prev };
        delete next[botId];
        return next;
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.assigneeBotId === botId && t.status === 'in_progress'
            ? { ...t, status: 'backlog' }
            : t
        )
      );
      appendBotLog(botId, 'Đã chuyển về trạng thái Nghỉ ngơi (0 token).');
    },
    [appendBotLog]
  );

  const markAllInboxRead = useCallback(() => {
    setInboxEntries((prev) => prev.map((e) => ({ ...e, unread: false })));
  }, []);

  return {
    activeIndustryId,
    departments,
    officeBots,
    handoffs,
    setHandoffs,
    tasks,
    approvals,
    minutesList,
    a2aTranscripts,
    setA2ATranscripts,
    inboxEntries,
    pushInbox,
    markAllInboxRead,
    unreadInboxCount,
    pendingApprovalsCount,
    activeMeetingBotIds,
    activeA2ABotIds,
    setActiveA2ABotIds,
    botLiveActivity,
    setBotLiveActivity,
    botLogs,
    appendBotLog,
    doctorChecks,
    lastRepair,
    applyIndustryOrg,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addBotToDepartment,
    assignBotDepartment,
    editBotFull,
    removeBot,
    deployDepartmentPack,
    createKanbanTask,
    moveKanbanTask,
    addTaskEvidence,
    verifyKanbanTask,
    decideApproval,
    startRoundtableMeeting,
    pushActionItemToKanban,
    runSelfRepair,
    setBotIdle,
  };
}

export type WorkspaceOrgState = ReturnType<typeof useWorkspaceOrg>;
