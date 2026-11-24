'use client';

import { useCallback, useEffect, useState } from 'react';

export type McpTransport = 'stdio' | 'sse' | 'http';
export type McpCategory = 'browser' | 'ui' | 'data' | 'productivity' | 'system' | 'custom';

export interface McpServerItem {
  id: string;
  slug: string;
  name: string;
  category: McpCategory;
  description: string;
  transport: McpTransport;
  command?: string;
  args?: string[];
  url?: string;
  envKeys?: string[];
  tools: string[];
  enabled: boolean;
  isBuiltIn: boolean;
  assignedBotIds: 'all' | string[];
}

export type SkillCategory =
  | 'operations'
  | 'ecommerce'
  | 'seo'
  | 'education'
  | 'qa'
  | 'optimization'
  | 'custom';

export interface SkillItem {
  id: string;
  slug: string;
  name: string;
  category: SkillCategory;
  description: string;
  instructions: string;
  triggers: string[];
  enabled: boolean;
  isBuiltIn: boolean;
  assignedBotIds: 'all' | string[];
}

export type AiProviderProtocol =
  | 'builtin'
  | 'openai_compatible'
  | 'gemini'
  | 'anthropic'
  | 'openrouter'
  | 'ollama_local';

export interface AiProviderItem {
  id: string;
  name: string;
  protocol: AiProviderProtocol;
  baseUrl?: string;
  models: string[];
  defaultModel: string;
  description: string;
  enabled: boolean;
  isDefault: boolean;
  isBuiltIn: boolean;
  requiresKey: boolean;
  /** Tùy chọn lưu cục bộ trên trình duyệt khi người dùng muốn kết nối AI ngoài */
  apiKey?: string;
  assignedBotIds: 'all' | string[];
}

export interface WorkspaceExtensionsState {
  version: number;
  mcps: McpServerItem[];
  skills: SkillItem[];
  aiProviders: AiProviderItem[];
}

export const EXTENSIONS_STORAGE_KEY = 'tochuc_ai_extensions_v1';

