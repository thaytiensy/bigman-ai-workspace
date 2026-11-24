/**
 * Xưởng Việc Thật (Hướng 1 — Dùng Ngay, Không Cần API Key)
 * Bộ động cơ xử lý nghiệp vụ thực tế, xuất trực tiếp file Excel (.csv UTF-8 BOM)
 * và Microsoft Word (.doc) chạy tức thì ngay trên trình duyệt.
 */

export interface TikTokProfitInput {
  productName: string;
  cogs: number; // Giá vốn nhập hàng (VNĐ)
  listPrice: number; // Giá bán niêm yết (VNĐ)
  flashSalePct: number; // Giảm giá Flash Sale (%)
  shopVoucher: number; // Voucher của shop (VNĐ)
  platformFeePct: number; // Phí sàn + thanh toán + thuế (%)
  kocCommissionPct: number; // Hoa hồng KOC Affiliate (%)
  packagingCost: number; // Đóng gói, thùng, chống sốc (VNĐ)
  returnRatePct: number; // Tỷ lệ hoàn hàng dự kiến (%)
  adsPerOrder: number; // Chi phí quảng cáo trung bình / đơn (VNĐ)
}

export interface TikTokProfitResult {
  effectivePrice: number;
  flashSaleDiscount: number;
  platformFeeAmount: number;
  kocFeeAmount: number;
  returnLossReserve: number;
  totalCost: number;
  netProfit: number;
  netMarginPct: number;
  profitBeforeAds: number;
  breakEvenRoas: number | null;
  suggestedSafePrice: number;
  riskLevel: 'danger' | 'warn' | 'healthy';
  riskLabel: string;
  warnings: string[];
  recommendations: string[];
}

