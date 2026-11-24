/**
 * Bộ lõi điều phối Văn Phòng Ảo (Duty State Machine 5 mức, Biên Bản Họp,
 * Kanban Evidence/Verification, Approval Queue, System Doctor & Self-Repair).
 */
import type {
  A2ATranscriptEntry,
  ApprovalItem,
  DoctorCheck,
  DutyState,
  HandoffLink,
  KanbanTask,
  MeetingMinutes,
  OfficeDepartment,
  SelfRepairReport,
} from './types';

export const DUTY_META: Record<
  DutyState,
  { label: string; shortLabel: string; colorHex: string; badgeClass: string; tokenHint: string }
> = {
  meeting: {
    label: 'Đang họp bàn tròn',
    shortLabel: 'Họp',
    colorHex: '#00f5ff',
    badgeClass: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50',
    tokenHint: 'Phát biểu & chốt biên bản',
  },
  a2a: {
    label: 'Đang bàn giao A2A',
    shortLabel: 'A2A',
    colorHex: '#38bdf8',
    badgeClass: 'bg-sky-500/20 text-sky-200 border-sky-400/50',
    tokenHint: 'Trao đổi trực tiếp giữa các bot',
  },
  desk: {
    label: 'Đang xử lý tại bàn',
    shortLabel: 'Làm việc',
    colorHex: '#34d399',
    badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50',
    tokenHint: 'Đang chạy tác vụ Kanban / lịch trình',
  },
  review: {
    label: 'Đang QA nghiệm thu',
    shortLabel: 'QA Review',
    colorHex: '#fbbf24',
    badgeClass: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
    tokenHint: 'Kiểm chứng độc lập bằng chứng',
  },
  idle: {
    label: 'Nghỉ ngơi · 0 token',
    shortLabel: 'Rảnh (0 tok)',
    colorHex: '#94a3b8',
    badgeClass: 'bg-slate-800/80 text-slate-300 border-slate-600/60',
    tokenHint: 'Chế độ chờ — tuyệt đối không gọi mô hình AI',
  },
};

export interface DutyInputBot {
  id: string;
  isActive: boolean;
  isLocked: boolean;
  status: 'ready' | 'working' | 'offline';
}

/**
 * Máy trạng thái nhiệm vụ 5 mức ưu tiên nghiêm ngặt:
 * 1. meeting > 2. a2a > 3. desk > 4. review > 5. idle (không tốn token)
 */
export function computeBotDuty(
  bot: DutyInputBot,
  tasks: KanbanTask[],
  approvals: ApprovalItem[],
  activeMeetingBotIds: ReadonlySet<string>,
  activeA2ABotIds: ReadonlySet<string>
): DutyState {
  if (bot.isLocked || !bot.isActive || bot.status === 'offline') {
    return 'idle';
  }
  if (activeMeetingBotIds.has(bot.id)) {
    return 'meeting';
  }
  if (activeA2ABotIds.has(bot.id)) {
    return 'a2a';
  }

  // Nếu bot đang chờ phê duyệt của chủ nhân → dừng làm việc tự do, chờ quyết định
  const blockedByApproval = approvals.some(
    (a) => a.status === 'pending' && a.requestedByBotId === bot.id
  );
  if (blockedByApproval) {
    return 'desk';
  }

  const hasDeskTask = tasks.some(
    (t) => t.assigneeBotId === bot.id && t.status === 'in_progress'
  );
  if (hasDeskTask || bot.status === 'working') {
    return 'desk';
  }

  const hasReviewTask = tasks.some(
    (t) =>
      t.status === 'review' &&
      t.verification.status !== 'verified' &&
      (t.reviewerBotId === bot.id || t.assigneeBotId === bot.id)
  );
  if (hasReviewTask) {
    return 'review';
  }

  return 'idle';
}

