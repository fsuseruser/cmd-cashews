import Image from "next/image";
import Link from "next/link";
import { HERO_IMAGE } from "@/lib/catalog";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { SITE } from "@/lib/config";

export const revalidate = 60;

export default async function Home() {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const showcase = featured.length >= 4 ? featured : products.slice(0, 4);
  const years = new Date().getFullYear() - SITE.founded;

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow fade-in">Since 1996 · Negombo, Sri Lanka</span>
            <h1 className="fade-in" style={{ ["--d" as string]: "120ms" }}>
              Roasted in Negombo,
              <span className="italic">the way we always have.</span>
            </h1>
            <p className="lead fade-in" style={{ ["--d" as string]: "240ms" }}>
              Premium Sri Lankan cashews: devilled, burnt, garlic & pepper, ghee-fried and raw. Roasted in small batches, in 250 g, 500 g
              and 1 kg packs.
            </p>
            <div className="hero-actions fade-in" style={{ ["--d" as string]: "360ms" }}>
              <Link href="/shop" className="btn">
                Shop cashews
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </Link>
              <Link href="#how-to-order" className="btn btn-ghost">
                How ordering works
              </Link>
            </div>
            <div className="hero-meta fade-in" style={{ ["--d" as string]: "480ms" }}>
              <div>
                <strong>{years}+</strong>
                <span>Years roasting</span>
              </div>
              <div>
                <strong>{products.length}</strong>
                <span>Cashew varieties</span>
              </div>
              <div>
                <strong>Free</strong>
                <span>Delivery in Negombo</span>
              </div>
            </div>
          </div>

          <div className="hero-art fade-in" aria-hidden="true" style={{ ["--d" as string]: "200ms" }}>
            <div className="ring" />
            <div className="ring r2" />
            <div className="orbit">
              <span />
            </div>
            <div className="disc">
              <Image src={HERO_IMAGE} alt="Cashew apples with cashew nuts on the tree" fill priority unoptimized sizes="420px" style={{ objectFit: "cover", background: "#1F4D33" }} />
            </div>
            <div className="badge">
              <small>Signature</small>
              <b>Devilled Cashews</b>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <div key={k} style={{ display: "flex" }}>
              {["Devilled", "Burnt", "Garlic & Pepper", "Ghee-Fried", "Extra Spicy", "Salted", "Raw Whole", "Oven-Roasted"].map((t) => (
                <span key={t + k}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Signature range */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="reveal">
              <span className="eyebrow">The signature range</span>
              <h2>Our most-loved flavours</h2>
            </div>
            <Link href="/shop" className="link reveal">
              View all {products.length} cashews →
            </Link>
          </div>
          <div className="grid">
            {showcase.map((p, i) => (
              <ProductCard key={p.slug} p={p} delay={i * 90} />
            ))}
          </div>
        </div>
      </section>

      {/* How to order */}
      <section className="section section-green" id="how-to-order">
        <div className="container">
          <div className="section-head">
            <div className="reveal">
              <span className="eyebrow">How to order</span>
              <h2>Three simple steps</h2>
            </div>
            <p className="reveal" style={{ maxWidth: 380, margin: 0, color: "rgba(248,244,236,0.7)" }}>
              No card needed. Pay by bank transfer and confirm your order with us directly on WhatsApp.
            </p>
          </div>
          <div className="steps">
            <div className="step reveal">
              <h3>Fill your cart</h3>
              <p>Choose your cashews in 250 g, 500 g or 1 kg packs. Order 3 kg or more to unlock bulk savings.</p>
            </div>
            <div className="step reveal" style={{ ["--d" as string]: "120ms" }}>
              <h3>Bank transfer</h3>
              <p>Transfer the total to our Commercial Bank account, using your order number as the reference.</p>
            </div>
            <div className="step reveal" style={{ ["--d" as string]: "240ms" }}>
              <h3>Send on WhatsApp</h3>
              <p>Send your order and payment slip on WhatsApp. We roast, pack and deliver.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section" id="our-story">
        <div className="container story">
          <div className="story-mark reveal" aria-hidden="true">
            <div>
              <div className="num">{SITE.founded}</div>
              <small>Roasting since</small>
            </div>
          </div>
          <div className="reveal" style={{ ["--d" as string]: "120ms" }}>
            <span className="eyebrow">Our story</span>
            <h2 style={{ margin: "14px 0 20px" }}>
              Three decades of <span className="italic">Sri Lankan cashews</span>
            </h2>
            <p className="lead">
              CMD Cashews began in Negombo in 1996 with a simple idea: buy the best Sri Lankan cashews, roast them fresh and season them
              properly. Thirty years on, we still do it the same way, in small batches with real spices, curry leaves, garlic and ghee.
            </p>
            <div className="features">
              <div className="feature">
                <b>100% Sri Lankan</b>
                <span>Cashews grown on the island.</span>
              </div>
              <div className="feature">
                <b>Small-batch roasted</b>
                <span>Fresh, crunchy and evenly cooked.</span>
              </div>
              <div className="feature">
                <b>Real ingredients</b>
                <span>No artificial additives.</span>
              </div>
              <div className="feature">
                <b>Free in Negombo</b>
                <span>Island-wide courier available.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section style={{ paddingBottom: "clamp(70px, 10vw, 120px)" }}>
        <div className="container">
          <div className="band reveal">
            <div>
              <span className="eyebrow">Ready when you are</span>
              <h2 style={{ marginTop: 10 }}>Fresh cashews, delivered to your door.</h2>
            </div>
            <Link href="/shop" className="btn">
              Start your order
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
