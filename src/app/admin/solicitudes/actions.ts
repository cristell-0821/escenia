'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function aprobarSolicitud(requestId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('group_requests')
    .update({ 
      status: 'approved',
      reviewed_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .eq('status', 'pending')

  if (error) {
    return { error: 'Error al aprobar la solicitud' }
  }

  revalidatePath('/admin/solicitudes')
  revalidatePath('/perfil')
  return { success: true }  // ← Ya no hace redirect
}

export async function rechazarSolicitud(requestId: string, motivo: string) {
  const supabase = await createClient()

  if (!motivo || motivo.length < 10) {
    return { error: 'Debes proporcionar un motivo de rechazo (mínimo 10 caracteres)' }
  }

  const { error } = await supabase
    .from('group_requests')
    .update({ 
      status: 'rejected',
      rejection_reason: motivo,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .eq('status', 'pending')

  if (error) {
    return { error: 'Error al rechazar la solicitud' }
  }

  revalidatePath('/admin/solicitudes')
  return { success: true }  // ← Ya no hace redirect
}