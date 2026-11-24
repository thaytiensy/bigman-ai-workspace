'use client';

import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  FolderPlus,
  GraduationCap,
  Layers,
  Megaphone,
  MessageSquare,
  Scale,
  ShoppingBag,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';
import {
  INDUSTRY_TEMPLATES,
  type IndustryTemplate,
} from '@/data/industryTemplates';
import type { WorkspaceMode } from '@/types/workspace';
import { BRANDING } from '@/config/branding';

interface IndustryTemplateModalProps {
  isOpen: boolean;
  activeIndustryId: string;
  workspaceMode: WorkspaceMode;
  onClose: () => void;
  onApplyTemplate: (template: IndustryTemplate) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ShoppingBag,
  GraduationCap,
  Building2,
  Sparkles,
  Utensils,
  Scale,
  Megaphone,
  FolderPlus,
};

export const IndustryTemplateModal: React.FC<IndustryTemplateModalProps> = ({
  isOpen,
  activeIndustryId,
  workspaceMode,
  onClose,
  onApplyTemplate,
}) => {
  const [previewId, setPreviewId] = useState<string>(activeIndustryId);

  React.useEffect(() => {
    if (isOpen) setPreviewId(activeIndustryId);
  }, [isOpen, activeIndustryId]);

  if (!isOpen) return null;

  const previewTemplate =
    INDUSTRY_TEMPLATES.find((t) => t.id === previewId) || INDUSTRY_TEMPLATES[0];
  const PreviewIcon = ICON_MAP[previewTemplate.icon] || Layers;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-5">
      <div className="w-full max-w-5xl max-h-[90vh] rounded-2xl bg-[#041122] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-cyan-500/20 flex items-center justify-between gap-3 bg-[#020a16]">
          <div>
            <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2">
              <Layers size={18} className="text-cyan-400" />
              Chọn Mẫu Ngành Nghề (1 Bấm Dựng Trọn Văn Phòng 3D)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Chuyển ngay phòng ban, nhân viên AI tên Việt ngắn, câu lệnh @Tên và lịch tự động chuẩn theo ngành của bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng chọn ngành"
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body: Left 8-Industry Grid + Right Live Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left list */}
          <div className="lg:col-span-5 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-2 overflow-y-auto">
            {INDUSTRY_TEMPLATES.map((tpl) => {
              const Icon = ICON_MAP[tpl.icon] || Layers;
              const isSelected = tpl.id === previewTemplate.id;
              const isCurrent = tpl.id === activeIndustryId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setPreviewId(tpl.id)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400/70 shadow-sm'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
                    style={{
                      backgroundColor: `${tpl.accentColor}1f`,
                      borderColor: `${tpl.accentColor}55`,
                      color: tpl.accentColor,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-white truncate">
                        {tpl.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 font-bold flex-shrink-0">
                          Đang dùng
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {tpl.departments.length} phòng ban · {tpl.bots.length} nhân viên AI
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right detail preview */}
          <div className="lg:col-span-7 p-5 space-y-4 overflow-y-auto bg-[#030d1b]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border"
                  style={{
                    backgroundColor: `${previewTemplate.accentColor}22`,
                    borderColor: `${previewTemplate.accentColor}66`,
                    color: previewTemplate.accentColor,
                  }}
                >
                  <PreviewIcon size={22} />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">{previewTemplate.name}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {previewTemplate.tagline}
                  </p>
                </div>
              </div>
            </div>

            {workspaceMode === 'desktop_free' && previewTemplate.bots.length > BRANDING.system.desktopMaxFreeBots && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-[11px] text-amber-200">
                Bản Cài Máy Miễn phí tự kích hoạt sẵn <strong>{BRANDING.system.desktopMaxFreeBots} nhân viên</strong> đầu tiên; các nhân viên còn lại hiện đầy đủ trên Văn phòng 3D để bạn xem trước và mở khóa khi nâng cấp Cloud 24/7.
              </div>
            )}

            {/* Departments & Staff */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Cơ cấu {previewTemplate.departments.length} phòng ban · {previewTemplate.bots.length} nhân viên AI
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {previewTemplate.departments.map((dept) => {
                  const deptBots = previewTemplate.bots.filter(
                    (b) => b.departmentId === dept.id
                  );
                  return (
                    <div
                      key={dept.id}
                      className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: dept.color }}
                        />
                        <span className="text-xs font-bold text-white truncate">{dept.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{dept.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {deptBots.map((b) => (
                          <span
                            key={b.id}
                            title={`${b.name} — ${b.role}`}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-cyan-200 font-semibold"
                          >
                            {b.name} · <span className="text-slate-400 font-normal">{b.role.split(' ').slice(0, 3).join(' ')}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sample @Commands */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <MessageSquare size={12} /> 3 câu lệnh @Tên mẫu sẵn sàng chạy
              </div>
              <div className="space-y-1.5">
                {previewTemplate.sampleCommands.map((cmd, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-slate-900/80 border border-slate-800 px-3 py-2 text-[11px] text-slate-200"
                  >
                    {cmd}
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Routines */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Clock size={12} /> 2 lịch tự động tiêu biểu
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {previewTemplate.sampleRoutines.map((r, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-slate-900/70 border border-slate-800 p-2.5 text-[11px]"
                  >
                    <div className="font-bold text-white">{r.title}</div>
                    <div className="text-cyan-300 text-[10px] mt-0.5">
                      Phụ trách: {r.ownerBotName} · Lịch: {r.schedule}
                    </div>
                    <p className="text-slate-400 mt-1 line-clamp-2">{r.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-cyan-500/20 bg-[#020a16] flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Sau khi áp dụng, bạn vẫn có thể bấm <strong>+ Thêm phòng ban</strong> hoặc <strong>+ Thêm bot</strong> tùy chỉnh không giới hạn.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyTemplate(previewTemplate);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle2 size={14} />
              Áp dụng mẫu “{previewTemplate.shortName}” (1 bấm)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
