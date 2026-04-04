// src/app/dashboard/mi-agrupacion/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MiAgrupacionWrapper from './MiAgrupacionWrapper'

export default async function MiAgrupacionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership?.group_id) {
    return <div>No tienes agrupación asignada</div>
  }

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', membership.group_id) 
    .single()

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No tienes agrupación asignada
      </div>
    )
  }

  return <MiAgrupacionWrapper group={group} />
}