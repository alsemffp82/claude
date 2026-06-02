'use client'
import Link from 'next/link'
import { CheckCircle2, Clock } from 'lucide-react'
import type { ContentWeek, DailyVerse } from '@/lib/types'

interface Props {
  myName: string
  partnerName: string
  isPaired: boolean
  completedWeeks: number[]
  partnerCompletedWeeks: number[]
  currentWeek: number
  currentContent: ContentWeek | null
  totalWeeks: number
  daysTogetherCount: number
  connectPath: string
  todayVerse: DailyVerse | null
}

export default function DashboardClient({
  myName, partnerName, isPaired,
  completedWeeks, partnerCompletedWeeks,
  currentWeek, currentContent, totalWeeks,
  daysTogetherCount, connectPath, todayVerse,
}: Props) {
  const myDoneThisWeek = completedWeeks.includes(currentWeek)
  const partnerDoneThisWeek = partnerCompletedWeeks.includes(currentWeek)
  const bothDone = myDoneThisWeek && partnerDoneThisWeek

  const greetingHour = new Date().getHours()
  const greeting =
    greetingHour < 12 ? '좋은 아침이에요 ☀️' :
    greetingHour < 18 ? '안녕하세요 🌤️' : '좋은 저녁이에요 🌙'

  return (
    <div>
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#FFF9EF] to-[#EEF6F1] px-6 pt-8 pb-6 md:px-10 md:pt-10">
        <p className="text-xs text-[#7A6555]">{greeting}</p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#2C1F0F] mt-1 mb-5">
          {myName}{isPaired && partnerName ? ` & ${partnerName}` : ''}
        </h1>

        {/* Couple status — inline in header on desktop */}
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur rounded-xl border border-[#E8DDD0] px-4 py-3 max-w-md">
          <div className="flex -space-x-2">
            <Avatar letter={myName[0]} color="gold" />
            {isPaired && partnerName && <Avatar letter={partnerName[0]} color="sage" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[#2C1F0F]">
              {isPaired ? '커플 연결됨 💑' : '솔로 모드 🌱'}
            </p>
            <p className="text-xs text-[#7A6555]">
              {isPaired
                ? `함께한 지 ${daysTogetherCount}일 · ${currentWeek}주차 진행 중`
                : '파트너를 초대해보세요'}
            </p>
          </div>
          {!isPaired && (
            <Link href={connectPath}
              className="flex-shrink-0 text-xs font-semibold bg-[#FBF3DC] text-[#C9972B] px-3 py-1.5 rounded-lg">
              초대
            </Link>
          )}
          {isPaired && (
            <div className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-[#7A9E87] bg-[#EBF4EE] px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E87]" />
              연결
            </div>
          )}
        </div>
      </div>

      {/* ── Main content: 2-col on lg ── */}
      <div className="px-4 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 space-y-5 lg:space-y-0">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">
            {/* 오늘의 묵상 구절 */}
            {todayVerse && (
              <div className="bg-gradient-to-br from-[#FBF3DC] to-[#FFF9F0] border border-[#F0D9A0] rounded-2xl p-5 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🌿</span>
                  <span className="text-xs font-bold text-[#C9972B] uppercase tracking-wider">오늘의 묵상</span>
                </div>
                <p className="text-xs font-semibold text-[#C9972B] mb-1">{todayVerse.ref}</p>
                <p className="text-base md:text-lg font-medium text-[#5C4033] leading-relaxed italic mb-3">
                  "{todayVerse.text}"
                </p>
                <p className="text-sm text-[#7A6555] leading-relaxed border-t border-[#F0D9A0] pt-3">
                  {todayVerse.meditation}
                </p>
              </div>
            )}

            {/* 16주 여정 */}
            <div className="card p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#7A6555]">📅 16주 여정</span>
                <span className="text-xs text-[#7A6555]">{completedWeeks.length}/{totalWeeks}주 완료</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(w => {
                  const done = completedWeeks.includes(w)
                  const isCurrent = w === currentWeek
                  return (
                    <Link key={w} href={`/week/${w}`}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done ? 'bg-[#7A9E87] text-white' :
                        isCurrent ? 'bg-[#C9972B] text-white ring-2 ring-[#F0D9A0]' :
                        'bg-[#E8DDD0] text-[#7A6555] hover:bg-[#d6c9bb]'
                      }`}
                    >
                      {w}
                    </Link>
                  )
                })}
              </div>
              <div className="h-2 bg-[#E8DDD0] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#7A9E87] to-[#C9972B] rounded-full transition-all"
                  style={{ width: `${(completedWeeks.length / totalWeeks) * 100}%` }} />
              </div>
            </div>

            {/* Couple conversation — only on mobile (shown in right col on lg) */}
            {currentContent && bothDone && (
              <div className="card p-5 lg:hidden">
                <div className="text-xs font-bold text-[#7A9E87] mb-3">💬 이번 주 함께 나눌 질문</div>
                {currentContent.couple_questions.map((q, i) => (
                  <div key={i} className={`bg-[#EBF4EE] rounded-xl px-4 py-3 text-sm text-[#2C1F0F] leading-relaxed ${i > 0 ? 'mt-2' : ''}`}>
                    {q}
                  </div>
                ))}
                <p className="text-xs text-[#7A6555] mt-3">💡 만나서, 전화로, 또는 메시지로도 좋아요</p>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">
            {/* This week's card */}
            {currentContent && (
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-r from-[#5C4033] to-[#8B6B5A] p-5 md:p-6 text-white">
                  <div className="text-xs opacity-70 uppercase tracking-wider mb-1">이번 주 · {currentWeek}주차</div>
                  <h2 className="text-xl font-extrabold mb-1">{currentContent.title}</h2>
                  <div className="text-sm opacity-80">📖 {currentContent.verse_ref}</div>
                </div>
                <div className="p-5 md:p-6 space-y-4">
                  <blockquote className="text-sm italic text-[#5C4033] border-l-4 border-[#C9972B] pl-3 leading-relaxed">
                    "{currentContent.verse_text}"
                  </blockquote>

                  {/* Progress: me & partner */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#7A6555] flex justify-between">
                      <span>이번 주 진도</span>
                      <span>{(myDoneThisWeek ? 1 : 0) + (partnerDoneThisWeek ? 1 : 0)}/
                        {isPaired ? 2 : 1} 완료</span>
                    </div>
                    <PersonRow name={`나 (${myName})`} done={myDoneThisWeek} color="gold" />
                    {isPaired && partnerName && (
                      <PersonRow name={partnerName} done={partnerDoneThisWeek} color="sage" />
                    )}
                  </div>

                  {/* Encourage message */}
                  {isPaired && !bothDone && myDoneThisWeek && (
                    <div className="bg-[#FBF3DC] border border-[#F0D9A0] rounded-xl p-3 flex gap-2">
                      <span className="text-lg flex-shrink-0">🌿</span>
                      <p className="text-xs text-[#5C4033] leading-relaxed">
                        {partnerName}님이 곧 함께할 거예요. 기다림도 사랑이에요.
                      </p>
                    </div>
                  )}
                  {bothDone && (
                    <div className="bg-[#EBF4EE] border border-[#B8D4C0] rounded-xl p-3 flex gap-2">
                      <span className="text-lg flex-shrink-0">💑</span>
                      <p className="text-xs text-[#5C4033] leading-relaxed">
                        둘 다 완료했어요! 함께 나눌 질문을 꼭 나눠보세요.
                      </p>
                    </div>
                  )}

                  <Link href={`/week/${currentWeek}`}
                    className="block text-center w-full py-3 rounded-xl font-semibold text-sm text-white"
                    style={{ background: '#C9972B' }}>
                    📖 이번 주 함께 묵상하기
                  </Link>
                </div>
              </div>
            )}

            {/* Couple questions — right col on lg only */}
            {currentContent && bothDone && (
              <div className="card p-5 hidden lg:block">
                <div className="text-xs font-bold text-[#7A9E87] mb-3">💬 이번 주 함께 나눌 질문</div>
                {currentContent.couple_questions.map((q, i) => (
                  <div key={i} className={`bg-[#EBF4EE] rounded-xl px-4 py-3 text-sm text-[#2C1F0F] leading-relaxed ${i > 0 ? 'mt-2' : ''}`}>
                    {q}
                  </div>
                ))}
                <p className="text-xs text-[#7A6555] mt-3">💡 만나서, 전화로, 또는 메시지로도 좋아요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Avatar({ letter, color }: { letter: string; color: 'gold' | 'sage' }) {
  const bg = color === 'gold' ? 'bg-[#F0D9A0] text-[#5C4033]' : 'bg-[#B8D4C0] text-[#7A9E87]'
  return (
    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-sm font-bold border-2 border-white`}>
      {letter}
    </div>
  )
}

function PersonRow({ name, done, color }: { name: string; done: boolean; color: 'gold' | 'sage' }) {
  const bg = color === 'gold' ? 'bg-[#F0D9A0] text-[#5C4033]' : 'bg-[#B8D4C0] text-[#7A9E87]'
  return (
    <div className="flex items-center gap-3 bg-[#FAF7F2] rounded-lg px-3 py-2.5">
      <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
        {name[0]}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-[#2C1F0F]">{name}</div>
        <div className="text-xs text-[#7A6555]">{done ? '완료' : '아직 읽는 중'}</div>
      </div>
      {done
        ? <CheckCircle2 size={20} className="text-[#7A9E87]" />
        : <Clock size={20} className="text-[#E8DDD0]" />}
    </div>
  )
}
