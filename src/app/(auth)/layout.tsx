export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at 4% 2%, #c5d9be 0, transparent 30%), radial-gradient(circle at 96% 5%, #e8c9a8 0, transparent 28%), #2a3d30'
      }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: '#24644d' }}>
            <span className="text-3xl font-black text-white">L!</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Lerne!</h1>
          <p className="mt-1 text-sm" style={{ color: '#a8c4b0' }}>Interaktive Deutschlernplattform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
