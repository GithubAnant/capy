import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | capy",
  description: "Privacy policy for capy.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">Privacy</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-7 text-foreground/75 sm:text-base">
          Last updated: March 25, 2026
        </p>

        <div className="mt-10 space-y-8 rounded-2xl border border-white/10 bg-white/3 p-6 sm:p-8">
          <section>
            <h2 className="text-lg font-semibold">Summary</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/85 sm:text-base">
              capy processes your project data locally on your device. We do not run user accounts, we do not require
              login, and we do not collect or store your repository content on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Data Processing</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/85 sm:text-base">
              All analysis and artifact generation are performed locally. Your files stay on your machine unless you
              explicitly export or share outputs yourself.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">No Authentication</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/85 sm:text-base">
              capy does not require sign-in, user registration, or account creation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">No Personal Data Collection</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/85 sm:text-base">
              We do not collect personal information, usage profiles, or repository source content from your local
              environment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Third-Party Sharing</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/85 sm:text-base">
              We do not sell, rent, or share your local project data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Contact</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/85 sm:text-base">
              For privacy questions, contact: anantsinghal@example.com
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
