import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Clock, CheckCircle, Calendar } from 'lucide-react'
import { Assignment } from '@/types'

export default async function StudentLessonsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: assignments } = await supabase
    .from('assignments')
    .select('*, lesson:lessons(*, tasks(count))')
    .eq('student_id', user!.id)
    .order('assigned_at', { ascending: false })

  const pending = assignments?.filter(a => !a.is_completed) ?? []
  const completed = assignments?.filter(a => a.is_completed) ?? []

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Meine Aufgaben</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pending.length} ausstehend · {completed.length} abgeschlossen
          </p>
        </div>
      </div>

      {!assignments?.length ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Keine Aufgaben</h3>
          <p className="text-gray-500 text-sm">Ihr Lehrer hat Ihnen noch keine Aufgaben zugewiesen.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div>
              <h2 className="section-title">Ausstehende Aufgaben</h2>
              <div className="grid gap-4">
                {pending.map(a => <AssignmentCard key={a.id} assignment={a} />)}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="section-title">Abgeschlossen</h2>
              <div className="grid gap-3">
                {completed.map(a => <AssignmentCard key={a.id} assignment={a} completed />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AssignmentCard({ assignment: a, completed = false }: { assignment: Assignment & { lesson: { title: string; level?: string; description?: string; topic?: string; tasks: [{count: number}] } }; completed?: boolean }) {
  const taskCount = a.lesson?.tasks?.[0]?.count ?? 0
  const isOverdue = a.due_date && !a.is_completed && new Date(a.due_date) < new Date()

  return (
    <Link href={`/student/lessons/${a.lesson_id}`}
      className={`card p-5 flex items-center gap-4 hover:shadow-card transition-all duration-150 ${completed ? 'opacity-75' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${completed ? 'bg-green-50' : 'bg-brand-50'}`}>
        {completed
          ? <CheckCircle size={22} className="text-green-500" />
          : <BookOpen size={22} className="text-brand-600" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-semibold text-gray-900">{a.lesson?.title}</h3>
          {a.lesson?.level && <span className="badge-blue">{a.lesson.level}</span>}
          {isOverdue && <span className="badge-red">Überfällig</span>}
          {completed && a.score != null && (
            <span className="badge-green">{a.score} Punkte</span>
          )}
        </div>
        {a.lesson?.description && (
          <p className="text-sm text-gray-500 truncate">{a.lesson.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span>{taskCount} Aufgaben</span>
          {a.due_date && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
              <Calendar size={11} />
              Fällig: {new Date(a.due_date).toLocaleDateString('de-DE')}
            </span>
          )}
        </div>
      </div>

      <div className="text-gray-300 flex-shrink-0">→</div>
    </Link>
  )
}
