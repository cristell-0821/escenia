'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, User, LayoutDashboard, Home } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { useState } from 'react'

const links = [
  { label: 'Inicio', href: '/' },
  { label: 'Concursos', href: '/concursos' },
  { label: 'Agrupaciones', href: '/agrupaciones' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, isAuthReady, isProfileLoading } = useUser()
  const showPanel = isAuthReady && !isProfileLoading && role
  const [open, setOpen] = useState(false)

  const handleUserClick = () => {
    if (user) {
      router.push('/perfil')
    } else {
      router.push('/login')
    }
  }

  // Determinar link del panel según rol
  const getPanelLink = () => {
    if (role === 'superadmin') return '/admin'
    if (role === 'group_admin') return '/dashboard/mi-agrupacion'
    return null
  }

  const panelLink = getPanelLink()

  return (
    <header className="w-full bg-[#85332A] text-[#F2E9DC] z-50">
      <div className="flex items-center justify-between h-[64px] px-4 md:px-8">

        {/* LEFT */}
        <div className="flex items-center gap-[17px]">
          <button 
            onClick={() => setOpen(!open)}
            className="opacity-80 p-2 hover:opacity-100 transition md:hidden"
          >
            <Menu size={18} color="#F2E9DC" />
          </button>

          <span className="text-[#F2E9DC] font-black text-[36px] tracking-[3.6px] uppercase" 
            style={{ fontFamily: 'var(--font-newsreader)' }} > 
            Escenia 
          </span>
        </div>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map((link) => {
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col ${
                  isActive ? 'border-b-2 border-white' : ''
                }`}
              >
                <span
                  className="text-[18px]"
                  style={{
                    fontFamily: 'var(--font-newsreader)',
                    color: isActive ? '#FFFFFF' : '#F2E9DC',
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {link.label}
                </span>
              </Link>
            )
          })}

          {/* PANEL - CORREGIDO: usa showPanel en vez de !loading */}
          {showPanel && panelLink && (
            <Link
              href={panelLink}
              className={`flex items-center gap-2 ${
                pathname.startsWith('/admin') || pathname.startsWith('/dashboard') 
                  ? 'border-b-2 border-[#85332A]' 
                  : ''
              }`}
            >
              <LayoutDashboard size={16} color="#F2E9DC" />
              <span
                className="text-[18px]"
                style={{
                  fontFamily: 'var(--font-newsreader)',
                  color: '#F2E9DC',
                  fontWeight: (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) 
                    ? 700 
                    : 500,
                }}
              >
                {role === 'superadmin' ? 'Admin' : 'Panel'}
              </span>
            </Link>
          )}
        </nav>

        {/* USER */}
        <button
          onClick={handleUserClick}
          className="flex items-center justify-center opacity-80 hover:opacity-100 transition p-2"
        >
          {user ? (
            <Home size={20} color="#F2E9DC" />
          ) : (
            <User size={20} color="#F2E9DC" />
          )}
        </button>

      </div>
      <div className="w-full h-px bg-[#F2E9DC] opacity-15" />
      
      {/* MOBILE SIDEBAR */}
      {open && (
        <>
          {/* OVERLAY */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* SIDEBAR */}
          <div className="fixed top-0 left-0 h-full w-[280px] bg-[#85332A] z-50 md:hidden p-6 flex flex-col">

            {/* HEADER DEL MENÚ */}
            <div className="flex items-center justify-between mb-10">
              <span
                className="text-[#F2E9DC] font-black text-2xl uppercase"
                style={{ fontFamily: 'var(--font-newsreader)' }}
              >
                Escenia
              </span>

              <button onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            {/* LINKS */}
            <div className="flex flex-col gap-6">
              {links.map((link) => {
                const isActive = pathname === link.href

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex flex-col ${
                      isActive ? 'border-b border-white w-fit' : ''
                    }`}
                  >
                    <span
                      className="text-[22px]"
                      style={{
                        fontFamily: 'var(--font-newsreader)',
                        color: isActive ? '#FFFFFF' : '#F2E9DC',
                        fontWeight: isActive ? 700 : 400,
                      }}
                    >
                      {link.label}
                    </span>
                  </Link>
                )
              })}

              {/* PANEL MOBILE - CORREGIDO: usa showPanel */}
              {showPanel && panelLink && (
                <Link
                  href={panelLink}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 ${
                    pathname.startsWith('/admin') || pathname.startsWith('/dashboard') 
                      ? 'border-b border-white w-fit' 
                      : ''
                  }`}
                >
                  <LayoutDashboard size={20} color="#F2E9DC" />
                  <span
                    className="text-[22px]"
                    style={{
                      fontFamily: 'var(--font-newsreader)',
                      color: '#F2E9DC',
                      fontWeight: (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) 
                        ? 700 
                        : 500,
                    }}
                  >
                    {role === 'superadmin' ? 'Admin' : 'Panel'}
                  </span>
                </Link>
              )}
            </div>

            {/* USER ABAJO */}
            <div className="mt-auto pt-10">
              <button
                onClick={() => {
                  handleUserClick()
                  setOpen(false)
                }}
                className="flex items-center gap-3 text-[#F2E9DC] opacity-80 hover:opacity-100"
              >
                {user ? <Home size={20} /> : <User size={20} />}
                <span className="text-lg">
                  {user ? 'Perfil' : 'Iniciar sesión'}
                </span>
              </button>
            </div>

          </div>
        </>
      )}
    </header>
  )
}