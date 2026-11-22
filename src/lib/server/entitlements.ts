/**
 * entitlements.ts
 * Feature Flag & Entitlement Interceptor Engine
 * Enforces tier quotas, 2-bot lock on Desktop Free, cloud cron restrictions, and 15-loop task cap.
 */

export class EntitlementLimitError extends Error {
  public statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'EntitlementLimitError';
  }
}

export class TaskLoopLimitExceededError extends Error {
  public statusCode = 429;
  constructor(message: string) {
    super(message);
    this.name = 'TaskLoopLimitExceededError';
  }
}

export type WorkspaceTier =
  | 'desktop_free'
  | 'desktop_lifetime'
  | 'cloud_starter'
  | 'cloud_pro'
  | 'cloud_business';

export interface PlanLimits {
  tier: WorkspaceTier;
  maxActiveBots: number;
  cloudCronEnabled: boolean;
  maxRoutines: number;
  maxRooms: number;
  maxMembers: number;
  maxLoopsPerTask: number;
  maxConcurrentSessions: number;
}

export const TIER_LIMITS: Record<WorkspaceTier, PlanLimits> = {
  desktop_free: {
    tier: 'desktop_free',
    maxActiveBots: 2,
    cloudCronEnabled: false,
    maxRoutines: 3, // Only runs while desktop app is open
    maxRooms: 1,
    maxMembers: 1,
    maxLoopsPerTask: 15, // Hard limit anti-infinite loop
    maxConcurrentSessions: 1,
  },
  desktop_lifetime: {
    tier: 'desktop_lifetime',
    maxActiveBots: 16,
    cloudCronEnabled: false,
    maxRoutines: 20,
    maxRooms: 10,
    maxMembers: 1,
    maxLoopsPerTask: 30,
    maxConcurrentSessions: 1,
  },
  cloud_starter: {
    tier: 'cloud_starter',
    maxActiveBots: 5,
    cloudCronEnabled: true,
    maxRoutines: 10,
    maxRooms: 3,
    maxMembers: 1,
    maxLoopsPerTask: 30,
    maxConcurrentSessions: 1,
  },
  cloud_pro: {
    tier: 'cloud_pro',
    maxActiveBots: 10, // Can be up to 15
    cloudCronEnabled: true,
    maxRoutines: 30,
    maxRooms: 999, // Unlimited
    maxMembers: 3,
    maxLoopsPerTask: 50,
    maxConcurrentSessions: 3,
  },
  cloud_business: {
    tier: 'cloud_business',
    maxActiveBots: 999, // Unlimited
    cloudCronEnabled: true,
    maxRoutines: 999,
    maxRooms: 999,
    maxMembers: 10,
    maxLoopsPerTask: 100,
    maxConcurrentSessions: 10,
  },
};

export class EntitlementGuard {
  /**
   * Asserts whether a workspace can activate an additional bot.
   */
  public static assertCanActivateBot(
    tier: WorkspaceTier,
    currentActiveBots: number
  ): void {
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.desktop_free;
    if (currentActiveBots >= limits.maxActiveBots) {
      throw new EntitlementLimitError(
        `[403 FORBIDDEN] Bạn đã đạt giới hạn tối đa ${limits.maxActiveBots} Bot hoạt động của gói ${tier}. Hãy nâng cấp lên Gói Cloud Pro / Business để kích hoạt toàn bộ đội ngũ bot.`
      );
    }
  }

  /**
   * Asserts whether a routine can be scheduled to run 24/7 on Cloud.
   */
  public static assertCanCreateCloudRoutine(
    tier: WorkspaceTier,
    runOnCloud: boolean,
    currentRoutineCount: number = 0
  ): void {
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.desktop_free;
    if (runOnCloud && !limits.cloudCronEnabled) {
      throw new EntitlementLimitError(
        `[403 FORBIDDEN] Lịch chạy tự động 24/7 trên đám mây chỉ khả dụng trên Gói Cloud. Bản Cài Máy Desktop chỉ hỗ trợ chạy khi máy tính đang mở ứng dụng.`
      );
    }

    if (currentRoutineCount >= limits.maxRoutines) {
      throw new EntitlementLimitError(
        `[403 FORBIDDEN] Bạn đã đạt giới hạn tối đa ${limits.maxRoutines} lịch tự động của gói ${tier}.`
      );
    }
  }

  /**
   * Anti-infinite loop guard: stops task execution if iterations exceed limit.
   */
  public static assertLoopGuard(
    tier: WorkspaceTier,
    currentIteration: number,
    taskId: string = 'task'
  ): void {
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.desktop_free;
    if (currentIteration > limits.maxLoopsPerTask) {
      throw new TaskLoopLimitExceededError(
        `[429 LOOP LIMIT] Task '${taskId}' bị cưỡng chế dừng: đã vượt quá trần ${limits.maxLoopsPerTask} vòng lặp cho phép của gói ${tier} để chống hao hụt token ngoài tầm kiểm soát.`
      );
    }
  }

  /**
   * Asserts whether a workspace can create an additional multi-bot room.
   */
  public static assertCanCreateRoom(
    tier: WorkspaceTier,
    currentRoomCount: number
  ): void {
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.desktop_free;
    if (currentRoomCount >= limits.maxRooms) {
      throw new EntitlementLimitError(
        `[403 FORBIDDEN] Bạn đã đạt giới hạn ${limits.maxRooms} phòng họp của gói ${tier}. Hãy nâng cấp lên Cloud Pro để tạo không giới hạn phòng họp.`
      );
    }
  }

  /**
   * Asserts concurrent user sessions per workspace.
   */
  public static assertConcurrencyLimit(
    tier: WorkspaceTier,
    activeSessionsCount: number
  ): void {
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.desktop_free;
    if (activeSessionsCount >= limits.maxConcurrentSessions) {
      throw new EntitlementLimitError(
        `[403 FORBIDDEN] Tài khoản gói ${tier} chỉ cho phép tối đa ${limits.maxConcurrentSessions} phiên đăng nhập đồng thời. Phát hiện đăng nhập từ thiết bị khác.`
      );
    }
  }
}
