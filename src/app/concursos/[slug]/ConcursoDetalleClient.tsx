'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  MapPin, 
  Wallet, 
  Trophy,
  Download,
  MessageCircle,
  Phone,
  ArrowRight,
  MapPinned,
  ArrowBigUp,
} from 'lucide-react'
import { BotonInscripcion } from '@/components/concursos/BotonInscripcion'
import { formatDateTimeDisplay } from '@/lib/date-utils'
import type { Tables } from '@/types/database.types'

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    calendar: <Calendar className={className} />,
    location: <MapPin className={className} />,
    payments: <Wallet className={className} />,
    trophy: <Trophy className={className} />,
    download: <Download className={className} />,
    chat: <MessageCircle className={className} />,
    phone: <Phone className={className} />,
    arrow: <ArrowRight className={className} />,
    map: <MapPinned className={className} />,
    pin: <ArrowBigUp className={className} />,
  }
  return <>{icons[name] || null}</>
}

// Tipos
interface Props {
  concurso: Tables<'contests'>
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
}

function getEmbedUrl(mapsUrl: string): string {
  if (!mapsUrl) return ''
  
  if (mapsUrl.includes('<iframe')) {
    const srcMatch = mapsUrl.match(/src="([^"]+)"/)
    return srcMatch ? srcMatch[1] : ''
  }
  
  if (mapsUrl.includes('/maps/embed')) {
    return mapsUrl
  }
  
  if (mapsUrl.includes('maps.app.goo.gl')) {
    return ''
  }
  
  try {
    const url = new URL(mapsUrl)
    const coordMatch = mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coordMatch) {
      const lat = coordMatch[1]
      const lng = coordMatch[2]
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!5e0!3m2!1ses!2spe!4v1`
    }
    
    const placeMatch = mapsUrl.match(/1s([^!]+)/)
    if (placeMatch) {
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${placeMatch[1]}!5e0!3m2!1ses!2spe!4v1`
    }
    
  } catch (e) {
    console.error('Error parsing maps URL:', e)
  }
  
  return ''
}

