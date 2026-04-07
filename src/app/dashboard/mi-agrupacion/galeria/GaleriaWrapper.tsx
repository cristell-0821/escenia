'use client'

import dynamic from 'next/dynamic'

const GaleriaClient = dynamic(
  () => import('./GaleriaClient'),
  { ssr: false }
)

export default function GaleriaWrapper({ 
  initialGallery, 
  groupId 
}: { 
  initialGallery: any[]
  groupId: string 
}) {
  return (
    <GaleriaClient 
      initialGallery={initialGallery}
      groupId={groupId}
    />
  )
}