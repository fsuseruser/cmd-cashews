import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { lkr } from "@/lib/format";
import { ProductArt } from "./ProductArt";
import { FromPrice, QuickAdd } from "./AddToCart";

export function ProductCard({ p, delay = 0 }: { p: Product; delay?: number }) {
  return (
    <article className="card reveal" style={{ ["--d" as string]: `${delay}ms` }}>
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
  );
}
