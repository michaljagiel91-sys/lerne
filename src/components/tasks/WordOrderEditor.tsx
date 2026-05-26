'use client'
import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { WordOrderContent } from '@/types'
import MediaUpload from './MediaUpload'

interface Props { content: unknown; onChange: (c: unknown) => void }

export default function WordOrderEditor({ content, onChange }: Props) {
  const init = content as WordOrderContent | null
  const [sentence, setSentence] = useState(init?.sentence ?? '')
  const [audioUrl, setAudioUrl] = useState(init?.audio_url ?? '')

  const words = sentence.trim() ? sentence.trim().split(/\s+/) : []
  const shuffled = [...words].sort(() => Math.random() - 0.5)

  useEffect(() => {
    if (!sentence.trim()) return
    onChange({ sentence: sentence.trim(), words: shuffled, audio_url: audioUrl || undefined } as WordOrderContent)
  }, [sentence, audioUrl])

  return (
    <div className="space-y-5">
      <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700 flex gap-2">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <span>Geben Sie den korrekten Satz ein. Die Wörter werden automatisch gemischt und den Lernenden präsentiert.</span>
      </div>

      <div>
        <label className="label">Korrekter Satz *</label>
        <input type="text" value={sentence} onChange={e => setSentence(e.target.value)}
          className="input" placeholder="z.B. Ich lerne jeden Tag Deutsch." />
      </div>

      {words.length > 0 && (
        <div>
          <label className="label">Vorschau (gemischt)</label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl">
            {shuffled.map((w, i) => (
              <span key={i} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium shadow-soft">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      <MediaUpload audioUrl={audioUrl} onAudioChange={setAudioUrl} />
    </div>
  )
}
