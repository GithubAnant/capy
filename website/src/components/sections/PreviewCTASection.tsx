import PreviewSkeleton from "@/components/ui/PreviewSkeleton";

export default function PreviewCTASection() {
  return (
    <section>
      <div className="flex flex-col gap-12 md:flex-row">
        <div className="md:w-85">
          <p className="mb-3 text-[0.78rem] text-[#858585]">
            {"// Preview"}
          </p>
          <h2 className="font-display text-[1.57rem] font-normal leading-[1.1] text-[#F0F0F3] md:text-[2.35rem]">
            See it{" "}
            <span className="text-[#858585]">in action.</span>
          </h2>
          <p className="mt-4 text-[0.85rem] leading-[1.6] text-[#858585]">
            See the preview page Capy generated for this site.
          </p>
          <div className="mt-8">
            <a
              href="/preview"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-fit items-center justify-between rounded-xl bg-[#171615] px-6 py-4 transition-colors duration-200 hover:bg-[#1e1d1c]"
            >
              <div>
                <p className="text-[1.3rem] font-medium text-[#F0F0F3]">
                  /preview
                </p>
              </div>
              <span className="ml-4 shrink-0 text-[1.4rem] text-[#858585] transition-transform duration-200 group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center md:justify-end">
          <PreviewSkeleton />
        </div>
      </div>
    </section>
  );
}
