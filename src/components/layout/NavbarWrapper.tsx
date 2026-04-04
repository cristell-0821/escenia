// components/layout/NavbarWrapper.tsx
'use client'

import dynamic from 'next/dynamic'

const Navbar = dynamic(() => import('./Navbar'), { ssr: false })

export default function NavbarWrapper() {
  return <Navbar />
}