"use client";

import Link from "next/link";

const usecases = [
  {
    id: "demo-app",
    title: "Demo App",
    description: "A sample application to demonstrate Capy's capabilities",
    videoUrl: "https://pub-07e87a0eaff04f1ba3ae4f4a1dfbe59e.r2.dev/demo.mp4",
  },
  {
    id: "saas-dashboard",
    title: "SaaS Dashboard",
    description: "Modern SaaS analytics dashboard with charts and metrics",
    videoUrl: "https://pub-07e87a0eaff04f1ba3ae4f4a1dfbe59e.r2.dev/saas.mp4",
  },
  {
    id: "ecommerce-store",
    title: "E-commerce Store",
    description: "Full-featured online store with cart and checkout",
    videoUrl: "https://pub-07e87a0eaff04f1ba3ae4f4a1dfbe59e.r2.dev/ecommerce.mp4",
  },
  {
    id: "social-platform",
    title: "Social Platform",
    description: "Social media app with feeds, posts, and profiles",
    videoUrl: "https://pub-07e87a0eaff04f1ba3ae4f4a1dfbe59e.r2.dev/social.mp4",
  },
  {
    id: "todo-app",
    title: "Todo App",
    description: "Task management application with boards and lists",
    videoUrl: "https://pub-07e87a0eaff04f1ba3ae4f4a1dfbe59e.r2.dev/todo.mp4",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    description: "Personal portfolio website with projects and blog",
    videoUrl: "https://pub-07e87a0eaff04f1ba3ae4f4a1dfbe59e.r2.dev/portfolio.mp4",
  },
];

export default function UsecasesPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#070a10]">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-[0.9rem] font-medium text-[#f0f0f3] hover:text-[#858585]">
          ← Back
        </Link>
        <a 
          href="https://capy.anants.studio/docs" 
          className="text-[0.8rem] text-[#858585] hover:text-[#f0f0f3]"
        >
          Documentation
        </a>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <header className="mb-16 text-center">
          <h1 className="font-display text-[2.5rem] font-normal text-[#f0f0f3] md:text-[3.5rem]">
            Use Cases
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[1rem] text-[#858585]">
            Explore apps built with Capy. Click any preview to see how AI agents build and update UI with precision.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {usecases.map((usecase) => (
            <a
              key={usecase.id}
              href={`/preview?app=${usecase.id}`}
              className="group block overflow-hidden rounded-lg border border-[rgba(240,240,243,0.14)] bg-[#101620] transition-all duration-300 hover:border-[rgba(240,240,243,0.3)]"
            >
              <div className="aspect-video bg-[#070a10]">
                <video
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  onMouseOver={(e) => e.currentTarget.play()}
                  onMouseOut={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                >
                  <source src={usecase.videoUrl} type="video/mp4" />
                </video>
              </div>
              <div className="p-5">
                <h3 className="font-display text-[1.1rem] text-[#f0f0f3]">
                  {usecase.title}
                </h3>
                <p className="mt-2 text-[0.85rem] text-[#858585]">
                  {usecase.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}