'use client'

import { Mail, Share2 } from 'lucide-react'

export default function Footer() {
  return (
    // QUITAR: mt-24
    // AGREGAR: pt-24 (para mantener el espacio pero dentro del footer)
    <footer className="bg-[#F2E9DC] w-full pt-24 pb-16 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-end">

        {/* LEFT */}
        <div className="space-y-8">
          <h1
            className="text-4xl italic text-[#85332A]"
            style={{ fontFamily: 'var(--font-newsreader)' }}
          >
            ESCENIA
          </h1>

          <p className="text-sm leading-relaxed text-[#554240] max-w-md">
            Plataforma dedicada a la difusión y dignificación del folklore peruano.
            Promovemos el arte, la tradición y el talento nacional a través de la
            curaduría digital.
          </p>

          <p className="text-sm text-[#554240]/60">
            © 2026 Escenia Cultural. Patrimonio Vivo del Perú.
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col md:items-end gap-12">

          {/* LINKS */}
          <nav className="flex flex-wrap gap-8 md:justify-end">
            <a className="text-sm text-[#554240] hover:text-[#85332A] transition" href="#">
              Facebook
            </a>
            <a className="text-sm text-[#554240] hover:text-[#85332A] transition" href="#">
              Instagram
            </a>
            <a className="text-sm text-[#554240] hover:text-[#85332A] transition" href="#">
              TikTok
            </a>
            <a className="text-sm text-[#554240] hover:text-[#85332A] transition" href="#">
              Contáctanos
            </a>
          </nav>

          {/* ICONOS */}
          <div className="flex gap-4">

            <button className="w-12 h-12 border border-[#85332A]/20 flex items-center justify-center hover:bg-[#85332A]/10 transition">
              <Mail className="text-[#85332A]" size={20} />
            </button>

            <button className="w-12 h-12 border border-[#85332A]/20 flex items-center justify-center hover:bg-[#85332A]/10 transition">
              <Share2 className="text-[#85332A]" size={20} />
            </button>

          </div>

        </div>

      </div>
    </footer>
  )
}