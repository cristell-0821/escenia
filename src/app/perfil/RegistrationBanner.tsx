'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Loader2, 
  AlertCircle, 
  Settings, 
  Theater, 
  Clock, 
  XCircle, 
  Check,
  Calendar,
  Globe,
  Mail
} from 'lucide-react'
import { getUserProfile, getMyGroupRequests, getMyGroup } from '@/lib/supabase/queries'
import type { Tables } from '@/types/database.types'

interface RegistrationBannerProps {
  userId: string
}

type BannerState = 
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'superadmin' }
  | { type: 'group_admin'; group: Tables<'groups'> }
  | { type: 'visitor_pending'; request: Tables<'group_requests'> }
  | { type: 'visitor_rejected'; request: Tables<'group_requests'> }
  | { type: 'visitor_empty' }

const ADMIN_EMAIL = 'tu-email@ejemplo.com'

// Fondo texturizado reutilizable
const texturaFondo = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%2385332a' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`
}

export default function RegistrationBanner({ userId }: RegistrationBannerProps) {
  const [state, setState] = useState<BannerState>({ type: 'loading' })

  useEffect(() => {
    loadStatus()
  }, [userId])

  const loadStatus = async () => {
    try {
      const profile = await getUserProfile(userId)

      // 🔹 SUPERADMIN
      if (profile.role === 'superadmin') {
        setState({ type: 'superadmin' })
        return
      }

      // 🔹 GROUP ADMIN
      if (profile.role === 'group_admin') {
        const membership = await getMyGroup(userId)

        // ✅ VALIDACIÓN CLAVE (esto te faltaba)
        if (!membership || !membership.groups) {
          setState({ type: 'error', message: 'No se encontró la agrupación' })
          return
        }

        setState({ type: 'group_admin', group: membership.groups })
        return
      }

      // 🔹 VISITOR
      const requests = await getMyGroupRequests(userId)
      const latestRequest = requests[0]

      if (!latestRequest) {
        setState({ type: 'visitor_empty' })
        return
      }

      if (latestRequest.status === 'pending') {
        setState({ type: 'visitor_pending', request: latestRequest })
        return
      }

      if (latestRequest.status === 'rejected') {
        setState({ type: 'visitor_rejected', request: latestRequest })
        return
      }

      setState({ type: 'visitor_empty' })

    } catch (err) {
      setState({ type: 'error', message: 'Error al cargar tu estado' })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // ════════════════════════════════════════════════════════════
  // LOADING - con textura
  // ════════════════════════════════════════════════════════════
  if (state.type === 'loading') {
    return (
      <div className="bg-[#faf3e7] p-10 border border-[#dbc1bd]/10 relative overflow-hidden" style={texturaFondo}>
        <div className="relative z-10 space-y-6 animate-pulse">
          <div className="w-12 h-12 bg-[#85332a]/20 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#85332a]/40 animate-spin" />
          </div>
          <div className="h-8 w-3/4 bg-[#85332a]/20"></div>
          <div className="h-4 w-full bg-[#dbc1bd]/30"></div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // ERROR - con textura
  // ════════════════════════════════════════════════════════════
  if (state.type === 'error') {
    return (
      <div className="bg-[#faf3e7] p-10 border border-[#85332a]/20 relative overflow-hidden" style={texturaFondo}>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-[#85332a]">
            <AlertCircle className="w-6 h-6" />
            <span className="font-bold tracking-widest uppercase text-sm">Error</span>
          </div>
          <p className="text-[#554240]">{state.message}</p>
          <button 
            onClick={loadStatus}
            className="text-sm font-bold tracking-widest uppercase text-[#85332a] border-b border-[#85332a] hover:opacity-70 transition-opacity"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // SUPERADMIN - con textura oscura
  // ════════════════════════════════════════════════════════════
  if (state.type === 'superadmin') {
    return (
      <div className="bg-[#1e1b14] text-[#fff8ef] p-10 relative overflow-hidden">
        {/* Textura invertida para fondo oscuro */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23fff8ef' fill-opacity='0.5' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}></div>
        <div className="relative z-10 space-y-6">
          <div className="w-12 h-12 bg-[#85332a] flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-serif text-3xl leading-tight">
            Panel de Administración
          </h3>
          <p className="text-[#dbc1bd] leading-relaxed">
            Tienes acceso total a la plataforma. Gestiona solicitudes, concursos y agrupaciones.
          </p>
          <Link 
            href="/admin"
            className="inline-block bg-[#85332a] text-white px-8 py-4 font-bold tracking-widest uppercase text-sm hover:bg-[#a44a3f] transition-all"
          >
            Acceder al Panel
          </Link>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // GROUP ADMIN - con textura
  // ════════════════════════════════════════════════════════════
  if (state.type === 'group_admin') {
    const { group } = state
    return (
      <div className="bg-[#faf3e7] p-10 border border-[#dbc1bd]/10 relative overflow-hidden" style={texturaFondo}>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#85332a] flex items-center justify-center">
              <Theater className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-[#554240] uppercase">Tu Agrupación</p>
              <h3 className="font-serif text-2xl text-[#1e1b14]">{group.name}</h3>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm text-[#554240] items-center">
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {group.city}{group.region && `, ${group.region}`}
            </span>
            <span className={`px-2 py-1 text-xs font-bold tracking-wider uppercase ${
              group.status === 'active' ? 'bg-green-100 text-green-800' : 
              group.status === 'suspended' ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {group.status}
            </span>
          </div>

          <Link 
            href="/dashboard/mi-agrupacion"
            className="inline-block w-full text-center border border-[#85332a] text-[#85332a] px-8 py-4 font-bold tracking-widest uppercase text-sm hover:bg-[#85332a] hover:text-white transition-all duration-300"
          >
            Gestionar Agrupación
          </Link>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // VISITOR PENDING - con textura
  // ════════════════════════════════════════════════════════════
  if (state.type === 'visitor_pending') {
    const { request } = state
    return (
      <div className="bg-[#faf3e7] p-10 border border-[#dbc1bd]/30 relative overflow-hidden" style={texturaFondo}>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-[#85332a]">
            <Clock className="w-6 h-6" />
            <span className="font-bold tracking-widest uppercase text-sm">En Revisión</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-3xl text-[#1e1b14]">
              {request.name}
            </h3>
            <p className="text-[#554240] flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {request.city}{request.region && `, ${request.region}`}
            </p>
          </div>

          <div className="border-t border-[#dbc1bd]/30 pt-4 space-y-3">
            <p className="text-sm text-[#554240] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-bold">Enviada:</span> {formatDate(request.created_at)}
            </p>
            <p className="text-sm text-[#554240]/70 leading-relaxed">
              Tu solicitud está siendo evaluada por nuestro equipo curatorial. 
              Recibirás una respuesta en tu correo en un plazo de 24-48 horas.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // VISITOR REJECTED - con textura
  // ════════════════════════════════════════════════════════════
  if (state.type === 'visitor_rejected') {
    return (
      <div className="bg-[#faf3e7] p-10 border border-[#85332a]/20 relative overflow-hidden" style={texturaFondo}>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-[#85332a]">
            <XCircle className="w-6 h-6" />
            <span className="font-bold tracking-widest uppercase text-sm">Solicitud No Aprobada</span>
          </div>

          <p className="text-[#554240] leading-relaxed">
            Tu solicitud anterior no cumplió con los criterios de evaluación. 
            Para más información o reconsideración, contacta directamente al administrador.
          </p>

          <div className="bg-white/50 p-4 border border-[#dbc1bd]/30">
            <p className="text-sm font-bold text-[#554240] uppercase tracking-wider mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contacto
            </p>
            <a 
              href={`mailto:${ADMIN_EMAIL}`}
              className="text-[#85332a] font-serif text-lg hover:underline"
            >
              {ADMIN_EMAIL}
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // VISITOR EMPTY (CTA original) - con textura
  // ════════════════════════════════════════════════════════════
  return (
    <div className="bg-[#faf3e7] p-10 relative overflow-hidden border border-[#dbc1bd]/10" style={texturaFondo}>
      <div className="relative z-10 space-y-6">
        <div className="w-12 h-12 bg-[#85332a] flex items-center justify-center">
          <img
                      src="/svg/mask.svg"
                      alt="mask icon"
                      className="w-6 h-6 invert brightness-0"
                  />
        </div>

        <h3 className="font-serif text-4xl text-[#1e1b14] leading-tight">
          Registrar Nueva Agrupación
        </h3>

        <p className="text-[#554240] leading-relaxed">
          ¿Diriges un elenco de danza tradicional? Únete a nuestro archivo cultural. Tu solicitud será revisada por nuestro equipo curatorial para asegurar la autenticidad y excelencia de nuestra plataforma.
        </p>

        <ul className="space-y-3 text-sm font-bold text-[#85332a] tracking-wide">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            VISIBILIDAD EDITORIAL
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            GESTIÓN DE EVENTOS
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            ACCESO A ARCHIVOS
          </li>
        </ul>

        <div className="pt-4">
          <Link 
            href="/perfil/solicitar"
            className="block w-full text-center border border-[#85332a] text-[#85332a] px-8 py-4 font-bold tracking-widest uppercase text-sm hover:bg-[#85332a] hover:text-white transition-all duration-300"
          >
            Solicitar Registro
          </Link>
        </div>
      </div>
    </div>
  )
}