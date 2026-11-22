import { describe, it, expect, beforeEach } from 'vitest';
import {
  MultiTenantDatabase,
  RLSAccessDeniedError,
  type AuthContext,
} from '../src/lib/server/rls-guard';
import { BYOKVault } from '../src/lib/server/byok-vault';

describe('Security & Multi-Tenant Isolation Test Suite (RLS)', () => {
  let db: MultiTenantDatabase;
  const userA: AuthContext = { userId: 'usr-tenant-a', email: 'tenant_a@company.vn' };
  const userB: AuthContext = { userId: 'usr-tenant-b', email: 'tenant_b@shop.vn' };
  const hackerC: AuthContext = { userId: 'usr-attacker-c', email: 'attacker@evil.org' };
  const superAdmin: AuthContext = {
    userId: 'usr-admin-root',
    email: 'thaytiensy@gmail.com',
    systemRole: 'superadmin',
  };

  const wsAId = 'ws-company-alpha';
  const wsBId = 'ws-shop-beta';

  beforeEach(() => {
    db = new MultiTenantDatabase();

    // Setup Workspace A
    db.createWorkspace(userA, wsAId, 'Alpha Corp', 'cloud_pro');
    db.addBot(userA, {
      id: 'bot-alpha-cskh',
      workspaceId: wsAId,
      name: 'CSKH Alpha',
      codeName: 'cskh_alpha',
      systemPrompt: 'Alpha confidential prompt',
      modelProvider: 'openai',
      modelName: 'gpt-4o-mini',
      isActive: true,
    });
    db.createThread(userA, {
      id: 'thread-alpha-finance',
      workspaceId: wsAId,
      title: 'Q4 Financial Planning',
      createdBy: userA.userId,
    });
    db.addMessage(userA, {
      id: 'msg-alpha-secret',
      threadId: 'thread-alpha-finance',
      workspaceId: wsAId,
      senderType: 'user',
      content: 'Doanh thu quy 4 du kien 5 ty VND',
    });
    db.addMemory(userA, {
      id: 'mem-alpha-strategy',
      workspaceId: wsAId,
      scope: 'workspace',
      memoryKey: 'strategy_2027',
      content: 'Bi quyet kinh doanh doc quyen cua Alpha',
    });
    db.createOrder(userA, {
      id: 'ord-alpha-01',
      workspaceId: wsAId,
      orderCode: 'BIGMAN_ALPHA_101',
      planId: 'cloud_pro',
      amountVnd: 799000,
      status: 'paid',
    });

    // Setup Workspace B
    db.createWorkspace(userB, wsBId, 'Beta TikTok Shop', 'cloud_starter');
    db.addBot(userB, {
      id: 'bot-beta-tiktok',
      workspaceId: wsBId,
      name: 'TikTok SEO Beta',
      codeName: 'tiktok_beta',
      systemPrompt: 'Beta TikTok strategy prompt',
      modelProvider: 'anthropic',
      modelName: 'claude-3-5-haiku',
      isActive: true,
    });
  });

  describe('1. Bot Isolation', () => {
    it('Tenant A can query its own bots', () => {
      const bots = db.queryBots(userA, wsAId);
      expect(bots).toHaveLength(1);
      expect(bots[0].id).toBe('bot-alpha-cskh');
    });

    it('Tenant B is FORBIDDEN from querying Tenant A bots', () => {
      expect(() => db.queryBots(userB, wsAId)).toThrowError(RLSAccessDeniedError);
    });

    it('Tenant B cannot get details of Tenant A bot directly by botId', () => {
      expect(() => db.getBot(userB, 'bot-alpha-cskh')).toThrowError(RLSAccessDeniedError);
    });

    it('Tenant B cannot update or tamper with Tenant A bot', () => {
      expect(() =>
        db.updateBot(userB, 'bot-alpha-cskh', { name: 'Hacked CSKH' })
      ).toThrowError(RLSAccessDeniedError);

      // Verify bot in DB remains unchanged
      const originalBot = db.getBot(userA, 'bot-alpha-cskh');
      expect(originalBot.name).toBe('CSKH Alpha');
    });

    it('Attacker C cannot delete Tenant A bot', () => {
      expect(() => db.deleteBot(hackerC, 'bot-alpha-cskh')).toThrowError(RLSAccessDeniedError);
      expect(db.getBot(userA, 'bot-alpha-cskh')).toBeDefined();
    });
  });

  describe('2. Threads & Messages Isolation', () => {
    it('Tenant B cannot list threads from Workspace A', () => {
      expect(() => db.queryThreads(userB, wsAId)).toThrowError(RLSAccessDeniedError);
    });

    it('Tenant B cannot read confidential messages of Workspace A thread', () => {
      expect(() => db.queryMessages(userB, 'thread-alpha-finance')).toThrowError(
        RLSAccessDeniedError
      );
    });

    it('Tenant A can read its own messages successfully', () => {
      const msgs = db.queryMessages(userA, 'thread-alpha-finance');
      expect(msgs).toHaveLength(1);
      expect(msgs[0].content).toContain('Doanh thu quy 4');
    });
  });

  describe('3. Knowledge Base & Long-Term Memory Isolation', () => {
    it('Tenant B cannot search or read Workspace A long-term memories', () => {
      expect(() => db.queryMemories(userB, wsAId, 'strategy')).toThrowError(
        RLSAccessDeniedError
      );
    });

    it('Tenant A queries its own memory accurately', () => {
      const memories = db.queryMemories(userA, wsAId, 'strategy');
      expect(memories).toHaveLength(1);
      expect(memories[0].memoryKey).toBe('strategy_2027');
    });
  });

  describe('4. Financial & Payment Order Isolation', () => {
    it('Tenant B cannot view Tenant A payment order', () => {
      expect(() => db.getOrder(userB, 'BIGMAN_ALPHA_101')).toThrowError(
        RLSAccessDeniedError
      );
    });

    it('Tenant A can inspect its own order', () => {
      const order = db.getOrder(userA, 'BIGMAN_ALPHA_101');
      expect(order.amountVnd).toBe(799000);
      expect(order.status).toBe('paid');
    });
  });

  describe('5. Superadmin Access & Audit Logs', () => {
    it('Superadmin with valid credentials has elevated read permission across workspaces', () => {
      const alphaBots = db.queryBots(superAdmin, wsAId);
      const betaBots = db.queryBots(superAdmin, wsBId);
      expect(alphaBots).toHaveLength(1);
      expect(betaBots).toHaveLength(1);
    });
  });

  describe('6. BYOK Vault Zero-Leak Verification', () => {
    it('AES-256-GCM encryption and decryption works correctly', () => {
      const vault = new BYOKVault();
      const testApiKey = 'sk-proj-abc1234567890def1234567890ghi';
      const encrypted = vault.encryptKey(testApiKey);
      expect(encrypted).not.toContain(testApiKey);

      const decrypted = vault.decryptKey(encrypted);
      expect(decrypted).toBe(testApiKey);
    });

    it('Sanitizes API keys from error messages, stack traces, and log payloads', () => {
      const rawLog = 'Error connecting to provider with key sk-abcdef1234567890123456 and token sk-ant-api03-abcdef123456789012';
      const cleanLog = BYOKVault.sanitizeString(rawLog);
      expect(cleanLog).not.toContain('sk-abcdef1234567890123456');
      expect(cleanLog).not.toContain('sk-ant-api03-abcdef123456789012');
      expect(cleanLog).toContain('[REDACTED]');

      const testError = new Error('Failed with sk-proj-1234567890abcdef123456');
      const safeError = BYOKVault.sanitizeError(testError);
      expect(safeError.message).not.toContain('sk-proj-1234567890abcdef123456');
      expect(safeError.message).toContain('[REDACTED]');
    });
  });
});
