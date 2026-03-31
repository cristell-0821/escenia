import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { updateContestAction } from '@/app/admin/concursos/actions'
import ContestForm from '@/components/admin/ContestForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarConcursoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 🔹 Obtener membership (NUEVO)
  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  // Solo group_admin puede acceder
  if (!membership || membership.role !== 'group_admin' || !membership.group_id) {
    redirect('/dashboard')
  }

  // Obtener concurso y verificar que pertenezca a esta agrupación
  const { data: concurso } = await supabase
    .from('contests')
    .select('*')
    .eq('id', id)
    .eq('organizer_group_id', membership.group_id) // ✅ CORREGIDO
    .eq('type', 'private')
    .single()

  if (!concurso) notFound()

  // Solo permitir editar si está en draft
  if (concurso.status !== 'draft') {
    redirect('/dashboard/mi-agrupacion/concursos')
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    return updateContestAction(id, formData)
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
          <h1 className="font-serif text-3xl text-[#1e1b14]">Editar Concurso</h1>
          <p className="text-[#554240] mt-1">
            Modificando: <span className="font-medium">{concurso.title}</span>
          </p>
          <span className="inline-block mt-2 px-2 py-1 text-xs font-bold uppercase bg-yellow-100 text-yellow-800">
            Borrador
          </span>
        </div>
      </div>

      {/* Formulario */}
      <ContestForm 
        initialData={concurso}
        action={handleUpdate}
        redirectPath="/dashboard/mi-agrupacion/concursos"
      />
    </div>
  )
}