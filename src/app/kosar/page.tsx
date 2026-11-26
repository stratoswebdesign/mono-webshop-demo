import type { Metadata } from "next";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Kosár" };

export default function CartPage() {
  return (
    <div className="wrap pt-32 lg:pt-40">
      <h1 className="statement lowercase">kosár</h1>
      <CartView />
    </div>
  );
}
