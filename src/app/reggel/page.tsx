import type { Metadata } from "next";
import { RoutineLanding } from "@/components/landing/RoutineLanding";
import { routines } from "@/data/routines";

export const metadata: Metadata = {
  title: "Reggel – mono menthol drops",
  description: routines.classic.intro,
};

export default function MorningPage() {
  return <RoutineLanding variant="classic" />;
}