export const BUILTIN_MCPS: McpServerItem[] = [
  {
    id: 'mcp-chrome-devtools',
    slug: 'chrome_devtools',
    name: 'Chrome DevTools & Lighthouse',
    category: 'browser',
    description:
      'Kiểm định trực tiếp website trên trình duyệt thật: chấm điểm Lighthouse (SEO, Accessibility, Best Practices), đọc Console/Network và chụp màn hình.',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'chrome-devtools-mcp@latest'],
    tools: [
      'navigate_page',
      'lighthouse_audit',
      'evaluate_script',
      'list_console_messages',
      'list_network_requests',
      'take_screenshot',
    ],
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'mcp-magic-ui',
    slug: 'magic_ui',
    name: 'Magic UI Design System',
    category: 'ui',
    description:
      'Kho component giao diện hiện đại, hiệu ứng chuyển động, thẻ nổi khối và theme đẹp chuẩn React/Tailwind để nâng cấp UI tức thì.',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@magicuidesign/mcp@latest'],
    tools: ['listRegistryItems', 'getRegistryItem', 'searchRegistryItems'],
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'mcp-token-optimizer',
    slug: 'token_optimizer',
    name: 'Token Optimizer (Tiết kiệm 70–95%)',
    category: 'system',
    description:
      'Đọc/sửa mã nguồn theo bộ nhớ đệm thông minh (diff & cache), tìm kiếm khoanh vùng và nén phiên dài để giảm tối đa chi phí token.',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'token-optimizer-mcp'],
    tools: ['smart_read', 'smart_edit', 'smart_write', 'smart_grep', 'smart_glob', 'optimize_session'],
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'mcp-filesystem',
    slug: 'filesystem',
    name: 'Quản lý Tệp Dự Án (Filesystem)',
    category: 'system',
    description:
      'Đọc, ghi, tìm kiếm và tổ chức cây thư mục tài liệu, mã nguồn và tệp đầu ra an toàn trong vùng làm việc được cấp phép.',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', './workspace'],
    tools: ['read_file', 'write_file', 'edit_file', 'list_directory', 'directory_tree', 'search_files'],
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'mcp-sqlite',
    slug: 'sqlite',
    name: 'Cơ Sở Dữ Liệu SQLite',
    category: 'data',
    description:
      'Truy vấn SQL, quản lý bảng khách hàng, đơn hàng, tồn kho và chạy giao dịch cục bộ tốc độ cao không cần máy chủ DB ngoài.',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', './data/workspace.db'],
    tools: ['query', 'execute', 'list-tables', 'describe-table', 'transaction'],
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'mcp-browser',
    slug: 'browser',
    name: 'Trình Duyệt Tự Động (Agent Browser)',
    category: 'browser',
    description:
      'Mở trang web, điền biểu mẫu, bấm nút, đọc nội dung trực tiếp và thu thập dữ liệu thị trường tự động trên trình duyệt thật.',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'agent-browser-mcp'],
    tools: ['agent_browser_open', 'agent_browser_snapshot', 'agent_browser_click', 'agent_browser_fill', 'agent_browser_read'],
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'mcp-computer',
    slug: 'computer',
    name: 'Điều Khiển Máy Tính Desktop (Agent OS)',
    category: 'system',
    description:
      'Kết nối bản Cài Máy Desktop để quản lý cửa sổ ứng dụng, thao tác bàn phím/chuột có kiểm soát và chạy chuỗi tự động hóa nội bộ.',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'desktop-agent-mcp'],
    tools: ['list_windows', 'launch_app', 'get_accessibility_tree', 'run_steps', 'clipboard_read'],
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'mcp-data',
    slug: 'data',
    name: 'Phân Tích Dữ Liệu & Biểu Đồ',
    category: 'data',
    description:
      'Nạp bảng Excel/CSV, thống kê mô tả, truy vấn SQL trên tập dữ liệu và xuất bảng báo cáo tài chính, doanh thu tự động.',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'data-analytics-mcp'],
    tools: ['data_load', 'data_describe', 'data_sql', 'data_show', 'data_export'],
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'mcp-composio',
    slug: 'composio',
    name: 'Gmail, Lịch Google & Ứng Dụng Văn Phòng',
    category: 'productivity',
    description:
      'Kết nối trực tiếp Gmail, Google Calendar, Drive, Notion, Slack để đọc thư, tạo bản nháp phản hồi khách hàng và đồng bộ lịch họp.',
    transport: 'http',
    url: 'https://mcp.composio.dev/sse',
    envKeys: ['COMPOSIO_API_KEY'],
    tools: ['gmail_search_emails', 'gmail_create_draft', 'googlecalendar_list_events', 'COMPOSIO_MULTI_EXECUTE_TOOL'],
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'mcp-openmode',
    slug: 'openmode',
    name: 'Đồ Họa & Dựng Khung 3D (OpenMode)',
    category: 'ui',
    description:
      'Chỉnh sửa cảnh quan, dựng khung hình sản phẩm, banner thương hiệu và phối cảnh 3D tự động cho đội Media Studio.',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'openmode-mcp'],
    tools: ['look', 'render_edit', 'render_frames', 'render_blender'],
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'mcp-code-rewind',
    slug: 'code_rewind',
    name: 'Agent Rewind — Chống Mất Mã Nguồn',
    category: 'system',
    description:
      'Tạo điểm khôi phục toàn dự án (checkpoint/rewind) kèm chuỗi xác thực SHA-256 và lớp chặn guard_effect giúp chống mất code, hoàn tác tức thì mọi lần sửa lỗi hoặc chạy lệnh nhầm.',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@agent-rewind/mcp@1.1.0', 'mcp'],
    tools: [
      'checkpoint',
      'list',
      'rewind',
      'replay',
      'guard_effect',
      'backtrack_candidates',
      'backtrack_commit',
      'savings',
    ],
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
];

export const MCP_QUICK_PRESETS: Array<{
  label: string;
  slug: string;
  name: string;
  category: McpCategory;
  transport: McpTransport;
  command?: string;
  args?: string[];
  url?: string;
  description: string;
  tools: string[];
}> = [
  {
    label: 'Turnback Shadow Git',
    slug: 'turnback',
    name: 'Turnback — Shadow Git Undo',
    category: 'system',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'turnback@latest', 'mcp'],
    description: 'Lưu bản chụp ẩn trước mọi lệnh sửa file/shell (kể cả file chưa commit và .env) để hoàn tác từng bước.',
    tools: ['list_turns', 'diff_turn', 'plan_restore', 'apply_restore'],
  },
  {
    label: 'GitHub MCP',
    slug: 'github',
    name: 'GitHub Repository & PRs',
    category: 'system',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    description: 'Quản lý mã nguồn, tạo nhánh, mở Pull Request và theo dõi Issue trực tiếp trên GitHub.',
    tools: ['create_issue', 'create_pull_request', 'search_code', 'get_file_contents'],
  },
  {
    label: 'Notion MCP',
    slug: 'notion',
    name: 'Notion Workspace & Wiki',
    category: 'productivity',
    transport: 'http',
    url: 'https://mcp.notion.com/mcp',
    description: 'Đọc/ghi tài liệu nội bộ, cơ sở dữ liệu dự án và quy trình SOP trên Notion.',
    tools: ['search_pages', 'create_page', 'update_database_item'],
  },
  {
    label: 'PostgreSQL / Supabase',
    slug: 'postgres',
    name: 'PostgreSQL / Supabase MCP',
    category: 'data',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://localhost:5432/app'],
    description: 'Truy vấn và kiểm tra lược đồ cơ sở dữ liệu PostgreSQL hoặc Supabase thời gian thực.',
    tools: ['query', 'list_tables', 'describe_schema'],
  },
  {
    label: 'Brave Search',
    slug: 'brave_search',
    name: 'Brave Web Search MCP',
    category: 'browser',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    description: 'Tìm kiếm thông tin web, tin tức thị trường và nghiên cứu đối thủ theo thời gian thực.',
    tools: ['brave_web_search', 'brave_local_search'],
  },
  {
    label: 'Figma Design',
    slug: 'figma',
    name: 'Figma Design MCP',
    category: 'ui',
    transport: 'http',
    url: 'https://mcp.figma.com/mcp',
    description: 'Đọc thiết kế UI/UX từ Figma để chuyển sang mã giao diện React/Tailwind chính xác.',
    tools: ['get_design_context', 'get_variables', 'export_assets'],
  },
  {
    label: 'n8n / Webhook',
    slug: 'n8n_webhook',
    name: 'n8n & Workflow Automation',
    category: 'productivity',
    transport: 'sse',
    url: 'https://your-n8n-instance.example.com/mcp/sse',
    description: 'Kích hoạt các luồng tự động hóa đa ứng dụng (Zalo OA, CRM, Google Sheets, Shopee...).',
    tools: ['trigger_workflow', 'list_workflows', 'get_execution_status'],
  },
];

