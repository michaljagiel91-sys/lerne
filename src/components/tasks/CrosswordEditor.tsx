'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Info } from 'lucide-react'
import { CrosswordContent } from '@/types'

interface Props { content: unknown; onChange: (c: unknown) => void }

interface WordEntry { word: string; clue: string; direction: 'across' | 'down'; row: number; col: number }

export default function CrosswordEditor({ content, onChange }: Props) {
  const init = content as CrosswordContent | null
  const [words, setWords] = useState<WordEntry[]>(init?.words ?? [
    { word: '', clue: '', direction: 'across', row: 0, col: 0 }
  ])

  const gridSize = {
    rows: Math.max(...words.map(w => w.direction === 'down' ? w.row + w.word.length : w.row + 1), 8),
    cols: Math.max(...words.map(w => w.direction === 'across' ? w.col + w.word.length : w.col + 1), 8),
  }

  useEffect(() => {
    onChange({ words, grid_size: gridSize } as CrosswordContent)
  }, [words])

  const update = (i: number, field: keyof WordEntry, val: unknown) =>
    setWords(prev => prev.map((w, idx) => idx === i ? { ...w, [field]: val } : w))

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700 flex gap-2">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <span>Geben Sie Wörter, Hinweise und Positionen im Raster ein. Zeile/Spalte beginnt bei 0.</span>
      </div>

      <div className="space-y-3">
        {words.map((w, i) => (
          <div key={i} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 w-4">{i + 1}</span>
              <input type="text" value={w.word} onChange={e => update(i, 'word', e.target.value.toUpperCase())}
                className="input flex-1 uppercase font-mono" placeholder="WORT" />
              <select value={w.direction} onChange={e => update(i, 'direction', e.target.value)}
                className="input w-32">
                <option value="across">Waagerecht →</option>
                <option value="down">Senkrecht ↓</option>
              </select>
              <div className="flex items-center gap-1">
                <input type="number" value={w.row} onChange={e => update(i, 'row', +e.target.value)}
                  className="input w-16 text-center" placeholder="Zeile" min={0} />
                <span className="text-gray-400 text-xs">,</span>
                <input type="number" value={w.col} onChange={e => update(i, 'col', +e.target.value)}
                  className="input w-16 text-center" placeholder="Sp." min={0} />
              </div>
              {words.length > 1 && (
                <button type="button" onClick={() => setWords(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-gray-300 hover:text-red-500 p-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <input type="text" value={w.clue} onChange={e => update(i, 'clue', e.target.value)}
              className="input text-sm ml-6" placeholder="Hinweis / Definition..." />
          </div>
        ))}
      </div>

      <button type="button"
        onClick={() => setWords(prev => [...prev, { word: '', clue: '', direction: 'across', row: 0, col: 0 }])}
        className="btn-secondary text-sm">
        <Plus size={15} /> Wort hinzufügen
      </button>
    </div>
  )
}
