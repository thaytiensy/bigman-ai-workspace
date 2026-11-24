import { describe, expect, it } from 'vitest';
import {
  computeBotDuty,
  generateStructuredMeetingMinutes,
  INITIAL_APPROVALS,
  INITIAL_KANBAN_TASKS,
  runOfficeDoctor,
  runOfficeSelfRepair,
} from '../src/lib/office3d/officeStore';
import { INITIAL_BOTS } from '../src/data/mockWorkspaceData';
import {
  buildWorkspaceFromIndustryTemplate,
  INDUSTRY_TEMPLATES,
} from '../src/data/industryTemplates';
import { DEPLOYABLE_PACKS } from '../src/components/workspace/OfficeExtraViews';
import type { HandoffLink, OfficeDepartment } from '../src/lib/office3d/types';

describe('Virtual Office Organization Engine (Hermes Parity + Unlimited Expansion)', () => {
  it('enforces strict 5-level Duty State Machine priority (meeting > a2a > desk > review > idle)', () => {
    const baseBot = { id: 'bot-sunny', isActive: true, isLocked: false, status: 'working' as const };

    expect(
      computeBotDuty(
        baseBot,
        INITIAL_KANBAN_TASKS,
        INITIAL_APPROVALS,
        new Set(['bot-sunny']),
        new Set(['bot-sunny'])
      )
    ).toBe('meeting');

    expect(
      computeBotDuty(
        baseBot,
        INITIAL_KANBAN_TASKS,
        INITIAL_APPROVALS,
        new Set(),
        new Set(['bot-sunny'])
      )
    ).toBe('a2a');

    expect(
      computeBotDuty(baseBot, INITIAL_KANBAN_TASKS, [], new Set(), new Set())
    ).toBe('desk');

    const reviewerBot = { id: 'bot-wren', isActive: true, isLocked: false, status: 'ready' as const };
    expect(
      computeBotDuty(reviewerBot, INITIAL_KANBAN_TASKS, [], new Set(), new Set())
    ).toBe('review');

    const idleBot = { id: 'bot-free', isActive: true, isLocked: false, status: 'ready' as const };
    expect(computeBotDuty(idleBot, INITIAL_KANBAN_TASKS, [], new Set(), new Set())).toBe('idle');

    const lockedBot = { id: 'bot-locked', isActive: false, isLocked: true, status: 'working' as const };
    expect(
      computeBotDuty(
        lockedBot,
        INITIAL_KANBAN_TASKS,
        INITIAL_APPROVALS,
        new Set(['bot-locked']),
        new Set()
      )
    ).toBe('idle');
  });

  it('generates structured Meeting Minutes with Decisions, Action Items, and Risks', () => {
    const depts: OfficeDepartment[] = [
      { id: 'dept-1', name: 'Phòng Marketing', shortLabel: 'Marketing', colorHex: '#00f5ff', description: '' },
      { id: 'dept-2', name: 'Phòng Livestream', shortLabel: 'Livestream', colorHex: '#34d399', description: '' },
    ];
    const minutes = generateStructuredMeetingMinutes(
      'Chiến dịch Mega Sale 12.12',
      [
        { id: 'b1', name: 'Trang', roleBadge: 'AI Marketer', departmentId: 'dept-1' },
        { id: 'b2', name: 'Vy', roleBadge: 'AI Live Host', departmentId: 'dept-2' },
      ],
      depts
    );

    expect(minutes.topic).toBe('Chiến dịch Mega Sale 12.12');
    expect(minutes.decisions.length).toBeGreaterThanOrEqual(3);
    expect(minutes.actionItems).toHaveLength(2);
    expect(minutes.risks.length).toBeGreaterThanOrEqual(2);
    expect(minutes.actionItems[1].ownerName).toBe('Vy');
  });

  it('supports unlimited departments/bots and repairs broken links idempotently via Doctor & Self-Repair', () => {
    const manyDepts: OfficeDepartment[] = Array.from({ length: 10 }, (_, i) => ({
      id: `dept-${i + 1}`,
      name: `Phòng Ban Mở Rộng #${i + 1}`,
      shortLabel: `Phòng #${i + 1}`,
      colorHex: '#00f5ff',
      description: 'Phòng ban tùy biến',
      isCustom: true,
    }));
    const manyBotIds = Array.from({ length: 24 }, (_, i) => `bot-${i + 1}`);
    const botDeptMap: Record<string, string> = {};
    manyBotIds.forEach((id, i) => {
      botDeptMap[id] = i === 0 ? 'dept-deleted-ghost' : `dept-${(i % 10) + 1}`;
    });
    const brokenHandoffs: HandoffLink[] = [
      { id: 'h1', fromDeptId: 'dept-1', toDeptId: 'dept-2', label: 'Hợp lệ' },
      { id: 'h2', fromDeptId: 'dept-1', toDeptId: 'dept-deleted-ghost', label: 'Bị gãy' },
      { id: 'h3', fromDeptId: 'dept-2', toDeptId: 'dept-2', label: 'Tự lặp' },
    ];

    const checksBefore = runOfficeDoctor({
      departments: manyDepts,
      botIds: manyBotIds,
      botDeptMap,
      handoffs: brokenHandoffs,
      tasks: INITIAL_KANBAN_TASKS,
      approvals: [],
      byokConfigured: true,
      healthOk: true,
    });
    expect(checksBefore.find((c) => c.id === 'orphan-bots')?.status).toBe('fail');
    expect(checksBefore.find((c) => c.id === 'handoff-graph')?.status).toBe('warn');

    const repaired = runOfficeSelfRepair({
      departments: manyDepts,
      botIds: manyBotIds,
      botDeptMap,
      handoffs: brokenHandoffs,
      tasks: INITIAL_KANBAN_TASKS,
    });
    expect(repaired.report.repairedCount).toBeGreaterThanOrEqual(3);
    expect(repaired.handoffs).toHaveLength(1);
    expect(repaired.botDeptMap['bot-1']).toBe('dept-1');

    // Second run must be idempotent (0 changes)
    const secondPass = runOfficeSelfRepair({
      departments: manyDepts,
      botIds: manyBotIds,
      botDeptMap: repaired.botDeptMap,
      handoffs: repaired.handoffs,
      tasks: repaired.tasks,
    });
    expect(secondPass.report.repairedCount).toBe(0);
  });

  it('uses short 1-word Vietnamese human names for all 10 default bots & 7 deployable packs', () => {
    expect(INITIAL_BOTS).toHaveLength(10);
    expect(INITIAL_BOTS.map((b) => b.name)).toEqual([
      'Minh',
      'Lan',
      'Hùng',
      'Thảo',
      'Nam',
      'Trang',
      'Đức',
      'Hà',
      'Khôi',
      'Linh',
    ]);
    // Desktop Free lock: only first 2 active by default
    expect(INITIAL_BOTS.filter((b) => b.isActive)).toHaveLength(2);

    const packBotNames = DEPLOYABLE_PACKS.flatMap((p) => p.bots.map((b) => b.name));
    expect(packBotNames).toEqual(['Vy', 'Tuấn', 'Ngọc', 'Quân', 'Mai', 'Hương', 'Phong']);
    packBotNames.forEach((name) => {
      expect(name.trim().split(/\s+/)).toHaveLength(1);
    });
  });

  it('provides 8 valid Vietnamese 1-click industry templates respecting Desktop Free 2-bot cap', () => {
    expect(INDUSTRY_TEMPLATES).toHaveLength(8);
    const serialized = JSON.stringify(INDUSTRY_TEMPLATES);
    expect(serialized).not.toContain('chuotbachchiase');
    expect(serialized).not.toContain('65654566778899');
    expect(serialized).not.toContain('DO TIEN SY');

    for (const tpl of INDUSTRY_TEMPLATES) {
      expect(tpl.departments.length).toBeGreaterThanOrEqual(1);
      expect(tpl.bots.length).toBeGreaterThanOrEqual(2);
      expect(tpl.sampleCommands.length).toBeGreaterThanOrEqual(3);
      expect(tpl.sampleRoutines.length).toBeGreaterThanOrEqual(2);
      tpl.bots.forEach((b) => {
        expect(b.name.trim().split(/\s+/)).toHaveLength(1);
      });

      const freeBuilt = buildWorkspaceFromIndustryTemplate(tpl, 'desktop_free');
      expect(freeBuilt.bots.filter((b) => b.isActive).length).toBeLessThanOrEqual(2);

      const cloudBuilt = buildWorkspaceFromIndustryTemplate(tpl, 'cloud_247');
      expect(cloudBuilt.bots.every((b) => b.isActive)).toBe(true);
    }
  });
});
