'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Info } from 'lucide-react'
import { FillBlankContent } from '@/types'
import MediaUpload from './MediaUpload'

interface Props {
  content: unknown
  onChange: (c: unknown) => void
}

export default function FillBlankEditor({ content, onChange }: Props) {
  const init = content as FillBlankContent | null
  const [text, setText] = useState(init?.text ?? '')
  const [audioUrl, setAudioUrl] = useState(init?.audio_url ?? '')
  const [imageUrl, setImageUrl] = useState(init?.image_url ?? '')

  // Parse blanks from {{...}} markers
  const extractBlanks = (t: string) => {
    const matches = [...t.matchAll(/\{\{([^}]+)\}\}/g)]
    return matches.map(m => ({ answer: m[1], alternatives: [] as string[] }))
  }

  useEffect(() => {
    const blanks = extractBlanks(text)
    onChange({ text, blanks, audio_url: audioUrl || undefined, image_url: imageUrl || undefined } as FillBlankContent)
  }, [text, audioUrl, imageUrl])

  const insertBlank = () => {
    setText(prev => prev + ' {{Antwort}}')
  }

  return (
    <div className="space-y-5">
      <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700 flex gap-2">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <span>Schreiben Sie den Text und markieren Sie Lücken mit <code className="bg-blue-100 px-1 rounded">{'{{Antwort}}'}</code>, z.B.: "Der Mann <code className="bg-blue-100 px-1 rounded">{'{{kauft}}'}</code> ein Brot."</span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label mb-0">Text mit Lücken *</label>
          <button type="button" onClick={insertBlank} className="btn-ghost text-xs px-2 py-1">
            <Plus size={12} /> Lücke einfügen
          </button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="input h-40 resize-none font-mono text-sm"
          placeholder="Schreiben Sie den Text hier. Verwenden Sie {{Antwort}} für Lücken."
        />
      </div>

      {/* Preview */}
      {text && (
        <div>
          <label className="label">Vorschau</label>
          <div className="p-4 bg-gray-50 rounded-xl text-sm leading-relaxed">
            {text.split(/(\{\{[^}]+\}\})/g).map((part, i) => {
              const match = part.match(/\{\{([^}]+)\}\}/)
              if (match) {
                return (
                  <span key={i} className="inline-block mx-0.5 px-3 py-0.5 bg-white border-2 border-dashed border-brand-300 rounded text-brand-600 text-xs font-medium">
                    [{match[1]}]
                  </span>
                )
              }
              return <span key={i}>{part}</span>
            })}
          </div>
        </div>
      )}

      <MediaUpload
        audioUrl={audioUrl} imageUrl={imageUrl}
        onAudioChange={setAudioUrl} onImageChange={setImageUrl}
      />
    </div>
  )
}
