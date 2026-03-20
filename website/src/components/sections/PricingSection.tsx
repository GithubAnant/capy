export default function PricingSection() {
  const features = [
    "Unlimited everything",
    "Open-source",
    "Full codebase context",
    "Runs 100% locally",
    "No telemetry or tracking",
    "Community-driven development",
  ];

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
        <div className="rounded-[1.3rem] bg-[#171615] px-7 py-7 md:px-8 md:py-8">
          <p className="text-[0.85rem] font-medium text-[#858585]">Free</p>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-[3.2rem] leading-none text-[#F0F0F3]">$0</span>
            <span className="text-[0.85rem] text-[#858585]">/lifetime</span>
          </div>

          <p className="mt-3 text-[0.82rem] leading-[1.45] text-[#858585]">
            Open source. Locally hosted. All features included, no strings attached.
          </p>

          <button
            type="button"
            className="mt-5 w-full rounded-full border border-white/30 bg-transparent py-2 text-[0.82rem] font-medium text-[#F0F0F3] hover:border-white hover:text-white"
          >
            Get started
          </button>

          <div className="mt-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[0.75rem] text-[#858585]">Features</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <ul className="mt-5 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[0.82rem] text-[#858585]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.4" />
                  <path d="M5 8.5L7 10.5L11 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.3rem] bg-[#171615] px-7 py-7 md:px-8 md:py-8">
          <p className="text-[0.78rem] text-[#858585]">Why free forever</p>
          <h3 className="mt-2 font-display text-[1.6rem] leading-[1.15] text-[#F0F0F3]">All local. All free. All yours.</h3>

          <div className="mt-5 space-y-3 text-[0.82rem] leading-normal text-[#858585]">
            <p>Runs on your machine. Your code and prompts stay local.</p>
            <p>No subscriptions, no metered limits, no paywalls later.</p>
            <p>Every feature is unlocked from day one.</p>
          </div>

          <div className="mt-7 rounded-[0.9rem] bg-black/35 px-4 py-4">
            <p className="text-[0.74rem] uppercase tracking-[0.08em] text-[#858585]">Included</p>
            <ul className="mt-3 space-y-2 text-[0.82rem] text-[#F0F0F3]">
              <li>Unlimited projects</li>
              <li>Unlimited prompts</li>
              <li>Unlimited local usage</li>
            </ul>
          </div>

          <div className="mt-6">
            <p className="text-[0.82rem] leading-[1.5] text-[#858585]">
              No catch. If Capy helps your workflow, a GitHub star or optional sponsor keeps it sustainable.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <a
                href="https://github.com/GithubAnant/toolss"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-transparent px-3.5 py-2 text-[0.8rem] font-medium text-[#F0F0F3] hover:border-white/30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                Star on GitHub
              </a>
              <a
                href="https://github.com/sponsors/GithubAnant"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/8 px-3.5 py-2 text-[0.8rem] font-medium text-[#858585] hover:bg-white/12 hover:text-[#F0F0F3]"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.565 20.565 0 008 13.393a20.561 20.561 0 003.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 01-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5z" /></svg>
                Optional sponsor
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
