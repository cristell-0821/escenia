'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function AgrupacionesSection() {
  return (
    <section className="bg-[#FFF8EF] py-32 px-8 overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-20 items-center">

        {/* IMAGEN */}
        <div className="w-full md:w-1/2 order-2 md:order-1">
          <div className="relative w-full h-[600px] group">

            <Image
              src="/img/home/agrupacion.png"
              alt="Agrupaciones folklóricas"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover grayscale-[30%] group-hover:grayscale-0 transition duration-700"
            />

            {/* marco decorativo */}
            <div className="absolute -inset-4 border border-[#DBC1BD]/30" />

            {/* borde interno */}
            <div className="absolute inset-0 border-[20px] border-[#FFF8EF]" />

          </div>
        </div>

        {/* TEXTO */}
        <div className="w-full md:w-1/2 order-1 md:order-2 space-y-10">

          <h2
            className="text-[52px] leading-[1.1] text-[#1E1B14]"
            style={{ fontFamily: 'var(--font-newsreader)' }}
          >
            Conecta con las{" "}
            <span className="text-[#85332A] italic">
              mejores agrupaciones
            </span>{" "}
            del país.
          </h2>

          <p className="text-lg text-[#554240] leading-relaxed max-w-lg">
            Explora nuestra base de datos con agrupaciones profesionales,
            escuelas y asociaciones culturales de todo el Perú.
          </p>

          {/* LISTA */}
          <div className="space-y-6">

            {/* ITEM 1 */}
            <div className="flex items-center gap-6 group cursor-pointer">
              <span
                className="text-3xl text-[#DBC1BD] group-hover:text-[#85332A] transition"
                style={{ fontFamily: 'var(--font-newsreader)' }}
              >
                01
              </span>

              <div className="h-px flex-1 bg-[#DBC1BD]/40" />

              <h4
                className="text-2xl text-[#1E1B14]"
                style={{ fontFamily: 'var(--font-newsreader)' }}
              >
                Agrupaciones Profesionales
              </h4>
            </div>

            {/* ITEM 2 */}
            <div className="flex items-center gap-6 group cursor-pointer">
              <span
                className="text-3xl text-[#DBC1BD] group-hover:text-[#85332A] transition"
                style={{ fontFamily: 'var(--font-newsreader)' }}
              >
                02
              </span>

              <div className="h-px flex-1 bg-[#DBC1BD]/40" />

              <h4
                className="text-2xl text-[#1E1B14]"
                style={{ fontFamily: 'var(--font-newsreader)' }}
              >
                Escuelas de Formación
              </h4>
            </div>

            {/* ITEM 3 */}
            <div className="flex items-center gap-6 group cursor-pointer">
              <span
                className="text-3xl text-[#DBC1BD] group-hover:text-[#85332A] transition"
                style={{ fontFamily: 'var(--font-newsreader)' }}
              >
                03
              </span>

              <div className="h-px flex-1 bg-[#DBC1BD]/40" />

              <h4
                className="text-2xl text-[#1E1B14]"
                style={{ fontFamily: 'var(--font-newsreader)' }}
              >
                Asociaciones Culturales
              </h4>
            </div>

          </div>

          {/* BOTÓN */}
          <Link
            href="/agrupaciones"
            className="inline-block mt-6 bg-[#85332A] text-white px-10 py-4 uppercase tracking-widest text-sm font-bold 
            hover:bg-[#6E2A23] transition shadow-lg shadow-[#85332A]/20"
          >
            Ver Directorio Completo
          </Link>

        </div>
      </div>
    </div>  
    </section>
  )
}