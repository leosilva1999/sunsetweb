import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas sem valor pra busca orgânica: moderação é restrita e as telas de
      // autenticação são formulários (e o link de reset de senha carrega um token).
      disallow: ["/moderation", "/login", "/register", "/forgot-password", "/reset-password"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
