import { PricingFreeCard } from "@/components/PricingFreeCard";
import { PricingWhyFreeCard } from "@/components/PricingWhyFreeCard";

export default function PricingSection() {

  return (
    <section id="pricing" className="relative pb-20 pt-12">
      <p className="mb-4 text-[0.78rem] text-[#858585]">{"// Pricing"}</p>
      <h2 className="font-display text-[1.57rem] font-normal leading-[1.1] text-[#F0F0F3] md:text-[2.35rem]">
        Free. <span className="text-[#858585]">Forever.</span>
      </h2>
      <p className="mt-3 max-w-md text-[0.88rem] leading-normal text-[#858585]">
        No tiers. No upsells. Open source and locally hosted — your code never leaves your machine.
      </p>

      <div className="mt-10 grid w-full gap-4 md:grid-cols-[0.85fr_1fr]">
        <PricingFreeCard />
        <PricingWhyFreeCard />
      </div>
    </section>
  );
}
