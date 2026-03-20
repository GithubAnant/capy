import Image from "next/image";
import type { FeatureCardData } from "./data";

type FeatureCardProps = {
  feature: FeatureCardData;
  index: number;
};

export default function FeatureCard({ feature, index }: FeatureCardProps) {
  return (
    <article
      className="grid min-h-[60vh] items-center gap-5 rounded-[1.6rem] bg-[#131317] px-5 py-5 md:grid-cols-[1.45fr_1fr] md:px-7"
      style={{
        position: "sticky",
        top: `${4.7 + index * 1.1}rem`,
      }}
    >
      <div className="relative h-[32vh] overflow-hidden rounded-xl border border-white/12 md:h-full">
        <Image src={feature.image} alt={feature.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/28" />
      </div>

      <div className="max-w-[32rem]">
        <h3 className="font-display text-[1.55rem] leading-tight text-[#F0F0F3] md:text-[1.95rem]">{feature.title}</h3>
        <p className="mt-3 text-[0.92rem] leading-[1.45] text-[#7d7d83] md:text-[1.02rem]">{feature.copy}</p>
        <button
          type="button"
          className="mt-5 rounded-full bg-[#F0F0F3] px-4 py-1.5 text-[0.9rem] font-medium text-[#0f0f14] transition-colors duration-300 hover:bg-white"
        >
          {feature.cta}
        </button>
      </div>
    </article>
  );
}
