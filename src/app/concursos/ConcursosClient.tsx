'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Tables } from '@/types/database.types'
import { ListFilter } from 'lucide-react'
import Link from 'next/link'
import { formatDateTimeDisplay } from '@/lib/date-utils'  // ✅ IMPORTAR

type Contest = Tables<'contests'>

interface Props {
  initialContests: Contest[]
}

export default function ConcursosClient({ initialContests }: Props) {
  const [contests] = useState<Contest[]>(initialContests)
  const [filterTab, setFilterTab] = useState('proximos')
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null)

  // ✅ NUEVO: Función de filtrado que NO usa new Date() para comparar
  const isFutureDate = (dateStr: string | null): boolean => {
    if (!dateStr) return false
    // Comparar strings directamente (formato ISO)
    return dateStr > new Date().toISOString()
  }

  const isPastDate = (dateStr: string | null): boolean => {
    if (!dateStr) return false
    return dateStr <= new Date().toISOString()
  }

  // Filtrar por estado
  const filteredContests = contests.filter((contest) => {
    if (filterTab === 'proximos') {
      return isFutureDate(contest.event_date)
    }
    if (filterTab === 'historial') {
      return isPastDate(contest.event_date)
    }
    return true
  })

  if (!contests.length) {
    return (
      <main className="min-h-screen pt-12">
        <div className="px-8 mb-24 max-w-7xl mx-auto text-center py-20">
          <h3
            className="text-3xl font-bold text-[#1E1B14] mb-4"
            style={{ fontFamily: 'var(--font-newsreader)' }}
          >
            No hay concursos disponibles
          </h3>
          <p className="text-[#554240]">Vuelve pronto para nuevas convocatorias</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-12">
      {/* Hero Section */}
      <section className="px-4 md:px-8 mb-16 md:mb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <span className="font-label uppercase tracking-[0.3em] text-[#85332A] mb-4 block text-xs font-bold">
              Patrimonio en Movimiento
            </span>
            <h2
              className="text-4xl md:text-8xl font-bold text-[#1E1B14] leading-tight tracking-tighter"
              style={{ fontFamily: 'var(--font-newsreader)' }}
            >
              Concursos <br /> <span className="italic font-normal">Nacionales</span>
            </h2>
          </div>
          <div className="md:col-span-4 pb-4">
            <p
              className="text-[#554240] leading-relaxed text-base md:text-lg border-l-2 border-[#DBC1BD] pl-4 md:pl-6 italic"
              style={{ fontFamily: 'var(--font-newsreader)' }}
            >
              La excelencia técnica y la pasión heredada se encuentran en el escenario. Descubre las
              competencias que definen nuestra identidad cultural.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-[#FAF3E7] py-8 mb-20">
        <div className="px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center justify-between">
          <div className="flex gap-6 md:gap-10 overflow-x-auto pb-2 w-full md:w-auto">
            {[
              { id: 'proximos', label: 'PRÓXIMOS' },
              { id: 'historial', label: 'HISTORIAL' },
              { id: 'todos', label: 'TODOS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`font-bold whitespace-nowrap transition-all ${
                  filterTab === tab.id
                    ? 'border-b-2 border-[#85332A] text-[#85332A]'
                    : 'text-[#554240] hover:text-[#85332A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[#554240]">
            <ListFilter size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">
              {filteredContests.length} concursos
            </span>
          </div>
        </div>
      </section>

      {/* Contest List */}
      <section className="px-8 max-w-7xl mx-auto space-y-32 pb-32">
        {filteredContests.map((contest, idx) => (
          <article
            key={contest.id}
            className={`grid grid-cols-1 md:grid-cols-12 gap-12 items-start ${
              idx % 2 === 1 ? 'md:[direction:rtl]' : ''
            }`}
          >
            {/* Imagen */}
            <div
              className={`md:col-span-5 ${
                idx % 2 === 1 ? 'md:[direction:ltr]' : 'order-2 md:order-1'
              }`}
            >
              <div className="relative group">
                <div
                  className={`absolute ${
                    idx % 2 === 0 ? '-top-6 -left-6' : '-bottom-6 -right-6'
                  } w-24 h-24 bg-[#FDBE49]/20 z-0`}
                />
                {contest.cover_url ? (
                  <Image
                    src={contest.cover_url}
                    alt={contest.title}
                    width={400}
                    height={500}
                    className="w-full aspect-[4/5] object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700 relative z-10"
                  />
                ) : (
                  <div className="w-full aspect-[4/5] bg-[#EEE7DB] relative z-10 flex items-center justify-center">
                    <span className="text-[#554240]/50">Sin imagen</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div
              className={`md:col-span-7 md:pt-12 ${
                idx % 2 === 1 ? 'md:[direction:ltr] order-1 md:order-2' : ''
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[#85332A] font-bold text-sm tracking-[0.2em] uppercase">
                  {contest.city || 'Por definir'}, {contest.region || 'Nacional'}
                </span>
                <div className="h-px w-12 bg-[#DBC1BD] opacity-30" />
                <span className="text-[#554240] font-medium text-sm">Concurso</span>
              </div>

              <h3
                className="text-3xl md:text-6xl font-extrabold text-[#1E1B14] mb-8 tracking-tight"
                style={{ fontFamily: 'var(--font-newsreader)' }}
              >
                {contest.title}
              </h3>

              <div className="space-y-10">
                {/* Fecha y Ubicación */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                  {contest.event_date && (
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#554240] mb-1">
                        FECHA Y HORA
                        </span>
                        <p className="text-lg md:text-xl font-bold text-[#1E1B14]">
                        {/* ✅ USAR LA FUNCIÓN CORRECTA */}
                        {formatDateTimeDisplay(contest.event_date)}
                        </p>
                    </div>
                    )}
                  {contest.location && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#554240] mb-1">
                        RECINTO
                      </span>
                      <p className="text-xl font-bold text-[#1E1B14]">{contest.location}</p>
                    </div>
                  )}
                </div>

                {/* Premio */}
                {contest.prize && (
                  <div className="bg-[#FAF3E7] p-4 md:p-6 border-l-4 border-[#85332A]">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-[#554240] mb-1">
                      PREMIO
                    </span>
                    <p className="text-xl md:text-2xl font-bold text-[#85332A]">{contest.prize}</p>
                  </div>
                )}

                {/* CTA */}
                <Link
                  href={`/concursos/${contest.id}`}
                  className="bg-[#85332A] text-white px-8 md:px-12 py-4 md:py-5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#A44A3F] transition-all active:scale-95 inline-block text-center"
                >
                  Más Información
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-24 bg-[#1E1B14] text-[#F2E9DC]">
        <div className="px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{ fontFamily: 'var(--font-newsreader)' }}
            >
              No te pierdas <br />
              ninguna función
            </h2>
            <p className="text-[#D1BCBA] text-lg opacity-80">
              Recibe las convocatorias de concursos y venta de entradas directamente en tu bandeja
              de entrada.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                className="w-full bg-transparent border-b border-[#D1BCBA]/30 py-4 focus:outline-none focus:border-[#FFDEAB] transition-colors text-lg md:text-xl font-headline italic placeholder:text-white/20"
                style={{ fontFamily: 'var(--font-newsreader)' }}
                placeholder="Tu correo electrónico"
                type="email"
              />
            </div>
            <button className="self-start mt-4 px-12 py-4 bg-[#85332A] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#A44A3F] transition-all">
              Suscribirme
            </button>
          </div>
        </div>
      </section>
      {selectedContest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-8 relative shadow-xl">
            
            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedContest(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-4 text-[#1E1B14]">
              Más información
            </h3>

            <p className="text-[#554240] mb-6">
              Para más información escribir a:
            </p>

            <div className="space-y-3">
              {selectedContest.contact_whatsapp && (
                <a
                  href={`https://wa.me/${selectedContest.contact_whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#85332A] font-bold hover:underline"
                >
                  WhatsApp: {selectedContest.contact_whatsapp}
                </a>
              )}

              {selectedContest.contact_email_public && (
                <a
                  href={`mailto:${selectedContest.contact_email_public}`}
                  className="block text-[#85332A] font-bold hover:underline"
                >
                  Email: {selectedContest.contact_email_public}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}