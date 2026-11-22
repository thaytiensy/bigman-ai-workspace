/**
 * rls-guard.ts
 * Multi-Tenant Row-Level Security (RLS) Policy Engine
 * Enforces strict workspace boundaries for bots, threads, messages, memories, and payments.
 */

export class RLSAccessDeniedError extends Error {
  public statusCode = 403;
  constructor(message: string = 'Access denied: Row-Level Security policy violation') {
    super(message);
    this.name = 'RLSAccessDeniedError';
  }
}

export interface AuthContext {
  userId: string;
  email: string;
  systemRole?: 'user' | 'admin' | 'superadmin';
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  tier: 'desktop_free' | 'desktop_lifetime' | 'cloud_starter' | 'cloud_pro' | 'cloud_business';
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface Bot {
  id: string;
  workspaceId: string;
  name: string;
  codeName: string;
  systemPrompt: string;
  modelProvider: string;
  modelName: string;
  isActive: boolean;
}

export interface Thread {
  id: string;
  workspaceId: string;
  title: string;
  createdBy: string;
}

export interface Message {
  id: string;
  threadId: string;
  workspaceId: string;
  senderType: 'user' | 'bot' | 'system';
  content: string;
}

export interface MemoryRecord {
  id: string;
  workspaceId: string;
  botId?: string | null;
  scope: 'workspace' | 'bot_private';
  memoryKey: string;
  content: string;
}

export interface PaymentOrder {
  id: string;
  workspaceId: string;
  orderCode: string;
  planId: string;
  amountVnd: number;
  status: 'pending' | 'paid' | 'canceled' | 'refunded';
}

export class MultiTenantDatabase {
  public workspaces: Map<string, Workspace> = new Map();
  public members: WorkspaceMember[] = [];
  public bots: Map<string, Bot> = new Map();
  public threads: Map<string, Thread> = new Map();
  public messages: Map<string, Message> = new Map();
  public memories: Map<string, MemoryRecord> = new Map();
  public orders: Map<string, PaymentOrder> = new Map();

  // Helper: Verify if user has access to workspace
  public checkMembership(auth: AuthContext, workspaceId: string): boolean {
    if (auth.systemRole === 'superadmin') return true;
    return this.members.some(
      (m) => m.workspaceId === workspaceId && m.userId === auth.userId
    );
  }

  public assertAccess(auth: AuthContext, workspaceId: string): void {
    if (!this.checkMembership(auth, workspaceId)) {
      throw new RLSAccessDeniedError(
        `User ${auth.userId} is not a member of Workspace ${workspaceId}`
      );
    }
  }

  // Workspaces
  public createWorkspace(
    auth: AuthContext,
    id: string,
    name: string,
    tier: Workspace['tier'] = 'desktop_free'
  ): Workspace {
    const ws: Workspace = { id, name, ownerId: auth.userId, tier };
    this.workspaces.set(id, ws);
    this.members.push({ workspaceId: id, userId: auth.userId, role: 'owner' });
    return ws;
  }

  // Bots
  public addBot(auth: AuthContext, bot: Bot): Bot {
    this.assertAccess(auth, bot.workspaceId);
    this.bots.set(bot.id, bot);
    return bot;
  }

  public getBot(auth: AuthContext, botId: string): Bot {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error('Bot not found');
    }
    this.assertAccess(auth, bot.workspaceId);
    return bot;
  }

  public queryBots(auth: AuthContext, workspaceId: string): Bot[] {
    this.assertAccess(auth, workspaceId);
    return Array.from(this.bots.values()).filter(
      (b) => b.workspaceId === workspaceId
    );
  }

  public updateBot(
    auth: AuthContext,
    botId: string,
    patch: Partial<Omit<Bot, 'id' | 'workspaceId'>>
  ): Bot {
    const bot = this.getBot(auth, botId); // Throws if no access
    const updated = { ...bot, ...patch };
    this.bots.set(botId, updated);
    return updated;
  }

  public deleteBot(auth: AuthContext, botId: string): boolean {
    const bot = this.getBot(auth, botId); // Throws if no access
    return this.bots.delete(bot.id);
  }

  // Threads & Messages
  public createThread(auth: AuthContext, thread: Thread): Thread {
    this.assertAccess(auth, thread.workspaceId);
    this.threads.set(thread.id, thread);
    return thread;
  }

  public queryThreads(auth: AuthContext, workspaceId: string): Thread[] {
    this.assertAccess(auth, workspaceId);
    return Array.from(this.threads.values()).filter(
      (t) => t.workspaceId === workspaceId
    );
  }

  public addMessage(auth: AuthContext, msg: Message): Message {
    this.assertAccess(auth, msg.workspaceId);
    this.messages.set(msg.id, msg);
    return msg;
  }

  public queryMessages(auth: AuthContext, threadId: string): Message[] {
    const thread = this.threads.get(threadId);
    if (!thread) throw new Error('Thread not found');
    this.assertAccess(auth, thread.workspaceId);
    return Array.from(this.messages.values()).filter(
      (m) => m.threadId === threadId
    );
  }

  // Memories
  public addMemory(auth: AuthContext, mem: MemoryRecord): MemoryRecord {
    this.assertAccess(auth, mem.workspaceId);
    this.memories.set(mem.id, mem);
    return mem;
  }

  public queryMemories(
    auth: AuthContext,
    workspaceId: string,
    keyword?: string
  ): MemoryRecord[] {
    this.assertAccess(auth, workspaceId);
    const list = Array.from(this.memories.values()).filter(
      (m) => m.workspaceId === workspaceId
    );
    if (!keyword) return list;
    return list.filter(
      (m) =>
        m.memoryKey.toLowerCase().includes(keyword.toLowerCase()) ||
        m.content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Orders
  public createOrder(auth: AuthContext, order: PaymentOrder): PaymentOrder {
    this.assertAccess(auth, order.workspaceId);
    this.orders.set(order.orderCode, order);
    return order;
  }

  public getOrder(auth: AuthContext, orderCode: string): PaymentOrder {
    const order = this.orders.get(orderCode);
    if (!order) throw new Error('Order not found');
    this.assertAccess(auth, order.workspaceId);
    return order;
  }
}
