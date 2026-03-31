'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import RegistrationBanner from './RegistrationBanner'
import { CircleCheckBig, Eye, Loader2 } from "lucide-react"

export default function PerfilPage() {
  const searchParams = useSearchParams()
  const successMessage = searchParams.get('success')
  
  const { user, loading: userLoading } = useUser()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Sincronizar datos del usuario con los estados del formulario
  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      setName(user.user_metadata?.full_name || '')
    }
  }, [user])

  if (userLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#fff8ef] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#85332a]" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fff8ef]">
      {/* Mensaje de éxito */}
      {successMessage === 'solicitud-enviada' && (
        <div className="max-w-5xl mx-auto px-6 pt-8">
          <div className="bg-green-50 border border-green-200 p-4 flex items-center gap-3">
            <CircleCheckBig className="text-green-600 w-5 h-5" />
            <p className="text-green-800">
              Tu solicitud fue enviada exitosamente. Te contactaremos en 24-48 horas.
            </p>
          </div>
        </div>
      )}
      
      {/* Hero Section Asymmetry */}
      <section className="px-6 pt-12 pb-20 max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-end">
        <div className="md:w-2/3">
          <span className="text-[#85332a] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
            Personal Hub
          </span>
          <h2 className="text-6xl md:text-8xl font-serif leading-none">Mi Perfil</h2>
        </div>
        <div className="md:w-1/3 text-[#554240] italic font-serif text-xl border-l border-[#dbc1bd]/30 pl-6">
          "Preservando la esencia de nuestras tradiciones en cada paso."
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 pb-32">
        
        {/* Information Form */}
        <section className="lg:col-span-7 space-y-16">
          <div className="space-y-12">
            <h3 className="font-serif text-3xl text-[#85332a] border-b border-[#dbc1bd]/10 pb-4">
              Información Personal
            </h3>
            
            <form className="space-y-10">
              
              {/* NAME */}
              <div className="group">
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="name">
                  Nombre Completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all focus:border-[#85332a] outline-none"
                />
              </div>

              {/* EMAIL */}
              <div className="group">
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="email">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all outline-none opacity-70"
                />
              </div>

              {/* PASSWORD */}
              <div className="group relative">
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value="********"
                  disabled
                  className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif focus:ring-0 transition-all outline-none"
                />
                <button 
                  type="button"
                  className="absolute right-0 bottom-3 text-[#554240] hover:text-[#85332a] transition-colors"
                >
                  <Eye className="text-[#554240] w-5 h-5" />
                </button>
              </div>

              {/* BOTÓN */}
              <div className="pt-6">
                <button
                  type="button"
                  className="bg-[#85332a] text-white px-12 py-4 font-bold tracking-widest uppercase text-sm hover:bg-[#a44a3f] transition-all active:scale-95"
                >
                  Guardar Cambios
                </button>
              </div>

            </form>
          </div>
        </section>

        {/* Registration CTA Section */}
        <aside className="lg:col-span-5 space-y-8">
          {user ? (
            <RegistrationBanner userId={user.id} />
          ) : (
            <div className="bg-[#faf3e7] p-10 border border-[#dbc1bd]/10 animate-pulse">
              <div className="h-12 w-12 bg-[#85332a]/20 mb-6"></div>
              <div className="h-8 w-3/4 bg-[#85332a]/20 mb-4"></div>
              <div className="h-4 w-full bg-[#dbc1bd]/30"></div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}