'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

// Verificar permisos - ahora devuelve también el perfil completo
async function checkPermissions(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado', user: null, profile: null }

  // 🔹 perfil (solo rol)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 🔹 membership (grupo real)
  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  const isSuperAdmin = profile?.role === 'superadmin'
  const isGroupAdmin = membership?.role === 'group_admin' && membership?.group_id

  if (!isSuperAdmin && !isGroupAdmin) {
    return { error: 'No tienes permisos', user: null, profile: null }
  }

  return { 
    user, 
    profile, 
    membership,
    isSuperAdmin, 
    isGroupAdmin 
  }
}

async function uploadImage(file: File, supabase: any): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `contests/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('group-assets')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Error uploading:', uploadError)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('group-assets')
    .getPublicUrl(fileName)

  return publicUrl
}

function cleanData(data: Record<string, any>) {
  const cleaned: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === '' || value === undefined) {
      cleaned[key] = null
    } else {
      cleaned[key] = value
    }
  }
  return cleaned
}

// Crear concurso - ahora permite superadmin y group_admin
export async function createContest(formData: FormData) {
  const supabase = await createClient()
  
  const { error: authError, user, profile, isSuperAdmin, isGroupAdmin } = await checkPermissions(supabase)
  if (authError) return { error: authError }

  // Determinar tipo y estado según rol
  const type = isSuperAdmin ? 'official' : 'private'
  const status = isSuperAdmin ? 'published' : 'draft'
  const organizer_group_id = isGroupAdmin ? profile.group_id : null

  // Procesar imagen
  const imageFile = formData.get('poster_image') as File
  let cover_url = null
  
  if (imageFile && imageFile.size > 0) {
    cover_url = await uploadImage(imageFile, supabase)
  }

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    city: formData.get('city') as string,
    region: formData.get('region') as string,
    location: formData.get('location') as string,
    event_date: formData.get('event_date') as string,
    prize: formData.get('prize') as string,
    cover_url,
    maps_url: formData.get('maps_url') as string,
    contact_whatsapp: formData.get('contact_whatsapp') as string,
    contact_email_public: formData.get('contact_email_public') as string,
  }

  const cleaned = cleanData(data)

  const { error } = await supabase
    .from('contests')
    .insert({
      title: cleaned.title!,
      description: cleaned.description,
      city: cleaned.city,
      region: cleaned.region,
      location: cleaned.location,
      event_date: cleaned.event_date,
      prize: cleaned.prize,
      cover_url: cleaned.cover_url,
      maps_url: cleaned.maps_url,
      contact_whatsapp: cleaned.contact_whatsapp,
      contact_email_public: cleaned.contact_email_public,
      type,
      organizer_group_id,
      status,
      requires_approval: true,
      created_by: user.id,
    } as any)

  if (error) return { error: error.message }

  revalidatePath('/admin/concursos')
  revalidatePath('/concursos')

  // Redirigir según rol
  if (isGroupAdmin) {
    redirect('/dashboard') // Admin de agrupación vuelve a su dashboard
  }
  
  redirect('/admin/concursos')
}

// Actualizar concurso - solo superadmin o el creador si es privado y está en draft
export async function updateContest(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { error: authError, user, profile, isSuperAdmin } = await checkPermissions(supabase)
  if (authError) return { error: authError }

  // Verificar que puede editar este concurso específico
  if (!isSuperAdmin) {
    const { data: contest } = await supabase
      .from('contests')
      .select('organizer_group_id, status, type')
      .eq('id', id)
      .single()
    
    // Solo puede editar si es suyo, es privado, y está en draft
    const canEdit = contest?.organizer_group_id === profile?.group_id && 
                    contest?.type === 'private' && 
                    contest?.status === 'draft'
    
    if (!canEdit) {
      return { error: 'No puedes editar este concurso' }
    }
  }

  // Procesar imagen solo si se subió nueva
  const imageFile = formData.get('poster_image') as File
  let cover_url = undefined
  
  if (imageFile && imageFile.size > 0) {
    cover_url = await uploadImage(imageFile, supabase)
  }

  const data: any = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    city: formData.get('city') as string,
    region: formData.get('region') as string,
    location: formData.get('location') as string,
    event_date: formData.get('event_date') as string,
    prize: formData.get('prize') as string,
    maps_url: formData.get('maps_url') as string,
    contact_whatsapp: formData.get('contact_whatsapp') as string,
    contact_email_public: formData.get('contact_email_public') as string,
  }

  if (cover_url) {
    data.cover_url = cover_url
  }

  const cleaned = cleanData(data)

  const { error } = await supabase
    .from('contests')
    .update(cleaned)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/concursos')
  revalidatePath('/concursos')
  
  if (!isSuperAdmin) {
    redirect('/dashboard')
  }
  
  return { success: true }
}

// Publicar - solo superadmin
export async function publishContest(id: string) {
  const supabase = await createClient()
  const { error: authError, isSuperAdmin } = await checkPermissions(supabase)
  
  if (authError || !isSuperAdmin) {
    throw new Error('No autorizado')
  }

  const { error } = await supabase
    .from('contests')
    .update({ status: 'published' })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/concursos')
  revalidatePath('/concursos')
  redirect('/admin/concursos')  
}

// Cerrar - solo superadmin
export async function closeContest(id: string) {
  const supabase = await createClient()
  const { error: authError, isSuperAdmin } = await checkPermissions(supabase)
  
  if (authError || !isSuperAdmin) {
    throw new Error('No autorizado')
  }

  const { error } = await supabase
    .from('contests')
    .update({ status: 'closed' })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/concursos')
  revalidatePath('/concursos')
  redirect('/admin/concursos')
}

//ELIMINAR
export async function deleteContest(id: string) {
  const supabase = await createClient()
  const { error: authError, user, profile, isSuperAdmin } = await checkPermissions(supabase)
  
  if (authError) {
    throw new Error(authError)
  }

  // Verificar permisos específicos
  if (!isSuperAdmin) {
    const { data: contest } = await supabase
      .from('contests')
      .select('organizer_group_id, status, type')
      .eq('id', id)
      .single()
    
    const canDelete = contest?.organizer_group_id === profile?.group_id && 
                      contest?.type === 'private' && 
                      contest?.status === 'draft'
    
    if (!canDelete) {
      throw new Error('No puedes eliminar este concurso')
    }
  }

  const { error } = await supabase
    .from('contests')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/concursos')
  
  if (!isSuperAdmin) {
    redirect('/dashboard')
  }
  
  redirect('/admin/concursos')
}

// Aprobar/rechazar concurso privado - SOLO superadmin
export async function approveContest(id: string, action: 'approve' | 'reject') {
  const supabase = await createClient()
  
  const { error: authError, user, isSuperAdmin } = await checkPermissions(supabase)
  
  if (authError || !isSuperAdmin) {
    throw new Error('No autorizado')
  }

  const updates: any = {
    status: action === 'approve' ? 'published' : 'rejected',
    approved_by: user.id,
    approved_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('contests')
    .update(updates)
    .eq('id', id)
    .eq('type', 'private')
    .eq('status', 'draft')

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/concursos')
  revalidatePath('/concursos')
  redirect('/admin/concursos')
}

export async function createContestAction(formData: FormData): Promise<{ error?: string; success?: boolean; isGroupAdmin?: boolean }> {
  const supabase = await createClient()
  
  const { error: authError, user, profile, isSuperAdmin, isGroupAdmin } = await checkPermissions(supabase)
  if (authError) return { error: authError }

  // Determinar tipo y estado según rol
  const type = isSuperAdmin ? 'official' : 'private'
  const status = isSuperAdmin ? 'published' : 'draft'
  const organizer_group_id = isGroupAdmin ? profile.group_id : null
  const eventDateRaw = formData.get('event_date') as string
  const event_date = eventDateRaw ? `${eventDateRaw}:00` : null

  // Procesar imagen
  const imageFile = formData.get('poster_image') as File
  let cover_url = null
  
  if (imageFile && imageFile.size > 0) {
    cover_url = await uploadImage(imageFile, supabase)
  }

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    city: formData.get('city') as string,
    region: formData.get('region') as string,
    location: formData.get('location') as string,
    event_date: formData.get('event_date') as string,
    prize: formData.get('prize') as string,
    cover_url,
    maps_url: formData.get('maps_url') as string,
    contact_whatsapp: formData.get('contact_whatsapp') as string,
    contact_email_public: formData.get('contact_email_public') as string,
  }

  const cleaned = cleanData(data)

  const { error } = await supabase
    .from('contests')
    .insert({
      title: cleaned.title!,
      description: cleaned.description,
      city: cleaned.city,
      region: cleaned.region,
      location: cleaned.location,
      event_date: cleaned.event_date,
      prize: cleaned.prize,
      cover_url: cleaned.cover_url,
      maps_url: cleaned.maps_url,
      contact_whatsapp: cleaned.contact_whatsapp,
      contact_email_public: cleaned.contact_email_public,
      type,
      organizer_group_id,
      status,
      requires_approval: true,
      created_by: user.id,
    } as any)

  if (error) return { error: error.message }

  revalidatePath('/admin/concursos')
  revalidatePath('/concursos')
  revalidatePath('/dashboard/mi-agrupacion/concursos')

  // ✅ NO hace redirect, retorna éxito
  return { success: true, isGroupAdmin }
}

export async function updateContestAction(
  id: string, 
  formData: FormData
): Promise<{ error?: string; success?: boolean; isGroupAdmin?: boolean }> {
  const supabase = await createClient()
  
  const { error: authError, user, profile, isSuperAdmin, isGroupAdmin } = await checkPermissions(supabase)
  if (authError) return { error: authError }

  // Verificar que puede editar este concurso específico
  if (!isSuperAdmin) {
    const { data: contest } = await supabase
      .from('contests')
      .select('organizer_group_id, status, type')
      .eq('id', id)
      .single()
    
    // Solo puede editar si es suyo, es privado, y está en draft
    const canEdit = contest?.organizer_group_id === profile?.group_id && 
                    contest?.type === 'private' && 
                    contest?.status === 'draft'
    
    if (!canEdit) {
      return { error: 'No puedes editar este concurso' }
    }
  }

  // Procesar imagen solo si se subió nueva
  const imageFile = formData.get('poster_image') as File
  let cover_url = undefined
  
  if (imageFile && imageFile.size > 0) {
    cover_url = await uploadImage(imageFile, supabase)
  }

  const data: any = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    city: formData.get('city') as string,
    region: formData.get('region') as string,
    location: formData.get('location') as string,
    event_date: formData.get('event_date') as string,
    prize: formData.get('prize') as string,
    maps_url: formData.get('maps_url') as string,
    contact_whatsapp: formData.get('contact_whatsapp') as string,
    contact_email_public: formData.get('contact_email_public') as string,
  }

  if (cover_url) {
    data.cover_url = cover_url
  }

  const cleaned = cleanData(data)

  const { error } = await supabase
    .from('contests')
    .update(cleaned)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/concursos')
  revalidatePath('/concursos')
  revalidatePath('/dashboard/mi-agrupacion/concursos')

  return { success: true, isGroupAdmin }
}