import type { MetadataRoute } from "next";
import { SITE_URL, SEO_EXAMPLE_IMAGE, seoPages } from "@/lib/seo";

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/guides", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/alternatives", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-05-12");

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      images: route.path === "/" ? [`${SITE_URL}${SEO_EXAMPLE_IMAGE}`] : undefined,
    })),
    ...seoPages.map((page) => ({
      url: `${SITE_URL}${page.path}`,
      lastModified,
      changeFrequency: page.section === "guide" ? ("monthly" as const) : ("weekly" as const),
      priority: page.section === "tool" ? 0.9 : 0.7,
      images: [`${SITE_URL}${SEO_EXAMPLE_IMAGE}`],
    })),
  ];
}
