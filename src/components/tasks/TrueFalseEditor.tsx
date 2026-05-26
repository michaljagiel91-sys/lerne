'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { TrueFalseContent } from '@/types'
import MediaUpload from './MediaUpload'

interface Props { content: unknown; onChange: (c: unknown) => void }

export default function TrueFalseEditor({ content, onChange }: Props) {
  const init = content as TrueFalseContent | null
  const [statements, setStatements] = useState(
    init?.statements ?? [{ text: '', is_true: true, explanation: '' }]
  )
  const [audioUrl, setAudioUrl] = useState(init?.audio_url ?? '')
  const [imageUrl, setImageUrl] = useState(init?.image_url ?? '')

  useEffect(() => {
    onChange({ statements, audio_url: audioUrl || undefined, image_url: imageUrl || undefined } as TrueFalseContent)
  }, [statements, audioUrl, imageUrl])

  const update = (i: number, field: string, val: unknown) =>
    setStatements(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  return (
    <div className="space-y-4">
      {statements.map((s, i) => (
        <div key={i} className="p-4 border border-gray-100 rounded-xl space-y-3 bg-gray-50/50">
          <div className="flex items-start gap-3">
            <div className="w-6 text-center text-xs text-gray-400 mt-2.5">{i + 1}</div>
            <div className="flex-1 space-y-2">
              <input type="text" value={s.text} onChange={e => update(i, 'text', e.target.value)}
                className="input" placeholder="Aussage eingeben..." />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name={`tf-${i}`} checked={s.is_true} onChange={() => update(i, 'is_true', true)} className="accent-green-500" />
                  <span className="text-sm font-medium text-green-700">Wahr</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name={`tf-${i}`} checked={!s.is_true} onChange={() => update(i, 'is_true', false)} className="accent-red-500" />
                  <span className="text-sm font-medium text-red-700">Falsch</span>
                </label>
              </div>
              <input type="text" value={s.explanation ?? ''} onChange={e => update(i, 'explanation', e.target.value)}
                className="input text-sm" placeholder="Erklärung (optional)..." />
            </div>
            {statements.length > 1 && (
              <button type="button" onClick={() => setStatements(prev => prev.filter((_, idx) => idx !== i))}
                className="text-gray-300 hover:text-red-500 p-1 mt-1">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}

      <button type="button" onClick={() => setStatements(prev => [...prev, { text: '', is_true: true, explanation: '' }])}
        className="btn-secondary text-sm">
        <Plus size={15} /> Aussage hinzufügen
      </button>

      <MediaUpload audioUrl={audioUrl} imageUrl={imageUrl} onAudioChange={setAudioUrl} onImageChange={setImageUrl} />
    </div>
  )
}
