import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const inviteToken = searchParams.get('invite_token')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          )
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !session) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const user = session.user
  const meta = user.user_metadata ?? {}

  // subscriber 레코드 생성 (없으면) — user_metadata에서 구독 정보 읽기
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: existing } = await admin
    .from('subscribers')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!existing) {
    const startDate = meta.start_date ?? new Date().toISOString().split('T')[0]

    await admin.from('subscribers').insert({
      id: user.id,
      email: user.email,
      name: meta.name ?? '',
      language: 'KO',
      start_date: startDate,
      send_day: meta.send_day ?? 'monday',
      track: meta.track ?? 'lover',
      status: 'active',
    })

    // couples solo 레코드 생성
    await admin.from('couples').insert({
      partner_a: user.id,
      status: 'solo',
    })
  }

  // 초대 토큰이 있으면 커플 연결 처리
  if (inviteToken) {
    return NextResponse.redirect(`${origin}/invite/${inviteToken}`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