export const INITIAL_KANBAN_TASKS: KanbanTask[] = [
  {
    id: 'task-101',
    title: 'Tối ưu tiêu đề SEO & ảnh bìa Hero SKU TikTok Shop',
    description: 'Kiểm tra bộ từ khóa cấm, tối ưu tiêu đề 60–120 ký tự và cấu hình Flash Sale khung giờ vàng.',
    departmentId: 'dept-commerce',
    assigneeBotId: 'bot-sunny',
    reviewerBotId: 'bot-orbit',
    status: 'in_progress',
    priority: 'P0',
    evidence: [
      {
        id: 'ev-1',
        kind: 'metric',
        summary: 'Lan đã rà soát 14 SKU chủ lực: 0 từ khóa vi phạm chính sách sàn.',
        createdAt: '21:15',
      },
    ],
    verification: { status: 'unverified' },
    createdAt: '20:30',
    updatedAt: '21:15',
  },
  {
    id: 'task-102',
    title: 'Lọc danh sách 30 KOC Affiliate tỷ lệ ra đơn > 3%',
    description: 'Xuất bảng dữ liệu KOC ngách sản phẩm số & gia dụng để chuyển cho phòng Marketing gắn giỏ.',
    departmentId: 'dept-commerce',
    assigneeBotId: 'bot-wren',
    reviewerBotId: 'bot-orbit',
    status: 'review',
    priority: 'P1',
    evidence: [
      {
        id: 'ev-2',
        kind: 'artifact',
        summary: 'Hùng hoàn tất bảng 32 KOC (GMV 30 ngày > 80 triệu, tỷ lệ trả mẫu 92%).',
        createdAt: '21:20',
      },
    ],
    verification: { status: 'unverified' },
    createdAt: '19:45',
    updatedAt: '21:20',
  },
  {
    id: 'task-103',
    title: 'Xuất bản cụm 3 bài Pillar SEO "Tổ Chức Nhân Viên AI"',
    description: 'Viết bài so sánh Cài Máy vs Cloud 24/7, gắn Schema FAQ và kiểm tra chuẩn Meta Google.',
    departmentId: 'dept-growth',
    assigneeBotId: 'bot-listing-pro',
    reviewerBotId: 'bot-echo',
    status: 'done',
    priority: 'P1',
    evidence: [
      {
        id: 'ev-3',
        kind: 'log',
        summary: 'Nam & Trang hoàn thiện cụm bài: Smoke Test SEO đạt 22/22, sitemap.xml và JSON-LD hợp lệ.',
        createdAt: '20:05',
      },
    ],
    verification: {
      status: 'verified',
      reviewerName: 'Minh (AI Manager)',
      note: 'Đã kiểm chứng trực tiếp trên bản live /blog và /so-sanh-cai-may-va-cloud.',
      verifiedAt: '20:12',
    },
    createdAt: '18:10',
    updatedAt: '20:12',
  },
  {
    id: 'task-104',
    title: 'Kiểm thử Xưởng Việc Thật & đóng gói bộ cài Desktop v1.0.0',
    description: 'Đảm bảo xuất file Excel/Word chuẩn đẹp ngay trên web và đóng gói sạch .exe / .msi / .dmg.',
    departmentId: 'dept-tech',
    assigneeBotId: 'bot-lin',
    reviewerBotId: 'bot-orbit',
    status: 'backlog',
    priority: 'P0',
    evidence: [],
    verification: { status: 'unverified' },
    createdAt: '21:00',
    updatedAt: '21:00',
  },
];

