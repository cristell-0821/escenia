import { createClient } from './client'
import { createClient as createServerClient } from './server'
import type { Tables } from '@/types/database.types'

// ════════════════════════════════════════════════════════════
//  AGRUPACIONES (Groups)
// ════════════════════════════════════════════════════════════

export async function getGroups() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      gallery_items (url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Tables<'groups'>[]
}

export async function getGroupBySlug(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error) throw error
  return data as Tables<'groups'>
}

// ════════════════════════════════════════════════════════════
//  CONCURSOS (Contests)
// ════════════════════════════════════════════════════════════

export async function getContests() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .eq('status', 'published')  // Solo publicados
    .order('event_date', { ascending: true })  // Ordenar por fecha
    .gte('event_date', new Date().toISOString())  // Solo futuros (opcional)

  if (error) {
    console.error('Error fetching contests:', error)
    return []
  }

  return data || []
}

export async function getContestById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error) throw error
  return data as Tables<'contests'>
}

// ════════════════════════════════════════════════════════════
//  GALERÍA
// ════════════════════════════════════════════════════════════

export async function getGroupGallery(groupId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('group_id', groupId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data as Tables<'gallery_items'>[]
}

// ════════════════════════════════════════════════════════════
//  EVENTOS / AGENDA
// ════════════════════════════════════════════════════════════

export async function getGroupEvents(groupId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('group_id', groupId)
    .eq('is_public', true)
    .order('event_date', { ascending: true })

  if (error) throw error
  return data as Tables<'events'>[]
}


// Crear nueva solicitud
export async function createGroupRequest(requestData: {
  user_id: string
  name: string
  description?: string
  city?: string
  region?: string
  contact_email: string
  contact_phone?: string
  instagram?: string
  facebook?: string
  website?: string
  founded_year?: number
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('group_requests')
    .insert(requestData)
    .select()
    .single()
  if (error) throw error
  return data as Tables<'group_requests'>
}

// ════════════════════════════════════════════════════════════
//  PERFIL / USUARIO
// ════════════════════════════════════════════════════════════

export async function getUserProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as Tables<'profiles'>
}

// ════════════════════════════════════════════════════════════
//  SOLICITUDES DE AGRUPACIÓN
// ════════════════════════════════════════════════════════════

export async function getMyGroupRequests(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('group_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Tables<'group_requests'>[]
}

// ════════════════════════════════════════════════════════════
//  MI AGRUPACIÓN (para cuando ya es admin)
// ════════════════════════════════════════════════════════════

export async function getMyGroup(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data as { group_id: string; groups: Tables<'groups'> }
}

