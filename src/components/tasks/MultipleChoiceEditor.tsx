'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { MultipleChoiceContent } from '@/types'
import MediaUpload from './MediaUpload'

interface Props { content: unknown; onChange: (c: unknown) => void }

export default function MultipleChoiceEditor({ content, onChange }: Props) {
  const init = content as MultipleChoiceContent | null
  const [question, setQuestion] = useState(init?.question ?? '')
  const [options, setOptions] = useState(init?.options ?? [
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ])
  const [audioUrl, setAudioUrl] = useState(init?.audio_url ?? '')
  const [imageUrl, setImageUrl] = useState(init?.image_url ?? '')

  useEffect(() => {
    onChange({ question, options, audio_url: audioUrl || undefined, image_url: imageUrl || undefined } as MultipleChoiceContent)
  }, [question, options, audioUrl, imageUrl])

  const updateOption = (i: number, field: string, val: unknown) =>
    setOptions(prev => prev.map((o, idx) => idx === i ? { ...o, [field]: val } : o))

  const setCorrect = (i: number) =>
    setOptions(prev => prev.map((o, idx) => ({ ...o, is_correct: idx === i })))

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Frage *</label>
        <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
          className="input" placeholder="Frage eingeben..." />
      </div>

      <div>
        <label className="label">Antwortmöglichkeiten</label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name="correct" checked={opt.is_correct} onChange={() => setCorrect(i)}
                className="accent-brand-600 cursor-pointer" title="Richtige Antwort" />
              <input type="text" value={opt.text} onChange={e => updateOption(i, 'text', e.target.value)}
                className={`input flex-1 text-sm ${opt.is_correct ? 'border-green-300 bg-green-50/50' : ''}`}
                placeholder={`Option ${i + 1}...`} />
              {options.length > 2 && (
                <button type="button" onClick={() => setOptions(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-gray-300 hover:text-red-500 p-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Radio-Button = richtige Antwort</p>
      </div>

      <button type="button" onClick={() => setOptions(prev => [...prev, { text: '', is_correct: false }])}
        className="btn-secondary text-sm">
        <Plus size={15} /> Option hinzufügen
      </button>

      <MediaUpload audioUrl={audioUrl} imageUrl={imageUrl} onAudioChange={setAudioUrl} onImageChange={setImageUrl} />
    </div>
  )
}
