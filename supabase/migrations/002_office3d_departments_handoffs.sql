-- ==============================================================================
-- DỰ ÁN: TỔ CHỨC NHÂN VIÊN AI (HYBRID AI WORKSPACE)
-- MIGRATION: 002_office3d_departments_handoffs.sql
-- MÔ TẢ: Lưu trữ Phòng ban tùy biến & Luồng bàn giao liên phòng ban (Văn phòng 3D)
--         kèm Row-Level Security (RLS) cô lập dữ liệu theo workspace_members.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS office_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    slug VARCHAR(64) NOT NULL,
    name VARCHAR(120) NOT NULL,
    short_label VARCHAR(60) NOT NULL,
    color_hex VARCHAR(7) NOT NULL DEFAULT '#00f5ff' CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
    description TEXT DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, slug)
);

CREATE TABLE IF NOT EXISTS office_handoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    from_department_id UUID NOT NULL REFERENCES office_departments(id) ON DELETE CASCADE,
    to_department_id UUID NOT NULL REFERENCES office_departments(id) ON DELETE CASCADE,
    label VARCHAR(180) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (from_department_id <> to_department_id)
);

CREATE INDEX IF NOT EXISTS idx_office_departments_workspace
    ON office_departments(workspace_id);

CREATE INDEX IF NOT EXISTS idx_office_handoffs_workspace
    ON office_handoffs(workspace_id);

-- Bật Row-Level Security (RLS)
ALTER TABLE office_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_handoffs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "office_departments_member_access" ON office_departments;
CREATE POLICY "office_departments_member_access"
    ON office_departments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = office_departments.workspace_id
              AND wm.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = office_departments.workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('owner', 'admin', 'member')
        )
    );

DROP POLICY IF EXISTS "office_handoffs_member_access" ON office_handoffs;
CREATE POLICY "office_handoffs_member_access"
    ON office_handoffs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = office_handoffs.workspace_id
              AND wm.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = office_handoffs.workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('owner', 'admin', 'member')
        )
    );
