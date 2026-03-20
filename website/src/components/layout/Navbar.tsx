const navItems = ["Features", "Use cases", "Testimonials", "Pricing", "FAQ"];

export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-40 w-full bg-black/95">
      <div className="mx-auto flex h-24 w-full max-w-[1260px] items-center justify-between px-6 md:px-10">
        <a href="#" className="text-4xl font-medium text-[#F0F0F3] md:text-[2.65rem]">
          capy
        </a>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-[1.95rem] font-normal text-[#858585] transition-colors duration-300 hover:text-[#F0F0F3]"
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          className="rounded-2xl bg-[#F0F0F3] px-6 py-2.5 text-[1.95rem] font-medium text-[#0b0b0e] transition-colors duration-300 hover:bg-white"
          type="button"
        >
          Get Started
        </button>
      </div>
    </header>
  );
}
