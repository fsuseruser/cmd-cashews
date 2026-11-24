"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/#how-to-order", label: "How to order" },
  { href: "/#our-story", label: "Our story" },
];

export function Header() {
  const { count, setOpen, bumpKey, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`header${scrolled ? " scrolled" : ""}`}>
      <div className="container header-inner">
        <Logo />
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button className="cart-btn" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} kg`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span className="label">Cart</span>
          <span key={bumpKey} className={`cart-count${bumpKey > 0 ? " bump" : ""}`}>
            {ready ? count : 0}
          </span>
        </button>
      </div>
    </header>
  );
}
