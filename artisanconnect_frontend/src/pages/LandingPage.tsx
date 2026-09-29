import { useEffect } from "react";
import {
  Hero,
  Categories,
  PopularServices,
  HowItWorks,
  FeaturedArtisans,
  Testimonials,
  Stats,
  CTA,
  DownloadApp,
} from "@/features/landing/components";

export function LandingPage() {
  useEffect(() => {
    if (window.location.hash) {
        const el = document.getElementById(window.location.hash.slice(1));
        if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
    }
  }, []);
  return (
    <>
      <Hero />
      <Categories />
      <PopularServices />
      <HowItWorks />
      <FeaturedArtisans />
      <Stats />
      <Testimonials />
      <CTA />
      <DownloadApp />
    </>
  );
}
