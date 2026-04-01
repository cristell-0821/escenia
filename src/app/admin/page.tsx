export default function AdminPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1e1b14]">Panel de Administración</h1>
      <p className="text-[#554240]">Bienvenido al panel de superadmin</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/admin/solicitudes" className="bg-[#faf3e7] p-6 border border-[#dbc1bd]/20 hover:border-[#85332a]/30 transition-colors">
          <h3 className="font-serif text-xl text-[#85332a]">Solicitudes</h3>
          <p className="text-sm text-[#554240] mt-2">Gestionar solicitudes de registro</p>
        </a>
        
        <a href="/admin/agrupaciones" className="bg-[#faf3e7] p-6 border border-[#dbc1bd]/20 hover:border-[#85332a]/30 transition-colors">
          <h3 className="font-serif text-xl text-[#85332a]">Agrupaciones</h3>
          <p className="text-sm text-[#554240] mt-2">Ver todas las agrupaciones</p>
        </a>
         
        <a href="/admin/concursos" className="bg-[#faf3e7] p-6 border border-[#dbc1bd]/20 hover:border-[#85332a]/30 transition-colors">
          <h3 className="font-serif text-xl text-[#85332a]">Concursos</h3>
          <p className="text-sm text-[#554240] mt-2">Crear y gestionar concursos</p>
        </a>
      </div>
    </div>
  )
}