import { createContest } from '../actions'
import ContestForm from '@/components/admin/ContestForm'

export default function NuevoConcursoPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-[#dbc1bd]/30 pb-6">
        <h1 className="font-serif text-3xl text-[#1e1b14]">Nuevo Concurso</h1>
        <p className="text-[#554240] mt-2">Crea un nuevo concurso cultural</p>
      </div>
      
      <ContestForm action={createContest} />
    </div>
  )
}