export function formatVnd(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('vi-VN')}đ`;
}

export function calculateTikTokProfit(input: TikTokProfitInput): TikTokProfitResult {
  const safeListPrice = Math.max(0, Number(input.listPrice) || 0);
  const safeCogs = Math.max(0, Number(input.cogs) || 0);
  const safeFlashPct = Math.min(90, Math.max(0, Number(input.flashSalePct) || 0));
  const safeVoucher = Math.max(0, Number(input.shopVoucher) || 0);
  const safePlatformPct = Math.min(50, Math.max(0, Number(input.platformFeePct) || 0));
  const safeKocPct = Math.min(60, Math.max(0, Number(input.kocCommissionPct) || 0));
  const safePackaging = Math.max(0, Number(input.packagingCost) || 0);
  const safeReturnPct = Math.min(50, Math.max(0, Number(input.returnRatePct) || 0));
  const safeAds = Math.max(0, Number(input.adsPerOrder) || 0);

  const flashSaleDiscount = Math.round((safeListPrice * safeFlashPct) / 100);
  const effectivePrice = Math.max(0, safeListPrice - flashSaleDiscount - safeVoucher);

  const platformFeeAmount = Math.round((effectivePrice * safePlatformPct) / 100);
  const kocFeeAmount = Math.round((effectivePrice * safeKocPct) / 100);
  // Chi phí dự phòng hoàn hàng: tính theo (đóng gói + 18.000đ ship 2 chiều/tổn thất) * tỷ lệ hoàn
  const returnLossReserve = Math.round(((safePackaging + 18000) * safeReturnPct) / 100);

  const costBeforeAds =
    safeCogs + platformFeeAmount + kocFeeAmount + safePackaging + returnLossReserve;
  const totalCost = costBeforeAds + safeAds;
  const profitBeforeAds = effectivePrice - costBeforeAds;
  const netProfit = effectivePrice - totalCost;
  const netMarginPct =
    effectivePrice > 0 ? Number(((netProfit / effectivePrice) * 100).toFixed(1)) : -100;

  const breakEvenRoas =
    profitBeforeAds > 0 && effectivePrice > 0
      ? Number((effectivePrice / profitBeforeAds).toFixed(2))
      : null;

  // Giá bán thực thu tối thiểu để đạt biên lợi nhuận ròng mục tiêu 20%
  const variableRate = (safePlatformPct + safeKocPct) / 100;
  const targetMargin = 0.2;
  const denominator = Math.max(0.15, 1 - variableRate - targetMargin);
  const fixedCosts = safeCogs + safePackaging + returnLossReserve + safeAds;
  const targetEffectivePrice = Math.ceil(fixedCosts / denominator / 1000) * 1000;
  const suggestedSafePrice =
    safeFlashPct < 85
      ? Math.ceil(((targetEffectivePrice + safeVoucher) / (1 - safeFlashPct / 100)) / 1000) * 1000
      : targetEffectivePrice + safeVoucher;

  const warnings: string[] = [];
  const recommendations: string[] = [];

  let riskLevel: TikTokProfitResult['riskLevel'] = 'healthy';
  let riskLabel = 'An toàn — Biên lợi nhuận tốt';

  if (netProfit < 0) {
    riskLevel = 'danger';
    riskLabel = 'BÁO ĐỘNG ĐỎ — Đang lỗ ngầm trên mỗi đơn!';
    warnings.push(
      `Mỗi đơn bán ra đang âm ${formatVnd(Math.abs(netProfit))} (${netMarginPct}%). Càng chạy Flash Sale hoặc bơm Ads càng lỗ nặng.`
    );
    recommendations.push(
      `Nâng giá niêm yết lên tối thiểu ${formatVnd(suggestedSafePrice)} (hoặc giảm Flash Sale / Voucher Shop) để đạt biên ròng an toàn ~20%.`
    );
  } else if (netMarginPct < 15) {
    riskLevel = 'warn';
    riskLabel = 'Cảnh báo vàng — Biên lợi nhuận mỏng (< 15%)';
    warnings.push(
      `Biên lãi ròng chỉ còn ${netMarginPct}% (${formatVnd(netProfit)}/đơn). Nếu tỷ lệ hoàn tăng hoặc chi phí Ads nhích nhẹ sẽ lập tức chuyển sang lỗ.`
    );
    recommendations.push(
      `Cân nhắc tạo combo mua 2 giảm 5% để tăng AOV, hoặc điều chỉnh giá niêm yết về vùng ${formatVnd(suggestedSafePrice)}.`
    );
  } else {
    recommendations.push(
      `Biên ròng ${netMarginPct}% đủ dư địa để mở rộng KOC Affiliate và duy trì Ads trong ngưỡng ROAS hòa vốn ${breakEvenRoas ?? '—'}x.`
    );
  }

  if (safeFlashPct >= 20 && safeVoucher > 0) {
    warnings.push(
      'Đang chồng đồng thời Flash Sale lớn (>= 20%) và Voucher Shop — rất dễ xảy ra tình trạng giảm giá kép ngoài dự kiến.'
    );
  }
  if (safeKocPct >= 15) {
    recommendations.push(
      `Hoa hồng KOC đang ở mức ${safeKocPct}%. Nên tách Cộng tác Mở 8–10% và chỉ mở mức ${safeKocPct}% cho KOC mục tiêu đã ra đơn thật.`
    );
  }
  if (safeReturnPct >= 10) {
    warnings.push(
      `Tỷ lệ hoàn ${safeReturnPct}% đang ăn mòn ${formatVnd(returnLossReserve)}/đơn. Nên bổ sung ảnh bảng size/cận chất liệu & xác nhận đơn giá trị cao.`
    );
  }

  return {
    effectivePrice,
    flashSaleDiscount,
    platformFeeAmount,
    kocFeeAmount,
    returnLossReserve,
    totalCost,
    netProfit,
    netMarginPct,
    profitBeforeAds,
    breakEvenRoas,
    suggestedSafePrice,
    riskLevel,
    riskLabel,
    warnings,
    recommendations,
  };
}

function escapeCsvCell(value: string | number): string {
  const raw = String(value);
  if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function buildTikTokProfitCsv(
  input: TikTokProfitInput,
  result: TikTokProfitResult
): string {
  const rows: Array<[string, string | number, string]> = [
    ['Hạng mục phân tích', 'Giá trị', 'Ghi chú nghiệp vụ'],
    ['Sản phẩm', input.productName || 'Sản phẩm chưa đặt tên', 'Tổ Chức Nhân Viên AI — Lan (Tài chính)'],
    ['Giá niêm yết', input.listPrice, 'VNĐ'],
    ['Giảm Flash Sale (%)', `${input.flashSalePct}%`, `Giảm ${formatVnd(result.flashSaleDiscount)}`],
    ['Voucher Shop', input.shopVoucher, 'VNĐ'],
    ['Giá thu thực tế sau khuyến mãi', result.effectivePrice, 'Doanh thu thuần trên đơn'],
    ['Giá vốn nhập hàng (COGS)', input.cogs, 'VNĐ'],
    ['Phí sàn + Thanh toán + Thuế', result.platformFeeAmount, `${input.platformFeePct}% trên giá thực thu`],
    ['Hoa hồng KOC Affiliate', result.kocFeeAmount, `${input.kocCommissionPct}% trên giá thực thu`],
    ['Chi phí đóng gói & vật tư', input.packagingCost, 'VNĐ'],
    ['Dự phòng tổn thất hoàn hàng', result.returnLossReserve, `Tỷ lệ hoàn ${input.returnRatePct}%`],
    ['Chi phí quảng cáo (Ads/đơn)', input.adsPerOrder, 'VNĐ'],
    ['TỔNG CHI PHÍ TRÊN ĐƠN', result.totalCost, 'Đã bao gồm mọi chi phí ẩn'],
    ['LÃI RÒNG TRÊN MỖI ĐƠN', result.netProfit, `${result.netMarginPct}% biên lợi nhuận ròng`],
    ['ROAS hòa vốn tối thiểu', result.breakEvenRoas ?? 'Không đạt (âm trước Ads)', 'Doanh thu / Chi phí Ads tối đa'],
    ['Giá niêm yết an toàn gợi ý (biên 20%)', result.suggestedSafePrice, 'VNĐ'],
    ['Kết luận rủi ro', result.riskLabel, result.warnings.join(' | ') || 'Đạt chuẩn an toàn'],
    ['Khuyến nghị hành động', result.recommendations.join(' | '), 'Liên hệ hỗ trợ: Zalo 0353205414'],
  ];

  // UTF-8 BOM để mở trực tiếp trên Microsoft Excel không lỗi font tiếng Việt
  return '\uFEFF' + rows.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n');
}

/* ============================================================================
 * 2. NAM — QUÉT TỪ KHÓA CẤM & CHUẨN HÓA SEO SÀN TMĐT / GOOGLE
 * ========================================================================== */

export interface ComplianceRule {
  phrase: string;
  category: 'Điều hướng ngoài sàn' | 'Cam kết phóng đại' | 'Thương hiệu / Hàng nhạy cảm';
  severity: 'high' | 'medium';
  replacement: string;
  reason: string;
}

export const VIOLATION_RULES: ComplianceRule[] = [
  // Điều hướng ngoài sàn
  { phrase: 'zalo', category: 'Điều hướng ngoài sàn', severity: 'high', replacement: 'tin nhắn trên sàn', reason: 'Nền tảng cấm kéo khách rời khỏi sàn giao dịch' },
  { phrase: 'facebook', category: 'Điều hướng ngoài sàn', severity: 'high', replacement: 'kênh chính thức của shop', reason: 'Chứa tên mạng xã hội ngoài sàn' },
  { phrase: 'shopee', category: 'Điều hướng ngoài sàn', severity: 'high', replacement: 'gian hàng chính hãng', reason: 'Nhắc tên sàn đối thủ dễ bị bóp hiển thị' },
  { phrase: 'lazada', category: 'Điều hướng ngoài sàn', severity: 'high', replacement: 'gian hàng chính hãng', reason: 'Nhắc tên sàn đối thủ' },
  { phrase: 'chuyển khoản riêng', category: 'Điều hướng ngoài sàn', severity: 'high', replacement: 'thanh toán trực tiếp trên sàn', reason: 'Dấu hiệu giao dịch ngoài sàn' },
  { phrase: 'mua ngoài', category: 'Điều hướng ngoài sàn', severity: 'high', replacement: 'đặt ngay tại giỏ hàng', reason: 'Kéo giao dịch ra ngoài nền tảng' },
  { phrase: 'link bio', category: 'Điều hướng ngoài sàn', severity: 'medium', replacement: 'giỏ hàng góc trái màn hình', reason: 'Hạn chế điều hướng ra liên kết ngoài' },
  { phrase: 'số điện thoại', category: 'Điều hướng ngoài sàn', severity: 'high', replacement: 'mục chat hỗ trợ của shop', reason: 'Cấm để thông tin liên hệ cá nhân trong mô tả sản phẩm' },
  { phrase: 'sđt', category: 'Điều hướng ngoài sàn', severity: 'high', replacement: 'mục chat hỗ trợ', reason: 'Viết tắt thông tin liên hệ ngoài sàn' },
  { phrase: 'ib riêng', category: 'Điều hướng ngoài sàn', severity: 'medium', replacement: 'nhắn tin trực tiếp cho gian hàng', reason: 'Dễ bị hệ thống đánh dấu kéo khách' },

  // Cam kết phóng đại / Y tế nhạy cảm
  { phrase: 'trị dứt điểm', category: 'Cam kết phóng đại', severity: 'high', replacement: 'hỗ trợ cải thiện hiệu quả', reason: 'Từ ngữ y tế khẳng định tuyệt đối bị cấm trên sàn' },
  { phrase: 'chữa khỏi 100%', category: 'Cam kết phóng đại', severity: 'high', replacement: 'hỗ trợ chăm sóc và phục hồi', reason: 'Cam kết điều trị tuyệt đối' },
  { phrase: 'cam kết 100%', category: 'Cam kết phóng đại', severity: 'high', replacement: 'hỗ trợ đổi trả minh bạch theo chính sách', reason: 'Khẳng định tuyệt đối 100% dễ bị từ chối duyệt sản phẩm' },
  { phrase: 'trắng bật tông sau 1 lần', category: 'Cam kết phóng đại', severity: 'high', replacement: 'hỗ trợ dưỡng sáng đều màu da', reason: 'Phóng đại công dụng mỹ phẩm tức thì' },
  { phrase: 'giảm cân cấp tốc', category: 'Cam kết phóng đại', severity: 'high', replacement: 'hỗ trợ kiểm soát cân nặng lành mạnh', reason: 'Từ khóa kiểm duyệt gắt gao về sức khỏe' },
  { phrase: 'đặc trị', category: 'Cam kết phóng đại', severity: 'high', replacement: 'chăm sóc chuyên sâu', reason: 'Từ ngữ chỉ định thuốc/y tế' },
  { phrase: 'tốt nhất thế giới', category: 'Cam kết phóng đại', severity: 'medium', replacement: 'được nhiều khách hàng tin chọn', reason: 'So sánh nhất không có chứng nhận' },
  { phrase: 'số 1 việt nam', category: 'Cam kết phóng đại', severity: 'medium', replacement: 'được khách hàng đánh giá cao', reason: 'Khẳng định vị trí số 1 không có bằng chứng' },
  { phrase: 'vĩnh viễn', category: 'Cam kết phóng đại', severity: 'medium', replacement: 'bền bỉ lâu dài', reason: 'Cam kết tuyệt đối về thời gian' },
  { phrase: 'thần thánh', category: 'Cam kết phóng đại', severity: 'medium', replacement: 'tiện lợi nổi bật', reason: 'Ngôn từ phóng đại công dụng' },
  { phrase: 'duy nhất', category: 'Cam kết phóng đại', severity: 'medium', replacement: 'phiên bản nổi bật', reason: 'Khẳng định độc quyền không kiểm chứng' },
  { phrase: 'hoàn tiền 1000%', category: 'Cam kết phóng đại', severity: 'high', replacement: 'hỗ trợ đổi trả đúng quy định sàn', reason: 'Cam kết phóng đại gây hiểu nhầm' },

  // Hàng giả / thương hiệu nhạy cảm
  { phrase: 'rep 1:1', category: 'Thương hiệu / Hàng nhạy cảm', severity: 'high', replacement: 'thiết kế thời trang cao cấp', reason: 'Dấu hiệu hàng giả/nhái — nguy cơ khóa shop ngay lập tức' },
  { phrase: 'super fake', category: 'Thương hiệu / Hàng nhạy cảm', severity: 'high', replacement: 'mẫu phổ thông chất lượng tốt', reason: 'Vi phạm nghiêm trọng chính sách sở hữu trí tuệ' },
  { phrase: 'siêu cấp', category: 'Thương hiệu / Hàng nhạy cảm', severity: 'medium', replacement: 'phiên bản hoàn thiện cao', reason: 'Thường gắn với nhóm hàng nhái thương hiệu' },
  { phrase: 'hàng tuồn', category: 'Thương hiệu / Hàng nhạy cảm', severity: 'high', replacement: 'hàng xưởng sản xuất trực tiếp', reason: 'Nguồn gốc không minh bạch theo chuẩn sàn' },
  { phrase: 'xách tay không bill', category: 'Thương hiệu / Hàng nhạy cảm', severity: 'high', replacement: 'sản phẩm có nguồn gốc rõ ràng', reason: 'Thiếu chứng từ chứng minh nguồn gốc' },
  { phrase: 'hàng nhái', category: 'Thương hiệu / Hàng nhạy cảm', severity: 'high', replacement: 'sản phẩm phổ thông', reason: 'Vi phạm sở hữu trí tuệ' },
];

export interface ComplianceAuditInput {
  title: string;
  description: string;
  primaryKeyword: string;
  platform: 'tiktok_shop' | 'shopee' | 'google_seo';
}

export interface FlaggedIssue {
  phrase: string;
  category: string;
  severity: 'high' | 'medium';
  replacement: string;
  reason: string;
  location: 'Tiêu đề' | 'Mô tả' | 'Tiêu đề & Mô tả';
}

export interface ComplianceAuditResult {
  seoScore: number;
  riskStatus: 'safe' | 'caution' | 'high_risk';
  riskLabel: string;
  flaggedIssues: FlaggedIssue[];
  seoChecklist: Array<{ label: string; passed: boolean; note: string }>;
  cleanedTitle: string;
  cleanedDescription: string;
}

function replaceCaseInsensitive(source: string, phrase: string, replacement: string): string {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.replace(new RegExp(escaped, 'gi'), replacement);
}

export function auditComplianceAndSeo(input: ComplianceAuditInput): ComplianceAuditResult {
  const title = (input.title || '').trim();
  const description = (input.description || '').trim();
  const keyword = (input.primaryKeyword || '').trim();
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();

  const flaggedIssues: FlaggedIssue[] = [];
  let cleanedTitle = title;
  let cleanedDescription = description;

  for (const rule of VIOLATION_RULES) {
    // Nếu đang tối ưu Google SEO, cho phép nhắc tên sàn/Zalo thông thường, chỉ phạt khi bán hàng trên sàn
    if (
      input.platform === 'google_seo' &&
      rule.category === 'Điều hướng ngoài sàn'
    ) {
      continue;
    }
    const inTitle = titleLower.includes(rule.phrase);
    const inDesc = descLower.includes(rule.phrase);
    if (inTitle || inDesc) {
      flaggedIssues.push({
        phrase: rule.phrase,
        category: rule.category,
        severity: rule.severity,
        replacement: rule.replacement,
        reason: rule.reason,
        location: inTitle && inDesc ? 'Tiêu đề & Mô tả' : inTitle ? 'Tiêu đề' : 'Mô tả',
      });
      if (inTitle) cleanedTitle = replaceCaseInsensitive(cleanedTitle, rule.phrase, rule.replacement);
      if (inDesc) cleanedDescription = replaceCaseInsensitive(cleanedDescription, rule.phrase, rule.replacement);
    }
  }

  // Phát hiện số điện thoại trực tiếp trong nội dung sàn TMĐT
  const phoneRegex = /\b0[35789]\d{8}\b/g;
  if (input.platform !== 'google_seo') {
    const titlePhones = title.match(phoneRegex) || [];
    const descPhones = description.match(phoneRegex) || [];
    if (titlePhones.length > 0 || descPhones.length > 0) {
      flaggedIssues.push({
        phrase: (titlePhones[0] || descPhones[0]) as string,
        category: 'Điều hướng ngoài sàn',
        severity: 'high',
        replacement: '[Đã ẩn SĐT — chat trực tiếp trên sàn]',
        reason: 'Chứa số điện thoại cá nhân trong nội dung sản phẩm có thể bị khóa hiển thị ngay lập tức',
        location:
          titlePhones.length > 0 && descPhones.length > 0
            ? 'Tiêu đề & Mô tả'
            : titlePhones.length > 0
              ? 'Tiêu đề'
              : 'Mô tả',
      });
      cleanedTitle = cleanedTitle.replace(phoneRegex, '[chat trên sàn]');
      cleanedDescription = cleanedDescription.replace(phoneRegex, '[nhắn tin trực tiếp cho shop trên sàn]');
    }
  }

  const titleLenOk = title.length >= 40 && title.length <= 125;
  const hasKeywordInTitle =
    keyword.length === 0 ? true : titleLower.includes(keyword.toLowerCase());
  const descLenOk = description.length >= 120;
  const noSpamPunctuation = !/[!?.]{4,}/.test(`${title} ${description}`);

  const seoChecklist = [
    {
      label: 'Độ dài tiêu đề chuẩn SEO (40–125 ký tự)',
      passed: titleLenOk,
      note: `Hiện tại: ${title.length} ký tự.`,
    },
    {
      label: 'Chứa từ khóa chính ngay trong tiêu đề',
      passed: hasKeywordInTitle,
      note: keyword ? `Từ khóa: "${keyword}"` : 'Chưa nhập từ khóa chính (tùy chọn).',
    },
    {
      label: 'Mô tả đủ chiều sâu giải tỏa băn khoăn (>= 120 ký tự)',
      passed: descLenOk,
      note: `Hiện tại: ${description.length} ký tự.`,
    },
    {
      label: 'Không lặp dấu câu spam (!!!! / ????)',
      passed: noSpamPunctuation,
      note: noSpamPunctuation ? 'Trình bày sạch sẽ.' : 'Nên bỏ bớt dấu chấm than/hỏi lặp liên tiếp.',
    },
  ];

  let score = 100;
  for (const issue of flaggedIssues) {
    score -= issue.severity === 'high' ? 22 : 10;
  }
  seoChecklist.forEach((chk) => {
    if (!chk.passed) score -= 8;
  });
  const seoScore = Math.max(0, Math.min(100, score));

  const highCount = flaggedIssues.filter((i) => i.severity === 'high').length;
  let riskStatus: ComplianceAuditResult['riskStatus'] = 'safe';
  let riskLabel = 'Sạch chính sách — Sẵn sàng đăng bán';
  if (highCount > 0) {
    riskStatus = 'high_risk';
    riskLabel = `Rủi ro cao (${highCount} lỗi nặng cần sửa ngay)`;
  } else if (flaggedIssues.length > 0 || seoScore < 75) {
    riskStatus = 'caution';
    riskLabel = 'Cần tối ưu nhẹ trước khi đăng';
  }

  return {
    seoScore,
    riskStatus,
    riskLabel,
    flaggedIssues,
    seoChecklist,
    cleanedTitle,
    cleanedDescription,
  };
}

/* ============================================================================
 * 3. TRANG & HÙNG — KỊCH BẢN VIDEO 45S + TIN NHẮN MỜI KOC AFFILIATE
 * ========================================================================== */

export interface VideoKocInput {
  productName: string;
  targetAudience: string;
  coreBenefit: string;
  pricePoint: string;
  commissionPct: number;
  offerNote: string;
}

export interface VideoKocResult {
  hooks: string[];
  scenes: Array<{ time: string; visual: string; voiceover: string; onScreenText: string }>;
  kocMessageStandard: string;
  kocMessageTopCreator: string;
  hashtags: string[];
}

export function generateVideoAndKocKit(input: VideoKocInput): VideoKocResult {
  const product = input.productName.trim() || 'Sản phẩm chủ lực của shop';
  const audience = input.targetAudience.trim() || 'khách hàng bận rộn';
  const benefit = input.coreBenefit.trim() || 'tiết kiệm thời gian và dùng bền mỗi ngày';
  const price = input.pricePoint.trim() || 'chỉ từ 199K';
  const comm = Math.max(1, Math.min(50, Number(input.commissionPct) || 12));
  const offer = input.offerNote.trim() || 'tặng mẫu dùng thử miễn phí + voucher độc quyền';

  const hooks = [
    `[Hook Nỗi Đau] "${audience} mà vẫn loay hoay chọn mua ${product} thì dừng lại 3 giây xem hết video này!"`,
    `[Hook Thực Chiến] "Test thực tế ${product} mức giá ${price} — điểm nào đáng tiền, điểm nào cần cân nhắc?"`,
    `[Hook Tò Mò] "Lý do 9/10 ${audience} dùng thử ${product} xong đều giữ lại dùng mỗi ngày là vì chi tiết nhỏ này..."`,
  ];

  const scenes = [
    {
      time: '00:00 – 00:03',
      visual: 'Quay cận cảnh sản phẩm + chuyển động tay cầm chắc chắn trên nền sáng.',
      voiceover: hooks[0].replace(/^\[.*?\]\s*"?/, '').replace(/"$/, ''),
      onScreenText: `${product.toUpperCase()} — ĐÁNG TIỀN KHÔNG?`,
    },
    {
      time: '00:03 – 00:12',
      visual: 'So sánh tình huống cũ bất tiện với lúc dùng sản phẩm mới.',
      voiceover: `Trước đây nhiều anh chị ${audience} hay gặp cảnh mua nhầm hàng nhanh hỏng, dùng không đúng nhu cầu. Với ${product}, điểm ăn tiền nhất là ${benefit}.`,
      onScreenText: `ĐIỂM MẠNH: ${benefit}`,
    },
    {
      time: '00:12 – 00:28',
      visual: 'Zoom chi tiết chất liệu/tính năng thật, thao tác sử dụng thực tế trong 15 giây.',
      voiceover: `Mình quay cận cảnh không filter để mọi người tự kiểm chứng độ hoàn thiện. Dùng hằng ngày rất gọn tay, dễ vệ sinh và an tâm sử dụng lâu dài.`,
      onScreenText: 'QUAY THẬT 100% — KHÔNG CHỈNH SỬA',
    },
    {
      time: '00:28 – 00:38',
      visual: 'Hiển thị đóng gói cẩn thận, chính sách kiểm tra & đổi trả minh bạch trên sàn.',
      voiceover: `Mức giá hiện tại đang rất dễ tiếp cận (${price}), shop đóng gói chống sốc kỹ và hỗ trợ đổi trả minh bạch theo đúng chính sách sàn.`,
      onScreenText: `GIÁ TỐT ${price} · ĐỔI TRẢ MINH BẠCH`,
    },
    {
      time: '00:38 – 00:45',
      visual: 'Chỉ tay xuống góc trái màn hình nơi gắn giỏ hàng.',
      voiceover: `Mình đã gắn sẵn ${product} ở giỏ hàng góc trái màn hình. Anh chị bấm xem ưu đãi hôm nay trước khi hết mã nhé!`,
      onScreenText: 'BẤM GIỎ HÀNG GÓC TRÁI ĐỂ XEM ƯU ĐÃI 👇',
    },
  ];

  const kocMessageStandard = `Chào bạn, mình là đại diện gian hàng phân phối ${product}. Mình rất thích phong cách review chân thật trên kênh bạn và thấy tệp người xem của bạn rất khớp với nhóm ${audience}.\n\nBên mình trân trọng mời bạn hợp tác Affiliate với quyền lợi:\n• Hoa hồng Cộng tác mục tiêu: ${comm}% (cao hơn mức mở đại trà)\n• Hỗ trợ: ${offer}\n• Gửi sẵn bộ 3 góc quay thực tế giúp video dễ lên xu hướng & sạch chính sách.\n\nBạn phản hồi lại ngay trên tin nhắn sàn nếu muốn nhận mẫu trải nghiệm tuần này nhé!`;

  const kocMessageTopCreator = `Chào team/bạn, gian hàng bên mình đang đẩy chiến dịch tăng trưởng cho dòng ${product} (phân khúc ${price}, điểm mạnh ${benefit}).\n\nDựa trên tỷ lệ chuyển đổi rất tốt của kênh bạn, bên mình đề xuất gói hợp tác ưu tiên:\n1. Mở mức hoa hồng riêng ${comm}% + thưởng nóng theo mốc GMV tuần.\n2. Cấp mã Voucher riêng cho người xem của kênh + ${offer}.\n3. Hỗ trợ gửi mẫu hỏa tốc trong 24h để bạn chủ động lịch lên clip/LIVE.\n\nNếu bạn quan tâm, nhắn mình xác nhận để gửi link Cộng tác mục tiêu ngay hôm nay nhé!`;

  const hashtags = [
    '#ReviewChanThat',
    '#TikTokShopVietnam',
    '#KOCAffiliate',
    '#KinhNghiemMuaSam',
    '#ToChucNhanVienAI',
  ];

  return {
    hooks,
    scenes,
    kocMessageStandard,
    kocMessageTopCreator,
    hashtags,
  };
}

/* ============================================================================
 * 4. PHONG & VY — TRỢ LÝ GIÁO DỤC / GVCN (KẾ HOẠCH TUẦN + TIN NHẮN PHỤ HUYNH)
 * ========================================================================== */

export interface TeacherKitInput {
  className: string;
  teacherName: string;
  weekLabel: string;
  focusTopic: string;
  studentHighlight: string;
  reminderNote: string;
  tone: 'am_ap' | 'trang_trong' | 'ngan_gon';
}

export interface TeacherKitResult {
  weeklyPlan: Array<{ day: string; task: string; owner: string }>;
  zaloClassBroadcast: string;
  zaloPraiseMessage: string;
  zaloGentleReminder: string;
  tt27Comments: string[];
}

export function generateTeacherParentKit(input: TeacherKitInput): TeacherKitResult {
  const cls = input.className.trim() || 'Lớp 5A';
  const teacher = input.teacherName.trim() || 'GVCN';
  const week = input.weekLabel.trim() || 'Tuần 12';
  const focus = input.focusTopic.trim() || 'Rèn nề nếp tự học & chuẩn bị kiểm tra giữa kỳ';
  const highlight = input.studentHighlight.trim() || 'Các con đi học đúng giờ, tích cực phát biểu xây dựng bài';
  const reminder = input.reminderNote.trim() || 'Nhờ phụ huynh nhắc con chuẩn bị đầy đủ sách vở và ngủ trước 21h30';

  const greeting =
    input.tone === 'trang_trong'
      ? `Kính gửi quý phụ huynh ${cls},`
      : input.tone === 'ngan_gon'
        ? `Chào quý phụ huynh ${cls},`
        : `Thân chào quý phụ huynh yêu quý của ${cls},`;

  const closing =
    input.tone === 'ngan_gon'
      ? `Trân trọng cảm ơn quý phụ huynh.\n— ${teacher}`
      : `Rất mong tiếp tục nhận được sự đồng hành sát sao của gia đình để các con có một tuần học thật vui và tiến bộ.\nTrân trọng,\n${teacher} — Chủ nhiệm ${cls}`;

  const weeklyPlan = [
    { day: 'Thứ 2', task: `Sinh hoạt đầu tuần, phổ biến mục tiêu ${week}: ${focus}`, owner: teacher },
    { day: 'Thứ 3 – Thứ 4', task: 'Theo dõi nề nếp, ghi nhận điểm cộng thái độ học tập & hỗ trợ nhóm học sinh cần kèm thêm', owner: `${teacher} & Ban cán sự lớp` },
    { day: 'Thứ 5', task: 'Rà soát bài tập trọng tâm, trao đổi nhanh với phụ huynh các trường hợp cần lưu ý', owner: teacher },
    { day: 'Thứ 6', task: 'Tổng kết thi đua tuần, tuyên dương học sinh tiến bộ và gửi thông báo cuối tuần qua Zalo nhóm lớp', owner: teacher },
  ];

  const zaloClassBroadcast = `${greeting}\n\nCô/Thầy xin gửi tới gia đình bản tổng hợp nhanh kế hoạch ${week} của ${cls}:\n1. Trọng tâm tuần này: ${focus}.\n2. Điểm sáng đáng khen: ${highlight}.\n3. Phối hợp cùng gia đình: ${reminder}.\n\n${closing}`;

  const zaloPraiseMessage = `${greeting}\n\nHôm nay ${teacher} muốn nhắn riêng một tin vui nhỏ về con: trong ${week}, con có sự tiến bộ rất rõ rệt ở nội dung "${focus}", tích cực tương tác và hoàn thành nhiệm vụ nghiêm túc. Gia đình hãy dành cho con một lời động viên tối nay để con thêm tự tin nhé!\n\nTrân trọng,\n${teacher}`;

  const zaloGentleReminder = `${greeting}\n\nTrong quá trình theo dõi tuần học vừa qua (${week}), ${teacher} nhận thấy con có năng lực tốt nhưng đôi lúc còn hơi xao nhãng ở phần "${focus}". ${reminder}. Rất mong gia đình cùng trò chuyện nhẹ nhàng để con giữ nhịp học đều đặn hơn trong tuần tới nhé.\n\nCảm ơn sự đồng hành của gia đình!\n${teacher}`;

  const tt27Comments = [
    `Hoàn thành tốt các nội dung học tập trong ${week}; chủ động hợp tác với bạn bè và có ý thức giữ gìn nề nếp lớp ${cls}.`,
    `Có tiến bộ rõ rệt về kỹ năng trình bày và sự tập trung trong giờ học; cần phát huy tinh thần tự giác khi chuẩn bị bài ở nhà.`,
    `Ngoan, lễ phép, tích cực tham gia hoạt động tập thể; gia đình tiếp tục khích lệ để con mạnh dạn phát biểu hơn trước lớp.`,
  ];

  return {
    weeklyPlan,
    zaloClassBroadcast,
    zaloPraiseMessage,
    zaloGentleReminder,
    tt27Comments,
  };
}

/* ============================================================================
 * TRÌNH XUẤT MICROSOFT WORD (.DOC) CHUNG — MỞ ĐẸP TRÊN WORD & GOOGLE DOCS
 * ========================================================================== */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function wrapWordHtmlDocument(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="vi">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; line-height: 1.6; padding: 24px; }
  h1 { color: #0369a1; font-size: 20pt; border-bottom: 2px solid #0ea5e9; padding-bottom: 8px; }
  h2 { color: #0f172a; font-size: 13pt; margin-top: 18px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 10.5pt; }
  th { background: #e0f2fe; color: #0c4a6e; }
  .box { background: #f8fafc; border-left: 4px solid #0284c7; padding: 10px 14px; margin: 10px 0; white-space: pre-line; }
  .footer { margin-top: 24px; font-size: 9pt; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px; }
</style>
</head>
<body>
${bodyHtml}
<div class="footer">Xuất tự động từ <strong>Tổ Chức Nhân Viên AI</strong> (https://bigman-ai-workspace.vercel.app) · Hỗ trợ: Zalo 0353205414 · Email: thaytiensy@gmail.com</div>
</body>
</html>`;
}

