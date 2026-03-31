import { createClient } from '@/lib/supabase/server'
import ConcursosClient from './ConcursosClient'

export default async function ConcursosPage() {
  const supabase = await createClient()
  
  const { data: contests } = await supabase
  .from('contests')
  .select('*')
  .eq('status', 'published') 
  .order('event_date', { ascending: true })

  return <ConcursosClient initialContests={contests || []} />
}