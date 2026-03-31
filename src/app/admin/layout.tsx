import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#fff8ef]">
      {/* Header Admin */}
      <header className="bg-[#1e1b14] text-[#fff8ef] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/admin/solicitudes" className="hover:text-[#85332a] transition-colors">
              Solicitudes
            </Link>
            <Link href="/admin/concursos" className="hover:text-[#85332a] transition-colors">
              Concursos
            </Link>
            <Link href="/admin/agrupaciones" className="hover:text-[#85332a] transition-colors">
              Agrupaciones
            </Link>
            <Link href="/" className="text-[#dbc1bd] hover:text-white transition-colors">
              Salir
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}