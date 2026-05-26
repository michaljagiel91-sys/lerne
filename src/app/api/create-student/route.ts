import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Verify requester is a teacher
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, full_name } = await req.json()
  if (!email || !full_name) return NextResponse.json({ error: 'E-Mail und Name erforderlich.' }, { status: 400 })

  // Use service role to create user
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const tempPassword = Math.random().toString(36).slice(2, 10) + 'Aa1!'

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name, role: 'student' },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Update profile
  await adminSupabase.from('profiles').upsert({
    id: data.user.id,
    email,
    full_name,
    role: 'student',
  })

  // Send password via email (Supabase handles this via invite)
  await adminSupabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role: 'student' },
  })

  return NextResponse.json({ success: true })
}
