"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegistroForm() {
  const supabase = createClient()
  const router = useRouter();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
        },
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row pt-20">
      {/* LEFT IMAGES */}
      <section className="hidden md:flex md:w-1/2 relative bg-[#eee7db] overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-30 bg-[url('/img/add/login.jpg')]"></div>

        <div className="relative z-10 w-full h-full flex flex-col">
          <div className="relative flex-1">
            <img
              src="/img/add/login.jpg"
              className="absolute top-0 right-0 w-3/4 h-2/3 object-cover shadow-2xl grayscale hover:grayscale-0 transition"
            />
            <img
              src="/img/add/login_image.jpg"
              className="absolute bottom-0 left-0 w-3/4 h-1/2 object-cover shadow-2xl z-20"
            />
          </div>

          <div className="mt-8 space-y-4">
            <p className="font-serif italic text-2xl text-[#85332A] max-w-xs">
              "La danza es el lenguaje secreto del alma de un pueblo."
            </p>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="flex-1 flex items-center justify-center p-8 md:p-16 bg-[#fff8ef]">
        <div className="w-full max-w-md">
          <header className="mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Únete a la Herencia
            </h1>
            <p className="text-[#554240]">
              Sé parte de la comunidad que preserva el folklore peruano.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-12">
              {/* NAME */}
              <div className="group">
                <label className="text-xs uppercase tracking-widest text-[#554240] group-focus-within:text-[#85332A]">
                  Nombre completo
                </label>
                <input
                  name="name"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-[#dbc1bd] focus:border-[#85332A] outline-none py-3"
                />
              </div>

              {/* EMAIL */}
              <div className="group">
                <label className="text-xs uppercase tracking-widest text-[#554240] group-focus-within:text-[#85332A]">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-[#dbc1bd] focus:border-[#85332A] outline-none py-3"
                />
              </div>

              {/* PASSWORD */}
              <div className="group">
                <label className="text-xs uppercase tracking-widest text-[#554240] group-focus-within:text-[#85332A]">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-[#dbc1bd] focus:border-[#85332A] outline-none py-3"
                />
              </div>
            </div>

            {/* BUTTON */}
            <div className="pt-6">
              <button
                disabled={loading}
                className="w-full bg-[#85332A] text-white py-5 uppercase tracking-widest text-sm font-bold hover:opacity-90 transition"
              >
                {loading ? "Creando..." : "Crear cuenta"}
              </button>
            </div>

            {/* LINK LOGIN */}
            <div className="text-center">
              <a
                href="/login"
                className="text-xs uppercase tracking-widest text-[#554240] hover:text-[#85332A]"
              >
                Ya tengo cuenta →
              </a>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}