'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Loader2, X } from 'lucide-react'

interface Props { type: 'image' | 'audio' | 'video'; content: unknown; onChange: (c: unknown) => void }

export default function MediaBlockEditor({ type, content, onChange }: Props) {
  const c = content as Record<string, string> | null
  const [url, setUrl] = useState(c?.url ?? '')
  const [caption, setCaption] = useState(c?.caption ?? '')
  const [title, setTitle] = useState(c?.title ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (type === 'image') onChange({ url, caption })
    else if (type === 'audio') onChange({ url, title })
    else onChange({ url })
  }, [url, caption, title])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${type}s/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      setUrl(data.publicUrl)
    } catch {
      setError('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div>
        <label className="label">URL eingeben oder Datei hochladen</label>
        <input type="url" value={url} onChange={e => setUrl(e.target.value)}
          className="input" placeholder={type === 'image' ? 'https://...' : type === 'audio' ? 'https://.../audio.mp3' : 'https://youtube.com/...'} />
      </div>

      {type !== 'video' && (
        <div>
          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 cursor-pointer transition-colors w-fit">
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploading ? 'Hochladen...' : type === 'image' ? 'Bild hochladen' : 'Audio hochladen (MP3)'}
            <input type="file" accept={type === 'image' ? 'image/*' : 'audio/*'} onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      )}

      {url && type === 'image' && (
        <div className="relative w-fit">
          <img src={url} alt="" className="max-h-40 rounded-xl border border-gray-200 object-cover" />
          <button type="button" onClick={() => setUrl('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
            <X size={12} />
          </button>
        </div>
      )}
      {url && type === 'audio' && <audio controls src={url} className="w-full h-10" />}

      {type === 'image' && (
        <div>
          <label className="label">Bildunterschrift (optional)</label>
          <input type="text" value={caption} onChange={e => setCaption(e.target.value)} className="input" placeholder="Bildunterschrift..." />
        </div>
      )}
      {type === 'audio' && (
        <div>
          <label className="label">Titel (optional)</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="z.B. Hörtext: Rauchen bei Jugendlichen" />
        </div>
      )}
    </div>
  )
}
