'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, Users, Send, LogOut, GraduationCap, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { cn } from '@/lib/utils'

const links = [
  { href: '/teacher/lessons', label: 'Lektionen', icon: BookOpen },
  { href: '/teacher/students', label: 'Lernende', icon: Users },
  { href: '/teacher/assign', label: 'Aufgaben zuweisen', icon: Send },
]

export default function TeacherSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-brand-700 tracking-tight">Lerne!</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-1">
          Lehreransicht
        </p>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'sidebar-link',
              pathname.startsWith(href) && 'active'
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Profile */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-semibold">
            {profile.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile.full_name}</p>
            <p className="text-xs text-gray-500">Lehrer/in</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-gray-500">
          <LogOut size={16} />
          Abmelden
        </button>
      </div>
    </aside>
  )
}
