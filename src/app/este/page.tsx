import type { Metadata } from "next";
import { RoutineLanding } from "@/components/landing/RoutineLanding";
import { routines } from "@/data/routines";

export const metadata: Metadata = {
  title: "Este – mono sleep",
  description: routines.sleep.intro,
};

export default function EveningPage() {
  return <RoutineLanding variant="sleep" />;
}
