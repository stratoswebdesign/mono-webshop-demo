import type { Metadata } from "next";
import Link from "next/link";
import { PendingNote } from "@/components/shop/PendingNote";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Kapcsolat",
  description: "Írj a mono csapatának.",
};

export default function ContactPage() {
  return (
    <div className="wrap pt-12 lg:pt-20">
      <div className="grid gap-x-14 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="display-lg lowercase">kapcsolat</h1>
          <p className="lead mt-6 max-w-md text-muted">
            Kérdésed van a termékekről vagy a rendelésről? Előbb érdemes megnézni a{" "}
            <Link href="/gyik" className="link-line text-fg">
              gyakori kérdéseket
            </Link>
            .
          </p>
          <div className="mt-10 space-y-6">
            <PendingNote field="contact" />
            <PendingNote field="company" />
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
