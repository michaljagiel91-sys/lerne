'use client'
import { useState } from 'react'
import { Task, MatchPairsContent } from '@/types'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { task: Task; onResult: (correct: boolean, score: number) => void }

export default function MatchPairsTask({ task, onResult }: Props) {
  const content = task.content as MatchPairsContent
  const [leftSel, setLeftSel] = useState<number | null>(null)
  const [matched, setMatched] = useState<Record<number, number>>({}) // left→right
  const [wrong, setWrong] = useState<[number, number] | null>(null)
  const [checked, setChecked] = useState(false)

  const shuffledRight = useState(() =>
    [...content.pairs.map((_, i) => i)].sort(() => Math.random() - 0.5)
  )[0]

  const handleLeft = (i: number) => {
    if (checked || Object.keys(matched).includes(String(i))) return
    setWrong(null)
    setLeftSel(i)
  }

  const handleRight = (shuffledIdx: number) => {
    if (checked || !shuffledRight) return
    const rightIdx = shuffledRight[shuffledIdx]
    if (Object.values(matched).includes(rightIdx)) return

    if (leftSel === null) return
    if (leftSel === rightIdx) {
      setMatched(prev => ({ ...prev, [leftSel]: rightIdx }))
      setLeftSel(null)
    } else {
      setWrong([leftSel, shuffledIdx])
      setTimeout(() => { setWrong(null); setLeftSel(null) }, 800)
    }
  }

  const allMatched = Object.keys(matched).length === content.pairs.length

  const finish = () => {
    setChecked(true)
    onResult(true, 10)
  }

  return (
    <div className="card p-6 space-y-4">
      {content.audio_url && <audio controls src={content.audio_url} className="w-full h-10" />}

      <p className="text-sm text-gray-500">Klicken Sie auf ein Wort links, dann auf die passende Übersetzung rechts.</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {content.pairs.map((pair, i) => (
            <button key={i}
              onClick={() => handleLeft(i)}
              disabled={checked || Object.keys(matched).includes(String(i))}
              className={cn(
                'w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150',
                Object.keys(matched).includes(String(i))
                  ? 'bg-green-50 border-green-200 text-green-700 cursor-default'
                  : leftSel === i
                  ? 'bg-brand-50 border-brand-400 text-brand-700'
                  : wrong?.[0] === i
                  ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                  : 'bg-white border-gray-200 hover:border-brand-300 hover:bg-brand-50'
              )}>
              {pair.left}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {shuffledRight.map((rightIdx, shuffledIdx) => (
            <button key={shuffledIdx}
              onClick={() => handleRight(shuffledIdx)}
              disabled={checked || Object.values(matched).includes(rightIdx)}
              className={cn(
                'w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all duration-150',
                Object.values(matched).includes(rightIdx)
                  ? 'bg-green-50 border-green-200 text-green-700 cursor-default'
                  : wrong?.[1] === shuffledIdx
                  ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                  : 'bg-white border-gray-200 hover:border-brand-300 hover:bg-brand-50'
              )}>
              {content.pairs[rightIdx].right}
            </button>
          ))}
        </div>
      </div>

      {allMatched && !checked && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <Check size={16} /> Alle Paare gefunden!
          </div>
          <button onClick={finish} className="btn-primary text-sm">
            Weiter
          </button>
        </div>
      )}

      {checked && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm font-medium">
          <Check size={16} /> Perfekt! 10/10 Punkten
        </div>
      )}
    </div>
  )
}
