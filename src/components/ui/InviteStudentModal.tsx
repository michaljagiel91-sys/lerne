'use client'
import { useState } from 'react'
import { UserPlus, X, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function InviteStudentModal() {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/create-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, full_name: fullName }),
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error ?? 'Fehler beim Erstellen.'); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    router.refresh()
    setTimeout(() => {
      setOpen(false)
      setSuccess(false)
      setFullName('')
      setEmail('')
    }, 2000)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <UserPlus size={16} /> Lernenden einladen
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Lernenden erstellen</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost p-1.5"><X size={18} /></button>
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={22} className="text-green-600" />
                </div>
                <p className="font-medium text-gray-900">Konto erstellt!</p>
                <p className="text-sm text-gray-500 mt-1">Eine E-Mail wurde an {email} gesendet.</p>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>}
                <div>
                  <label className="label">Vollständiger Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="input" placeholder="Anna Schmidt" required />
                </div>
                <div>
                  <label className="label">E-Mail-Adresse</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input" placeholder="anna@beispiel.de" required />
                </div>
                <p className="text-xs text-gray-500">
                  Ein temporäres Passwort wird per E-Mail gesendet. Der Lernende kann es beim ersten Login ändern.
                </p>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Erstellen...' : 'Konto erstellen'}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Abbrechen</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
