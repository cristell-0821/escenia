import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AgendaClient from './AgendaClient'

export default async function AgendaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)
    .single()

  if (!membership?.group_id) {
    redirect('/perfil')
  }

  const groupId = membership.group_id

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('group_id', groupId)
    .order('event_date', { ascending: true })

  return (
    <AgendaClient 
      initialEvents={events || []}
      groupId={groupId}
    />
  )
}