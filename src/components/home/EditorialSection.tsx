'use client'

import Image from 'next/image'

export default function EditorialSection() {
  return (
    <section className="bg-[#FFF8EF] bg-weave py-20 md:py-32 px-4 md:px-8">
     <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">

        {/* LEFT */}
        <div className="md:col-span-7 space-y-8 md:space-y-12">

          {/* Title */}
          <h2
            className="text-3xl leading-snug md:text-6xl md:leading-tight text-[#1E1B14]"
            style={{ fontFamily: 'var(--font-newsreader)' }}
          >
            Preservando la <span className="italic">esencia</span> del movimiento y la tradición.
          </h2>

          {/* Texts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 text-[#554240] text-base md:text-lg leading-relaxed">

            <p>
              Escenia es el archivo digital y punto de encuentro de la comunidad folclórica peruana. Un espacio curado donde las expresiones culturales, la tradición y la identidad colectiva se preservan, se comparten y cobran nueva vida.
            </p>

            <p>
              Nuestra misión es conectar a las agrupaciones con el mundo, facilitando el acceso a concursos nacionales, formación académica y el registro histórico de nuestra diversidad cultural con el fin de promover las buenas costumbres.
            </p>

          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-5 pt-8 md:pt-0">

          <div className="relative group">

            {/* Fondo decorativo */}
            <div className="absolute -top-6 -left-6 w-full h-full bg-[#EEE7DB] z-0" />

            {/* Imagen */}
            <div className="relative w-full h-[300px] md:h-[500px] z-10 overflow-hidden">
              <Image
                src="/img/home/editorial.webp"
                alt="Danza folklórica"
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover group-hover:scale-105 transition duration-700"
              />
            </div>

            {/* Badge */}
            <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 bg-[#85332A] text-white px-4 md:px-6 py-2 md:py-4 z-20">
              <span
                className="text-lg md:text-2xl italic"
                style={{ fontFamily: 'var(--font-newsreader)' }}
              >
                Cultura viva
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
    </section>
  )
}