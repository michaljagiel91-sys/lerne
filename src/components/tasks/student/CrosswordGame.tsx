'use client'
import { useState, useMemo } from 'react'
import { Task, CrosswordContent } from '@/types'
import { Check } from 'lucide-react'

interface Props { task: Task; onResult: (correct: boolean, score: number) => void }

export default function CrosswordGame({ task, onResult }: Props) {
  const content = task.content as CrosswordContent
  const { rows, cols } = content.grid_size

  // Build grid layout
  const grid = useMemo(() => {
    const g: { letter: string; wordIndices: number[]; number?: number }[][] =
      Array(rows).fill(null).map(() => Array(cols).fill(null).map(() => ({ letter: '', wordIndices: [] })))

    content.words.forEach((w, wi) => {
      for (let i = 0; i < w.word.length; i++) {
        const r = w.direction === 'down' ? w.row + i : w.row
        const c = w.direction === 'across' ? w.col + i : w.col
        if (r < rows && c < cols) {
          g[r][c].letter = w.word[i]
          g[r][c].wordIndices.push(wi)
        }
      }
    })

    // Number the cells
    content.words.forEach((w, wi) => {
      if (w.row < rows && w.col < cols) {
        g[w.row][w.col].number = wi + 1
      }
    })

    return g
  }, [content])

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const setCell = (r: number, c: number, val: string) => {
    if (checked) return
    setAnswers(prev => ({ ...prev, [`${r}-${c}`]: val.toUpperCase().slice(0, 1) }))
  }

  const check = () => {
    setChecked(true)
    let correct = 0
    content.words.forEach(w => {
      const wordCorrect = w.word.split('').every((letter, i) => {
        const r = w.direction === 'down' ? w.row + i : w.row
        const c = w.direction === 'across' ? w.col + i : w.col
        return answers[`${r}-${c}`] === letter
      })
      if (wordCorrect) correct++
    })
    const score = Math.round((correct / content.words.length) * 10)
    onResult(correct === content.words.length, score)
  }

  const getCellState = (r: number, c: number) => {
    if (!checked || !grid[r][c].letter) return null
    return answers[`${r}-${c}`] === grid[r][c].letter ? 'correct' : 'wrong'
  }

  return (
    <div className="card p-6 space-y-5">
      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="inline-grid gap-px bg-gray-300 border border-gray-300 rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${cols}, 32px)` }}>
          {Array(rows).fill(null).map((_, r) =>
            Array(cols).fill(null).map((_, c) => {
              const cell = grid[r][c]
              const state = getCellState(r, c)
              if (!cell.letter) {
                return <div key={`${r}-${c}`} className="w-8 h-8 bg-gray-800" />
              }
              return (
                <div key={`${r}-${c}`}
                  className={`w-8 h-8 relative ${
                    state === 'correct' ? 'bg-green-50' :
                    state === 'wrong' ? 'bg-red-50' : 'bg-white'
                  }`}>
                  {cell.number && (
                    <span className="absolute top-0 left-0.5 text-[9px] text-gray-500 leading-none">{cell.number}</span>
                  )}
                  <input
                    type="text"
                    maxLength={1}
                    value={answers[`${r}-${c}`] ?? ''}
                    onChange={e => setCell(r, c, e.target.value)}
                    disabled={checked}
                    className={`w-full h-full text-center text-sm font-bold uppercase bg-transparent outline-none pt-2 ${
                      state === 'correct' ? 'text-green-700' :
                      state === 'wrong' ? 'text-red-600' : 'text-gray-900'
                    }`}
                  />
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Clues */}
      <div className="grid md:grid-cols-2 gap-4">
        {(['across', 'down'] as const).map(dir => {
          const dirWords = content.words.filter(w => w.direction === dir)
          if (!dirWords.length) return null
          return (
            <div key={dir}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {dir === 'across' ? 'Waagerecht →' : 'Senkrecht ↓'}
              </p>
              <div className="space-y-1">
                {dirWords.map((w, i) => (
                  <p key={i} className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">{content.words.indexOf(w) + 1}.</span> {w.clue}
                  </p>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {!checked && (
        <button onClick={check} className="btn-primary">
          <Check size={15} /> Überprüfen
        </button>
      )}
    </div>
  )
}
