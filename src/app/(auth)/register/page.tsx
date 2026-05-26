'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'student' },
        emailRedirectTo: `${location.origin}/`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Konto erstellt!</h2>
        <p className="text-sm text-gray-500 mb-6">
          Bitte überprüfen Sie Ihre E-Mail und bestätigen Sie Ihr Konto.
        </p>
        <Link href="/login" className="btn-primary">Zur Anmeldung</Link>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Konto erstellen</h1>
      <p className="text-sm text-gray-500 mb-6">Registrieren Sie sich als Lernender</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="label">Vollständiger Name</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
            className="input" placeholder="Max Mustermann" required />
        </div>
        <div>
          <label className="label">E-Mail-Adresse</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="input" placeholder="name@beispiel.de" required />
        </div>
        <div>
          <label className="label">Passwort</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="input" placeholder="Mindestens 8 Zeichen" minLength={8} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <UserPlus size={16} />
          {loading ? 'Registrieren...' : 'Registrieren'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Bereits ein Konto?{' '}
        <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
          Anmelden
        </Link>
      </p>
    </div>
  )
}
