import type { Metadata } from "next";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Kosár" };

export default function CartPage() {
  return (
    <div className="wrap pt-12 lg:pt-20">
      <h1 className="display-lg lowercase">kosár</h1>
      <CartView />
    </div>
  );
}
