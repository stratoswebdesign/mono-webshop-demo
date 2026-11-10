import Link from "next/link";
import { EmbossLine } from "@/components/site/EmbossLine";

export default function NotFound() {
  return (
    <div className="wrap pt-16 lg:pt-28">
      <p className="eyebrow">404</p>
      <h1 className="display-xl mt-4 lowercase">ez az oldal nincs a helyén.</h1>
      <EmbossLine className="mt-10 h-24 w-full max-w-md" />
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          Főoldal
        </Link>
        <Link href="/termekek" className="btn btn-outline">
          Termékek
        </Link>
      </div>
    </div>
  );
}
