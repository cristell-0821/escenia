"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

export default function LoginForm() {
  // ✅ Inicializa el cliente de forma lazy o dentro de useEffect
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/");
    } catch (err) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/recuperar-contrasena`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setRecoverySent(true);
    } catch (err) {
      setError("Error al enviar el correo");
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Vista de recuperación de contraseña
  if (isRecovering) {
    return (
      <main className="min-h-screen flex flex-col md:flex-row">
        {/* LEFT IMAGE */}
        <section className="hidden md:flex w-1/2 bg-[#e8e2d6] relative overflow-hidden items-center justify-center p-20">
          <div className="absolute inset-0 opacity-20 bg-[url('/img/add/login.jpg')]"></div>
          <div className="relative z-10 w-full h-full border border-[#dbc1bd]/20 p-4 flex flex-col">
            <img
              src="/img/add/login_image.jpg"
              className="w-full h-full object-cover grayscale-[30%] contrast-[110%]"
            />
            <div className="absolute bottom-12 left-12 right-12 text-white">
              <p className="italic text-3xl mb-4">
                "La danza es el lenguaje oculto del alma de un pueblo."
              </p>
            </div>
          </div>
        </section>

        {/* RECOVERY FORM */}
        <section className="flex-1 flex items-center justify-center p-8 md:p-24 bg-[#fff8ef] mt-20 md:mt-0">
          <div className="w-full max-w-md">
            <button
              onClick={() => setIsRecovering(false)}
              className="flex items-center gap-2 text-[#554240] hover:text-[#85332A] mb-8 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Volver al login</span>
            </button>

            <header className="mb-12">
              <span className="text-xs uppercase tracking-[0.4em] text-[#85332A] mb-6 block">
                Recuperación
              </span>
              <h1 className="text-4xl font-bold mb-4">
                Recuperar Contraseña
              </h1>
              <p className="text-[#554240] text-sm">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </header>

            {recoverySent ? (
              <div className="bg-green-50 border border-green-200 p-6 rounded">
                <p className="text-green-800 text-sm">
                  ✓ Revisa tu correo electrónico. Te hemos enviado un enlace para recuperar tu contraseña.
                </p>
                <button
                  onClick={() => {
                    setIsRecovering(false);
                    setRecoverySent(false);
                    setRecoveryEmail("");
                  }}
                  className="mt-4 text-[#85332A] font-bold text-sm hover:underline"
                >
                  Volver al login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecovery} className="space-y-10">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#554240] block mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-transparent border-b border-[#dbc1bd] py-3 outline-none focus:border-[#85332A]"
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <div className="pt-4">
                  <button
                    disabled={recoveryLoading}
                    className="w-full bg-[#85332A] text-white py-5 uppercase tracking-widest text-sm font-bold hover:opacity-90 transition flex justify-center items-center gap-2"
                  >
                    {recoveryLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar enlace →"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    );
  }

  // Vista de login normal
  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT IMAGE */}
      <section className="hidden md:flex w-1/2 bg-[#e8e2d6] relative overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 opacity-20 bg-[url('/img/add/login_image.jpg')]"></div>

        <div className="relative z-10 w-full h-full border border-[#dbc1bd]/20 p-4 flex flex-col">
          <img
            src="/img/add/login.jpg"
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

          <form onSubmit={handleLogin} className="space-y-10">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#554240] block mb-2">
                Correo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-[#dbc1bd] py-3 outline-none focus:border-[#85332A]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-widest text-[#554240]">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setIsRecovering(true)}
                  className="text-xs text-[#85332A] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-[#dbc1bd] py-3 pr-10 outline-none focus:border-[#85332A] [-webkit-text-security:none] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#554240] hover:text-[#85332A] transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <div className="pt-4">
              <button
                disabled={loading}
                className="w-full bg-[#85332A] text-white py-5 uppercase tracking-widest text-sm font-bold hover:opacity-90 transition flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  "Ingresar →"
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center text-sm text-[#554240]">
            ¿No tienes cuenta?{" "}
            <a
              href="/registro"
              className="text-[#85332A] font-bold uppercase tracking-widest hover:underline"
            >
              Crear cuenta
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}