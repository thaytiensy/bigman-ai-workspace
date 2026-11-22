"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink, Layers } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { DEPARTMENTS, type DepartmentId } from "@/config/departments";

interface IndustryTemplatesProps {
  activeDepartmentId?: DepartmentId;
  onTryDepartment?: (id: DepartmentId) => void;
}

export function IndustryTemplates({
  activeDepartmentId,
  onTryDepartment,
}: IndustryTemplatesProps) {
  return (
    <section id="kho-doi-bot" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
            <Layers className="h-3.5 w-3.5" />
            4 Kho Mẫu Đội Bot Dựng Sẵn Theo Ngành
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Bấm 1 chạm — có ngay nguyên phòng ban AI đúng nghiệp vụ Việt Nam
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Không cần tự viết prompt phức tạp từ con số 0. Mỗi kho mẫu đã cài sẵn trưởng phòng điều
            phối, các bot chuyên môn, bộ kiểm soát rủi ro và lịch chạy tự động.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {DEPARTMENTS.map((dept) => {
            const isSelected = activeDepartmentId === dept.id;
            return (
              <article
                key={dept.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-6 transition-all ${
                  isSelected
                    ? "border-indigo-500 shadow-md ring-2 ring-indigo-500/15"
                    : "border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${dept.accentBg} ${dept.accentText} ${dept.accentBorder}`}
                    >
                      {dept.badgeText}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{dept.timeSaved}</span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
                    {dept.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{dept.tagline}</p>

                  <p className="mt-3 text-xs font-medium text-slate-500">
                    <strong className="text-slate-700">Dành cho:</strong> {dept.targetAudience}
                  </p>

                  {/* Bot Chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {dept.bots.map((bot) => (
                      <span
                        key={bot.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                      >
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            bot.cloudOnly ? "bg-amber-500" : "bg-indigo-600"
                          }`}
                        />
                        {bot.name}
                      </span>
                    ))}
                  </div>

                  {/* Highlights */}
                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    {dept.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-4">
                  {onTryDepartment ? (
                    <button
                      type="button"
                      onClick={() => {
                        onTryDepartment(dept.id);
                        document
                          .getElementById("workspace-demo")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 sm:text-sm"
                    >
                      Mở phòng họp mẫu
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link
                      href="/#workspace-demo"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 sm:text-sm"
                    >
                      Trải nghiệm tương tác
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}

                  {dept.externalDemo && (
                    <a
                      href={dept.externalDemo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 sm:text-sm"
                    >
                      Xem app live
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <a
                    href={BRAND_CONFIG.contact.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Cài đội này →
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
