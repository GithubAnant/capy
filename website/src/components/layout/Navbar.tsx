const navItems = ["Features", "Use cases", "Testimonials", "Pricing", "FAQ"];

export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-40 w-full bg-black/95">
      <div className="mx-auto flex h-14 w-full max-w-[1080px] items-center justify-between px-4 md:px-6">
        <a href="#" className="text-[1.45rem] font-medium leading-none text-[#F0F0F3] md:text-[1.6rem]">
          capy
        </a>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-[0.82rem] font-normal text-[#858585] transition-colors duration-300 hover:text-[#F0F0F3]"
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          className="rounded-full bg-[#F0F0F3] px-3.5 py-1.5 text-[0.8rem] font-medium text-[#0b0b0e] transition-colors duration-300 hover:bg-white"
          type="button"
        >
          Get Started
        </button>
      </div>
    </header>
  );
}
