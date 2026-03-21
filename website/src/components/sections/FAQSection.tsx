"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Is Capy really free?",
    answer:
      "Yes, Capy is completely free. It includes all core tools and AI-powered coding assistance at no cost.",
  },
  {
    question: "Is my code private?",
    answer:
      "Absolutely. Capy runs entirely on your local machine. Your code never leaves your device.",
  },
  // {
  //   question: "What frameworks does Capy support?",
  //   answer:
  //     "Capy supports all major frameworks including React, Next.js, Vue, Svelte, Django, Flask, Express, FastAPI, and many more. Framework support is continuously expanding.",
  // },
  {
    question: "Which AI assistants work with Capy?",
    answer:
      "Capy works with any AI assistant that supports the MCP protocol, including Claude Desktop, Claude Code, and other MCP-compatible clients. Just point your client to the local Capy server and you're ready to go.",
  },
  {
    question: "How do I get started?",
    answer:
      "Check out our docs at /docs or scroll up to the Setup section for a quick walkthrough. The whole setup takes under a minute.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section>
      <div className="flex flex-col gap-10 md:flex-row md:gap-16">
        {/* Left side */}
        <div className="shrink-0 md:w-85">
          <p className="mb-3 text-[0.78rem] text-[#858585]">{"// FAQ"}</p>
          <h2 className="font-display text-[1.57rem] font-normal leading-[1.1] text-[#F0F0F3] md:text-[2.35rem]">
            Questions? <span className="text-[#858585]">We&apos;ve got answers.</span>
          </h2>
        </div>

        {/* Right side - accordion */}
        <div className="flex flex-1 flex-col gap-2.5">
          {faqs.map((faq, i) => (
            <div
              key={faq.question}
              className="rounded-xl bg-[#171615]"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-[0.95rem] font-medium text-[#F0F0F3]">
                  {faq.question}
                </span>
                <span
                  className={`ml-4 shrink-0 text-[1.2rem] text-[#858585] transition-transform duration-200 ${
                    open === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-all duration-200 ${
                  open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-[0.85rem] leading-[1.6] text-[#858585]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
