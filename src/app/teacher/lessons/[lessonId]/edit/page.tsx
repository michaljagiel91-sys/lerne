import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, GripVertical } from 'lucide-react'
import { Task } from '@/types'
import PublishToggle from '@/components/ui/PublishToggle'
import DeleteTaskButton from '@/components/ui/DeleteTaskButton'

const TASK_TYPE_LABELS: Record<string, string> = {
  fill_blank: 'Lückentext',
  match_pairs: 'Zuordnen',
  word_order: 'Wörter ordnen',
  true_false: 'Wahr oder falsch',
  multiple_choice: 'Multiple Choice',
  memory: 'Memory',
  crossword: 'Kreuzworträtsel',
  tictactoe: 'Tic-Tac-Toe',
  labyrinth: 'Labyrinth',
}

const TASK_TYPE_COLORS: Record<string, string> = {
  fill_blank: 'badge-blue',
  match_pairs: 'badge-purple',
  word_order: 'badge-amber',
  true_false: 'badge-green',
  multiple_choice: 'badge-blue',
  memory: 'badge-purple',
  crossword: 'badge-amber',
  tictactoe: 'badge-red',
  labyrinth: 'badge-green',
}

export default async function LessonEditPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, tasks(*)')
    .eq('id', lessonId)
    .eq('teacher_id', user!.id)
    .single()

  if (!lesson) notFound()

  const tasks = (lesson.tasks as Task[]).sort((a, b) => a.order_index - b.order_index)

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
          <Link href={`/teacher/lessons/${lessonId}/edit/meta`} className="btn-secondary">
            <Edit size={15} /> Bearbeiten
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Aufgaben', value: tasks.length },
          { label: 'Niveau', value: lesson.level ?? '–' },
          { label: 'Thema', value: lesson.topic ?? '–' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-2xl font-bold text-brand-600">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tasks */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">Aufgaben</h2>
        <Link href={`/teacher/lessons/${lessonId}/tasks/new`} className="btn-primary">
          <Plus size={15} />
          Aufgabe hinzufügen
        </Link>
      </div>

      {!tasks.length ? (
        <div className="card p-12 text-center border-dashed border-2 border-gray-200 bg-transparent shadow-none">
          <p className="text-gray-400 text-sm mb-4">Noch keine Aufgaben in dieser Lektion.</p>
          <Link href={`/teacher/lessons/${lessonId}/tasks/new`} className="btn-primary">
            <Plus size={15} /> Erste Aufgabe erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <div key={task.id} className="card p-4 flex items-center gap-3">
              <div className="text-gray-300 cursor-grab">
                <GripVertical size={18} />
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">{task.title}</span>
                  <span className={TASK_TYPE_COLORS[task.type] ?? 'badge-blue'}>
                    {TASK_TYPE_LABELS[task.type] ?? task.type}
                  </span>
                </div>
                {task.instructions && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{task.instructions}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/teacher/lessons/${lessonId}/tasks/${task.id}`} className="btn-ghost p-2">
                  <Edit size={15} />
                </Link>
                <DeleteTaskButton taskId={task.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
