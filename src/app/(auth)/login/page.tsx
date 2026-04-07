import dynamic from 'next/dynamic'

const LoginForm = dynamic(() => import('./LoginForm'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#fff8ef]">
      <div className="animate-pulse">Cargando...</div>
    </div>
  )
})

export default function LoginPage() {
  return <LoginForm />
}