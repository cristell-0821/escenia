import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Theater, Image, Calendar, ExternalLink, SquarePen, Trophy, Users } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard')
  }

  // Verificar que sea group_admin
  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'group_admin' || !membership.group_id) {
    redirect('/perfil') 
  }

  // Obtener info del grupo
  const { data: group } = await supabase
    .from('groups')
    .select('id, name, slug')
    .eq('id', membership.group_id)
    .single()

  return (
    <div className="min-h-screen bg-[#fff8ef]">

      {/* Main Navigation Tabs */}
      <div className="pt-24 pb-8 max-w-7xl mx-auto px-6">
        <nav className="flex gap-12 border-b border-[#dbc1bd]/30">
          <TabLink href="/dashboard/mi-agrupacion" icon={SquarePen} label="Perfil" />
          <TabLink href="/dashboard/mi-agrupacion/galeria" icon={Image} label="Galería" />
          <TabLink href="/dashboard/mi-agrupacion/agenda" icon={Calendar} label="Agenda" />
          <TabLink href="/dashboard/mi-agrupacion/concursos" icon={Trophy} label="Mis Concursos" />
        </nav>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 pb-32">
        {children}
      </main>
    </div>
  )
}

function TabLink({ 
  href, 
  icon: Icon, 
  label 
}: { 
  href: string
  icon: any
  label: string 
}) {
  return (
    <Link 
      href={href}
      className="pb-4 text-[#554240] hover:text-[#85332a] font-medium tracking-widest uppercase text-sm flex items-center gap-2 transition-colors border-b-2 border-transparent hover:border-[#85332a]"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}