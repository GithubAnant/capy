export default function PreviewSkeleton() {
  return (
    <div className="h-[26rem] w-[34rem] overflow-hidden rounded-xl border border-[#2a2a29] bg-[#0d0d0d]">
      <div className="flex h-full flex-col">
        <div className="border-b border-[#2a2a29] bg-[#0a0a0a] px-4 py-3">
          <div className="h-4 w-24 rounded bg-[#1e1d1c] animate-pulse" />
        </div>
        <div className="flex-1 p-4">
          <div className="mb-4 flex gap-3">
            <div className="h-8 w-8 rounded bg-[#1e1d1c] animate-pulse" />
            <div className="h-8 w-8 rounded bg-[#1e1d1c] animate-pulse" />
            <div className="h-8 w-8 rounded bg-[#1e1d1c] animate-pulse" />
            <div className="h-8 w-8 rounded bg-[#1e1d1c] animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full rounded bg-[#1e1d1c] animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-[#1e1d1c] animate-pulse" />
            <div className="h-3 w-4/6 rounded bg-[#1e1d1c] animate-pulse" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-16 rounded bg-[#1e1d1c] animate-pulse" />
            <div className="h-16 rounded bg-[#1e1d1c] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
