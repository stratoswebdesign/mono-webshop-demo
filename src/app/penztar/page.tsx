import type { Metadata } from "next";
import { CheckoutView } from "./CheckoutView";

export const metadata: Metadata = { title: "Pénztár" };

export default function CheckoutPage() {
  return (
    <div className="wrap pt-12 lg:pt-20">
      <p className="eyebrow">Demó pénztár</p>
      <h1 className="display-lg mt-3 lowercase">pénztár</h1>
      <CheckoutView />
    </div>
  );
}
