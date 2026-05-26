'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Globe, Lock } from 'lucide-react'

export default function PublishToggle({ lessonId, isPublished }: { lessonId: string; isPublished: boolean }) {
  const [published, setPublished] = useState(isPublished)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('lessons').update({ is_published: !published }).eq('id', lessonId)
    setPublished(!published)
    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`btn text-sm gap-1.5 ${published ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' : 'btn-secondary'}`}>
      {published ? <><Globe size={14} /> Veröffentlicht</> : <><Lock size={14} /> Entwurf</>}
    </button>
  )
}
