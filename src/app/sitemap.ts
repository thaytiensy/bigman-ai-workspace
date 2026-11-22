import type { MetadataRoute } from "next";
import { BRAND_CONFIG } from "@/config/brand";
import { getAllBlogPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const blogPosts = getAllBlogPosts();

  return [
    {
      url: BRAND_CONFIG.siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BRAND_CONFIG.siteUrl}/workspace`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BRAND_CONFIG.siteUrl}/so-sanh-cai-may-va-cloud`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BRAND_CONFIG.siteUrl}/kho-doi-bot`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BRAND_CONFIG.siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...blogPosts.map((post) => ({
      url: `${BRAND_CONFIG.siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
  ];
}
