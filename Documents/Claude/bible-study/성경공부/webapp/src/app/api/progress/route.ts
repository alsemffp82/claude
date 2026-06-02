import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { week_no } = await req.json()
  if (!week_no || week_no < 1 || week_no > 16) {
    return NextResponse.json({ error: '유효하지 않은 주차예요.' }, { status: 400 })
  }

  const { error } = await supabase.from('progress').upsert({
    subscriber_id: user.id,
    week_no,
    completed_at: new Date().toISOString(),
  }, { onConflict: 'subscriber_id,week_no' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { week_no } = await req.json()
  await supabase.from('progress')
    .delete()
    .eq('subscriber_id', user.id)
    .eq('week_no', week_no)

  return NextResponse.json({ ok: true })
}