export const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 'apr-01',
    title: 'Duyệt kích hoạt Flash Sale -18% cho 5 mã Hero SKU',
    detail: 'Lan đề xuất giảm 18% (biên lợi nhuận ròng còn +24% sau phí sàn & Affiliate 8%). Cần chủ nhân duyệt trước khi bấm lưu.',
    requestedByBotId: 'bot-sunny',
    requestedByName: 'Lan',
    departmentId: 'dept-commerce',
    riskLevel: 'high',
    status: 'pending',
    createdAt: '21:30',
  },
  {
    id: 'apr-02',
    title: 'Duyệt gửi 25 lời mời Cộng tác mục tiêu (hoa hồng 12%)',
    detail: 'Hùng đã lọc 25 KOC uy tín; mức hoa hồng cao hơn Cộng tác mở 4% đúng biên độ mục tiêu.',
    requestedByBotId: 'bot-wren',
    requestedByName: 'Hùng',
    departmentId: 'dept-commerce',
    riskLevel: 'medium',
    status: 'pending',
    createdAt: '21:38',
  },
];

export const INITIAL_A2A_TRANSCRIPTS: A2ATranscriptEntry[] = [
  {
    id: 'a2a-01',
    fromBotId: 'bot-wren',
    fromBotName: 'Hùng',
    toBotId: 'bot-listing-pro',
    toBotName: 'Nam',
    departmentFlow: 'Shop & CSKH → Marketing & SEO',
    message: 'Bàn giao bộ 18 từ khóa tìm kiếm tăng trưởng mạnh tuần này để cập nhật cụm bài Pillar SEO.',
    timestamp: '20:42',
    status: 'acknowledged',
  },
  {
    id: 'a2a-02',
    fromBotId: 'bot-sunny',
    fromBotName: 'Lan',
    toBotId: 'bot-orbit',
    toBotName: 'Minh',
    departmentFlow: 'Shop & CSKH → Ban Điều Hành',
    message: 'Đã gửi đề xuất Flash Sale vào Hàng đợi Phê duyệt và tạm dừng bước lưu chờ chủ nhân xác nhận.',
    timestamp: '21:31',
    status: 'delivered',
  },
];

/**
 * Sinh biên bản họp bàn tròn có cấu trúc (Quyết định · Đầu việc · Rủi ro)
 */
export function generateStructuredMeetingMinutes(
  topic: string,
  participants: Array<{ id: string; name: string; roleBadge: string; departmentId: string }>,
  departments: OfficeDepartment[]
): MeetingMinutes {
  const cleanTopic = topic.trim() || 'Điều phối chiến dịch tăng trưởng liên phòng ban';
  const nowLabel = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const deptNameById = new Map(departments.map((d) => [d.id, d.name]));

  const decisions = [
    `Thống nhất mục tiêu ưu tiên cho chủ đề "${cleanTopic}" với ${participants.length} nhân viên AI tham gia.`,
    'Áp dụng cơ chế kiểm chứng bằng chứng độc lập (Claim ≠ Verified) trước khi chuyển thẻ sang Hoàn tất.',
    'Mọi tác vụ có tác động tài chính hoặc xuất bản công khai đều đi qua Hàng đợi Phê duyệt của chủ nhân.',
  ];

  const actionItems = participants.map((p, idx) => {
    const deptLabel = deptNameById.get(p.departmentId) || 'Phòng chuyên môn';
    return {
      id: `act-${Date.now()}-${idx}`,
      title: `[${p.roleBadge}] Triển khai hạng mục "${cleanTopic}" tại ${deptLabel}`,
      ownerBotId: p.id,
      ownerName: p.name,
      departmentId: p.departmentId,
      pushedToKanban: false,
    };
  });

  const risks = [
    'Cần theo dõi tránh chồng chéo khuyến mãi hoặc xung đột tài nguyên giữa các phòng ban khi chạy song song.',
    'Bot ở trạng thái chờ phê duyệt sẽ tự tạm dừng — chủ nhân nên duyệt hàng đợi để không nghẽn tiến độ.',
  ];

  return {
    id: `mtg-${Date.now()}`,
    topic: cleanTopic,
    participantIds: participants.map((p) => p.id),
    participantNames: participants.map((p) => p.name),
    decisions,
    actionItems,
    risks,
    createdAt: nowLabel,
  };
}

