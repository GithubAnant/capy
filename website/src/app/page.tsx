"use client";

import HeroSection from "@/components/sections/HeroSection";
import HeroPreview from "@/components/sections/HeroPreview";
import PreviewCTASection from "@/components/sections/PreviewCTASection";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black">
      <main className="relative z-10 mx-auto flex w-full max-w-270 flex-col gap-28 px-4 pb-20 pt-16 md:px-6">
        <HeroSection />
        <HeroPreview />
        <PreviewCTASection />
      </main>
    </div>
  );
}
