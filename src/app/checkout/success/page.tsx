import type { Metadata } from "next";
import { Suspense } from "react";
import { SuccessView } from "./SuccessView";

export const metadata: Metadata = {
  title: "Order placed",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <div className="container">
      <Suspense>
        <SuccessView />
      </Suspense>
    </div>
  );
}