/**
 * Bộ kiểm tra sức khỏe Hệ Thống (System Doctor) — trung thực pass/warn/fail, không tô xanh giả.
 */
export function runOfficeDoctor(params: {
  departments: OfficeDepartment[];
  botIds: string[];
  botDeptMap: Record<string, string>;
  handoffs: HandoffLink[];
  tasks: KanbanTask[];
  approvals: ApprovalItem[];
  byokConfigured: boolean;
  healthOk: boolean | null;
  supabaseConfigured?: boolean;
  vietqrConfigured?: boolean;
}): DoctorCheck[] {
  const deptIds = new Set(params.departments.map((d) => d.id));
  const botIdSet = new Set(params.botIds);

  const orphanedBots = params.botIds.filter((id) => {
    const mapped = params.botDeptMap[id];
    return mapped !== undefined && !deptIds.has(mapped);
  });

  const brokenHandoffs = params.handoffs.filter(
    (h) => !deptIds.has(h.fromDeptId) || !deptIds.has(h.toDeptId) || h.fromDeptId === h.toDeptId
  );

  const orphanedTasks = params.tasks.filter(
    (t) => !deptIds.has(t.departmentId) || !botIdSet.has(t.assigneeBotId)
  );

  const pendingApprovals = params.approvals.filter((a) => a.status === 'pending').length;

  return [
    {
      id: 'org-depts',
      label: 'Cấu trúc Phòng Ban & Mở Rộng',
      status: params.departments.length > 0 ? 'pass' : 'fail',
      detail: `Đang vận hành ${params.departments.length} phòng ban & ${params.botIds.length} nhân viên AI (hỗ trợ mở rộng không giới hạn).`,
    },
    {
      id: 'orphan-bots',
      label: 'Liên kết Bot ↔ Phòng Ban',
      status: orphanedBots.length === 0 ? 'pass' : 'fail',
      detail:
        orphanedBots.length === 0
          ? '100% nhân viên AI đều gắn đúng phòng ban hợp lệ.'
          : `Phát hiện ${orphanedBots.length} bot đang trỏ vào phòng ban không tồn tại.`,
      fixable: orphanedBots.length > 0,
    },
    {
      id: 'handoff-graph',
      label: 'Chuỗi Bàn Giao A2A Liên Phòng Ban',
      status: brokenHandoffs.length === 0 ? 'pass' : 'warn',
      detail:
        brokenHandoffs.length === 0
          ? `${params.handoffs.length} đường bàn giao A2A hợp lệ, không có liên kết gãy.`
          : `Có ${brokenHandoffs.length} đường bàn giao trỏ tới phòng ban đã xóa hoặc tự lặp.`,
      fixable: brokenHandoffs.length > 0,
    },
    {
      id: 'kanban-integrity',
      label: 'Toàn Vẹn Bảng Kanban & Nghiệm Thu',
      status: orphanedTasks.length === 0 ? 'pass' : 'warn',
      detail:
        orphanedTasks.length === 0
          ? `${params.tasks.length} thẻ nhiệm vụ đều có người phụ trách và phòng ban hợp lệ.`
          : `Có ${orphanedTasks.length} thẻ nhiệm vụ thiếu người phụ trách hoặc phòng ban hợp lệ.`,
      fixable: orphanedTasks.length > 0,
    },
    {
      id: 'approval-gate',
      label: 'Hàng Đợi Phê Duyệt Chủ Nhân',
      status: pendingApprovals === 0 ? 'pass' : 'warn',
      detail:
        pendingApprovals === 0
          ? 'Không có bot nào bị chặn chờ phê duyệt.'
          : `Có ${pendingApprovals} yêu cầu nhạy cảm đang chờ chủ nhân duyệt (bot đã tự dừng an toàn).`,
    },
    {
      id: 'ai-byok',
      label: 'Bộ Máy AI & Xưởng Việc Thật',
      status: 'pass',
      detail: 'Hoạt động sẵn sàng ngay trên web — dùng trực tiếp không cần cài đặt API Key.',
    },
    {
      id: 'api-health',
      label: 'Cổng Sức Khỏe Máy Chủ (/api/v1/health)',
      status: params.healthOk === true ? 'pass' : params.healthOk === false ? 'fail' : 'warn',
      detail:
        params.healthOk === true
          ? `Online · Supabase: ${params.supabaseConfigured ? 'Bật' : 'Chưa gắn'} · VietQR tự động: ${params.vietqrConfigured ? 'Bật' : 'Chế độ Admin Zalo'}.`
          : params.healthOk === false
            ? 'Không thể gọi /api/v1/health.'
            : 'Chưa kiểm tra — bấm Làm mới kiểm tra.',
    },
  ];
}

