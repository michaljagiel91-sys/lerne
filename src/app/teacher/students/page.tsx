import { createClient } from '@/lib/supabase/server'
import { Users, Mail, UserPlus, Calendar } from 'lucide-react'
import { Profile } from '@/types'
import InviteStudentModal from '@/components/ui/InviteStudentModal'

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('profiles')
    .select('*, assignments(count)')
    .eq('role', 'student')
    .order('full_name')

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lernende</h1>
          <p className="text-sm text-gray-500 mt-1">{students?.length ?? 0} Lernende registriert</p>
        </div>
        <InviteStudentModal />
      </div>

      {!students?.length ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Noch keine Lernenden</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Erstellen Sie Konten für Ihre Lernenden über die Einladungsfunktion.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">E-Mail</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aufgaben</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registriert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student: Profile & { assignments: [{count: number}] }) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-semibold">
                        {student.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{student.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{student.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="badge-blue">{student.assignments?.[0]?.count ?? 0}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {new Date(student.created_at).toLocaleDateString('de-DE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
