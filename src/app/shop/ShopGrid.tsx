"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, type Category, type Product } from "@/lib/catalog";
import { lkr } from "@/lib/format";
import { ProductArt } from "@/components/ProductArt";
import { FromPrice, QuickAdd } from "@/components/AddToCart";

type Filter = "all" | Category;

export function ShopGrid({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const initial = (params.get("c") as Filter) || "all";
  const [filter, setFilter] = useState<Filter>(initial in CATEGORIES ? initial : "all");
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const c = (params.get("c") as Filter) || "all";
    setFilter(c in CATEGORIES ? c : "all");
  }, [params]);

  const list = useMemo(() => (filter === "all" ? products : products.filter((p) => p.category === filter)), [filter, products]);

  const choose = (f: Filter) => {
    setFilter(f);
    setAnimKey((k) => k + 1);
    router.replace(f === "all" ? "/shop" : `/shop?c=${f}`, { scroll: false });
  };

  return (
    <>
      <div className="filters fade-in" style={{ ["--d" as string]: "280ms" }} role="toolbar" aria-label="Filter by category">
        <button className="chip" aria-pressed={filter === "all"} onClick={() => choose("all")}>
          All ({products.length})
        </button>
        {(Object.keys(CATEGORIES) as Category[]).map((c) => (
          <button key={c} className="chip" aria-pressed={filter === c} onClick={() => choose(c)}>
            {CATEGORIES[c]} ({products.filter((p) => p.category === c).length})
          </button>
        ))}
      </div>
      <div className="grid" key={animKey}>
        {list.map((p, i) => (
          <article className="card fade-in" key={p.slug} style={{ ["--d" as string]: `${Math.min(i, 8) * 60}ms` }}>
            <div className="card-media">
              <ProductArt name={p.name} tone={p.tone} image={p.image} />
              {!p.inStock ? (
                <span className="card-tag out">Sold out</span>
              ) : p.featured ? (
                <span className="card-tag">Signature</span>
              ) : null}
              <QuickAdd slug={p.slug} inStock={p.inStock} />
            </div>
            <div className="card-body">
              <div>
                <h3>
                  <Link href={`/products/${p.slug}`} className="card-link">
                    {p.name}
                  </Link>
                </h3>
                <p>{p.short}</p>
              </div>
              <div className="price">
                {lkr(p.price)}
                <small>per kg</small>
                <FromPrice slug={p.slug} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
