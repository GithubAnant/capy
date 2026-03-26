export default function HeroSection() {
  return (
    <section className="pb-7 pt-16 text-center md:pb-10 md:pt-20">
      <h1 className="font-display text-[1.85rem] font-normal leading-[1.04] text-[#F0F0F3] md:text-[3.15rem]">
        Code with exact precision.
      </h1>
      <p className="mx-auto mt-3 max-w-152 text-[0.85rem] leading-normal text-[#858585] md:text-[1.02rem]">
        MCP server that gives AI coding agents the context they need to build and update UI with precision.
      </p>

      <div className="mt-5 flex items-center justify-center gap-3.5">
        <a href="https://capy.anants.studio/docs" className="cursor-pointer rounded-sm bg-[#F0F0F3] px-3.5 py-1.5 text-[0.82rem] font-medium transition-all duration-300 hover:bg-[#d4d4d4]" style={{ color: '#000000' }}>
          Get started
        </a>
      </div>
    </section>
  );
}
