/**
 * ==============================================================================
 * ĐỊNH NGHĨA KIỂU DỮ LIỆU CƠ SỞ DỮ LIỆU (DATABASE & DOMAIN TYPES)
 * DỰ ÁN: TỔ CHỨC NHÂN VIÊN AI
 * LIÊN HỆ: Zalo 0353205414 | Email: thaytiensy@gmail.com
 * ==============================================================================
 */

export type SystemRole = 'superadmin' | 'admin' | 'user';
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';
export type PlanTier =
  | 'desktop_free'
  | 'desktop_pro'
  | 'starter_byok'
  | 'starter_credits'
  | 'pro_team_byok'
  | 'pro_team_credits'
  | 'business_byok'
  | 'business_credits';

export type BillingCycle = 'one_time' | 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'expired';
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'deepseek';
export type SenderType = 'user' | 'bot' | 'system';
export type ThreadStatus = 'active' | 'archived' | 'closed';
export type MemoryScope = 'workspace' | 'bot_private';
export type RoutineStatus = 'idle' | 'running' | 'success' | 'failed';
export type PaymentOrderStatus = 'pending' | 'paid' | 'canceled' | 'refunded';

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  full_name?: string | null;
  password_hash?: string | null;
  avatar_url?: string | null;
  system_role: SystemRole;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: PlanTier;
  name: string;
  description?: string | null;
  billing_cycle: BillingCycle;
  price_vnd: number;
  max_active_bots: number;
  max_rooms: number;
  max_members: number;
  cloud_cron_enabled: boolean;
  max_memory_mb: number;
  ai_credit_monthly: number;
  byok_allowed: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  tier: PlanTier;
  is_active: boolean;
  encrypted_byok_keys?: Record<string, { iv: string; authTag: string; ciphertext: string }>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
}

export interface Subscription {
  id: string;
  workspace_id: string;
  plan_id: PlanTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end?: string | null;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bot {
  id: string;
  workspace_id: string;
  name: string;
  code_name: string;
  department: string;
  role_title?: string | null;
  avatar_url?: string | null;
  system_prompt: string;
  model_provider: ModelProvider;
  model_name: string;
  temperature: number;
  tools_config: Record<string, unknown>;
  is_active: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  bot_id?: string | null;
  user_id?: string | null;
  added_at: string;
}

export interface Thread {
  id: string;
  workspace_id: string;
  room_id?: string | null;
  bot_id?: string | null;
  title: string;
  status: ThreadStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  workspace_id: string;
  sender_type: SenderType;
  sender_id: string;
  sender_name?: string | null;
  content: string;
  input_tokens: number;
  output_tokens: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Memory {
  id: string;
  workspace_id: string;
  bot_id?: string | null;
  scope: MemoryScope;
  memory_key: string;
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ScheduledRoutine {
  id: string;
  workspace_id: string;
  bot_id: string;
  title: string;
  cron_expression: string;
  timezone: string;
  prompt_payload: string;
  is_enabled: boolean;
  run_on_cloud: boolean;
  last_run_at?: string | null;
  next_run_at?: string | null;
  last_status: RoutineStatus;
  created_at: string;
  updated_at: string;
}

export interface UsageCredits {
  workspace_id: string;
  monthly_allowance: number;
  balance_remaining: number;
  total_consumed_lifetime: number;
  last_refill_at: string;
  updated_at: string;
}

export interface PaymentOrder {
  id: string;
  workspace_id: string;
  order_code: string;
  plan_id: PlanTier;
  amount_vnd: number;
  status: PaymentOrderStatus;
  payment_gateway: string;
  transaction_ref?: string | null;
  raw_webhook_payload?: Record<string, unknown>;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}
