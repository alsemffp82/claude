import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { week_no, answers, sections_read } = await req.json()
  if (!week_no) return NextResponse.json({ error: 'week_no required' }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (answers !== undefined) update.answers = answers
  if (sections_read !== undefined) update.sections_read = sections_read

  const { error } = await supabase
    .from('week_notes')
    .upsert({ subscriber_id: user.id, week_no, ...update }, { onConflict: 'subscriber_id,week_no' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
