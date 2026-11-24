import type { AvatarStyle, HandoffLink, HologramScreenKind, OfficeDepartment } from '@/lib/office3d/types';
import type { Bot, RoutineItem, WorkspaceMode } from '@/types/workspace';
import { BRANDING } from '@/config/branding';

export interface IndustryDepartmentSpec {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface IndustryBotSpec {
  id: string;
  name: string;
  codeName: string;
  role: string;
  badge: string;
  gender: 'male' | 'female';
  departmentId: string;
  systemPrompt: string;
}

export interface IndustryRoutineSpec {
  title: string;
  schedule: string;
  ownerBotName: string;
  summary: string;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  accentColor: string;
  icon: string;
  departments: IndustryDepartmentSpec[];
  bots: IndustryBotSpec[];
  sampleCommands: string[];
  sampleRoutines: IndustryRoutineSpec[];
}

export const DEFAULT_INDUSTRY_ID = 'ecommerce-tiktok';

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    "id": "ecommerce-tiktok",
    "name": "TMĐT & TikTok Shop",
    "shortName": "TMĐT & Shop",
    "tagline": "Tự động hóa vận hành gian hàng, SEO Shop Tab, KOC Affiliate & điều phối kỹ thuật toàn diện",
    "accentColor": "#00f5ff",
    "icon": "ShoppingBag",
    "departments": [
      {
        "id": "dept-exec",
        "name": "Ban Điều Hành Tổng",
        "color": "#00f5ff",
        "description": "Giám sát trạng thái, phân bổ việc chéo và tổng hợp báo cáo toàn hệ thống."
      },
      {
        "id": "dept-commerce",
        "name": "Phòng Kinh Doanh & CSKH",
        "color": "#34d399",
        "description": "Vận hành TikTok Shop, nghiên cứu KOC Affiliate, tư vấn chốt đơn và chăm sóc 24/7."
      },
      {
        "id": "dept-growth",
        "name": "Phòng Tăng Trưởng & Marketing",
        "color": "#38bdf8",
        "description": "SEO Top Google, SEO sàn TMĐT, kịch bản video ngắn và chuốt nội dung tự nhiên."
      },
      {
        "id": "dept-tech",
        "name": "Phòng Kỹ Thuật & Sản Phẩm",
        "color": "#818cf8",
        "description": "Kiến trúc hệ thống, phát triển ứng dụng Web/Desktop và kiểm thử an toàn."
      }
    ],
    "bots": [
      {
        "id": "bot-orbit",
        "name": "Minh",
        "codeName": "minh",
        "role": "Quản lý & Điều phối tổng",
        "badge": "AI Manager",
        "gender": "male",
        "departmentId": "dept-exec",
        "systemPrompt": "Tổng chỉ huy điều phối nhiệm vụ giữa các phòng ban, kiểm soát tiến độ, phân bổ tài nguyên và tổng hợp báo cáo cho chủ nhân."
      },
      {
        "id": "bot-sunny",
        "name": "Lan",
        "codeName": "lan",
        "role": "Vận hành & Tăng trưởng Shop",
        "badge": "AI Commerce",
        "gender": "female",
        "departmentId": "dept-commerce",
        "systemPrompt": "Chuyên sâu GMV Flywheel, tối ưu tỷ lệ chuyển đổi CR, quản trị SLA đơn hàng và tính biên lợi nhuận ròng chống lỗ ngầm."
      },
      {
        "id": "bot-wren",
        "name": "Hùng",
        "codeName": "hung",
        "role": "Nghiên cứu Thị trường & KOC",
        "badge": "AI Researcher",
        "gender": "male",
        "departmentId": "dept-commerce",
        "systemPrompt": "Nghiên cứu xu hướng sản phẩm thắng lớn, phân tích giá đối thủ và lọc danh sách KOC Affiliate phù hợp ngách."
      },
      {
        "id": "bot-sale-cskh",
        "name": "Thảo",
        "codeName": "thao",
        "role": "Tư vấn Chốt đơn & CSKH 24/7",
        "badge": "AI Customer Support",
        "gender": "female",
        "departmentId": "dept-commerce",
        "systemPrompt": "Tư vấn chốt đơn, giải đáp thắc mắc sản phẩm, xử lý đổi trả và phản hồi đánh giá tiêu cực theo kịch bản chuẩn."
      },
      {
        "id": "bot-listing-pro",
        "name": "Nam",
        "codeName": "nam",
        "role": "SEO Tổng Thể Google & Sàn",
        "badge": "AI Marketer",
        "gender": "male",
        "departmentId": "dept-growth",
        "systemPrompt": "Xây dựng cấu trúc từ khóa SEO, tối ưu tiêu đề sản phẩm 60–120 ký tự chuẩn thuật toán và đẩy top tìm kiếm."
      },
      {
        "id": "bot-echo",
        "name": "Trang",
        "codeName": "trang",
        "role": "Nội dung & Kịch bản Viral",
        "badge": "AI Marketer",
        "gender": "female",
        "departmentId": "dept-growth",
        "systemPrompt": "Viết kịch bản video ngắn 60s giữ chân 3 giây đầu, viết content bán hàng tự nhiên chạm đúng nỗi đau khách hàng."
      },
      {
        "id": "bot-lin",
        "name": "Đức",
        "codeName": "duc",
        "role": "Kỹ sư Hệ thống & Dữ liệu",
        "badge": "AI Engineer",
        "gender": "male",
        "departmentId": "dept-tech",
        "systemPrompt": "Thiết kế API streaming, quản trị cơ sở dữ liệu đa khách hàng, tích hợp thanh toán VietQR và tối ưu hạ tầng."
      },
      {
        "id": "bot-pixel",
        "name": "Hà",
        "codeName": "ha",
        "role": "Thiết kế Giao diện & UX",
        "badge": "AI Engineer",
        "gender": "female",
        "departmentId": "dept-tech",
        "systemPrompt": "Xây dựng giao diện hiện đại, tối ưu trải nghiệm người dùng trên cả máy tính và điện thoại với trạng thái realtime."
      },
      {
        "id": "bot-rigel",
        "name": "Khôi",
        "codeName": "khoi",
        "role": "Kiểm thử QA & An toàn",
        "badge": "AI Engineer",
        "gender": "male",
        "departmentId": "dept-tech",
        "systemPrompt": "Kiểm thử cách ly dữ liệu, rà soát bảo mật và kiểm chứng bằng chứng độc lập trước mỗi đợt phát hành."
      },
      {
        "id": "bot-ada",
        "name": "Linh",
        "codeName": "linh",
        "role": "Kiến trúc sư Trưởng",
        "badge": "AI Engineer",
        "gender": "female",
        "departmentId": "dept-tech",
        "systemPrompt": "Hoạch định kiến trúc nền tảng kép Desktop & Cloud, tối ưu hiệu năng và định hướng giải pháp bền vững."
      }
    ],
    "sampleCommands": [
      "@Minh: Lập kế hoạch phân công công việc tuần này cho từng vị trí giúp tôi.",
      "@Lan: Rà soát lại giá bán và khuyến mãi TikTok Shop hôm nay nhé.",
      "@everyone: Mỗi bạn báo cáo nhanh 1 đầu việc quan trọng nhất đang làm."
    ],
    "sampleRoutines": [
      {
        "title": "Điểm tin thị trường & Quét vi phạm TikTok Shop",
        "schedule": "30 6 * * *",
        "ownerBotName": "Hùng",
        "summary": "Quét sản phẩm xu hướng, phát hiện sớm từ khóa cấm trong tiêu đề và mô tả."
      },
      {
        "title": "Báo cáo đơn hàng tồn đọng & Cảnh báo SLA",
        "schedule": "0 8 * * *",
        "ownerBotName": "Lan",
        "summary": "Tổng hợp đơn chờ vận chuyển quá 24h để kho ưu tiên đóng gói trước mốc SLA."
      }
    ]
  },
  {
    "id": "education",
    "name": "Giáo dục & Trung tâm Đào tạo",
    "shortName": "Giáo Dục",
    "tagline": "Tuyển sinh tự động, chăm sóc học viên tận tâm và nâng cao tỷ lệ hoàn thành khóa học",
    "accentColor": "#0284C7",
    "icon": "GraduationCap",
    "departments": [
      {
        "id": "edu-dept-admissions",
        "name": "Tuyển Sinh & Tư Vấn",
        "color": "#10B981",
        "description": "Thu thập lead, phân loại học viên tiềm năng và tư vấn chốt khóa"
      },
      {
        "id": "edu-dept-academic",
        "name": "Đào Tạo & Học Vụ",
        "color": "#6366F1",
        "description": "Giáo trình, kịch bản buổi học, bài tập thực hành và khảo sát chất lượng"
      },
      {
        "id": "edu-dept-student-care",
        "name": "Chăm Sóc & Tái Tục",
        "color": "#F59E0B",
        "description": "Nhắc lịch học, giải đáp học viên và thúc đẩy học viên giới thiệu bạn bè"
      }
    ],
    "bots": [
      {
        "id": "edu-phong",
        "name": "Phong",
        "codeName": "phong",
        "role": "Trưởng Phòng Tuyển Sinh",
        "badge": "AI Manager",
        "gender": "male",
        "departmentId": "edu-dept-admissions",
        "systemPrompt": "Quản lý mục tiêu chỉ tiêu tuyển sinh, điều phối phân bổ data học viên tiềm năng và đo lường tỷ lệ chuyển đổi từ lead sang học phí."
      },
      {
        "id": "edu-mai",
        "name": "Mai",
        "codeName": "mai",
        "role": "Chuyên Viên Tư Vấn Tuyển Sinh",
        "badge": "AI Sales",
        "gender": "female",
        "departmentId": "edu-dept-admissions",
        "systemPrompt": "Tư vấn lộ trình học tập cá nhân hóa, giải tỏa băn khoăn về học phí và khéo léo chốt cọc giữ chỗ cho các lớp khai giảng sắp tới."
      },
      {
        "id": "edu-triet",
        "name": "Triết",
        "codeName": "triet",
        "role": "Chuyên Viên Thu Hút Lead Học Viên",
        "badge": "AI Specialist",
        "gender": "male",
        "departmentId": "edu-dept-admissions",
        "systemPrompt": "Thiết kế tài nguyên mồi giá trị cao (ebook, bài kiểm tra trình độ, webinar dùng thử) để thu hút học viên tiềm năng vào phễu tư vấn."
      },
      {
        "id": "edu-van",
        "name": "Vân",
        "codeName": "van",
        "role": "Chuyên Viên Thiết Kế Giáo Trình",
        "badge": "AI Specialist",
        "gender": "female",
        "departmentId": "edu-dept-academic",
        "systemPrompt": "Biên soạn khung chương trình giảng dạy, thiết kế bài tập thực hành theo từng module và chuẩn hóa tiêu chí đánh giá chuẩn đầu ra."
      },
      {
        "id": "edu-kien",
        "name": "Kiên",
        "codeName": "kien",
        "role": "Trợ Giảng AI & Quản Lý Học Vụ",
        "badge": "AI Specialist",
        "gender": "male",
        "departmentId": "edu-dept-academic",
        "systemPrompt": "Hỗ trợ giải đáp thắc mắc bài tập của học viên, tổng hợp điểm thi định kỳ và báo cáo tiến độ học tập cho giảng viên phụ trách."
      },
      {
        "id": "edu-vy",
        "name": "Vy",
        "codeName": "vy",
        "role": "Chuyên Viên Chăm Sóc Học Viên",
        "badge": "AI Support",
        "gender": "female",
        "departmentId": "edu-dept-student-care",
        "systemPrompt": "Theo dõi điểm chuyên cần, gửi thông báo nhắc lịch học tự động và chủ động thăm hỏi, hỗ trợ kịp thời các học viên vắng mặt."
      },
      {
        "id": "edu-hoang",
        "name": "Hoàng",
        "codeName": "hoang",
        "role": "Chuyên Viên Tái Tục & Giới Thiệu",
        "badge": "AI Ops",
        "gender": "male",
        "departmentId": "edu-dept-student-care",
        "systemPrompt": "Thiết kế chính sách ưu đãi đăng ký khóa tiếp theo (upsell) và chương trình tặng quà tri ân khi học viên giới thiệu người quen đăng ký."
      }
    ],
    "sampleCommands": [
      "@Mai Lên kịch bản gọi tư vấn lộ trình IELTS 6.5 cho học sinh lớp 11 đang băn khoăn giữa học online và offline.",
      "@Triết Soạn đề kiểm tra nhanh 15 câu phân loại trình độ tiếng Anh giao tiếp kèm lời giải chi tiết làm quà tặng kéo lead.",
      "@Vy Lập danh sách học viên vắng quá 2 buổi trong tuần này và tạo mẫu tin nhắn Zalo hỏi thăm riêng từng bạn."
    ],
    "sampleRoutines": [
      {
        "title": "Nhắc lịch học & Điểm danh buổi tối",
        "schedule": "0 17 * * 1-5",
        "ownerBotName": "Vy",
        "summary": "Tự động gửi thông báo lịch học tối nay, link phòng học trực tuyến và dặn dò tài liệu cần chuẩn bị trước khi vào lớp."
      },
      {
        "title": "Báo cáo chuyển đổi phễu tuyển sinh tuần",
        "schedule": "0 9 * * 1",
        "ownerBotName": "Phong",
        "summary": "Tổng kết số lượng lead mới, tỷ lệ hoàn thành bài test trình độ và số học viên đã đóng cọc/hoàn tất học phí."
      }
    ]
  },
  {
    "id": "real-estate",
    "name": "Bất động sản & Môi giới",
    "shortName": "Bất Động Sản",
    "tagline": "Sàng lọc khách nét, soạn tin đăng chuẩn SEO và chăm sóc nhà đầu tư đường dài",
    "accentColor": "#D97706",
    "icon": "Building2",
    "departments": [
      {
        "id": "re-dept-sales-bd",
        "name": "Kinh Doanh & Dự Án",
        "color": "#10B981",
        "description": "Tiếp nhận giỏ hàng, tư vấn dòng tiền và chốt lịch hẹn dẫn khách xem nhà"
      },
      {
        "id": "re-dept-marketing-listing",
        "name": "Marketing & Tin Đăng",
        "color": "#3B82F6",
        "description": "Viết bài PR dự án, chạy ads tìm khách đầu tư và phủ tin đăng chuẩn SEO"
      },
      {
        "id": "re-dept-legal-cs",
        "name": "Pháp Lý & Khách Hàng",
        "color": "#8B5CF6",
        "description": "Thẩm định quy hoạch, hợp đồng đặt cọc và giữ mối quan hệ nhà đầu tư VIP"
      }
    ],
    "bots": [
      {
        "id": "re-long",
        "name": "Long",
        "codeName": "long",
        "role": "Giám Đốc Dự Án Bất Động Sản",
        "badge": "AI Manager",
        "gender": "male",
        "departmentId": "re-dept-sales-bd",
        "systemPrompt": "Phân tích bảng hàng dự án, đánh giá tiềm năng tăng giá theo phân khúc và điều phối đội ngũ môi giới chốt cọc nhanh các quỹ căn đẹp."
      },
      {
        "id": "re-huong",
        "name": "Hương",
        "codeName": "huong",
        "role": "Chuyên Viên Tư Vấn & Chốt Khách Nét",
        "badge": "AI Sales",
        "gender": "female",
        "departmentId": "re-dept-sales-bd",
        "systemPrompt": "Lắng nghe nhu cầu mua ở hoặc đầu tư, lập bảng so sánh dòng tiền trả góp ngân hàng và sắp xếp lịch hẹn dẫn khách xem thực địa dự án."
      },
      {
        "id": "re-quan",
        "name": "Quân",
        "codeName": "quan",
        "role": "Chuyên Viên Soạn Tin Đăng Chuẩn SEO",
        "badge": "AI Specialist",
        "gender": "male",
        "departmentId": "re-dept-marketing-listing",
        "systemPrompt": "Soạn tin đăng bán và cho thuê bất động sản chuẩn SEO, tối ưu tiêu đề giật tít hấp dẫn trên các trang Batdongsan và hội nhóm mạng xã hội."
      },
      {
        "id": "re-yen",
        "name": "Yến",
        "codeName": "yen",
        "role": "Biên Tập Video Review Căn Hộ",
        "badge": "AI Marketer",
        "gender": "female",
        "departmentId": "re-dept-marketing-listing",
        "systemPrompt": "Xây dựng kịch bản video review căn hộ mẫu, flycam toàn cảnh dự án và các bài phân tích tiện ích ngoại khu, hạ tầng giao thông kết nối."
      },
      {
        "id": "re-dat",
        "name": "Đạt",
        "codeName": "dat",
        "role": "Chuyên Viên Chạy Quảng Cáo Tìm Khách",
        "badge": "AI Ops",
        "gender": "male",
        "departmentId": "re-dept-marketing-listing",
        "systemPrompt": "Thiết lập và tối ưu chiến dịch quảng cáo tìm kiếm khách hàng có năng lực tài chính mua nhà, kiểm soát chi phí trên từng số điện thoại nét."
      },
      {
        "id": "re-binh",
        "name": "Bình",
        "codeName": "binh",
        "role": "Chuyên Viên Thẩm Định & Pháp Lý",
        "badge": "AI Specialist",
        "gender": "male",
        "departmentId": "re-dept-legal-cs",
        "systemPrompt": "Kiểm tra tính pháp lý sổ hồng, tra cứu quy hoạch địa chính và rà soát các điều khoản thỏa thuận đặt cọc mua bán an toàn cho đôi bên."
      },
      {
        "id": "re-nga",
        "name": "Nga",
        "codeName": "nga",
        "role": "Chuyên Viên Quản Trị Khách Hàng VIP",
        "badge": "AI Support",
        "gender": "female",
        "departmentId": "re-dept-legal-cs",
        "systemPrompt": "Chăm sóc danh sách khách hàng đầu tư thân thiết, cập nhật tiến độ công trường định kỳ và gửi trước thông tin các quỹ căn ngoại giao giá tốt."
      }
    ],
    "sampleCommands": [
      "@Quân Soạn 3 mẫu tin đăng bán liền kề khu đô thị phía Tây Hà Nội nhấn mạnh tiềm năng đường vành đai sắp thông xe.",
      "@Hương Lập bảng tính dòng tiền trả góp ngân hàng 35 năm cho căn hộ 2 phòng ngủ giá 3.2 tỷ đồng để gửi khách chốt cọc.",
      "@Bình Soạn checklist 7 điểm pháp lý cần kiểm tra kỹ trước khi ký hợp đồng đặt cọc mua nhà phố riêng lẻ chưa có sổ riêng."
    ],
    "sampleRoutines": [
      {
        "title": "Điểm tin quy hoạch & Hạ tầng giao thông mới",
        "schedule": "0 8 * * 2,5",
        "ownerBotName": "Long",
        "summary": "Tổng hợp các thông tin quy hoạch giao thông mới công bố, tiến độ khởi công dự án và biến động giá thị trường gửi đội ngũ tư vấn."
      },
      {
        "title": "Bản tin tiến độ dự án gửi nhà đầu tư VIP",
        "schedule": "0 10 1,15 * *",
        "ownerBotName": "Nga",
        "summary": "Tạo nội dung cập nhật hình ảnh thực tế công trường, pháp lý mới và giỏ hàng ngoại giao gửi riêng cho danh sách nhà đầu tư thân thiết."
      }
    ]
  },
  {
    "id": "spa-clinic",
    "name": "Spa, Thẩm mỹ & Phòng khám",
    "shortName": "Spa & Clinic",
    "tagline": "Lấp đầy lịch hẹn mỗi ngày, tư vấn liệu trình chuẩn y khoa và giữ chân khách hàng VIP",
    "accentColor": "#EC4899",
    "icon": "Sparkles",
    "departments": [
      {
        "id": "spa-dept-reception-sales",
        "name": "Tư Vấn & Lịch Hẹn",
        "color": "#10B981",
        "description": "Bắt lead online, xếp lịch soi da/thăm khám và tư vấn liệu trình phù hợp"
      },
      {
        "id": "spa-dept-clinical-care",
        "name": "Chuyên Môn & Chăm Sóc",
        "color": "#06B6D4",
        "description": "Hướng dẫn chăm sóc tại nhà, theo dõi phản ứng sau dịch vụ và giải đáp y khoa"
      },
      {
        "id": "spa-dept-crm-loyalty",
        "name": "Marketing & Khách Hàng VIP",
        "color": "#8B5CF6",
        "description": "Tái kích hoạt khách cũ, chương trình tích điểm hội viên và voucher sinh nhật"
      }
    ],
    "bots": [
      {
        "id": "spa-ngoc",
        "name": "Ngọc",
        "codeName": "ngoc",
        "role": "Quản Lý Vận Hành Cơ Sở Spa & Clinic",
        "badge": "AI Manager",
        "gender": "female",
        "departmentId": "spa-dept-reception-sales",
        "systemPrompt": "Điều hành tổng thể cơ sở làm đẹp, tối ưu tỷ lệ lấp đầy giường/phòng khám theo khung giờ và quản lý hiệu suất bán gói liệu trình."
      },
      {
        "id": "spa-uyen",
        "name": "Uyên",
        "codeName": "uyen",
        "role": "Chuyên Viên Tư Vấn & Chốt Liệu Trình",
        "badge": "AI Sales",
        "gender": "female",
        "departmentId": "spa-dept-reception-sales",
        "systemPrompt": "Thăm khám nhu cầu qua tin nhắn, giải tỏa lo lắng của khách hàng và thuyết phục khách đặt cọc giữ chỗ thăm khám trực tiếp tại cơ sở."
      },
      {
        "id": "spa-thang",
        "name": "Thắng",
        "codeName": "thang",
        "role": "Điều Phối Lịch Hẹn & Lễ Tân",
        "badge": "AI Ops",
        "gender": "male",
        "departmentId": "spa-dept-reception-sales",
        "systemPrompt": "Sắp xếp lịch hẹn với bác sĩ/chuyên viên, điều phối khách vào các khung giờ trống và gửi tin nhắn xác nhận lịch hẹn tự động."
      },
      {
        "id": "spa-tram",
        "name": "Trâm",
        "codeName": "tram",
        "role": "Chuyên Viên Hướng Dẫn Liệu Trình",
        "badge": "AI Specialist",
        "gender": "female",
        "departmentId": "spa-dept-clinical-care",
        "systemPrompt": "Biên soạn hướng dẫn phục hồi da tại nhà sau các thủ thuật chuyên sâu (laser, peel, meso) và xây dựng cẩm nang chăm sóc khoa học."
      },
      {
        "id": "spa-cuong",
        "name": "Cường",
        "codeName": "cuong",
        "role": "Chuyên Viên Theo Dõi & Hỗ Trợ Sau Dịch Vụ",
        "badge": "AI Support",
        "gender": "male",
        "departmentId": "spa-dept-clinical-care",
        "systemPrompt": "Chủ động thăm hỏi tình trạng da khách hàng sau 24h và 72h làm dịch vụ, xử lý phản hồi kích ứng nhẹ và xoa dịu lo âu của khách."
      },
      {
        "id": "spa-dung",
        "name": "Dung",
        "codeName": "dung",
        "role": "Chuyên Viên Khuyến Mãi & Giữ Chân Khách",
        "badge": "AI Marketer",
        "gender": "female",
        "departmentId": "spa-dept-crm-loyalty",
        "systemPrompt": "Thiết kế các gói combo trải nghiệm theo mùa, chương trình tặng quà sinh nhật khách hàng VIP và voucher kéo khách hàng quay lại."
      },
      {
        "id": "spa-tuan",
        "name": "Tuấn",
        "codeName": "tuan",
        "role": "Biên Kịch Nội Dung Thẩm Mỹ Y Khoa",
        "badge": "AI Specialist",
        "gender": "male",
        "departmentId": "spa-dept-crm-loyalty",
        "systemPrompt": "Viết bài chia sẻ kiến thức làm đẹp chuẩn y khoa, lên ý tưởng video trước-sau (Before-After) khéo léo tuân thủ chính sách quảng cáo."
      }
    ],
    "sampleCommands": [
      "@Uyên Lên kịch bản tư vấn khách hàng hỏi gói trị mụn chuẩn y khoa đang e ngại đau rát và sợ để lại sẹo thâm.",
      "@Trâm Soạn cẩm nang hướng dẫn dưỡng da tại nhà trong 3 ngày đầu sau khi làm laser vi điểm fractional CO2.",
      "@Dung Thiết kế chương trình ưu đãi giờ vàng giảm 30% dịch vụ chăm sóc da chuyên sâu để lấp đầy khung giờ 13h-16h ngày thường."
    ],
    "sampleRoutines": [
      {
        "title": "Nhắc lịch hẹn khách hàng ngày mai",
        "schedule": "0 18 * * *",
        "ownerBotName": "Thắng",
        "summary": "Gửi tin nhắn xác nhận khung giờ đến, hướng dẫn chỉ đường/đỗ xe và dặn dò lưu ý cần chuẩn bị trước khi đến làm liệu trình."
      },
      {
        "title": "Chăm sóc khách sau dịch vụ 24h",
        "schedule": "0 10 * * *",
        "ownerBotName": "Cường",
        "summary": "Quét danh sách khách vừa làm liệu trình ngày hôm trước, gửi tin nhắn hỏi thăm mức độ phục hồi và nhắc nhở thoa kem chống nắng/dưỡng ẩm."
      }
    ]
  },
  {
    "id": "fnb-restaurant",
    "name": "Nhà hàng, Quán ăn & F&B",
    "shortName": "F&B & Ẩm Thực",
    "tagline": "Bùng nổ lượng khách đặt bàn, tối ưu chi phí nguyên liệu và kích thích review 5 sao",
    "accentColor": "#EA580C",
    "icon": "Utensils",
    "departments": [
      {
        "id": "fnb-dept-service-booking",
        "name": "Đặt Bàn & Trải Nghiệm",
        "color": "#10B981",
        "description": "Tiếp nhận đặt bàn, tư vấn set menu tiệc và giải quyết phản hồi tại chỗ"
      },
      {
        "id": "fnb-dept-marketing-food",
        "name": "Truyền Thông & Món Mới",
        "color": "#F59E0B",
        "description": "Food review, viral TikTok, săn deal food app và chương trình giờ vàng"
      },
      {
        "id": "fnb-dept-kitchen-supply",
        "name": "Bếp & Quản Trị Chi Phí",
        "color": "#3B82F6",
        "description": "Kiểm soát định lượng món (Food Cost), quản lý nguyên liệu và vệ sinh ATTP"
      }
    ],
    "bots": [
      {
        "id": "fnb-vu",
        "name": "Vũ",
        "codeName": "vu",
        "role": "Quản Lý Vận Hành Nhà Hàng",
        "badge": "AI Manager",
        "gender": "male",
        "departmentId": "fnb-dept-service-booking",
        "systemPrompt": "Điều hành hoạt động sảnh và bếp, tối ưu vòng quay bàn trong giờ cao điểm và phân tích doanh thu trung bình trên mỗi hóa đơn (Ticket Size)."
      },
      {
        "id": "fnb-thu",
        "name": "Thư",
        "codeName": "thu",
        "role": "Chuyên Viên Tiếp Nhận Đặt Bàn & Tiệc",
        "badge": "AI Sales",
        "gender": "female",
        "departmentId": "fnb-dept-service-booking",
        "systemPrompt": "Tư vấn chọn set menu tiệc sinh nhật/liên hoan công ty, gợi ý gọi thêm món đặc trưng (signature) và đồ uống kèm tráng miệng."
      },
      {
        "id": "fnb-tung",
        "name": "Tùng",
        "codeName": "tung",
        "role": "Chuyên Viên Chăm Sóc & Giải Quyết Phản Hồi",
        "badge": "AI Support",
        "gender": "male",
        "departmentId": "fnb-dept-service-booking",
        "systemPrompt": "Xử lý nhanh chóng các phản hồi về chất lượng món ăn hoặc thái độ phục vụ, gửi lời xin lỗi chân thành kèm voucher tri ân khách."
      },
      {
        "id": "fnb-ly",
        "name": "Ly",
        "codeName": "ly",
        "role": "Sáng Tạo Nội Dung & Bắt Trend Ẩm Thực",
        "badge": "AI Marketer",
        "gender": "female",
        "departmentId": "fnb-dept-marketing-food",
        "systemPrompt": "Lên kịch bản video Mukbang, quay cận cảnh chế biến món ngon bắt mắt và bắt kịp các xu hướng ẩm thực trên TikTok để kéo khách check-in."
      },
      {
        "id": "fnb-phat",
        "name": "Phát",
        "codeName": "phat",
        "role": "Chuyên Viên Vận Hành App Giao Đồ Ăn",
        "badge": "AI Specialist",
        "gender": "male",
        "departmentId": "fnb-dept-marketing-food",
        "systemPrompt": "Tối ưu hóa hình ảnh món ăn, cài đặt mã giảm giá trên các nền tảng GrabFood, ShopeeFood, BeFood và kiểm soát biên lãi đơn ship."
      },
      {
        "id": "fnb-son",
        "name": "Sơn",
        "codeName": "son",
        "role": "Chuyên Viên Quản Trị Định Lượng & Food Cost",
        "badge": "AI Ops",
        "gender": "male",
        "departmentId": "fnb-dept-kitchen-supply",
        "systemPrompt": "Tính toán chính xác tỷ lệ Food Cost từng món trong thực đơn, cảnh báo tồn kho nguyên liệu quá hạn và giảm thiểu hao hụt bếp."
      },
      {
        "id": "fnb-han",
        "name": "Hân",
        "codeName": "han",
        "role": "Chuyên Viên Tiêu Chuẩn & An Toàn Vệ Sinh",
        "badge": "AI Specialist",
        "gender": "female",
        "departmentId": "fnb-dept-kitchen-supply",
        "systemPrompt": "Xây dựng bảng kiểm tra vệ sinh an toàn thực phẩm, quy trình lưu mẫu thức ăn 24h và tiêu chuẩn kiểm định nguồn nhập thực phẩm tươi."
      }
    ],
    "sampleCommands": [
      "@Thư Gợi ý set menu 6 người giá 1.5 triệu đồng cân đối hài hòa giữa món khai vị, món chính hải sản và lẩu nóng.",
      "@Ly Viết kịch bản video TikTok 30 giây review món sườn nướng sốt cay phô mai kéo sợi cực hấp dẫn kích thích người xem.",
      "@Sơn Tính toán tỷ lệ Food Cost cho món bò lúc lắc khoai tây chiên với giá vốn nguyên liệu 42.000đ và giá bán đề xuất 135.000đ."
    ],
    "sampleRoutines": [
      {
        "title": "Tổng hợp bàn đặt & Dự trù nguyên liệu ngày mai",
        "schedule": "0 21 * * *",
        "ownerBotName": "Vũ",
        "summary": "Thống kê tổng số lượng bàn tiệc đã đặt trước cho ngày mai để báo bộ phận bếp xuất kho và đặt nguyên liệu tươi sớm."
      },
      {
        "title": "Khảo sát trải nghiệm & Kêu gọi đánh giá Google Maps",
        "schedule": "0 14 * * *",
        "ownerBotName": "Tùng",
        "summary": "Gửi tin nhắn cảm ơn khách đã dùng bữa trưa kèm đường link mời đánh giá trải nghiệm nhận ngay voucher tặng món tráng miệng lần sau."
      }
    ]
  },
  {
    "id": "accounting-legal",
    "name": "Kế toán, Thuế & Pháp lý",
    "shortName": "Kế Toán & Pháp Lý",
    "tagline": "Tuân thủ chặt chẽ luật thuế mới, tối ưu chi phí hợp pháp và cảnh báo rủi ro hợp đồng",
    "accentColor": "#0D9488",
    "icon": "Scale",
    "departments": [
      {
        "id": "acc-dept-tax-audit",
        "name": "Thuế & Kế Toán Doanh Nghiệp",
        "color": "#10B981",
        "description": "Kê khai thuế GTGT/TNDN/TNCN, rà soát hóa đơn đầu vào và chuẩn bị sổ sách thanh tra"
      },
      {
        "id": "acc-dept-legal-corp",
        "name": "Pháp Lý Doanh Nghiệp",
        "color": "#6366F1",
        "description": "Hợp đồng thương mại, đăng ký kinh doanh, sở hữu trí tuệ và tranh chấp nội bộ"
      },
      {
        "id": "acc-dept-advisory-client",
        "name": "Tư Vấn & Quan Hệ Khách Hàng",
        "color": "#F59E0B",
        "description": "Tư vấn cấu trúc chi phí, giải pháp kế toán trọn gói và tiếp nhận hồ sơ mới"
      }
    ],
    "bots": [
      {
        "id": "acc-thanh",
        "name": "Thành",
        "codeName": "thanh",
        "role": "Kế Toán Trưởng & Cố Vấn Quyết Toán",
        "badge": "AI Manager",
        "gender": "male",
        "departmentId": "acc-dept-tax-audit",
        "systemPrompt": "Chịu trách nhiệm kiểm soát báo cáo tài chính năm, rà soát hồ sơ quyết toán thuế và đưa ra giải pháp bảo vệ chi phí hợp lý hợp lệ trước cơ quan thuế."
      },
      {
        "id": "acc-phuong",
        "name": "Phương",
        "codeName": "phuong",
        "role": "Chuyên Viên Kê Khai Thuế & Hóa Đơn",
        "badge": "AI Specialist",
        "gender": "female",
        "departmentId": "acc-dept-tax-audit",
        "systemPrompt": "Kiểm tra tính hợp lệ của hóa đơn điện tử đầu vào đầu ra, đối chiếu bảng kê và lập tờ khai thuế GTGT, TNCN tạm tính đúng hạn quy định."
      },
      {
        "id": "acc-huy",
        "name": "Huy",
        "codeName": "huy",
        "role": "Chuyên Viên Tiền Lương & Bảo Hiểm",
        "badge": "AI Specialist",
        "gender": "male",
        "departmentId": "acc-dept-tax-audit",
        "systemPrompt": "Tính toán bảng lương, trích nộp các khoản bảo hiểm xã hội bắt buộc và tư vấn cấu trúc phụ cấp tối ưu thuế TNCN đúng luật lao động."
      },
      {
        "id": "acc-lam",
        "name": "Lâm",
        "codeName": "lam",
        "role": "Chuyên Viên Rà Soát Hợp Đồng & Pháp Chế",
        "badge": "AI Specialist",
        "gender": "male",
        "departmentId": "acc-dept-legal-corp",
        "systemPrompt": "Soạn thảo và thẩm định các điều khoản hợp đồng kinh tế, dịch vụ, mua bán; nhận diện điều khoản bất lợi và phòng ngừa rủi ro tranh chấp."
      },
      {
        "id": "acc-quyen",
        "name": "Quyên",
        "codeName": "quyen",
        "role": "Chuyên Viên Thủ Tục Doanh Nghiệp & Nhãn Hiệu",
        "badge": "AI Specialist",
        "gender": "female",
        "departmentId": "acc-dept-legal-corp",
        "systemPrompt": "Hướng dẫn hồ sơ thành lập doanh nghiệp, thay đổi nội dung đăng ký kinh doanh và thực hiện thủ tục đăng ký bảo hộ nhãn hiệu tại Cục Sở hữu trí tuệ."
      },
      {
        "id": "acc-quang",
        "name": "Quang",
        "codeName": "quang",
        "role": "Chuyên Viên Giám Sát Tiến Độ Hồ Sơ & Lịch Thuế",
        "badge": "AI Ops",
        "gender": "male",
        "departmentId": "acc-dept-advisory-client",
        "systemPrompt": "Theo dõi tiến độ hoàn thiện sổ sách của các doanh nghiệp khách hàng, gửi thông báo cảnh báo trước các mốc hạn nộp tờ khai và tiền thuế."
      },
      {
        "id": "acc-my",
        "name": "My",
        "codeName": "my",
        "role": "Chuyên Viên Tư Vấn Gói Dịch Vụ Kế Toán",
        "badge": "AI Sales",
        "gender": "female",
        "departmentId": "acc-dept-advisory-client",
        "systemPrompt": "Tiếp nhận nhu cầu doanh nghiệp mới thành lập, tư vấn gói dịch vụ kế toán thuế trọn gói phù hợp quy mô và giải đáp quy trình ban đầu."
      }
    ],
    "sampleCommands": [
      "@Phương Rà soát danh sách 15 hóa đơn đầu vào có giá trị trên 20 triệu đồng xem đã đủ chứng từ thanh toán ngân hàng hợp lệ chưa.",
      "@Lâm Soạn thảo điều khoản phạt vi phạm nghĩa vụ và bồi thường thiệt hại trong dự thảo hợp đồng cung cấp dịch vụ phần mềm.",
      "@Quang Liệt kê danh sách các loại báo cáo thuế và hạn chót nộp tờ khai trong quý này theo quy định mới nhất của cơ quan thuế."
    ],
    "sampleRoutines": [
      {
        "title": "Cảnh báo hạn nộp tờ khai thuế & Tiền thuế kỳ tới",
        "schedule": "0 8 15,25 * *",
        "ownerBotName": "Quang",
        "summary": "Rà soát lịch nộp tờ khai thuế GTGT, TNCN, TNDN tạm tính và nhắc nhở khách hàng chuẩn bị hồ sơ trước khi hết hạn nộp."
      },
      {
        "title": "Điểm tin văn bản pháp luật & Nghị định thuế mới",
        "schedule": "0 8 * * 1",
        "ownerBotName": "Thành",
        "summary": "Tổng hợp các công văn, nghị định và thông tư thuế mới có hiệu lực trong tuần, kèm hướng dẫn ứng dụng thực tế cho doanh nghiệp."
      }
    ]
  },
  {
    "id": "agency-marketing",
    "name": "Agency & Marketing Đa Kênh",
    "shortName": "Agency Marketing",
    "tagline": "Cam kết KPI chuyển đổi, sáng tạo content viral và tối ưu hiệu suất quảng cáo đa kênh",
    "accentColor": "#8B5CF6",
    "icon": "Megaphone",
    "departments": [
      {
        "id": "agency-dept-strategy-account",
        "name": "Chiến Lược & Account",
        "color": "#6366F1",
        "description": "Nhận brief, lập kế hoạch tổng thể, cam kết KPI và quản lý quan hệ khách hàng"
      },
      {
        "id": "agency-dept-creative-content",
        "name": "Sáng Tạo & Nội Dung",
        "color": "#EC4899",
        "description": "Ý tưởng chiến dịch (Big Idea), kịch bản video ngắn, bài viết social và visual design"
      },
      {
        "id": "agency-dept-performance-media",
        "name": "Truyền Thông & Performance",
        "color": "#10B981",
        "description": "Tối ưu Facebook Ads, Google Ads, TikTok Ads và hệ thống báo cáo số liệu real-time"
      }
    ],
    "bots": [
      {
        "id": "agency-trieu",
        "name": "Triều",
        "codeName": "trieu",
        "role": "Giám Đốc Chiến Lược Kế Hoạch (Planning Director)",
        "badge": "AI Manager",
        "gender": "male",
        "departmentId": "agency-dept-strategy-account",
        "systemPrompt": "Định hình Big Idea, xây dựng chiến lược truyền thông tích hợp (IMC), phân bổ ngân sách kênh hiệu quả và cam kết KPI tăng trưởng với khách hàng."
      },
      {
        "id": "agency-nha",
        "name": "Nhã",
        "codeName": "nha",
        "role": "Trưởng Nhóm Quản Lý Khách Hàng (Account Lead)",
        "badge": "AI Sales",
        "gender": "female",
        "departmentId": "agency-dept-strategy-account",
        "systemPrompt": "Tiếp nhận brief từ thương hiệu, pitching bảo vệ phương án đề xuất sáng tạo và duy trì mối quan hệ tin cậy, hợp tác lâu dài với khách hàng."
      },
      {
        "id": "agency-bach",
        "name": "Bách",
        "codeName": "bach",
        "role": "Trưởng Nhóm Sáng Tạo & Biên Kịch (Creative Copywriter)",
        "badge": "AI Specialist",
        "gender": "male",
        "departmentId": "agency-dept-creative-content",
        "systemPrompt": "Sáng tác thông điệp truyền thông (Tagline/Slogan), viết bài PR báo chí và phát triển kịch bản video viral đánh trúng tâm lý khách hàng mục tiêu."
      },
      {
        "id": "agency-mi",
        "name": "Mi",
        "codeName": "mi",
        "role": "Chuyên Viên Nội Dung Mạng Xã Hội (Social Content)",
        "badge": "AI Specialist",
        "gender": "female",
        "departmentId": "agency-dept-creative-content",
        "systemPrompt": "Lên kế hoạch nội dung mạng xã hội (Content Calendar), bắt trend viral nhanh và biên soạn bài đăng tương tác cao trên các nền tảng."
      },
      {
        "id": "agency-dang",
        "name": "Đăng",
        "codeName": "dang",
        "role": "Định Hướng Nghệ Thuật & Thiết Kế (Art Director)",
        "badge": "AI Specialist",
        "gender": "male",
        "departmentId": "agency-dept-creative-content",
        "systemPrompt": "Gợi ý moodboard, concept hình ảnh cho bộ nhận diện chiến dịch và hướng dẫn bố cục banner quảng cáo tối ưu tỷ lệ nhấp chuột (CTR)."
      },
      {
        "id": "agency-khoa",
        "name": "Khoa",
        "codeName": "khoa",
        "role": "Chuyên Viên Tối Ưu Quảng Cáo (Media Optimizer)",
        "badge": "AI Ops",
        "gender": "male",
        "departmentId": "agency-dept-performance-media",
        "systemPrompt": "Triển khai và theo dõi các chiến dịch quảng cáo TikTok Ads, Meta Ads, Google Ads; thực hiện thử nghiệm A/B để hạ giá thầu và tối ưu CPA."
      },
      {
        "id": "agency-chau",
        "name": "Châu",
        "codeName": "chau",
        "role": "Chuyên Viên Phân Tích Dữ Liệu & Báo Cáo KPI",
        "badge": "AI Specialist",
        "gender": "female",
        "departmentId": "agency-dept-performance-media",
        "systemPrompt": "Thu thập số liệu đa kênh, xây dựng bảng báo cáo hiệu quả chiến dịch hàng tuần và đề xuất các phương án cải thiện tỷ lệ chuyển đổi cho client."
      }
    ],
    "sampleCommands": [
      "@Bách Đề xuất 3 ý tưởng Big Idea cho chiến dịch ra mắt dòng sản phẩm trà sữa thảo mộc đóng chai nhắm vào giới trẻ văn phòng.",
      "@Khoa Phân tích lý do chi phí trên mỗi lượt gửi tin nhắn của chiến dịch Facebook Ads tăng cao trong 3 ngày qua và giải pháp xử lý.",
      "@Châu Lập bảng báo cáo hiệu quả chiến dịch tuần qua: so sánh chi tiêu ngân sách, lượng khách hàng tiềm năng và chi phí mỗi chuyển đổi (CPA)."
    ],
    "sampleRoutines": [
      {
        "title": "Kiểm tra ngân sách & Chỉ số quảng cáo đầu ngày",
        "schedule": "0 8 * * *",
        "ownerBotName": "Khoa",
        "summary": "Rà soát ngân sách các tài khoản quảng cáo, cảnh báo các nhóm quảng cáo cắn tiền bất thường hoặc có chi phí CPA vượt ngưỡng cho phép."
      },
      {
        "title": "Báo cáo tiến độ KPI chiến dịch hàng tuần gửi khách hàng",
        "schedule": "0 16 * * 5",
        "ownerBotName": "Châu",
        "summary": "Tổng hợp tỷ lệ hoàn thành các chỉ số KPI cam kết (Reach, CTR, Lead, CPA) của từng dự án và gửi báo cáo nghiệm thu tuần cho khách hàng."
      }
    ]
  },
  {
    "id": "custom-blank",
    "name": "Tự dựng từ đầu (Linh hoạt)",
    "shortName": "Tự Thiết Kế",
    "tagline": "Bắt đầu với bộ khung tối giản, sẵn sàng tùy biến phòng ban và nhân sự theo mô hình riêng",
    "accentColor": "#64748B",
    "icon": "FolderPlus",
    "departments": [
      {
        "id": "custom-dept-board",
        "name": "Ban Điều Hành",
        "color": "#475569",
        "description": "Khối điều phối hạt nhân, sẵn sàng mở rộng thêm các phòng ban chuyên môn"
      }
    ],
    "bots": [
      {
        "id": "custom-minh",
        "name": "Minh",
        "codeName": "minh",
        "role": "Quản Lý Vận Hành Chung",
        "badge": "AI Manager",
        "gender": "male",
        "departmentId": "custom-dept-board",
        "systemPrompt": "Hỗ trợ điều phối công việc tổng thể, đề xuất cơ cấu phân chia phòng ban mới và quản lý danh sách mục tiêu chung của tổ chức."
      },
      {
        "id": "custom-an",
        "name": "An",
        "codeName": "an",
        "role": "Trợ Lý Đa Năng",
        "badge": "AI Specialist",
        "gender": "female",
        "departmentId": "custom-dept-board",
        "systemPrompt": "Hỗ trợ soạn thảo tài liệu, tổng hợp dữ liệu nghiên cứu và linh hoạt phối hợp giải quyết các nhiệm vụ chuyên môn theo chỉ định."
      }
    ],
    "sampleCommands": [
      "@Minh Hướng dẫn tôi cách thiết lập thêm phòng ban Kinh Doanh và tạo thêm 2 nhân viên AI phụ trách chăm sóc khách hàng.",
      "@An Soạn giúp tôi bản mô tả quy trình tiếp nhận và xử lý yêu cầu khách hàng mới phù hợp cho mô hình kinh doanh nhỏ.",
      "@Minh Lập danh sách các chỉ số hiệu suất KPI cơ bản cần theo dõi hàng tháng khi vận hành một doanh nghiệp vừa và nhỏ."
    ],
    "sampleRoutines": [
      {
        "title": "Điểm việc đầu ngày & Nhắc việc quan trọng",
        "schedule": "0 8 * * 1-5",
        "ownerBotName": "An",
        "summary": "Tổng hợp danh sách các đầu việc quan trọng cần ưu tiên xử lý trong ngày và gửi lời nhắc nhở cho từng bộ phận liên quan."
      },
      {
        "title": "Tổng kết công việc cuối tuần & Lập kế hoạch",
        "schedule": "0 17 * * 5",
        "ownerBotName": "Minh",
        "summary": "Rà soát tiến độ hoàn thành các mục tiêu trong tuần, ghi nhận các khó khăn còn tồn đọng và chuẩn bị kế hoạch hành động cho tuần mới."
      }
    ]
  }
];

