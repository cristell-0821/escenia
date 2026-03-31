'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Tables } from '@/types/database.types'

interface GroupWithGallery extends Tables<'groups'> {
  gallery_items?: { url: string }[]
}

interface AgrupacionCardProps {
  group: GroupWithGallery
}

export default function AgrupacionCard({ group }: AgrupacionCardProps) {
  return (
    <article className="group flex flex-col">
      {/* Imagen */}
      <div className="aspect-[4/5] overflow-hidden bg-[#EEE7DB] mb-6">
        <Image
          src={group.gallery_items?.[1]?.url || group.avatar_url || '/img/agrupaciones/agrupacion.png'}
          alt={group.name}
          width={400}
          height={500}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-grow items-start">
        {/* Ubicación */}
        <span
          className="italic text-sm text-[#7D5700] mb-2 tracking-wide"
          style={{ fontFamily: 'var(--font-newsreader)' }}
        >
          {group.city}, {group.region}
        </span>

        {/* Nombre */}
        <h3
          className="text-3xl font-bold text-[#1E1B14] mb-6 leading-tight group-hover:text-[#85332A] transition-colors"
          style={{ fontFamily: 'var(--font-newsreader)' }}
        >
          {group.name}
        </h3>

        {/* Link */}
        <Link
          href={`/agrupaciones/${group.slug}`}
          className="mt-auto inline-flex items-center gap-2 font-bold text-[10px] uppercase tracking-[0.3em] text-[#85332A] border-b border-[#85332A]/20 pb-1 hover:border-[#85332A] transition-all"
        >
          Ver Perfil
          <ChevronRight size={14} />
        </Link>
      </div>
    </article>
  )
}