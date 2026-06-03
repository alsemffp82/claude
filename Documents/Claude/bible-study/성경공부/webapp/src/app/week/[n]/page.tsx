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

  // ── 커플 정보 ──
  const { data: couple } = await supabase
    .from('couples').select('partner_a, partner_b, status')
    .or(`partner_a.eq.${uid},partner_b.eq.${uid}`)
    .maybeSingle()

  const partnerId = couple
    ? (couple.partner_a === uid ? couple.partner_b : couple.partner_a)
    : null
  const isPaired = couple?.status === 'paired' && !!partnerId

  // ── 이번 주 진도 ──
  const { data: myProgress } = await supabase
    .from('progress').select('week_no')
    .eq('subscriber_id', uid).eq('week_no', weekNo).maybeSingle()

  let partnerDone = false
  if (isPaired && partnerId) {
    const { data: pp } = await supabase
      .from('progress').select('week_no')
      .eq('subscriber_id', partnerId).eq('week_no', weekNo).maybeSingle()
    partnerDone = !!pp
  }

  // ── 주차 잠금: 이전 주를 둘 다 완료해야 다음 주 접근 가능 ──
  let locked = false
  if (weekNo > 1 && isPaired && !isAdmin) {
    const prevWeek = weekNo - 1
    const { data: myPrev } = await supabase
      .from('progress').select('week_no')
      .eq('subscriber_id', uid).eq('week_no', prevWeek).maybeSingle()
    const { data: partnerPrev } = await supabase
      .from('progress').select('week_no')
      .eq('subscriber_id', partnerId!).eq('week_no', prevWeek).maybeSingle()
    locked = !myPrev || !partnerPrev
  }

  // ── 내 노트 ──
  const { data: myNotes } = await supabase
    .from('week_notes').select('answers, sections_read')
    .eq('subscriber_id', uid).eq('week_no', weekNo).maybeSingle()

  // ── 파트너 답변 (둘 다 완료 시) ──
  let partnerAnswers: Record<string, string> | null = null
  if (isPaired && partnerId && !!myProgress && partnerDone) {
    const { data: pn } = await supabase
      .from('week_notes').select('answers')
      .eq('subscriber_id', partnerId).eq('week_no', weekNo).maybeSingle()
    partnerAnswers = (pn?.answers as Record<string, string>) ?? null
  }

  const content = getContent(resolvedTrack, weekNo)
  if (!content) notFound()

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
        locked={locked}
        initialAnswers={(myNotes?.answers as Record<string, string>) ?? {}}
        initialSectionsRead={(myNotes?.sections_read as string[]) ?? []}
        partnerAnswers={partnerAnswers}
      />
      <BottomNav />
    </div>
  )
}
