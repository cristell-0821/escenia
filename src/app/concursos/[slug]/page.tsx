import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConcursoDetalleClient from './ConcursoDetalleClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ConcursoDetallePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Buscar concurso
  const { data: concurso } = await supabase
    .from('contests')
    .select('*')
    .eq('status', 'published')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single()

  if (!concurso) {
    notFound()
  }

  // Obtener usuario actual si existe
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  let user = null
  let initialRegistration = null

  if (authUser) {
    // Obtener perfil
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, group_id')
      .eq('id', authUser.id)
      .maybeSingle()

    if (profile) {
      // ========== CASO 1: Profile existe en BD ==========
      
      // Obtener nombre de la agrupación
      let groupName = null
      if (profile.group_id) {
        const { data: group } = await supabase
          .from('groups')
          .select('name')
          .eq('id', profile.group_id)
          .maybeSingle()
        groupName = group?.name
      }

      // Construir user object
      user = {
        id: authUser.id,
        role: profile.role,
        groupId: profile.group_id,
        groupName: groupName
      }

      // Verificar inscripción existente (SOLO si tiene group_id)
      if (profile.group_id) {
        const { data: registration } = await supabase
          .from('contest_registrations')
          .select('id, status, created_at, notes')
          .eq('contest_id', concurso.id)
          .eq('group_id', profile.group_id)
          .maybeSingle()
        
        initialRegistration = registration
          ? {
              id: registration.id,
              status: (registration.status ?? 'pending') as 'pending' | 'approved' | 'rejected',
              createdAt: registration.created_at ?? '',
              notes: registration.notes ?? undefined,
            }
          : null
      }

    } else {
      // ========== CASO 2: Profile NO existe ==========
      
      const metadata = authUser.user_metadata || {}
      
      user = {
        id: authUser.id,
        role: metadata.role || 'user',
        groupId: metadata.group_id,
        groupName: metadata.group_name || 'Mi Agrupación'
      }
    }
  }

  return (
    <ConcursoDetalleClient 
      concurso={concurso} 
      user={user}
      initialRegistration={initialRegistration}
    />
  )
}