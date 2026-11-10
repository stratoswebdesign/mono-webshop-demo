import { Hero } from "@/components/home/Hero";
import { BundleOffer, Materials, StoryTeaser, TwoRoutines } from "@/components/home/Sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TwoRoutines />
      <Materials />
      <BundleOffer />
      <StoryTeaser />
    </>
  );
}
