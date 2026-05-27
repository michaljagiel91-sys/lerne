import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LessonBlockEditor from '@/components/editor/LessonBlockEditor'
import PublishToggle from '@/components/ui/PublishToggle'

export default async function LessonEditPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, blocks(*)')
    .eq('id', lessonId)
    .eq('teacher_id', user!.id)
    .single()

  if (!lesson) notFound()

  const blocks = (lesson.blocks ?? []).sort((a: {order_index:number}, b: {order_index:number}) => a.order_index - b.order_index)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teacher/lessons" className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="page-title truncate">{lesson.title}</h1>
          {lesson.description && <p className="text-sm text-gray-500 mt-0.5">{lesson.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <PublishToggle lessonId={lesson.id} isPublished={lesson.is_published} />
        </div>
      </div>
      <LessonBlockEditor lessonId={lessonId} initialBlocks={blocks} />
    </div>
  )
}
