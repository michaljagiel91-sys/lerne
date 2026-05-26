import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TaskPlayer from '@/components/tasks/TaskPlayer'

export default async function StudentLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: assignment } = await supabase
    .from('assignments')
    .select('*, lesson:lessons(*, tasks(*))')
    .eq('student_id', user!.id)
    .eq('lesson_id', lessonId)
    .single()

  if (!assignment) notFound()

  const tasks = (assignment.lesson?.tasks ?? []).sort((a: {order_index:number}, b: {order_index:number}) => a.order_index - b.order_index)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/student/lessons" className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="page-title">{assignment.lesson?.title}</h1>
          {assignment.lesson?.description && (
            <p className="text-sm text-gray-500 mt-0.5">{assignment.lesson.description}</p>
          )}
        </div>
      </div>

      <TaskPlayer
        tasks={tasks}
        assignmentId={assignment.id}
        isCompleted={assignment.is_completed}
      />
    </div>
  )
}
