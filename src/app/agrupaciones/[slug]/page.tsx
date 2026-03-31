// src/app/agrupaciones/[slug]/page.tsx - CON CACHE REAL

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import GroupDetailContent from './GroupDetailContent'
import Loading from './loading'

// ✅ Cliente de Supabase SIN cookies (solo para datos públicos)
const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ✅ CACHE funciona porque no usa cookies
const getGroup = unstable_cache(
  async (slug: string) => {
     console.log('Buscando slug:', slug) // ✅ DEBUG
    const { data, error } = await supabasePublic
      .from('groups')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()
      console.log('Resultado:', data ? 'ENCONTRADO' : 'NO ENCONTRADO') // ✅ DEBUG
    console.log('Error:', error) // ✅ DEBUG
    
    if (error || !data) return null
    return data
  },
  ['group-detail'],
  { revalidate: 300, tags: ['groups'] }
)

const getGroupGallery = unstable_cache(
  async (groupId: string) => {
    const { data } = await supabasePublic
      .from('gallery_items')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
    return data || []
  },
  ['group-gallery'],
  { revalidate: 300 }
)

const getGroupEvents = unstable_cache(
  async (groupId: string) => {
    const { data } = await supabasePublic
      .from('events')
      .select('*')
      .eq('group_id', groupId)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
    return data || []
  },
  ['group-events'],
  { revalidate: 60 }
)

interface Props {
  params: Promise<{ slug: string }>  // ✅ Es Promise, no objeto directo
}

export default async function GroupDetailPage({ params }: Props) {
  const { slug } = await params  // ✅ Agregar await
  
  console.log('Slug recibido:', slug)  // Ahora debería mostrar "musuk-pacha"
  
  const group = await getGroup(slug)
  
  if (!group) {
    notFound()
  }

  const [gallery, events] = await Promise.all([
    getGroupGallery(group.id),
    getGroupEvents(group.id)
  ])

  return (
    <Suspense fallback={<Loading />}>
      <GroupDetailContent 
        group={group} 
        gallery={gallery} 
        events={events} 
      />
    </Suspense>
  )
}