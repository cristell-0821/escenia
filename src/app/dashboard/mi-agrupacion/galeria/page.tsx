import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GaleriaWrapper from './GaleriaWrapper'

export const dynamic = "force-dynamic"

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard/mi-agrupacion/galeria')
  }

  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)
    .single()

  if (!membership?.group_id) {
    redirect('/perfil')
  }

  const { data: gallery } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('group_id', membership.group_id)
    .order('sort_order', { ascending: true })

  return (
    <GaleriaWrapper 
      initialGallery={gallery || []}
      groupId={membership.group_id}
    />
  )
}