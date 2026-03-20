import Image from "next/image";

export default function HeroPreview() {
  return (
    <section className="pb-20">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111117]">
        <div className="relative aspect-[16/7] w-full">
          <Image
            src="https://picsum.photos/1600/900?random=101"
            alt="capy interface preview"
            fill
            className="object-cover"
            priority
          />

          <div className="absolute inset-0 bg-black/36" />

          <div className="absolute inset-x-[11%] bottom-[10%] top-[18%] overflow-hidden rounded-2xl border border-white/15 bg-black/85">
            <div className="flex h-8 items-center justify-between border-b border-white/10 px-4 text-[11px] text-[#babcc8]">
              <span>Explorer</span>
              <span>capy</span>
              <span>Assistant</span>
            </div>
            <div className="grid h-[calc(100%-2rem)] grid-cols-[1.1fr_1fr]">
              <div className="border-r border-white/10 p-4 text-xs text-[#80828f]">
                <div className="space-y-1">
                  <p>{'import { useState } from "react"'}</p>
                  <p>{'import { capy } from "@/lib/capy"'}</p>
                  <p className="pt-2">function AuthForm() {'{'}</p>
                  <p>{'  const [email, setEmail] = useState("")'}</p>
                  <p>{'  const [password, setPassword] = useState("")'}</p>
                  <p className="pt-2">  return &lt;form /&gt;</p>
                  <p>{'}'}</p>
                </div>
              </div>
              <div className="p-4 text-xs text-[#9a9cab]">
                <p className="text-[#cfd1dc]">capy AI assistant</p>
                <p className="mt-2">Added secure auth flow with validation and onboarding hints.</p>
                <div className="mt-4 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-[#c8cad5]">
                  Apply changes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
