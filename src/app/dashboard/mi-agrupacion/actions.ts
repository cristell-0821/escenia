'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Actualizar datos del grupo (ahora incluye cover, slogan, dancers_count)
export async function updateGroup(groupId: string, data: {
  name?: string
  slogan?: string | null
  description?: string
  city?: string
  region?: string
  contact_email?: string
  contact_phone?: string | null
  instagram?: string | null
  facebook?: string | null
  website?: string | null
  founded_year?: number | null
  dancers_count?: number | null
  cover_url?: string | null
}) {
  const supabase = await createClient()

  // Verificar que el usuario es admin de este grupo
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'group_admin') {
    return { error: 'No eres admin de esta agrupación' }
  }

  const { error } = await supabase
    .from('groups')
    .update(data)
    .eq('id', groupId)

  if (error) return { error: 'Error al actualizar' }

  revalidatePath('/dashboard/mi-agrupacion')
  revalidatePath(`/agrupaciones/${groupId}`)
  return { success: true }
}

// Subir foto de portada (placeholder - implementar con Supabase Storage después)
export async function uploadCover(groupId: string, file: File) {
  // Por ahora retornamos null, luego implementamos Storage
  return { url: null }
}