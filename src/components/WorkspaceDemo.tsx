"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  Cloud,
  ExternalLink,
  Laptop,
  Lock,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import {
  DEPARTMENTS,
  type DelegationStep,
  type DepartmentId,
  getDepartmentById,
} from "@/config/departments";

interface WorkspaceDemoProps {
  activeDepartmentId: DepartmentId;
  onSelectDepartment: (id: DepartmentId) => void;
}

type DemoTab = "war-room" | "routines";
type EditionMode = "cloud" | "desktop";

export function WorkspaceDemo({
  activeDepartmentId,
  onSelectDepartment,
}: WorkspaceDemoProps) {
  const department = useMemo(
    () => getDepartmentById(activeDepartmentId),
    [activeDepartmentId]
  );

  const [activeTab, setActiveTab] = useState<DemoTab>("war-room");
  const [editionMode, setEditionMode] = useState<EditionMode>("cloud");
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [customPrompt, setCustomPrompt] = useState("");
  const [customRun, setCustomRun] = useState<{
    userPrompt: string;
    steps: DelegationStep[];
    finalOutcome: string;
  } | null>(null);
  const [visibleStepsCount, setVisibleStepsCount] = useState<number>(4);
  const [isSimulating, setIsSimulating] = useState(false);

  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    setSelectedScenarioIndex(0);
    setCustomRun(null);
    setVisibleStepsCount(department.scenarios[0]?.steps.length ?? 0);
    setIsSimulating(false);
    return clearTimers;
  }, [department]);

  const activeScenario =
    customRun ?? department.scenarios[selectedScenarioIndex] ?? department.scenarios[0];

  const runSimulation = (stepsTotal: number) => {
    clearTimers();
    setIsSimulating(true);
    setVisibleStepsCount(1);

    for (let i = 2; i <= stepsTotal; i += 1) {
      const timerId = window.setTimeout(() => {
        setVisibleStepsCount(i);
        if (i === stepsTotal) {
          setIsSimulating(false);
        }
      }, (i - 1) * 550);
      timersRef.current.push(timerId);
    }

    if (stepsTotal <= 1) {
      setIsSimulating(false);
    }
  };

  const handleSelectScenario = (index: number) => {
    setCustomRun(null);
    setSelectedScenarioIndex(index);
    setActiveTab("war-room");
    const scenario = department.scenarios[index];
    if (scenario) {
      runSimulation(scenario.steps.length);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customPrompt.trim();
    if (!cleaned) return;

    const chief = department.bots.find((b) => b.isChief) ?? department.bots[0];
    const workers = department.bots.filter((b) => !b.isChief);
    const availableWorkers =
      editionMode === "desktop" ? workers.filter((w) => !w.cloudOnly) : workers;

    const firstWorker = availableWorkers[0] ?? chief;
    const secondWorker = availableWorkers[1] ?? firstWorker;
    const lockedBots = editionMode === "desktop" ? workers.filter((w) => w.cloudOnly) : [];

    const generatedSteps: DelegationStep[] = [
      {
        botId: chief.id,
        botName: chief.name,
        role: chief.role,
        actionTag: "Phân tích & Giao việc",
        message: `Đã tiếp nhận yêu cầu: "${cleaned}". Phân công @${firstWorker.name} xử lý dữ liệu chính${
          secondWorker.id !== firstWorker.id ? ` và @${secondWorker.name} chuẩn hóa đầu ra` : ""
        }.${
          lockedBots.length > 0
            ? ` (Lưu ý: ${lockedBots.map((b) => `@${b.name}`).join(", ")} đang khóa trên Bản Cài Máy Free 2 Bot — nâng cấp Starter/Pro Cloud 24/7 để mở khóa đầy đủ.)`
            : ""
        }`,
        durationLabel: "00:02",
      },
      {
        botId: firstWorker.id,
        botName: firstWorker.name,
        role: firstWorker.role,
        actionTag: "Thực thi chuyên môn",
        message: `Đang áp dụng quy trình chuẩn của ${department.shortName} cho yêu cầu "${cleaned}". Đã tách danh sách hạng mục ưu tiên và rà soát rủi ro sai sót.`,
        deliverable: `Bản phân tích chuyên môn từ ${firstWorker.name}`,
        durationLabel: "00:07",
      },
      {
        botId: secondWorker.id,
        botName: secondWorker.name,
        role: secondWorker.role,
        actionTag: "Đóng gói kết quả",
        message:
          "Đã biên tập kết quả dễ đọc, sẵn sàng để chủ nhân duyệt và áp dụng ngay trong công việc thực tế.",
        deliverable: "Bảng kế hoạch & mẫu hành động sẵn sàng dùng",
        durationLabel: "00:12",
      },
    ];

    setCustomRun({
      userPrompt: cleaned,
      steps: generatedSteps,
      finalOutcome: `Phòng ${department.shortName} đã hoàn tất mô phỏng giao việc chéo giữa ${
        editionMode === "desktop"
          ? "2 bot (Bản Cài Máy Free 0đ)"
          : `${department.bots.length} bot (Bản Thuê Cloud 24/7)`
      }.`,
    });
    setActiveTab("war-room");
    setCustomPrompt("");
    runSimulation(generatedSteps.length);
  };

  const activeBotCount =
    editionMode === "desktop"
      ? department.bots.filter((b) => !b.cloudOnly).length
      : department.bots.length;

  return (
    <section
      id="workspace-demo"
      className="scroll-mt-20 border-y border-slate-200 bg-slate-50/80 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/80">
              <Sparkles className="h-3.5 w-3.5" />
              Cổng Trải Nghiệm Tương Tác Trực Tiếp
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Xem đội ngũ nhân viên AI tự phối hợp giao việc theo từng ngành
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Chuyển qua lại 4 phòng ban dựng sẵn, chạy thử kịch bản phòng họp đa bot và bật/tắt
              chế độ <strong>Bản Cài Máy Free (2 bot)</strong> vs{" "}
              <strong>Bản Thuê Cloud 24/7</strong> để thấy rõ sự khác biệt trước khi chọn gói.
            </p>
          </div>

          <div
            className="inline-flex self-start rounded-xl border border-slate-200 bg-white p-1 shadow-xs"
            role="group"
            aria-label="Chuyển chế độ xem Bản Cài Máy hoặc Cloud"
          >
            <button
              type="button"
              onClick={() => setEditionMode("desktop")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                editionMode === "desktop"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Laptop className="h-4 w-4" />
              Cài Máy Free (2 bot)
            </button>
            <button
              type="button"
              onClick={() => setEditionMode("cloud")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                editionMode === "cloud"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Cloud className="h-4 w-4" />
              Bản Cloud 24/7
            </button>
          </div>
        </div>

        {/* Department Switcher Tabs */}
        <div
          className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
          role="tablist"
          aria-label="Chọn phòng ban AI trải nghiệm"
        >
          {DEPARTMENTS.map((dept, idx) => {
            const isActive = dept.id === department.id;
            return (
              <button
                key={dept.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectDepartment(dept.id)}
                className={`flex flex-col items-start rounded-xl border px-3.5 py-3 text-left transition-all ${
                  isActive
                    ? "border-indigo-600 bg-white shadow-sm ring-2 ring-indigo-600/15"
                    : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Phòng ban 0{idx + 1}
                </span>
                <span
                  className={`mt-0.5 text-sm font-bold ${
                    isActive ? "text-indigo-700" : "text-slate-800"
                  }`}
                >
                  {dept.shortName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Workspace Shell */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-4 py-3 text-white sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-semibold text-white">{department.name}</span>
                <span className="ml-2 hidden text-slate-300 sm:inline">
                  · {activeBotCount}/{department.bots.length} bot hoạt động
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editionMode === "cloud" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Cloud 24/7 Đang trực
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-200 ring-1 ring-amber-400/30">
                  <Lock className="h-3 w-3" />
                  Desktop Free · Giới hạn 2 bot
                </span>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-12">
            {/* Left Sidebar: Roster */}
            <aside className="border-b border-slate-200 bg-slate-50/70 p-4 sm:p-5 lg:col-span-4 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Users className="h-4 w-4 text-indigo-600" />
                  Đội ngũ Bot trong phòng
                </h3>
                <span className="text-xs font-medium text-slate-500">
                  {activeBotCount} sẵn sàng
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {department.bots.map((bot) => {
                  const locked = editionMode === "desktop" && bot.cloudOnly;
                  return (
                    <div
                      key={bot.id}
                      className={`rounded-xl border p-3 transition-all ${
                        locked
                          ? "border-dashed border-amber-300 bg-amber-50/60"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            locked ? "bg-slate-200 text-slate-500" : bot.colorClass
                          }`}
                        >
                          {locked ? <Lock className="h-4 w-4" /> : bot.avatarCode}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-sm font-bold text-slate-900">{bot.name}</p>
                            {bot.isChief && (
                              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                                Trưởng phòng
                              </span>
                            )}
                            {locked && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                Cần Cloud
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-slate-500">{bot.role}</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {bot.specialty}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {department.externalDemo && (
                <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3.5">
                  <p className="text-xs font-bold text-sky-900">
                    Sản phẩm thực tế đang chạy live
                  </p>
                  <p className="mt-1 text-xs text-sky-800">{department.externalDemo.note}</p>
                  <a
                    href={department.externalDemo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-800"
                  >
                    {department.externalDemo.label}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {editionMode === "desktop" && (
                <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5">
                  <p className="text-xs font-semibold text-indigo-950">
                    Đang xem giới hạn Desktop Free (0đ · tối đa 2 Bot)
                  </p>
                  <p className="mt-1 text-xs text-indigo-800">
                    Nâng cấp Thuê Cloud 24/7 (từ 199.000đ/tháng) để mở khóa 5–10+ bot và chạy lịch
                    tự động ngay cả khi tắt máy tính.
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditionMode("cloud")}
                    className="mt-2 text-xs font-bold text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
                  >
                    Bật thử chế độ Cloud 24/7 ngay →
                  </button>
                </div>
              )}
            </aside>

            {/* Right Main Area: War Room + Routines */}
            <div className="flex flex-col p-4 sm:p-6 lg:col-span-8">
              {/* Sub-tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("war-room")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                      activeTab === "war-room"
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Bot className="h-4 w-4" />
                    Phòng họp đa bot giao việc
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("routines")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                      activeTab === "routines"
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <CalendarClock className="h-4 w-4" />
                    Lịch chạy tự động ({department.routines.length})
                  </button>
                </div>

                {activeTab === "war-room" && (
                  <button
                    type="button"
                    onClick={() => runSimulation(activeScenario.steps.length)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    {isSimulating ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                        Đang chạy mô phỏng...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 text-indigo-600" />
                        Chạy lại mô phỏng
                      </>
                    )}
                  </button>
                )}
              </div>

              {activeTab === "war-room" ? (
                <div className="mt-4 flex flex-1 flex-col">
                  {/* Preset Scenario Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Kịch bản mẫu:</span>
                    {department.scenarios.map((sc, idx) => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => handleSelectScenario(idx)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          !customRun && selectedScenarioIndex === idx
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {sc.title}
                      </button>
                    ))}
                  </div>

                  {/* User Prompt Bubble */}
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                      Yêu cầu từ chủ nhân / quản lý
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {activeScenario.userPrompt}
                    </p>
                  </div>

                  {/* Multi-bot Delegation Timeline */}
                  <div className="mt-4 space-y-3" aria-live="polite">
                    {activeScenario.steps.slice(0, visibleStepsCount).map((step, idx) => {
                      const botMeta = department.bots.find((b) => b.id === step.botId);
                      const isLockedNotice = editionMode === "desktop" && botMeta?.cloudOnly;
                      return (
                        <div
                          key={`${step.botId}-${idx}`}
                          className={`rounded-xl border p-3.5 transition-all ${
                            isLockedNotice
                              ? "border-amber-200 bg-amber-50/70"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold ${
                                  botMeta?.colorClass ?? "bg-indigo-600 text-white"
                                }`}
                              >
                                {botMeta?.avatarCode ?? "AI"}
                              </span>
                              <div>
                                <span className="text-sm font-bold text-slate-900">
                                  {step.botName}
                                </span>
                                <span className="ml-2 text-xs text-slate-500">{step.role}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                {step.actionTag}
                              </span>
                              <span className="font-mono text-[11px] text-slate-600">
                                {step.durationLabel}
                              </span>
                            </div>
                          </div>

                          <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            {isLockedNotice
                              ? `Trên Desktop Free (0đ, giới hạn 2 Bot), đầu việc của @${step.botName} cần xử lý thủ công hoặc nâng cấp gói Thuê Cloud 24/7 (từ 199.000đ/tháng) để tự động chạy song song.`
                              : step.message}
                          </p>

                          {step.deliverable && !isLockedNotice && (
                            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              Đầu ra: {step.deliverable}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Consolidated Outcome */}
                  {visibleStepsCount >= activeScenario.steps.length && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                            Kết quả tổng hợp bàn giao
                          </p>
                          <p className="mt-0.5 text-sm text-emerald-950">
                            {activeScenario.finalOutcome}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom Interactive Input */}
                  <form
                    onSubmit={handleCustomSubmit}
                    className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row"
                  >
                    <label htmlFor="workspace-demo-input" className="sr-only">
                      Nhập yêu cầu thử nghiệm cho phòng ban AI
                    </label>
                    <input
                      id="workspace-demo-input"
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder={`Thử giao 1 việc cho ${department.shortName} (ví dụ: Lập kế hoạch tuần này)...`}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                      <Send className="h-4 w-4" />
                      Giao việc thử
                    </button>
                  </form>
                </div>
              ) : (
                /* Automated Routines Tab */
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-slate-600">
                    Đội bot không chờ bạn nhắc mỗi ngày — các lịch dưới đây tự chạy đúng giờ theo múi
                    giờ Việt Nam (GMT+7).
                  </p>
                  {department.routines.map((routine) => {
                    const pausedOnDesktop = editionMode === "desktop" && routine.requiresCloud247;
                    return (
                      <div
                        key={routine.id}
                        className={`rounded-xl border p-4 ${
                          pausedOnDesktop
                            ? "border-dashed border-amber-300 bg-amber-50/50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{routine.title}</h4>
                            <p className="mt-1 text-xs text-slate-600">{routine.summary}</p>
                          </div>
                          {pausedOnDesktop ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                              <Lock className="h-3 w-3" />
                              Chỉ chạy 24/7 trên Cloud
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" />
                              {routine.requiresCloud247 ? "Tự động 24/7 (Cloud)" : "Chạy khi mở máy"}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <CalendarClock className="h-3.5 w-3.5 text-indigo-600" />
                            {routine.schedule}
                          </span>
                          <span>Phụ trách: {routine.ownerBot}</span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900 p-4 text-white">
                    <div>
                      <p className="text-sm font-bold">
                        Muốn kích hoạt đội {department.shortName} chạy thật 24/7?
                      </p>
                      <p className="mt-0.5 text-xs text-slate-300">
                        Nhắn Admin qua Zalo {BRAND_CONFIG.contact.zaloPhone} để được cài sẵn đúng
                        quy trình doanh nghiệp của bạn.
                      </p>
                    </div>
                    <a
                      href={BRAND_CONFIG.contact.zaloUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-400"
                    >
                      Kích hoạt ngay →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
