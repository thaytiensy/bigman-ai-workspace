import { describe, it, expect } from 'vitest';
import {
  EntitlementGuard,
  EntitlementLimitError,
  TaskLoopLimitExceededError,
  TIER_LIMITS,
} from '../src/lib/server/entitlements';

describe('Entitlement & Quota Anti-Bypass Test Suite', () => {
  describe('1. Desktop Free Tier Limits (2 Bots / 15 Loops / No Cloud Cron)', () => {
    it('Allows activating 1st and 2nd bot', () => {
      expect(() => EntitlementGuard.assertCanActivateBot('desktop_free', 0)).not.toThrow();
      expect(() => EntitlementGuard.assertCanActivateBot('desktop_free', 1)).not.toThrow();
    });

    it('Hard-locks at 3rd bot: Backend strictly blocks with 403 Forbidden', () => {
      expect(() => EntitlementGuard.assertCanActivateBot('desktop_free', 2)).toThrowError(
        EntitlementLimitError
      );
      try {
        EntitlementGuard.assertCanActivateBot('desktop_free', 2);
      } catch (err: unknown) {
        expect((err as EntitlementLimitError | TaskLoopLimitExceededError).statusCode).toBe(403);
        expect((err as Error).message).toContain('giới hạn tối đa 2 Bot');
        expect((err as Error).message.toLowerCase()).toContain('nâng cấp');
      }
    });

    it('Blocks enabling Cloud Cron 24/7 on Desktop Free with 403 Forbidden', () => {
      // Local routine while app is open is allowed
      expect(() =>
        EntitlementGuard.assertCanCreateCloudRoutine('desktop_free', false, 1)
      ).not.toThrow();

      // Cloud 24/7 routine must be blocked
      expect(() =>
        EntitlementGuard.assertCanCreateCloudRoutine('desktop_free', true, 1)
      ).toThrowError(EntitlementLimitError);

      try {
        EntitlementGuard.assertCanCreateCloudRoutine('desktop_free', true, 1);
      } catch (err: unknown) {
        expect((err as EntitlementLimitError | TaskLoopLimitExceededError).statusCode).toBe(403);
        expect((err as Error).message).toContain('24/7 trên đám mây chỉ khả dụng trên Gói Cloud');
      }
    });

    it('Hard limit 15 loops/task anti-infinite loop guard on Desktop Free', () => {
      // Iteration 1 to 15 allowed
      expect(() => EntitlementGuard.assertLoopGuard('desktop_free', 1, 'task-01')).not.toThrow();
      expect(() => EntitlementGuard.assertLoopGuard('desktop_free', 15, 'task-01')).not.toThrow();

      // Iteration 16 strictly aborted
      expect(() =>
        EntitlementGuard.assertLoopGuard('desktop_free', 16, 'task-run-loop')
      ).toThrowError(TaskLoopLimitExceededError);

      try {
        EntitlementGuard.assertLoopGuard('desktop_free', 16, 'task-run-loop');
      } catch (err: unknown) {
        expect((err as EntitlementLimitError | TaskLoopLimitExceededError).statusCode).toBe(429);
        expect((err as Error).message).toContain('vượt quá trần 15 vòng lặp');
      }
    });

    it('Blocks 2nd multi-bot room on Desktop Free', () => {
      expect(() => EntitlementGuard.assertCanCreateRoom('desktop_free', 0)).not.toThrow();
      expect(() => EntitlementGuard.assertCanCreateRoom('desktop_free', 1)).toThrowError(
        EntitlementLimitError
      );
    });
  });

  describe('2. Cloud Starter Tier Limits (5 Bots / 10 Cloud Crons / 3 Rooms)', () => {
    it('Allows up to 5 active bots, blocks 6th bot', () => {
      expect(() => EntitlementGuard.assertCanActivateBot('cloud_starter', 4)).not.toThrow();
      expect(() => EntitlementGuard.assertCanActivateBot('cloud_starter', 5)).toThrowError(
        EntitlementLimitError
      );
    });

    it('Allows Cloud Cron 24/7 up to 10 routines, blocks 11th', () => {
      expect(() =>
        EntitlementGuard.assertCanCreateCloudRoutine('cloud_starter', true, 9)
      ).not.toThrow();
      expect(() =>
        EntitlementGuard.assertCanCreateCloudRoutine('cloud_starter', true, 10)
      ).toThrowError(EntitlementLimitError);
    });

    it('Allows up to 3 rooms, blocks 4th room', () => {
      expect(() => EntitlementGuard.assertCanCreateRoom('cloud_starter', 2)).not.toThrow();
      expect(() => EntitlementGuard.assertCanCreateRoom('cloud_starter', 3)).toThrowError(
        EntitlementLimitError
      );
    });
  });

  describe('3. Cloud Pro Team Tier Limits (10 Bots / 30 Crons / Unlimited Rooms)', () => {
    it('Allows up to 10 bots', () => {
      expect(() => EntitlementGuard.assertCanActivateBot('cloud_pro', 9)).not.toThrow();
      expect(() => EntitlementGuard.assertCanActivateBot('cloud_pro', 10)).toThrowError(
        EntitlementLimitError
      );
    });

    it('Allows unlimited rooms on Pro Team', () => {
      expect(() => EntitlementGuard.assertCanCreateRoom('cloud_pro', 50)).not.toThrow();
    });

    it('Enforces 3 concurrent sessions limit', () => {
      expect(() => EntitlementGuard.assertConcurrencyLimit('cloud_pro', 2)).not.toThrow();
      expect(() => EntitlementGuard.assertConcurrencyLimit('cloud_pro', 3)).toThrowError(
        EntitlementLimitError
      );
    });
  });

  describe('4. Cloud Business Tier Limits (Unlimited Bots / Unlimited Crons)', () => {
    it('Allows activating large team of bots without artificial limits', () => {
      expect(() => EntitlementGuard.assertCanActivateBot('cloud_business', 25)).not.toThrow();
    });

    it('Allows up to 10 concurrent sessions for enterprise teams', () => {
      expect(() => EntitlementGuard.assertConcurrencyLimit('cloud_business', 9)).not.toThrow();
      expect(() =>
        EntitlementGuard.assertConcurrencyLimit('cloud_business', 10)
      ).toThrowError(EntitlementLimitError);
    });
  });

  describe('5. Entitlement Limit Matrix Integrity', () => {
    it('All defined tiers have positive quota definitions', () => {
      const tiers = Object.keys(TIER_LIMITS) as (keyof typeof TIER_LIMITS)[];
      for (const tier of tiers) {
        const spec = TIER_LIMITS[tier];
        expect(spec.maxActiveBots).toBeGreaterThan(0);
        expect(spec.maxLoopsPerTask).toBeGreaterThanOrEqual(15);
      }
    });
  });
});
