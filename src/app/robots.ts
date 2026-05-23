import type { MetadataRoute } from "next";

const BASE = "https://payscale-app.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     ["/", "/site", "/signup", "/auth/reset-password"],
        disallow:  ["/dashboard/", "/api/"],
      },
    ],
    sitemap: BASE + "/sitemap.xml",
  };
}
