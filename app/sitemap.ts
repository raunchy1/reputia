import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return ["", "/prezzi", "/contatti", "/privacy", "/termini", "/cookie"].map((path) => ({ url: `${base}${path}`, changeFrequency: "monthly" }));
}
