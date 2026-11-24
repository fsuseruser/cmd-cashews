import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE, WHATSAPP_NUMBER } from "@/lib/config";
import { getProducts } from "@/lib/products";
import { getPricing } from "@/lib/settings";
import { CartProvider } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/Reveal";

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "CMD Cashews | Premium Sri Lankan Cashews from Negombo, since 1996",
    template: "%s | CMD Cashews",
  },
  description: SITE.description,
  keywords: [
    "cashews Sri Lanka",
    "devilled cashews",
    "burnt cashews",
    "cashew nuts Negombo",
    "buy cashews online Sri Lanka",
    "kaju",
    "raw cashews 1kg",
    "ghee fried cashews",
  ],
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_LK",
    url: SITE.url,
    title: "CMD Cashews | Roasted in Negombo since 1996",
    description: SITE.description,
  },
  twitter: { card: "summary_large_image", title: "CMD Cashews", description: SITE.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#17402A",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [products, pricing] = await Promise.all([getProducts(), getPricing()]);
  const lite = products.map(({ slug, name, short, price, tone, image, inStock }) => ({
    slug,
    name,
    short,
    price,
    tone,
    image,
    inStock,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    foundingDate: String(SITE.founded),
    currenciesAccepted: "LKR",
    paymentAccepted: "Bank transfer",
    address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: "LK" },
    ...(WHATSAPP_NUMBER ? { telephone: `+${WHATSAPP_NUMBER}` } : {}),
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600;700&display=swap"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <CartProvider products={lite} pricing={pricing}>
          <a href="#main" className="sr-only">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
          <RevealObserver />
        </CartProvider>
      </body>
    </html>
  );
}
