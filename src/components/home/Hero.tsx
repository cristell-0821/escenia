'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative w-full h-[650px] md:h-[795px] overflow-hidden bg-[#FAF3E7]">

      {/* Background */}
      <Image
        src="/img/home/hero_fondo.png"
        alt="Danzas folklóricas"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay oscuro mejorado */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(30,27,20,0.65)_0%,rgba(30,27,20,0.3)_40%,rgba(30,27,20,0)_70%)] z-10" />

      {/* Overlay inferior */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(30,27,20,0.5)_0%,transparent_50%)] z-20" />

      {/* Contenido */}
      <div className="relative z-30 max-w-[1280px] h-full mx-auto px-4 md:px-8 flex items-center">

        <div className="max-w-[640px] flex flex-col gap-5 md:gap-6">

          {/* Título */}
          <h1
            className="text-white text-[38px] leading-[44px] md:text-[72px] md:leading-[78px] font-[800] tracking-[-1px]"
            style={{
              fontFamily: 'var(--font-newsreader)',
              textShadow: '0px 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            El latido del Folklore peruano
          </h1>

          {/* Subtexto */}
          <p
            className="text-[16px] leading-[24px] md:text-[20px] md:leading-[30px] text-[#F2E9DC]/90 italic max-w-[520px]"
            style={{ fontFamily: 'var(--font-newsreader)' }}
          >
            Descubre concursos, agrupaciones y expresiones culturales que mantienen viva nuestra identidad.
          </p>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-4 md:pt-6">

            {/* PRIMARY */}
            <Link href="/concursos">
              <button className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 bg-[#a3740df2] text-white text-sm tracking-[0.2em] uppercase font-medium 
              hover:bg-[#886211] transition-all duration-300">
                Ver concursos
              </button>
            </Link>

            {/* SECONDARY */}
            <Link href="/agrupaciones">
              <button className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 border border-[#F2E9DC]/50 text-[#F2E9DC] text-sm tracking-[0.2em] uppercase font-medium 
              hover:bg-[#F2E9DC] hover:text-[#1E1B14] transition-all duration-300">
                Explorar agrupaciones
              </button>
            </Link>

          </div>

        </div>
      </div>
    </section>
  )
}