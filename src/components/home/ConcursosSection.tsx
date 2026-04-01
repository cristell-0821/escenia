import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

// Helper para formatear fecha (mismo que en ConcursosClient)
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Fecha por definir'
  
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]
  const month = monthNames[date.getMonth()]
  
  return `${day} de ${month}`
}

export default async function ConcursosSection() {
  const supabase = await createClient()
  
  const { data: contests } = await supabase
    .from('contests')
    .select('*')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString()) // Solo futuros
    .order('event_date', { ascending: true })
    .limit(3)

  const mainContest = contests?.[0]
  const sideContests = contests?.slice(1, 3) || []

  // Si no hay concursos, mostrar mensaje o sección vacía
  if (!contests || contests.length === 0) {
    return (
      <section className="py-20 md:py-32 bg-[#FAF3E7] px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-[56px] text-[#1E1B14]" style={{ fontFamily: 'var(--font-newsreader)' }}>
            Próximos Encuentros
          </h2>
          <p className="text-[#554240] mt-4">No hay eventos programados próximamente</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 md:py-32 bg-[#FAF3E7] px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
          <div className="space-y-4">
            <span className="text-[#85332A] font-bold tracking-[0.3em] uppercase text-sm">
              Cartelera Cultural
            </span>
            <h2
              className="text-3xl md:text-[56px] leading-tight text-[#1E1B14]"
              style={{ fontFamily: 'var(--font-newsreader)' }}
            >
              Próximos Encuentros
            </h2>
          </div>

          <Link
            href="/concursos"
            className="font-bold text-[#85332A] border-b border-[#85332A]/30 hover:border-[#85332A] transition pb-1 text-sm md:text-base"
          >
            Ver todos los eventos
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 md:h-[700px]">

          {/* CARD GRANDE - Primer concurso */}
          {mainContest && (
            <div className="md:col-span-2 relative group overflow-hidden bg-[#EEE7DB] min-h-[300px] md:min-h-0">
              {mainContest.cover_url ? (
                <Image
                  src={mainContest.cover_url}
                  alt={mainContest.title}
                  sizes="(max-width: 768px) 100vw, 66vw"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-[#85332A]/10 flex items-center justify-center">
                  <span className="text-[#85332A]/50 text-lg">Sin imagen</span>
                </div>
              )}

              {/* overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* contenido */}
              <div className="hidden md:block absolute bottom-10 left-10 right-10 space-y-4 text-white">
                <span className="bg-[#85332A] px-4 py-1 text-xs uppercase tracking-widest font-bold">
                  {mainContest.location || 'Próximamente'}
                </span>

                <h4
                  className="text-4xl leading-tight"
                  style={{ fontFamily: 'var(--font-newsreader)' }}
                >
                  {mainContest.title}
                </h4>

                <p className="text-sm text-white/80 max-w-lg">
                  {mainContest.description?.slice(0, 120) || 'Concurso cultural'}...
                </p>

                {mainContest.event_date && (
                  <p className="text-sm font-bold text-[#FDBE49]">
                    {formatDate(mainContest.event_date)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* COLUMNA DERECHA - Concursos 2 y 3 */}
          <div className="flex flex-col gap-6 md:gap-8">
            {sideContests.map((contest) => (
              <div key={contest.id} className="flex-1 relative group overflow-hidden bg-[#EEE7DB] min-h-[180px]">
                {contest.cover_url ? (
                  <Image
                    src={contest.cover_url}
                    alt={contest.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#85332A]/10 flex items-center justify-center">
                    <span className="text-[#85332A]/50">Sin imagen</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="hidden md:block absolute bottom-6 left-6 right-6 text-white">
                  <h5
                    className="text-2xl"
                    style={{ fontFamily: 'var(--font-newsreader)' }}
                  >
                    {contest.title}
                  </h5>
                  <p className="text-xs uppercase tracking-wider text-white/70">
                    {contest.city || 'Lima'} • {formatDate(contest.event_date)}
                  </p>
                </div>
              </div>
            ))}

            {/* Si hay menos de 2 concursos secundarios, rellenar con placeholders */}
            {sideContests.length < 2 && (
              <div className="flex-1 relative overflow-hidden bg-[#DBC1BD]/30 flex items-center justify-center">
                <p className="text-[#554240]/50 text-center px-8">
                  Más eventos próximamente
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}