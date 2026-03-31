import { createClient } from '@/lib/supabase/server'
import { aprobarSolicitud, rechazarSolicitud } from './actions'
import { revalidatePath } from 'next/cache'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Mail, 
  User,
  Calendar,
  ExternalLink,
  Check
} from 'lucide-react'
import Link from 'next/link'

export default async function SolicitudesPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const success = searchParams?.success

  // Cargar solicitudes pendientes y ya procesadas
  const { data: solicitudes } = await supabase
    .from('group_requests')
    .select('*')
    .order('created_at', { ascending: false })

  const pendientes = solicitudes?.filter(s => s.status === 'pending') || []
  const historial = solicitudes?.filter(s => s.status !== 'pending') || []

  return (
    <div className="space-y-12">
      
      {/* Header */}
      <div className="border-b border-[#dbc1bd]/30 pb-6">
        <h1 className="font-serif text-4xl text-[#1e1b14]">Solicitudes de Registro</h1>
        <p className="text-[#554240] mt-2">
          Gestiona las solicitudes de nuevas agrupaciones culturales
        </p>
      </div>

      {/* Mensaje de éxito */}
      {success === 'aprobada' && (
        <div className="bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-800">
            Solicitud aprobada exitosamente. La agrupación ha sido creada.
          </p>
        </div>
      )}

      {/* Pendientes */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl text-[#85332a] flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Pendientes ({pendientes.length})
        </h2>

        {pendientes.length === 0 ? (
          <div className="bg-[#faf3e7] p-8 border border-[#dbc1bd]/20 text-center" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%2385332a' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}>
            <p className="text-[#554240]">No hay solicitudes pendientes</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendientes.map((solicitud) => (
              <SolicitudCard key={solicitud.id} solicitud={solicitud} />
            ))}
          </div>
        )}
      </section>

      {/* Historial */}
      {historial.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-[#554240] flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Historial ({historial.length})
          </h2>
          
          <div className="grid gap-4 opacity-60">
            {historial.slice(0, 5).map((solicitud) => (
              <div 
                key={solicitud.id} 
                className="bg-[#faf3e7] p-6 border border-[#dbc1bd]/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {solicitud.status === 'approved' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <h4 className="font-serif text-lg text-[#1e1b14]">{solicitud.name}</h4>
                    <p className="text-sm text-[#554240]">{solicitud.city}, {solicitud.region}</p>
                  </div>
                </div>
                <span className="text-xs text-[#554240]/60">
                  {solicitud.reviewed_at ? new Date(solicitud.reviewed_at).toLocaleDateString('es-PE') : ''}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}

// Componente para card de solicitud pendiente
function SolicitudCard({ solicitud }: { solicitud: any }) {
  return (
    <div className="bg-[#faf3e7] p-8 border border-[#dbc1bd]/30 relative overflow-hidden" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%2385332a' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`
    }}>
      <div className="relative z-10">
        {/* Header de la card */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-serif text-3xl text-[#1e1b14]">{solicitud.name}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-[#554240]">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {solicitud.city}, {solicitud.region}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(solicitud.created_at).toLocaleDateString('es-PE')}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold tracking-wider uppercase">
            Pendiente
          </span>
        </div>

        {/* Detalles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-3">
            <h4 className="font-bold text-xs tracking-widest uppercase text-[#554240]">Contacto</h4>
            <p className="flex items-center gap-2 text-[#554240]">
              <Mail className="w-4 h-4" />
              {solicitud.contact_email}
            </p>
            {solicitud.contact_phone && (
              <p className="text-[#554240]">{solicitud.contact_phone}</p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs tracking-widest uppercase text-[#554240]">Solicitante</h4>
            <p className="flex items-center gap-2 text-[#554240]">
              <User className="w-4 h-4" />
              ID: {solicitud.user_id.slice(0, 8)}...
            </p>
            {solicitud.founded_year && (
              <p className="text-[#554240]">Fundada en {solicitud.founded_year}</p>
            )}
          </div>
        </div>

        {solicitud.description && (
          <div className="mb-8">
            <h4 className="font-bold text-xs tracking-widest uppercase text-[#554240] mb-2">Descripción</h4>
            <p className="text-[#554240] leading-relaxed bg-white/50 p-4 border border-[#dbc1bd]/20">
              {solicitud.description}
            </p>
          </div>
        )}

        {/* Redes */}
        {(solicitud.instagram || solicitud.facebook || solicitud.website) && (
          <div className="flex gap-4 mb-8 text-sm">
            {solicitud.instagram && (
              <span className="text-[#85332a]">IG: @{solicitud.instagram}</span>
            )}
            {solicitud.facebook && (
              <a href={solicitud.facebook} target="_blank" rel="noopener" className="text-[#85332a] flex items-center gap-1 hover:underline">
                Facebook <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {solicitud.website && (
              <a href={solicitud.website} target="_blank" rel="noopener" className="text-[#85332a] flex items-center gap-1 hover:underline">
                Web <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-4 pt-6 border-t border-[#dbc1bd]/30">
          <AprobarButton requestId={solicitud.id} />
          <RechazarForm requestId={solicitud.id} />
        </div>

      </div>
    </div>
  )
}

// Componente para aprobar
function AprobarButton({ requestId }: { requestId: string }) {
  async function handleAprobar() {
    'use server'
    const result = await aprobarSolicitud(requestId)
    if (result.success) {
      revalidatePath('/admin/solicitudes')
    }
  }

  return (
    <form action={handleAprobar}>
      <button 
        type="submit"
        className="flex items-center gap-2 bg-[#85332a] text-white px-6 py-3 font-bold tracking-widest uppercase text-sm hover:bg-[#a44a3f] transition-all"
      >
        <CheckCircle className="w-4 h-4" />
        Aprobar
      </button>
    </form>
  )
}

// Componente para rechazar
function RechazarForm({ requestId }: { requestId: string }) {
  async function handleRechazar(formData: FormData) {
    'use server'
    const motivo = formData.get('motivo') as string
    const result = await rechazarSolicitud(requestId, motivo)
    if (result.success) {
      revalidatePath('/admin/solicitudes')
    }
  }

  return (
    <form action={handleRechazar} className="flex-1 flex gap-4">
      <input 
        name="motivo"
        type="text"
        placeholder="Motivo del rechazo..."
        required
        minLength={10}
        className="flex-1 bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
      />
      <button 
        type="submit"
        className="flex items-center gap-2 border border-[#85332a] text-[#85332a] px-6 py-3 font-bold tracking-widest uppercase text-sm hover:bg-[#85332a] hover:text-white transition-all"
      >
        <XCircle className="w-4 h-4" />
        Rechazar
      </button>
    </form>
  )
}