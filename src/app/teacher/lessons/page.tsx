import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, BookOpen, Edit } from 'lucide-react'
import DeleteLessonButton from '@/components/ui/DeleteLessonButton'

export default async function TeacherLessonsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*, blocks(count), assignments(count)')
    .eq('teacher_id', user!.id)
    .order('created_at', { ascending: false })

  const levelColors: Record<string, string> = {
    A1:'badge-green',A2:'badge-green',B1:'badge-blue',B2:'badge-blue',C1:'badge-purple',C2:'badge-purple',
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Meine Lektionen</h1>
          <p className="text-sm text-gray-500 mt-1">{lessons?.length ?? 0} Lektionen erstellt</p>
        </div>
        <Link href="/teacher/lessons/new" className="btn-primary">
          <Plus size={16} /> Neue Lektion
        </Link>
      </div>

      {!lessons?.length ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Noch keine Lektionen</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Erstellen Sie Ihre erste Lektion mit Texten, Bildern, Audio und interaktiven Übungen.</p>
          <Link href="/teacher/lessons/new" className="btn-primary"><Plus size={16} /> Erste Lektion erstellen</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {lessons.map((lesson: {id:string;title:string;description?:string;level?:string;topic?:string;is_published:boolean;blocks:{count:number}[];assignments:{count:number}[]}) => (
            <div key={lesson.id} className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen size={20} className="text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-gray-900 truncate">{lesson.title}</h3>
                  {lesson.level && <span className={levelColors[lesson.level] ?? 'badge-blue'}>{lesson.level}</span>}
                  <span className={lesson.is_published ? 'badge-green' : 'badge-amber'}>
                    {lesson.is_published ? 'Veröffentlicht' : 'Entwurf'}
                  </span>
                </div>
                {lesson.description && <p className="text-sm text-gray-500 truncate">{lesson.description}</p>}
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span>{lesson.blocks?.[0]?.count ?? 0} Blöcke</span>
                  <span>{lesson.assignments?.[0]?.count ?? 0} Zuweisungen</span>
                  {lesson.topic && <span>{lesson.topic}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link href={`/teacher/lessons/${lesson.id}/edit`} className="btn-secondary text-sm gap-1.5">
                  <Edit size={14} /> Bearbeiten
                </Link>
                <DeleteLessonButton lessonId={lesson.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
