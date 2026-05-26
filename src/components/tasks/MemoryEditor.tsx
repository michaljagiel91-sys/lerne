'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { MemoryContent } from '@/types'

interface Props { content: unknown; onChange: (c: unknown) => void }

export default function MemoryEditor({ content, onChange }: Props) {
  const init = content as MemoryContent | null
  const [pairs, setPairs] = useState(init?.pairs ?? [
    { word: '', translation: '' },
    { word: '', translation: '' },
    { word: '', translation: '' },
    { word: '', translation: '' },
  ])

  useEffect(() => {
    onChange({ pairs } as MemoryContent)
  }, [pairs])

  const update = (i: number, field: 'word' | 'translation', val: string) =>
    setPairs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p))

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Erstellen Sie Wortpaare für das Memory-Spiel. Empfehlung: 6–16 Paare.
      </p>

      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-500 px-1">
        <span>Wort (Deutsch)</span>
        <span>Übersetzung / Bild</span>
      </div>

      {pairs.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-5 text-center text-xs text-gray-400">{i + 1}</div>
          <input type="text" value={p.word} onChange={e => update(i, 'word', e.target.value)}
            className="input flex-1 text-sm" placeholder="das Haus" />
          <input type="text" value={p.translation} onChange={e => update(i, 'translation', e.target.value)}
            className="input flex-1 text-sm" placeholder="dom / house" />
          {pairs.length > 2 && (
            <button type="button" onClick={() => setPairs(prev => prev.filter((_, idx) => idx !== i))}
              className="text-gray-300 hover:text-red-500 p-1">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={() => setPairs(prev => [...prev, { word: '', translation: '' }])}
        className="btn-secondary text-sm">
        <Plus size={15} /> Paar hinzufügen
      </button>
    </div>
  )
}
