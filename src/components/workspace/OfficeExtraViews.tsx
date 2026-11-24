'use client';

import React, { useState } from 'react';
import {
  Activity,
  AppWindow,
  BarChart3,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Inbox,
  Kanban,
  Layers,
  Plus,
  Rocket,
  ShieldAlert,
  Sparkles,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import { DUTY_META } from '@/lib/office3d/officeStore';
import type { WorkspaceOrgState } from '@/lib/office3d/useWorkspaceOrg';
import type { AvatarStyle, HologramScreenKind } from '@/lib/office3d/types';
import type { WorkspaceUiTheme } from '@/types/workspace';
import { OfficeKanbanBoard } from './OfficeKanbanBoard';

/* ============================================================================
 * 1. HỘP THƯ (Inbox — Phê duyệt, Lệnh @mention, Biên bản họp, A2A)
 * ========================================================================== */
interface OfficeInboxViewProps {
  org: WorkspaceOrgState;
  uiTheme: WorkspaceUiTheme;
  onFocusBotIn3D: (botId: string) => void;
}

export const OfficeInboxView: React.FC<OfficeInboxViewProps> = ({
  org,
  uiTheme,
  onFocusBotIn3D,
}) => {
  const isLight = uiTheme === 'light';
  const [filter, setFilter] = useState<'all' | 'approval' | 'command' | 'meeting'>('all');
  const pendingApprovals = org.approvals.filter((a) => a.status === 'pending');

  const filteredEntries = org.inboxEntries.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'command') return e.kind === 'command' || e.kind === 'reply';
    return e.kind === filter;
  });

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-y-auto p-5 md:p-7 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#030b17] text-slate-100'
      }`}
    >
      <div className="max-w-5xl w-full mx-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Inbox size={20} className="text-cyan-500" />
              Hộp thư Điều hành
              {org.unreadInboxCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                  {org.unreadInboxCount} mới
                </span>
              )}
            </h2>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Tổng hợp toàn bộ yêu cầu phê duyệt tài chính, phản hồi lệnh @mention và biên bản họp bàn tròn.
            </p>
          </div>
          <button
            type="button"
            onClick={org.markAllInboxRead}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
          >
            Đánh dấu đã đọc tất cả
          </button>
        </div>

        {/* Pending Approvals Action Banner */}
        {pendingApprovals.length > 0 && (
          <div
            className={`rounded-2xl border p-4 space-y-3 ${
              isLight
                ? 'bg-amber-50 border-amber-200'
                : 'bg-amber-950/25 border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-300">
              <ShieldAlert size={15} />
              Cần chủ nhân phê duyệt ngay ({pendingApprovals.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between gap-2.5 ${
                    isLight
                      ? 'bg-white border-amber-200 shadow-sm'
                      : 'bg-slate-900/90 border-amber-500/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">{item.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 font-bold">
                        {item.riskLevel === 'high' ? 'Rủi ro cao' : 'Cần duyệt'}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {item.detail}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Đề xuất bởi {item.requestedByName} · {item.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => org.decideApproval(item.id, 'approved')}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={13} /> Phê duyệt cho chạy
                    </button>
                    <button
                      type="button"
                      onClick={() => org.decideApproval(item.id, 'rejected')}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/25 text-xs font-semibold flex items-center gap-1"
                    >
                      <XCircle size={13} /> Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ['all', 'Tất cả'],
              ['command', 'Lệnh & Phản hồi @'],
              ['approval', 'Phê duyệt'],
              ['meeting', 'Biên bản họp'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                filter === id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-500'
                  : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-2.5">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={`rounded-2xl border p-4 transition ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-cyan-400/60 shadow-sm'
                  : 'bg-slate-900/75 border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold">{entry.title}</span>
                    {entry.senderBadge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          isLight
                            ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                            : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {entry.senderName} · {entry.senderBadge}
                      </span>
                    )}
                    {entry.unread && (
                      <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1.5 leading-relaxed whitespace-pre-line ${
                      isLight ? 'text-slate-600' : 'text-slate-300'
                    }`}
                  >
                    {entry.body}
                  </p>
                  {entry.targetLabels && entry.targetLabels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {entry.targetLabels.map((lbl) => (
                        <span
                          key={lbl}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                            isLight
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {lbl}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[11px] font-mono text-slate-400">{entry.timestamp}</span>
                  {entry.botId && (
                    <button
                      type="button"
                      onClick={() => onFocusBotIn3D(entry.botId!)}
                      className="text-[11px] text-cyan-600 dark:text-cyan-300 font-semibold hover:underline"
                    >
                      Xem tại 3D →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. BẢNG KPI, KANBAN QA & SỨC KHỎE HỆ THỐNG MODAL
 * ========================================================================== */
interface OfficeKpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  org: WorkspaceOrgState;
  byokConfigured: boolean;
  initialSection?: 'kpi' | 'kanban' | 'doctor';
}

export const OfficeKpiModal: React.FC<OfficeKpiModalProps> = ({
  isOpen,
  onClose,
  org,
  byokConfigured,
  initialSection = 'kpi',
}) => {
  const [section, setSection] = useState<'kpi' | 'kanban' | 'doctor'>(initialSection);

  React.useEffect(() => {
    if (isOpen) setSection(initialSection);
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  const workingCount = org.officeBots.filter(
    (b) => b.isActive && !b.isLocked && b.duty !== 'idle'
  ).length;
  const idleCount = org.officeBots.filter((b) => !b.isLocked && b.duty === 'idle').length;
  const verifiedTasks = org.tasks.filter((t) => t.verification.status === 'verified').length;
  const doneRate =
    org.tasks.length > 0 ? Math.round((verifiedTasks / org.tasks.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-5">
      <div className="w-full max-w-6xl h-[88vh] rounded-2xl bg-[#041122] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 bg-[#020a16]">
          <div className="flex items-center gap-2.5">
            <BarChart3 size={18} className="text-cyan-400" />
            <h3 className="text-sm font-black text-white">
              Bảng KPI, Kanban QA & Bác Sĩ Hệ Thống
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              {workingCount} đang chạy · {idleCount} nghỉ (0 tok)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setSection('kpi')}
                className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ${
                  section === 'kpi' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                <BarChart3 size={13} /> Tổng quan KPI
              </button>
              <button
                type="button"
                onClick={() => setSection('kanban')}
                className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ${
                  section === 'kanban' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                <Kanban size={13} /> Kanban & Duyệt ({org.tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setSection('doctor')}
                className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ${
                  section === 'doctor' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                <Activity size={13} /> Bác sĩ & Tự sửa
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        {section === 'kanban' ? (
          <OfficeKanbanBoard
            tasks={org.tasks}
            approvals={org.approvals}
            bots={org.officeBots}
            departments={org.departments}
            onCreateTask={org.createKanbanTask}
            onMoveTask={org.moveKanbanTask}
            onAddEvidence={org.addTaskEvidence}
            onVerifyTask={org.verifyKanbanTask}
            onDecideApproval={org.decideApproval}
            onPeekBot={() => onClose()}
          />
        ) : section === 'doctor' ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Trạng thái BYOK AI</div>
                <div className="text-sm font-bold text-cyan-300 mt-1">
                  {byokConfigured ? 'Đã kết nối khóa AI' : 'Chế độ mô phỏng / Demo'}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">Chế độ Tiết kiệm Token</div>
                <div className="text-sm font-bold text-emerald-300 mt-1">
                  {idleCount} bot nghỉ = 0 token tiêu thụ
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Tự động sửa lỗi tổ chức</div>
                  <div className="text-xs text-slate-300 mt-0.5">An toàn · Lũy đẳng</div>
                </div>
                <button
                  type="button"
                  onClick={org.runSelfRepair}
                  className="px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5"
                >
                  <Wrench size={13} /> Tự sửa lỗi
                </button>
              </div>
            </div>

            {org.lastRepair && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 space-y-1">
                <div className="font-bold">
                  Báo cáo Tự sửa lỗi: đã khắc phục {org.lastRepair.repairedCount} mục
                </div>
                {org.lastRepair.actions.map((a, idx) => (
                  <div key={idx}>• {a}</div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {org.doctorChecks.map((chk) => (
                <div
                  key={chk.id}
                  className="p-3.5 rounded-xl bg-slate-900/75 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{chk.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{chk.detail}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      chk.status === 'pass'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : chk.status === 'warn'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {chk.status === 'pass' ? 'Đạt' : chk.status === 'warn' ? 'Cảnh báo' : 'Lỗi'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
                <div className="text-[11px] text-slate-400">Quy mô Tổ chức</div>
                <div className="text-2xl font-black text-white mt-1">
                  {org.departments.length} <span className="text-xs font-semibold text-cyan-300">phòng ban</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {org.officeBots.length} nhân viên AI (Mở rộng ∞)
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
                <div className="text-[11px] text-slate-400">Hiệu suất QA Độc lập</div>
                <div className="text-2xl font-black text-emerald-300 mt-1">{doneRate}%</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {verifiedTasks}/{org.tasks.length} thẻ đã kiểm chứng
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30">
                <div className="text-[11px] text-slate-400">Hàng đợi Phê duyệt</div>
                <div className="text-2xl font-black text-amber-300 mt-1">
                  {org.pendingApprovalsCount}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Tác vụ nhạy cảm đang dừng chờ chủ nhân
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30">
                <div className="text-[11px] text-slate-400">Tiết kiệm Token (0-tok Idle)</div>
                <div className="text-2xl font-black text-indigo-300 mt-1">
                  {idleCount}/{org.officeBots.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Bot nghỉ hoàn toàn không đốt token AI
                </div>
              </div>
            </div>

            {/* Department KPI Matrix */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 mb-3">
                Hiệu suất theo từng Phòng ban
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {org.departments.map((dept) => {
                  const deptBots = org.officeBots.filter((b) => b.departmentId === dept.id);
                  const deptWorking = deptBots.filter((b) => b.duty !== 'idle' && !b.isLocked).length;
                  const deptTasks = org.tasks.filter((t) => t.departmentId === dept.id);
                  return (
                    <div
                      key={dept.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: dept.colorHex }}
                          />
                          <span className="text-xs font-bold text-white">{dept.name}</span>
                        </div>
                        <span className="text-[11px] text-cyan-300 font-semibold">
                          {deptWorking}/{deptBots.length} đang chạy
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{dept.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {deptBots.map((b) => (
                          <span
                            key={b.id}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: DUTY_META[b.duty].colorHex }}
                            />
                            {b.name} · {DUTY_META[b.duty].shortLabel}
                          </span>
                        ))}
                        {deptBots.length === 0 && (
                          <span className="text-[10px] text-slate-500 italic">
                            Chưa có bot — bấm Tuyển Bot để bổ sung
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 pt-1">
                        Đầu việc Kanban: {deptTasks.length} thẻ
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. ỨNG DỤNG ĐÃ XUẤT BẢN & GÓI PHÒNG BAN 1-CHẠM (Tên Việt ngắn 1 từ)
 * ========================================================================== */
interface DepartmentPack {
  id: string;
  deptName: string;
  deptDesc: string;
  colorHex: string;
  badge: string;
  bots: Array<{
    name: string;
    roleBadge: string;
    roleTitle: string;
    screenKind: HologramScreenKind;
    avatarStyle: AvatarStyle;
    model: string;
  }>;
}

export const DEPLOYABLE_PACKS: DepartmentPack[] = [
  {
    id: 'pack-livestream',
    deptName: 'Phòng Livestream & Video Ngắn',
    deptDesc: 'Lên kịch bản bán hàng TikTok/Reels/Shorts, giữ chân người xem và tối ưu chuyển đổi LIVE.',
    colorHex: '#f472b6',
    badge: '3 Bot · TMĐT',
    bots: [
      {
        name: 'Vy',
        roleBadge: 'AI Scriptwriter',
        roleTitle: 'Viết kịch bản Mega LIVE & Video 60s',
        screenKind: 'marketer',
        avatarStyle: 'female',
        model: 'Claude 3.7 Sonnet',
      },
      {
        name: 'Tuấn',
        roleBadge: 'AI Live Ops',
        roleTitle: 'Điều phối ghim giỏ hàng & Flash Sale LIVE',
        screenKind: 'commerce',
        avatarStyle: 'male',
        model: 'GPT-4o',
      },
      {
        name: 'Ngọc',
        roleBadge: 'AI Customer Support',
        roleTitle: 'Trả lời bình luận & chốt đơn tự động',
        screenKind: 'support',
        avatarStyle: 'female',
        model: 'DeepSeek-V3',
      },
    ],
  },
  {
    id: 'pack-finance',
    deptName: 'Phòng Tài Chính & Pháp Chế',
    deptDesc: 'Đối soát dòng tiền, kiểm tra biên lợi nhuận ròng SKU, rà soát hợp đồng & chính sách sàn.',
    colorHex: '#fbbf24',
    badge: '2 Bot · Quản trị',
    bots: [
      {
        name: 'Quân',
        roleBadge: 'AI Finance',
        roleTitle: 'Kiểm soát biên lợi nhuận & dòng tiền',
        screenKind: 'manager',
        avatarStyle: 'male',
        model: 'Claude 3.7 Sonnet',
      },
      {
        name: 'Mai',
        roleBadge: 'AI Legal',
        roleTitle: 'Chống vi phạm từ khóa sàn & rà hợp đồng',
        screenKind: 'researcher',
        avatarStyle: 'female',
        model: 'GPT-4o',
      },
    ],
  },
  {
    id: 'pack-edu',
    deptName: 'Phòng Giáo Dục & Trợ Lý GVCN',
    deptDesc: 'Soạn nhận xét học bạ chuẩn Thông tư 27, quản lý nề nếp, thông báo phụ huynh & tạo bài giảng.',
    colorHex: '#34d399',
    badge: '2 Bot · Giáo dục',
    bots: [
      {
        name: 'Hương',
        roleBadge: 'AI Educator',
        roleTitle: 'Quản lý lớp học, điểm danh & nhận xét TT27',
        screenKind: 'support',
        avatarStyle: 'female',
        model: 'Gemini 2.5 Pro',
      },
      {
        name: 'Phong',
        roleBadge: 'AI Researcher',
        roleTitle: 'Biên soạn đề kiểm tra & giáo án chuẩn mới',
        screenKind: 'researcher',
        avatarStyle: 'male',
        model: 'Claude 3.7 Sonnet',
      },
    ],
  },
];

interface OfficePublishedAppsViewProps {
  org: WorkspaceOrgState;
  uiTheme: WorkspaceUiTheme;
  onAfterDeploy: () => void;
}

export const OfficePublishedAppsView: React.FC<OfficePublishedAppsViewProps> = ({
  org,
  uiTheme,
  onAfterDeploy,
}) => {
  const isLight = uiTheme === 'light';
  const [deployedIds, setDeployedIds] = useState<string[]>([]);

  const handleDeploy = (pack: DepartmentPack) => {
    org.deployDepartmentPack(pack);
    setDeployedIds((prev) => [...prev, pack.id]);
    onAfterDeploy();
  };

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-y-auto p-5 md:p-7 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#030b17] text-slate-100'
      }`}
    >
      <div className="max-w-5xl w-full mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Rocket size={20} className="text-cyan-500" />
            Ứng dụng đã xuất bản & Gói Phòng ban 1-Chạm
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Mở rộng tổ chức tức thì bằng các gói phòng ban dựng sẵn hoặc mở trực tiếp các ứng dụng AI thương mại đang chạy live.
          </p>
        </div>

        {/* Live Published Mini-Apps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <AppWindow size={16} className="text-emerald-500" />
                <span className="text-sm font-extrabold">Trợ lý GVCN (Live Production)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold">
                  Online
                </span>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Ứng dụng hỗ trợ giáo viên chủ nhiệm quản lý lớp, nhận xét Thông tư 27 & Zalo phụ huynh.
              </p>
            </div>
            <a
              href="https://lop-nhe.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
            >
              Mở app <ExternalLink size={12} />
            </a>
          </div>

          <div
            className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-500" />
                <span className="text-sm font-extrabold">Kho 4 Đội Bot Thương Mại</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 font-bold">
                  Public
                </span>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Trang giới thiệu 4 đội nhân sự AI theo ngành sẵn sàng chia sẻ cho khách hàng & đối tác.
              </p>
            </div>
            <a
              href="/kho-doi-bot"
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
            >
              Xem kho <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* 1-Click Expand Department Packs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">
            <Layers size={14} /> Triển khai thêm Phòng ban & Bot vào Văn phòng 3D (Không giới hạn)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEPLOYABLE_PACKS.map((pack) => {
              const deployed = deployedIds.includes(pack.id);
              return (
                <div
                  key={pack.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pack.colorHex }}
                      />
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isLight
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {pack.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold mt-2">{pack.deptName}</h3>
                    <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {pack.deptDesc}
                    </p>
                    <div className="mt-3 space-y-1">
                      {pack.bots.map((b) => (
                        <div
                          key={b.name}
                          className={`text-[11px] px-2.5 py-1 rounded-lg flex items-center justify-between ${
                            isLight ? 'bg-slate-50 text-slate-700' : 'bg-slate-950/70 text-slate-300'
                          }`}
                        >
                          <span className="font-semibold">{b.name}</span>
                          <span className="text-[10px] text-cyan-500">{b.roleBadge}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeploy(pack)}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      deployed
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    }`}
                  >
                    <Plus size={14} />
                    {deployed ? 'Đã thêm (Bấm để thêm tiếp)' : 'Thêm phòng ban vào Văn phòng 3D'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. TỆP CỦA NHÓM (Biên bản họp, Bằng chứng QA & Sao lưu JSON tổ chức)
 * ========================================================================== */
interface OfficeTeamFilesViewProps {
  org: WorkspaceOrgState;
  uiTheme: WorkspaceUiTheme;
}

export const OfficeTeamFilesView: React.FC<OfficeTeamFilesViewProps> = ({ org, uiTheme }) => {
  const isLight = uiTheme === 'light';

  const handleExportOrgJson = () => {
    const data = {
      brand: 'Tổ Chức Nhân Viên AI',
      exportedAt: new Date().toISOString(),
      departments: org.departments,
      bots: org.officeBots,
      handoffs: org.handoffs,
      tasks: org.tasks,
      minutes: org.minutesList,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `to-chuc-nhan-vien-ai-org-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allEvidence = org.tasks.flatMap((t) =>
    t.evidence.map((e) => ({
      ...e,
      taskTitle: t.title,
      verified: t.verification.status === 'verified',
    }))
  );

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-y-auto p-5 md:p-7 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#030b17] text-slate-100'
      }`}
    >
      <div className="max-w-5xl w-full mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <FolderOpen size={20} className="text-cyan-500" />
              Tệp của nhóm & Kho Biên bản
            </h2>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Lưu trữ tập trung biên bản họp bàn tròn, bằng chứng kiểm chứng QA và bản sao lưu cấu hình tổ chức.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportOrgJson}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5"
          >
            <Download size={14} /> Xuất cấu hình Tổ chức (.json)
          </button>
        </div>

        {/* Meeting Minutes Files */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">
            Biên bản Họp Bàn Tròn ({org.minutesList.length})
          </h3>
          {org.minutesList.length === 0 ? (
            <div
              className={`rounded-2xl border p-6 text-center text-xs ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-500'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400'
              }`}
            >
              Chưa có biên bản họp nào. Vào <strong>Văn phòng 3D → Họp bàn tròn</strong> để tự động tạo biên bản lưu tại đây.
            </div>
          ) : (
            org.minutesList.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl border p-4 space-y-2 ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <FileText size={15} className="text-cyan-500" />
                    {m.topic}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{m.createdAt}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Thành phần: {m.participantNames.join(', ')} · {m.decisions.length} quyết định ·{' '}
                  {m.actionItems.length} đầu việc
                </div>
              </div>
            ))
          )}
        </div>

        {/* Evidence Files */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
            Bằng chứng QA Độc lập ({allEvidence.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allEvidence.map((ev) => (
              <div
                key={ev.id}
                className={`rounded-xl border p-3.5 ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold truncate">{ev.taskTitle}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      ev.verified
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-amber-500/15 text-amber-500'
                    }`}
                  >
                    {ev.verified ? 'Đã kiểm chứng' : 'Chờ QA'}
                  </span>
                </div>
                <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {ev.summary}
                </p>
                <div className="text-[10px] text-slate-400 mt-1">Ghi nhận lúc {ev.createdAt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
