// src/app/agrupaciones/[slug]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="max-w-full">
      <Skeleton className="h-[400px] md:h-[751px] w-full" />
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-6 w-full" />
        <div className="grid grid-cols-3 gap-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </main>
  )
}