"use client";

import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import HeroPreview from "@/components/sections/HeroPreview";
import PricingSection from "@/components/sections/PricingSection";
import FAQSection from "@/components/sections/FAQSection";
import Footer from "@/components/layout/Footer";
import FeaturesSection from "@/components/sections/FeaturesSection";
import SetupSection from "@/components/sections/SetupSection";
import PreviewCTASection from "@/components/sections/PreviewCTASection";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black">

      <Navbar />
      

      <main className="relative z-10 mx-auto flex w-full max-w-270 flex-col gap-28 px-4 pb-20 pt-16 md:px-6">
        <HeroSection />
        <HeroPreview />
        <FeaturesSection />
        <SetupSection />
        <PreviewCTASection />
        <PricingSection />
        <FAQSection />
      </main>
      

      <Footer />
    </div>
  );
}
