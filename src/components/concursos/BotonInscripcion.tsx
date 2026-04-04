'use client'

import { useState } from 'react'
import { createRegistration, cancelRegistration } from '@/lib/actions/inscripciones'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface BotonInscripcionProps {
  contestId: string
  contestTitle: string
  user?: {
    id: string
    role: string
    groupId?: string
    groupName?: string
  } | null
  initialRegistration?: {
    id: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
    notes?: string
  } | null
  requiresApproval?: boolean
}

export function BotonInscripcion({ 
  contestId, 
  contestTitle, 
  user, 
  initialRegistration,
  requiresApproval 
}: BotonInscripcionProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [registration, setRegistration] = useState(initialRegistration)

  // Si no hay usuario, mostrar login
  if (!user) {
    return (
      <div className="space-y-4 w-full max-w-md">
        <Button 
          onClick={() => router.push(`/login?redirect=/concursos/${contestId}`)}
          className="w-full bg-white text-[#85332a] hover:bg-white/90 py-6 px-12 font-black uppercase tracking-[0.2em] text-lg"
          size="lg"
        >
          INSCRIBIR MI AGRUPACIÓN
        </Button>
        <p className="text-white/60 text-[10px] uppercase tracking-widest text-center">
          *Requiere inicio de sesión como administrador de agrupación
        </p>
      </div>
    )
  }

  // Si no es admin de agrupación
  if (user?.role !== 'group_admin') {
    return (
      <div className="space-y-4 w-full max-w-md">
        <div className="bg-white/10 p-6 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold uppercase tracking-widest">Acceso restringido</span>
          </div>
          <p className="text-white/70 text-sm">
            Solo los administradores de agrupaciones pueden inscribirse a concursos.
          </p>
        </div>
      </div>
    )
  }

  // Ya tiene inscripción - mostrar estado
  if (registration) {
    const config = {
      pending: {
        icon: Clock,
        text: 'Inscripción pendiente de aprobación',
        subtext: 'Tu solicitud está siendo revisada por la organización',
        color: 'text-yellow-300',
        bg: 'bg-yellow-500/10',
        canCancel: true
      },
      approved: {
        icon: CheckCircle,
        text: '¡Inscripción confirmada!',
        subtext: 'Tu agrupación está participando en este concurso',
        color: 'text-green-300',
        bg: 'bg-green-500/10',
        canCancel: false
      },
      rejected: {
        icon: XCircle,
        text: 'Inscripción no aprobada',
        subtext: registration.notes || 'Contacta a la organización para más información',
        color: 'text-red-300',
        bg: 'bg-red-500/10',
        canCancel: false
      }
    }[registration.status]

    const Icon = config.icon

    return (
      <div className={`w-full max-w-md ${config.bg} p-6 space-y-4`}>
        <div className="flex items-start gap-4">
          <Icon className={`w-6 h-6 ${config.color} mt-1`} />
          <div className="flex-1">
            <h3 className={`font-bold uppercase tracking-widest ${config.color}`}>
              {config.text}
            </h3>
            <p className="text-white/70 text-sm mt-1">{config.subtext}</p>
          </div>
        </div>
        
        {config.canCancel && (
          <Button
            variant="outline"
            onClick={async () => {
              if (!confirm('¿Cancelar solicitud de inscripción?')) return
              setSubmitting(true)
              const result = await cancelRegistration(registration.id)
              if (result.error) {
                toast.error(result.error)
              } else {
                toast.success('Solicitud cancelada')
                setRegistration(null)
              }
              setSubmitting(false)
            }}
            disabled={submitting}
            className="w-full bg-transparent border border-white/30 text-white/80 hover:bg-white/10 hover:text-white text-xs font-bold uppercase tracking-widest"
          >
            {submitting ? 'Procesando...' : 'Cancelar solicitud'}
          </Button>
        )}
      </div>
    )
  }

  // Puede inscribirse
  async function handleInscribir() {
    if (!user?.groupId) {
      toast.error('No tienes una agrupación asignada')
      return
    }

    setSubmitting(true)
    
    const result = await createRegistration({
      contest_id: contestId,
      group_id: user.groupId,
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.message)
      if (result.registration) {
        setRegistration({
          id: result.registration.id,
          status: (result.registration.status ?? 'pending') as 'pending' | 'approved' | 'rejected',
          createdAt: result.registration.created_at!,
          notes: result.registration.notes ?? undefined
        })
      }
    }
    
    setSubmitting(false)
  }

  return (
    <div className="space-y-4 w-full max-w-md">
      <Button 
        onClick={handleInscribir}
        disabled={submitting}
        className="w-full bg-white text-[#85332a] hover:bg-white/90 hover:scale-[1.02] active:scale-95 transition-all py-6 px-12 font-black uppercase tracking-[0.2em] text-lg"
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            PROCESANDO...
          </>
        ) : (
          <>
            INSCRIBIR {user?.groupName || 'MI AGRUPACIÓN'}
          </>
        )}
      </Button>
      <p className="text-white/60 text-[10px] uppercase tracking-widest text-center">
        {requiresApproval 
          ? '*La inscripción requiere aprobación de la organización' 
          : '*Inscripción directa sin aprobación'}
      </p>
    </div>
  )
}