export const BUILTIN_SKILLS: SkillItem[] = [
  {
    id: 'skill-bot-supervision',
    slug: 'bot-supervision',
    name: 'Giám sát & Điều phối Đội ngũ Bot',
    category: 'operations',
    description:
      'Quy trình theo dõi trạng thái hoạt động, chia việc chéo liên phòng ban và tổng hợp báo cáo tiến độ minh bạch.',
    triggers: ['điều phối', 'giám sát bot', 'giao việc', 'báo cáo tổng hợp'],
    instructions: `# SKILL: Giám sát & Điều phối Đội ngũ Bot
- Luôn kiểm tra trạng thái sẵn sàng của từng phòng ban trước khi phân công.
- Chia nhỏ yêu cầu lớn thành đầu việc có người chịu trách nhiệm rõ ràng và đầu ra nghiệm thu cụ thể.
- Báo cáo súc tích, chính xác số liệu thực tế, không tự ý sửa đổi hay xóa dữ liệu nhạy cảm khi chưa được duyệt.`,
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'skill-tiktok-shop',
    slug: 'tiktok-shop-ops',
    name: 'Chuyên gia Vận hành & Tăng trưởng TikTok Shop',
    category: 'ecommerce',
    description:
      'Chẩn đoán GMV Flywheel (Traffic × CTR × CR × AOV), bộ lọc từ khóa cấm chống vi phạm, tính Unit Economics tránh lỗ ngầm.',
    triggers: ['tiktok shop', 'gmv', 'ctr', 'flash sale', 'từ khóa cấm', 'listing'],
    instructions: `# SKILL: Vận hành & Tăng trưởng TikTok Shop
- Áp dụng công thức GMV = Impressions × CTR × CR × AOV để tìm đúng điểm nghẽn gian hàng.
- Tiêu đề SEO Shop Tab chuẩn 60–120 ký tự, đặt từ khóa chính trong 35 ký tự đầu.
- Loại bỏ 100% từ cấm cam kết tuyệt đối ("100%", "tốt nhất", "trị dứt điểm") và không điều hướng giao dịch ngoài sàn.
- Luôn kiểm tra cộng dồn Flash Sale + Voucher Shop + Phí sàn + Hoa hồng Affiliate để bảo vệ biên lợi nhuận ròng.`,
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'skill-token-saver',
    slug: 'token-saver',
    name: 'Chế độ Tiết kiệm Token Tối đa',
    category: 'optimization',
    description:
      'Ưu tiên tái sử dụng bộ nhớ đệm/diff, khoanh vùng tìm kiếm trước khi đọc và gộp tác vụ độc lập chạy song song.',
    triggers: ['tiết kiệm token', 'tối ưu chi phí', 'nén ngữ cảnh'],
    instructions: `# SKILL: Tiết kiệm Token Tối đa
- Luôn ưu tiên đọc có chọn lọc, tránh nạp lại toàn văn tệp chưa thay đổi.
- Khoanh vùng tìm kiếm chính xác trước khi mở rộng ngữ cảnh.
- Gộp các bước kiểm tra độc lập chạy song song; trả lời đi thẳng vào trọng tâm.`,
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'skill-seo-master',
    slug: 'seo-master',
    name: 'SEO Tổng Thể Top Google & Đa Kênh',
    category: 'seo',
    description:
      'Thiết kế cấu trúc Pillar–Cluster, Meta Title/Description, Schema JSON-LD, Sitemap và phủ nội dung đa nền tảng.',
    triggers: ['seo', 'top google', 'từ khóa', 'json-ld', 'pillar'],
    instructions: `# SKILL: SEO Tổng Thể Top Google & Đa Kênh
- Phân loại từ khóa theo ý định tìm kiếm (Nhận diện / Cân nhắc / Chốt đơn).
- Chuẩn hóa H1–H3, liên kết nội bộ về trang dịch vụ/bảng giá, dữ liệu cấu trúc JSON-LD và tốc độ tải trang.
- Nhân bản 1 bài Pillar thành chuỗi nội dung ngắn Facebook, TikTok, YouTube Shorts nhất quán.`,
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'skill-qa-devtools',
    slug: 'qa-devtools-audit',
    name: 'Kiểm định Chất lượng & Lighthouse 100/100',
    category: 'qa',
    description:
      'Rà soát lỗi Console, Network, kiểm tra tương phản màu WCAG AA, vùng chạm nút bấm và chạy kiểm thử tự động trước khi phát hành.',
    triggers: ['kiểm thử', 'lighthouse', 'qa', 'debug', 'console', 'accessibility'],
    instructions: `# SKILL: Kiểm định Chất lượng & Giao diện
- Kiểm tra 0 lỗi Console, 0 lỗi mạng HTTP 4xx/5xx trên mọi tuyến chính.
- Đảm bảo độ tương phản chữ ≥ 4.5:1 trên cả giao diện Sáng và Tối, mọi ô nhập có nhãn/ID đầy đủ, vùng bấm tối thiểu 26×26px.
- Luôn chạy lint, typecheck, unit test và build sản xuất xanh trước khi bàn giao.`,
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'skill-vietqr-billing',
    slug: 'vietqr-billing',
    name: 'Thanh toán VietQR NAPAS 247',
    category: 'ecommerce',
    description:
      'Khởi tạo mã QR chuyển khoản tự động chuẩn NAPAS theo tài khoản ngân hàng do doanh nghiệp tự cấu hình.',
    triggers: ['vietqr', 'qr chuyển khoản', 'thanh toán', 'đối soát'],
    instructions: `# SKILL: Thanh toán VietQR NAPAS 247
- Sử dụng đúng biến môi trường ngân hàng của doanh nghiệp để tạo mã QR thanh toán kèm mã đơn đối soát duy nhất.
- Tuyệt đối không ghi cứng thông tin tài khoản nhạy cảm vào mã nguồn công khai.
- Luôn tóm tắt số tiền, kỳ hạn và mã đơn để khách xác nhận trước khi thực hiện thanh toán.`,
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'skill-education-gvcn',
    slug: 'education-gvcn',
    name: 'Trợ lý Giáo viên Chủ nhiệm & Nhà trường',
    category: 'education',
    description:
      'Soạn kế hoạch bài dạy chuẩn CV 5512, nhận xét học sinh theo Thông tư 27 và viết thông báo phụ huynh tinh tế.',
    triggers: ['giáo án', 'gvcn', 'phụ huynh', 'tt27', 'cv 5512', 'điểm danh'],
    instructions: `# SKILL: Trợ lý Giáo viên & Nhà trường
- Soạn kế hoạch chủ nhiệm tuần, biên bản họp và tin nhắn Zalo phụ huynh ngắn gọn, tích cực, giàu khích lệ.
- Phân nhóm nhận xét học sinh sát năng lực thực tế theo Thông tư 27, không lặp khuôn mẫu máy móc.`,
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'skill-natural-copywriting',
    slug: 'natural-copywriting',
    name: 'Chuốt Văn phong Tự nhiên Tiếng Việt',
    category: 'seo',
    description:
      'Biên tập bài viết, kịch bản bán hàng và tin nhắn CSKH thành giọng điệu tự nhiên, sắc bén như chuyên gia thực thụ.',
    triggers: ['chuốt bài', 'văn phong', 'viết content', 'kịch bản'],
    instructions: `# SKILL: Chuốt Văn phong Tự nhiên
- Mở đầu đi thẳng vào vấn đề người đọc quan tâm, tránh sáo rỗng kiểu máy móc.
- Dùng câu ngắn xen kẽ câu dẫn mạch lạc, ví dụ sát thực tế Việt Nam và lời kêu gọi hành động rõ ràng.`,
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
  {
    id: 'skill-code-loss-guard',
    slug: 'code-loss-guard',
    name: 'Bảo Vệ Mã Nguồn & Checkpoint An Toàn (Code Rewind)',
    category: 'qa',
    description:
      'Quy chuẩn bắt buộc khi tạo và sửa app: tạo checkpoint toàn bộ mã nguồn trước mỗi đợt sửa lớn, đối chiếu diff và rewind tức thì nếu xảy ra lỗi hoặc mất code.',
    triggers: ['checkpoint', 'rewind', 'chống mất code', 'sửa app', 'refactor', 'backup code'],
    instructions: `# SKILL: Bảo Vệ Mã Nguồn & Checkpoint An Toàn
- Luôn gọi \`checkpoint\` (kèm nhãn mô tả rõ ràng) trước khi tái cấu trúc, chỉnh sửa nhiều tệp hoặc chạy lệnh shell có nguy cơ ghi đè/xóa mã nguồn.
- Dùng \`list\` kiểm tra lịch sử điểm khôi phục; nếu lỗi build, mất chức năng hoặc ghi đè nhầm thì gọi \`rewind\` để quay về nguyên trạng an toàn mà vẫn giữ lịch sử \`replay\`.
- Dùng \`guard_effect\` trước các thao tác triển khai hoặc di chuyển dữ liệu không thể hoàn tác.`,
    enabled: true,
    isBuiltIn: true,
    assignedBotIds: 'all',
  },
];

export const BUILTIN_AI_PROVIDERS: AiProviderItem[] = [
  {
    id: 'ai-builtin',
    name: 'AI Tích Hợp Sẵn (Tổ Chức Nhân Viên AI)',
    protocol: 'builtin',
    models: ['Tổ Chức AI Pro (Mặc định)', 'Tổ Chức AI Fast'],
    defaultModel: 'Tổ Chức AI Pro (Mặc định)',
    description:
      'Chạy ngay lập tức trên Web & Xưởng Việc Thật, không cần thiết lập kỹ thuật hay thẻ quốc tế.',
    enabled: true,
    isDefault: true,
    isBuiltIn: true,
    requiresKey: false,
    assignedBotIds: 'all',
  },
  {
    id: 'ai-gemini',
    name: 'Google Gemini',
    protocol: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
    defaultModel: 'gemini-2.5-flash',
    description: 'Xử lý ngữ cảnh dài, phân tích tài liệu tiếng Việt mượt mà và tốc độ phản hồi cao.',
    enabled: true,
    isDefault: false,
    isBuiltIn: true,
    requiresKey: true,
    assignedBotIds: 'all',
  },
  {
    id: 'ai-anthropic',
    name: 'Anthropic Claude',
    protocol: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
    defaultModel: 'claude-3-7-sonnet-latest',
    description: 'Mạnh về lập trình, viết lách tự nhiên, phân tích chuyên sâu và phối hợp tác vụ dài.',
    enabled: true,
    isDefault: false,
    isBuiltIn: true,
    requiresKey: true,
    assignedBotIds: 'all',
  },
  {
    id: 'ai-openai',
    name: 'OpenAI (GPT-4o / o3-mini)',
    protocol: 'openai_compatible',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'gpt-4.1'],
    defaultModel: 'gpt-4o-mini',
    description: 'Hệ sinh thái model phổ biến toàn cầu cho tư vấn, tổng hợp và tự động hóa văn phòng.',
    enabled: true,
    isDefault: false,
    isBuiltIn: true,
    requiresKey: true,
    assignedBotIds: 'all',
  },
  {
    id: 'ai-deepseek',
    name: 'DeepSeek (V3 / R1)',
    protocol: 'openai_compatible',
    baseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
    description: 'Tối ưu chi phí vượt trội cho suy luận logic, phân tích số liệu và viết mã nguồn.',
    enabled: true,
    isDefault: false,
    isBuiltIn: true,
    requiresKey: true,
    assignedBotIds: 'all',
  },
  {
    id: 'ai-openrouter',
    name: 'OpenRouter (100+ Model Đa Hãng)',
    protocol: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      'deepseek/deepseek-chat-v3-0324',
      'anthropic/claude-3.7-sonnet',
      'google/gemini-2.5-pro',
      'meta-llama/llama-3.3-70b-instruct',
    ],
    defaultModel: 'deepseek/deepseek-chat-v3-0324',
    description: 'Một cổng duy nhất kết nối linh hoạt hàng trăm model AI mới nhất từ mọi hãng.',
    enabled: true,
    isDefault: false,
    isBuiltIn: true,
    requiresKey: true,
    assignedBotIds: 'all',
  },
  {
    id: 'ai-groq',
    name: 'Groq Siêu Tốc',
    protocol: 'openai_compatible',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.3-70b-versatile', 'qwen-qwq-32b'],
    defaultModel: 'llama-3.3-70b-versatile',
    description: 'Tốc độ sinh chữ cực nhanh phù hợp cho bot trực chat CSKH và phản hồi tức thời.',
    enabled: true,
    isDefault: false,
    isBuiltIn: true,
    requiresKey: true,
    assignedBotIds: 'all',
  },
  {
    id: 'ai-ollama-local',
    name: 'Ollama / LM Studio (AI Cục Bộ Trên Máy)',
    protocol: 'ollama_local',
    baseUrl: 'http://localhost:11434/v1',
    models: ['qwen2.5:14b', 'llama3.2:latest', 'deepseek-r1:8b'],
    defaultModel: 'qwen2.5:14b',
    description:
      'Chạy mô hình AI hoàn toàn ngoại tuyến ngay trên máy cá nhân (Bản Cài Máy), 0đ phí gọi AI và bảo mật dữ liệu tuyệt đối.',
    enabled: true,
    isDefault: false,
    isBuiltIn: true,
    requiresKey: false,
    assignedBotIds: 'all',
  },
];

