import FeatureCard from "./features/FeatureCard";
import { featureCards } from "./features/data";

export default function CoreFeaturesSection() {
  return (
    <section id="features" className="relative pb-16 pt-6" style={{ minHeight: `${featureCards.length * 64}vh` }}>
      <p className="mb-4 text-[0.92rem] text-[#66666d]">{"// Core features"}</p>

      <div className="sticky top-16 h-[70vh] rounded-[1.6rem] border border-white/10 bg-[#141418] px-2 py-2">
        <div className="relative h-full">
          {featureCards.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
