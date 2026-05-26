'use client'
import { useState } from 'react'
import { Task, TrueFalseContent } from '@/types'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { task: Task; onResult: (correct: boolean, score: number) => void }

export default function TrueFalseTask({ task, onResult }: Props) {
  const content = task.content as TrueFalseContent
  const [answers, setAnswers] = useState<Record<number, boolean | null>>(
    Object.fromEntries(content.statements.map((_, i) => [i, null]))
  )
  const [checked, setChecked] = useState(false)

  const allAnswered = Object.values(answers).every(a => a !== null)

  const check = () => {
    setChecked(true)
    const correct = content.statements.filter((s, i) => answers[i] === s.is_true).length
    const score = Math.round((correct / content.statements.length) * 10)
    onResult(correct === content.statements.length, score)
  }

  return (
    <div className="card p-6 space-y-4">
      {content.image_url && <img src={content.image_url} alt="" className="rounded-xl max-h-48 object-cover w-full" />}
      {content.audio_url && <audio controls src={content.audio_url} className="w-full h-10" />}

      <div className="space-y-3">
        {content.statements.map((s, i) => {
          const userAnswer = answers[i]
          const isCorrectAnswer = checked ? userAnswer === s.is_true : null

          return (
            <div key={i} className={cn(
              'p-4 rounded-xl border transition-colors',
              checked
                ? isCorrectAnswer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-100'
            )}>
              <p className="text-sm font-medium text-gray-800 mb-3">{s.text}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => !checked && setAnswers(prev => ({ ...prev, [i]: true }))}
                  disabled={checked}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                    userAnswer === true
                      ? checked
                        ? s.is_true ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white'
                        : 'bg-brand-600 border-brand-600 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'
                  )}>
                  ✓ Wahr
                </button>
                <button
                  onClick={() => !checked && setAnswers(prev => ({ ...prev, [i]: false }))}
                  disabled={checked}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                    userAnswer === false
                      ? checked
                        ? !s.is_true ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white'
                        : 'bg-brand-600 border-brand-600 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50'
                  )}>
                  ✗ Falsch
                </button>
              </div>
              {checked && s.explanation && (
                <p className="text-xs text-gray-500 mt-2 italic">{s.explanation}</p>
              )}
            </div>
          )
        })}
      </div>

      {!checked && (
        <button onClick={check} disabled={!allAnswered} className="btn-primary">
          Überprüfen
        </button>
      )}
    </div>
  )
}
