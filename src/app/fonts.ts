import { Cormorant_Garamond, Outfit } from "next/font/google";

/** A csomagolás betűvilágát idéző geometrikus groteszk: címkék, felület. */
export const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

/** A kevés, halk kijelentés betűje. */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
