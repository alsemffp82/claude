import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InviteClient from './InviteClient'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // 토큰으로 couple 조회
  const { data: couple } = await supabase
    .from('couples')
    .select('*, partner_a_info:subscribers!couples_partner_a_fkey(name)')
    .eq('invite_token', token)
    .maybeSingle()

  if (!couple) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-sm">
          <div className="text-4xl mb-3">😢</div>
          <h2 className="text-lg font-bold text-[#2C1F0F] mb-2">초대 링크가 유효하지 않아요</h2>
          <p className="text-sm text-[#7A6555]">링크가 만료됐거나 이미 사용됐어요.</p>
        </div>
      </div>
    )
  }

  if (couple.status === 'paired') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-sm">
          <div className="text-4xl mb-3">💑</div>
          <h2 className="text-lg font-bold text-[#2C1F0F] mb-2">이미 연결된 커플이에요</h2>
          <p className="text-sm text-[#7A6555]">이 초대 링크는 이미 사용됐어요.</p>
        </div>
      </div>
    )
  }

  // 현재 로그인 상태 확인
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <InviteClient
      token={token}
      inviterName={(couple.partner_a_info as { name: string } | null)?.name ?? ''}
      currentUserEmail={user?.email}
      coupleId={couple.id}
    />
  )
}
