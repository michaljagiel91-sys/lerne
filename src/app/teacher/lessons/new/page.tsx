'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

const LEVELS = ['A1','A2','B1','B2','C1','C2']
const TOPICS = [
  'Grammatik', 'Wortschatz', 'Leseverstehen', 'Hörverstehen',
  'Schreiben', 'Sprechen', 'Kultur', 'Alltagssprache',
]

export default function NewLessonPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('')
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('lessons').insert({
      teacher_id: user!.id,
      title,
      description: description || null,
      level: level || null,
      topic: topic || null,
      is_published: false,
    }).select().single()

    if (error) { setError(error.message); setLoading(false); return }
    router.push(`/teacher/lessons/${data.id}/edit`)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/teacher/lessons" className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="page-title">Neue Lektion erstellen</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Titel der Lektion *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="input" placeholder="z.B. Das Perfekt – Vergangenheit ausdrücken" required />
        </div>

        <div>
          <label className="label">Beschreibung</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="input h-24 resize-none"
            placeholder="Kurze Beschreibung des Lektionsziels..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Sprachniveau</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="input">
              <option value="">Kein Niveau</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Thema</label>
            <select value={topic} onChange={e => setTopic(e.target.value)} className="input">
              <option value="">Kein Thema</option>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            <BookOpen size={16} />
            {loading ? 'Erstellen...' : 'Lektion erstellen'}
          </button>
          <Link href="/teacher/lessons" className="btn-secondary">Abbrechen</Link>
        </div>
      </form>
    </div>
  )
}
