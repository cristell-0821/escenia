'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { 
  Upload, 
  Trash2, 
  Loader2,
  ImagePlus,
  GripVertical,
  Star
} from 'lucide-react'

// DnD Kit
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

// ==============================
// Sortable Item
// ==============================
function SortableGalleryItem({ item, index, onDelete, deleting }: any) {
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
        alt="Galería"
        fill
        className="object-cover transition-all duration-500 group-hover:scale-105"
      />

      {/* Controls */}
      <div className="absolute inset-0 bg-[#1e1b14]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
        <button {...attributes} {...listeners} className="p-3 bg-white/20 cursor-grab">
          <GripVertical className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={() => onDelete(item.id, item.url)}
          disabled={deleting === item.id}
          className="p-3 bg-white/20 hover:bg-red-500"
        >
          {deleting === item.id ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <Trash2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {isFeatured && (
        <div className="absolute top-2 left-2 bg-[#85332a] text-white px-2 py-1 text-xs flex items-center gap-1">
          <Star className="w-3 h-3" />
          Portada
        </div>
      )}
    </div>
  )
}

// ==============================
// MAIN CLIENT
// ==============================
export default function GaleriaClient({
  initialGallery,
  groupId
}: {
  initialGallery: any[]
  groupId: string
}) {
  const [supabase] = useState(() => createClient())

  const [gallery, setGallery] = useState(initialGallery)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setGallery((items) => {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)
      return arrayMove(items, oldIndex, newIndex)
    })

    setHasChanges(true)
  }

  // ==============================
  // SAVE ORDER
  // ==============================
  const saveOrder = async () => {
    setSavingOrder(true)

    try {
      for (let i = 0; i < gallery.length; i++) {
        await supabase
          .from('gallery_items')
          .update({ sort_order: i * 10 })
          .eq('id', gallery[i].id)
      }

      setHasChanges(false)
      alert('Orden guardado')
    } catch (err) {
      console.error(err)
    } finally {
      setSavingOrder(false)
    }
  }

  // ==============================
  // DELETE
  // ==============================
  const handleDelete = async (id: string, url: string) => {
    setDeleting(id)

    await supabase.from('gallery_items').delete().eq('id', id)

    setGallery((prev) => prev.filter(i => i.id !== id))
    setDeleting(null)
  }

  // ==============================
  // UPLOAD
  // ==============================
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)

    for (const file of Array.from(files)) {
      const fileName = `${groupId}-${Date.now()}-${file.name}`

      const { error } = await supabase.storage
        .from('group-assets')
        .upload(`gallery/${fileName}`, file)

      if (error) continue

      const { data } = supabase.storage
        .from('group-assets')
        .getPublicUrl(`gallery/${fileName}`)

      const { data: inserted } = await supabase
        .from('gallery_items')
        .insert({
          group_id: groupId,
          url: data.publicUrl,
          sort_order: gallery.length * 10
        })
        .select()
        .single()

      if (inserted) {
        setGallery(prev => [...prev, inserted])
      }
    }

    setUploading(false)
  }

  // ==============================
  // UI
  // ==============================
  return (
    <div className="space-y-8">

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {hasChanges && (
          <button onClick={saveOrder} className="bg-[#85332a] text-white px-6 py-3">
            {savingOrder ? 'Guardando...' : 'Guardar Orden'}
          </button>
        )}

        <label className="cursor-pointer bg-black text-white px-6 py-3 flex gap-2">
          <Upload className="w-4 h-4" />
          Subir
          <input type="file" multiple className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* Grid */}
      {gallery.length === 0 ? (
        <div className="text-center py-16">
          <ImagePlus className="mx-auto mb-4" />
          Sin fotos
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={gallery.map(i => i.id)} strategy={rectSortingStrategy}>
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
    </div>
  )
}