export default function ConcursoDetalleClient({ 
  concurso, 
  user, 
  initialRegistration 
}: Props) {
  const openMap = () => {
    const query = encodeURIComponent(`${concurso.location}, ${concurso.city}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  const openWhatsApp = () => {
    if (!concurso.contact_whatsapp) return
    const phone = concurso.contact_whatsapp.replace(/\D/g, '')
    const message = encodeURIComponent(`Hola, consulta sobre: ${concurso.title}`)
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  const embedUrl = concurso.maps_url ? getEmbedUrl(concurso.maps_url) : ''

  return (
    <main className="pb-24 bg-[#fff8ef]">
      
      {/* Hero Section */}
      <section className="w-full bg-[#f4ede1] px-8 py-12 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="relative w-full max-w-md mx-auto md:mx-0">
            <div className="relative aspect-[3/4] overflow-hidden shadow-2xl border-8 border-white rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
              {concurso.cover_url ? (
                <Image
                  src={concurso.cover_url}
                  alt={concurso.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-[#85332a] flex flex-col items-center justify-center text-white p-8 text-center">
                  <Trophy className="w-20 h-20 mb-4 text-[#fdbe49]" />
                  <p className="font-serif text-2xl italic">{concurso.title}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-[#85332a]/10 mix-blend-multiply" />
            </div>
          </div>

          <div className="space-y-8 md:pl-8">
            <div>
              <span className="text-[#85332a] font-sans font-bold uppercase tracking-[0.4em] text-xs mb-4 block">
                {concurso.edition || 'GRAN CONCURSO'}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] italic tracking-tighter text-[#85332a] mb-6 font-serif">
                {concurso.title}
              </h1>
            </div>
            
            <div className="space-y-2 border-l-4 border-[#85332a] pl-6 py-2">
              <p className="text-[#1e1b14] font-serif text-2xl font-bold">
                {concurso.city || 'Ciudad por definir'}, {concurso.region || 'Perú'}
              </p>
              <p className="text-[#554240] font-sans uppercase tracking-widest text-sm">
                {concurso.location || 'Sede por confirmar'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Information Grid */}
      <section className="px-8 py-16 max-w-7xl mx-auto space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Left Column */}
          <div className="md:col-span-5 space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold italic text-[#85332a] font-serif">
                Detalles del Evento
              </h2>
              <div className="space-y-6 pt-6">
                
                <div className="flex items-center gap-6">
                  <Icon name="calendar" className="text-[#85332a] w-6 h-6" />
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-[#554240]">
                      Fecha y Hora
                    </p>
                    <p className="text-xl font-bold font-serif text-[#1e1b14]">
                      {/* ✅ USAR LA FUNCIÓN CORRECTA */}
                      {formatDateTimeDisplay(concurso.event_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <Icon name="location" className="text-[#85332a] w-6 h-6" />
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-[#554240]">
                      Lugar
                    </p>
                    <p className="text-xl font-bold font-serif text-[#1e1b14]">
                      {concurso.location || 'Por definir'}
                    </p>
                    {concurso.city && (
                      <p className="text-[#554240]">{concurso.city}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            {concurso.maps_url && embedUrl ? (
              <div className="relative aspect-video bg-[#eee7db] overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full border-0 grayscale hover:grayscale-0 transition-all"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
                
                <a
                  href={concurso.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-tighter text-[#85332a] hover:bg-[#85332a] hover:text-white transition-colors"
                >
                  Abrir Maps →
                </a>
              </div>
            ) : (
              <div 
                onClick={openMap}
                className="relative aspect-video bg-[#eee7db] overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="map" className="w-12 h-12 text-[#85332a]/30" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-tighter text-[#1e1b14]">
                    {concurso.location || 'Ubicación por definir'}
                  </span>
                  <button className="text-[#85332a] text-xs font-bold uppercase hover:underline">
                    BUSCAR EN MAPS
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="md:col-span-7 bg-[#faf3e7] p-12 space-y-12 relative overflow-hidden">
            
            {concurso.prize && (
              <div className="space-y-4">
                <h3 className="text-3xl font-bold italic font-serif">Reconocimientos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                  <div className="p-6 bg-white border-b-4 border-[#85332a]">
                    <Icon name="payments" className="text-[#85332a] w-8 h-8 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-wider text-[#554240]">
                      Premio
                    </p>
                    <p className="text-2xl font-black font-serif text-[#85332a]">
                      {concurso.prize}
                    </p>
                  </div>
                  <div className="p-6 bg-white border-b-4 border-[#fdbe49]">
                    <Icon name="trophy" className="text-[#fdbe49] w-8 h-8 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-wider text-[#554240]">
                      Reconocimiento
                    </p>
                    <p className="text-2xl font-black font-serif">
                      PARTICIPACIÓN OFICIAL
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bases */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold italic font-serif">Bases del Concurso</h3>
                <p className="text-[#554240] font-sans leading-relaxed">
                  {concurso.bases_url 
                    ? 'Descarga el reglamento oficial y los requisitos técnicos para la participación.'
                    : 'Solicita las bases del concurso directamente por WhatsApp.'
                  }
                </p>
              </div>
              
              {concurso.bases_url ? (
                <a 
                  href={concurso.bases_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border border-[#dbc1bd] py-4 px-8 flex items-center justify-center gap-3 hover:bg-[#1e1b14] hover:text-white transition-all duration-300"
                >
                  <Icon name="download" className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-widest text-sm">
                    Descargar Bases (PDF)
                  </span>
                </a>
              ) : (
                <button 
                  onClick={openWhatsApp}
                  disabled={!concurso.contact_whatsapp}
                  className="w-full border border-[#dbc1bd] py-4 px-8 flex items-center justify-center gap-3 hover:bg-[#1e1b14] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="chat" className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-widest text-sm">
                    Solicitar Bases por WhatsApp
                  </span>
                </button>
              )}
            </div>

            {concurso.description && (
              <div className="pt-6 border-t border-[#dbc1bd]/30">
                <h3 className="text-2xl font-bold italic font-serif mb-4">
                  Sobre el Concurso
                </h3>
                <p className="text-[#554240] font-sans leading-relaxed">
                  {concurso.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#85332a] p-12 md:p-20 text-center space-y-8 flex flex-col items-center">
          <h2 className="text-white text-4xl md:text-6xl font-bold italic max-w-3xl font-serif">
            ¿Listo para dejar tu huella en la pista?
          </h2>
          
          <BotonInscripcion 
            contestId={concurso.id}
            contestTitle={concurso.title}
            user={user}
            initialRegistration={initialRegistration}
            requiresApproval={concurso.requires_approval ?? false}
          />
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-[#dbc1bd] pt-16">
          <div className="md:col-span-5">
            <h2 className="text-4xl font-bold italic mb-4 font-serif">
              ¿Dudas sobre el concurso?
            </h2>
            <p className="text-[#554240]">
              Nuestro equipo de organización está disponible para resolver cualquier consulta.
            </p>
          </div>
          <div className="md:col-span-7 flex flex-wrap gap-4 items-center">
            {concurso.contact_whatsapp && (
              <button
                onClick={openWhatsApp}
                className="flex-1 min-w-[200px] flex items-center justify-between p-6 bg-[#eee7db] hover:bg-[#85332a] hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <Icon name="chat" className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-widest text-sm">WhatsApp</span>
                </div>
                <Icon name="arrow" className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
            
            {concurso.contact_email_public && (
              <a
                href={`mailto:${concurso.contact_email_public}`}
                className="flex-1 min-w-[200px] flex items-center justify-between p-6 bg-[#eee7db] hover:bg-[#85332a] hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <Icon name="phone" className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-widest text-sm">Email</span>
                </div>
                <Icon name="arrow" className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}