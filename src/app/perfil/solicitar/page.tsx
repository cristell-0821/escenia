'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { crearSolicitud } from './actions'
import Link from 'next/link'

const REGIONES_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 
  'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco',
  'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 
  'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
  'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
]

export default function SolicitarAgrupacionPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const [supabase] = useState(() => createClient())
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
      }
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!userId) return

    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    const data = {
      user_id: userId,
      name: formData.get('name') as string,
      city: formData.get('city') as string,
      region: formData.get('region') as string,
      contact_email: formData.get('contact_email') as string,
      description: formData.get('description') as string || undefined,
      contact_phone: formData.get('contact_phone') as string || undefined,
      instagram: formData.get('instagram') as string || undefined,
      facebook: formData.get('facebook') as string || undefined,
      youtube: formData.get('youtube') as string || undefined,
      tiktok: formData.get('tiktok') as string || undefined,
      founded_year: formData.get('founded_year') ? parseInt(formData.get('founded_year') as string) : undefined,
    }

    const result = await crearSolicitud(data)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // Si es exitoso, el redirect del server action maneja la navegación
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#fff8ef] flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-green-600 text-2xl">check</span>
          </div>
          <h2 className="font-serif text-3xl text-[#1e1b14]">¡Solicitud Enviada!</h2>
          <p className="text-[#554240]">
            Tu solicitud está siendo revisada. Recibirás una respuesta en tu correo en las próximas 24-48 horas.
          </p>
          <Link 
            href="/perfil"
            className="inline-block bg-[#85332a] text-white px-8 py-4 font-bold tracking-widest uppercase text-sm hover:bg-[#a44a3f] transition-all"
          >
            Volver a Mi Perfil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fff8ef]">
      {/* Header */}
      <section className="px-6 pt-12 pb-8 max-w-3xl mx-auto">
        <Link 
          href="/perfil"
          className="text-[#554240] hover:text-[#85332a] transition-colors text-sm font-bold tracking-widest uppercase mb-6 inline-block"
        >
          ← Volver
        </Link>
        <h2 className="text-5xl md:text-6xl font-serif leading-none text-[#1e1b14]">
          Registrar Agrupación
        </h2>
        <p className="mt-4 text-[#554240] text-lg">
          Completa la información de tu elenco de danza tradicional.
        </p>
      </section>

      {/* Formulario */}
      <section className="px-6 pb-24 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Error general */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Información Básica */}
          <div className="space-y-8">
            <h3 className="font-serif text-2xl text-[#85332a] border-b border-[#dbc1bd]/30 pb-4">
              Información Básica
            </h3>

            {/* Nombre */}
            <div className="group">
              <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="name">
                Nombre de la Agrupación *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                minLength={3}
                className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all focus:border-[#85332a] outline-none"
                placeholder="Ej: Elenco de Danzas Tradicionales de Cusco"
              />
            </div>

            {/* Ciudad y Región */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="city">
                  Ciudad *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all focus:border-[#85332a] outline-none"
                  placeholder="Ej: Cusco"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="region">
                  Departamento *
                </label>
                <select
                  id="region"
                  name="region"
                  required
                  className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all focus:border-[#85332a] outline-none cursor-pointer"
                >
                  <option value="">Selecciona...</option>
                  {REGIONES_PERU.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div className="group">
              <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="description">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                maxLength={500}
                className="w-full bg-white/50 border border-[#dbc1bd] p-4 text-[#554240] focus:ring-0 transition-all focus:border-[#85332a] outline-none resize-none"
                placeholder="Cuéntanos sobre tu agrupación, historia, estilos de danza..."
              />
              <p className="text-xs text-[#554240]/60 mt-2">Máximo 500 caracteres</p>
            </div>

            {/* Año de fundación */}
            <div className="group">
              <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="founded_year">
                Año de Fundación
              </label>
              <input
                id="founded_year"
                name="founded_year"
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all focus:border-[#85332a] outline-none"
                placeholder="Ej: 1995"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-8">
            <h3 className="font-serif text-2xl text-[#85332a] border-b border-[#dbc1bd]/30 pb-4">
              Información de Contacto
            </h3>

            {/* Email */}
            <div className="group">
              <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="contact_email">
                Correo Electrónico de Contacto *
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                required
                className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all focus:border-[#85332a] outline-none"
                placeholder="contacto@agrupacion.com"
              />
              <p className="text-xs text-[#554240]/60 mt-2">
                Aquí recibirás la respuesta de tu solicitud
              </p>
            </div>

            {/* Teléfono */}
            <div className="group">
              <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="contact_phone">
                Teléfono
              </label>
              <input
                id="contact_phone"
                name="contact_phone"
                type="tel"
                className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all focus:border-[#85332a] outline-none"
                placeholder="+51 999 999 999"
              />
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="space-y-8">
            <h3 className="font-serif text-2xl text-[#85332a] border-b border-[#dbc1bd]/30 pb-4">
              Redes Sociales
            </h3>

            <div className="group">
              <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="instagram">
                Instagram
              </label>
              <input
                id="instagram"
                name="instagram"
                type="text"
                className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all focus:border-[#85332a] outline-none"
                placeholder="nombre_usuario (sin @)"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="facebook">
                Facebook
              </label>
              <input
                id="facebook"
                name="facebook"
                type="url"
                className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all focus:border-[#85332a] outline-none"
                placeholder="https://facebook.com/tuagrupacion"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="youtube">
                YouTube
              </label>
              <input
                id="youtube"
                name="youtube"
                type="url"
                className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all focus:border-[#85332a] outline-none"
                placeholder="https://youtube.com/c/tuagrupacion"
              />
            </div>
            <div className="group">
              <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="tiktok">
                TikTok
              </label>
              <input
                id="tiktok"
                name="tiktok"
                type="url"
                className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all focus:border-[#85332a] outline-none"
                placeholder="https://tiktok.com/@tuagrupacion"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-[#dbc1bd]/30">
            <button
              type="submit"
              disabled={loading || !userId}
              className="w-full bg-[#85332a] text-white px-12 py-4 font-bold tracking-widest uppercase text-sm hover:bg-[#a44a3f] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
            <p className="text-center text-xs text-[#554240]/60 mt-4">
              * Campos obligatorios
            </p>
          </div>

        </form>
      </section>
    </div>
  )
}