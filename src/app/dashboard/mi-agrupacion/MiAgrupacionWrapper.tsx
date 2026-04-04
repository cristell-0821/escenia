// app/dashboard/mi-agrupacion/MiAgrupacionWrapper.tsx
'use client'

import dynamic from 'next/dynamic'

const MiAgrupacionContent = dynamic(() => import('./MiAgrupacionContent'), { ssr: false })

interface Props {
  group: any
}

export default function MiAgrupacionWrapper({ group }: Props) {
  return <MiAgrupacionContent group={group} />
}