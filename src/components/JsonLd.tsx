import { BRAND_CONFIG } from "@/config/brand";
import { FAQ_ITEMS } from "@/config/faq";
import { CLOUD_TIERS, DESKTOP_EDITION } from "@/config/plans";

interface JsonLdProps {
  includeFaq?: boolean;
}

export function JsonLd({ includeFaq = true }: JsonLdProps) {
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND_CONFIG.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Windows, macOS, Web",
    inLanguage: "vi-VN",
    url: BRAND_CONFIG.siteUrl,
    description: BRAND_CONFIG.seo.description,
    offers: [
      {
        "@type": "Offer",
        name: DESKTOP_EDITION.name,
        price: String(DESKTOP_EDITION.freePriceVnd),
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
        description:
          "Miễn phí 0đ trên máy cá nhân: tối đa 2 Bot, 1 phòng họp cơ bản, mở lên dùng ngay khi bật máy.",
      },
      {
        "@type": "Offer",
        name: DESKTOP_EDITION.proLicenseName,
        price: String(DESKTOP_EDITION.proLicensePriceVnd),
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
        description: "Bản quyền phần mềm cài máy tính cá nhân (1.890.000đ/máy).",
      },
      ...CLOUD_TIERS.flatMap((tier) => [
        {
          "@type": "Offer",
          name: `${tier.name} (Hạ tầng tiết kiệm)`,
          price: String(tier.byokMonthlyVnd),
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
          description: `${tier.botCapacityLabel} — gói hạ tầng Cloud 24/7 tiết kiệm (giảm 20% khi đóng năm).`,
        },
        {
          "@type": "Offer",
          name: `${tier.name} (${tier.creditsLabel})`,
          price: String(tier.creditsMonthlyVnd),
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
          description: `${tier.botCapacityLabel} — trọn gói ${tier.creditsLabel} (giảm 20% khi đóng năm).`,
        },
      ]),
    ],
    publisher: {
      "@type": "Organization",
      name: BRAND_CONFIG.name,
      url: BRAND_CONFIG.siteUrl,
      email: BRAND_CONFIG.contact.email,
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: `+84-${BRAND_CONFIG.contact.zaloPhone.slice(1)}`,
          contactType: "customer support",
          availableLanguage: ["Vietnamese"],
          url: BRAND_CONFIG.contact.zaloUrl,
          email: BRAND_CONFIG.contact.email,
        },
      ],
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      {includeFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
