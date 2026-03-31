// src/lib/actions/concursos-privados.ts

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Verificar que sea admin de agrupación
async function checkGroupAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, group_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'group_admin' || !profile?.group_id) {
    throw new Error('Solo admins de agrupación pueden gestionar concursos')
  }

  return { user, profile }
}

// Crear concurso privado - RETORNA { error?, success? } para el formulario
export async function createPrivateContest(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  try {
    const supabase = await createClient()
    
    const { user, profile } = await checkGroupAdmin(supabase)

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      city: formData.get('city') as string,
      region: formData.get('region') as string,
      location: formData.get('location') as string,
      event_date: formData.get('event_date') as string,
      prize: formData.get('prize') as string,
      contact_whatsapp: formData.get('contact_whatsapp') as string,
      contact_email_public: formData.get('contact_email_public') as string,
      maps_url: formData.get('maps_url') as string,
    }

    // Validaciones
    if (!data.title || !data.description || !data.city || !data.region || !data.location || !data.event_date) {
      return { error: 'Todos los campos obligatorios son requeridos' }
    }

    const { error } = await supabase
      .from('contests')
      .insert({
        ...data,
        type: 'private',
        status: 'draft',
        organizer_group_id: profile!.group_id,
        created_by: user!.id,
        requires_approval: true,
      })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/mi-agrupacion/concursos')
    return { success: true }
    
  } catch (err: any) {
    return { error: err.message || 'Error al crear el concurso' }
  }
}

// Eliminar concurso (solo si es borrador)
export async function deleteContest(id: string) {
  const supabase = await createClient()
  
  const { profile } = await checkGroupAdmin(supabase)

  const { data: contest } = await supabase
    .from('contests')
    .select('organizer_group_id, status')
    .eq('id', id)
    .single()

  if (contest?.organizer_group_id !== profile!.group_id) {
    throw new Error('No puedes eliminar este concurso')
  }

  if (contest?.status !== 'draft') {
    throw new Error('Solo puedes eliminar borradores')
  }

  const { error } = await supabase
    .from('contests')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/mi-agrupacion/concursos')
}