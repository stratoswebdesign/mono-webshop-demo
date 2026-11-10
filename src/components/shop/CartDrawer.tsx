"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/lib/commerce/cart-store";
import { BundleHint, CartLines, FreeShippingMeter, TotalsRows } from "./CartParts";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { totals } = useCart();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="kosarfiok-cim"
      onClose={onClose}
      onClick={(event) => {
        // Kattintás a háttérre (a párbeszédablakon kívülre) bezárja a fiókot.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 id="kosarfiok-cim" className="text-lg font-medium">
            Kosár{totals.itemCount > 0 && <span className="text-muted"> · {totals.itemCount} db</span>}
          </h2>
          <button type="button" onClick={onClose} className="-mr-2 h-11 px-2 text-[0.9375rem] font-medium">
            Bezárás
          </button>
        </div>

        {totals.itemCount === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-6 px-5">
            <p className="display-md lowercase">a kosarad még üres.</p>
            <Link href="/termekek" onClick={onClose} className="btn btn-primary">
              Termékek megtekintése
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              <FreeShippingMeter totals={totals} className="py-5" />
              <CartLines onNavigate={onClose} />
              <BundleHint className="mt-5" />
            </div>
            <div className="shrink-0 border-t border-line px-5 pb-5 pt-4">
              <TotalsRows totals={totals} />
              <div className="mt-5 grid gap-2.5">
                <Link href="/penztar" onClick={onClose} className="btn btn-primary">
                  Tovább a pénztárhoz
                </Link>
                <Link href="/kosar" onClick={onClose} className="btn btn-outline">
                  Kosár megtekintése
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
