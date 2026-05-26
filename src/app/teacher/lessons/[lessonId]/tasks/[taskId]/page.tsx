import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TaskEditorWrapper from '@/components/tasks/TaskEditorWrapper'

export default async function TaskEditPage({
  params,
}: {
  params: Promise<{ lessonId: string; taskId: string }>
}) {
  const { lessonId, taskId } = await params
  const supabase = await createClient()

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (!task) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/teacher/lessons/${lessonId}/edit`} className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="page-title">Aufgabe bearbeiten</h1>
      </div>
      <TaskEditorWrapper lessonId={lessonId} task={task} />
    </div>
  )
}
