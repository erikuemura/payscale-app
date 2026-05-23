import type { MetadataRoute } from "next";

const BASE = "https://payscale-app.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:              BASE + "/site",
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         1.0,
    },
    {
      url:              BASE + "/",
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.8,
    },
    {
      url:              BASE + "/signup",
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.7,
    },
    {
      url:              BASE + "/auth/reset-password",
      lastModified:     new Date(),
      changeFrequency:  "yearly",
      priority:         0.3,
    },
  ];
}
