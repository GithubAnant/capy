import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="flex items-center gap-1 font-display text-[8rem] font-normal leading-none text-[#F0F0F3] md:text-[12rem]">
        <span>4</span>
        <span className="inline-block animate-spin-slow">
          <Image
            src="/capy.svg"
            alt="0"
            width={100}
            height={100}
            className="h-[0.75em] w-[0.75em] md:h-[1em] md:w-[1em]"
          />
        </span>
        <span>4</span>
      </div>
      <p className="mt-6 text-[1.1rem] text-[#858585]">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-8 rounded-sm bg-[#F0F0F3] px-5 py-2 text-[0.9rem] font-medium transition-all duration-300 hover:bg-[#d4d4d4]"
        style={{ color: '#000000' }}
      >
        Go home
      </Link>
    </div>
  );
}