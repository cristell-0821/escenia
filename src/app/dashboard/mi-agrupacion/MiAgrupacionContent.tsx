'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { updateGroup } from './actions'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Mail, 
  Phone, 
  Globe,
  Users,
  Calendar,
  Camera,
  Save,
  Loader2,
  ExternalLink,
  UserCircle, // Icono para avatar
} from 'lucide-react'
import Link from 'next/link'
import InstagramIcon from '@/assets/icons/instagram.svg'
import FacebookIcon from '@/assets/icons/facebook.svg'
import YoutubeIcon from '@/assets/icons/youtube.svg'
import TikTokIcon from '@/assets/icons/tiktok.svg'

interface Props {
  group: any
}

const REGIONES_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 
  'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco',
  'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 
  'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
  'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
]

const weavePattern = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20zM0 20h10v10H0V20zm10 10h10v10H10V30zM20 0h10v10H20V0zm10 10h10v10H30V10z' fill='%2385332a' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`
}

export default function MiAgrupacionContent({ group }: Props) {
  const router = useRouter()

  const groupId = group?.id

  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false) // Separar estados

  if (!group || !groupId) {
    return (
      <div className="min-h-screen bg-[#fff8ef] flex items-center justify-center" style={weavePattern}>
        <div className="text-center">
          <p className="text-[#554240] mb-4">No tienes una agrupación asignada</p>
          <Link href="/perfil" className="text-[#85332a] hover:underline">
            Volver a perfil
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!groupId) return

    setSaving(true)
    const formData = new FormData(e.currentTarget)
    
    const data = {
      name: formData.get('name') as string,
      slogan: formData.get('slogan') as string || null,
      description: formData.get('description') as string,
      city: formData.get('city') as string,
      region: formData.get('region') as string,
      contact_email: formData.get('contact_email') as string,
      contact_phone: formData.get('contact_phone') as string || null,
      instagram: formData.get('instagram') as string || null,
      facebook: formData.get('facebook') as string || null,
      youtube: formData.get('youtube') as string || null,
      tiktok: formData.get('tiktok') as string || null,
      founded_year: formData.get('founded_year') ? parseInt(formData.get('founded_year') as string) : null,
      dancers_count: formData.get('dancers_count') ? parseInt(formData.get('dancers_count') as string) : null,
    }

    const result = await updateGroup(groupId, data)
    setSaving(false)
    
    if (result?.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  // Handler para portada
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !groupId) return

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }

    setUploadingCover(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${groupId}-cover-${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('group-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('group-assets')
        .getPublicUrl(filePath)

      const result = await updateGroup(groupId, { cover_url: publicUrl })
      
      if (result?.error) throw new Error(result.error)

      router.refresh()

    } catch (err: any) {
      alert('Error al subir imagen: ' + err.message)
    } finally {
      setUploadingCover(false)
    }
  }

  // ✅ NUEVO: Handler para avatar/logo
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !groupId) return

    // Validar formato PNG (opcional pero recomendado)
    if (!file.type.includes('png')) {
      alert('Por favor sube una imagen en formato PNG para mejor calidad')
      // O quita esta validación si quieres permitir cualquier formato
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('El logo debe ser menor a 2MB')
      return
    }

    setUploadingAvatar(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${groupId}-avatar-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('group-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('group-assets')
        .getPublicUrl(filePath)

      const result = await updateGroup(groupId, { avatar_url: publicUrl })
      
      if (result?.error) throw new Error(result.error)

      router.refresh()

    } catch (err: any) {
      alert('Error al subir logo: ' + err.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const yearsActive = group.founded_year ? currentYear - group.founded_year : null

  return (
    <div className="min-h-screen bg-[#fff8ef] pb-32" style={weavePattern}>

      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Header */}
        <section>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1e1b14] mb-4">
            Editar Perfil
          </h1>
          <p className="text-[#554240] text-lg max-w-2xl leading-relaxed">
            Gestiona la identidad de <span className="italic text-[#85332a]">{group.name}</span>. 
            Mantén viva la esencia de tu agrupación cultural.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-16">
          
          {/* PORTADA */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl text-[#85332a] border-b border-[#dbc1bd]/30 pb-4">
              Imagen de Portada
            </h2>
            
            <div className="relative group">
              <div className="aspect-[21/9] bg-[#dbc1bd]/20 overflow-hidden relative">
                {group.cover_url ? (
                  <img 
                    src={group.cover_url} 
                    alt="Portada" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#554240]/40">
                    <div className="text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <p>Sin imagen de portada</p>
                    </div>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-[#1e1b14]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className={`cursor-pointer bg-[#85332a] text-white px-6 py-3 font-bold tracking-widest uppercase text-xs flex items-center gap-2 hover:bg-[#a44a3f] transition-all ${uploadingCover ? 'opacity-50' : ''}`}>
                    {uploadingCover ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    {uploadingCover ? 'Subiendo...' : 'Cambiar Portada'}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                    />
                  </label>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#554240]/60">
              Recomendado: imagen horizontal 21:9, mínimo 1920px de ancho. Máximo 5MB.
            </p>
          </section>

          {/* ✅ NUEVO: LOGO/AVATAR */}
          <section className="space-y-6">
            <h2 className="font-serif text-2xl text-[#85332a] border-b border-[#dbc1bd]/30 pb-4">
              Logo de la Agrupación
            </h2>
            
            <div className="flex items-start gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-[#dbc1bd]/20 overflow-hidden border-2 border-[#dbc1bd]/30 relative">
                  {group.avatar_url ? (
                    <img 
                      src={group.avatar_url} 
                      alt="Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#554240]/40">
                      <UserCircle className="w-16 h-16" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-[#1e1b14]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <label className={`cursor-pointer bg-[#85332a] text-white px-3 py-2 font-bold tracking-widest uppercase text-[10px] flex items-center gap-1 hover:bg-[#a44a3f] transition-all ${uploadingAvatar ? 'opacity-50' : ''}`}>
                      {uploadingAvatar ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Camera className="w-3 h-3" />
                      )}
                      <input 
                        type="file" 
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden" 
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-sm text-[#554240]">
                  Este logo se mostrará en la sección "Nosotros" de tu perfil público, 
                  debajo del eslogan.
                </p>
                <p className="text-xs text-[#554240]/60">
                  Recomendado: imagen cuadrada o circular, formato PNG con fondo transparente. 
                  Máximo 2MB.
                </p>
              </div>
            </div>
          </section>

          {/* IDENTIDAD */}
          <section className="space-y-8">
            <h2 className="font-serif text-2xl text-[#85332a] border-b border-[#dbc1bd]/30 pb-4">
              Identidad
            </h2>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2">
                  Nombre de la Agrupación
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={group.name || ''}
                  required
                  className="w-full bg-transparent border-0 border-b-2 border-[#dbc1bd] py-3 px-0 text-4xl font-serif focus:ring-0 focus:border-[#85332a] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2">
                  Eslogan / Lema
                </label>
                <input
                  name="slogan"
                  type="text"
                  defaultValue={group.slogan || ''}
                  placeholder="Ej: Preservando nuestras raíces desde 1995"
                  className="w-full bg-transparent border-0 border-b border-[#dbc1bd] py-3 px-0 text-xl font-serif italic focus:ring-0 focus:border-[#85332a] outline-none transition-colors placeholder:text-[#dbc1bd]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2">
                  Nuestra Historia
                </label>
                <textarea
                  name="description"
                  rows={6}
                  defaultValue={group.description || ''}
                  className="w-full bg-[#faf3e7] border border-[#dbc1bd] p-6 text-[#554240] leading-relaxed focus:outline-none focus:border-[#85332a] resize-none"
                  placeholder="Cuéntanos la historia de tu agrupación..."
                />
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="space-y-8">
            <h2 className="font-serif text-2xl text-[#85332a] border-b border-[#dbc1bd]/30 pb-4">
              Estadísticas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Año de Fundación
                </label>
                <input
                  name="founded_year"
                  type="number"
                  min={1900}
                  max={currentYear}
                  defaultValue={group.founded_year || ''}
                  className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                />
                {yearsActive && (
                  <p className="text-sm text-[#85332a] mt-2 font-medium">
                    {yearsActive} años de trayectoria
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Cantidad de Bailarines
                </label>
                <input
                  name="dancers_count"
                  type="number"
                  min={1}
                  defaultValue={group.dancers_count || ''}
                  className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ciudad
                </label>
                <input
                  name="city"
                  type="text"
                  defaultValue={group.city || ''}
                  className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2">
                Departamento
              </label>
              <select
                name="region"
                defaultValue={group.region || ''}
                className="w-full md:w-1/2 bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a] cursor-pointer"
              >
                <option value="">Selecciona...</option>
                {REGIONES_PERU.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </section>

          {/* CONTACTO */}
          <section className="space-y-8">
            <h2 className="font-serif text-2xl text-[#85332a] border-b border-[#dbc1bd]/30 pb-4">
              Información de Contacto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Correo Electrónico
                </label>
                <input
                  name="contact_email"
                  type="email"
                  defaultValue={group.contact_email || ''}
                  className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Teléfono
                </label>
                <input
                  name="contact_phone"
                  type="tel"
                  defaultValue={group.contact_phone || ''}
                  className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                />
              </div>
            </div>
          </section>

          {/* REDES */}
          <section className="space-y-8">
            <h2 className="font-serif text-2xl text-[#85332a] border-b border-[#dbc1bd]/30 pb-4">
              Redes Sociales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                  <InstagramIcon className="w-4 h-4 text-[#554240]" />
                  Instagram
                </label>
                <input
                  name="instagram"
                  type="text"
                  defaultValue={group.instagram || ''}
                  placeholder="@usuario"
                  className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                  <FacebookIcon className="w-4 h-4 text-[#554240]" />
                  Facebook
                </label>
                <input
                  name="facebook"
                  type="url"
                  defaultValue={group.facebook || ''}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                  <YoutubeIcon className="w-4 h-4 text-[#FFDEAB]" />
                  YouTube
                </label>
                <input
                  name="youtube"
                  type="url"
                  defaultValue={group.youtube || ''}
                  placeholder="https://youtube.com/c/..."
                  className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                  <TikTokIcon className="w-4 h-4 text-[#554240]" />
                  TikTok
                </label>
                <input
                  name="tiktok"
                  type="url"
                  defaultValue={group.tiktok || ''}
                  placeholder="https://tiktok.com/@..."
                  className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                />
              </div>
            </div>
          </section>

          {/* SUBMIT */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 pt-8 border-t border-[#dbc1bd]/30">

            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto flex items-center justify-center gap-2 
              bg-[#85332a] text-white px-6 md:px-10 py-4 
              font-bold tracking-widest uppercase text-xs md:text-sm 
              hover:bg-[#a44a3f] transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>

            <Link
              href={`/agrupaciones/${group.slug || ''}`}
              target="_blank"
              className="w-full md:w-auto flex items-center justify-center gap-2 
              border border-[#85332a] text-[#85332a] px-6 md:px-8 py-4 
              font-bold tracking-widest uppercase text-xs md:text-sm 
              hover:bg-[#85332a] hover:text-white transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Perfil Público
            </Link>

          </div>

        </form>
      </div>
    </div>
  )
}