'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { getGroupBySlug, getGroupGallery, getGroupEvents } from '@/lib/supabase/queries'
import type { Tables } from '@/types/database.types'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Mail, Users, Calendar, Share2 } from 'lucide-react'
import YoutubeIcon from '@/assets/icons/youtube.svg'
import InstagramIcon from '@/assets/icons/instagram.svg'
import FacebookIcon from '@/assets/icons/facebook.svg'

export default function GroupDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [group, setGroup] = useState<Tables<'groups'> | null>(null)
  const [gallery, setGallery] = useState<Tables<'gallery_items'>[]>([])
  const [events, setEvents] = useState<Tables<'events'>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  })
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const groupData = await getGroupBySlug(slug)
        setGroup(groupData)

        if (groupData.id) {
          const [galleryData, eventsData] = await Promise.all([
            getGroupGallery(groupData.id),
            getGroupEvents(groupData.id),
          ])
          setGallery(galleryData)
          setEvents(eventsData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAllData()
  }, [slug])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  if (isLoading) {
    return (
      <main className="max-w-full">
        <Skeleton className="h-[600px] mb-12 w-full" />
        <div className="max-w-7xl mx-auto px-8">
          <Skeleton className="h-12 mb-4 w-1/2" />
          <Skeleton className="h-6 mb-8 w-full" />
        </div>
      </main>
    )
  }

  if (!group) {
    return (
      <main className="max-w-7xl mx-auto px-8 py-20 text-center">
        <h2
          className="text-4xl font-bold text-[#1E1B14] mb-4"
          style={{ fontFamily: 'var(--font-newsreader)' }}
        >
          Agrupación no encontrada
        </h2>
      </main>
    )
  }

  // Calcular años de trayectoria
  const currentYear = new Date().getFullYear()
  const yearsActive = group.founded_year ? currentYear - group.founded_year : null

  return (
    <main>
      {/* ════════════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[400px] md:h-[751px] overflow-hidden flex items-end">
        <div className="absolute inset-0">
          {group.cover_url ? (
            <Image
              src={group.cover_url}
              alt={group.name}
              fill
              className="w-full h-full object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-[#EEE7DB]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B14]/80 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full px-8 pb-12 md:pb-24 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="font-label text-white uppercase tracking-[0.3em] text-sm mb-4 block">
              Patrimonio Vivo • {group.region}
            </span>
            <h1
              className="text-5xl md:text-9xl text-white font-black leading-none tracking-tighter"
              style={{ fontFamily: 'var(--font-newsreader)' }}
            >
              {group.name}
            </h1>
            {group.slogan && (
              <p className="text-[#FFDEAB] text-xl md:text-2xl italic mt-4 max-w-2xl"
                 style={{ fontFamily: 'var(--font-newsreader)' }}>
                {group.slogan}
              </p>
            )}
          </div>
          {/*
          <button className="bg-[#85332A] text-white px-8 md:px-12 py-4 md:py-5 font-bold uppercase tracking-widest hover:bg-[#A44A3F] transition-all active:scale-95">
            Seguir Grupo
          </button> */}
        </div> 
      </section>

      {/* ════════════════════════════════════════════════════════════
          NOSOTROS / ABOUT
          ════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FFF8EF] py-20 md:py-24 px-8 weave-pattern">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">
          <div className="md:col-span-4">
            <h2
              className="text-4xl md:text-5xl text-[#85332A] italic leading-tight mb-8"
              style={{ fontFamily: 'var(--font-newsreader)' }}
            >
              {group.slogan || 'Preservando nuestras raíces culturales.'}
            </h2>
            <div className="h-1 w-24 bg-[#FDBE49]"></div>
          </div>

          <div className="md:col-span-8 space-y-8">
            <p
              className="text-1xl text-[#554240] leading-relaxed text-justify"
              style={{ fontFamily: 'var(--font-newsreader)' }}
            >
              {group.description ||
                'Fundada con el compromiso de preservar y difundir las danzas tradicionales de nuestra región.'}
            </p>

            {/* Stats dinámicos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 pt-8">
              {yearsActive && (
                <div>
                  <span
                    className="text-5xl font-bold text-[#85332A] block mb-2"
                    style={{ fontFamily: 'var(--font-newsreader)' }}
                  >
                    {yearsActive}+
                  </span>
                  <span className="font-label uppercase tracking-widest text-xs opacity-60">
                    Años de Tradición
                  </span>
                </div>
              )}
              
              {group.dancers_count && (
                <div>
                  <span
                    className="text-5xl font-bold text-[#85332A] block mb-2"
                    style={{ fontFamily: 'var(--font-newsreader)' }}
                  >
                    {group.dancers_count}
                  </span>
                  <span className="font-label uppercase tracking-widest text-xs opacity-60">
                    Danzantes Activos
                  </span>
                </div>
              )}
              {/*
              {group.founded_year && (
                <div>
                  <span
                    className="text-5xl font-bold text-[#85332A] block mb-2"
                    style={{ fontFamily: 'var(--font-newsreader)' }}
                  >
                    {group.founded_year}
                  </span>
                  <span className="font-label uppercase tracking-widest text-xs opacity-60">
                    Año de Fundación
                  </span>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          GALERÍA
          ════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF3E7] py-24 md:py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 md:mb-20 gap-4">
            <h2
              className="text-5xl md:text-6xl font-bold text-[#1E1B14]"
              style={{ fontFamily: 'var(--font-newsreader)' }}
            >
              Instantes de Gloria
            </h2>
          </div>

          {gallery.length === 0 ? (
            <div className="text-center py-20">
              <p
                className="text-xl text-[#554240]"
                style={{ fontFamily: 'var(--font-newsreader)' }}
              >
                Aún no hay fotos en la galería
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[300px]">
              {gallery.map((item, idx) => (
                <div
                  key={item.id}
                  className={`relative overflow-hidden group ${
                    idx === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  } ${idx === 1 ? 'md:col-span-2' : ''}`}
                >
                  <Image
                    src={item.url}
                    alt={item.caption || 'Galería'}
                    fill
                    className={`w-full h-full object-cover ${
                      idx === 0
                        ? 'grayscale hover:grayscale-0'
                        : 'hover:scale-105'
                    } transition-all duration-700`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          AGENDA
          ════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FFF8EF] py-24 md:py-32 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-8 mb-16 md:mb-24">
          <h2
            className="text-5xl md:text-6xl font-bold text-[#1E1B14] shrink-0"
            style={{ fontFamily: 'var(--font-newsreader)' }}
          >
            Agenda Cultural
          </h2>
          <div className="h-px w-full bg-[#DBC1BD]/20"></div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p
              className="text-xl text-[#554240]"
              style={{ fontFamily: 'var(--font-newsreader)' }}
            >
              No hay eventos próximos
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {events.map((event) => {
              const eventDate = event.event_date ? new Date(event.event_date) : null
              const formattedDate = eventDate
                ? eventDate
                    .toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                    })
                    .toUpperCase()
                : 'FECHA TBD'

              return (
                <div
                  key={event.id}
                  className="group py-8 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 border-b border-[#DBC1BD]/20 hover:bg-[#FAF3E7] transition-colors px-4 md:px-0"
                >
                  <div className="flex items-baseline gap-6 md:gap-8">
                    <span
                      className="text-4xl md:text-5xl text-[#85332A]/40 group-hover:text-[#85332A] transition-colors"
                      style={{ fontFamily: 'var(--font-newsreader)' }}
                    >
                      {formattedDate}
                    </span>
                    <div>
                      <h3
                        className="text-2xl md:text-3xl font-bold text-[#1E1B14] mb-1"
                        style={{ fontFamily: 'var(--font-newsreader)' }}
                      >
                        {event.title}
                      </h3>
                      <p className="font-label text-[#554240] uppercase tracking-widest text-xs">
                        {event.location || event.city || 'Ubicación por confirmar'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {event.event_date && (
                      <span className="font-label text-sm text-[#554240] italic">
                        {new Date(event.event_date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        HRS
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="border border-[#DBC1BD]/40 px-6 md:px-8 py-2 md:py-3 font-bold uppercase tracking-widest text-xs hover:bg-[#1E1B14] hover:text-white transition-all"
                    >
                      Más Info
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>  
      </section>

      {/* ════════════════════════════════════════════════════════════
          CONTACTO
          ════════════════════════════════════════════════════════════ */}
      <section className="bg-[#1E1B14] text-[#F2E9DC] py-24 md:py-32 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Contact Info */}
          <div>
            <h2
              className="text-5xl md:text-6xl font-bold mb-12 md:mb-16"
              style={{ fontFamily: 'var(--font-newsreader)' }}
            >
              Hablemos de Arte
            </h2>

            <div className="space-y-12">
              {group.city && (
                <div className="flex items-start gap-6">
                  <MapPin className="text-[#FFDEAB] w-7 h-7" />
                  <div>
                    <h5 className="font-label uppercase tracking-widest text-xs text-[#FFDEAB] mb-2">
                      Ubicación
                    </h5>
                    <p
                      className="text-2xl italic text-[#F2E9DC]"
                      style={{ fontFamily: 'var(--font-newsreader)' }}
                    >
                      {group.city}
                      {group.region && `, ${group.region}`}
                    </p>
                  </div>
                </div>
              )}

              {group.contact_email && (
                <div className="flex items-start gap-6">
                  <Mail className="text-[#FFDEAB] w-7 h-7" />
                  <div>
                    <h5 className="font-label uppercase tracking-widest text-xs text-[#FFDEAB] mb-2">
                      Email
                    </h5>
                    <a
                      href={`mailto:${group.contact_email}`}
                      className="text-2xl italic text-[#F2E9DC] hover:text-[#FFDEAB] transition-colors"
                      style={{ fontFamily: 'var(--font-newsreader)' }}
                    >
                      {group.contact_email}
                    </a>
                  </div>
                </div>
              )}

              {(group.instagram || group.facebook || group.youtube) && (
                <div className="flex items-start gap-6">
                  <span className="material-symbols-outlined text-[#FFDEAB] text-3xl">
                    <Share2 className="text-[#FFDEAB] w-7 h-7"  />
                  </span>
                  <div>
                    <h5 className="font-label uppercase tracking-widest text-xs text-[#FFDEAB] mb-4">
                      Síguenos
                    </h5>
                    <div className="flex gap-6">
                      {group.facebook && (
                        <a
                          href={group.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D1BCBA] hover:text-[#FFDEAB] transition-colors font-label text-sm"
                        >
                          <FacebookIcon className="w-4 h-4 text-[#FFDEAB]" />
                          Facebook
                        </a>
                      )}
                      {group.instagram && (
                        <a
                          href={`https://instagram.com/${group.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D1BCBA] hover:text-[#FFDEAB] transition-colors font-label text-sm"
                        >
                          <InstagramIcon className="w-4 h-4 text-[#FFDEAB]" />
                          Instagram
                        </a>
                      )}
                      {group.youtube && (
                        <a
                          href={group.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D1BCBA] hover:text-[#FFDEAB] transition-colors font-label text-sm flex items-center gap-2"
                        >
                          <YoutubeIcon className="w-4 h-4 text-[#FFDEAB]" />
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#2D2822] p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block font-label text-xs uppercase tracking-[0.2em] mb-4 text-[#D1BCBA]">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Escribe tu nombre"
                  className="w-full bg-transparent border-b border-[#DBC1BD]/30 py-4 focus:outline-none focus:border-[#FFDEAB] transition-colors text-white font-headline text-xl italic placeholder:text-white/20"
                  style={{ fontFamily: 'var(--font-newsreader)' }}
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-[0.2em] mb-4 text-[#D1BCBA]">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="w-full bg-transparent border-b border-[#DBC1BD]/30 py-4 focus:outline-none focus:border-[#FFDEAB] transition-colors text-white font-headline text-xl italic placeholder:text-white/20"
                  style={{ fontFamily: 'var(--font-newsreader)' }}
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-[0.2em] mb-4 text-[#D1BCBA]">
                  Asunto
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-transparent border-b border-[#DBC1BD]/30 py-4 focus:outline-none focus:border-[#FFDEAB] transition-colors text-white font-headline text-xl italic appearance-none"
                  style={{ fontFamily: 'var(--font-newsreader)' }}
                >
                  <option value="general" className="bg-[#1E1B14]">
                    Consulta General
                  </option>
                  <option value="contrataciones" className="bg-[#1E1B14]">
                    Contrataciones
                  </option>
                  <option value="talleres" className="bg-[#1E1B14]">
                    Talleres
                  </option>
                  <option value="prensa" className="bg-[#1E1B14]">
                    Prensa
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-[0.2em] mb-4 text-[#D1BCBA]">
                  Mensaje
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Cuéntanos cómo podemos colaborar"
                  rows={5}
                  className="w-full bg-transparent border-b border-[#DBC1BD]/30 py-4 focus:outline-none focus:border-[#FFDEAB] transition-colors text-white font-headline text-xl italic placeholder:text-white/20 resize-none"
                  style={{ fontFamily: 'var(--font-newsreader)' }}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#F2E9DC] text-[#1E1B14] font-bold uppercase tracking-widest py-6 hover:bg-[#FFDEAB] transition-colors active:scale-95"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-[#fff8ef] max-w-md w-full p-6 border border-[#dbc1bd]/30">

              <h2 className="font-serif text-2xl mb-4 text-[#1e1b14]">
                Contacto del Evento
              </h2>

              {selectedEvent.contact_info ? (
                <div className="space-y-4">
                  <p className="text-[#554240]">
                    Contáctate a:
                  </p>

                  <div className="bg-white border border-[#dbc1bd] p-4 text-center text-[#1e1b14] font-medium">
                    {selectedEvent.contact_info}
                  </div>

                  {/* BONUS: detectar WhatsApp */}
                  {selectedEvent.contact_info.includes('+') && (
                    <a
                      href={`https://wa.me/${selectedEvent.contact_info.replace(/\D/g, '')}`}
                      target="_blank"
                      className="block text-center bg-green-600 text-white py-2 hover:bg-green-700"
                    >
                      Abrir WhatsApp
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-[#554240]">
                  No hay información de contacto disponible.
                </p>
              )}

              <button
                onClick={() => setSelectedEvent(null)}
                className="mt-6 w-full border border-[#554240] py-2 text-[#554240] hover:bg-[#554240] hover:text-white transition"
              >
                Cerrar
              </button>

            </div>
          </div>
        )}
      </section>
    </main>
  )
}