-- ==============================================================================
-- DỰ ÁN: TỔ CHỨC NHÂN VIÊN AI (HYBRID AI WORKSPACE)
-- MIGRATION: 001_init_to_chuc_nhan_vien_ai.sql
-- TÁC GIẢ: Lin (Backend Engineer) - Ship Software Safely Department
-- LIÊN HỆ: Zalo 0353205414 | Email thaytiensy@gmail.com
-- MÔ TẢ: Khởi tạo 13+ bảng cốt lõi, Row-Level Security (RLS) & Dữ liệu Seed 7 Gói cước
-- ==============================================================================

-- Bật các extension cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. BẢNG NGƯỜI DÙNG (USERS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(100),
    password_hash VARCHAR(255),
    avatar_url TEXT,
    system_role VARCHAR(20) DEFAULT 'user' CHECK (system_role IN ('superadmin', 'admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. BẢNG GÓI CƯỚC & GIỚI HẠN KỸ THUẬT (PLANS & ENTITLEMENTS)
-- Phục vụ cả Bản Cài Máy (Desktop) và Bản Thuê Web SaaS Cloud
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('one_time', 'monthly', 'yearly')),
    price_vnd BIGINT NOT NULL,
    max_active_bots INT NOT NULL,       -- Giới hạn số Bot chạy đồng thời (Desktop: 2, Starter: 5, Pro: 10, Business: 99999)
    max_rooms INT NOT NULL,             -- Giới hạn số phòng họp (Desktop: 1, Starter: 3, Pro: 99999)
    max_members INT DEFAULT 1,          -- Số thành viên trong workspace
    cloud_cron_enabled BOOLEAN DEFAULT FALSE, -- Quyền chạy lịch ngầm 24/7 trên Cloud khi tắt máy
    max_memory_mb INT NOT NULL,         -- Giới hạn lưu trữ tri thức/bộ nhớ (MB)
    ai_credit_monthly BIGINT DEFAULT 0, -- Token cấp sẵn cho gói All-in-One
    byok_allowed BOOLEAN DEFAULT TRUE,  -- Quyền tự cắm API Key cá nhân
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. BẢNG KHÔNG GIAN LÀM VIỆC (WORKSPACES - MULTI-TENANT ROOT)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL DEFAULT 'desktop_free' REFERENCES plans(id),
    is_active BOOLEAN DEFAULT TRUE,
    encrypted_byok_keys JSONB DEFAULT '{}'::jsonb, -- Khóa API BYOK đã mã hóa AES-256-GCM
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. BẢNG THÀNH VIÊN KHÔNG GIAN (WORKSPACE_MEMBERS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 5. BẢNG ĐĂNG KÝ GÓI DỊCH VỤ (SUBSCRIPTIONS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL REFERENCES plans(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'expired')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ, -- NULL nếu là gói trọn đời (one_time)
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. BẢNG ĐỘI NGŨ NHÂN VIÊN AI (BOTS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code_name VARCHAR(50) NOT NULL, -- e.g. 'ada', 'orbit', 'lin', 'sunny', 'wren'
    department VARCHAR(100) DEFAULT 'General',
    role_title VARCHAR(150),
    avatar_url TEXT,
    system_prompt TEXT NOT NULL,
    model_provider VARCHAR(50) DEFAULT 'openai', -- 'openai', 'anthropic', 'google', 'deepseek'
    model_name VARCHAR(100) DEFAULT 'gpt-4o-mini',
    temperature NUMERIC(3,2) DEFAULT 0.70,
    tools_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. BẢNG PHÒNG HỌP ĐA BOT (ROOMS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. BẢNG THÀNH VIÊN PHÒNG HỌP (ROOM_MEMBERS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT room_participant_check CHECK (
        (bot_id IS NOT NULL AND user_id IS NULL) OR
        (bot_id IS NULL AND user_id IS NOT NULL)
    ),
    UNIQUE(room_id, bot_id),
    UNIQUE(room_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 9. BẢNG PHIÊN HỘI THOẠI (THREADS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL, -- NULL nếu là chat 1-1 với Bot
    bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,   -- Chỉ định nếu là chat 1-1
    title VARCHAR(255) NOT NULL DEFAULT 'Phiên làm việc mới',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. BẢNG TIN NHẮN (MESSAGES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'bot', 'system')),
    sender_id UUID NOT NULL, -- user_id hoặc bot_id
    sender_name VARCHAR(100),
    content TEXT NOT NULL,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb, -- tool calls, file attachments, telemetry
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. BẢNG BỘ NHỚ TRI THỨC DÀI HẠN (MEMORIES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE, -- NULL nếu là bộ nhớ chung toàn Workspace
    scope VARCHAR(20) DEFAULT 'workspace' CHECK (scope IN ('workspace', 'bot_private')),
    memory_key VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. BẢNG LỊCH CHẠY TỰ ĐỘNG (SCHEDULED_ROUTINES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scheduled_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    cron_expression VARCHAR(50) NOT NULL, -- e.g. '0 9 * * 1-5'
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    prompt_payload TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    run_on_cloud BOOLEAN DEFAULT FALSE,   -- Yêu cầu gói Cloud có cloud_cron_enabled
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    last_status VARCHAR(20) DEFAULT 'idle' CHECK (last_status IN ('idle', 'running', 'success', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. BẢNG HẠN MỨC & SỐ DƯ AI CREDITS (USAGE_CREDITS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usage_credits (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    monthly_allowance BIGINT DEFAULT 0,
    balance_remaining BIGINT DEFAULT 0,
    total_consumed_lifetime BIGINT DEFAULT 0,
    last_refill_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 14. BẢNG ĐƠN HÀNG & THANH TOÁN TỰ ĐỘNG (PAYMENT_ORDERS)
-- Cơ chế Idempotency & Tự động Nâng cấp Gói
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    order_code VARCHAR(50) UNIQUE NOT NULL, -- Mã giao dịch VietQR (ví dụ: 'NVAI10842')
    plan_id VARCHAR(50) NOT NULL REFERENCES plans(id),
    amount_vnd BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled', 'refunded')),
    payment_gateway VARCHAR(30) DEFAULT 'vietqr_sepay',
    transaction_ref VARCHAR(100), -- Mã tham chiếu từ ngân hàng chuyển khoản
    raw_webhook_payload JSONB DEFAULT '{}'::jsonb,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- CHỈ MỤC HIỆU NĂNG CAO (INDEXES)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_lookup ON workspace_members(workspace_id, user_id);
CREATE INDEX IF NOT EXISTS idx_bots_workspace ON bots(workspace_id);
CREATE INDEX IF NOT EXISTS idx_rooms_workspace ON rooms(workspace_id);
CREATE INDEX IF NOT EXISTS idx_threads_workspace ON threads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_workspace ON messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_memories_workspace ON memories(workspace_id);
CREATE INDEX IF NOT EXISTS idx_routines_workspace ON scheduled_routines(workspace_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON payment_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_workspace ON payment_orders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON payment_orders(status);

-- ==============================================================================
-- KÍCH HOẠT VÀ THIẾT LẬP ROW-LEVEL SECURITY (RLS) MULTI-TENANT ISOLATION
-- Bảo đảm người dùng chỉ đọc/ghi dữ liệu trong Workspace mình thuộc về
-- ==============================================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- 1. Policy Workspaces: Chủ sở hữu hoặc Thành viên
CREATE POLICY rls_workspaces_access ON workspaces
FOR ALL
USING (
    owner_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = workspaces.id
          AND workspace_members.user_id = auth.uid()
    )
);

-- 2. Policy Workspace Members
CREATE POLICY rls_workspace_members_access ON workspace_members
FOR ALL
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM workspace_members AS wm
        WHERE wm.workspace_id = workspace_members.workspace_id
          AND wm.user_id = auth.uid()
    )
);

-- 3. Policy Subscriptions
CREATE POLICY rls_subscriptions_access ON subscriptions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = subscriptions.workspace_id
          AND workspace_members.user_id = auth.uid()
    )
);

-- 4. Policy Bots
CREATE POLICY rls_bots_access ON bots
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = bots.workspace_id
          AND workspace_members.user_id = auth.uid()
    )
);

-- 5. Policy Rooms
CREATE POLICY rls_rooms_access ON rooms
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = rooms.workspace_id
          AND workspace_members.user_id = auth.uid()
    )
);

-- 6. Policy Room Members
CREATE POLICY rls_room_members_access ON room_members
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM rooms
        JOIN workspace_members ON workspace_members.workspace_id = rooms.workspace_id
        WHERE rooms.id = room_members.room_id
          AND workspace_members.user_id = auth.uid()
    )
);

-- 7. Policy Threads
CREATE POLICY rls_threads_access ON threads
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = threads.workspace_id
          AND workspace_members.user_id = auth.uid()
    )
);

-- 8. Policy Messages
CREATE POLICY rls_messages_access ON messages
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = messages.workspace_id
          AND workspace_members.user_id = auth.uid()
    )
);

