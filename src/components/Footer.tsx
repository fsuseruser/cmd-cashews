import Link from "next/link";
import { Logo } from "./Logo";
import { BANK, SITE, WHATSAPP_NUMBER } from "@/lib/config";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo light />
            <p style={{ maxWidth: 300, marginTop: 20 }}>
              Sri Lankan cashews, roasted in small batches in Negombo since {SITE.founded}.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link href="/shop">All cashews</Link></li>
              <li><Link href="/shop?c=roasted">Roasted & flavoured</Link></li>
              <li><Link href="/shop?c=raw">Raw cashews</Link></li>
              <li><Link href="/shop?c=pieces">Pieces</Link></li>
            </ul>
          </div>
          <div>
            <h4>Ordering</h4>
            <ul>
              <li><Link href="/#how-to-order">How to order</Link></li>
              <li>Free delivery in Negombo</li>
              <li>Island-wide courier</li>
              <li>Bank transfer only</li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>{SITE.city}, {SITE.country}</li>
              {WHATSAPP_NUMBER && (
                <li>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp +{WHATSAPP_NUMBER}
                  </a>
                </li>
              )}
              <li>{BANK.bank}, {BANK.branch}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} CMD Cashews. All rights reserved.</span>
          <span>Roasted with care in Negombo, Sri Lanka</span>
        </div>
      </div>
    </footer>
  );
}
