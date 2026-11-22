'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { DUTY_META } from '@/lib/office3d/officeStore';
import type {
  ApprovalItem,
  KanbanStatus,
  KanbanTask,
  Office3DBot,
  OfficeDepartment,
} from '@/lib/office3d/types';

interface OfficeKanbanBoardProps {
  departments: OfficeDepartment[];
  bots: Office3DBot[];
  tasks: KanbanTask[];
  approvals: ApprovalItem[];
  onCreateTask: (task: {
    title: string;
    description: string;
    departmentId: string;
    assigneeBotId: string;
    priority: 'P0' | 'P1' | 'P2';
  }) => void;
  onMoveTask: (taskId: string, nextStatus: KanbanStatus) => void;
  onAddEvidence: (taskId: string, summary: string) => void;
  onVerifyTask: (taskId: string, verdict: 'verified' | 'changes_requested', note: string) => void;
  onDecideApproval: (approvalId: string, status: 'approved' | 'rejected', note: string) => void;
  onPeekBot: (botId: string) => void;
}

const COLUMNS: Array<{ id: KanbanStatus; title: string; accent: string; dot: string }> = [
  { id: 'backlog', title: 'Chờ xử lý', accent: 'border-slate-700', dot: 'bg-slate-400' },
  { id: 'in_progress', title: 'Đang thực hiện', accent: 'border-cyan-500/40', dot: 'bg-cyan-400' },
  { id: 'review', title: 'Chờ QA / Nghiệm thu', accent: 'border-amber-500/40', dot: 'bg-amber-400' },
  { id: 'done', title: 'Hoàn tất (Đã kiểm chứng)', accent: 'border-emerald-500/40', dot: 'bg-emerald-400' },
];

