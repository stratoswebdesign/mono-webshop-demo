import type { Metadata } from "next";
import { ConfirmationView } from "./ConfirmationView";

export const metadata: Metadata = { title: "Demó rendelés visszaigazolása" };

export default function ConfirmationPage() {
  return (
    <div className="wrap pt-32 lg:pt-40">
      <ConfirmationView />
    </div>
  );
}