export function buildComplianceWordDoc(
  input: ComplianceAuditInput,
  result: ComplianceAuditResult
): string {
  const issuesRows =
    result.flaggedIssues.length > 0
      ? result.flaggedIssues
          .map(
            (i) =>
              `<tr><td><strong>${escapeHtml(i.phrase)}</strong></td><td>${escapeHtml(i.category)}</td><td>${escapeHtml(i.location)}</td><td>${escapeHtml(i.replacement)}</td><td>${escapeHtml(i.reason)}</td></tr>`
          )
          .join('')
      : '<tr><td colspan="5">Không phát hiện từ khóa vi phạm chính sách.</td></tr>';

  const body = `
    <h1>Báo Cáo Quét Từ Khóa Cấm &amp; Tối Ưu SEO</h1>
    <p><strong>Nhân viên phụ trách:</strong> Nam (AI SEO &amp; Chống vi phạm) · <strong>Điểm SEO:</strong> ${result.seoScore}/100 · <strong>Trạng thái:</strong> ${escapeHtml(result.riskLabel)}</p>
    <h2>1. Chi tiết từ khóa rủi ro (${result.flaggedIssues.length})</h2>
    <table>
      <thead><tr><th>Từ khóa bị gắn cờ</th><th>Nhóm lỗi</th><th>Vị trí</th><th>Gợi ý thay thế sạch</th><th>Lý do</th></tr></thead>
      <tbody>${issuesRows}</tbody>
    </table>
    <h2>2. Phiên bản sạch đã chuẩn hóa sẵn sàng đăng</h2>
    <div class="box"><strong>Tiêu đề chuẩn:</strong>\n${escapeHtml(result.cleanedTitle)}</div>
    <div class="box"><strong>Mô tả chuẩn:</strong>\n${escapeHtml(result.cleanedDescription)}</div>
  `;
  return wrapWordHtmlDocument('Bao cao SEO va Chong vi pham', body);
}

