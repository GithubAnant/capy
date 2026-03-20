"use client";

import Navbar from "@/components/layout/Navbar";
import CoreFeaturesSection from "@/components/sections/CoreFeaturesSection";
import HeroSection from "@/components/sections/HeroSection";
import HeroPreview from "@/components/sections/HeroPreview";
import TrustedBySection from "@/components/sections/TrustedBySection";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black">

      <Navbar />

      <main className="relative z-10 mx-auto flex w-full max-w-[1260px] flex-col px-6 pb-28 pt-24 md:px-10">
        <HeroSection />
        <HeroPreview />
        <TrustedBySection />
        <CoreFeaturesSection />
      </main>
    </div>
  );
}
