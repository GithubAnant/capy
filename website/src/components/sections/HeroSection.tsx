export default function HeroSection() {
  return (
    <section className="pb-7 pt-16 text-center md:pb-10 md:pt-20">
      <h1 className="font-display text-[1.85rem] font-normal leading-[1.04] text-[#F0F0F3] md:text-[3.15rem]">
        Code with exact precision.
      </h1>
      <p className="mx-auto mt-3 max-w-[38rem] text-[0.85rem] leading-[1.5] text-[#7b7b82] md:text-[1.02rem]">
        The AI-native code editor that gets it exactly right.
        <br />
        No approximation. No bloat. Just perfect code, every time.
      </p>

      <div className="mt-5 flex items-center justify-center gap-3.5">
        <button
          type="button"
          className="cursor-pointer rounded-[4px] bg-[#F0F0F3] px-3.5 py-1.5 text-[0.82rem] font-medium text-[#0f0f14] transition-all duration-300 hover:bg-[#d4d4d4]"
        >
          Download for macOS
        </button>
        <a href="#" className="rounded-[4px] px-3.5 py-1.5 text-[0.82rem] font-medium text-[#F0F0F3] transition-all duration-300 hover:bg-[#3a3a3a] hover:text-white">
          Discover product
        </a>
      </div>
    </section>
  );
}
