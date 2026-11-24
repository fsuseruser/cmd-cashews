import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/products";
import { CATEGORIES } from "@/lib/catalog";
import { SITE } from "@/lib/config";
import { lkr } from "@/lib/format";
import { ProductArt } from "@/components/ProductArt";
import { BuyBox } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Not found" };
  const title = `${p.name} 1kg: ${p.short}`;
  return {
    title,
    description: `${p.description} ${lkr(p.price)} per kg. Order online from CMD Cashews, Negombo.`,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: `${p.name} | CMD Cashews`, description: p.description, url: `${SITE.url}/products/${p.slug}`, type: "website" },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const all = await getProducts();
  const related = all.filter((x) => x.slug !== p.slug && x.category === p.category).slice(0, 4);
  const more = related.length >= 3 ? related : all.filter((x) => x.slug !== p.slug).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    brand: { "@type": "Brand", name: "CMD Cashews" },
    category: CATEGORIES[p.category],
    url: `${SITE.url}/products/${p.slug}`,
    ...(p.image ? { image: `${SITE.url}${p.image}` } : {}),
    offers: {
      "@type": "Offer",
      price: p.price,
      priceSpecification: { "@type": "UnitPriceSpecification", price: p.price, priceCurrency: "LKR", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "KGM" } },
      priceCurrency: "LKR",
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE.url}/products/${p.slug}`,
      seller: { "@type": "Organization", name: "CMD Cashews" },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container">
        <div className="pdp">
          <div className="pdp-media fade-in">
            <ProductArt name={p.name} tone={p.tone} image={p.image} sizes="(max-width: 860px) 100vw, 50vw" priority />
          </div>
          <div>
            <nav className="crumbs fade-in" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/shop">Shop</Link>
              <span>/</span>
              <Link href={`/shop?c=${p.category}`}>{CATEGORIES[p.category]}</Link>
            </nav>
            <h1 className="fade-in" style={{ ["--d" as string]: "80ms" }}>
              {p.name}
            </h1>
            <p className="short fade-in" style={{ ["--d" as string]: "160ms" }}>
              {p.short}
            </p>
            <div className="pdp-price fade-in" style={{ ["--d" as string]: "240ms" }}>
              <strong>{lkr(p.price)}</strong>
              <span>per kg · also in 250 g & 500 g</span>
            </div>
            <div className="fade-in" style={{ ["--d" as string]: "320ms" }}>
              <BuyBox slug={p.slug} inStock={p.inStock} />
            </div>
            <p className="fade-in" style={{ ["--d" as string]: "400ms", color: "var(--muted)", margin: 0 }}>
              {p.description}
            </p>
            <ul className="details fade-in" style={{ ["--d" as string]: "480ms" }}>
              <li>
                <span>Pack sizes</span>
                <span>250 g · 500 g · 1 kg</span>
              </li>
              <li>
                <span>Origin</span>
                <span>Sri Lanka</span>
              </li>
              <li>
                <span>Delivery</span>
                <span>Free in Negombo · Island-wide courier</span>
              </li>
              <li>
                <span>Payment</span>
                <span>Bank transfer</span>
              </li>
              <li>
                <span>Storage</span>
                <span>Airtight container, cool & dry</span>
              </li>
            </ul>
          </div>
        </div>

        <section style={{ paddingBottom: 110 }}>
          <div className="section-head">
            <div className="reveal">
              <span className="eyebrow">You may also like</span>
              <h2>More from the roastery</h2>
            </div>
          </div>
          <div className="grid">
            {more.map((x, i) => (
              <ProductCard key={x.slug} p={x} delay={i * 80} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
