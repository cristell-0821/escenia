'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkSuperAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado', user: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    return { error: 'No tienes permisos', user: null }
  }

  return { user }
}

// Activar agrupación
export async function activateGroup(id: string) {
  const supabase = await createClient()
  const { error: authError } = await checkSuperAdmin(supabase)
  if (authError) throw new Error(authError)

  const { error } = await supabase
    .from('groups')
    .update({ status: 'active' })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/agrupaciones')
  return { success: true }
}

// Desactivar/ocultar agrupación
export async function deactivateGroup(id: string) {
  const supabase = await createClient()
  const { error: authError } = await checkSuperAdmin(supabase)
  if (authError) throw new Error(authError)

  const { error } = await supabase
    .from('groups')
    .update({ status: 'inactive' })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/agrupaciones')
  return { success: true }
}

// Suspender agrupación
export async function suspendGroup(id: string) {
  const supabase = await createClient()
  const { error: authError } = await checkSuperAdmin(supabase)
  if (authError) throw new Error(authError)

  const { error } = await supabase
    .from('groups')
    .update({ status: 'suspended' })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/agrupaciones')
  return { success: true }
}

// Eliminar agrupación
export async function deleteGroup(id: string) {
  const supabase = await createClient()
  const { error: authError } = await checkSuperAdmin(supabase)
  if (authError) throw new Error(authError)

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/agrupaciones')
  return { success: true }
}