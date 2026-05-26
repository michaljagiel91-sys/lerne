'use client'
import { useState } from 'react'
import { Task, MultipleChoiceContent } from '@/types'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { task: Task; onResult: (correct: boolean, score: number) => void }

export default function MultipleChoiceTask({ task, onResult }: Props) {
  const content = task.content as MultipleChoiceContent
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  const check = () => {
    if (selected === null) return
    setChecked(true)
    const correct = content.options[selected].is_correct
    onResult(correct, correct ? 10 : 0)
  }

  return (
    <div className="card p-6 space-y-4">
      {content.image_url && <img src={content.image_url} alt="" className="rounded-xl max-h-48 object-cover w-full" />}
      {content.audio_url && <audio controls src={content.audio_url} className="w-full h-10" />}

      <p className="text-base font-medium text-gray-900">{content.question}</p>

      <div className="space-y-2">
        {content.options.map((opt, i) => {
          const isSelected = selected === i
          const showResult = checked && (isSelected || opt.is_correct)
          return (
            <button key={i}
              onClick={() => !checked && setSelected(i)}
              disabled={checked}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 flex items-center gap-3',
                showResult
                  ? opt.is_correct
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : isSelected
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : 'bg-white border-gray-200 text-gray-500'
                  : isSelected
                  ? 'bg-brand-50 border-brand-400 text-brand-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-brand-50'
              )}>
              <span className={cn(
                'w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-semibold',
                showResult
                  ? opt.is_correct ? 'border-green-500 bg-green-500 text-white' : isSelected ? 'border-red-500 bg-red-500 text-white' : 'border-gray-200'
                  : isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300'
              )}>
                {showResult
                  ? opt.is_correct ? <Check size={12} /> : isSelected ? <X size={12} /> : String.fromCharCode(65 + i)
                  : String.fromCharCode(65 + i)
                }
              </span>
              {opt.text}
            </button>
          )
        })}
      </div>

      {!checked && (
        <button onClick={check} disabled={selected === null} className="btn-primary">
          Überprüfen
        </button>
      )}
    </div>
  )
}
