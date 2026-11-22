use crate::models::{AppError, AppTier, Bot, MemoryItem, QuotaStatus, Room};
use crate::quota::{
    check_bot_activation_quota, check_room_creation_quota, get_machine_hardware_id,
    verify_desktop_pro_license, BRAND_EMAIL, BRAND_NAME, BRAND_ZALO,
    FREE_TIER_MAX_ACTIVE_BOTS, FREE_TIER_MAX_ROOMS,
};
use rusqlite::{params, Connection};
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct Storage {
    conn: Arc<Mutex<Connection>>,
    pub machine_id: String,
}

impl Storage {
    pub fn new() -> Result<Self, AppError> {
        let db_path = Self::resolve_db_path()?;
        if let Some(parent) = db_path.parent() {
            fs::create_dir_all(parent)?;
        }

        let conn = Connection::open(&db_path)?;
        let machine_id = get_machine_hardware_id();

        let storage = Self {
            conn: Arc::new(Mutex::new(conn)),
            machine_id,
        };

        storage.init_tables()?;
        storage.seed_initial_data_if_needed()?;

        Ok(storage)
    }

    fn resolve_db_path() -> Result<PathBuf, AppError> {
        let base_dir = dirs::data_local_dir()
            .or_else(dirs::home_dir)
            .unwrap_or_else(|| PathBuf::from("."));
        Ok(base_dir.join("tochucnhanvienai").join("desktop.db"))
    }

    fn init_tables(&self) -> Result<(), AppError> {
        let conn = self.conn.lock().unwrap();

        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS licenses (
                id TEXT PRIMARY KEY,
                license_key TEXT NOT NULL,
                tier TEXT NOT NULL,
                machine_id TEXT NOT NULL,
                activated_at TEXT NOT NULL,
                signature TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS bots (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                department TEXT NOT NULL,
                avatar TEXT NOT NULL,
                system_prompt TEXT NOT NULL,
                model TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 0,
                is_template INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS rooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS room_members (
                room_id TEXT NOT NULL,
                bot_id TEXT NOT NULL,
                PRIMARY KEY (room_id, bot_id)
            );

            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                bot_id TEXT,
                memory_key TEXT NOT NULL,
                content TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            ",
        )?;

        Ok(())
    }

    fn seed_initial_data_if_needed(&self) -> Result<(), AppError> {
        let conn = self.conn.lock().unwrap();

        let bot_count: i64 = conn.query_row("SELECT COUNT(*) FROM bots", [], |r| r.get(0))?;
        if bot_count == 0 {
            let now = chrono::Utc::now().to_rfc3339();
            
            // 2 bot đầu tiên được kích hoạt mặc định (đạt mốc 2/2 Bot của bản Desktop Free)
            conn.execute(
                "INSERT INTO bots (id, name, role, department, avatar, system_prompt, model, is_active, is_template, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 1, 1, ?8, ?8)",
                params![
                    "bot-dev-001",
                    "Dev",
                    "Kỹ sư Lập trình",
                    "Ship Software Safely",
                    "dev-avatar.png",
                    "Bạn là Dev - Kỹ sư Lập trình của Tổ Chức Nhân Viên AI. Đọc code, sửa lỗi, chạy test và giải thích thay đổi ngắn gọn.",
                    "claude-3-5-sonnet",
                    now
                ],
            )?;

            conn.execute(
                "INSERT INTO bots (id, name, role, department, avatar, system_prompt, model, is_active, is_template, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 1, 1, ?8, ?8)",
                params![
                    "bot-orbit-002",
                    "Orbit",
                    "Giám sát & Điều phối Bot",
                    "General",
                    "orbit-avatar.png",
                    "Bạn là Orbit - Giám sát & Điều phối của Tổ Chức Nhân Viên AI. Quản lý tiến độ công việc giữa các phòng ban.",
                    "gpt-4o",
                    now
                ],
            )?;

            // Các bot mẫu tiếp theo để ở trạng thái tắt (Inactive)
            conn.execute(
                "INSERT INTO bots (id, name, role, department, avatar, system_prompt, model, is_active, is_template, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, 1, ?8, ?8)",
                params![
                    "bot-listing-003",
                    "Listing Pro",
                    "Chuyên gia SEO Tổng Thể",
                    "Marketing",
                    "listing-avatar.png",
                    "Chuyên gia SEO Website Top Google, TikTok Shop, Shopee và mạng xã hội.",
                    "gemini-1.5-pro",
                    now
                ],
            )?;

            conn.execute(
                "INSERT INTO bots (id, name, role, department, avatar, system_prompt, model, is_active, is_template, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, 1, ?8, ?8)",
                params![
                    "bot-echo-004",
                    "Echo",
                    "Chuốt Văn phong Tự nhiên",
                    "General",
                    "echo-avatar.png",
                    "Chuốt văn bản tự nhiên, giàu cảm xúc, đúng chuẩn ngôn từ Việt Nam.",
                    "gpt-4o-mini",
                    now
                ],
            )?;

            // Phòng họp ban đầu (1/1 Phòng họp của bản Desktop Free)
            conn.execute(
                "INSERT INTO rooms (id, name, description, created_at)
                 VALUES (?1, ?2, ?3, ?4)",
                params![
                    "room-executive-001",
                    "Ban Điều Hành Tổng",
                    "Phòng họp trao đổi giữa Chủ nhân, Dev và Orbit",
                    now
                ],
            )?;

            conn.execute(
                "INSERT INTO room_members (room_id, bot_id) VALUES (?1, ?2), (?1, ?3)",
                params!["room-executive-001", "bot-dev-001", "bot-orbit-002"],
            )?;
        }

        Ok(())
    }

    pub fn get_tier(&self) -> Result<AppTier, AppError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT tier FROM licenses WHERE machine_id = ?1 ORDER BY activated_at DESC LIMIT 1")?;
        let mut rows = stmt.query(params![self.machine_id])?;

        if let Some(row) = rows.next()? {
            let tier_str: String = row.get(0)?;
            if tier_str == "desktop_pro" {
                return Ok(AppTier::DesktopPro);
            }
        }

        Ok(AppTier::DesktopFree)
    }

