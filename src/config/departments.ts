import { BRAND_CONFIG } from "./brand";

export type DepartmentId = "tiktok-shop" | "marketing-seo" | "education-gvcn" | "sme-office";

export interface BotMember {
  id: string;
  name: string;
  role: string;
  avatarCode: string;
  colorClass: string;
  isChief?: boolean;
  /** Bot thứ 3 trở đi bị khóa trên Desktop Free (tối đa 2 Bot) để minh họa rõ lợi ích nâng cấp Cloud */
  cloudOnly?: boolean;
  specialty: string;
}

export interface DelegationStep {
  botId: string;
  botName: string;
  role: string;
  actionTag: string;
  message: string;
  deliverable?: string;
  durationLabel: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  userPrompt: string;
  steps: DelegationStep[];
  finalOutcome: string;
}

export interface AutomatedRoutine {
  id: string;
  title: string;
  schedule: string;
  ownerBot: string;
  summary: string;
  /** true = yêu cầu Bản Thuê Cloud chạy ngầm 24/7 ngay cả khi tắt máy */
  requiresCloud247: boolean;
}

export interface DepartmentTemplate {
  id: DepartmentId;
  shortName: string;
  name: string;
  tagline: string;
  targetAudience: string;
  timeSaved: string;
  badgeText: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  externalDemo?: {
    label: string;
    url: string;
    note: string;
  };
  bots: BotMember[];
  scenarios: DemoScenario[];
  routines: AutomatedRoutine[];
  highlights: string[];
}