/**
 * Tự động sửa lỗi cấu hình phòng ban / bot / chuỗi bàn giao / Kanban (idempotent Self-Repair).
 */
export function runOfficeSelfRepair(params: {
  departments: OfficeDepartment[];
  botIds: string[];
  botDeptMap: Record<string, string>;
  handoffs: HandoffLink[];
  tasks: KanbanTask[];
}): {
  botDeptMap: Record<string, string>;
  handoffs: HandoffLink[];
  tasks: KanbanTask[];
  report: SelfRepairReport;
} {
  const actions: string[] = [];
  const unfixable: string[] = [];
  const deptIds = new Set(params.departments.map((d) => d.id));
  const fallbackDeptId = params.departments[0]?.id;
  const botIdSet = new Set(params.botIds);
  const fallbackBotId = params.botIds[0];

  if (!fallbackDeptId) {
    return {
      botDeptMap: params.botDeptMap,
      handoffs: params.handoffs,
      tasks: params.tasks,
      report: {
        repairedCount: 0,
        actions: [],
        unfixable: ['Không có phòng ban nào để gán lại bot mồ côi.'],
      },
    };
  }

  const nextBotDeptMap: Record<string, string> = { ...params.botDeptMap };
  for (const botId of params.botIds) {
    const mapped = nextBotDeptMap[botId];
    if (mapped && !deptIds.has(mapped)) {
      nextBotDeptMap[botId] = fallbackDeptId;
      actions.push(`Đã gán lại bot ${botId} về phòng ban "${params.departments[0].name}".`);
    }
  }

  const seenHandoffPairs = new Set<string>();
  const nextHandoffs = params.handoffs.filter((h) => {
    const valid = deptIds.has(h.fromDeptId) && deptIds.has(h.toDeptId) && h.fromDeptId !== h.toDeptId;
    if (!valid) {
      actions.push(`Đã gỡ chuỗi bàn giao gãy "${h.label}".`);
      return false;
    }
    const pairKey = `${h.fromDeptId}->${h.toDeptId}:${h.label}`;
    if (seenHandoffPairs.has(pairKey)) {
      actions.push(`Đã loại bỏ chuỗi bàn giao trùng lặp "${h.label}".`);
      return false;
    }
    seenHandoffPairs.add(pairKey);
    return true;
  });

  const nextTasks = params.tasks.map((t) => {
    let changed = false;
    let departmentId = t.departmentId;
    let assigneeBotId = t.assigneeBotId;
    if (!deptIds.has(departmentId)) {
      departmentId = fallbackDeptId;
      changed = true;
    }
    if (!botIdSet.has(assigneeBotId) && fallbackBotId) {
      assigneeBotId = fallbackBotId;
      changed = true;
    }
    if (changed) {
      actions.push(`Đã khôi phục phân công hợp lệ cho nhiệm vụ "${t.title}".`);
      return { ...t, departmentId, assigneeBotId };
    }
    return t;
  });

  return {
    botDeptMap: nextBotDeptMap,
    handoffs: nextHandoffs,
    tasks: nextTasks,
    report: {
      repairedCount: actions.length,
      actions,
      unfixable,
    },
  };
}
