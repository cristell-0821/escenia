"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        alert(error.message)
        return
    }

    router.push('/') 
    }

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT IMAGE */}
      <section className="hidden md:flex w-1/2 bg-[#e8e2d6] relative overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 opacity-20 bg-[url('/img/home/hero_fondo.png')]"></div>

        <div className="relative z-10 w-full h-full border border-[#dbc1bd]/20 p-4 flex flex-col">
          <img
            src="/img/home/editorial.webp"
            className="w-full h-full object-cover grayscale-[30%] contrast-[110%]"
          />

          <div className="absolute bottom-12 left-12 right-12 text-white">
            <p className="italic text-3xl mb-4">
              "La danza es el lenguaje oculto del alma de un pueblo."
            </p>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="flex-1 flex items-center justify-center p-8 md:p-24 bg-[#fff8ef] mt-20 md:mt-0">
        <div className="w-full max-w-md">
          <header className="mb-12">
            <span className="text-xs uppercase tracking-[0.4em] text-[#85332A] mb-6 block">
              Acceso
            </span>

            <h1 className="text-5xl font-bold mb-4">
              Bienvenido
            </h1>

            <p className="text-[#554240] text-sm">
              Continúa explorando el folklore peruano.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* EMAIL */}
            <div>
              <label className="text-xs uppercase tracking-widest text-[#554240]">
                Correo
              </label>
              <input
                name="email"
                type="email"
                required
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#dbc1bd] py-3 outline-none focus:border-[#85332A]"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between">
                <label className="text-xs uppercase tracking-widest text-[#554240]">
                  Contraseña
                </label>
              </div>

              <input
                name="password"
                type="password"
                required
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#dbc1bd] py-3 outline-none focus:border-[#85332A]"
              />
            </div>

            {/* BUTTON */}
            <div className="pt-4">
              <button
                disabled={loading}
                className="w-full bg-[#85332A] text-white py-5 uppercase tracking-widest text-sm font-bold hover:opacity-90 transition flex justify-center items-center gap-2"
              >
                {loading ? "Ingresando..." : "Ingresar →"}
              </button>
            </div>
          </form>

          {/* REGISTER */}
          <div className="mt-12 text-center text-sm text-[#554240]">
            ¿No tienes cuenta?{" "}
            <a
              href="/registro"
              className="text-[#85332A] font-bold uppercase tracking-widest"
            >
              Crear cuenta
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}