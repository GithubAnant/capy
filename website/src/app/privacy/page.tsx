"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black">
      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-270 px-4 pb-20 pt-28 md:px-6">
        <p className="text-[0.78rem] text-[#858585]">{"// Privacy"}</p>
        <h1 className="font-display text-[1.85rem] font-medium leading-[1.04] text-[#F0F0F3] md:text-[3.15rem]">
          Privacy Policy
        </h1>
        <p className="mt-4 text-[0.95rem] text-[#858585]">
          Last updated: March 25, 2026
        </p>

        <div className="mt-10 space-y-8 rounded-xl border border-white/5 bg-[#0A0A09] p-6 md:p-8">
          <section>
            <h2 className="text-[1.1rem] font-medium text-[#F0F0F3]">Summary</h2>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-[#858585]">
              Capy processes your project data locally on your device. We do not run user accounts, we do not require
              login, and we do not collect or store your repository content on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-[1.1rem] font-medium text-[#F0F0F3]">Data Processing</h2>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-[#858585]">
              All analysis and artifact generation are performed locally. Your files stay on your machine unless you
              explicitly export or share outputs yourself.
            </p>
          </section>

          <section>
            <h2 className="text-[1.1rem] font-medium text-[#F0F0F3]">No Authentication</h2>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-[#858585]">
              Capy does not require sign-in, user registration, or account creation.
            </p>
          </section>

          <section>
            <h2 className="text-[1.1rem] font-medium text-[#F0F0F3]">No Personal Data Collection</h2>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-[#858585]">
              We do not collect personal information, usage profiles, or repository source content from your local
              environment.
            </p>
          </section>

          <section>
            <h2 className="text-[1.1rem] font-medium text-[#F0F0F3]">Third-Party Sharing</h2>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-[#858585]">
              We do not sell, rent, or share your local project data with third parties.
            </p>
          </section>
        </div>
      </main>

      <div className="mx-auto w-full max-w-270 px-4 pb-10 md:px-6">
        <Footer />
      </div>
    </div>
  );
}
