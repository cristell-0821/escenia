import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConcursoDetalleClient from './ConcursoDetalleClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ConcursoDetallePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // =========================
  // 1. Obtener concurso
  // =========================
  const { data: concurso } = await supabase
    .from('contests')
    .select('*')
    .eq('status', 'published')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single()

  if (!concurso) {
    notFound()
  }

  // =========================
  // 2. Usuario autenticado
  // =========================
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  let user = null
  let initialRegistration = null

  if (authUser) {
    // =========================
    // 3. Obtener membership (FUENTE REAL)
    // =========================
    const { data: membership } = await supabase
      .from('group_members')
      .select('group_id, role')
      .eq('user_id', authUser.id)
      .maybeSingle()

    // =========================
    // 4. Si tiene agrupación
    // =========================
    if (membership && membership.group_id) {

      // Obtener nombre del grupo
      const { data: group } = await supabase
        .from('groups')
        .select('name')
        .eq('id', membership.group_id)
        .maybeSingle()

      user = {
        id: authUser.id,
        role: membership.role,
        groupId: membership.group_id,
        groupName: group?.name || undefined
      }

      // =========================
      // 5. Verificar inscripción
      // =========================
      const { data: registration } = await supabase
        .from('contest_registrations')
        .select('id, status, created_at, notes')
        .eq('contest_id', concurso.id)
        .eq('group_id', membership.group_id)
        .maybeSingle()

      initialRegistration = registration
        ? {
            id: registration.id,
            status: (registration.status ?? 'pending') as 'pending' | 'approved' | 'rejected',
            createdAt: registration.created_at ?? '',
            notes: registration.notes ?? undefined,
          }
        : null

    } else {
      // =========================
      // 6. Usuario SIN agrupación
      // =========================
      user = {
        id: authUser.id,
        role: 'visitor',
        groupId: undefined,
        groupName: undefined
      }
    }
  }

  // =========================
  // 7. Render
  // =========================
  return (
    <ConcursoDetalleClient 
      concurso={concurso} 
      user={user}
      initialRegistration={initialRegistration}
    />
  )
}