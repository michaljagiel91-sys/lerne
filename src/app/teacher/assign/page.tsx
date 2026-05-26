'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Check, Calendar } from 'lucide-react'
import { Lesson, Profile } from '@/types'

export default function AssignPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [students, setStudents] = useState<Profile[]>([])
  const [selectedLesson, setSelectedLesson] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const [l, s] = await Promise.all([
        supabase.from('lessons').select('*').eq('teacher_id', user!.id).order('title'),
        supabase.from('profiles').select('*').eq('role', 'student').order('full_name'),
      ])
      setLessons(l.data ?? [])
      setStudents(s.data ?? [])
    }
    load()
  }, [])

  const toggleStudent = (id: string) =>
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const handleAssign = async () => {
    if (!selectedLesson || !selectedStudents.length) {
      setError('Bitte wählen Sie eine Lektion und mindestens einen Lernenden aus.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const records = selectedStudents.map(studentId => ({
      lesson_id: selectedLesson,
      student_id: studentId,
      teacher_id: user!.id,
      due_date: dueDate || null,
      is_completed: false,
    }))

    const { error } = await supabase.from('assignments').upsert(records, {
      onConflict: 'lesson_id,student_id',
    })

    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setSelectedStudents([])
    setSelectedLesson('')
    setDueDate('')
    setLoading(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Aufgaben zuweisen</h1>
          <p className="text-sm text-gray-500 mt-1">Lektionen an Lernende verteilen</p>
        </div>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>}
      {success && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 flex items-center gap-2"><Check size={16} /> Erfolgreich zugewiesen!</div>}

      <div className="space-y-5">
        <div className="card p-5">
          <label className="label">Lektion auswählen *</label>
          <select value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)} className="input">
            <option value="">Lektion wählen...</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title} {l.level ? `(${l.level})` : ''}</option>)}
          </select>
        </div>

        <div className="card p-5">
          <label className="label">Fälligkeitsdatum (optional)</label>
          <div className="relative">
            <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="input pl-9" min={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="label mb-0">Lernende auswählen *</label>
            {selectedStudents.length > 0 && (
              <span className="text-xs text-brand-600 font-medium">{selectedStudents.length} ausgewählt</span>
            )}
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-gray-400">Keine Lernenden registriert.</p>
          ) : (
            <div className="space-y-1.5">
              <button type="button" onClick={() =>
                setSelectedStudents(selectedStudents.length === students.length ? [] : students.map(s => s.id))}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium mb-2">
                {selectedStudents.length === students.length ? 'Alle abwählen' : 'Alle auswählen'}
              </button>
              {students.map(student => (
                <label key={student.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="accent-brand-600 w-4 h-4" />
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">
                    {student.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.full_name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleAssign} disabled={loading || !selectedLesson || !selectedStudents.length}
          className="btn-primary w-full">
          <Send size={16} />
          {loading ? 'Zuweisen...' : `Lektion zuweisen${selectedStudents.length > 0 ? ` (${selectedStudents.length} Lernende)` : ''}`}
        </button>
      </div>
    </div>
  )
}
