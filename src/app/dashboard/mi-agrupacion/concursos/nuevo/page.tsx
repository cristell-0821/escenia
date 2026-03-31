// src/app/dashboard/mi-agrupacion/concursos/nuevo/page.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ContestForm from '@/components/admin/ContestForm'
import { createContestAction } from '@/app/admin/concursos/actions'

export default async function NuevoConcursoPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, group_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'group_admin' || !profile.group_id) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/mi-agrupacion/concursos"
          className="text-[#554240] hover:text-[#85332a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-[#1e1b14]">Crear Nuevo Concurso</h1>
          <p className="text-[#554240] mt-1">
            Crea un concurso privado para tu agrupación
          </p>
        </div>
      </div>

      {/* Formulario */}
      <ContestForm 
        action={createContestAction}
        redirectPath="/dashboard/mi-agrupacion/concursos"
      />
    </div>
  )
}