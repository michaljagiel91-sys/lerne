import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TeacherSidebar from '@/components/ui/TeacherSidebar'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'teacher') redirect('/student/lessons')

  return (
    <div className="flex h-screen bg-surface-secondary overflow-hidden">
      <TeacherSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
