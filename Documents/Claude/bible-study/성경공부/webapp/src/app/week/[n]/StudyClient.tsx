'use client'
import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BookOpen, MessageCircle, Leaf, CheckCircle2, CircleDot, Lock, ChevronDown, ChevronUp } from 'lucide-react'
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
  locked?: boolean
  initialAnswers: Record<string, string>
  initialSectionsRead: string[]
  partnerAnswers: Record<string, string> | null
}

export default function StudyClient({
  content, initialDone, partnerDone, totalWeeks,
  isAdmin, currentTrack, weekNo,
  locked, initialAnswers, initialSectionsRead, partnerAnswers,
}: Props) {
  const [done, setDone] = useState(initialDone)
  const [completing, setCompleting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [sectionsRead, setSectionsRead] = useState<string[]>(initialSectionsRead)
  const router = useRouter()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const progress = Math.round((content.week_no / totalWeeks) * 100)

  // ── 노트 저장 (debounced) ──
  const saveNotes = useCallback((newAnswers: Record<string, string>, newSections: string[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_no: content.week_no, answers: newAnswers, sections_read: newSections }),
      })
    }, 800)
  }, [content.week_no])

  const updateAnswer = (idx: number, value: string) => {
    const next = { ...answers, [idx]: value }
    setAnswers(next)
    saveNotes(next, sectionsRead)
  }

  const toggleSection = (key: string) => {
    const next = sectionsRead.includes(key)
      ? sectionsRead.filter(s => s !== key)
      : [...sectionsRead, key]
    setSectionsRead(next)
    saveNotes(answers, next)
  }

  const handleComplete = async () => {
    setCompleting(true)
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_no: content.week_no }),
    })
    if (res.ok) setDone(true)
    setCompleting(false)
  }

  // ── 잠금 화면 ──
  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Lock size={48} className="text-[#E8DDD0] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2C1F0F] mb-2">{content.week_no}주차는 아직 잠겨 있어요</h2>
          <p className="text-sm text-[#7A6555] leading-relaxed mb-6">
            파트너와 함께 {content.week_no - 1}주차를 완료하면<br />다음 주차가 열려요.
          </p>
          <Link href="/dashboard"
            className="inline-block px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#C9972B' }}>
            대시보드로 →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Admin track switcher */}
      {isAdmin && (
        <div className="bg-[#2C1F0F] px-4 py-2 flex items-center gap-2">
          <span className="text-xs text-[#C9972B] font-bold uppercase tracking-wider mr-1">🔑 Admin</span>
          {TRACKS.map(t => (
            <button key={t.value}
              onClick={() => router.push(`/week/${weekNo}?track=${t.value}`)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                currentTrack === t.value ? 'bg-[#C9972B] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}>
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
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-[#C9972B] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-5">

        {/* 1. 이번 주 구절 */}
        <CollapsibleSection
          id="verse"
          label="이번 주 한 구절"
          icon={<BookOpen size={14} />}
          isRead={sectionsRead.includes('verse')}
          onToggleRead={() => toggleSection('verse')}
        >
          <div className="bg-gradient-to-br from-[#FBF3DC] to-[#FFF9F0] border border-[#F0D9A0] rounded-2xl p-5 text-center">
            <div className="text-xs font-bold text-[#C9972B] uppercase tracking-wider mb-3">{content.verse_ref}</div>
            <p className="text-lg font-medium text-[#5C4033] leading-relaxed italic mb-3">
              "{content.verse_text}"
            </p>
            <p className="text-xs text-[#7A6555]">💡 소리 내어 읽으면 더 깊이 새겨져요</p>
          </div>
        </CollapsibleSection>

        {/* 2. 함께 읽기 */}
        <CollapsibleSection
          id="reading"
          label="함께 읽기"
          icon={<BookOpen size={14} />}
          isRead={sectionsRead.includes('reading')}
          onToggleRead={() => toggleSection('reading')}
        >
          <div className="card p-5">
            <div className="text-sm text-[#2C1F0F] leading-[1.9] whitespace-pre-line">{content.reading}</div>
          </div>
        </CollapsibleSection>

        {/* 3. 각자 묵상 질문 + 답변 */}
        <CollapsibleSection
          id="personal"
          label="각자 묵상 질문"
          icon={<CircleDot size={14} />}
          color="gold"
          isRead={sectionsRead.includes('personal')}
          onToggleRead={() => toggleSection('personal')}
        >
          <p className="text-xs text-[#7A6555] -mt-1 mb-3">혼자 조용히 읽고 생각해보세요.</p>
          <div className="space-y-4">
            {content.personal_questions.map((q, i) => (
              <div key={i} className="space-y-2">
                <div className="card p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#FBF3DC] text-[#C9972B] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-[#2C1F0F] pt-0.5">{q}</p>
                </div>
                {/* 내 답변 */}
                <textarea
                  className="w-full text-sm text-[#2C1F0F] bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl px-4 py-3 resize-none leading-relaxed placeholder:text-[#C4B5A8] focus:outline-none focus:border-[#C9972B] transition-colors"
                  rows={3}
                  placeholder="내 답변을 적어보세요..."
                  value={answers[i] ?? ''}
                  onChange={e => updateAnswer(i, e.target.value)}
                />
                {/* 파트너 답변 (둘 다 완료 후) */}
                {partnerAnswers && partnerAnswers[i] && (
                  <div className="bg-[#EBF4EE] border border-[#B8D4C0] rounded-xl px-4 py-3">
                    <p className="text-xs font-bold text-[#7A9E87] mb-1">💑 파트너의 답변</p>
                    <p className="text-sm text-[#2C1F0F] leading-relaxed whitespace-pre-wrap">
                      {partnerAnswers[i]}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {partnerAnswers === null && done && partnerDone === false && (
            <p className="text-xs text-[#7A6555] mt-3 text-center">
              🔒 파트너가 완료하면 서로의 답변을 볼 수 있어요
            </p>
          )}
          {partnerAnswers === null && done && partnerDone && (
            <p className="text-xs text-[#7A9E87] mt-3 text-center">
              💑 파트너도 완료했어요! 페이지를 새로고침하면 답변이 보여요
            </p>
          )}
        </CollapsibleSection>

        {/* 4. 함께 나눌 질문 */}
        <CollapsibleSection
          id="couple"
          label="함께 나눌 질문"
          icon={<MessageCircle size={14} />}
          color="sage"
          isRead={sectionsRead.includes('couple')}
          onToggleRead={() => toggleSection('couple')}
        >
          <div className="bg-[#EBF4EE] rounded-xl px-3 py-2 text-xs text-[#7A9E87] font-medium -mt-1 mb-3">
            💑 파트너와 만나거나 통화하며 함께 나눠보세요
          </div>
          {content.couple_questions.map((q, i) => (
            <div key={i} className={`card p-4 flex gap-3 border-l-4 border-[#7A9E87] ${i > 0 ? 'mt-2' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-[#EBF4EE] text-[#7A9E87] flex items-center justify-center text-xs font-bold flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </div>
              <p className="text-sm leading-relaxed text-[#2C1F0F] pt-0.5">{q}</p>
            </div>
          ))}
        </CollapsibleSection>

        {/* 5. 이번 주 적용 */}
        <CollapsibleSection
          id="application"
          label="이번 주 적용"
          icon={<Leaf size={14} />}
          color="sage"
          isRead={sectionsRead.includes('application')}
          onToggleRead={() => toggleSection('application')}
        >
          <div className="bg-[#EBF4EE] border border-[#B8D4C0] rounded-xl p-4">
            <h4 className="text-xs font-bold text-[#7A9E87] mb-2">작은 실천 하나</h4>
            <p className="text-sm text-[#2C1F0F] leading-relaxed">{content.application}</p>
          </div>
        </CollapsibleSection>

        {/* 6. 완료 체크 */}
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
                  : '파트너가 완료하면 서로의 답변을 볼 수 있어요 🌿'}
              </p>
              <Link href="/dashboard" className="inline-block mt-4 px-6 py-2 rounded-xl text-sm font-semibold bg-[#EBF4EE] text-[#7A9E87] border border-[#B8D4C0]">
                대시보드로 →
              </Link>
            </>
          ) : (
            <>
              <h3 className="font-bold text-[#2C1F0F] mb-1">이번 주 묵상을 마쳤나요?</h3>
              <p className="text-sm text-[#7A6555] mb-5">
                함께 나눌 질문까지 마친 후 체크해요.
              </p>
              <button onClick={handleComplete} disabled={completing}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                style={{ background: '#7A9E87' }}>
                {completing ? <span className="spinner" /> : '✅ 이번 주 완료 체크'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 접을 수 있는 섹션 컴포넌트 ──
interface SectionProps {
  id: string
  label: string
  icon: React.ReactNode
  color?: 'brown' | 'gold' | 'sage'
  isRead: boolean
  onToggleRead: () => void
  children: React.ReactNode
}

function CollapsibleSection({ id, label, icon, color = 'brown', isRead, onToggleRead, children }: SectionProps) {
  const [collapsed, setCollapsed] = useState(isRead)
  const colors = { brown: 'text-[#7A6555]', gold: 'text-[#C9972B]', sage: 'text-[#7A9E87]' }

  const handleRead = () => {
    onToggleRead()
    if (!isRead) setCollapsed(true)  // mark as read → collapse
    else setCollapsed(false)          // unmark → expand
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider flex-1 ${colors[color]}`}>
          {icon}
          {label}
          <div className="flex-1 h-px bg-[#E8DDD0]" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleRead}
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${
              isRead
                ? 'bg-[#7A9E87] text-white border-[#7A9E87]'
                : 'bg-white text-[#7A6555] border-[#E8DDD0] hover:border-[#7A9E87] hover:text-[#7A9E87]'
            }`}
          >
            {isRead ? '✓ 읽음' : '읽었어요'}
          </button>
          <button onClick={() => setCollapsed(c => !c)} className="text-[#C4B5A8] hover:text-[#7A6555]">
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>
      {!collapsed && <div className="space-y-3">{children}</div>}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="text-xs text-[#C4B5A8] hover:text-[#7A6555] w-full text-left pl-1">
          ▸ 펼쳐보기
        </button>
      )}
    </section>
  )
}
