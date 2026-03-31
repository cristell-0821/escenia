'use client'

interface FilterBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
}: FilterBarProps) {
  return (
    <section className="mb-20 max-w-5xl mx-auto">
      <div className="flex flex-col gap-10">
        {/* Search Input */}
        <div className="relative max-w-2xl mx-auto w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar agrupación..."
            className="w-full bg-transparent border-b border-[#DBC1BD]/40 focus:border-[#85332A] outline-none py-4 text-2xl placeholder:text-[#DBC1BD]/50 transition-all text-center"
            style={{ fontFamily: 'var(--font-newsreader)' }}
          />
        </div>
      </div>
    </section>
  )
}