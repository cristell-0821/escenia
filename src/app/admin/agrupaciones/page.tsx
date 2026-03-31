import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Theater, 
  MapPin, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import GroupActionsMenu from '@/components/admin/GroupActionsMenu'

export default async function AgrupacionesPage() {
  const supabase = await createClient()

  const { data: agrupaciones } = await supabase
    .from('groups')
    .select(`
      *,
      group_members!inner(user_id, role)
    `)
    .order('created_at', { ascending: false })

  const activas = agrupaciones?.filter(g => g.status === 'active') || []
  const inactivas = agrupaciones?.filter(g => g.status === 'inactive') || []
  const suspendidas = agrupaciones?.filter(g => g.status === 'suspended') || []

  return (
    <div className="space-y-12">
      
      {/* Header */}
      <div className="border-b border-[#dbc1bd]/30 pb-6">
        <h1 className="font-serif text-4xl text-[#1e1b14]">Agrupaciones</h1>
        <p className="text-[#554240] mt-2">
          Gestiona todas las agrupaciones culturales registradas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard 
          label="Activas" 
          count={activas.length} 
          color="green" 
          icon={CheckCircle}
        />
        <StatCard 
          label="Inactivas" 
          count={inactivas.length} 
          color="gray" 
          icon={XCircle}
        />
        <StatCard 
          label="Suspendidas" 
          count={suspendidas.length} 
          color="red" 
          icon={AlertCircle}
        />
      </div>

      {/* Lista */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl text-[#85332a] flex items-center gap-2">
          <Theater className="w-6 h-6" />
          Todas las Agrupaciones ({agrupaciones?.length || 0})
        </h2>

        {!agrupaciones || agrupaciones.length === 0 ? (
          <div className="bg-[#faf3e7] p-8 border border-[#dbc1bd]/20 text-center">
            <p className="text-[#554240]">No hay agrupaciones registradas</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {agrupaciones.map((grupo) => (
              <AgrupacionRow key={grupo.id} grupo={grupo} />
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
  color: 'green' | 'gray' | 'red'
  icon: any
}) {
  const colors = {
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800'
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

function AgrupacionRow({ grupo }: { grupo: any }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    active: 'Activa',
    inactive: 'Inactiva',
    suspended: 'Suspendida'
  }

  return (
    <div className="bg-[#faf3e7] p-6 border border-[#dbc1bd]/20 flex items-center justify-between group hover:border-[#85332a]/30 transition-colors">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="w-16 h-16 bg-[#85332a]/10 flex items-center justify-center">
          <Theater className="w-8 h-8 text-[#85332a]/40" />
        </div>

        <div>
          <h3 className="font-serif text-xl text-[#1e1b14] group-hover:text-[#85332a] transition-colors">
            {grupo.name}
          </h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-[#554240]">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {grupo.city}, {grupo.region}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Admin: {grupo.group_members?.[0]?.user_id?.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 text-xs font-bold tracking-wider uppercase ${statusColors[grupo.status as keyof typeof statusColors]}`}>
          {statusLabels[grupo.status as keyof typeof statusLabels]}
        </span>

        <div className="flex gap-2 items-center">
          <Link 
            href={`/agrupaciones/${grupo.slug}`}
            target="_blank"
            className="p-2 text-[#554240] hover:text-[#85332a] transition-colors"
            title="Ver perfil público"
          >
            <ExternalLink className="w-5 h-5" />
          </Link>
          
          {/* Menú de acciones */}
          <GroupActionsMenu 
            groupId={grupo.id} 
            currentStatus={grupo.status} 
          />
        </div>
      </div>
    </div>
  )
}