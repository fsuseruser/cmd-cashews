import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { getProducts } from "@/lib/products";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...products.map((p) => ({
      url: `${SITE.url}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
