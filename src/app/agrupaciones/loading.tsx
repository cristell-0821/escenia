export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-8 py-12 lg:py-24">
      {/* Hero skeleton */}
      <div className="mb-20 text-center max-w-3xl mx-auto space-y-4">
        <div className="h-4 bg-[#DBC1BD]/30 w-32 mx-auto animate-pulse" />
        <div className="h-16 bg-[#DBC1BD]/30 w-full mx-auto animate-pulse" />
        <div className="h-px bg-[#DBC1BD]/30 w-12 mx-auto" />
        <div className="h-20 bg-[#DBC1BD]/30 w-full mx-auto animate-pulse" />
      </div>

      {/* Filter skeleton */}
      <div className="h-12 bg-[#DBC1BD]/30 w-full max-w-md mx-auto mb-12 animate-pulse rounded" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[4/5] bg-[#EEE7DB] animate-pulse rounded" />
            <div className="h-6 bg-[#DBC1BD]/30 w-3/4 animate-pulse" />
            <div className="h-4 bg-[#DBC1BD]/30 w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    </main>
  )
}