export function buildVideoKocWordDoc(input: VideoKocInput, result: VideoKocResult): string {
  const sceneRows = result.scenes
    .map(
      (s) =>
        `<tr><td><strong>${escapeHtml(s.time)}</strong></td><td>${escapeHtml(s.visual)}</td><td>${escapeHtml(s.voiceover)}</td><td>${escapeHtml(s.onScreenText)}</td></tr>`
    )
    .join('');

  const body = `
    <h1>Kịch Bản Video Ngắn 45 Giây &amp; Bộ Tin Nhắn Mời KOC Affiliate</h1>
    <p><strong>Sản phẩm:</strong> ${escapeHtml(input.productName)} · <strong>Nhân viên phụ trách:</strong> Trang (Content) &amp; Hùng (KOC Affiliate)</p>
    <h2>1. 3 Hook giữ chân 3 giây đầu</h2>
    <ul>${result.hooks.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul>
    <h2>2. Bảng phân cảnh 45 giây chuẩn chuyển đổi</h2>
    <table>
      <thead><tr><th>Khung giây</th><th>Góc quay / Hình ảnh</th><th>Lời thoại</th><th>Chữ hiển thị</th></tr></thead>
      <tbody>${sceneRows}</tbody>
    </table>
    <h2>3. Mẫu tin nhắn mời KOC chuẩn chính sách (Hoa hồng ${input.commissionPct}%)</h2>
    <div class="box"><strong>Mẫu 1 — KOC tiềm năng:</strong>\n${escapeHtml(result.kocMessageStandard)}</div>
    <div class="box"><strong>Mẫu 2 — KOC doanh số cao:</strong>\n${escapeHtml(result.kocMessageTopCreator)}</div>
    <p><strong>Hashtag gợi ý:</strong> ${escapeHtml(result.hashtags.join(' '))}</p>
  `;
  return wrapWordHtmlDocument(`Kich ban Video & KOC - ${input.productName}`, body);
}

