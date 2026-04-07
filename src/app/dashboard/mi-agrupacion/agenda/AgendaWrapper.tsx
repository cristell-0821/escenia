'use client'

import dynamic from 'next/dynamic'

const AgendaClient = dynamic(
  () => import('./AgendaClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#fff8ef] flex items-center justify-center">
        <div className="animate-pulse">Cargando...</div>
      </div>
    )
  }
)

export default function AgendaWrapper({ 
  initialEvents, 
  groupId 
}: { 
  initialEvents: any[]
  groupId: string 
}) {
  return (
    <AgendaClient 
      initialEvents={initialEvents}
      groupId={groupId}
    />
  )
}