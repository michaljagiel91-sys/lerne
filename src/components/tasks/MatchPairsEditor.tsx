'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { MatchPairsContent } from '@/types'
import MediaUpload from './MediaUpload'

interface Props { content: unknown; onChange: (c: unknown) => void }

export default function MatchPairsEditor({ content, onChange }: Props) {
  const init = content as MatchPairsContent | null
  const [pairs, setPairs] = useState(init?.pairs ?? [{ left: '', right: '' }])
  const [audioUrl, setAudioUrl] = useState(init?.audio_url ?? '')

  useEffect(() => {
    onChange({ pairs, audio_url: audioUrl || undefined } as MatchPairsContent)
  }, [pairs, audioUrl])

  const updatePair = (i: number, field: 'left' | 'right', val: string) => {
    setPairs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p))
  }

  const addPair = () => setPairs(prev => [...prev, { left: '', right: '' }])
  const removePair = (i: number) => setPairs(prev => prev.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-500 px-1">
        <span>Linke Spalte (z.B. Deutsch)</span>
        <span>Rechte Spalte (z.B. Übersetzung)</span>
      </div>

      {pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-6 text-center text-xs text-gray-400">{i + 1}</div>
          <input type="text" value={pair.left} onChange={e => updatePair(i, 'left', e.target.value)}
            className="input flex-1" placeholder="Begriff..." />
          <div className="text-gray-300">↔</div>
          <input type="text" value={pair.right} onChange={e => updatePair(i, 'right', e.target.value)}
            className="input flex-1" placeholder="Zuordnung..." />
          {pairs.length > 1 && (
            <button type="button" onClick={() => removePair(i)} className="text-gray-300 hover:text-red-500 p-1">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={addPair} className="btn-secondary text-sm">
        <Plus size={15} /> Paar hinzufügen
      </button>

      <MediaUpload audioUrl={audioUrl} onAudioChange={setAudioUrl} />
    </div>
  )
}
