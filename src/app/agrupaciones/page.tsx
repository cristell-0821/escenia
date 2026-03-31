import { Suspense } from 'react' 
import { createClient } from '@/lib/supabase/server'
import AgrupacionesContent from './AgrupacionesContent'
import Loading from './loading'

// ✅ ISR: Revalida cada 5 minutos automáticamente
export const revalidate = 300

export default async function AgrupacionesPage() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, city, region, cover_url, slug, description')
    .eq('status', 'active')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching groups:', error)
  }

  return (
    <Suspense fallback={<Loading />}>
      <AgrupacionesContent initialGroups={data || []} />
    </Suspense>
  )
}