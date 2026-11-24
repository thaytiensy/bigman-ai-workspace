/**
 * Kiểu dữ liệu cho Văn Phòng 3D Hologram "Tổ Chức Nhân Viên AI".
 * Kế thừa kiến trúc modular + Duty State Machine 5 mức + Kanban/Evidence/Approval/Doctor
 * từ Hermes Virtual Office (MIT License) và mở rộng hoàn chỉnh cho Tổ Chức Nhân Viên AI.
 */

export type HologramScreenKind =
  | 'manager'
  | 'marketer'
  | 'researcher'
  | 'support'
  | 'code'
  | 'commerce';

export type AvatarStyle = 'female' | 'male' | 'android';

export type CameraPreset = 'hero' | 'table' | 'overview' | 'skyline';

/** 3 chế độ hiển thị chuẩn (3D WebGL / Kanban Nhiệm Vụ / Sơ đồ 2D nhẹ máy) */
export type OfficeViewMode = '3d' | 'kanban' | 'floor2d';

/**
 * Máy trạng thái nhiệm vụ 5 mức ưu tiên nghiêm ngặt:
 * 1. meeting (Đang họp bàn tròn)
 * 2. a2a (Đang bàn giao chéo A2A — tạm dừng việc bàn)
 * 3. desk (Đang xử lý nhiệm vụ / lịch chạy tại bàn)
 * 4. review (Đang kiểm tra / QA nghiệm thu cho đồng đội)
 * 5. idle (Rảnh rỗi thư giãn — tuyệt đối 0 token)
 */
export type DutyState = 'meeting' | 'a2a' | 'desk' | 'review' | 'idle';

export interface OfficeDepartment {
  id: string;
  name: string;
  shortLabel: string;
  colorHex: string;
  description: string;
  isCustom?: boolean;
}

export interface HandoffLink {
  id: string;
  fromDeptId: string;
  toDeptId: string;
  label: string;
}

export interface Office3DBot {
  id: string;
  name: string;
  codeName: string;
  roleBadge: string;
  roleTitle: string;
  departmentId: string;
  departmentName: string;
  accentHex: string;
  screenKind: HologramScreenKind;
  avatarStyle: AvatarStyle;
  isActive: boolean;
  isLocked: boolean;
  isLead?: boolean;
  status: 'ready' | 'working' | 'offline';
  duty: DutyState;
  currentTaskTitle?: string;
  model?: string;
}

export interface HandoffPulse {
  fromBotId: string;
  toBotId: string;
  colorHex: string;
  label?: string;
}

export interface Office3DCallbacks {
  onSelectBot?: (botId: string) => void;
  onSelectLockedBot?: (botId: string) => void;
  onPeekBot?: (botId: string) => void;
  onClickMeetingTable?: () => void;
  onSceneReady?: () => void;
}

export type KanbanStatus = 'backlog' | 'in_progress' | 'review' | 'done';

export interface TaskEvidence {
  id: string;
  kind: 'log' | 'artifact' | 'metric' | 'link';
  summary: string;
  createdAt: string;
}

export interface TaskVerification {
  status: 'unverified' | 'verified' | 'changes_requested';
  reviewerName?: string;
  note?: string;
  verifiedAt?: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  assigneeBotId: string;
  reviewerBotId?: string;
  status: KanbanStatus;
  priority: 'P0' | 'P1' | 'P2';
  evidence: TaskEvidence[];
  verification: TaskVerification;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  detail: string;
  requestedByBotId: string;
  requestedByName: string;
  departmentId: string;
  riskLevel: 'high' | 'medium';
  status: 'pending' | 'approved' | 'rejected';
  decisionNote?: string;
  createdAt: string;
  decidedAt?: string;
}

export interface A2ATranscriptEntry {
  id: string;
  fromBotId: string;
  fromBotName: string;
  toBotId: string;
  toBotName: string;
  departmentFlow: string;
  message: string;
  timestamp: string;
  status: 'delivered' | 'acknowledged';
}

export interface MeetingActionItem {
  id: string;
  title: string;
  ownerBotId: string;
  ownerName: string;
  departmentId: string;
  pushedToKanban?: boolean;
}

export interface MeetingMinutes {
  id: string;
  topic: string;
  participantIds: string[];
  participantNames: string[];
  decisions: string[];
  actionItems: MeetingActionItem[];
  risks: string[];
  createdAt: string;
}

export interface DoctorCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
  fixable?: boolean;
}

export interface SelfRepairReport {
  repairedCount: number;
  actions: string[];
  unfixable: string[];
}