export const OfficeKanbanBoard: React.FC<OfficeKanbanBoardProps> = ({
  departments,
  bots,
  tasks,
  approvals,
  onCreateTask,
  onMoveTask,
  onAddEvidence,
  onVerifyTask,
  onDecideApproval,
  onPeekBot,
}) => {
  const [filterDeptId, setFilterDeptId] = useState<string>('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deptId, setDeptId] = useState(departments[0]?.id || 'dept-exec');
  const [assigneeId, setAssigneeId] = useState(bots[0]?.id || '');
  const [priority, setPriority] = useState<'P0' | 'P1' | 'P2'>('P1');
  const [evidenceInput, setEvidenceInput] = useState<Record<string, string>>({});

  const deptById = new Map(departments.map((d) => [d.id, d]));
  const botById = new Map(bots.map((b) => [b.id, b]));
  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  const visibleTasks =
    filterDeptId === 'all' ? tasks : tasks.filter((t) => t.departmentId === filterDeptId);

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateTask({
      title: title.trim(),
      description: desc.trim() || 'Thực thi theo chuẩn bằng chứng và nghiệm thu độc lập.',
      departmentId: deptId || departments[0]?.id || 'dept-exec',
      assigneeBotId: assigneeId || bots[0]?.id || '',
      priority,
    });
    setTitle('');
    setDesc('');
    setShowNewForm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#020914] p-4 space-y-4">
      {/* APPROVAL QUEUE (COMMAND CONTROL — BOT STOPS UNTIL HUMAN DECIDES) */}
      <div className="rounded-2xl border border-amber-500/35 bg-slate-900/80 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Hàng Đợi Phê Duyệt Chủ Nhân ({pendingApprovals.length} chờ duyệt)
            </h3>
            <span className="text-[11px] text-amber-200/80">
              — Hành động nhạy cảm tài chính/xuất bản tự dừng chờ bạn xác nhận
            </span>
          </div>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="text-xs text-emerald-300 flex items-center gap-1.5 py-1">
            <ShieldCheck size={14} /> Không có yêu cầu nào đang bị chặn chờ phê duyệt.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            {pendingApprovals.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-amber-500/30 bg-slate-950/90 p-3 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-200">{item.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.riskLevel === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {item.riskLevel === 'high' ? 'Rủi ro cao' : 'Cần xác nhận'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{item.detail}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Đề xuất bởi <strong className="text-cyan-300">{item.requestedByName}</strong> ·{' '}
                    {item.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      onDecideApproval(item.id, 'approved', 'Chủ nhân đã phê duyệt trực tiếp.')
                    }
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <CheckCircle2 size={13} /> Phê duyệt cho chạy
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onDecideApproval(item.id, 'rejected', 'Chủ nhân từ chối — ghi nhật ký kiểm toán.')
                    }
                    className="py-1.5 px-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 border border-rose-400/40 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <XCircle size={13} /> Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FILTER BAR & NEW TASK */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterDeptId('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              filterDeptId === 'all'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-500/40'
            }`}
          >
            Tất cả phòng ban ({tasks.length})
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setFilterDeptId(d.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                filterDeptId === d.id
                  ? 'bg-cyan-500/25 text-cyan-100 border border-cyan-400'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.colorHex }} />
              {d.shortLabel}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowNewForm((v) => !v)}
          className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus size={14} /> Giao việc Kanban mới
        </button>
      </div>

      {showNewForm && (
        <form
          onSubmit={handleSubmitTask}
          className="rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-3.5 grid grid-cols-1 md:grid-cols-12 gap-2.5"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề nhiệm vụ (VD: Kiểm toán SEO trang bảng giá & gắn Schema)"
            className="md:col-span-4 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-400 outline-none"
            required
          />
          <select
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
            className="md:col-span-3 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="md:col-span-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
          >
            {bots.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.roleBadge})
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'P0' | 'P1' | 'P2')}
            className="md:col-span-1 px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
          >
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
          </select>
          <button
            type="submit"
            className="md:col-span-2 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
          >
            Tạo thẻ việc
          </button>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Mô tả tiêu chí nghiệm thu & bằng chứng bắt buộc..."
            className="md:col-span-12 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-400 outline-none"
          />
        </form>
      )}

      {/* 4 KANBAN COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {COLUMNS.map((col) => {
          const colTasks = visibleTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.accent} bg-slate-900/75 p-3 flex flex-col gap-2.5 min-h-[340px]`}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                    {col.title}
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-slate-400">{colTasks.length}</span>
              </div>

              {colTasks.length === 0 ? (
                <div className="text-[11px] text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-xl">
                  Chưa có nhiệm vụ
                </div>
              ) : (
                colTasks.map((task) => {
                  const dept = deptById.get(task.departmentId);
                  const bot = botById.get(task.assigneeBotId);
                  const dutyInfo = bot ? DUTY_META[bot.duty] : null;

                  return (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 space-y-2 hover:border-cyan-500/40 transition"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-bold text-slate-100 leading-snug">
                          {task.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            task.priority === 'P0'
                              ? 'bg-rose-500/20 text-rose-300'
                              : task.priority === 'P1'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        {dept && (
                          <span
                            className="px-2 py-0.5 rounded-full border bg-slate-900 text-slate-200"
                            style={{ borderColor: `${dept.colorHex}66` }}
                          >
                            {dept.shortLabel}
                          </span>
                        )}
                        {bot && (
                          <button
                            type="button"
                            onClick={() => onPeekBot(bot.id)}
                            className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 hover:bg-cyan-500/25 transition"
                            title="Bấm để soi màn hình trực tiếp của bot này"
                          >
                            {bot.name} · {dutyInfo?.shortLabel}
                          </button>
                        )}
                      </div>

                      {/* EVIDENCE BLOCK (BẰNG CHỨNG THỰC TẾ) */}
                      <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-cyan-300">
                          <span className="flex items-center gap-1">
                            <FileCheck2 size={11} /> Bằng chứng ({task.evidence.length})
                          </span>
                          {task.verification.status === 'verified' ? (
                            <span className="text-emerald-300 flex items-center gap-1">
                              <ClipboardCheck size={11} /> Đã nghiệm thu
                            </span>
                          ) : task.verification.status === 'changes_requested' ? (
                            <span className="text-rose-300 flex items-center gap-1">
                              <AlertTriangle size={11} /> Cần sửa lại
                            </span>
                          ) : (
                            <span className="text-slate-400">Chưa nghiệm thu</span>
                          )}
                        </div>

                        {task.evidence.map((ev) => (
                          <p key={ev.id} className="text-[10px] text-slate-300 leading-snug">
                            • [{ev.createdAt}] {ev.summary}
                          </p>
                        ))}

                        {task.verification.note && (
                          <p className="text-[10px] text-emerald-300/90 border-t border-slate-800 pt-1">
                            QA ({task.verification.reviewerName}): {task.verification.note}
                          </p>
                        )}

                        {task.status !== 'done' && (
                          <div className="flex gap-1 pt-1">
                            <input
                              type="text"
                              value={evidenceInput[task.id] || ''}
                              onChange={(e) =>
                                setEvidenceInput((prev) => ({ ...prev, [task.id]: e.target.value }))
                              }
                              placeholder="Gắn log/bằng chứng..."
                              className="flex-1 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-[10px] text-white outline-none focus:border-cyan-400"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const val = (evidenceInput[task.id] || '').trim();
                                if (!val) return;
                                onAddEvidence(task.id, val);
                                setEvidenceInput((prev) => ({ ...prev, [task.id]: '' }));
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-500/30 text-[10px] text-cyan-200 font-semibold"
                            >
                              +Gắn
                            </button>
                          </div>
                        )}
                      </div>

                      {/* STATUS TRANSITION & INDEPENDENT VERIFICATION */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {task.status === 'backlog' && (
                          <button
                            type="button"
                            onClick={() => onMoveTask(task.id, 'in_progress')}
                            className="flex-1 py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-[11px] font-semibold"
                          >
                            Bắt đầu làm →
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <button
                            type="button"
                            onClick={() => onMoveTask(task.id, 'review')}
                            className="flex-1 py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-semibold"
                          >
                            Gửi QA nghiệm thu →
                          </button>
                        )}
                        {task.status === 'review' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                onVerifyTask(
                                  task.id,
                                  'verified',
                                  'Đã kiểm tra đối chiếu bằng chứng đạt 100%.'
                                )
                              }
                              className="flex-1 py-1 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[11px] font-bold flex items-center justify-center gap-1"
                            >
                              <Sparkles size={11} /> Duyệt nghiệm thu
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onVerifyTask(
                                  task.id,
                                  'changes_requested',
                                  'Bằng chứng chưa đủ chi tiết, trả về bổ sung.'
                                )
                              }
                              className="py-1 px-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 text-[11px]"
                            >
                              Trả về
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
