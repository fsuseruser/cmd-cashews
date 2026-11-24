import Link from "next/link";
import { CashewIcon } from "./Cashew";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="logo" aria-label="CMD Cashews, home">
      <CashewIcon size={26} color={light ? "#D2B07A" : "#B8935A"} />
      <span>
        <span className="logo-word" style={{ display: "block" }}>CMD</span>
        <span className="logo-sub" style={{ display: "block" }}>Cashews · 1996</span>
      </span>
    </Link>
  );
}