    pub fn get_quota_status(&self) -> Result<QuotaStatus, AppError> {
        let tier = self.get_tier()?;
        let conn = self.conn.lock().unwrap();

        let current_active_bots: i64 = conn.query_row(
            "SELECT COUNT(*) FROM bots WHERE is_active = 1",
            [],
            |r| r.get(0),
        )?;

        let total_bots_configured: i64 = conn.query_row(
            "SELECT COUNT(*) FROM bots",
            [],
            |r| r.get(0),
        )?;

        let current_rooms: i64 = conn.query_row(
            "SELECT COUNT(*) FROM rooms",
            [],
            |r| r.get(0),
        )?;

        let license_key_masked = if tier == AppTier::DesktopPro {
            let key_opt: Result<String, _> = conn.query_row(
                "SELECT license_key FROM licenses WHERE machine_id = ?1 LIMIT 1",
                params![self.machine_id],
                |r| r.get(0),
            );
            key_opt.ok().map(|k| {
                if k.len() >= 12 {
                    format!("{}****-****{}", &k[0..8], &k[k.len() - 4..])
                } else {
                    "TNVA-PRO-****".to_string()
                }
            })
        } else {
            None
        };

        let is_pro = tier == AppTier::DesktopPro;
        let (max_active_bots, max_rooms) = if is_pro {
            (9999, 9999)
        } else {
            (FREE_TIER_MAX_ACTIVE_BOTS, FREE_TIER_MAX_ROOMS)
        };

        Ok(QuotaStatus {
            brand: BRAND_NAME.to_string(),
            tier: tier.clone(),
            tier_name: tier.to_string(),
            max_active_bots,
            current_active_bots: current_active_bots as usize,
            total_bots_configured: total_bots_configured as usize,
            max_rooms,
            current_rooms: current_rooms as usize,
            is_pro_licensed: is_pro,
            license_key_masked,
            machine_id: self.machine_id.clone(),
            can_run_background_daemon_247: false, // Bản desktop cục bộ không hỗ trợ chạy ngầm 24/7 khi tắt app
            contact_zalo: BRAND_ZALO.to_string(),
            contact_email: BRAND_EMAIL.to_string(),
        })
    }

    pub fn activate_desktop_pro(&self, key: &str) -> Result<QuotaStatus, AppError> {
        let record = verify_desktop_pro_license(key, &self.machine_id)?;

        {
            let conn = self.conn.lock().unwrap();
            conn.execute(
                "INSERT OR REPLACE INTO licenses (id, license_key, tier, machine_id, activated_at, signature)
                 VALUES (?1, ?2, 'desktop_pro', ?3, ?4, ?5)",
                params![
                    record.id,
                    record.license_key,
                    record.machine_id,
                    record.activated_at,
                    record.signature
                ],
            )?;
        }

        self.get_quota_status()
    }

