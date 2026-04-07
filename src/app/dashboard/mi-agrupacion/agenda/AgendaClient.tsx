'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2,
  Calendar,
  MapPin,
  Clock,
  X
} from 'lucide-react'

const weavePattern = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20zM0 20h10v10H0V20zm10 10h10v10H10V30zM20 0h10v10H20V0zm10 10h10v10H30V10z' fill='%2385332a' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`
}

interface EventFormData {
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  city: string
  region: string
  is_public: boolean
  contact_info: string
}

export default function AgendaClient({
  initialEvents,
  groupId
}: {
  initialEvents: any[]
  groupId: string
}) {
  const [supabase] = useState(() => createClient())

  const [loading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>(initialEvents)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any | null>(null)

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    city: '',
    region: '',
    is_public: true,
    contact_info: ''
  })

  const openModal = (event?: any) => {
    if (event) {
      const date = new Date(event.event_date)
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: date.toISOString().split('T')[0],
        event_time: date.toTimeString().slice(0, 5),
        location: event.location || '',
        city: event.city || '',
        region: event.region || '',
        is_public: event.is_public ?? true,
        contact_info: event.contact_info || ''
      })
      setEditingEvent(event)
    } else {
      setFormData({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        city: '',
        region: '',
        is_public: true,
        contact_info: ''
      })
      setEditingEvent(null)
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEvent(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupId) return

    setSaving(true)

    try {
      const dateTime = new Date(`${formData.event_date}T${formData.event_time || '00:00'}`)

      const eventData = {
        group_id: groupId,
        title: formData.title,
        description: formData.description || null,
        event_date: dateTime.toISOString(),
        location: formData.location || null,
        city: formData.city || null,
        region: formData.region || null,
        is_public: formData.is_public,
        type: 'presentation',
        contact_info: formData.contact_info || null
      }

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData)

        if (error) throw error
      }

      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('group_id', groupId)
        .order('event_date', { ascending: true })

      setEvents(data || [])

      closeModal()

    } catch (err) {
      console.error('Error guardando evento:', err)
      alert('Error al guardar el evento')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('¿Eliminar este evento?')) return

    setDeleting(eventId)

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      setEvents(prev => prev.filter(e => e.id !== eventId))

    } catch (err) {
      console.error('Error eliminando:', err)
      alert('Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const now = new Date()
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= now)
  const pastEvents = events.filter(e => new Date(e.event_date) < now)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8ef] flex items-center justify-center" style={weavePattern}>
        <Loader2 className="w-8 h-8 animate-spin text-[#85332a]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fff8ef] pb-32" style={weavePattern}>
      <div className="max-w-7xl mx-auto px-6 space-y-8">

        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1e1b14] mb-2">
              Agenda
            </h1>
            <p className="text-[#554240]">
              Gestiona los eventos y presentaciones de tu agrupación
            </p>
          </div>

          <button
            onClick={() => openModal()}
            className="bg-[#85332a] text-white px-6 py-3 font-bold tracking-widest uppercase text-sm flex items-center gap-2 hover:bg-[#a44a3f] transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </button>
        </section>

        {/* Próximos */}
        <section>
          <h2 className="font-serif text-2xl text-[#85332a] border-b border-[#dbc1bd]/30 pb-4 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Próximos Eventos ({upcomingEvents.length})
          </h2>

          {upcomingEvents.length === 0 ? (
            <div className="bg-[#faf3e7] p-12 border border-[#dbc1bd]/20 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-[#85332a]/40" />
              <p className="text-[#554240]">No hay eventos programados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const { day, month, time } = formatDate(event.event_date)
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    day={day}
                    month={month}
                    time={time}
                    onEdit={() => openModal(event)}
                    onDelete={() => handleDelete(event.id)}
                    deleting={deleting === event.id}
                  />
                )
              })}
            </div>
          )}
        </section>

        {/* Pasados */}
        {pastEvents.length > 0 && (
          <section className="opacity-60">
            <h2 className="font-serif text-2xl text-[#554240] border-b border-[#dbc1bd]/30 pb-4 mb-6">
              Historial ({pastEvents.length})
            </h2>
            <div className="space-y-4">
              {pastEvents.slice(0, 3).map((event) => {
                const { day, month, time } = formatDate(event.event_date)
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    day={day}
                    month={month}
                    time={time}
                    onEdit={() => openModal(event)}
                    onDelete={() => handleDelete(event.id)}
                    deleting={deleting === event.id}
                    past
                  />
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* Modal */}
      {showModal && (
              <div className="fixed inset-0 bg-[#1e1b14]/80 z-50 flex items-center justify-center p-4">
                <div className="bg-[#fff8ef] w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={weavePattern}>
                  {/* Header modal */}
                  <div className="flex items-center justify-between p-6 border-b border-[#dbc1bd]/30">
                    <h2 className="font-serif text-2xl text-[#1e1b14]">
                      {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
                    </h2>
                    <button onClick={closeModal} className="p-2 hover:bg-[#dbc1bd]/20 transition-colors">
                      <X className="w-6 h-6 text-[#554240]" />
                    </button>
                  </div>
      
                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    {/* Título */}
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2">
                        Título del Evento *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-xl font-serif focus:outline-none focus:border-[#85332a]"
                        placeholder="Ej: Festival de Marinera 2024"
                      />
                    </div>
      
                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Fecha *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.event_date}
                          onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                          className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Hora
                        </label>
                        <input
                          type="time"
                          value={formData.event_time}
                          onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                          className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                        />
                      </div>
                    </div>
      
                    {/* Ubicación */}
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Lugar / Venue
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                        placeholder="Ej: Teatro Municipal de Lima"
                      />
                    </div>
      
                    {/* Ciudad y Región */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                          placeholder="Lima"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2">
                          Región
                        </label>
                        <input
                          type="text"
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                          placeholder="Lima"
                        />
                      </div>
                    </div>
      
                    {/* Descripción */}
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2">
                        Descripción
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white border border-[#dbc1bd] p-4 text-[#554240] focus:outline-none focus:border-[#85332a] resize-none"
                        placeholder="Detalles del evento, entrada, etc."
                      />
                    </div>
      
                    {/* Contacto */} 
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-[#554240] uppercase mb-2">
                          Contacto
                      </label>
                      <input
                          type="text"
                          value={formData.contact_info}
                          onChange={(e) =>
                          setFormData({ ...formData, contact_info: e.target.value })
                          }
                          className="w-full bg-white border border-[#dbc1bd] px-4 py-3 text-[#554240] focus:outline-none focus:border-[#85332a]"
                          placeholder="Ej: +51 987654321 o correo@ejemplo.com"
                      />
                    </div>
      
                    {/* Visibilidad */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_public"
                        checked={formData.is_public}
                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                        className="w-5 h-5 accent-[#85332a]"
                      />
                      <label htmlFor="is_public" className="text-[#554240]">
                        Evento público (visible en el perfil)
                      </label>
                    </div>
      
                    {/* Botones */}
                    <div className="flex gap-4 pt-4 border-t border-[#dbc1bd]/30">
                      <button
                        type="submit"
                        disabled={saving}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold tracking-widest uppercase text-sm transition-all ${
                          saving 
                            ? 'bg-[#dbc1bd] text-[#554240]' 
                            : 'bg-[#85332a] text-white hover:bg-[#a44a3f]'
                        }`}
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? 'Guardando...' : (editingEvent ? 'Guardar Cambios' : 'Crear Evento')}
                      </button>
                      
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-4 border border-[#554240] text-[#554240] font-bold tracking-widest uppercase text-sm hover:bg-[#554240] hover:text-white transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
      
                  </form>
                </div>
              </div>
       )}
    </div>
  )
}

// EventCard EXACTAMENTE igual que el tuyo
function EventCard({ event, day, month, time, onEdit, onDelete, deleting, past = false }: any) {
  return (
    <div className={`group flex items-center justify-between p-6 border border-[#dbc1bd]/20 hover:border-[#85332a]/30 transition-all ${
      past ? 'bg-[#faf3e7]/50' : 'bg-[#faf3e7]'
    }`}>
      <div className="flex items-start gap-6">
        <div className="text-center min-w-[60px]">
          <span className={`block font-serif text-4xl ${past ? 'text-[#554240]/40' : 'text-[#85332a]'}`}>
            {day}
          </span>
          <span className="block font-bold text-[10px] uppercase tracking-[0.2em] text-[#554240]">
            {month}
          </span>
        </div>

        <div>
          <h3 className={`font-serif text-2xl mb-1 ${past ? 'text-[#554240]/60' : 'text-[#1e1b14]'}`}>
            {event.title}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#554240]">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {event.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {time} HRS
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
        <button onClick={onEdit}><Edit2 /></button>
        <button onClick={onDelete}>
          {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </button>
      </div>
    </div>
  )
}