import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Users
} from 'lucide-react'
import { 
  publishContest, 
  closeContest,
  deleteContest,
  approveContest  // ← Agregar import
} from './actions'
import DeleteButton from '@/components/admin/DeleteButton'

export default async function ConcursosPage() {
  const supabase = await createClient()

  const { data: concursos } = await supabase
    .from('contests')
    .select('*')
    .order('created_at', { ascending: false })

  const publicados = concursos?.filter(c => c.status === 'published') || []
  const borradores = concursos?.filter(c => c.status === 'draft') || []
  const cerrados = concursos?.filter(c => c.status === 'closed') || []
  const porAprobar = concursos?.filter(c => c.type === 'private' && c.status === 'draft') || []

  return (
    <div className="space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#dbc1bd]/30 pb-6">
        <div>
          <h1 className="font-serif text-4xl text-[#1e1b14]">Concursos</h1>
          <p className="text-[#554240] mt-2">
            Gestiona los concursos y competencias culturales
          </p>
        </div>

        <Link
          href="/admin/concursos/nuevo"
          className="bg-[#85332a] text-white px-6 py-3 font-bold tracking-widest uppercase text-sm flex items-center gap-2 hover:bg-[#a44a3f] transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          Nuevo Concurso
        </Link>
      </div>

      {/* Stats - Ahora 4 columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard label="Publicados" count={publicados.length} color="green" icon={Eye} />
        <StatCard label="Borradores" count={borradores.length} color="yellow" icon={EyeOff} />
        <StatCard label="Por Aprobar" count={porAprobar.length} color="orange" icon={CheckCircle} />
        <StatCard label="Cerrados" count={cerrados.length} color="gray" icon={XCircle} />
      </div>

      {/* Lista de concursos */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl text-[#85332a] flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Todos los Concursos ({concursos?.length || 0})
        </h2>

        {!concursos || concursos.length === 0 ? (
          <div className="bg-[#faf3e7] p-12 border border-[#dbc1bd]/20 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-[#85332a]/40" />
            <p className="text-[#554240]">No hay concursos registrados</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {concursos.map((concurso) => (
              <ConcursoCard key={concurso.id} concurso={concurso} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

function StatCard({ 
  label, 
  count, 
  color, 
  icon: Icon 
}: { 
  label: string
  count: number
  color: 'green' | 'yellow' | 'orange' | 'gray'
  icon: any
}) {
  const colors = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    gray: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-[#faf3e7] p-6 border border-[#dbc1bd]/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#554240] uppercase tracking-wider">{label}</p>
          <p className="font-serif text-4xl text-[#1e1b14] mt-1">{count}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

function ConcursoCard({ concurso }: { concurso: any }) {
  const statusColors = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    published: 'Publicado',
    draft: 'Borrador',
    closed: 'Cerrado',
    rejected: 'Rechazado'
  }

  const typeLabels = {
    official: 'Oficial',
    private: 'Privado'
  }

  const typeColors = {
    official: 'bg-[#85332a] text-white',
    private: 'bg-[#fdbe49] text-[#1e1b14]'
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin fecha'
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-[#faf3e7] p-6 border border-[#dbc1bd]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-6">
        {/* Cover placeholder */}
        <div className="w-24 h-24 bg-[#85332a]/10 flex items-center justify-center shrink-0">
          {concurso.cover_url ? (
            <img src={concurso.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Trophy className="w-8 h-8 text-[#85332a]/40" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="font-serif text-2xl text-[#1e1b14]">{concurso.title}</h3>
            
            {/* Badge de estado */}
            <span className={`px-2 py-1 text-xs font-bold tracking-wider uppercase ${statusColors[concurso.status as keyof typeof statusColors]}`}>
              {statusLabels[concurso.status as keyof typeof statusLabels]}
            </span>
            
            {/* Badge de tipo */}
            <span className={`px-2 py-1 text-xs font-bold tracking-wider uppercase ${typeColors[concurso.type as keyof typeof typeColors]}`}>
              {typeLabels[concurso.type as keyof typeof typeLabels]}
            </span>

            {/* Si es privado y está en draft, mostrar indicador de pendiente */}
            {concurso.type === 'private' && concurso.status === 'draft' && (
              <span className="px-2 py-1 text-xs font-bold tracking-wider uppercase bg-orange-100 text-orange-800 animate-pulse">
                POR APROBAR
              </span>
            )}
          </div>
          
          {/* Info del organizador si es privado */}
          {concurso.type === 'private' && concurso.organizer_group_id && (
            <p className="text-sm text-[#554240] mb-2">
              Organiza: <span className="font-medium text-[#85332a]">Agrupación #{concurso.organizer_group_id.slice(0,8)}</span>
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-[#554240]">
            {concurso.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {concurso.city}
              </span>
            )}
            {concurso.event_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(concurso.event_date)}
              </span>
            )}
            {concurso.prize && (
              <span className="text-[#85332a] font-medium">
                Premio: {concurso.prize}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* NUEVO: Link a inscripciones */}
        <Link 
          href={`/admin/concursos/${concurso.id}/inscripciones`}  // ← Usa concurso.id (UUID)
          className="p-2 text-[#85332a] hover:bg-[#85332a]/10 transition-colors"
          title="Ver inscripciones"
        >
          <Users className="w-5 h-5" />
        </Link>
        {/* Acciones especiales para privados en draft */}
        {concurso.type === 'private' && concurso.status === 'draft' && (
          <>
            <form action={approveContest.bind(null, concurso.id, 'approve')}>
              <button 
                type="submit"
                className="p-2 text-green-600 hover:bg-green-50 transition-colors"
                title="Aprobar y publicar"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            </form>
            <form action={approveContest.bind(null, concurso.id, 'reject')}>
              <button 
                type="submit"
                className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                title="Rechazar"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </form>
          </>
        )}

        {/* Acciones normales solo para oficiales o ya aprobados */}
        {(concurso.type === 'official' || concurso.status === 'published') && (
          <>
            {concurso.status === 'draft' && (
              <form action={publishContest.bind(null, concurso.id)}>
                <button 
                  type="submit"
                  className="p-2 text-green-600 hover:bg-green-50 transition-colors"
                  title="Publicar"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </form>
            )}
            {concurso.status === 'published' && (
              <form action={closeContest.bind(null, concurso.id)}>
                <button 
                  type="submit"
                  className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Cerrar"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </form>
            )}
          </>
        )}

        {/* Editar */}
        <Link 
          href={`/admin/concursos/${concurso.id}/editar`}
          className="p-2 text-[#554240] hover:text-[#85332a] hover:bg-[#85332a]/10 transition-colors"
          title="Editar"
        >
          <Edit2 className="w-5 h-5" />
        </Link>

        {/* Eliminar */}
        <form action={deleteContest.bind(null, concurso.id)}>
          <DeleteButton />
        </form>
      </div>
    </div>
  )
}