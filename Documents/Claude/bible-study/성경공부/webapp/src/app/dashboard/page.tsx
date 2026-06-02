import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import DashboardClient from './DashboardClient'
import { getWeek, TOTAL_WEEKS } from '@/lib/content/weeks'
import { getWeekLover } from '@/lib/content/weeks-lover'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const uid = user!.id

  const { data: subscriber } = await supabase
    .from('subscribers').select('*').eq('id', uid).single()

  if (!subscriber) redirect('/subscribe')

  const { data: couple } = await supabase
    .from('couples')
    .select('*, partner_a_info:subscribers!couples_partner_a_fkey(id,name), partner_b_info:subscribers!couples_partner_b_fkey(id,name)')
    .or(`partner_a.eq.${uid},partner_b.eq.${uid}`)
    .maybeSingle()

  const { data: myProgress } = await supabase
    .from('progress').select('week_no, completed_at').eq('subscriber_id', uid)

  let partnerProgress: { week_no: number }[] = []
  let partnerName = ''
  if (couple) {
    const partnerId = couple.partner_a === uid ? couple.partner_b : couple.partner_a
    partnerName = couple.partner_a === uid
      ? (couple.partner_b_info as { name: string } | null)?.name ?? ''
      : (couple.partner_a_info as { name: string } | null)?.name ?? ''

    if (partnerId) {
      const { data: pp } = await supabase
        .from('progress').select('week_no').eq('subscriber_id', partnerId)
      partnerProgress = pp ?? []
    }
  }

  const days = subscriber.start_date
    ? Math.floor((Date.now() - new Date(subscriber.start_date).getTime()) / 86400000)
    : 0
  const currentWeek = Math.min(Math.max(Math.floor(days / 7) + 1, 1), TOTAL_WEEKS)
  const track = subscriber.track ?? 'lover'
  const currentContent = (track === 'lover' ? getWeekLover(currentWeek) : getWeek(currentWeek)) ?? null

  // 오늘의 묵상 구절: 이번 주 안에서 몇 번째 날인지 (0-6)
  const dayInWeek = days % 7
  const todayVerse = currentContent?.daily_verses?.[dayInWeek] ?? null

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 md:pb-0 md:pl-60">
      <DashboardClient
        myName={subscriber.name}
        partnerName={partnerName}
        isPaired={couple?.status === 'paired'}
        completedWeeks={(myProgress ?? []).map(p => p.week_no)}
        partnerCompletedWeeks={partnerProgress.map(p => p.week_no)}
        currentWeek={currentWeek}
        currentContent={currentContent}
        totalWeeks={TOTAL_WEEKS}
        daysTogetherCount={days}
        connectPath="/connect"
        todayVerse={todayVerse}
      />
      <BottomNav />
    </div>
  )
}
