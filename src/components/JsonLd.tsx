import { BRAND_CONFIG } from "@/config/brand";
import { FAQ_ITEMS } from "@/config/faq";
import { CLOUD_TIERS } from "@/config/plans";

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
        name: "Bản Cài Máy (Windows / macOS)",
        price: "0",
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
        description:
          "Trải nghiệm miễn phí trên máy cá nhân, giới hạn tối đa 3 bot hoạt động đồng thời, dùng API key riêng.",
      },
      ...CLOUD_TIERS.map((tier) => ({
        "@type": "Offer",
        name: tier.name,
        price: String(tier.monthlyPriceVnd),
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
        description: tier.tagline,
      })),
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
