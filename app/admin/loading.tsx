export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-[2px] border border-[#f0f0f0] bg-white p-4">
            <div className="h-2 w-20 bg-[#f0f0f0]" />
            <div className="mt-4 h-6 w-24 bg-[#f0f0f0]" />
            <div className="mt-3 h-2 w-28 bg-[#f0f0f0]" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="animate-pulse rounded-[2px] border border-[#f0f0f0] bg-white p-4">
          <div className="h-3 w-40 bg-[#f0f0f0]" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 bg-[#f7f7f5]" />
            ))}
          </div>
        </div>
        <div className="animate-pulse rounded-[2px] border border-[#f0f0f0] bg-white p-4">
          <div className="h-3 w-28 bg-[#f0f0f0]" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 bg-[#f7f7f5]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
