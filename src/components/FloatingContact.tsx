import { MessageCircle } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

export function FloatingContact() {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <a
        href={BRAND_CONFIG.contact.zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-transform hover:scale-[1.02] hover:bg-indigo-700"
        aria-label={`Nhắn Zalo Admin ${BRAND_CONFIG.contact.zaloPhone}`}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Tư vấn Zalo: {BRAND_CONFIG.contact.zaloPhone}</span>
        <span className="sm:hidden">Zalo Admin</span>
      </a>
    </div>
  );
}