export function createDefaultExtensionsState(): WorkspaceExtensionsState {
  return {
    version: 1,
    mcps: BUILTIN_MCPS.map((m) => ({ ...m, args: m.args ? [...m.args] : undefined, tools: [...m.tools] })),
    skills: BUILTIN_SKILLS.map((s) => ({ ...s, triggers: [...s.triggers] })),
    aiProviders: BUILTIN_AI_PROVIDERS.map((a) => ({ ...a, models: [...a.models] })),
  };
}

export function slugifyExtensionId(input: string, fallback = 'custom-item'): string {
  const cleaned = input
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return cleaned || fallback;
}

export function validateMcpDraft(draft: {
  name: string;
  transport: McpTransport;
  command?: string;
  url?: string;
}): string | null {
  if (!draft.name.trim()) return 'Vui lòng nhập tên kết nối MCP.';
  if (draft.transport === 'stdio') {
    if (!draft.command?.trim()) {
      return 'MCP dạng STDIO cần nhập lệnh khởi chạy (ví dụ: npx hoặc node).';
    }
  } else {
    const rawUrl = draft.url?.trim() || '';
    if (!/^https?:\/\/.+/i.test(rawUrl)) {
      return 'MCP dạng SSE / HTTP cần địa chỉ URL hợp lệ bắt đầu bằng https:// hoặc http://.';
    }
  }
  return null;
}

