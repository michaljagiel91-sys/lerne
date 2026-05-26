'use client'
import { useState, useEffect } from 'react'
import { Task, MemoryContent } from '@/types'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { task: Task; onResult: (correct: boolean, score: number) => void }

interface Card { id: number; text: string; pairId: number; type: 'word' | 'translation' }

export default function MemoryGame({ task, onResult }: Props) {
  const content = task.content as MemoryContent

  const [cards] = useState<Card[]>(() => {
    const all: Card[] = []
    content.pairs.forEach((p, i) => {
      all.push({ id: i * 2,     text: p.word,        pairId: i, type: 'word' })
      all.push({ id: i * 2 + 1, text: p.translation, pairId: i, type: 'translation' })
    })
    return all.sort(() => Math.random() - 0.5)
  })

  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [disabled, setDisabled] = useState(false)
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)

  const handleFlip = (cardId: number) => {
    if (disabled || flipped.includes(cardId) || matched.includes(cardId)) return
    const newFlipped = [...flipped, cardId]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setDisabled(true)
      setMoves(m => m + 1)
      const [a, b] = newFlipped.map(id => cards.find(c => c.id === id)!)
      if (a.pairId === b.pairId) {
        setMatched(prev => [...prev, a.id, b.id])
        setFlipped([])
        setDisabled(false)
      } else {
        setTimeout(() => { setFlipped([]); setDisabled(false) }, 900)
      }
    }
  }

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setDone(true)
      const score = Math.max(10 - Math.floor(moves / content.pairs.length), 5)
      onResult(true, score)
    }
  }, [matched])

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{matched.length / 2} / {content.pairs.length} Paare gefunden</span>
        <span>{moves} Züge</span>
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(Math.ceil(Math.sqrt(cards.length * 2)), 6)}, 1fr)` }}>
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id)
          const isMatched = matched.includes(card.id)
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className={cn(
                'aspect-square flex items-center justify-center rounded-xl border text-sm font-medium transition-all duration-300 p-2 text-center',
                isFlipped
                  ? isMatched
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-brand-50 border-brand-300 text-brand-700'
                  : 'bg-gray-100 border-gray-200 text-gray-100 hover:bg-gray-200 cursor-pointer'
              )}>
              {isFlipped ? card.text : '?'}
            </button>
          )
        })}
      </div>

      {done && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium">
          <Trophy size={16} /> Glückwunsch! Alle Paare in {moves} Zügen gefunden!
        </div>
      )}
    </div>
  )
}
