import type { Metadata } from "next";
import { CheckoutView } from "./CheckoutView";

export const metadata: Metadata = { title: "Pénztár" };

export default function CheckoutPage() {
  return (
    <div className="wrap pt-32 lg:pt-40">
      <p className="label">Demó pénztár</p>
      <h1 className="statement mt-3 lowercase">pénztár</h1>
      <CheckoutView />
    </div>
  );
}
