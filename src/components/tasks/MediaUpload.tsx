'use client'
import { useState, useCallback } from 'react'
import { Upload, Music, Image, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  audioUrl?: string
  imageUrl?: string
  onAudioChange?: (url: string) => void
  onImageChange?: (url: string) => void
}

export default function MediaUpload({ audioUrl, imageUrl, onAudioChange, onImageChange }: Props) {
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const uploadFile = async (file: File, type: 'audio' | 'image') => {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${type}s/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage.from('media').upload(path, file)
    if (error) throw error

    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return data.publicUrl
  }

  const handleAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAudio(true)
    try {
      const url = await uploadFile(file, 'audio')
      onAudioChange?.(url)
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingAudio(false)
    }
  }

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const url = await uploadFile(file, 'image')
      onImageChange?.(url)
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingImage(false)
    }
  }

  if (!onAudioChange && !onImageChange) return null

  return (
    <div className="border-t border-gray-100 pt-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Medien</p>
      <div className="flex flex-wrap gap-3">
        {onAudioChange && (
          <div>
            {audioUrl ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                <Music size={14} className="text-green-600" />
                <span className="text-xs text-green-700 font-medium">Audio hochgeladen</span>
                <button type="button" onClick={() => onAudioChange('')} className="text-green-500 hover:text-red-500">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-brand-300 hover:text-brand-600 cursor-pointer transition-colors">
                {uploadingAudio ? <Loader2 size={14} className="animate-spin" /> : <Music size={14} />}
                {uploadingAudio ? 'Hochladen...' : 'Audio hochladen (MP3)'}
                <input type="file" accept="audio/mp3,audio/mpeg,audio/*" onChange={handleAudio} className="hidden" />
              </label>
            )}
          </div>
        )}

        {onImageChange && (
          <div>
            {imageUrl ? (
              <div className="flex items-center gap-2">
                <img src={imageUrl} alt="" className="h-16 w-auto rounded-lg object-cover border border-gray-200" />
                <button type="button" onClick={() => onImageChange('')} className="text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-brand-300 hover:text-brand-600 cursor-pointer transition-colors">
                {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />}
                {uploadingImage ? 'Hochladen...' : 'Bild hochladen'}
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
