import type { MetadataRoute } from "next";
import { toolModules } from "@modules/registry";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://automatisationweb.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/a-propos",
    "/tarifs",
    "/connexion",
    "/compte",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const toolsRoutes: MetadataRoute.Sitemap = toolModules.map((tool) => ({
    url: `${siteUrl}${tool.uiPath}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...toolsRoutes];
}
