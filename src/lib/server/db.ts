/**
 * ==============================================================================
 * DATABASE ADAPTER & REPOSITORY LAYER
 * DỰ ÁN: TỔ CHỨC NHÂN VIÊN AI
 * LIÊN HỆ: Zalo 0353205414 | Email: thaytiensy@gmail.com
 * ==============================================================================
 * Tương thích cả Supabase Client (khi có env) lẫn In-Memory/Mock Store cho
 * môi trường kiểm thử CI/CD hoặc chạy độc lập khi chưa cấu hình DB.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Plan,
  PlanTier,
  Workspace,
  Bot,
  Room,
  PaymentOrder,
  Subscription,
  UsageCredits,
} from '@/types/database';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey || url.includes('placeholder')) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return supabaseInstance;
}

// Bảng giá cố định trong mã nguồn ánh xạ 1:1 với SQL migration
export const DEFAULT_PLANS: Record<PlanTier, Plan> = {
  desktop_free: {
    id: 'desktop_free',
    name: 'Bản Cài Máy Miễn Phí (Desktop Free)',
    description: 'Chạy trên máy cá nhân, BYOK, tối đa 2 bot hoạt động.',
    billing_cycle: 'one_time',
    price_vnd: 0,
    max_active_bots: 2,
    max_rooms: 1,
    max_members: 1,
    cloud_cron_enabled: false,
    max_memory_mb: 100,
    ai_credit_monthly: 0,
    byok_allowed: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  desktop_pro: {
    id: 'desktop_pro',
    name: 'Bản Cài Máy Vĩnh Viễn (Desktop Pro Lifetime)',
    description: '1.890.000đ trọn đời 1 máy, tối đa 5 bot, 3 phòng họp.',
    billing_cycle: 'one_time',
    price_vnd: 1890000,
    max_active_bots: 5,
    max_rooms: 3,
    max_members: 1,
    cloud_cron_enabled: false,
    max_memory_mb: 1000,
    ai_credit_monthly: 0,
    byok_allowed: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  starter_byok: {
    id: 'starter_byok',
    name: 'Starter Cloud (BYOK)',
    description: '199.000đ/tháng, 5 bot, 3 phòng họp, 10 lịch ngầm 24/7.',
    billing_cycle: 'monthly',
    price_vnd: 199000,
    max_active_bots: 5,
    max_rooms: 3,
    max_members: 1,
    cloud_cron_enabled: true,
    max_memory_mb: 1000,
    ai_credit_monthly: 0,
    byok_allowed: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  starter_credits: {
    id: 'starter_credits',
    name: 'Starter Cloud (Trọn Gói 3M Credits)',
    description: '349.000đ/tháng, 5 bot, 3M AI credits, 24/7 Cloud.',
    billing_cycle: 'monthly',
    price_vnd: 349000,
    max_active_bots: 5,
    max_rooms: 3,
    max_members: 1,
    cloud_cron_enabled: true,
    max_memory_mb: 1000,
    ai_credit_monthly: 3000000,
    byok_allowed: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  pro_team_byok: {
    id: 'pro_team_byok',
    name: 'Pro Team Cloud (BYOK)',
    description: '499.000đ/tháng, 10 bot, không giới hạn phòng họp, 30 lịch ngầm 24/7.',
    billing_cycle: 'monthly',
    price_vnd: 499000,
    max_active_bots: 10,
    max_rooms: 99999,
    max_members: 3,
    cloud_cron_enabled: true,
    max_memory_mb: 5000,
    ai_credit_monthly: 0,
    byok_allowed: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  pro_team_credits: {
    id: 'pro_team_credits',
    name: 'Pro Team Cloud (Trọn Gói 10M Credits)',
    description: '799.000đ/tháng, 10 bot, 10M AI credits, 3 thành viên, 24/7 Cloud.',
    billing_cycle: 'monthly',
    price_vnd: 799000,
    max_active_bots: 10,
    max_rooms: 99999,
    max_members: 3,
    cloud_cron_enabled: true,
    max_memory_mb: 5000,
    ai_credit_monthly: 10000000,
    byok_allowed: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  business_byok: {
    id: 'business_byok',
    name: 'Business Cloud (BYOK)',
    description: '1.290.000đ/tháng, Không giới hạn bot, 10 thành viên, 24/7 Cloud.',
    billing_cycle: 'monthly',
    price_vnd: 1290000,
    max_active_bots: 99999,
    max_rooms: 99999,
    max_members: 10,
    cloud_cron_enabled: true,
    max_memory_mb: 20000,
    ai_credit_monthly: 0,
    byok_allowed: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  business_credits: {
    id: 'business_credits',
    name: 'Business Cloud (Trọn Gói 30M Credits)',
    description: '1.990.000đ/tháng, Không giới hạn bot, 30M AI credits, VIP support.',
    billing_cycle: 'monthly',
    price_vnd: 1990000,
    max_active_bots: 99999,
    max_rooms: 99999,
    max_members: 10,
    cloud_cron_enabled: true,
    max_memory_mb: 20000,
    ai_credit_monthly: 30000000,
    byok_allowed: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
};

// ==============================================================================
// IN-MEMORY STORE (PHỤC VỤ RUNTIME DEVELOPMENT & KIỂM THỬ KHI CHƯA NỐI SUPABASE)
// ==============================================================================
class InMemoryStore {
  public workspaces: Map<string, Workspace> = new Map();
  public bots: Map<string, Bot> = new Map();
  public rooms: Map<string, Room> = new Map();
  public subscriptions: Map<string, Subscription> = new Map();
  public usageCredits: Map<string, UsageCredits> = new Map();
  public paymentOrders: Map<string, PaymentOrder> = new Map();

  constructor() {
    // Seed một workspace mẫu phục vụ demo ngay
    const demoWorkspaceId = '00000000-0000-0000-0000-000000000001';
    this.workspaces.set(demoWorkspaceId, {
      id: demoWorkspaceId,
      name: 'Tổ Chức Nhân Viên AI Mẫu',
      slug: 'to-chuc-mau',
      owner_id: '00000000-0000-0000-0000-000000000099',
      tier: 'desktop_free',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 2 bot mặc định cho desktop_free
    const bot1Id = '11111111-1111-1111-1111-111111111111';
    const bot2Id = '22222222-2222-2222-2222-222222222222';
    this.bots.set(bot1Id, {
      id: bot1Id,
      workspace_id: demoWorkspaceId,
      name: 'Minh',
      code_name: 'minh',
      department: 'Ban Điều Hành Tổng',
      role_title: 'Quản lý & Điều phối tổng',
      avatar_url: null,
      system_prompt: 'Bạn là Minh, nhân viên AI điều phối trung tâm.',
      model_provider: 'openai',
      model_name: 'gpt-4o-mini',
      temperature: 0.7,
      tools_config: {},
      is_active: true,
      is_template: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    this.bots.set(bot2Id, {
      id: bot2Id,
      workspace_id: demoWorkspaceId,
      name: 'Đức',
      code_name: 'duc',
      department: 'Phòng Kỹ Thuật & Sản Phẩm',
      role_title: 'Kỹ sư Backend & Kiến trúc hệ thống',
      avatar_url: null,
      system_prompt: 'Bạn là Đức, kỹ sư Backend kiến trúc hệ thống.',
      model_provider: 'openai',
      model_name: 'gpt-4o-mini',
      temperature: 0.5,
      tools_config: {},
      is_active: true,
      is_template: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}

export const memoryStore = new InMemoryStore();
