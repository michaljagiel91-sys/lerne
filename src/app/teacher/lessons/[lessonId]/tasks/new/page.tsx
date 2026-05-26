'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TaskType } from '@/types'
import { cn } from '@/lib/utils'
import TaskEditor from '@/components/tasks/TaskEditor'

const TASK_TYPES: { type: TaskType; label: string; desc: string; emoji: string; category: string }[] = [
  // Interaktive Übungen
  { type: 'fill_blank',      label: 'Lückentext',          desc: 'Fehlende Wörter ergänzen',     emoji: '✏️', category: 'Übungen' },
  { type: 'match_pairs',     label: 'Paare zuordnen',      desc: 'Begriffe verbinden',           emoji: '🔗', category: 'Übungen' },
  { type: 'word_order',      label: 'Wörter ordnen',       desc: 'Satz aus Wörtern bilden',      emoji: '🔀', category: 'Übungen' },
  { type: 'true_false',      label: 'Wahr oder falsch',    desc: 'Aussagen bewerten',            emoji: '✅', category: 'Übungen' },
  { type: 'multiple_choice', label: 'Multiple Choice',     desc: 'Richtige Antwort wählen',      emoji: '🔘', category: 'Übungen' },
  // Spiele
  { type: 'memory',          label: 'Memory',              desc: 'Wortpaare aufdecken',          emoji: '🃏', category: 'Spiele' },
  { type: 'crossword',       label: 'Kreuzworträtsel',     desc: 'Wörter erraten',               emoji: '🔤', category: 'Spiele' },
  { type: 'tictactoe',       label: 'Tic-Tac-Toe',         desc: 'Grammatik-Quiz-Spiel',         emoji: '❌', category: 'Spiele' },
  { type: 'labyrinth',       label: 'Labyrinth',           desc: 'Vokabeln auf dem Weg sammeln', emoji: '🌀', category: 'Spiele' },
]

const categories = ['Übungen', 'Spiele']

export default function NewTaskPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string
  const [selectedType, setSelectedType] = useState<TaskType | null>(null)

  if (selectedType) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedType(null)} className="btn-ghost p-2">
            <ArrowLeft size={18} />
          </button>
          <h1 className="page-title">
            {TASK_TYPES.find(t => t.type === selectedType)?.label} erstellen
          </h1>
        </div>
        <TaskEditor
          lessonId={lessonId}
          taskType={selectedType}
          onSaved={() => router.push(`/teacher/lessons/${lessonId}/edit`)}
          onCancel={() => setSelectedType(null)}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/teacher/lessons/${lessonId}/edit`} className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Aufgabentyp wählen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Wählen Sie den gewünschten Aufgabentyp</p>
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{cat}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {TASK_TYPES.filter(t => t.category === cat).map(({ type, label, desc, emoji }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'card p-4 text-left hover:shadow-card hover:border-brand-200 transition-all duration-150 group'
                )}
              >
                <div className="text-2xl mb-2">{emoji}</div>
                <div className="font-semibold text-gray-900 text-sm group-hover:text-brand-700">{label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
