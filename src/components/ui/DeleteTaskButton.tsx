'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', taskId)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={handleDelete} className="text-xs btn bg-red-600 text-white hover:bg-red-700 px-2 py-1.5">Ja</button>
        <button onClick={() => setConfirming(false)} className="text-xs btn-ghost px-2 py-1.5">Nein</button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} className="btn-ghost p-2 text-gray-400 hover:text-red-500">
      <Trash2 size={15} />
    </button>
  )
}
