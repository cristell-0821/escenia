'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SquarePen, Image, Calendar, Trophy } from 'lucide-react'

export default function TabLink({ 
  href, 
  icon, 
  label 
}: { 
  href: string
  icon: 'edit' | 'image' | 'calendar' | 'trophy'
  label: string 
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  const icons = {
    edit: SquarePen,
    image: Image,
    calendar: Calendar,
    trophy: Trophy,
  }

  const Icon = icons[icon]

  return (
    <Link 
      href={href}
      className={`
        pb-3 md:pb-4 
        font-medium tracking-widest uppercase 
        text-xs md:text-sm 
        flex items-center gap-2 transition-all border-b-2
        
        ${isActive 
          ? 'text-[#85332a] border-[#85332a]' 
          : 'text-[#554240] border-transparent hover:text-[#85332a] hover:border-[#85332a]'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}