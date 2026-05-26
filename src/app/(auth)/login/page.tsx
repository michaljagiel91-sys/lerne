'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-Mail oder Passwort ist falsch.')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="card p-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Willkommen zurück</h1>
      <p className="text-sm text-gray-500 mb-6">Melden Sie sich in Ihrem Konto an</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="label">E-Mail-Adresse</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            placeholder="name@beispiel.de"
            required
          />
        </div>

        <div>
          <label className="label">Passwort</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input pr-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          <LogIn size={16} />
          {loading ? 'Anmelden...' : 'Anmelden'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Noch kein Konto?{' '}
        <Link href="/register" className="text-brand-600 hover:text-brand-700 font-medium">
          Registrieren
        </Link>
      </p>
    </div>
  )
}