    pub fn list_bots(&self) -> Result<Vec<Bot>, AppError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, role, department, avatar, system_prompt, model, is_active, is_template, created_at, updated_at
             FROM bots ORDER BY created_at ASC",
        )?;

        let bot_iter = stmt.query_map([], |row| {
            Ok(Bot {
                id: row.get(0)?,
                name: row.get(1)?,
                role: row.get(2)?,
                department: row.get(3)?,
                avatar: row.get(4)?,
                system_prompt: row.get(5)?,
                model: row.get(6)?,
                is_active: row.get::<_, i64>(7)? == 1,
                is_template: row.get::<_, i64>(8)? == 1,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })?;

        let mut bots = Vec::new();
        for b in bot_iter {
            bots.push(b?);
        }
        Ok(bots)
    }

    pub fn set_bot_active(&self, bot_id: &str, active: bool) -> Result<(), AppError> {
        let tier = self.get_tier()?;
        let conn = self.conn.lock().unwrap();

        if active {
            // Kiểm tra trạng thái hiện tại của bot
            let currently_active: bool = conn.query_row(
                "SELECT is_active FROM bots WHERE id = ?1",
                params![bot_id],
                |r| Ok(r.get::<_, i64>(0)? == 1),
            )?;

            if !currently_active {
                let current_active_count: i64 = conn.query_row(
                    "SELECT COUNT(*) FROM bots WHERE is_active = 1",
                    [],
                    |r| r.get(0),
                )?;
                // Khóa cứng tầng Rust: Báo lỗi nếu vượt hạn mức Free (2 Bot)
                check_bot_activation_quota(current_active_count as usize, &tier)?;
            }
        }

        let now = chrono::Utc::now().to_rfc3339();
        let rows = conn.execute(
            "UPDATE bots SET is_active = ?1, updated_at = ?2 WHERE id = ?3",
            params![if active { 1 } else { 0 }, now, bot_id],
        )?;

        if rows == 0 {
            return Err(AppError::NotFound(format!("Không tìm thấy Bot có ID '{}'", bot_id)));
        }

        Ok(())
    }

    pub fn save_bot(&self, bot: &Bot) -> Result<(), AppError> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO bots (id, name, role, department, avatar, system_prompt, model, is_active, is_template, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
             ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                role = excluded.role,
                department = excluded.department,
                avatar = excluded.avatar,
                system_prompt = excluded.system_prompt,
                model = excluded.model,
                updated_at = excluded.updated_at",
            params![
                bot.id,
                bot.name,
                bot.role,
                bot.department,
                bot.avatar,
                bot.system_prompt,
                bot.model,
                if bot.is_active { 1 } else { 0 },
                if bot.is_template { 1 } else { 0 },
                bot.created_at,
                now
            ],
        )?;

        Ok(())
    }

    pub fn list_rooms(&self) -> Result<Vec<Room>, AppError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, name, description, created_at FROM rooms ORDER BY created_at ASC")?;

        let room_iter = stmt.query_map([], |row| {
            let room_id: String = row.get(0)?;
            Ok((
                room_id,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
            ))
        })?;

        let mut rooms = Vec::new();
        for r in room_iter {
            let (room_id, name, description, created_at) = r?;
            let mut member_stmt = conn.prepare("SELECT bot_id FROM room_members WHERE room_id = ?1")?;
            let members: Result<Vec<String>, _> = member_stmt
                .query_map(params![room_id], |row| row.get(0))?
                .collect();

            rooms.push(Room {
                id: room_id,
                name,
                description,
                member_bot_ids: members?,
                created_at,
            });
        }

        Ok(rooms)
    }

    pub fn create_room(&self, room: &Room) -> Result<(), AppError> {
        let tier = self.get_tier()?;
        let conn = self.conn.lock().unwrap();

        let current_room_count: i64 = conn.query_row("SELECT COUNT(*) FROM rooms", [], |r| r.get(0))?;
        // Khóa cứng tầng Rust: Báo lỗi nếu vượt hạn mức Free (1 Phòng họp)
        check_room_creation_quota(current_room_count as usize, &tier)?;

        conn.execute(
            "INSERT INTO rooms (id, name, description, created_at) VALUES (?1, ?2, ?3, ?4)",
            params![room.id, room.name, room.description, room.created_at],
        )?;

        for bot_id in &room.member_bot_ids {
            conn.execute(
                "INSERT OR IGNORE INTO room_members (room_id, bot_id) VALUES (?1, ?2)",
                params![room.id, bot_id],
            )?;
        }

        Ok(())
    }

    pub fn list_memories(&self, bot_id: Option<&str>) -> Result<Vec<MemoryItem>, AppError> {
        let conn = self.conn.lock().unwrap();
        let mut memories = Vec::new();

        if let Some(bid) = bot_id {
            let mut stmt = conn.prepare("SELECT id, bot_id, memory_key, content, updated_at FROM memories WHERE bot_id = ?1")?;
            let rows = stmt.query_map(params![bid], |r| {
                Ok(MemoryItem {
                    id: r.get(0)?,
                    bot_id: r.get(1)?,
                    memory_key: r.get(2)?,
                    content: r.get(3)?,
                    updated_at: r.get(4)?,
                })
            })?;
            for m in rows {
                memories.push(m?);
            }
        } else {
            let mut stmt = conn.prepare("SELECT id, bot_id, memory_key, content, updated_at FROM memories")?;
            let rows = stmt.query_map([], |r| {
                Ok(MemoryItem {
                    id: r.get(0)?,
                    bot_id: r.get(1)?,
                    memory_key: r.get(2)?,
                    content: r.get(3)?,
                    updated_at: r.get(4)?,
                })
            })?;
            for m in rows {
                memories.push(m?);
            }
        }

        Ok(memories)
    }

    pub fn save_memory(&self, item: &MemoryItem) -> Result<(), AppError> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO memories (id, bot_id, memory_key, content, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(id) DO UPDATE SET
                content = excluded.content,
                updated_at = excluded.updated_at",
            params![item.id, item.bot_id, item.memory_key, item.content, now],
        )?;

        Ok(())
    }
}
