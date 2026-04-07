"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export default function RecuperarContrasenaClient() {
  const supabase = createClient()
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Verificar que venga con token de recuperación
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Si hay sesión y viene de recuperación de contraseña
      if (session && !error) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
      setCheckingSession(false);
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validaciones
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    
    // Redirigir al login después de 3 segundos
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

  // Loading inicial
  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fff8ef]">
        <Loader2 className="w-8 h-8 animate-spin text-[#85332A]" />
      </main>
    );
  }

  // No hay sesión válida (token expirado o inválido)
  if (!isValidSession) {
    return (
      <main className="min-h-screen flex flex-col md:flex-row">
        <section className="hidden md:flex w-1/2 bg-[#e8e2d6] relative overflow-hidden items-center justify-center p-20">
          <div className="absolute inset-0 opacity-20 bg-[url('/img/home/hero_fondo.png')]"></div>
          <div className="relative z-10 w-full h-full border border-[#dbc1bd]/20 p-4 flex flex-col">
            <img
              src="/img/home/editorial.webp"
              className="w-full h-full object-cover grayscale-[30%] contrast-[110%]"
            />
          </div>
        </section>

        <section className="flex-1 flex items-center justify-center p-8 md:p-24 bg-[#fff8ef]">
          <div className="w-full max-w-md text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-[#85332A]">Enlace inválido</h1>
            <p className="text-[#554240] mb-8">
              El enlace de recuperación ha expirado o no es válido. Por favor, solicita uno nuevo.
            </p>
            <a
              href="/login"
              className="inline-block bg-[#85332A] text-white px-8 py-4 uppercase tracking-widest text-sm font-bold hover:opacity-90 transition"
            >
              Volver al login
            </a>
          </div>
        </section>
      </main>
    );
  }

  // Éxito: contraseña actualizada
  if (success) {
    return (
      <main className="min-h-screen flex flex-col md:flex-row">
        <section className="hidden md:flex w-1/2 bg-[#e8e2d6] relative overflow-hidden items-center justify-center p-20">
          <div className="absolute inset-0 opacity-20 bg-[url('/img/home/hero_fondo.png')]"></div>
          <div className="relative z-10 w-full h-full border border-[#dbc1bd]/20 p-4 flex flex-col">
            <img
              src="/img/home/editorial.webp"
              className="w-full h-full object-cover grayscale-[30%] contrast-[110%]"
            />
          </div>
        </section>

        <section className="flex-1 flex items-center justify-center p-8 md:p-24 bg-[#fff8ef]">
          <div className="w-full max-w-md text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4 text-[#85332A]">¡Contraseña actualizada!</h1>
            <p className="text-[#554240] mb-8">
              Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login en unos segundos...
            </p>
            <a
              href="/login"
              className="inline-block bg-[#85332A] text-white px-8 py-4 uppercase tracking-widest text-sm font-bold hover:opacity-90 transition"
            >
              Ir al login ahora
            </a>
          </div>
        </section>
      </main>
    );
  }

  // Formulario para nueva contraseña
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
              Seguridad
            </span>
            <h1 className="text-4xl font-bold mb-4">
              Nueva Contraseña
            </h1>
            <p className="text-[#554240] text-sm">
              Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* NUEVA CONTRASEÑA */}
            <div>
              <label className="text-xs uppercase tracking-widest text-[#554240] block mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-[#dbc1bd] py-3 pr-10 outline-none focus:border-[#85332A] [-webkit-text-security:none] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none'
                    }}
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

            {/* CONFIRMAR CONTRASEÑA */}
            <div>
              <label className="text-xs uppercase tracking-widest text-[#554240] block mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-[#dbc1bd] py-3 pr-10 outline-none focus:border-[#85332A] [-webkit-text-security:none] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none'
                    }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#554240] hover:text-[#85332A] transition-colors p-2"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>
            )}

            {/* BUTTON */}
            <div className="pt-4">
              <button
                disabled={loading}
                className="w-full bg-[#85332A] text-white py-5 uppercase tracking-widest text-sm font-bold hover:opacity-90 transition flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Guardar contraseña →"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}