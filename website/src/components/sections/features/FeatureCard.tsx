import Image from "next/image";
import type { FeatureCardData } from "./data";

type FeatureCardProps = {
  feature: FeatureCardData;
  index: number;
};

export default function FeatureCard({ feature, index }: FeatureCardProps) {
  return (
    <article
      className="grid min-h-[56vh] items-center gap-4 rounded-[1.3rem] bg-[#131317] px-4 py-4 md:grid-cols-[1.45fr_1fr] md:px-5"
      style={{
        position: "sticky",
        top: `${3.9 + index * 0.95}rem`,
      }}
    >
      <div className="relative h-[28vh] overflow-hidden rounded-lg border border-white/12 md:h-full">
        <Image src={feature.image} alt={feature.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/28" />
      </div>

      <div className="max-w-[32rem]">
        <h3 className="font-display text-[1.2rem] leading-tight text-[#F0F0F3] md:text-[1.45rem]">{feature.title}</h3>
        <p className="mt-2.5 text-[0.76rem] leading-[1.45] text-[#7d7d83] md:text-[0.88rem]">{feature.copy}</p>
        <button
          type="button"
          className="mt-4 rounded-full bg-[#F0F0F3] px-3.5 py-1 text-[0.76rem] font-medium text-[#0f0f14] transition-colors duration-300 hover:bg-white"
        >
          {feature.cta}
        </button>
      </div>
    </article>
  );
}
