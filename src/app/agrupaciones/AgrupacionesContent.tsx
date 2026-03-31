// src/app/agrupaciones/AgrupacionesContent.tsx - CLIENT COMPONENT
'use client'

import { useState, useMemo } from 'react'
import FilterBar from '@/components/agrupaciones/FilterBar'
import GroupsGrid from '@/components/agrupaciones/GroupsGrid'

interface Group {
  id: string
  name: string
  city: string | null
  region: string | null
  cover_url: string | null
  slug: string
  description: string | null
}

interface Props {
  initialGroups: Group[]
}

export default function AgrupacionesContent({ initialGroups }: Props) {
  const [searchQuery, setSearchQuery] = useState('')

  // ✅ useMemo en lugar de useEffect + useState para filtrado
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return initialGroups
    
    const query = searchQuery.toLowerCase()
    return initialGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        g.description?.toLowerCase().includes(query) ||
        g.city?.toLowerCase().includes(query) ||
        g.region?.toLowerCase().includes(query)
    )
  }, [searchQuery, initialGroups])

  return (
    <main className="max-w-7xl mx-auto px-8 py-12 lg:py-24">
      {/* Hero & Editorial Intro */}
      <div className="mb-20 text-center max-w-3xl mx-auto">
        <span className="text-[#85332A] font-bold tracking-[0.3em] uppercase text-sm block mb-4">
          Directorio Cultural
        </span>
        <h2
          className="text-5xl md:text-7xl font-bold text-[#1E1B14] leading-tight mb-8"
          style={{ fontFamily: 'var(--font-newsreader)' }}
        >
          Nuestras Agrupaciones
        </h2>
        <div className="w-12 h-px bg-[#85332A]/30 mx-auto mb-8"></div>
        <p
          className="text-xl text-[#554240] leading-relaxed italic opacity-80"
          style={{ fontFamily: 'var(--font-newsreader)' }}
        >
          Un archivo vivo de los guardianes de nuestra herencia. Desde las profundidades de los Andes
          hasta el verdor de la Amazonía.
        </p>
      </div>

      {/* Search & Filter */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Grid - Ya no necesita isLoading porque los datos vienen del servidor */}
      <GroupsGrid groups={filteredGroups as any} />

      {/* Featured Quote */}
      <div className="mt-40 max-w-4xl mx-auto border-t border-[#DBC1BD]/20 pt-20">
        <div className="text-center">
          <h4
            className="text-4xl md:text-5xl font-light text-[#1E1B14] italic leading-snug mb-10"
            style={{ fontFamily: 'var(--font-newsreader)' }}
          >
            "La danza es el lenguaje oculto del alma, y en el Perú, nuestra alma canta a través del
            ritmo."
          </h4>
          <div className="inline-block border-t border-[#85332A]/40 pt-4">
            <p className="text-[10px] text-[#554240] uppercase tracking-[0.4em] font-bold">
              Victoria Santa Cruz
            </p>
            <p
              className="text-xs text-[#88726F] italic mt-1"
              style={{ fontFamily: 'var(--font-newsreader)' }}
            >
              Poeta y Coreógrafa Peruana
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}