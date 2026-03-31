import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Clock, CheckCircle, XCircle, LucideIcon } from 'lucide-react'

// ============ TIPOS Y CONFIGURACIÓN ============

interface StatusConfig {
  icon: LucideIcon
  text: string
  className: string
}

interface StatusBadgeProps {
  status: string
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: { 
    icon: Clock, 
    text: 'Pendiente', 
    className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
  },
  approved: { 
    icon: CheckCircle, 
    text: 'Aprobado', 
    className: 'bg-green-100 text-green-800 border border-green-200' 
  },
  rejected: { 
    icon: XCircle, 
    text: 'Rechazado', 
    className: 'bg-red-100 text-red-800 border border-red-200' 
  },
}

// ============ COMPONENTES ============

function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.text}
    </span>
  )
}

// ============ SERVER ACTIONS ============

async function aprobarInscripcionPrivada(formData: FormData) {
  'use server'
  
  const id = formData.get('id') as string
  const contestId = formData.get('contestId') as string
  
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('group_members')
    .select('role, group_id')
    .eq('user_id', user!.id)
    .single()
  
  if (!membership || membership.role !== 'group_admin' || !membership.group_id) return

  const { data: concurso } = await supabase
    .from('contests')
    .select('organizer_group_id')
    .eq('id', contestId)
    .single()
  
  if (concurso?.organizer_group_id !== membership.group_id) return

  await supabase
    .from('contest_registrations')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', id)

  const { revalidatePath } = await import('next/cache')
  revalidatePath(`/dashboard/mi-agrupacion/concursos/${contestId}/inscripciones`)
}

async function rechazarInscripcionPrivada(formData: FormData) {
  'use server'
  
  const id = formData.get('id') as string
  const contestId = formData.get('contestId') as string
  
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('group_members')
    .select('role, group_id')
    .eq('user_id', user!.id)
    .single()
  
  if (!membership || membership.role !== 'group_admin' || !membership.group_id) return

  const { data: concurso } = await supabase
    .from('contests')
    .select('organizer_group_id')
    .eq('id', contestId)
    .single()
  
  if (concurso?.organizer_group_id !== membership.group_id) return

  await supabase
    .from('contest_registrations')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', id)

  const { revalidatePath } = await import('next/cache')
  revalidatePath(`/dashboard/mi-agrupacion/concursos/${contestId}/inscripciones`)
}

// ============ PAGE PRINCIPAL ============

interface Props {
  params: Promise<{ id: string }>
}

export default async function InscripcionesPrivadasPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  // ✅ CAMBIO: usar group_members
  const { data: membership } = await supabase
    .from('group_members')
    .select('role, group_id')
    .eq('user_id', authUser.id)
    .single()

  if (!membership || membership.role !== 'group_admin' || !membership.group_id) {
    redirect('/dashboard')
  }

  // ✅ usar membership.group_id
  const { data: concurso } = await supabase
    .from('contests')
    .select('id, title, type, requires_approval, organizer_group_id')
    .eq('id', id)
    .eq('organizer_group_id', membership.group_id)
    .single()

  if (!concurso) notFound()

  const { data: inscripcionesRaw } = await supabase
    .from('contest_registrations')
    .select('*')
    .eq('contest_id', id)
    .order('created_at', { ascending: false })

  const inscripciones = await Promise.all(
    (inscripcionesRaw || []).map(async (insc) => {
      let group = null
      let user = null

      if (insc.group_id) {
        const { data } = await supabase
          .from('groups')
          .select('id, name, city, region')
          .eq('id', insc.group_id)
          .single()
        group = data
      }

      if (insc.user_id) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', insc.user_id)
          .single()
        user = data
      }

      return { ...insc, group, user }
    })
  )

  const stats = {
    total: inscripciones.length,
    pending: inscripciones.filter(i => i.status === 'pending').length,
    approved: inscripciones.filter(i => i.status === 'approved').length,
    rejected: inscripciones.filter(i => i.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-[#FAF3E7]">
      {/* Header */}
      <div className="bg-[#85332a] text-white px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/dashboard/mi-agrupacion/concursos"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mis concursos
          </Link>
          <h1 className="text-3xl font-bold italic font-serif">
            Inscripciones: {concurso.title}
          </h1>
          <p className="text-white/60 mt-2">
            Mi concurso privado
            {concurso.requires_approval && ' • Requiere aprobación'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 border-l-4 border-[#85332a]">
            <p className="text-sm text-[#554240] uppercase tracking-wider">Total</p>
            <p className="text-3xl font-bold text-[#85332a]">{stats.total}</p>
          </div>
          <div className="bg-white p-6 border-l-4 border-yellow-500">
            <p className="text-sm text-[#554240] uppercase tracking-wider">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 border-l-4 border-green-500">
            <p className="text-sm text-[#554240] uppercase tracking-wider">Aprobadas</p>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white p-6 border-l-4 border-red-500">
            <p className="text-sm text-[#554240] uppercase tracking-wider">Rechazadas</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white">
          <div className="p-6 border-b border-[#dbc1bd]">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agrupaciones inscritas
            </h2>
          </div>

          {inscripciones.length === 0 ? (
            <div className="p-12 text-center text-[#554240]">
              <p>No hay inscripciones aún</p>
            </div>
          ) : (
            <div className="divide-y divide-[#dbc1bd]">
              {inscripciones.map((inscripcion) => (
                <div key={inscripcion.id} className="p-6 hover:bg-[#faf3e7] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-[#1e1b14]">
                        {inscripcion.group?.name || 'Agrupación sin nombre'}
                      </h3>
                      <p className="text-sm text-[#554240]">
                        {inscripcion.group?.city}{inscripcion.group?.region && `, ${inscripcion.group.region}`}
                      </p>
                      <p className="text-xs text-[#554240]/60 mt-1">
                        Inscrito por: {inscripcion.user?.full_name || 'Usuario desconocido'}
                      </p>
                    </div>

                    <StatusBadge status={inscripcion.status ?? 'pending'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}