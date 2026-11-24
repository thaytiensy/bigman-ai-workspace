/**
 * ĐỊNH NGHĨA KIỂU DỮ LIỆU TỔ CHỨC NHÂN VIÊN AI (/workspace)
 */

export type WorkspaceMode = 'desktop_free' | 'cloud_247';

export type WorkspaceTab =
  | 'inbox'
  | 'deliverables'
  | 'office3d'
  | 'roster'
  | 'room'
  | 'routines'
  | 'apps'
  | 'files';

export type WorkspaceUiTheme = 'light' | 'dark';

export interface TeamDeliverableFile {
  id: string;
  title: string;
  fileName: string;
  format: 'csv' | 'doc';
  mimeType: string;
  content: string;
  createdByName: string;
  createdByRole: string;
  botId?: string;
  summary: string;
  createdAt: string;
}

/**
 * Hỗ trợ 4 phòng ban chuẩn mặc định + mở rộng không giới hạn tên phòng ban tùy biến.
 */
export type DefaultBotDepartment =
  | 'Shop TMĐT & TikTok'
  | 'Marketing & SEO'
  | 'Lập Trình & QA'
  | 'Vận Hành & CSKH';

export type BotDepartment = 'Tất cả' | DefaultBotDepartment | (string & {});

export interface Bot {
  id: string;
  name: string;
  codeName: string;
  roleTitle: string;
  roleBadge?: string;
  department: Exclude<BotDepartment, 'Tất cả'>;
  avatar: string;
  avatarStyle?: 'female' | 'male' | 'android';
  badgeColor: string;
  status: 'ready' | 'working' | 'offline';
  description: string;
  skills: string[];
  model: string;
  isActive: boolean;
  priorityOrder: number;
  isLead?: boolean;
}

export interface InboxEntry {
  id: string;
  kind: 'command' | 'reply' | 'approval' | 'meeting' | 'handoff';
  title: string;
  body: string;
  senderName: string;
  senderBadge?: string;
  targetLabels?: string[];
  timestamp: string;
  unread?: boolean;
  botId?: string;
}

export interface ChatMessage {
  id: string;
  senderType: 'user' | 'bot' | 'system';
  senderId?: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  content: string;
  timestamp: string;
  mentions?: string[];
  isStreaming?: boolean;
  delegatedTo?: string; // Tên bot được bàn giao việc chéo
  metadata?: {
    latencyMs?: number;
    tokensUsed?: number;
    industryCategory?: string;
  };
}

export interface RoutineItem {
  id: string;
  title: string;
  botId: string;
  botName: string;
  botAvatar: string;
  department: string;
  timeOfDay: 'morning' | 'night' | 'hourly';
  timeLabel: string;
  cronExpression: string;
  description: string;
  promptPayload: string;
  isEnabled: boolean;
  runOnCloud: boolean;
  lastStatus: 'success' | 'idle' | 'failed';
  lastRunText: string;
}

export type PricingBillingMode = 'byok' | 'all_in_one';
export type PricingBillingCycle = 'monthly' | 'yearly';

export interface PricingPlan {
  id: 'starter' | 'pro' | 'business' | 'desktop_pro';
  name: string;
  subtitle: string;
  isHero?: boolean;
  badge?: string;
  priceMonthlyByok: number;
  priceMonthlyAllInOne: number;
  priceYearlyByok: number;
  priceYearlyAllInOne: number;
  monthlyCredits: number;
  maxBots: string;
  maxRooms: string;
  maxRoutines: string;
  cloudCron: boolean;
  supportLevel: string;
  features: string[];
}
