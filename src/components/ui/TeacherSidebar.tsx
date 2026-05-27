'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, Users, Send, LogOut, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { cn } from '@/lib/utils'

const links = [
  { href: '/teacher/lessons',  label: 'Lektionen',         icon: BookOpen },
  { href: '/teacher/students', label: 'Lernende',           icon: Users },
  { href: '/teacher/assign',   label: 'Aufgaben zuweisen',  icon: Send },
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
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen"
      style={{ background: '#fffdf8', borderRight: '1px solid #e5ddcf' }}>
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #e5ddcf' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: '#24644d' }}>
            <GraduationCap size={20} />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight" style={{ color: '#1f2724' }}>Lerne!</span>
            <p className="text-xs" style={{ color: '#667069' }}>Deutschlernplattform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 text-xs font-bold uppercase tracking-wider mb-2 mt-1" style={{ color: '#a09880' }}>
          Lehreransicht
        </p>
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn('sidebar-link', pathname.startsWith(href) && 'active')}>
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: '1px solid #e5ddcf' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: '#24644d' }}>
            {profile?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: '#1f2724' }}>{profile?.full_name}</p>
            <p className="text-xs" style={{ color: '#667069' }}>Lehrer/in</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full" style={{ color: '#667069' }}>
          <LogOut size={16} /> Abmelden
        </button>
      </div>
    </aside>
  )
}
