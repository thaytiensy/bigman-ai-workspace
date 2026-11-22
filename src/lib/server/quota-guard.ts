/**
 * ==============================================================================
 * MODULE QUOTA GUARD - CHỐT CHẶN HẠN NGẠCH PHÍA MÁY CHỦ (HARD QUOTA GUARD)
 * DỰ ÁN: TỔ CHỨC NHÂN VIÊN AI
 * LIÊN HỆ: Zalo 0353205414 | Email: thaytiensy@gmail.com
 * ==============================================================================
 * Khóa cứng giới hạn kỹ thuật để bảo vệ tài nguyên và tạo phễu nâng cấp tự nhiên:
 * - Desktop Free: Khóa cứng tối đa 2 Bot hoạt động, 1 Phòng họp, không chạy ngầm 24/7.
 * - Starter Cloud: 5 Bot, 3 Phòng họp, 10 lịch ngầm 24/7.
 * - Pro Team Cloud: 10 Bot, không giới hạn phòng họp, 30 lịch ngầm 24/7.
 * - Business Cloud: Không giới hạn Bot & Phòng họp, 10 thành viên.
 * - Loop Guard: Khóa cứng tối đa 15 vòng lặp/tác vụ chống cạn kiệt token/tiền của khách.
 */

import { BRANDING } from '@/config/branding';
import { DEFAULT_PLANS, getSupabaseAdmin, memoryStore } from './db';
import type { Plan, PlanTier } from '@/types/database';

export class QuotaExceededError extends Error {
  public readonly code: string;
  public readonly currentCount: number;
  public readonly limit: number;
  public readonly currentTier: PlanTier;
  public readonly upgradeUrl: string;

  constructor(params: {
    message: string;
    code: string;
    currentCount: number;
    limit: number;
    currentTier: PlanTier;
  }) {
    super(params.message);
    this.name = 'QuotaExceededError';
    this.code = params.code;
    this.currentCount = params.currentCount;
    this.limit = params.limit;
    this.currentTier = params.currentTier;
    this.upgradeUrl = `${BRANDING.domain}/so-sanh-cai-may-va-cloud?current=${params.currentTier}`;
  }
}

export interface WorkspaceEntitlements {
  workspaceId: string;
  tier: PlanTier;
  plan: Plan;
  activeBotsCount: number;
  roomsCount: number;
  canAddBot: boolean;
  canCreateRoom: boolean;
  canUseCloudCron: boolean;
  creditsRemaining: number;
}

/**
 * Lấy thông tin hạn ngạch thực tế của Workspace từ Supabase hoặc Memory Store
 */
export async function getWorkspaceEntitlements(workspaceId: string): Promise<WorkspaceEntitlements> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    // 1. Lấy thông tin workspace
    const { data: ws, error: wsErr } = await supabase
      .from('workspaces')
      .select('id, tier')
      .eq('id', workspaceId)
      .single();

    if (wsErr || !ws) {
      throw new Error(`Không tìm thấy không gian làm việc với mã: ${workspaceId}`);
    }

    const tier = (ws.tier as PlanTier) || 'desktop_free';
    const plan = DEFAULT_PLANS[tier] || DEFAULT_PLANS.desktop_free;

    // 2. Đếm số bot đang hoạt động
    const { count: activeBotsCount } = await supabase
      .from('bots')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('is_active', true);

    // 3. Đếm số phòng họp
    const { count: roomsCount } = await supabase
      .from('rooms')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId);

    // 4. Lấy số dư credit nếu có
    const { data: creditData } = await supabase
      .from('usage_credits')
      .select('balance_remaining')
      .eq('workspace_id', workspaceId)
      .single();

    const currentBots = activeBotsCount || 0;
    const currentRooms = roomsCount || 0;
    const creditsRemaining = creditData?.balance_remaining || 0;

    return {
      workspaceId,
      tier,
      plan,
      activeBotsCount: currentBots,
      roomsCount: currentRooms,
      canAddBot: currentBots < plan.max_active_bots,
      canCreateRoom: currentRooms < plan.max_rooms,
      canUseCloudCron: plan.cloud_cron_enabled,
      creditsRemaining,
    };
  }

  // Fallback: In-memory store
  const ws = memoryStore.workspaces.get(workspaceId);
  const tier = ws?.tier || 'desktop_free';
  const plan = DEFAULT_PLANS[tier] || DEFAULT_PLANS.desktop_free;

  let activeBotsCount = 0;
  for (const bot of memoryStore.bots.values()) {
    if (bot.workspace_id === workspaceId && bot.is_active) {
      activeBotsCount++;
    }
  }

  let roomsCount = 0;
  for (const room of memoryStore.rooms.values()) {
    if (room.workspace_id === workspaceId) {
      roomsCount++;
    }
  }

  const credits = memoryStore.usageCredits.get(workspaceId)?.balance_remaining || 0;

  return {
    workspaceId,
    tier,
    plan,
    activeBotsCount,
    roomsCount,
    canAddBot: activeBotsCount < plan.max_active_bots,
    canCreateRoom: roomsCount < plan.max_rooms,
    canUseCloudCron: plan.cloud_cron_enabled,
    creditsRemaining: credits,
  };
}

