"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Is Capy really free?",
    answer:
      "Yes, Capy offers a generous free tier that includes core editing features and AI suggestions. Premium plans unlock advanced capabilities like team collaboration and priority support.",
  },
  {
    question: "How does Capy compare to Cursor or GitHub Copilot?",
    answer:
      "Capy is built from the ground up as an AI-native editor, not a plugin on top of an existing editor. This means deeper integration, more accurate suggestions, and a smoother workflow across your entire codebase.",
  },
  {
    question: "Is my code private?",
    answer:
      "Absolutely. Your code never leaves your machine unless you explicitly choose to use cloud features. We take privacy seriously and never train on your code.",
  },
  {
    question: "What languages does Capy support?",
    answer:
      "Capy supports all major programming languages including TypeScript, JavaScript, Python, Rust, Go, Java, C++, and many more. Language support is continuously expanding.",
  },
  {
    question: "Can I use Capy offline?",
    answer:
      "Yes. Core editing features work fully offline. AI-powered suggestions require an internet connection, but the editor itself is fully functional without one.",
  },
  {
    question: "How do I migrate from my current editor?",
    answer:
      "Capy supports one-click import of settings, keybindings, and extensions from VS Code, Vim, and other popular editors. Most developers are up and running in under a minute.",
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
