'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BookOpen, MessageCircle, Leaf, CheckCircle2, CircleDot } from 'lucide-react'
import type { ContentWeek } from '@/lib/types'

const TRACKS = [
  { value: 'lover',   label: '💑 연인' },
  { value: 'engaged', label: '💍 결혼준비' },
  { value: 'married', label: '👫 부부' },
] as const

interface Props {
  content: ContentWeek
  initialDone: boolean
  partnerDone: boolean
  totalWeeks: number
  isAdmin?: boolean
  currentTrack?: string
  weekNo?: number
}

export default function StudyClient({ content, initialDone, partnerDone, totalWeeks, isAdmin, currentTrack, weekNo }: Props) {
  const [done, setDone] = useState(initialDone)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    setLoading(true)
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_no: content.week_no }),
    })
    if (res.ok) setDone(true)
    setLoading(false)
  }

  const progress = Math.round((content.week_no / totalWeeks) * 100)

  return (
    <div>
      {/* Admin track switcher */}
      {isAdmin && (
        <div className="bg-[#2C1F0F] px-4 py-2 flex items-center gap-2">
          <span className="text-xs text-[#C9972B] font-bold uppercase tracking-wider mr-1">🔑 Admin</span>
          {TRACKS.map(t => (
            <button
              key={t.value}
              onClick={() => router.push(`/week/${weekNo}?track=${t.value}`)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                currentTrack === t.value
                  ? 'bg-[#C9972B] text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-[#5C4033] to-[#8B6B5A] text-white px-4 md:px-8 pt-6 pb-8 relative">
        <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white transition-colors">
          <ChevronLeft size={16} /> 대시보드
        </Link>
        <div className="inline-block bg-white/20 rounded-full px-3 py-1 text-xs font-semibold mb-2">
          {content.week_no}주차
        </div>
        <h1 className="text-2xl font-extrabold mb-1">{content.title}</h1>
        <p className="text-white/75 text-sm">📖 {content.verse_ref}</p>
        </div>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-[#C9972B] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-7">
        {/* 1. 이번 주 구절 */}
        <section className="space-y-3">
          <SectionLabel icon={<BookOpen size={14} />} label="이번 주 한 구절" />
          <div className="bg-gradient-to-br from-[#FBF3DC] to-[#FFF9F0] border border-[#F0D9A0] rounded-2xl p-5 text-center">
            <div className="text-xs font-bold text-[#C9972B] uppercase tracking-wider mb-3">{content.verse_ref}</div>
            <p className="text-lg font-medium text-[#5C4033] leading-relaxed italic mb-3">
              "{content.verse_text}"
            </p>
            <p className="text-xs text-[#7A6555]">💡 소리 내어 읽으면 더 깊이 새겨져요</p>
          </div>
        </section>

        {/* 2. 함께 읽기 */}
        <section className="space-y-3">
          <SectionLabel icon={<BookOpen size={14} />} label="함께 읽기" />
          <div className="card p-5">
            <div className="text-sm text-[#2C1F0F] leading-[1.9] whitespace-pre-line">{content.reading}</div>
          </div>
        </section>

        {/* 3. 각자 묵상 질문 */}
        <section className="space-y-3">
          <SectionLabel icon={<CircleDot size={14} />} label="각자 묵상 질문" color="gold" />
          <p className="text-xs text-[#7A6555]">혼자 조용히 읽고 생각해보세요.</p>
          {content.personal_questions.map((q, i) => (
            <div key={i} className="card p-4 flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#FBF3DC] text-[#C9972B] flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-sm leading-relaxed text-[#2C1F0F] pt-0.5">{q}</p>
            </div>
          ))}
        </section>

        {/* 4. 함께 나눌 질문 */}
        <section className="space-y-3">
          <SectionLabel icon={<MessageCircle size={14} />} label="함께 나눌 질문" color="sage" />
          <div className="bg-[#EBF4EE] rounded-xl px-3 py-2 text-xs text-[#7A9E87] font-medium">
            💑 파트너와 만나거나 통화하며 함께 나눠보세요
          </div>
          {content.couple_questions.map((q, i) => (
            <div key={i} className="card p-4 flex gap-3 border-l-4 border-[#7A9E87]">
              <div className="w-7 h-7 rounded-full bg-[#EBF4EE] text-[#7A9E87] flex items-center justify-center text-xs font-bold flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </div>
              <p className="text-sm leading-relaxed text-[#2C1F0F] pt-0.5">{q}</p>
            </div>
          ))}
        </section>

        {/* 5. 이번 주 적용 */}
        <section className="space-y-3">
          <SectionLabel icon={<Leaf size={14} />} label="이번 주 적용" color="sage" />
          <div className="bg-[#EBF4EE] border border-[#B8D4C0] rounded-xl p-4">
            <h4 className="text-xs font-bold text-[#7A9E87] mb-2">작은 실천 하나</h4>
            <p className="text-sm text-[#2C1F0F] leading-relaxed">{content.application}</p>
          </div>
        </section>

        {/* 6. 완료 체크 */}
        <section>
          <div className={`rounded-2xl border-2 p-6 text-center transition-all ${
            done ? 'border-[#7A9E87] bg-[#EBF4EE]' : 'border-[#E8DDD0] bg-white'
          }`}>
            {done ? (
              <>
                <CheckCircle2 size={40} className="text-[#7A9E87] mx-auto mb-3" />
                <h3 className="font-bold text-[#7A9E87] mb-1">이번 주 묵상 완료!</h3>
                <p className="text-sm text-[#7A6555]">
                  {partnerDone
                    ? '파트너도 완료했어요 💑 함께 나눌 질문을 꼭 나눠보세요!'
                    : '파트너가 완료하면 함께 질문을 나눌 수 있어요 🌿'}
                </p>
                <Link href="/dashboard" className="btn-secondary text-sm py-2 px-5 mt-4 inline-block">
                  대시보드로 →
                </Link>
              </>
            ) : (
              <>
                <h3 className="font-bold text-[#2C1F0F] mb-1">이번 주 묵상을 마쳤나요?</h3>
                <p className="text-sm text-[#7A6555] mb-5">
                  완료하면 파트너에게도 알림이 가요.<br />함께 나눌 질문까지 마친 후 체크해요.
                </p>
                <button onClick={handleComplete} disabled={loading} className="btn-sage w-full">
                  {loading ? <span className="spinner" /> : '✅ 이번 주 완료 체크'}
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionLabel({ icon, label, color = 'brown' }: { icon: React.ReactNode; label: string; color?: string }) {
  const colors = {
    brown: 'text-[#7A6555]',
    gold: 'text-[#C9972B]',
    sage: 'text-[#7A9E87]',
  } as const
  return (
    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${colors[color as keyof typeof colors]}`}>
      {icon}
      {label}
      <div className="flex-1 h-px bg-[#E8DDD0]" />
    </div>
  )
}
