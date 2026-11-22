import type { Metadata } from "next";
import { BRAND_CONFIG } from "@/config/brand";

export const metadata: Metadata = {
  title: "Dùng thử Workspace Đa Bot (Cài Máy & Cloud 24/7)",
  description:
    "Trải nghiệm trực tiếp không gian làm việc Tổ Chức Nhân Viên AI: quản lý đội ngũ nhân viên AI, phòng họp chiến lược đa bot, lịch tự động hóa 24/7 và bảng giá Cloud.",
  alternates: {
    canonical: "/workspace",
  },
  openGraph: {
    title: `Dùng thử Workspace Đa Bot | ${BRAND_CONFIG.name}`,
    description:
      "Trải nghiệm trực tiếp phòng họp đa bot, giới hạn 2 Bot Bản Cài Máy 0đ và mở khóa đội ngũ AI chạy ngầm 24/7 trên Cloud.",
    url: `${BRAND_CONFIG.siteUrl}/workspace`,
  },
};

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