export const DEPARTMENTS: DepartmentTemplate[] = [
  {
    id: "tiktok-shop",
    shortName: "TikTok Shop / TMĐT",
    name: "Phòng Vận hành TikTok Shop & TMĐT",
    tagline: "Tối ưu listing chuẩn SEO, chống vi phạm từ khóa cấm, phân tích GMV và trực CSKH 24/7.",
    targetAudience: "Chủ shop TikTok Shop, Shopee, nhà bán hàng cá nhân & đội vận hành TMĐT",
    timeSaved: "Tiết kiệm 3–4 giờ vận hành mỗi ngày",
    badgeText: "Phổ biến nhất",
    accentBg: "bg-indigo-50",
    accentText: "text-indigo-700",
    accentBorder: "border-indigo-200",
    bots: [
      {
        id: "ts-chief",
        name: "Shop Chief",
        role: "Trưởng phòng Vận hành TMĐT",
        avatarCode: "SC",
        colorClass: "bg-indigo-600 text-white",
        isChief: true,
        specialty: "Điều phối đơn hàng, đọc Data Compass GMV và kiểm soát biên lợi nhuận.",
      },
      {
        id: "ts-seo",
        name: "Listing Guard",
        role: "Chuyên gia Tiêu đề SEO & Chống Vi Phạm",
        avatarCode: "LG",
        colorClass: "bg-sky-700 text-white",
        specialty: "Viết tiêu đề 60–120 ký tự chuẩn Shop Tab, rà soát từ khóa cấm trước khi đăng.",
      },
      {
        id: "ts-cskh",
        name: "Chốt Đơn 24/7",
        role: "Tư vấn & Chăm sóc Khách hàng",
        avatarCode: "CS",
        colorClass: "bg-emerald-700 text-white",
        cloudOnly: true,
        specialty: "Trả lời tin nhắn size/vận chuyển, xin đánh giá 5 sao và xử lý khiếu nại sớm.",
      },
      {
        id: "ts-aff",
        name: "KOC Affiliate",
        role: "Săn KOC & Tối ưu Flash Sale",
        avatarCode: "KO",
        colorClass: "bg-amber-800 text-white",
        cloudOnly: true,
        specialty: "Lọc danh sách KOC hợp ngách, kiểm tra chồng chéo Voucher + Flash Sale không lỗ vốn.",
      },
    ],
    scenarios: [
      {
        id: "ts-audit-sku",
        title: "Tối ưu 15 SKU tụt CTR & lọc từ khóa cấm",
        userPrompt:
          "Kiểm tra 15 mã sản phẩm chủ lực bị tụt lượt nhấp (CTR < 1.8%), sửa tiêu đề chuẩn SEO Shop Tab và kiểm tra nguy cơ chồng khuyến mãi lỗ vốn.",
        steps: [
          {
            botId: "ts-chief",
            botName: "Shop Chief",
            role: "Trưởng phòng Vận hành TMĐT",
            actionTag: "Phân tách & Giao việc",
            message:
              "Đã nhận yêu cầu cho 15 Hero SKU. Chia 2 luồng song song: @Listing Guard rà soát bộ lọc từ khóa cấm & viết lại tiêu đề SEO 80–110 ký tự; @KOC Affiliate tính lại biên lợi nhuận sau khi cộng dồn Flash Sale + Voucher + hoa hồng.",
            durationLabel: "00:02",
          },
          {
            botId: "ts-seo",
            botName: "Listing Guard",
            role: "Chuyên gia Tiêu đề SEO & Chống Vi Phạm",
            actionTag: "Kiểm duyệt chính sách",
            message:
              "Phát hiện 3 tiêu đề chứa cụm từ rủi ro ('tốt nhất', 'trắng tức thì'). Đã chuyển sang cụm an toàn chuẩn SEO Shop Tab và đề xuất bố cục ảnh bìa số 1 nổi bật USP rõ hơn.",
            deliverable: "15 tiêu đề chuẩn SEO + Cảnh báo 3 cụm từ cấm",
            durationLabel: "00:08",
          },
          {
            botId: "ts-aff",
            botName: "KOC Affiliate",
            role: "Săn KOC & Tối ưu Flash Sale",
            actionTag: "Kiểm tra biên lợi nhuận",
            message:
              "Cảnh báo 2 mã đang trùng Voucher 15% + Flash Sale 20% + Affiliate 12% làm biên ròng âm -4.2%. Đã tính lại ngưỡng Voucher theo đơn từ 249.000đ để giữ biên ròng dương +18%.",
            deliverable: "Bảng Unit Economics 15 SKU + Ngưỡng Combo an toàn",
            durationLabel: "00:14",
          },
          {
            botId: "ts-chief",
            botName: "Shop Chief",
            role: "Trưởng phòng Vận hành TMĐT",
            actionTag: "Tổng hợp bàn giao",
            message:
              "Hoàn tất rà soát 15 SKU. Mời chủ shop duyệt 2 nút thay đổi giá khuyến mãi trước khi cập nhật lên Seller Center.",
            deliverable: "Báo cáo tổng hợp sẵn sàng áp dụng",
            durationLabel: "00:18",
          },
        ],
        finalOutcome:
          "Loại bỏ 100% rủi ro điểm vi phạm, chuẩn hóa 15 tiêu đề SEO Shop Tab và chặn ngay 2 mã có nguy cơ lỗ ngầm khi chạy Flash Sale.",
      },
      {
        id: "ts-sla-order",
        title: "Rà soát đơn sắp quá hạn SLA & đơn hoàn",
        userPrompt:
          "Tổng hợp đơn chờ lấy hàng sắp quá hạn SLA trước 16:00 và soạn phản hồi cho 4 yêu cầu trả hàng.",
        steps: [
          {
            botId: "ts-chief",
            botName: "Shop Chief",
            role: "Trưởng phòng Vận hành TMĐT",
            actionTag: "Quét ưu tiên SLA",
            message:
              "Phát hiện 11 đơn J&T và SPX cần bàn giao trước 16:00 để giữ chỉ số giao hàng trễ LDR < 4%. Giao @Chốt Đơn 24/7 xử lý 4 phiếu trả hàng còn dưới 12 giờ.",
            durationLabel: "00:03",
          },
          {
            botId: "ts-cskh",
            botName: "Chốt Đơn 24/7",
            role: "Tư vấn & Chăm sóc Khách hàng",
            actionTag: "Soạn kịch bản CSKH",
            message:
              "Đã phân loại 4 yêu cầu hoàn: 2 đơn đổi size (soạn tin hỗ trợ giữ khách), 2 đơn cần đối soát video đóng gói trước khi xác nhận để tránh mất tiền oan.",
            deliverable: "4 mẫu phản hồi CSKH + Danh sách 11 mã vận đơn gấp",
            durationLabel: "00:09",
          },
        ],
        finalOutcome:
          "Chủ shop nắm rõ 11 đơn ưu tiên in phiếu ngay và xử lý trọn vẹn 4 đơn hoàn trước mốc tự động duyệt của sàn.",
      },
    ],
    routines: [
      {
        id: "ts-r1",
        title: "Quét đơn sắp quá hạn SLA & cảnh báo tồn kho thấp",
        schedule: "08:30 & 14:30 hằng ngày",
        ownerBot: "Shop Chief",
        summary: "Gửi danh sách đơn cần bàn giao gấp và SKU sắp hết hàng qua thông báo.",
        requiresCloud247: true,
      },
      {
        id: "ts-r2",
        title: "Báo cáo GMV cuối ngày theo Shop Tab / Video / LIVE",
        schedule: "21:30 hằng ngày",
        ownerBot: "KOC Affiliate",
        summary: "Bóc tách nguồn doanh thu và cảnh báo mã chạy Ads giảm ROAS.",
        requiresCloud247: true,
      },
      {
        id: "ts-r3",
        title: "Rà soát từ khóa cấm cho sản phẩm nháp mới",
        schedule: "Chạy thủ công hoặc khi bật máy",
        ownerBot: "Listing Guard",
        summary: "Quét toàn bộ tiêu đề & mô tả sản phẩm trước khi bấm xuất bản.",
        requiresCloud247: false,
      },
    ],
    highlights: [
      "Lọc từ khóa cấm TikTok Shop tự động trước khi đăng",
      "Cảnh báo chồng chéo Flash Sale + Voucher + Affiliate tránh lỗ ngầm",
      "Theo dõi SLA đơn hàng & báo cáo GMV đa kênh tự động 24/7 trên Cloud",
    ],
  },
  {
    id: "marketing-seo",
    shortName: "Marketing & SEO",
    name: "Phòng Marketing & SEO Đa Kênh",
    tagline: "Nghiên cứu từ khóa Top Google, viết bài Pillar tự nhiên và nhân bản nội dung ra Facebook, TikTok, YouTube.",
    targetAudience: "Chủ thương hiệu, Agency nhỏ, người làm tiếp thị liên kết & kinh doanh online",
    timeSaved: "Sản xuất nội dung nhanh gấp 5 lần",
    badgeText: "Tăng trưởng Organic",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-700",
    accentBorder: "border-emerald-200",
    bots: [
      {
        id: "mk-chief",
        name: "Growth Lead",
        role: "Trưởng phòng Marketing & Tăng trưởng",
        avatarCode: "GL",
        colorClass: "bg-emerald-700 text-white",
        isChief: true,
        specialty: "Lập chiến dịch tổng thể, phân bổ ngân sách nội dung và theo dõi chuyển đổi.",
      },
      {
        id: "mk-seo",
        name: "SEO Architect",
        role: "Chuyên gia SEO Top Google",
        avatarCode: "SE",
        colorClass: "bg-teal-700 text-white",
        specialty: "Lập cụm chủ đề Pillar–Cluster, Meta Title/Description, Schema JSON-LD & Internal Link.",
      },
      {
        id: "mk-copy",
        name: "Voice Writer",
        role: "Biên tập & Chuốt Văn Phong Tự Nhiên",
        avatarCode: "VW",
        colorClass: "bg-cyan-800 text-white",
        cloudOnly: true,
        specialty: "Chuyển dàn ý SEO thành bài viết, kịch bản video dọc 9:16 tự nhiên như người thật.",
      },
      {
        id: "mk-dist",
        name: "Multi-Channel",
        role: "Phân phối Facebook, TikTok, YouTube, Threads",
        avatarCode: "MC",
        colorClass: "bg-violet-600 text-white",
        cloudOnly: true,
        specialty: "Chuyển thể 1 bài chuẩn SEO thành chuỗi bài đăng đa nền tảng theo khung giờ vàng.",
      },
    ],
    scenarios: [
      {
        id: "mk-seo-campaign",
        title: "Lên cụm bài SEO Top Google + 5 kịch bản Reels/TikTok",
        userPrompt:
          "Lập kế hoạch đẩy top từ khóa 'phần mềm quản lý bán hàng AI' trong 30 ngày và tách thành 5 kịch bản video ngắn kéo traffic về web.",
        steps: [
          {
            botId: "mk-chief",
            botName: "Growth Lead",
            role: "Trưởng phòng Marketing & Tăng trưởng",
            actionTag: "Khởi động chiến dịch",
            message:
              "Giao @SEO Architect gom nhóm 20 từ khóa chuyển đổi cao + cấu trúc H1–H3; @Voice Writer viết bản nháp tự nhiên; @Multi-Channel cắt thành 5 kịch bản 45 giây cho TikTok & Facebook Reels.",
            durationLabel: "00:02",
          },
          {
            botId: "mk-seo",
            botName: "SEO Architect",
            role: "Chuyên gia SEO Top Google",
            actionTag: "Nghiên cứu từ khóa",
            message:
              "Đã chốt 1 bài Pillar chính + 4 bài vệ tinh so sánh, gài đủ FAQPage Schema và 6 liên kết nội bộ trỏ về trang Bảng giá.",
            deliverable: "Sơ đồ Pillar–Cluster + Bộ Meta/H1–H3 chuẩn SEO",
            durationLabel: "00:07",
          },
          {
            botId: "mk-copy",
            botName: "Voice Writer",
            role: "Biên tập & Chuốt Văn Phong Tự Nhiên",
            actionTag: "Chuốt văn phong",
            message:
              "Đã hoàn thiện bài viết 1.800 chữ có ví dụ thực tế tại Việt Nam, mở đầu đi thẳng nỗi đau khách hàng, không lặp từ máy móc.",
            deliverable: "Bài Pillar hoàn chỉnh chuẩn xuất bản",
            durationLabel: "00:13",
          },
          {
            botId: "mk-dist",
            botName: "Multi-Channel",
            role: "Phân phối Facebook, TikTok, YouTube, Threads",
            actionTag: "Nhân bản đa kênh",
            message:
              "Đã tách thành 5 kịch bản video dọc 9:16 (hook 3 giây đầu), 3 bài đăng Facebook nhóm cộng đồng và lịch đăng 7 ngày liên tiếp.",
            deliverable: "Lịch phân phối 7 ngày đa nền tảng",
            durationLabel: "00:18",
          },
        ],
        finalOutcome:
          "Từ 1 ý tưởng duy nhất, nhận trọn gói bài chuẩn SEO Google + 5 kịch bản video ngắn + lịch phủ đa kênh đồng bộ.",
      },
    ],
    routines: [
      {
        id: "mk-r1",
        title: "Kiểm tra thứ hạng từ khóa & đề xuất bài viết mới",
        schedule: "Thứ 3 & Thứ 6 lúc 09:30",
        ownerBot: "SEO Architect",
        summary: "Rà soát các trang đang ở top 6–15 để tối ưu tiêu đề & Internal Link lên top 3.",
        requiresCloud247: true,
      },
      {
        id: "mk-r2",
        title: "Soạn sẵn lịch đăng Facebook / TikTok / Threads cả tuần",
        schedule: "Chủ nhật 19:00 hằng tuần",
        ownerBot: "Multi-Channel",
        summary: "Gom nội dung tuần mới thành bảng duyệt 1 chạm cho chủ kênh.",
        requiresCloud247: true,
      },
      {
        id: "mk-r3",
        title: "Chuốt văn phong bài nháp trước khi đăng blog",
        schedule: "Chạy theo yêu cầu khi mở máy",
        ownerBot: "SEO Architect",
        summary: "Giữ giọng văn tự nhiên, kiểm tra chính tả tiếng Việt và CTA rõ ràng.",
        requiresCloud247: false,
      },
    ],
    highlights: [
      "Xây cấu trúc Pillar–Cluster, Meta, JSON-LD chuẩn Top Google",
      "1 nội dung gốc tự động nhân bản cho Web, Facebook, TikTok, YouTube",
      "Lịch tối ưu SEO định kỳ tự động chạy trên Cloud không sợ quên lịch",
    ],
  },
  {
    id: "education-gvcn",
    shortName: "Giáo viên & Nhà trường",
    name: "Phòng Trợ lý Giáo viên & Nhà trường",
    tagline: "Điểm danh nhanh, soạn kế hoạch bài dạy, tổng hợp chuyên cần tuần và gửi tin nhắn phụ huynh tinh tế.",
    targetAudience: "Giáo viên chủ nhiệm, giáo viên bộ môn, trung tâm ngoại ngữ & ban giám hiệu",
    timeSaved: "Giảm 70% thời gian sổ sách & báo cáo tuần",
    badgeText: "Có App Live Thực Tế",
    accentBg: "bg-sky-50",
    accentText: "text-sky-700",
    accentBorder: "border-sky-200",
    externalDemo: {
      label: "Mở ứng dụng Trợ lý GVCN đang chạy live",
      url: BRAND_CONFIG.liveDemos.gvcnApp.url,
      note: "Sản phẩm thực tế đã triển khai tại lop-nhe.vercel.app",
    },
    bots: [
      {
        id: "ed-chief",
        name: "Trợ lý GVCN",
        role: "Điều phối Công tác Chủ nhiệm",
        avatarCode: "GV",
        colorClass: "bg-sky-700 text-white",
        isChief: true,
        specialty: "Quản lý sĩ số, theo dõi tiến bộ từng học sinh và tổng hợp báo cáo cuối tuần.",
      },
      {
        id: "ed-lesson",
        name: "Soạn Giáo Án",
        role: "Thiết kế Bài dạy & Rubric Đánh giá",
        avatarCode: "GA",
        colorClass: "bg-indigo-600 text-white",
        specialty: "Soạn kế hoạch bài dạy theo CV 5512, bộ câu hỏi trắc nghiệm và phiếu học tập.",
      },
      {
        id: "ed-parent",
        name: "Kết nối Phụ huynh",
        role: "Soạn Thông báo & Nhận xét Cá nhân hóa",
        avatarCode: "PH",
        colorClass: "bg-emerald-700 text-white",
        cloudOnly: true,
        specialty: "Viết lời nhận xét khéo léo, tích cực theo tình hình từng em để gửi nhóm lớp.",
      },
      {
        id: "ed-report",
        name: "Sổ sách Tự động",
        role: "Xuất Biểu mẫu & Thống kê Học kỳ",
        avatarCode: "SS",
        colorClass: "bg-amber-800 text-white",
        cloudOnly: true,
        specialty: "Tự động gom dữ liệu chuyên cần, thi đua tổ và xuất báo cáo định kỳ cho nhà trường.",
      },
    ],
    scenarios: [
      {
        id: "ed-weekly-summary",
        title: "Tổng hợp chuyên cần tuần & tin nhắn gửi phụ huynh",
        userPrompt:
          "Tổng hợp điểm danh tuần 12 của lớp 8A, ghi nhận 3 em tiến bộ nổi bật và soạn tin nhắn thông báo họp phụ huynh cuối tuần.",
        steps: [
          {
            botId: "ed-chief",
            botName: "Trợ lý GVCN",
            role: "Điều phối Công tác Chủ nhiệm",
            actionTag: "Tổng hợp dữ liệu lớp",
            message:
              "Đã đối chiếu dữ liệu chuyên cần tuần 12 (sĩ số 42/42, 2 lượt nghỉ có phép). Chuyển @Kết nối Phụ huynh soạn thông báo họp và @Sổ sách Tự động lập bảng thi đua 4 tổ.",
            durationLabel: "00:02",
          },
          {
            botId: "ed-parent",
            botName: "Kết nối Phụ huynh",
            role: "Soạn Thông báo & Nhận xét Cá nhân hóa",
            actionTag: "Soạn thông báo chuẩn mực",
            message:
              "Đã soạn 1 bản thông báo gửi nhóm Zalo lớp (ngắn gọn, rõ giờ & nội dung họp) kèm 3 tin nhắn khen ngợi riêng gửi phụ huynh của 3 học sinh tiến bộ.",
            deliverable: "Mẫu tin Zalo lớp + 3 lời khen cá nhân hóa",
            durationLabel: "00:07",
          },
          {
            botId: "ed-report",
            botName: "Sổ sách Tự động",
            role: "Xuất Biểu mẫu & Thống kê Học kỳ",
            actionTag: "Xuất báo cáo tuần",
            message:
              "Hoàn tất bảng tổng kết thi đua 4 tổ và file thống kê chuyên cần sẵn sàng nộp Ban Giám hiệu.",
            deliverable: "Bảng tổng kết Tuần 12 (CSV / In ấn)",
            durationLabel: "00:12",
          },
        ],
        finalOutcome:
          "Giáo viên hoàn thành toàn bộ báo cáo tuần & tin nhắn phụ huynh chỉ trong 2 phút, đồng bộ trải nghiệm cùng ứng dụng Trợ lý GVCN live.",
      },
    ],
    routines: [
      {
        id: "ed-r1",
        title: "Nhắc lịch sinh hoạt lớp & tổng hợp chuyên cần Thứ 6",
        schedule: "Thứ 6 lúc 16:30 hằng tuần",
        ownerBot: "Trợ lý GVCN",
        summary: "Tự động gom học sinh nghỉ có/không phép và chuẩn bị dàn ý tiết sinh hoạt.",
        requiresCloud247: true,
      },
      {
        id: "ed-r2",
        title: "Gợi ý đề ôn tập & phiếu bài tập cho tuần học mới",
        schedule: "Chủ nhật lúc 14:00 hằng tuần",
        ownerBot: "Soạn Giáo Án",
        summary: "Chuẩn bị sẵn khung câu hỏi và tiêu chí đánh giá cho các tiết trọng tâm.",
        requiresCloud247: true,
      },
      {
        id: "ed-r3",
        title: "Soạn lời nhận xét học bạ theo từng học sinh",
        schedule: "Chạy theo yêu cầu khi mở máy",
        ownerBot: "Trợ lý GVCN",
        summary: "Cá nhân hóa lời nhận xét tự nhiên, tránh trùng lặp khuôn mẫu.",
        requiresCloud247: false,
      },
    ],
    highlights: [
      "Tích hợp kinh nghiệm thực chiến từ ứng dụng Trợ lý GVCN (lop-nhe.vercel.app)",
      "Giao diện tối giản, tiếng Việt chuẩn mực, giáo viên không rành CNTT vẫn dùng ngay",
      "Tiết kiệm hàng giờ nhập liệu sổ sách & soạn thông báo phụ huynh mỗi tuần",
    ],
  },
  {
    id: "sme-office",
    shortName: "Văn phòng SME",
    name: "Phòng Văn phòng SME Tự động",
    tagline: "Tổng hợp báo cáo điều hành, theo dõi công nợ/hợp đồng, lọc email quan trọng và chuẩn bị lịch họp.",
    targetAudience: "Giám đốc SME, văn phòng dịch vụ, công ty 5–50 nhân sự muốn tinh gọn vận hành",
    timeSaved: "Thay thế 20+ giờ hành chính lặp lại/tuần",
    badgeText: "Chuẩn Doanh nghiệp",
    accentBg: "bg-violet-50",
    accentText: "text-violet-700",
    accentBorder: "border-violet-200",
    bots: [
      {
        id: "sme-chief",
        name: "Chief of Staff",
        role: "Trợ lý Điều hành Tổng hợp",
        avatarCode: "CS",
        colorClass: "bg-violet-600 text-white",
        isChief: true,
        specialty: "Tổng hợp ưu tiên mỗi sáng, theo dõi tiến độ các phòng ban và nhắc việc quá hạn.",
      },
      {
        id: "sme-ops",
        name: "Admin & Mail",
        role: "Thư ký Email & Biên bản Họp",
        avatarCode: "AM",
        colorClass: "bg-slate-700 text-white",
        specialty: "Lọc email cần trả lời gấp, tóm tắt biên bản họp thành danh sách đầu việc rõ người chịu trách nhiệm.",
      },
      {
        id: "sme-sales",
        name: "B2B Proposal",
        role: "Báo giá & Soạn Thảo Hợp đồng",
        avatarCode: "BP",
        colorClass: "bg-indigo-600 text-white",
        cloudOnly: true,
        specialty: "Lập bảng báo giá theo yêu cầu khách, soạn email chào hàng và tóm tắt điều khoản.",
      },
      {
        id: "sme-fin",
        name: "Finance Watch",
        role: "Theo dõi Công nợ & Dòng tiền",
        avatarCode: "FW",
        colorClass: "bg-emerald-700 text-white",
        cloudOnly: true,
        specialty: "Cảnh báo hóa đơn đến hạn, tổng hợp chi phí định kỳ và xuất báo cáo tuần cho Giám đốc.",
      },
    ],
    scenarios: [
      {
        id: "sme-monday-brief",
        title: "Chuẩn bị giao ban sáng Thứ 2 & soát công nợ quá hạn",
        userPrompt:
          "Chuẩn bị bản tin điều hành sáng Thứ 2: lọc 5 việc quá hạn, rà soát 3 hợp đồng đến kỳ thanh toán và soạn email nhắc nhẹ khách hàng.",
        steps: [
          {
            botId: "sme-chief",
            botName: "Chief of Staff",
            role: "Trợ lý Điều hành Tổng hợp",
            actionTag: "Điều phối giao ban",
            message:
              "Khởi chạy gói giao ban Thứ 2. Phân công @Admin & Mail tổng hợp 5 đầu việc tồn từ tuần trước; @Finance Watch soát 3 khoản công nợ đến hạn; @B2B Proposal soạn email nhắc thanh toán lịch sự.",
            durationLabel: "00:02",
          },
          {
            botId: "sme-ops",
            botName: "Admin & Mail",
            role: "Thư ký Email & Biên bản Họp",
            actionTag: "Tổng hợp đầu việc",
            message:
              "Đã gom 5 đầu việc trễ hạn theo đúng người phụ trách và đính kèm tóm tắt 3 email khách hàng cần Giám đốc duyệt trong sáng nay.",
            deliverable: "Agenda giao ban 15 phút + 5 mục ưu tiên",
            durationLabel: "00:07",
          },
          {
            botId: "sme-fin",
            botName: "Finance Watch",
            role: "Theo dõi Công nợ & Dòng tiền",
            actionTag: "Đối soát công nợ",
            message:
              "Xác định 3 hợp đồng đến hạn trong 5 ngày tới tổng giá trị 84.500.000đ. Đã gắn trạng thái ưu tiên gửi chứng từ trước 11:00.",
            deliverable: "Bảng công nợ đến hạn tuần này",
            durationLabel: "00:12",
          },
          {
            botId: "sme-sales",
            botName: "B2B Proposal",
            role: "Báo giá & Soạn Thảo Hợp đồng",
            actionTag: "Soạn nháp email",
            message:
              "Đã tạo sẵn 3 bản nháp email nhắc thanh toán kèm thông tin đối soát (chỉ gửi đi sau khi Giám đốc bấm duyệt).",
            deliverable: "3 email nháp sẵn sàng duyệt gửi",
            durationLabel: "00:16",
          },
        ],
        finalOutcome:
          "Giám đốc bước vào buổi họp Thứ 2 với đầy đủ bức tranh tiến độ, công nợ và bản nháp xử lý sẵn sàng chỉ sau 1 chạm.",
      },
    ],
    routines: [
      {
        id: "sme-r1",
        title: "Bản tin Điều hành Sáng & Lọc Email quan trọng",
        schedule: "08:00 Thứ 2 – Thứ 6",
        ownerBot: "Chief of Staff",
        summary: "Gom lịch họp hôm nay, email cần phản hồi gấp và đầu việc sắp đến hạn.",
        requiresCloud247: true,
      },
      {
        id: "sme-r2",
        title: "Cảnh báo công nợ & báo cáo chi phí định kỳ",
        schedule: "Thứ 2 lúc 09:00 hằng tuần",
        ownerBot: "Finance Watch",
        summary: "Nhắc các khoản thu/chi đến hạn giúp chủ doanh nghiệp chủ động dòng tiền.",
        requiresCloud247: true,
      },
      {
        id: "sme-r3",
        title: "Tóm tắt biên bản cuộc họp thành danh sách việc cần làm",
        schedule: "Chạy ngay khi nhập ghi chú họp",
        ownerBot: "Admin & Mail",
        summary: "Tách rõ người phụ trách, hạn chót và đầu ra cần nghiệm thu.",
        requiresCloud247: false,
      },
    ],
    highlights: [
      "Tự động gom báo cáo sáng, lọc email quan trọng và chuẩn bị họp giao ban",
      "Kiểm soát an toàn: mọi email/thao tác gửi ngoài đều chờ chủ doanh nghiệp duyệt",
      "Đồng bộ nhiều phòng ban trên Cloud — mở kiểm tra ngay trên điện thoại",
    ],
  },
];

export function getDepartmentById(id: DepartmentId): DepartmentTemplate {
  return DEPARTMENTS.find((d) => d.id === id) ?? DEPARTMENTS[0];
}
