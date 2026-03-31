'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Upload, 
  Trash2, 
  Loader2,
  ImagePlus,
  GripVertical,
  Star
} from 'lucide-react'
import Link from 'next/link'

// DnD Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const weavePattern = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20zM0 20h10v10H0V20zm10 10h10v10H10V30zM20 0h10v10H20V0zm10 10h10v10H30V10z' fill='%2385332a' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`
}

// Componente para cada item sortable
function SortableGalleryItem({ 
  item, 
  index, 
  onDelete, 
  deleting 
}: { 
  item: any
  index: number
  onDelete: (id: string, url: string) => void
  deleting: string | null
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1
  }

  const isFeatured = index === 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square bg-[#dbc1bd]/20 overflow-hidden group ${
        isFeatured ? 'md:col-span-2 md:row-span-2 ring-2 ring-[#85332a]' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <Image
        src={item.url}
        alt={item.caption || 'Galería'}
        fill
        className="object-cover transition-all duration-500 group-hover:scale-105"
      />
      
      {/* Controles */}
      <div className="absolute inset-0 bg-[#1e1b14]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-3 bg-white/20 hover:bg-[#85332a] text-white transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(item.id, item.url)}
          disabled={deleting === item.id}
          className="p-3 bg-white/20 hover:bg-red-500 text-white transition-colors"
        >
          {deleting === item.id ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Badge de destacada */}
      {isFeatured && (
        <div className="absolute top-4 left-4 bg-[#85332a] text-white px-3 py-1 text-xs font-bold tracking-wider uppercase flex items-center gap-1">
          <Star className="w-3 h-3" />
          Portada
        </div>
      )}

      {/* Número de orden */}
      <div className="absolute bottom-4 right-4 bg-[#1e1b14]/80 text-white px-2 py-1 text-xs font-bold">
        {index + 1}
      </div>
    </div>
  )
}

