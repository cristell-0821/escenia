'use client'

import { useState } from 'react'
import { 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { activateGroup, deactivateGroup, suspendGroup, deleteGroup } from '@/app/admin/agrupaciones/actions'

interface Props {
  groupId: string
  currentStatus: 'active' | 'inactive' | 'suspended'
}

export default function GroupActionsMenu({ groupId, currentStatus }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleAction(action: 'activate' | 'deactivate' | 'suspend' | 'delete') {
    setIsOpen(false)
    
    if (action === 'delete') {
      if (!confirm('¿Estás seguro de eliminar esta agrupación? Esta acción no se puede deshacer.')) {
        return
      }
      setIsDeleting(true)
    }

    try {
      switch (action) {
        case 'activate':
          await activateGroup(groupId)
          break
        case 'deactivate':
          await deactivateGroup(groupId)
          break
        case 'suspend':
          await suspendGroup(groupId)
          break
        case 'delete':
          await deleteGroup(groupId)
          break
      }
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDeleting}
        className="p-2 text-[#554240] hover:text-[#85332a] transition-colors disabled:opacity-50"
        title="Gestionar"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menú dropdown */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#dbc1bd] shadow-lg z-20 py-1">
            
            {currentStatus !== 'active' && (
              <button
                onClick={() => handleAction('activate')}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-green-50 text-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Activar / Hacer pública</span>
              </button>
            )}

            {currentStatus !== 'inactive' && (
              <button
                onClick={() => handleAction('deactivate')}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <EyeOff className="w-4 h-4" />
                <span className="text-sm font-medium">Desactivar / Ocultar</span>
              </button>
            )}

            {currentStatus !== 'suspended' && (
              <button
                onClick={() => handleAction('suspend')}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 text-red-700 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Suspender</span>
              </button>
            )}

            <div className="border-t border-[#dbc1bd]/30 my-1" />

            <button
              onClick={() => handleAction('delete')}
              disabled={isDeleting}
              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 text-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isDeleting ? 'Eliminando...' : 'Eliminar permanentemente'}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}