export function getIndustryTemplateById(id: string): IndustryTemplate {
  return INDUSTRY_TEMPLATES.find((t) => t.id === id) || INDUSTRY_TEMPLATES[0];
}

export function inferScreenKindFromBadge(badge: string): HologramScreenKind {
  const b = badge.toLowerCase();
  if (b.includes('manager')) return 'manager';
  if (b.includes('marketer')) return 'marketer';
  if (b.includes('researcher')) return 'researcher';
  if (b.includes('support')) return 'support';
  if (b.includes('commerce') || b.includes('sales') || b.includes('ops')) return 'commerce';
  if (b.includes('engineer')) return 'code';
  return 'researcher';
}

function pickAvatarEmoji(badge: string): string {
  const b = badge.toLowerCase();
  if (b.includes('manager')) return '🛰️';
  if (b.includes('sales') || b.includes('commerce')) return '🛍️';
  if (b.includes('support')) return '💬';
  if (b.includes('marketer')) return '🚀';
  if (b.includes('researcher')) return '📊';
  if (b.includes('engineer')) return '⚡';
  if (b.includes('ops')) return '⚙️';
  return '✨';
}

function pickBadgeClasses(index: number): string {
  const palette = [
    'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
    'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30',
  ];
  return palette[index % palette.length];
}

