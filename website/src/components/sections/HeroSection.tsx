export default function HeroSection() {
  return (
    <section className="pb-8 pt-20 text-center md:pb-12 md:pt-24">
      <h1 className="font-display text-[2.2rem] font-medium leading-[1.03] text-[#F0F0F3] md:text-[3.85rem]">
        Code with exact precision.
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-[1.5] text-[#7b7b82] md:text-[1.18rem]">
        The AI-native code editor that gets it exactly right.
        <br />
        No approximation. No bloat. Just perfect code, every time.
      </p>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          className="rounded-full bg-[#F0F0F3] px-4 py-1.5 text-[0.92rem] font-medium text-[#0f0f14] transition-colors duration-300 hover:bg-white"
        >
          Download for macOs
        </button>
        <a href="#" className="text-[0.92rem] font-medium text-[#F0F0F3]">
          Discover product
        </a>
      </div>
    </section>
  );
}
