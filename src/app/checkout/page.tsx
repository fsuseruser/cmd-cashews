import type { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container">
      <header className="page-head" style={{ paddingBottom: 0 }}>
        <span className="eyebrow fade-in">Almost there</span>
        <h1 className="fade-in" style={{ ["--d" as string]: "100ms", marginTop: 14, fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}>
          Checkout
        </h1>
      </header>
      <CheckoutForm />
    </div>
  );
}
