'use client'
import { useState } from 'react'
import { Task, FillBlankContent } from '@/types'
import { Check, X, Volume2 } from 'lucide-react'

interface Props { task: Task; onResult: (correct: boolean, score: number) => void }

export default function FillBlankTask({ task, onResult }: Props) {
  const content = task.content as FillBlankContent
  const [answers, setAnswers] = useState<string[]>(content.blanks.map(() => ''))
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<boolean[]>([])

  const parts = content.text.split(/(\{\{[^}]+\}\})/g)
  let blankIdx = 0

  const check = () => {
    const res = content.blanks.map((b, i) =>
      answers[i].trim().toLowerCase() === b.answer.toLowerCase() ||
      b.alternatives?.some(a => a.toLowerCase() === answers[i].trim().toLowerCase())
    )
    setResults(res)
    setChecked(true)
    const correct = res.every(Boolean)
    const score = Math.round((res.filter(Boolean).length / res.length) * 10)
    onResult(correct, score)
  }

  return (
    <div className="card p-6 space-y-4">
      {content.image_url && (
        <img src={content.image_url} alt="" className="rounded-xl max-h-48 object-cover w-full" />
      )}

      {content.audio_url && (
        <div className="flex items-center gap-2">
          <audio controls src={content.audio_url} className="flex-1 h-10" />
        </div>
      )}

      <div className="text-base leading-relaxed">
        {parts.map((part, i) => {
          const match = part.match(/\{\{([^}]+)\}\}/)
          if (match) {
            const idx = blankIdx++
            const isCorrect = checked ? results[idx] : null
            return (
              <span key={i} className="inline-flex items-center mx-1">
                <input
                  type="text"
                  value={answers[idx]}
                  onChange={e => {
                    if (checked) return
                    const copy = [...answers]
                    copy[idx] = e.target.value
                    setAnswers(copy)
                  }}
                  disabled={checked}
                  className={`border-b-2 bg-transparent outline-none px-1 text-center min-w-20 transition-colors
                    ${isCorrect === null ? 'border-gray-300 focus:border-brand-400' :
                      isCorrect ? 'border-green-400 text-green-700' : 'border-red-400 text-red-600'}`}
                  style={{ width: `${Math.max(match[1].length + 2, 6)}ch` }}
                />
                {checked && (isCorrect
                  ? <Check size={14} className="text-green-500 ml-1" />
                  : <span className="text-xs text-red-500 ml-1">({match[1]})</span>
                )}
              </span>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </div>

      {!checked && (
        <button onClick={check} className="btn-primary">
          Überprüfen
        </button>
      )}

      {checked && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          results.every(Boolean) ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {results.every(Boolean)
            ? <><Check size={16} /> Alle Antworten richtig! 🎉</>
            : <><X size={16} /> {results.filter(Boolean).length} von {results.length} richtig</>
          }
        </div>
      )}
    </div>
  )
}
