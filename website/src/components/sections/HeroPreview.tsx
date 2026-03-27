
export default function HeroPreview() {
  return (
    <section className="pb-14">
      <div className="overflow-hidden rounded-2xl bg-[#111117]">
        <div className="relative aspect-[16/8.6] w-full">
          <video
            src="/capy.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />

        </div>
      </div>
    </section>
  );
}
