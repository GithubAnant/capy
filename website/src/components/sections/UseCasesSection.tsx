"use client";

import { useState } from "react";
import Image from "next/image";

const useCases = [
  {
    label: "Full-stack",
    title: "Full-stack development",
    description:
      "Build frontend and backend seamlessly. Capy understands your entire stack, from React components to database queries, and helps you ship faster with context-aware suggestions.",
    image: "https://picsum.photos/id/1/1200/600",
  },
  {
    label: "Debug & refactor",
    title: "Debugging and refactoring",
    description:
      "Find bugs instantly with precise error detection. Refactor confidently with AI that understands dependencies across your entire codebase. Zero broken imports.",
    image: "https://picsum.photos/id/10/1200/600",
  },
  {
    label: "API integration",
    title: "API integration",
    description:
      "Connect to any API in seconds. Capy generates type-safe clients, handles auth flows, and writes the boilerplate so you can focus on your product logic.",
    image: "https://picsum.photos/id/20/1200/600",
  },
  {
    label: "Testing & CI/CD",
    title: "Testing & CI/CD",
    description:
      "Generate comprehensive tests and CI pipelines automatically. Capy writes unit tests, integration tests, and deployment configs that match your project's patterns.",
    image: "https://picsum.photos/id/30/1200/600",
  },
];

export default function UseCasesSection() {
  const [active, setActive] = useState(0);
  const current = useCases[active];

  return (
    <section>
      <p className="mb-3 text-[0.78rem] text-[#858585]">{"// Use cases"}</p>
      <h2 className="font-display text-[1.57rem] font-normal leading-[1.1] text-[#F0F0F3] md:text-[2.35rem]">
        One tool. <span className="text-[#858585]">Every use case.</span>
      </h2>

      <div className="mt-5 inline-flex rounded-[1.1rem] bg-[#171615] p-1.5">
        {useCases.map((uc, i) => (
          <button
            key={uc.label}
            type="button"
            onClick={() => setActive(i)}
            className={`cursor-pointer rounded-[0.85rem] px-3 py-2 text-[0.8rem] font-medium md:px-4 ${
              i === active
                ? "bg-black text-[#F0F0F3]"
                : "text-[#858585] hover:text-[#F0F0F3]"
            }`}
          >
            {uc.label}
          </button>
        ))}
      </div>

      <div className="relative mt-6 overflow-hidden rounded-[1.3rem] border border-white/10" style={{ aspectRatio: "2/1" }}>
        <Image
          key={current.label}
          src={current.image}
          alt={current.title}
          fill
          sizes="(max-width: 1080px) 100vw, 1080px"
          className="object-cover"
        />
      </div>

      {/* Description */}
      <div className="mt-6 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-[0.78rem] text-[#858585]">{current.title}</p>
          <p className="max-w-4xl text-[0.95rem] leading-normal text-[#F0F0F3] md:text-[1.05rem]">
            {current.description}
          </p>
        </div>
      </div>
    </section>
  );
}
