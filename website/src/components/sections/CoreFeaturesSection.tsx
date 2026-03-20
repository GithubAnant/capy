import FeatureCard from "./features/FeatureCard";
import { featureCards } from "./features/data";

export default function CoreFeaturesSection() {
  return (
    <section id="features" className="relative pb-20 pt-8" style={{ minHeight: `${featureCards.length * 70}vh` }}>
      <p className="mb-7 text-[1.95rem] text-[#66666d]">{"// Core features"}</p>

      <div className="sticky top-24 h-[72vh] rounded-[2rem] border border-white/10 bg-[#141418] px-2 py-2">
        <div className="relative h-full">
          {featureCards.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
