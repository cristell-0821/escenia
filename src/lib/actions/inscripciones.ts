'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface RegistrationData {
  contest_id: string
  group_id: string
  category?: string
  participants_count?: number
  notes?: string
}

// Verificar si el usuario es admin de agrupación
async function checkGroupAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado', user: null, profile: null, group: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, group_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'group_admin' || !profile?.group_id) {
    return { error: 'Solo admins de agrupación pueden inscribirse', user: null, profile: null, group: null }
  }

  const { data: group } = await supabase
    .from('groups')
    .select('id, name, status')
    .eq('id', profile.group_id)
    .single()

  if (!group || group.status !== 'active') {
    return { error: 'Tu agrupación no está activa', user: null, profile: null, group: null }
  }

  return { user, profile, group }
}

// CREAR INSCRIPCIÓN
export async function createRegistration(data: RegistrationData) {
  const supabase = await createClient()
  
  const { error: authError, user, group } = await checkGroupAdmin(supabase)
  if (authError) return { error: authError }

  // Validar que el concurso existe y está abierto
  const { data: contest } = await supabase
    .from('contests')
    .select('id, status, event_date, requires_approval')
    .eq('id', data.contest_id)
    .single()

  if (!contest) return { error: 'Concurso no encontrado' }
  if (contest.status !== 'published') return { error: 'Este concurso no está abierto' }
  
  if (!contest.event_date) {
    return { error: 'El concurso no tiene fecha definida' }
  }

  if (new Date(contest.event_date) < new Date()) {
    return { error: 'El evento ya pasó' }
  }

  // Verificar que no haya inscrito ya
  const { data: existing } = await supabase
    .from('contest_registrations')
    .select('id, status')
    .eq('contest_id', data.contest_id)
    .eq('group_id', group.id)
    .single()

  if (existing) {
    return { error: 'Tu agrupación ya está inscrita', existingStatus: existing.status }
  }

  // Crear inscripción
  const { data: registration, error } = await supabase
    .from('contest_registrations')
    .insert({
      contest_id: data.contest_id,
      group_id: group.id,
      user_id: user.id,
      status: contest.requires_approval ? 'pending' : 'approved',
      category: data.category || null,
      participants_count: data.participants_count || null,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/concursos/${data.contest_id}`)
  revalidatePath('/dashboard/mi-agrupacion')

  return { 
    success: true, 
    registration,
    message: contest.requires_approval 
      ? 'Inscripción enviada. Esperando aprobación.' 
      : '¡Inscripción confirmada!'
  }
}

// CANCELAR INSCRIPCIÓN
export async function cancelRegistration(registrationId: string) {
  const supabase = await createClient()
  
  const { error: authError, user, group } = await checkGroupAdmin(supabase)
  if (authError) return { error: authError }

  const { data: registration } = await supabase
    .from('contest_registrations')
    .select('id, status, group_id, contest_id')
    .eq('id', registrationId)
    .single()

  if (!registration) return { error: 'Inscripción no encontrada' }
  if (registration.group_id !== group.id) return { error: 'No autorizado' }
  if (registration.status !== 'pending') return { error: 'Solo puedes cancelar inscripciones pendientes' }

  const { error } = await supabase
    .from('contest_registrations')
    .update({ status: 'cancelled' })
    .eq('id', registrationId)

  if (error) return { error: error.message }

  revalidatePath(`/concursos/${registration.contest_id}`)
  revalidatePath('/dashboard/mi-agrupacion')

  return { success: true, message: 'Inscripción cancelada' }
}