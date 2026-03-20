export default function HeroSection() {
  return (
    <section className="pb-10 pt-24 text-center md:pb-14 md:pt-28">
      <h1 className="font-display text-[3.1rem] font-medium leading-[0.96] text-[#F0F0F3] md:text-[5.4rem]">
        Code with exact precision.
      </h1>
      <p className="mx-auto mt-7 max-w-3xl text-[1.35rem] leading-[1.35] text-[#6f6f76] md:text-[2.05rem]">
        The AI-native code editor that gets it exactly right.
        <br />
        No approximation. No bloat. Just perfect code, every time.
      </p>

      <div className="mt-8 flex items-center justify-center gap-7">
        <button
          type="button"
          className="rounded-2xl bg-[#F0F0F3] px-6 py-2.5 text-[1.5rem] font-medium text-[#0f0f14] transition-colors duration-300 hover:bg-white"
        >
          Download for macOs
        </button>
        <a href="#" className="text-[1.65rem] font-medium text-[#F0F0F3]">
          Discover product
        </a>
      </div>
    </section>
  );
}
