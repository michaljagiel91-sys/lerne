export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-4xl font-bold text-white tracking-tight">Lerne!</span>
          </div>
          <p className="text-brand-300 text-sm">Interaktive Deutschlernplattform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
