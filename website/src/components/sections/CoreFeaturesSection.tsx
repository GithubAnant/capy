import FeatureCard from "./features/FeatureCard";
import { featureCards } from "./features/data";

export default function CoreFeaturesSection() {
  return (
    <section id="features" className="relative pb-14 pt-4" style={{ minHeight: `${featureCards.length * 58}vh` }}>
      <p className="mb-3 text-[0.78rem] text-[#66666d]">{"// Core features"}</p>

      <div className="sticky top-14 h-[66vh] rounded-[1.3rem] border border-white/10 bg-[#141418] px-1.5 py-1.5">
        <div className="relative h-full">
          {featureCards.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
