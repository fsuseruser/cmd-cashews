import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container empty" style={{ padding: "120px 0 160px" }}>
      <span className="eyebrow">404</span>
      <h1 style={{ fontSize: "3rem", margin: "14px 0" }}>This page went nuts.</h1>
      <p>We couldn&apos;t find what you were looking for.</p>
      <Link href="/shop" className="btn">
        Browse cashews
      </Link>
    </div>
  );
}
