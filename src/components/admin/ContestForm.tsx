'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, ImageIcon, Loader2 } from 'lucide-react'

interface ContestFormProps {
  initialData?: {
    id?: string
    title?: string
    description?: string | null
    city?: string | null
    region?: string | null
    location?: string | null
    starts_at?: string | null
    event_date?: string | null
    prize?: string | null
    cover_url?: string | null
    poster_url?: string | null
    contact_whatsapp?: string | null
    contact_email_public?: string | null
    maps_url?: string | null
  } | null
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
  redirectPath?: string
}

// Formatear para datetime-local (YYYY-MM-DDTHH:mm)
function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  
  // Extrae componentes directamente del string ISO
  // Soporta: "2024-03-31T10:00:00Z", "2024-03-31T10:00:00", "2024-03-31T10:00"
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (!match) return ''
  
  const [, year, month, day, hours, minutes] = match
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  return dateStr.split('T')[0]
}

export default function ContestForm({ 
  initialData, 
  action,
  redirectPath = '/admin/concursos'
}: ContestFormProps) {
  const router = useRouter()
  const [preview, setPreview] = useState<string | null>(
    initialData?.cover_url || initialData?.poster_url || null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!initialData?.id

  // Formatear fecha para input date
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return ''
    return dateStr.split('T')[0]
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar 5MB')
        return
      }
      setPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const clearImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const result = await action(formData)
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    router.push(redirectPath)
    router.refresh()
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      {/* Mensaje de error */}
      {error && (
        <div className="lg:col-span-12 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 🟡 FORM */}
      <div className="lg:col-span-7 space-y-6 bg-[#faf3e7] p-8 border border-[#dbc1bd]/30">
        
        {isEditing && (
          <input type="hidden" name="id" value={initialData.id} />
        )}

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-[#554240] mb-2">
            Título del concurso *
          </label>
          <input
            name="title"
            defaultValue={initialData?.title}
            placeholder="Ej: Concurso de Marinera 2024"
            required
            className="w-full border border-[#dbc1bd] px-4 py-3 focus:border-[#85332a] focus:ring-1 focus:ring-[#85332a] outline-none transition-colors"
          />
        </div>

        {/* Ciudad y Región */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#554240] mb-2">
              Ciudad
            </label>
            <input 
              name="city" 
              defaultValue={initialData?.city || ''} 
              placeholder="Ej: Lima" 
              className="w-full border border-[#dbc1bd] px-4 py-3 focus:border-[#85332a] focus:ring-1 focus:ring-[#85332a] outline-none transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#554240] mb-2">
              Región
            </label>
            <input 
              name="region" 
              defaultValue={initialData?.region || ''} 
              placeholder="Ej: Lima" 
              className="w-full border border-[#dbc1bd] px-4 py-3 focus:border-[#85332a] focus:ring-1 focus:ring-[#85332a] outline-none transition-colors" 
            />
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-medium text-[#554240] mb-2">
            Lugar específico
          </label>
          <input 
            name="location" 
            defaultValue={initialData?.location || ''} 
            placeholder="Ej: Teatro Municipal de Lima" 
            className="w-full border border-[#dbc1bd] px-4 py-3 focus:border-[#85332a] focus:ring-1 focus:ring-[#85332a] outline-none transition-colors" 
          />
        </div>

        {/* Después del campo de ubicación, agregar: */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#554240] mb-2">
            Link de Google Maps
          </label>
          <input 
            name="maps_url" 
            defaultValue={initialData?.maps_url || ''}
            placeholder="https://maps.google.com/..."
            className="w-full border border-[#dbc1bd] px-4 py-3 focus:border-[#85332a] focus:ring-1 focus:ring-[#85332a] outline-none transition-colors" 
          />
          <p className="text-xs text-[#554240]/70 mt-1">
            Pega aquí el enlace de Google Maps (Compartir → Copiar enlace)
          </p>
        </div>

        {/* Fecha y Premio */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#554240] mb-2">
              Fecha y hora del evento *
            </label>
            <input 
              name="event_date" 
              type="datetime-local"  // ← Cambiar de "date" a "datetime-local"
              defaultValue={formatDateTime(initialData?.event_date)}  // ← Nueva función
              required
              className="w-full border border-[#dbc1bd] px-4 py-3 focus:border-[#85332a] focus:ring-1 focus:ring-[#85332a] outline-none transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#554240] mb-2">
              Premio
            </label>
            <input 
              name="prize" 
              defaultValue={initialData?.prize || ''} 
              placeholder="Ej: S/ 5,000" 
              className="w-full border border-[#dbc1bd] px-4 py-3 focus:border-[#85332a] focus:ring-1 focus:ring-[#85332a] outline-none transition-colors" 
            />
          </div>
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#554240] mb-2">
              WhatsApp
            </label>
            <input 
              name="contact_whatsapp" 
              defaultValue={initialData?.contact_whatsapp || ''} 
              placeholder="+51 999 999 999" 
              className="w-full border border-[#dbc1bd] px-4 py-3 focus:border-[#85332a] focus:ring-1 focus:ring-[#85332a] outline-none transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#554240] mb-2">
              Email público
            </label>
            <input 
              name="contact_email_public" 
              defaultValue={initialData?.contact_email_public || ''} 
              placeholder="concursos@ejemplo.com" 
              className="w-full border border-[#dbc1bd] px-4 py-3 focus:border-[#85332a] focus:ring-1 focus:ring-[#85332a] outline-none transition-colors" 
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-[#554240] mb-2">
            Descripción
          </label>
          <textarea 
            name="description" 
            defaultValue={initialData?.description || ''} 
            placeholder="Describe el concurso, bases, requisitos..." 
            rows={4}
            className="w-full border border-[#dbc1bd] p-4 focus:border-[#85332a] focus:ring-1 focus:ring-[#85332a] outline-none transition-colors resize-none" 
          />
        </div>

        {/* Botón */}
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#85332a] text-white px-6 py-3 font-bold tracking-wider uppercase text-sm hover:bg-[#a44a3f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Actualizar Concurso' : 'Crear Concurso'}
        </button>
      </div>

      {/* 🔴 POSTER */}
      <div className="lg:col-span-5 space-y-6">
        
        <div className="aspect-[3/4] bg-[#EEE7DB] flex items-center justify-center overflow-hidden border border-[#dbc1bd] relative">
          {preview ? (
            <>
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover" 
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Quitar imagen"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-center text-[#554240]/50">
              <ImageIcon className="w-16 h-16 mx-auto mb-2" />
              <span className="text-sm">Sin imagen</span>
            </div>
          )}
        </div>

        <label className="block cursor-pointer bg-[#85332a] text-white text-center py-3 font-bold tracking-wider uppercase text-sm hover:bg-[#a44a3f] transition-colors">
          {isEditing ? 'Cambiar Poster' : 'Subir Poster'}
          <input
            ref={fileInputRef}
            type="file"
            name="poster_image"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
        
        <p className="text-xs text-[#554240]/70 text-center">
          Formatos: JPG, PNG, WebP. Máx: 5MB
        </p>
      </div>
    </form>
  )
}