import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trophy, Users, Eye, Edit2, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'
import { deleteContest } from '@/lib/actions/concursos-privados'

export default async function MisConcursosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'group_admin' || !membership.group_id) {
    redirect('/dashboard') 
  }

  // Obtener concursos creados por esta agrupación
  const { data: concursos } = await supabase
    .from('contests')
    .select(`
      id,
      title,
      status,
      type,
      event_date,
      created_at,
      requires_approval,
      _count:contest_registrations(count)
    `)
    .eq('organizer_group_id', membership.group_id)
    .eq('type', 'private')
    .order('created_at', { ascending: false })

  // Formatear conteos
  const concursosConStats = concursos?.map(c => ({
    ...c,
    totalInscripciones: c._count?.[0]?.count || 0
  })) || []

  const stats = {
    total: concursosConStats.length,
    publicados: concursosConStats.filter(c => c.status === 'published').length,
    borradores: concursosConStats.filter(c => c.status === 'draft').length,
    cerrados: concursosConStats.filter(c => c.status === 'closed').length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-[#1e1b14]">Mis Concursos</h1>
          <p className="text-[#554240] mt-2">
            Crea y gestiona tus propios eventos y festivales
          </p>
        </div>

        <Link
          href="/dashboard/mi-agrupacion/concursos/nuevo"
          className="bg-[#85332a] text-white px-6 py-3 font-bold tracking-widest uppercase text-sm flex items-center gap-2 hover:bg-[#a44a3f] transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          Crear Concurso
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total" count={stats.total} color="brown" />
        <StatCard label="Publicados" count={stats.publicados} color="green" />
        <StatCard label="Borradores" count={stats.borradores} color="yellow" />
        <StatCard label="Cerrados" count={stats.cerrados} color="gray" />
      </div>

      {/* Lista de concursos */}
      <div className="bg-white border border-[#dbc1bd]/30">
        <div className="p-6 border-b border-[#dbc1bd]/30">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#85332a]" />
            Tus Eventos
          </h2>
        </div>

        {!concursosConStats.length ? (
          <div className="p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-[#85332a]/20" />
            <p className="text-[#554240] mb-4">Aún no has creado ningún concurso</p>
            <Link 
              href="/dashboard/mi-agrupacion/concursos/nuevo"
              className="text-[#85332a] font-bold underline"
            >
              Crear tu primer concurso
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#dbc1bd]/30">
            {concursosConStats.map((concurso) => (
              <div key={concurso.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-20 bg-[#85332a]/10 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-[#85332a]/40" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-[#1e1b14]">{concurso.title}</h3>
                      <StatusBadge status={concurso.status} />
                    </div>
                    
                    <p className="text-sm text-[#554240]">
                      {concurso.event_date 
                        ? new Date(concurso.event_date).toLocaleDateString('es-PE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'Fecha por definir'
                      }
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-[#554240]">
                        <Users className="w-4 h-4" />
                        {concurso.totalInscripciones} inscripciones
                      </span>
                      
                      {concurso.requires_approval && (
                        <span className="text-yellow-600 text-xs font-bold uppercase">
                          Requiere aprobación
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Ver inscripciones */}
                  <Link
                    href={`/dashboard/mi-agrupacion/concursos/${concurso.id}/inscripciones`}
                    className="p-2 text-[#85332a] hover:bg-[#85332a]/10 transition-colors"
                    title="Ver inscripciones"
                  >
                    <Users className="w-5 h-5" />
                  </Link>

                  {/* Editar */}
                  {concurso.status === 'draft' && (
                    <Link
                      href={`/dashboard/mi-agrupacion/concursos/${concurso.id}/editar`}
                      className="p-2 text-[#554240] hover:text-[#85332a] hover:bg-[#85332a]/10 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                  )}

                  {/* Ver público */}
                  <Link
                    href={`/concursos/${concurso.id}`}
                    target="_blank"
                    className="p-2 text-[#554240] hover:text-[#85332a] hover:bg-[#85332a]/10 transition-colors"
                    title="Ver público"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>

                  {/* Eliminar (solo borradores) */}
                  {concurso.status === 'draft' && (
                    <form action={deleteContest.bind(null, concurso.id)}>
                      <button 
                        type="submit"
                        className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, count, color }: { label: string, count: number, color: string }) {
  const colors: Record<string, string> = {
    brown: 'bg-[#85332a]/10 text-[#85332a]',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className={`p-6 ${colors[color]}`}>
      <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{count}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string, className: string }> = {
    draft: { text: 'Borrador', className: 'bg-yellow-100 text-yellow-800' },
    published: { text: 'Publicado', className: 'bg-green-100 text-green-800' },
    closed: { text: 'Cerrado', className: 'bg-gray-100 text-gray-800' },
    rejected: { text: 'Rechazado', className: 'bg-red-100 text-red-800' },
  }

  const { text, className } = config[status] || config.draft

  return (
    <span className={`px-2 py-1 text-xs font-bold uppercase ${className}`}>
      {text}
    </span>
  )
}