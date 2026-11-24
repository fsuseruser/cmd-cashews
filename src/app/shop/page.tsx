import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { ShopGrid } from "./ShopGrid";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop Cashews: Devilled, Burnt, Garlic, Raw & More",
  description:
    "Buy Sri Lankan cashews online by the kilo: devilled, burnt, salted, garlic & pepper, ghee-fried, raw whole, halves and pieces. Free delivery in Negombo.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <div className="container">
      <header className="page-head">
        <span className="eyebrow fade-in">The full range</span>
        <h1 className="fade-in" style={{ ["--d" as string]: "100ms", marginTop: 14, fontSize: "clamp(2.6rem, 5vw, 4.2rem)" }}>
          Shop cashews
        </h1>
        <p className="lead fade-in" style={{ ["--d" as string]: "200ms" }}>
          Choose 250 g, 500 g or 1 kg packs and mix flavours freely. The more you order, the more you save.
        </p>
      </header>
      <Suspense>
        <ShopGrid products={products} />
      </Suspense>
      <div style={{ height: 110 }} />
    </div>
  );
}
