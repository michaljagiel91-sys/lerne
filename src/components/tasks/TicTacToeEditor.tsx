'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Info } from 'lucide-react'
import { TicTacToeContent } from '@/types'

interface Props { content: unknown; onChange: (c: unknown) => void }

export default function TicTacToeEditor({ content, onChange }: Props) {
  const init = content as TicTacToeContent | null
  const [questions, setQuestions] = useState(init?.questions ?? Array(9).fill(null).map(() => ({ question: '', answer: '' })))
  const [instructions, setInstructions] = useState(init?.instructions ?? '')

  useEffect(() => {
    onChange({ questions, instructions } as TicTacToeContent)
  }, [questions, instructions])

  const update = (i: number, field: 'question' | 'answer', val: string) =>
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: val } : q))

  return (
    <div className="space-y-4">
      <div className="p-3 bg-red-50 rounded-xl text-sm text-red-700 flex gap-2">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <span>Erstellen Sie 9 Fragen (eine pro Feld). Ein Spieler beantwortet eine Frage, um ein Feld zu besetzen.</span>
      </div>

      <div>
        <label className="label">Spielanleitung</label>
        <input type="text" value={instructions} onChange={e => setInstructions(e.target.value)}
          className="input" placeholder="z.B. Beantworte die Frage, um das Feld zu besetzen!" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {questions.map((q, i) => (
          <div key={i} className="p-3 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2">
            <div className="text-xs font-semibold text-gray-400 text-center">Feld {i + 1}</div>
            <input type="text" value={q.question} onChange={e => update(i, 'question', e.target.value)}
              className="input text-xs" placeholder="Frage..." />
            <input type="text" value={q.answer} onChange={e => update(i, 'answer', e.target.value)}
              className="input text-xs" placeholder="Antwort..." />
          </div>
        ))}
      </div>
    </div>
  )
}
