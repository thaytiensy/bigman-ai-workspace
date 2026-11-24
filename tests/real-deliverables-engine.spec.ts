import { describe, expect, it } from 'vitest';
import {
  auditComplianceAndSeo,
  buildComplianceWordDoc,
  buildTeacherKitWordDoc,
  buildTikTokProfitCsv,
  buildVideoKocWordDoc,
  calculateTikTokProfit,
  generateTeacherParentKit,
  generateVideoAndKocKit,
} from '../src/lib/deliverables/realWorkEngine';

const FORBIDDEN_STRINGS = ['chuotbachchiase', '65654566778899', 'DO TIEN SY'];

describe('Hướng 1 — Xưởng Việc Thật (No-API Deliverable Engines)', () => {
  it('detects hidden loss on TikTok Shop and computes safe price + valid UTF-8 BOM CSV', () => {
    const lossInput = {
      productName: 'Set dưỡng da Combo 3 món',
      cogs: 120000,
      listPrice: 229000,
      flashSalePct: 22,
      shopVoucher: 15000,
      platformFeePct: 12,
      kocCommissionPct: 15,
      packagingCost: 8000,
      returnRatePct: 8,
      adsPerOrder: 25000,
    };
    const res = calculateTikTokProfit(lossInput);
    expect(res.netProfit).toBeLessThan(0);
    expect(res.riskLevel).toBe('danger');
    expect(res.suggestedSafePrice).toBeGreaterThan(lossInput.listPrice);
    expect(res.warnings.length).toBeGreaterThan(0);

    const csv = buildTikTokProfitCsv(lossInput, res);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('LÃI RÒNG TRÊN MỖI ĐƠN');
    expect(csv).toContain('0353205414');
    FORBIDDEN_STRINGS.forEach((s) => expect(csv.toLowerCase()).not.toContain(s.toLowerCase()));
  });

  it('flags platform policy violations, rewrites clean text, and exports Word .doc', () => {
    const input = {
      title: 'Kem trắng bật tông sau 1 lần cam kết 100% ib riêng Zalo 0912345678',
      description: 'Đặc trị dứt điểm hàng siêu cấp, chuyển khoản riêng giảm sâu!!!!',
      primaryKeyword: 'kem dưỡng sáng da',
      platform: 'tiktok_shop' as const,
    };
    const audit = auditComplianceAndSeo(input);
    expect(audit.riskStatus).toBe('high_risk');
    expect(audit.flaggedIssues.length).toBeGreaterThanOrEqual(5);
    expect(audit.cleanedTitle.toLowerCase()).not.toContain('zalo');
    expect(audit.cleanedTitle).not.toContain('0912345678');

    const doc = buildComplianceWordDoc(input, audit);
    expect(doc).toContain('urn:schemas-microsoft-com:office:word');
    expect(doc).toContain('Tổ Chức Nhân Viên AI');
    FORBIDDEN_STRINGS.forEach((s) => expect(doc.toLowerCase()).not.toContain(s.toLowerCase()));
  });

  it('generates 45s Video Script + 2 KOC Affiliate outreach templates + Word .doc', () => {
    const input = {
      productName: 'Bình giữ nhiệt Inox 316',
      targetAudience: 'dân văn phòng',
      coreBenefit: 'giữ lạnh 24h không đọng sương',
      pricePoint: '189.000đ',
      commissionPct: 14,
      offerNote: 'gửi mẫu miễn phí',
    };
    const kit = generateVideoAndKocKit(input);
    expect(kit.hooks).toHaveLength(3);
    expect(kit.scenes).toHaveLength(5);
    expect(kit.kocMessageStandard).toContain('14%');

    const doc = buildVideoKocWordDoc(input, kit);
    expect(doc).toContain('Bình giữ nhiệt Inox 316');
    expect(doc).toContain('thaytiensy@gmail.com');
  });

  it('generates GVCN weekly plan + 3 Zalo parent messages + TT27 comments + Word .doc', () => {
    const input = {
      className: 'Lớp 5A',
      teacherName: 'Cô Minh Anh',
      weekLabel: 'Tuần 12',
      focusTopic: 'Ôn tập giữa kỳ I',
      studentHighlight: 'Đi học đúng giờ',
      reminderNote: 'Ngủ trước 21h30',
      tone: 'am_ap' as const,
    };
    const kit = generateTeacherParentKit(input);
    expect(kit.weeklyPlan).toHaveLength(4);
    expect(kit.zaloClassBroadcast).toContain('Lớp 5A');
    expect(kit.tt27Comments.length).toBeGreaterThanOrEqual(3);

    const doc = buildTeacherKitWordDoc(input, kit);
    expect(doc).toContain('Cô Minh Anh');
    expect(doc).toContain('0353205414');
  });
});
