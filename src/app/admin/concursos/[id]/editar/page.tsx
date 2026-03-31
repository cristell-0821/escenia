import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { updateContest } from '../../actions'
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') redirect('/')

  // Obtener concurso
  const { data: concurso } = await supabase
    .from('contests')
    .select('*')
    .eq('id', id)
    .single()

  if (!concurso) notFound()

  // Wrapper para pasar el ID
  async function handleUpdate(formData: FormData) {
    'use server'
    return updateContest(id, formData)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-[#dbc1bd]/30 pb-6">
        <Link 
          href="/admin/concursos"
          className="p-2 hover:bg-[#dbc1bd]/20 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#554240]" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-[#1e1b14]">Editar Concurso</h1>
          <p className="text-[#554240] mt-1">
            Modificando: <span className="font-medium">{concurso.title}</span>
          </p>
        </div>
      </div>

      <ContestForm 
        initialData={concurso} 
        action={handleUpdate}
      />
    </div>
  )
}