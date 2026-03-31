'use client'

import { Skeleton } from '../ui/skeleton'
import AgrupacionCard from './AgrupacionCard'
import type { Tables } from '@/types/database.types'

interface GroupsGridProps {
  groups: Tables<'groups'>[]
  isLoading: boolean
}

export default function GroupsGrid({ groups, isLoading }: GroupsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col">
            <Skeleton className="aspect-[4/5] mb-6 bg-[#EEE7DB]" />
            <Skeleton className="h-8 mb-4 w-3/4 bg-[#EEE7DB]" />
            <Skeleton className="h-12 mb-6 w-full bg-[#EEE7DB]" />
            <Skeleton className="h-4 w-1/2 bg-[#EEE7DB]" />
          </div>
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="py-20 text-center max-w-2xl mx-auto">
        <h4
          className="text-3xl text-[#1E1B14] mb-4"
          style={{ fontFamily: 'var(--font-newsreader)' }}
        >
          No encontramos agrupaciones
        </h4>
        <p className="text-[#554240] text-lg">
          Intenta ajustar tus filtros de búsqueda o región.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
      {groups.map((group) => (
        <AgrupacionCard key={group.id} group={group} />
      ))}
    </div>
  )
}