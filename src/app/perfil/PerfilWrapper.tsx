// app/perfil/PerfilWrapper.tsx
'use client'

import dynamic from 'next/dynamic'

const PerfilClient = dynamic(() => import('./PerfilClient'), { ssr: false })

export default function PerfilWrapper() {
  return <PerfilClient />
}