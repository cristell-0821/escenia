'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

interface SolicitudData {
  user_id: string
  name: string
  city: string
  region: string
  contact_email: string
  description?: string
  contact_phone?: string
  instagram?: string
  facebook?: string
  youtube?: string | null
  tiktok?: string | null
  founded_year?: number
}

export async function crearSolicitud(data: SolicitudData) {
  const supabase = await createClient()
  
  // Verificar que no tenga solicitud pendiente
  const { data: existing } = await supabase
    .from('group_requests')
    .select('id, status')
    .eq('user_id', data.user_id)
    .eq('status', 'pending')
    .single()

  if (existing) {
    return { error: 'Ya tienes una solicitud en revisión' }
  }

  // Crear solicitud
  const { error } = await supabase
    .from('group_requests')
    .insert({
      ...data,
      status: 'pending',
      country: 'PE'
    })

  if (error) {
    return { error: 'Error al enviar la solicitud. Intenta nuevamente.' }
  }

  revalidatePath('/perfil')
  redirect('/perfil?success=solicitud-enviada')
}