'use client'
import { useState } from 'react'
import { Task, WordOrderContent } from '@/types'
import { Check, X, RotateCcw } from 'lucide-react'

interface Props { task: Task; onResult: (correct: boolean, score: number) => void }

export default function WordOrderTask({ task, onResult }: Props) {
  const content = task.content as WordOrderContent
  const [available, setAvailable] = useState<string[]>([...content.words])
  const [placed, setPlaced] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)

  const addWord = (word: string, idx: number) => {
    if (checked) return
    setAvailable(prev => prev.filter((_, i) => i !== idx))
    setPlaced(prev => [...prev, word])
  }

  const removeWord = (word: string, idx: number) => {
    if (checked) return
    setPlaced(prev => prev.filter((_, i) => i !== idx))
    setAvailable(prev => [...prev, word])
  }

  const reset = () => {
    setAvailable([...content.words])
    setPlaced([])
    setChecked(false)
    setCorrect(false)
  }

  const check = () => {
    const answer = placed.join(' ')
    const isCorrect = answer.trim() === content.sentence.trim()
    setCorrect(isCorrect)
    setChecked(true)
    onResult(isCorrect, isCorrect ? 10 : 0)
  }

  return (
    <div className="card p-6 space-y-5">
      {content.audio_url && <audio controls src={content.audio_url} className="w-full h-10" />}

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ihr Satz</p>
        <div className={`min-h-14 p-3 rounded-xl border-2 border-dashed flex flex-wrap gap-2 transition-colors ${
          checked
            ? correct ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
            : 'border-gray-200 bg-gray-50'
        }`}>
          {placed.map((word, i) => (
            <button key={i}
              onClick={() => removeWord(word, i)}
              disabled={checked}
              className="px-3 py-1.5 bg-white border border-gray-200 shadow-soft rounded-lg text-sm font-medium hover:border-red-300 hover:bg-red-50 transition-colors">
              {word}
            </button>
          ))}
          {!placed.length && <span className="text-gray-400 text-sm self-center">Klicken Sie auf Wörter unten...</span>}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Verfügbare Wörter</p>
        <div className="flex flex-wrap gap-2">
          {available.map((word, i) => (
            <button key={i}
              onClick={() => addWord(word, i)}
              disabled={checked}
              className="px-3 py-1.5 bg-white border border-gray-200 shadow-soft rounded-lg text-sm font-medium hover:border-brand-300 hover:bg-brand-50 transition-colors">
              {word}
            </button>
          ))}
        </div>
      </div>

      {!checked ? (
        <div className="flex gap-2">
          <button onClick={check} disabled={!placed.length} className="btn-primary">
            Überprüfen
          </button>
          <button onClick={reset} className="btn-ghost">
            <RotateCcw size={15} /> Zurücksetzen
          </button>
        </div>
      ) : (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {correct
            ? <><Check size={16} /> Richtig! 🎉</>
            : <><X size={16} /> Leider falsch. Richtig: <em>{content.sentence}</em></>
          }
        </div>
      )}
    </div>
  )
}