-- 9. Policy Memories
CREATE POLICY rls_memories_access ON memories
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = memories.workspace_id
          AND workspace_members.user_id = auth.uid()
    )
);

-- 10. Policy Scheduled Routines
CREATE POLICY rls_routines_access ON scheduled_routines
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = scheduled_routines.workspace_id
          AND workspace_members.user_id = auth.uid()
    )
);

-- 11. Policy Usage Credits
CREATE POLICY rls_usage_credits_access ON usage_credits
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = usage_credits.workspace_id
          AND workspace_members.user_id = auth.uid()
    )
);

-- 12. Policy Payment Orders
CREATE POLICY rls_payment_orders_access ON payment_orders
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = payment_orders.workspace_id
          AND workspace_members.user_id = auth.uid()
    )
);

-- ==============================================================================
-- DỮ LIỆU SEED CÁC GÓI GIÁ PHÊ DUYỆT BỞI CHỦ NHÂN (PLANS SEED DATA)
-- Gồm: Desktop Free, Desktop Pro Lifetime, Starter (BYOK/Credits), Pro Team (BYOK/Credits), Business (BYOK/Credits)
-- ==============================================================================
INSERT INTO plans (
    id, name, description, billing_cycle, price_vnd,
    max_active_bots, max_rooms, max_members, cloud_cron_enabled,
    max_memory_mb, ai_credit_monthly, byok_allowed, is_active
) VALUES
-- 1. Bản Cài Máy Miễn Phí (Desktop Free - Phễu tiếp cận)
(
    'desktop_free',
    'Bản Cài Máy Miễn Phí (Desktop Free)',
    'Trải nghiệm cài đặt trên máy tính cá nhân. BYOK, tối đa 2 bot hoạt động, chạy khi mở app.',
    'one_time',
    0,
    2, 1, 1, FALSE,
    100, 0, TRUE, TRUE
),
-- 2. Bản Cài Máy Vĩnh Viễn (Desktop Pro Lifetime)
(
    'desktop_pro',
    'Bản Cài Máy Vĩnh Viễn (Desktop Pro Lifetime)',
    'Bản quyền vĩnh viễn 1 máy, tối đa 5 bot, 3 phòng họp, cập nhật 12 tháng.',
    'one_time',
    1890000,
    5, 3, 1, FALSE,
    1000, 0, TRUE, TRUE
),
-- 3. Gói Starter Cloud - Phương án A: BYOK (199.000đ/tháng)
(
    'starter_byok',
    'Starter Cloud (BYOK)',
    'Web SaaS Cloud 24/7 cho KOC & Freelancer. Tối đa 5 bot, 3 phòng họp, 10 lịch tự động.',
    'monthly',
    1990000 / 10, -- 199.000 đ
    5, 3, 1, TRUE,
    1000, 0, TRUE, TRUE
),
-- 4. Gói Starter Cloud - Phương án B: Trọn Gói AI Credits (349.000đ/tháng)
(
    'starter_credits',
    'Starter Cloud (Trọn Gói 3M Credits)',
    'Web SaaS Cloud 24/7 tích hợp sẵn 3.000.000 AI Credits/tháng. Dùng ngay không cần tạo API key.',
    'monthly',
    349000,
    5, 3, 1, TRUE,
    1000, 3000000, TRUE, TRUE
),
-- 5. Gói Pro Team Cloud - Phương án A: BYOK (499.000đ/tháng - Bán chạy nhất)
(
    'pro_team_byok',
    'Pro Team Cloud (BYOK)',
    'Web SaaS Cloud 24/7 cho Shop & Nhóm. Tối đa 10 bot liên phòng ban, không giới hạn phòng họp, 30 lịch ngầm.',
    'monthly',
    499000,
    10, 99999, 3, TRUE,
    5000, 0, TRUE, TRUE
),
-- 6. Gói Pro Team Cloud - Phương án B: Trọn Gói AI Credits (799.000đ/tháng)
(
    'pro_team_credits',
    'Pro Team Cloud (Trọn Gói 10M Credits)',
    'Web SaaS Cloud 24/7 tích hợp sẵn 10.000.000 AI Credits/tháng cho cả nhóm 3 người.',
    'monthly',
    799000,
    10, 99999, 3, TRUE,
    5000, 10000000, TRUE, TRUE
),
-- 7. Gói Business Cloud - Phương án A: BYOK (1.290.000đ/tháng)
(
    'business_byok',
    'Business Cloud (BYOK)',
    'Web SaaS Cloud 24/7 cho Doanh nghiệp & Agency. Không giới hạn Bot, 10 thành viên, ưu tiên cao độ.',
    'monthly',
    1290000,
    99999, 99999, 10, TRUE,
    20000, 0, TRUE, TRUE
),
-- 8. Gói Business Cloud - Phương án B: Trọn Gói AI Credits (1.990.000đ/tháng)
(
    'business_credits',
    'Business Cloud (Trọn Gói 30M Credits)',
    'Web SaaS Cloud 24/7 tích hợp sẵn 30.000.000 AI Credits/tháng, 10 thành viên, hỗ trợ kỹ thuật VIP 1-1.',
    'monthly',
    1990000,
    99999, 99999, 10, TRUE,
    20000, 30000000, TRUE, TRUE
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_vnd = EXCLUDED.price_vnd,
    max_active_bots = EXCLUDED.max_active_bots,
    max_rooms = EXCLUDED.max_rooms,
    max_members = EXCLUDED.max_members,
    cloud_cron_enabled = EXCLUDED.cloud_cron_enabled,
    max_memory_mb = EXCLUDED.max_memory_mb,
    ai_credit_monthly = EXCLUDED.ai_credit_monthly,
    byok_allowed = EXCLUDED.byok_allowed;

-- Ghi chú xác nhận hoàn tất migration
COMMENT ON TABLE workspaces IS 'Tổ Chức Nhân Viên AI - Không gian làm việc đa khách hàng (Multi-tenant)';
COMMENT ON TABLE bots IS 'Tổ Chức Nhân Viên AI - Đội ngũ nhân viên AI đa chức năng';
