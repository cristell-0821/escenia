'use client'

export default function DeleteButton() {
  return (
    <button
      type="submit"
      className="p-2 text-[#554240] hover:text-red-600 hover:bg-red-50 transition-colors"
      title="Eliminar"
      onClick={(e) => {
        if (!confirm('¿Eliminar este concurso?')) {
          e.preventDefault()
        }
      }}
    >
      🗑
    </button>
  )
}