export default function GaleriaPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [groupId, setGroupId] = useState<string>('') 
  const [gallery, setGallery] = useState<any[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // Sensores para DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: membership } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)
      .single()

    if (!membership?.group_id) {
      router.push('/perfil')
      return
    }

    const gid = membership.group_id as string
    setGroupId(gid)

    // Cargar fotos ordenadas por sort_order
    const { data: items } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('group_id', gid)
      .order('sort_order', { ascending: true })

    setGallery(items || [])
    setLoading(false)
    setHasChanges(false)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setGallery((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
      setHasChanges(true)
    }
  }

  const saveOrder = async () => {
    if (!groupId) return
    
    setSavingOrder(true)
    
    try {
      // Actualizar sort_order de cada item
      const updates = gallery.map((item, index) => ({
        id: item.id,
        sort_order: index * 10  // Dejar espacio para insertar entre medio después
      }))

      // Hacer updates en batch
      for (const update of updates) {
        const { error } = await supabase
          .from('gallery_items')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)

        if (error) throw error
      }

      setHasChanges(false)
      alert('Orden guardado correctamente')
      
    } catch (err) {
      console.error('Error guardando orden:', err)
      alert('Error al guardar el orden')
    } finally {
      setSavingOrder(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !groupId) return

    setUploading(true)

    // Obtener el sort_order más alto actual
    const maxOrder = gallery.length > 0 
      ? Math.max(...gallery.map(g => g.sort_order || 0)) 
      : 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (!file.type.startsWith('image/')) continue
      if (file.size > 5 * 1024 * 1024) continue

      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${groupId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `gallery/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('group-assets')
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('group-assets')
          .getPublicUrl(filePath)

        const { error: dbError } = await supabase
          .from('gallery_items')
          .insert({
            group_id: groupId,
            url: publicUrl,
            type: 'image',
            caption: file.name.split('.')[0],
            sort_order: maxOrder + (i + 1) * 10  // Al final
          })

        if (dbError) throw dbError

      } catch (err) {
        console.error('Error subiendo:', err)
      }
    }

    await loadGallery()
    setUploading(false)
  }

  const handleDelete = async (itemId: string, url: string) => {
    if (!confirm('¿Eliminar esta foto?')) return

    setDeleting(itemId)

    try {
      const { error: dbError } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', itemId)

      if (dbError) throw dbError

      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const filePath = pathParts.slice(pathParts.indexOf('group-assets') + 1).join('/')

      await supabase.storage.from('group-assets').remove([filePath])
      await loadGallery()

    } catch (err) {
      console.error('Error eliminando:', err)
      alert('Error al eliminar la foto')
    } finally {
      setDeleting(null)
    }
  }

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
              Galería
            </h1>
            <p className="text-[#554240]">
              Arrastra las fotos para reordenar. La primera será la portada.
            </p>
          </div>

          <div className="flex gap-3">
            {hasChanges && (
              <button
                onClick={saveOrder}
                disabled={savingOrder}
                className={`flex items-center gap-2 px-6 py-3 font-bold tracking-widest uppercase text-sm transition-all ${
                  savingOrder 
                    ? 'bg-[#dbc1bd] text-[#554240]' 
                    : 'bg-[#85332a] text-white hover:bg-[#a44a3f]'
                }`}
              >
                {savingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {savingOrder ? 'Guardando...' : 'Guardar Orden'}
              </button>
            )}

            <label className={`cursor-pointer bg-[#1e1b14] text-white px-6 py-3 font-bold tracking-widest uppercase text-sm flex items-center gap-2 hover:bg-[#333] transition-all ${uploading ? 'opacity-50' : ''}`}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Subiendo...' : 'Subir Fotos'}
              <input 
                type="file" 
                accept="image/*"
                multiple
                className="hidden" 
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md">
          <div className="bg-[#faf3e7] p-4 border border-[#dbc1bd]/20 text-center">
            <span className="font-serif text-3xl text-[#85332a] block">{gallery.length}</span>
            <span className="text-xs text-[#554240] uppercase tracking-wider">Fotos</span>
          </div>
          <div className="bg-[#faf3e7] p-4 border border-[#dbc1bd]/20 text-center">
            <span className="font-serif text-3xl text-[#85332a] block">
              {gallery.length > 0 ? '1' : '0'}
            </span>
            <span className="text-xs text-[#554240] uppercase tracking-wider">Portada</span>
          </div>
        </div>

        {/* Grid de fotos con DnD */}
        {gallery.length === 0 ? (
          <div className="bg-[#faf3e7] p-16 border border-[#dbc1bd]/20 text-center" style={weavePattern}>
            <ImagePlus className="w-16 h-16 mx-auto mb-4 text-[#85332a]/40" />
            <h3 className="font-serif text-2xl text-[#1e1b14] mb-2">Sin fotos aún</h3>
            <p className="text-[#554240] mb-6">Sube las primeras imágenes de tu agrupación</p>
            <label className="cursor-pointer inline-flex items-center gap-2 border border-[#85332a] text-[#85332a] px-6 py-3 font-bold tracking-widest uppercase text-sm hover:bg-[#85332a] hover:text-white transition-all">
              <Upload className="w-4 h-4" />
              Seleccionar Fotos
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
            </label>
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={gallery.map(g => g.id)} 
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((item, idx) => (
                  <SortableGalleryItem
                    key={item.id}
                    item={item}
                    index={idx}
                    onDelete={handleDelete}
                    deleting={deleting}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Instrucciones 
        {gallery.length > 0 && (
          <div className="bg-[#faf3e7] p-6 border border-[#dbc1bd]/20">
            <h4 className="font-bold text-[#554240] uppercase tracking-wider text-sm mb-2">Cómo usar</h4>
            <ul className="text-sm text-[#554240] space-y-1 list-disc list-inside">
              <li>Arrastra las fotos para cambiar el orden</li>
              <li>La primera foto (número 1) se mostrará como portada grande</li>
              <li>Haz clic en "Guardar Orden" para aplicar los cambios</li>
              <li>Pasa el mouse sobre una foto para ver opciones (mover/eliminar)</li>
            </ul>
          </div>
        )} */}

      </div>
    </div>
  )
}