export function buildWorkspaceFromIndustryTemplate(
  template: IndustryTemplate,
  workspaceMode: WorkspaceMode
): {
  departments: OfficeDepartment[];
  bots: Bot[];
  botDeptMap: Record<string, string>;
  handoffs: HandoffLink[];
  routines: RoutineItem[];
} {
  const departments: OfficeDepartment[] = template.departments.map((d) => ({
    id: d.id,
    name: d.name,
    shortLabel: d.name.length > 22 ? `${d.name.slice(0, 20)}…` : d.name,
    colorHex: d.color,
    description: d.description,
  }));

  const deptById = new Map(departments.map((d) => [d.id, d]));
  const maxFree = BRANDING.system.desktopMaxFreeBots;
  const botDeptMap: Record<string, string> = {};

  const bots: Bot[] = template.bots.map((b, idx) => {
    const dept = deptById.get(b.departmentId) || departments[0];
    botDeptMap[b.id] = dept.id;
    const isActive = workspaceMode === 'cloud_247' ? true : idx < maxFree;
    const avatarStyle: AvatarStyle = b.gender === 'female' ? 'female' : 'male';
    return {
      id: b.id,
      name: b.name,
      codeName: b.codeName,
      roleTitle: b.role,
      roleBadge: b.badge,
      department: dept.name,
      avatar: pickAvatarEmoji(b.badge),
      avatarStyle,
      badgeColor: pickBadgeClasses(idx),
      status: isActive ? 'working' : 'ready',
      description: b.systemPrompt,
      skills: [dept.shortLabel, b.badge, 'Phối hợp liên phòng ban'],
      model: idx === 0 ? 'Claude 3.7 Sonnet' : idx % 2 === 1 ? 'Gemini 2.5 Flash' : 'GPT-4o',
      isActive,
      isLead: idx === 0 || b.badge === 'AI Manager',
      priorityOrder: idx + 1,
    };
  });

  const handoffs: HandoffLink[] = [];
  for (let i = 0; i < departments.length - 1; i++) {
    handoffs.push({
      id: `hf-${template.id}-${i + 1}`,
      fromDeptId: departments[i].id,
      toDeptId: departments[i + 1].id,
      label: `${departments[i].shortLabel} → ${departments[i + 1].shortLabel}`,
    });
  }
  if (departments.length > 1) {
    handoffs.push({
      id: `hf-${template.id}-loop`,
      fromDeptId: departments[departments.length - 1].id,
      toDeptId: departments[0].id,
      label: `Báo cáo tổng hợp → ${departments[0].shortLabel}`,
    });
  }

  const routines: RoutineItem[] = template.sampleRoutines.map((r, idx) => {
    const owner =
      bots.find((b) => b.name.toLowerCase() === r.ownerBotName.toLowerCase()) || bots[0];
    return {
      id: `rt-${template.id}-${idx + 1}`,
      title: r.title,
      botId: owner?.id || 'bot-orbit',
      botName: owner?.name || r.ownerBotName,
      botAvatar: owner?.avatar || '⚡',
      department: owner?.department || departments[0]?.name || template.shortName,
      timeOfDay: idx === 0 ? 'morning' : 'night',
      timeLabel: `Lịch chuẩn (${r.schedule})`,
      cronExpression: r.schedule,
      description: r.summary,
      promptPayload: r.summary,
      isEnabled: true,
      runOnCloud: true,
      lastStatus: 'success',
      lastRunText: `Sẵn sàng chạy tự động cùng ${owner?.name || r.ownerBotName}`,
    };
  });

  return { departments, bots, botDeptMap, handoffs, routines };
}
