import { ImageResponse } from "next/og";
import { BRAND_CONFIG } from "@/config/brand";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)",
          padding: "56px 64px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            {BRAND_CONFIG.logoMark}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: "28px", fontWeight: 800 }}>
              {BRAND_CONFIG.name}
            </div>
            <div style={{ display: "flex", fontSize: "18px", color: "#a5b4fc" }}>
              {"Nen tang AI Da Bot · Ban Cai May & Thue Cloud 24/7"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "980px" }}>
          <div style={{ display: "flex", fontSize: "52px", fontWeight: 800, lineHeight: 1.15 }}>
            {"Doi Ngu Nhan Su AI Da Bot — Hybrid Desktop & Cloud 24/7"}
          </div>
          <div style={{ display: "flex", fontSize: "24px", color: "#cbd5e1", lineHeight: 1.4 }}>
            {"TikTok Shop · Marketing SEO · Tro ly Giao vien · Van phong SME"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.16)",
            paddingTop: "24px",
            fontSize: "20px",
            color: "#e2e8f0",
          }}
        >
          <div style={{ display: "flex" }}>{`Zalo Admin: ${BRAND_CONFIG.contact.zaloPhone}`}</div>
          <div style={{ display: "flex" }}>{`Email: ${BRAND_CONFIG.contact.email}`}</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
