import Navbar from "@/components/layout/Navbar";

export default function DocsPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black">
      <Navbar />

      <main className="relative z-10 mx-auto flex w-full max-w-270 flex-col px-4 pb-20 pt-28 md:px-6">
        <p className="mb-3 text-[0.78rem] text-[#858585]">{"// Documentation"}</p>
        <h1 className="font-display text-[1.85rem] font-medium leading-[1.04] text-[#F0F0F3] md:text-[3.15rem]">
          Docs
        </h1>
        <p className="mt-4 text-[0.95rem] leading-normal text-[#858585]">
          Documentation is coming soon. Check back later.
        </p>
      </main>
    </div>
  );
}