export function buildTeacherKitWordDoc(input: TeacherKitInput, result: TeacherKitResult): string {
  const planRows = result.weeklyPlan
    .map(
      (p) =>
        `<tr><td><strong>${escapeHtml(p.day)}</strong></td><td>${escapeHtml(p.task)}</td><td>${escapeHtml(p.owner)}</td></tr>`
    )
    .join('');

  const body = `
    <h1>Bộ Hồ Sơ Chủ Nhiệm ${escapeHtml(input.weekLabel)} — ${escapeHtml(input.className)}</h1>
    <p><strong>Giáo viên:</strong> ${escapeHtml(input.teacherName)} · <strong>Nhân viên AI hỗ trợ:</strong> Phong &amp; Vy (Trợ lý Giáo dục)</p>
    <h2>1. Kế hoạch chủ nhiệm tuần</h2>
    <table>
      <thead><tr><th>Thời gian</th><th>Nội dung triển khai</th><th>Phụ trách</th></tr></thead>
      <tbody>${planRows}</tbody>
    </table>
    <h2>2. Bộ 3 mẫu tin nhắn Zalo Phụ huynh</h2>
    <div class="box"><strong>Thông báo chung cả lớp:</strong>\n${escapeHtml(result.zaloClassBroadcast)}</div>
    <div class="box"><strong>Tin nhắn khen ngợi riêng:</strong>\n${escapeHtml(result.zaloPraiseMessage)}</div>
    <div class="box"><strong>Tin nhắn nhắc nhở tinh tế:</strong>\n${escapeHtml(result.zaloGentleReminder)}</div>
    <h2>3. Gợi ý nhận xét chuẩn Thông tư 27</h2>
    <ul>${result.tt27Comments.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
  `;
  return wrapWordHtmlDocument(`Ho so GVCN ${input.className} ${input.weekLabel}`, body);
}
