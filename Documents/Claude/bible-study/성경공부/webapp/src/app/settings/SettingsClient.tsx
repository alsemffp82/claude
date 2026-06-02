'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Subscriber } from '@/lib/types'
import { ChevronRight, LogOut } from 'lucide-react'

interface Props {
  subscriber: Subscriber | null
  coupleStatus: string
  inviteToken: string
}

export default function SettingsClient({ subscriber, coupleStatus, inviteToken }: Props) {
  const router = useRouter()
  const [sendDay, setSendDay] = useState(subscriber?.send_day ?? 'monday')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async (updates: Record<string, string>) => {
    setSaving(true)
    await fetch('/api/subscriber', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const handlePause = () => save({ status: 'paused' })
  const handleResume = () => save({ status: 'active' })

  const days = [
    { value: 'monday', label: '월요일' },
    { value: 'tuesday', label: '화요일' },
    { value: 'wednesday', label: '수요일' },
    { value: 'friday', label: '금요일' },
  ]

  return (
    <div>
      <div className="px-4 pt-6 pb-4 border-b border-[#E8DDD0]">
        <h1 className="text-xl font-extrabold text-[#2C1F0F]">설정</h1>
        <p className="text-sm text-[#7A6555] mt-0.5">{subscriber?.email}</p>
      </div>

      <div className="px-4 py-6 space-y-6">
        {saved && (
          <div className="bg-[#EBF4EE] border border-[#B8D4C0] rounded-lg px-4 py-2.5 text-sm text-[#7A9E87] text-center">
            ✅ 저장됐어요
          </div>
        )}

        {/* Profile */}
        <SettingsGroup title="프로필">
          <SettingsRow icon="👤" label="이름" value={subscriber?.name ?? ''} />
          <SettingsRow icon="✉️" label="이메일" value={subscriber?.email ?? ''} />
        </SettingsGroup>

        {/* Subscription */}
        <SettingsGroup title="구독 설정">
          <div className="bg-white border border-[#E8DDD0] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E8DDD0] flex items-center gap-3">
              <span className="text-lg">📅</span>
              <span className="text-sm font-medium flex-1">발송 요일</span>
              <select
                className="text-sm text-[#7A6555] bg-transparent outline-none cursor-pointer"
                value={sendDay}
                onChange={e => {
                  setSendDay(e.target.value)
                  save({ send_day: e.target.value })
                }}
              >
                {days.map(d => (
                  <option key={d.value} value={d.value}>{d.label} 오전 9시</option>
                ))}
              </select>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <span className="text-lg">🌏</span>
              <span className="text-sm font-medium flex-1">언어</span>
              <span className="text-sm text-[#7A6555]">한국어 (KO)</span>
            </div>
          </div>
        </SettingsGroup>

        {/* Partner */}
        <SettingsGroup title="파트너">
          <div className="bg-white border border-[#E8DDD0] rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer"
            onClick={() => router.push('/connect')}>
            <span className="text-lg">💑</span>
            <span className="text-sm font-medium flex-1">파트너 연결</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              coupleStatus === 'paired'
                ? 'bg-[#EBF4EE] text-[#7A9E87]'
                : 'bg-[#FBF3DC] text-[#C9972B]'
            }`}>
              {coupleStatus === 'paired' ? '연결됨' : '대기 중'}
            </span>
            <ChevronRight size={16} className="text-[#E8DDD0]" />
          </div>
        </SettingsGroup>

        {/* Subscription management */}
        <SettingsGroup title="구독 관리">
          {subscriber?.status === 'paused' ? (
            <button onClick={handleResume} disabled={saving}
              className="btn-sage w-full text-sm py-3">
              ▶ 구독 재개하기
            </button>
          ) : (
            <button onClick={handlePause} disabled={saving}
              className="w-full bg-white border border-[#E8DDD0] text-[#7A6555] text-sm font-medium py-3 rounded-xl hover:border-[#C9972B] transition-colors">
              ⏸ 일시 정지 (최대 4주)
            </button>
          )}
        </SettingsGroup>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-sm text-[#7A6555] py-3 border border-[#E8DDD0] rounded-xl bg-white hover:border-red-200 hover:text-red-500 transition-colors">
          <LogOut size={15} />
          로그아웃
        </button>

        {/* Danger zone */}
        <div className="border border-red-100 rounded-xl p-4 bg-red-50/50">
          <h4 className="text-xs font-bold text-red-500 mb-3">구독 취소</h4>
          <button onClick={() => save({ status: 'canceled' })}
            className="w-full bg-red-50 text-red-500 border border-red-200 text-sm font-medium py-2.5 rounded-lg hover:bg-red-100 transition-colors">
            구독 취소하기
          </button>
          <p className="text-xs text-[#7A6555] mt-2 text-center">
            취소해도 콘텐츠는 남아있어요. 언제든 돌아올 수 있어요.
          </p>
        </div>
      </div>
    </div>
  )
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold text-[#7A6555] uppercase tracking-wider mb-2">{title}</div>
      {children}
    </div>
  )
}

function SettingsRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white border border-[#E8DDD0] rounded-xl px-4 py-3 flex items-center gap-3 mb-1">
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium flex-1">{label}</span>
      <span className="text-sm text-[#7A6555] truncate max-w-[140px]">{value}</span>
    </div>
  )
}
