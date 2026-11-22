'use client';

import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  Wrench,
  X,
  AlertTriangle,
} from 'lucide-react';
import { DUTY_META } from '@/lib/office3d/officeStore';
import type {
  A2ATranscriptEntry,
  AvatarStyle,
  DoctorCheck,
  HologramScreenKind,
  MeetingMinutes,
  Office3DBot,
  OfficeDepartment,
  SelfRepairReport,
} from '@/lib/office3d/types';

/* ─── 1. LIVE SCREEN PEEK & COURSE CORRECTION MODAL ───────────────────────── */
interface LivePeekModalProps {
  bot: Office3DBot;
  logs: string[];
  onClose: () => void;
  onSendIntervention: (botId: string, instruction: string) => void;
  onSetIdle: (botId: string) => void;
  onOpenDirectChat: (botId: string) => void;
}

export const LivePeekModal: React.FC<LivePeekModalProps> = ({
  bot,
  logs,
  onClose,
  onSendIntervention,
  onSetIdle,
  onOpenDirectChat,
}) => {
  const [command, setCommand] = useState('');
  const dutyMeta = DUTY_META[bot.duty];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    onSendIntervention(bot.id, command.trim());
    setCommand('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-500/45 bg-[#041222] shadow-2xl shadow-cyan-500/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <Terminal size={17} className="text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Soi Màn Hình Trực Tiếp · {bot.name} ({bot.roleBadge})
              </h3>
              <p className="text-[11px] text-slate-400">
                Phòng ban: {bot.departmentName} · Trạng thái:{' '}
                <span className="text-cyan-300 font-semibold">{dutyMeta.label}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="rounded-xl bg-[#020811] border border-cyan-500/25 p-3 font-mono text-xs space-y-1.5 max-h-64 overflow-y-auto">
            <div className="text-cyan-400 font-bold">
              [LIVE HUD] {bot.name}@{bot.codeName} · {dutyMeta.tokenHint}
            </div>
            {bot.currentTaskTitle && (
              <div className="text-emerald-300">
                ▸ Nhiệm vụ hiện tại: {bot.currentTaskTitle}
              </div>
            )}
            {logs.map((line, i) => (
              <div key={i} className="text-slate-300 leading-relaxed">
                {line}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Gửi lệnh chỉnh hướng trực tiếp (VD: Ưu tiên kiểm tra CTR trước khi hạ giá)..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-cyan-400 outline-none"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
            >
              <Send size={13} /> Chỉnh hướng
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onSetIdle(bot.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Tạm dừng · Cho nghỉ (0 token)
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDirectChat(bot.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <MessageSquare size={13} /> Mở phòng chat 1-1 có trí nhớ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── 2. ROUND-TABLE MEETING MINUTES & A2A TRANSCRIPT MODAL ───────────────── */
interface MeetingMinutesModalProps {
  departments: OfficeDepartment[];
  bots: Office3DBot[];
  minutesList: MeetingMinutes[];
  a2aTranscripts: A2ATranscriptEntry[];
  onStartMeeting: (topic: string, participantIds: string[]) => void;
  onPushActionToKanban: (meetingId: string, actionId: string) => void;
  onClose: () => void;
}

export const MeetingMinutesModal: React.FC<MeetingMinutesModalProps> = ({
  departments,
  bots,
  minutesList,
  a2aTranscripts,
  onStartMeeting,
  onPushActionToKanban,
  onClose,
}) => {
  const [tab, setTab] = useState<'meeting' | 'a2a'>('meeting');
  const [topic, setTopic] = useState('Tối ưu chiến dịch tăng trưởng & mở rộng phòng ban AI tuần mới');
  const unlockedBots = bots.filter((b) => !b.isLocked);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    unlockedBots.slice(0, Math.min(5, unlockedBots.length)).map((b) => b.id)
  );

  const toggleParticipant = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    onStartMeeting(topic, selectedIds);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl border border-cyan-500/45 bg-[#041222] shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <ClipboardList size={17} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Họp Bàn Tròn Tự Sinh Biên Bản & Nhật Ký A2A
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setTab('meeting')}
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  tab === 'meeting' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                Biên bản họp ({minutesList.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('a2a')}
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  tab === 'a2a' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                Nhật ký A2A ({a2aTranscripts.length})
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'meeting' ? (
            <>
              <form
                onSubmit={handleLaunch}
                className="rounded-xl border border-cyan-500/30 bg-slate-900/80 p-3.5 space-y-3"
              >
                <div>
                  <label className="text-[11px] font-bold text-cyan-300 block mb-1">
                    Chủ đề phiên họp bàn tròn 3D
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                    Chọn nhân viên AI tham gia ({selectedIds.length} đã chọn · {departments.length} phòng ban)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {unlockedBots.map((b) => {
                      const active = selectedIds.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => toggleParticipant(b.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                            active
                              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-100'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {b.name} ({b.roleBadge})
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={selectedIds.length === 0}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Play size={13} /> Bắt đầu họp 3D & Tự động xuất biên bản
                </button>
              </form>

              {minutesList.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-800 rounded-xl">
                  Chưa có biên bản họp nào. Bấm nút phía trên để triệu tập phiên họp bàn tròn đầu tiên.
                </div>
              ) : (
                minutesList.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{m.topic}</h4>
                        <p className="text-[11px] text-slate-400">
                          Thành phần: {m.participantNames.join(', ')} · Lúc {m.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-emerald-300">1. Quyết định chốt</div>
                        {m.decisions.map((d, i) => (
                          <p key={i} className="text-slate-300 text-[11px]">
                            • {d}
                          </p>
                        ))}
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-amber-300">2. Rủi ro đã nhận diện</div>
                        {m.risks.map((r, i) => (
                          <p key={i} className="text-slate-300 text-[11px]">
                            • {r}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-slate-800">
                      <div className="font-bold text-cyan-300 text-xs">
                        3. Đầu việc hành động (1-chạm đẩy thẳng vào Kanban)
                      </div>
                      {m.actionItems.map((act) => (
                        <div
                          key={act.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-900/90 px-2.5 py-1.5 border border-slate-800"
                        >
                          <div className="text-[11px] text-slate-200">
                            <strong className="text-cyan-300">{act.ownerName}:</strong> {act.title}
                          </div>
                          {act.pushedToKanban ? (
                            <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Đã đẩy Kanban
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onPushActionToKanban(m.id, act.id)}
                              className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-400/40 text-[10px] font-bold"
                            >
                              + Đẩy vào Kanban
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <div className="space-y-2">
              {a2aTranscripts.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-cyan-300">
                      {entry.fromBotName} → {entry.toBotName}{' '}
                      <span className="text-slate-400 font-normal">({entry.departmentFlow})</span>
                    </span>
                    <span className="text-slate-500">{entry.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200">{entry.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── 3. SYSTEM DOCTOR, SELF-REPAIR & TOKEN OBSERVABILITY MODAL ──────────── */
interface SystemDoctorModalProps {
  checks: DoctorCheck[];
  lastRepair: SelfRepairReport | null;
  idleBotsCount: number;
  totalBotsCount: number;
  isCheckingHealth: boolean;
  onRefreshChecks: () => void;
  onRunSelfRepair: () => void;
  onClose: () => void;
}

export const SystemDoctorModal: React.FC<SystemDoctorModalProps> = ({
  checks,
  lastRepair,
  idleBotsCount,
  totalBotsCount,
  isCheckingHealth,
  onRefreshChecks,
  onRunSelfRepair,
  onClose,
}) => {
  const hasFixable = checks.some((c) => c.fixable);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-500/45 bg-[#041222] shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Activity size={17} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Kiểm Tra Sức Khỏe Hệ Thống (Doctor) & Tự Sửa Lỗi
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
          {/* TOKEN OBSERVABILITY SUMMARY */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5">
              <div className="text-[10px] text-emerald-300 font-semibold">Chống tốn token nền</div>
              <div className="text-base font-black text-white mt-0.5">0 token / bot rảnh</div>
              <div className="text-[10px] text-slate-400">
                {idleBotsCount}/{totalBotsCount} bot đang nghỉ ngơi
              </div>
            </div>
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-2.5">
              <div className="text-[10px] text-cyan-300 font-semibold">Tiết kiệm bộ nhớ đệm</div>
              <div className="text-base font-black text-white mt-0.5">-74,5% token</div>
              <div className="text-[10px] text-slate-400">Chế độ tối ưu ngữ cảnh bật</div>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-2.5">
              <div className="text-[10px] text-indigo-300 font-semibold">Kiểm chứng Doctor</div>
              <div className="text-base font-black text-white mt-0.5">
                {checks.filter((c) => c.status === 'pass').length}/{checks.length} Đạt
              </div>
              <div className="text-[10px] text-slate-400">Báo cáo thực, không tô xanh giả</div>
            </div>
          </div>

          <div className="space-y-2">
            {checks.map((chk) => (
              <div
                key={chk.id}
                className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  {chk.status === 'pass' ? (
                    <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : chk.status === 'warn' ? (
                    <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-white">{chk.label}</div>
                    <p className="text-[11px] text-slate-300 mt-0.5">{chk.detail}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    chk.status === 'pass'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : chk.status === 'warn'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {chk.status === 'pass' ? 'Đạt' : chk.status === 'warn' ? 'Lưu ý' : 'Lỗi'}
                </span>
              </div>
            ))}
          </div>

          {lastRepair && (
            <div className="rounded-xl border border-cyan-500/35 bg-cyan-950/30 p-3 text-xs space-y-1">
              <div className="font-bold text-cyan-200 flex items-center gap-1.5">
                <Sparkles size={13} /> Kết quả Tự Sửa Lỗi (Self-Repair): đã xử lý {lastRepair.repairedCount} mục
              </div>
              {lastRepair.actions.length === 0 ? (
                <p className="text-[11px] text-slate-300">Hệ thống đã sạch lỗi, không cần sửa thêm.</p>
              ) : (
                lastRepair.actions.map((a, i) => (
                  <p key={i} className="text-[11px] text-slate-200">
                    • {a}
                  </p>
                ))
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onRefreshChecks}
              disabled={isCheckingHealth}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={isCheckingHealth ? 'animate-spin' : ''} /> Làm mới kiểm tra
            </button>

            <button
              type="button"
              onClick={onRunSelfRepair}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                hasFixable
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
              }`}
            >
              <Wrench size={13} /> Chạy Tự Sửa Lỗi (Self-Repair)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── 4. EDIT DEPARTMENT & EDIT BOT MODALS (UNLIMITED EXPANSION CRUD) ────── */
const NEON_SWATCHES = ['#00f5ff', '#38bdf8', '#34d399', '#818cf8', '#f472b6', '#fbbf24', '#fb7185', '#a78bfa'];

interface EditDepartmentModalProps {
  department: OfficeDepartment;
  canDelete: boolean;
  onSave: (updated: OfficeDepartment) => void;
  onDelete: (deptId: string) => void;
  onClose: () => void;
}

export const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({
  department,
  canDelete,
  onSave,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState(department.name);
  const [shortLabel, setShortLabel] = useState(department.shortLabel);
  const [description, setDescription] = useState(department.description);
  const [colorHex, setColorHex] = useState(department.colorHex);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...department,
      name: name.trim(),
      shortLabel: shortLabel.trim() || name.trim().slice(0, 18),
      description: description.trim() || department.description,
      colorHex,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-cyan-500/45 bg-[#041222] p-4 space-y-3 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-white">Chỉnh Sửa Phòng Ban</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Tên phòng ban</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              required
            />
          </div>
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Nhãn ngắn hiển thị 3D</label>
            <input
              type="text"
              value={shortLabel}
              onChange={(e) => setShortLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Chức năng phòng ban</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Màu Hologram Neon</label>
            <div className="flex flex-wrap gap-2">
              {NEON_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorHex(c)}
                  className={`w-7 h-7 rounded-full border-2 transition ${
                    colorHex === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          {canDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(department.id);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 size={13} /> Xóa phòng
            </button>
          ) : (
            <span className="text-[10px] text-slate-500">Cần giữ tối thiểu 1 phòng ban</span>
          )}
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
};

interface EditBotModalProps {
  bot: Office3DBot;
  departments: OfficeDepartment[];
  onSave: (patch: {
    botId: string;
    name: string;
    roleBadge: string;
    roleTitle: string;
    departmentId: string;
    screenKind: HologramScreenKind;
    avatarStyle: AvatarStyle;
    model: string;
  }) => void;
  onRemoveBot?: (botId: string) => void;
  onClose: () => void;
}

export const EditBotModal: React.FC<EditBotModalProps> = ({
  bot,
  departments,
  onSave,
  onRemoveBot,
  onClose,
}) => {
  const [name, setName] = useState(bot.name);
  const [roleBadge, setRoleBadge] = useState(bot.roleBadge);
  const [roleTitle, setRoleTitle] = useState(bot.roleTitle);
  const [departmentId, setDepartmentId] = useState(bot.departmentId);
  const [screenKind, setScreenKind] = useState<HologramScreenKind>(bot.screenKind);
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(bot.avatarStyle);
  const [model, setModel] = useState(bot.model || 'Claude Sonnet / DeepSeek-V3');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      botId: bot.id,
      name: name.trim(),
      roleBadge: roleBadge.trim() || 'AI Specialist',
      roleTitle: roleTitle.trim() || bot.roleTitle,
      departmentId,
      screenKind,
      avatarStyle,
      model: model.trim() || 'Claude Sonnet / DeepSeek-V3',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-cyan-500/45 bg-[#041222] p-4 space-y-3 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-white">Tùy Biến Nhân Viên AI Hologram</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Tên Bot</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              required
            />
          </div>
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Nhãn Hologram 3D</label>
            <input
              type="text"
              value={roleBadge}
              onChange={(e) => setRoleBadge(e.target.value)}
              placeholder="VD: AI Marketer"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="text-slate-300 font-semibold block mb-1">Vai trò chuyên môn</label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Phòng ban</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Kiểu màn hình HUD 3D</label>
            <select
              value={screenKind}
              onChange={(e) => setScreenKind(e.target.value as HologramScreenKind)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
            >
              <option value="manager">AI Manager (KPI Gauges)</option>
              <option value="marketer">AI Marketer (Biểu đồ tăng trưởng)</option>
              <option value="researcher">AI Researcher (Nguyên tử & Lab)</option>
              <option value="support">AI Customer Support (Chat & Mail)</option>
              <option value="code">AI Engineer (Code & Laptop)</option>
              <option value="commerce">AI Commerce (GMV TikTok Shop)</option>
            </select>
          </div>
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Dáng Hologram</label>
            <select
              value={avatarStyle}
              onChange={(e) => setAvatarStyle(e.target.value as AvatarStyle)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
            >
              <option value="female">Nữ Android (như Marketer/CSKH)</option>
              <option value="male">Nam Android (như Manager/Engineer)</option>
              <option value="android">Cyber Android tiêu chuẩn</option>
            </select>
          </div>
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Mô hình AI mặc định</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          {onRemoveBot ? (
            <button
              type="button"
              onClick={() => {
                onRemoveBot(bot.id);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 size={13} /> Gỡ bot
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
          >
            Cập nhật Hologram
          </button>
        </div>
      </form>
    </div>
  );
};
