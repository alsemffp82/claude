import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { token, email, name } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 토큰으로 couple 조회
  const { data: couple } = await supabase
    .from('couples')
    .select('id, partner_a, status')
    .eq('invite_token', token)
    .maybeSingle()

  if (!couple) return NextResponse.json({ error: '유효하지 않은 초대 링크예요.' }, { status: 404 })
  if (couple.status === 'paired') return NextResponse.json({ error: '이미 사용된 초대 링크예요.' }, { status: 400 })

  // 매직링크 발송 (초대 토큰을 callback에 포함)
  const redirectTo = new URL('/auth/callback', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  redirectTo.searchParams.set('invite_token', token)

  const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: redirectTo.toString() },
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  const userId = authData.user.id

  // subscriber upsert
  await supabase.from('subscribers').upsert({
    id: userId, email, name, language: 'KO',
    start_date: new Date().toISOString().split('T')[0],
    send_day: 'monday', status: 'active',
  }, { onConflict: 'id' })

  // couple 업데이트 — partner_b 연결
  await supabase.from('couples')
    .update({ partner_b: userId, status: 'paired' })
    .eq('id', couple.id)

  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json({ ok: true, dev_magic_link: authData.properties?.action_link })
  }

  return NextResponse.json({ ok: true })
}
