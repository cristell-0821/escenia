'use client'

import Image from 'next/image'
import Link from 'next/link'

interface Group {
  id: string
  name: string
  city: string | null
  region: string | null
  cover_url: string | null
  slug: string
}

interface Props {
  groups: Group[]
}

export default function GroupsGrid({ groups }: Props) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[#554240] text-xl">No se encontraron agrupaciones</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {groups.map((group, index) => (
        <Link
          key={group.id}
          href={`/agrupaciones/${group.slug}`}
          className="group block"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-[#EEE7DB] mb-4">
            {group.cover_url ? (
              <Image
                src={group.cover_url}
                alt={group.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading={index < 3 ? 'eager' : 'lazy'} // ✅ Primera carga optimizada
                priority={index < 3} // ✅ Solo las primeras 3 son prioritarias
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#554240]/50">
                <span>Sin imagen</span>
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold text-[#1E1B14] group-hover:text-[#85332A] transition-colors">
            {group.name}
          </h3>
          <p className="text-[#554240] text-sm">
            {group.city}{group.region && `, ${group.region}`}
          </p>
        </Link>
      ))}
    </div>
  )
}