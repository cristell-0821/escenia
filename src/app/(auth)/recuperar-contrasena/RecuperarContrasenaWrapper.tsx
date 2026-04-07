'use client'

import dynamic from 'next/dynamic'

const RecuperarContrasenaClient = dynamic(
  () => import('./RecuperarContrasenaClient'),
  { 
    ssr: false,
    loading: () => (
      <main className="min-h-screen flex items-center justify-center bg-[#fff8ef]">
        <div className="animate-pulse">Cargando...</div>
      </main>
    )
  }
)

export default function RecuperarContrasenaWrapper() {
  return <RecuperarContrasenaClient />
}