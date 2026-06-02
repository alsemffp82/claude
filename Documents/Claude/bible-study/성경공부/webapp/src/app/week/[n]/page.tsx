import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWeek, TOTAL_WEEKS } from '@/lib/content/weeks'
import { getWeekLover } from '@/lib/content/weeks-lover'
import BottomNav from '@/components/BottomNav'
import StudyClient from './StudyClient'

const VALID_TRACKS = ['lover', 'engaged', 'married'] as const
type Track = typeof VALID_TRACKS[number]

function getContent(track: Track, weekNo: number) {
  if (track === 'lover') return getWeekLover(weekNo)
  // engaged & married fall back to the existing weeks until those tracks are written
  return getWeek(weekNo)
}

export default async function WeekPage({
  params,
  searchParams,
}: {
  params: Promise<{ n: string }>
  searchParams: Promise<{ track?: string }>
}) {
  const { n } = await params
  const { track: trackParam } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const uid = user!.id

  const { data: sub } = await supabase
    .from('subscribers').select('start_date, track, is_admin').eq('id', uid).single()

  const isAdmin = sub?.is_admin ?? false
  // Admin can override track via ?track= param; everyone else uses their own track
  const resolvedTrack: Track = (isAdmin && VALID_TRACKS.includes(trackParam as Track))
    ? (trackParam as Track)
    : ((sub?.track ?? 'lover') as Track)

  let weekNo: number
  if (n === 'current') {
    if (sub?.start_date) {
      const days = Math.floor((Date.now() - new Date(sub.start_date).getTime()) / 86400000)
      weekNo = Math.min(Math.max(Math.floor(days / 7) + 1, 1), TOTAL_WEEKS)
    } else {
      weekNo = 1
    }
    redirect(`/week/${weekNo}`)
  }

  weekNo = parseInt(n)
  if (isNaN(weekNo) || weekNo < 1 || weekNo > TOTAL_WEEKS) notFound()

  const content = getContent(resolvedTrack, weekNo)
  if (!content) notFound()

  const { data: myProgress } = await supabase
    .from('progress').select('week_no')
    .eq('subscriber_id', uid).eq('week_no', weekNo).maybeSingle()

  const { data: couple } = await supabase
    .from('couples').select('partner_a, partner_b')
    .or(`partner_a.eq.${uid},partner_b.eq.${uid}`)
    .maybeSingle()

  let partnerDone = false
  if (couple) {
    const partnerId = couple.partner_a === uid ? couple.partner_b : couple.partner_a
    if (partnerId) {
      const { data: pp } = await supabase
        .from('progress').select('week_no')
        .eq('subscriber_id', partnerId).eq('week_no', weekNo).maybeSingle()
      partnerDone = !!pp
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 md:pb-0 md:pl-60">
      <StudyClient
        content={content!}
        initialDone={!!myProgress}
        partnerDone={partnerDone}
        totalWeeks={TOTAL_WEEKS}
        isAdmin={isAdmin}
        currentTrack={resolvedTrack}
        weekNo={weekNo}
      />
      <BottomNav />
    </div>
  )
}
