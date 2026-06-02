import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { name, email, send_day, start_offset } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: '이름과 이메일을 입력해주세요.' }, { status: 400 })
  }

  // Service role client (server only)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 시작일 계산
  const start_date = new Date()
  start_date.setDate(start_date.getDate() + parseInt(start_offset || '0'))

  // 1. Supabase Auth: 매직링크 발송
  const redirectTo = new URL('/auth/callback', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  redirectTo.searchParams.set('next', '/connect')

  const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: redirectTo.toString() },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  const userId = authData.user.id

  // 2. subscribers 테이블 upsert
  const { error: subError } = await supabase
    .from('subscribers')
    .upsert({
      id: userId,
      email,
      name,
      language: 'KO',
      start_date: start_date.toISOString().split('T')[0],
      send_day,
      status: 'active',
    }, { onConflict: 'id' })

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 })
  }

  // 3. couples 테이블에 solo 레코드 생성 (아직 파트너 없음)
  const { error: coupleError } = await supabase
    .from('couples')
    .insert({ partner_a: userId, status: 'solo' })

  // couples 충돌은 무시 (이미 있으면 ok)
  if (coupleError && !coupleError.message.includes('duplicate')) {
    console.error('couple insert error:', coupleError)
  }

  // 4. 매직링크 이메일 발송
  if (authData.properties?.action_link) {
    // Supabase가 자동으로 이메일 발송함 (대시보드에서 설정 필요)
    // 개발 환경에서는 action_link를 응답에 포함
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        ok: true,
        dev_magic_link: authData.properties.action_link,
      })
    }
  }

  return NextResponse.json({ ok: true })
}
