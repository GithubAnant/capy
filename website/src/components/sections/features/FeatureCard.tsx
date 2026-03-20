import Image from "next/image";
import type { FeatureCardData } from "./data";

type FeatureCardProps = {
  feature: FeatureCardData;
  index: number;
};

export default function FeatureCard({ feature, index }: FeatureCardProps) {
  return (
    <article
      className="grid min-h-[62vh] items-center gap-8 rounded-[2rem] bg-[#131317] px-7 py-7 md:grid-cols-[1.45fr_1fr] md:px-10"
      style={{
        position: "sticky",
        top: `${6 + index * 1.3}rem`,
      }}
    >
      <div className="relative h-[34vh] overflow-hidden rounded-2xl border border-white/12 md:h-full">
        <Image src={feature.image} alt={feature.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/28" />
      </div>

      <div className="max-w-[32rem]">
        <h3 className="font-display text-[2.7rem] leading-tight text-[#F0F0F3]">{feature.title}</h3>
        <p className="mt-4 text-[1.85rem] leading-[1.26] text-[#7d7d83]">{feature.copy}</p>
        <button
          type="button"
          className="mt-7 rounded-2xl bg-[#F0F0F3] px-5 py-2 text-[1.45rem] font-medium text-[#0f0f14] transition-colors duration-300 hover:bg-white"
        >
          {feature.cta}
        </button>
      </div>
    </article>
  );
}
