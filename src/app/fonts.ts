import { Newsreader, Outfit } from "next/font/google";

/** A csomagolás betűvilágát idéző geometrikus groteszk: címsorok, felület. */
export const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

/** Olvasószöveg – a dobozba tett nyomtatott tájékoztató hangja. */
export const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});