/**
 * CHỐT CHẶN 1: Kiểm tra quyền kích hoạt thêm Bot
 */
export async function assertCanActivateBot(workspaceId: string): Promise<void> {
  const entitlements = await getWorkspaceEntitlements(workspaceId);

  if (entitlements.activeBotsCount >= entitlements.plan.max_active_bots) {
    const isDesktop = entitlements.tier.startsWith('desktop');
    const msg = isDesktop
      ? `Bản Cài Máy hiện tại đã đạt mức tối đa ${entitlements.plan.max_active_bots} Bot hoạt động. Hãy nâng cấp lên Gói Cloud (từ 199.000đ/tháng) để kích hoạt không giới hạn đội ngũ Bot và chạy 24/7! Liên hệ Zalo: ${BRANDING.contact.zalo}`
      : `Gói dịch vụ ${entitlements.plan.name} đã dùng hết giới hạn ${entitlements.plan.max_active_bots} Bot hoạt động. Vui lòng nâng cấp gói cao hơn để tiếp tục mở rộng.`;

    throw new QuotaExceededError({
      message: msg,
      code: 'BOT_LIMIT_EXCEEDED',
      currentCount: entitlements.activeBotsCount,
      limit: entitlements.plan.max_active_bots,
      currentTier: entitlements.tier,
    });
  }
}

/**
 * CHỐT CHẶN 2: Kiểm tra quyền tạo thêm Phòng họp đa Bot
 */
export async function assertCanCreateRoom(workspaceId: string): Promise<void> {
  const entitlements = await getWorkspaceEntitlements(workspaceId);

  if (entitlements.roomsCount >= entitlements.plan.max_rooms) {
    throw new QuotaExceededError({
      message: `Không gian của bạn đã đạt giới hạn tối đa ${entitlements.plan.max_rooms} phòng họp của gói ${entitlements.plan.name}. Nâng cấp lên Gói Pro Team Cloud để tạo không giới hạn phòng ban.`,
      code: 'ROOM_LIMIT_EXCEEDED',
      currentCount: entitlements.roomsCount,
      limit: entitlements.plan.max_rooms,
      currentTier: entitlements.tier,
    });
  }
}

/**
 * CHỐT CHẶN 3: Kiểm tra quyền chạy lịch tự động 24/7 trên Cloud
 */
export async function assertCanUseCloudCron(workspaceId: string): Promise<void> {
  const entitlements = await getWorkspaceEntitlements(workspaceId);

  if (!entitlements.plan.cloud_cron_enabled) {
    throw new QuotaExceededError({
      message:
        'Tính năng chạy lịch tự động 24/7 khi tắt máy chỉ hỗ trợ trên các Gói Web SaaS Cloud. Bản Cài Máy chỉ thực thi khi bạn đang bật máy tính và mở ứng dụng.',
      code: 'CLOUD_CRON_NOT_ALLOWED',
      currentCount: 0,
      limit: 0,
      currentTier: entitlements.tier,
    });
  }
}

/**
 * CHỐT CHẶN 4: Chống lặp vô tận tiêu hao Token (Loop Safety Guard)
 * Khóa cứng tối đa 15 vòng lặp trong một chu trình xử lý tự động
 */
export function assertLoopSafetyGuard(iterationCount: number): void {
  if (iterationCount > BRANDING.safety.maxLoopIterations) {
    throw new Error(
      `CẢNH BÁO AN TOÀN: Tác vụ đã vượt quá ngưỡng an toàn ${BRANDING.safety.maxLoopIterations} vòng lặp tự động. Hệ thống đã chủ động ngắt tiến trình để chống lãng phí token/ngân sách của bạn. Vui lòng kiểm tra lại câu lệnh.`
    );
  }
}