export function validateAiProviderDraft(draft: {
  name: string;
  protocol: AiProviderProtocol;
  baseUrl?: string;
  models: string[];
}): string | null {
  if (!draft.name.trim()) return 'Vui lòng nhập tên nhà cung cấp AI.';
  if (draft.models.length === 0) return 'Vui lòng nhập ít nhất 1 mã model AI.';
  if (
    (draft.protocol === 'openai_compatible' || draft.protocol === 'ollama_local') &&
    draft.baseUrl &&
    !/^https?:\/\/.+/i.test(draft.baseUrl.trim())
  ) {
    return 'Endpoint Base URL phải bắt đầu bằng https:// hoặc http://.';
  }
  return null;
}

export function parseSkillMarkdown(
  markdown: string,
  fallbackName = 'Kỹ năng tùy chỉnh'
): {
  name: string;
  slug: string;
  description: string;
  triggers: string[];
  instructions: string;
} {
  const trimmed = markdown.trim();
  let name = fallbackName;
  let description = 'Kỹ năng chuyên môn tùy chỉnh nhập từ tệp SKILL.md';
  let triggers: string[] = [];
  let body = trimmed;

  const fmMatch = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (fmMatch) {
    const frontmatter = fmMatch[1];
    body = fmMatch[2].trim() || trimmed;
    const nameMatch = frontmatter.match(/^(?:name|title)\s*:\s*(.+)$/im);
    const descMatch = frontmatter.match(/^description\s*:\s*(.+)$/im);
    const trigMatch = frontmatter.match(/^(?:triggers|aliases|tags)\s*:\s*(.+)$/im);
    if (nameMatch) name = nameMatch[1].trim().replace(/^["']|["']$/g, '');
    if (descMatch) description = descMatch[1].trim().replace(/^["']|["']$/g, '');
    if (trigMatch) {
      triggers = trigMatch[1]
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((t) => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    }
  } else {
    const heading = trimmed.match(/^#\s+(.+)$/m);
    if (heading) name = heading[1].trim();
  }

  return {
    name,
    slug: slugifyExtensionId(name, 'custom-skill'),
    description,
    triggers,
    instructions: body,
  };
}

/**
 * Xuất cấu hình chuẩn `mcp.json` (tương thích Bản Cài Máy Desktop, Cursor, Claude Desktop & OpenMausBot).
 * Không bao giờ xuất khóa bí mật thực.
 */
export function buildMcpJsonExport(mcps: McpServerItem[]): string {
  const mcpServers: Record<string, Record<string, unknown>> = {};
  for (const item of mcps) {
    if (!item.enabled) continue;
    if (item.transport === 'stdio') {
      mcpServers[item.slug] = {
        command: item.command || 'npx',
        args: item.args || [],
        ...(item.envKeys && item.envKeys.length > 0
          ? {
              env: Object.fromEntries(item.envKeys.map((k) => [k, `<DIEN_${k}>`])),
            }
          : {}),
      };
    } else {
      mcpServers[item.slug] = {
        transport: item.transport,
        url: item.url || '',
      };
    }
  }
  return JSON.stringify({ mcpServers }, null, 2);
}

export function isItemAssignedToBot(
  assignedBotIds: 'all' | string[],
  botId?: string | null
): boolean {
  if (assignedBotIds === 'all') return true;
  if (!botId) return true;
  return assignedBotIds.includes(botId);
}

export function getBotActiveContext(
  state: WorkspaceExtensionsState,
  botId?: string | null
): {
  mcps: McpServerItem[];
  skills: SkillItem[];
  defaultProvider: AiProviderItem;
  combinedSkillPrompt: string;
} {
  const mcps = state.mcps.filter((m) => m.enabled && isItemAssignedToBot(m.assignedBotIds, botId));
  const skills = state.skills.filter(
    (s) => s.enabled && isItemAssignedToBot(s.assignedBotIds, botId)
  );
  const defaultProvider =
    state.aiProviders.find((p) => p.enabled && p.isDefault) ||
    state.aiProviders.find((p) => p.enabled) ||
    BUILTIN_AI_PROVIDERS[0];

  const skillChunks = skills
    .slice(0, 6)
    .map((s) => `[Skill: ${s.name}]\n${s.instructions.slice(0, 480)}`);
  const mcpSummary =
    mcps.length > 0 ? `[MCP đang kết nối]: ${mcps.map((m) => m.slug).join(', ')}` : '';

  const combinedSkillPrompt = [mcpSummary, ...skillChunks].filter(Boolean).join('\n\n');

  return { mcps, skills, defaultProvider, combinedSkillPrompt };
}

export function getAvailableModelOptions(providers: AiProviderItem[]): Array<{
  label: string;
  value: string;
  providerName: string;
}> {
  const seen = new Set<string>();
  const options: Array<{ label: string; value: string; providerName: string }> = [];
  for (const p of providers) {
    if (!p.enabled) continue;
    for (const model of p.models) {
      const key = `${p.id}:${model}`;
      if (seen.has(key)) continue;
      seen.add(key);
      options.push({
        label: `${model} (${p.name})`,
        value: model,
        providerName: p.name,
      });
    }
  }
  return options;
}

function mergeWithBuiltIns(saved: Partial<WorkspaceExtensionsState>): WorkspaceExtensionsState {
  const defaults = createDefaultExtensionsState();
  const savedMcps = Array.isArray(saved.mcps) ? saved.mcps : [];
  const savedSkills = Array.isArray(saved.skills) ? saved.skills : [];
  const savedAis = Array.isArray(saved.aiProviders) ? saved.aiProviders : [];

  const mcpIds = new Set(savedMcps.map((m) => m.id));
  const skillIds = new Set(savedSkills.map((s) => s.id));
  const aiIds = new Set(savedAis.map((a) => a.id));

  const mergedAis = [...savedAis, ...defaults.aiProviders.filter((a) => !aiIds.has(a.id))];
  if (!mergedAis.some((a) => a.isDefault && a.enabled) && mergedAis.length > 0) {
    mergedAis[0] = { ...mergedAis[0], isDefault: true, enabled: true };
  }

  return {
    version: 1,
    mcps: [...savedMcps, ...defaults.mcps.filter((m) => !mcpIds.has(m.id))],
    skills: [...savedSkills, ...defaults.skills.filter((s) => !skillIds.has(s.id))],
    aiProviders: mergedAis,
  };
}

export interface WorkspaceExtensionsController {
  state: WorkspaceExtensionsState;
  enabledMcpCount: number;
  enabledSkillCount: number;
  enabledAiCount: number;
  defaultAiProvider: AiProviderItem;
  availableModels: Array<{ label: string; value: string; providerName: string }>;
  addMcp: (draft: Omit<McpServerItem, 'id' | 'isBuiltIn'>) => McpServerItem;
  toggleMcp: (id: string) => void;
  deleteMcp: (id: string) => void;
  updateMcpBots: (id: string, assignedBotIds: 'all' | string[]) => void;
  addSkill: (draft: Omit<SkillItem, 'id' | 'isBuiltIn'>) => SkillItem;
  toggleSkill: (id: string) => void;
  deleteSkill: (id: string) => void;
  updateSkillBots: (id: string, assignedBotIds: 'all' | string[]) => void;
  addAiProvider: (draft: Omit<AiProviderItem, 'id' | 'isBuiltIn'>) => AiProviderItem;
  updateAiProvider: (id: string, patch: Partial<AiProviderItem>) => void;
  toggleAiProvider: (id: string) => void;
  setDefaultAiProvider: (id: string) => void;
  deleteAiProvider: (id: string) => void;
  getContextForBot: (botId?: string | null) => ReturnType<typeof getBotActiveContext>;
  resetDefaults: () => void;
}

export function useWorkspaceExtensions(): WorkspaceExtensionsController {
  const [state, setState] = useState<WorkspaceExtensionsState>(() => createDefaultExtensionsState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EXTENSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WorkspaceExtensionsState>;
        setState(mergeWithBuiltIns(parsed));
      }
    } catch {
      // Ignore corrupt storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(EXTENSIONS_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state, hydrated]);

  const addMcp = useCallback((draft: Omit<McpServerItem, 'id' | 'isBuiltIn'>): McpServerItem => {
    const created: McpServerItem = {
      ...draft,
      id: `mcp-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slug: slugifyExtensionId(draft.slug || draft.name, 'custom-mcp'),
      isBuiltIn: false,
    };
    setState((prev) => ({ ...prev, mcps: [created, ...prev.mcps] }));
    return created;
  }, []);

  const toggleMcp = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      mcps: prev.mcps.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)),
    }));
  }, []);

  const deleteMcp = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      mcps: prev.mcps.filter((m) => m.id !== id || m.isBuiltIn),
    }));
  }, []);

  const updateMcpBots = useCallback((id: string, assignedBotIds: 'all' | string[]) => {
    setState((prev) => ({
      ...prev,
      mcps: prev.mcps.map((m) => (m.id === id ? { ...m, assignedBotIds } : m)),
    }));
  }, []);

  const addSkill = useCallback((draft: Omit<SkillItem, 'id' | 'isBuiltIn'>): SkillItem => {
    const created: SkillItem = {
      ...draft,
      id: `skill-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slug: slugifyExtensionId(draft.slug || draft.name, 'custom-skill'),
      isBuiltIn: false,
    };
    setState((prev) => ({ ...prev, skills: [created, ...prev.skills] }));
    return created;
  }, []);

  const toggleSkill = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    }));
  }, []);

  const deleteSkill = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id || s.isBuiltIn),
    }));
  }, []);

  const updateSkillBots = useCallback((id: string, assignedBotIds: 'all' | string[]) => {
    setState((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, assignedBotIds } : s)),
    }));
  }, []);

  const addAiProvider = useCallback(
    (draft: Omit<AiProviderItem, 'id' | 'isBuiltIn'>): AiProviderItem => {
      const created: AiProviderItem = {
        ...draft,
        id: `ai-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        isBuiltIn: false,
      };
      setState((prev) => ({
        ...prev,
        aiProviders: draft.isDefault
          ? [created, ...prev.aiProviders.map((a) => ({ ...a, isDefault: false }))]
          : [created, ...prev.aiProviders],
      }));
      return created;
    },
    []
  );

  const updateAiProvider = useCallback((id: string, patch: Partial<AiProviderItem>) => {
    setState((prev) => ({
      ...prev,
      aiProviders: prev.aiProviders.map((a) => {
        if (a.id === id) return { ...a, ...patch };
        if (patch.isDefault) return { ...a, isDefault: false };
        return a;
      }),
    }));
  }, []);

  const toggleAiProvider = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      aiProviders: prev.aiProviders.map((a) => {
        if (a.id !== id) return a;
        if (a.id === 'ai-builtin') return a; // Always keep built-in engine available as safe fallback
        return { ...a, enabled: !a.enabled };
      }),
    }));
  }, []);

  const setDefaultAiProvider = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      aiProviders: prev.aiProviders.map((a) => ({
        ...a,
        enabled: a.id === id ? true : a.enabled,
        isDefault: a.id === id,
      })),
    }));
  }, []);

  const deleteAiProvider = useCallback((id: string) => {
    setState((prev) => {
      const remaining = prev.aiProviders.filter((a) => a.id !== id || a.isBuiltIn);
      if (!remaining.some((a) => a.isDefault) && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isDefault: true, enabled: true };
      }
      return { ...prev, aiProviders: remaining };
    });
  }, []);

  const getContextForBot = useCallback(
    (botId?: string | null) => getBotActiveContext(state, botId),
    [state]
  );

  const resetDefaults = useCallback(() => {
    setState(createDefaultExtensionsState());
  }, []);

  const enabledMcpCount = state.mcps.filter((m) => m.enabled).length;
  const enabledSkillCount = state.skills.filter((s) => s.enabled).length;
  const enabledAiCount = state.aiProviders.filter((a) => a.enabled).length;
  const defaultAiProvider =
    state.aiProviders.find((a) => a.isDefault && a.enabled) ||
    state.aiProviders[0] ||
    BUILTIN_AI_PROVIDERS[0];
  const availableModels = getAvailableModelOptions(state.aiProviders);

  return {
    state,
    enabledMcpCount,
    enabledSkillCount,
    enabledAiCount,
    defaultAiProvider,
    availableModels,
    addMcp,
    toggleMcp,
    deleteMcp,
    updateMcpBots,
    addSkill,
    toggleSkill,
    deleteSkill,
    updateSkillBots,
    addAiProvider,
    updateAiProvider,
    toggleAiProvider,
    setDefaultAiProvider,
    deleteAiProvider,
    getContextForBot,
    resetDefaults,
  };
}
