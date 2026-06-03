'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SubscribePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '', send_day: 'monday', start_offset: '0', track: 'lover',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + parseInt(form.start_offset))

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          send_day: form.send_day,
          start_date: startDate.toISOString().split('T')[0],
          track: form.track,
        },
      },
    })

    if (signUpError) {
      setError(
        signUpError.message.includes('already registered')
          ? '이미 가입된 이메일이에요. 로그인해주세요.'
          : signUpError.message
      )
      setLoading(false)
      return
    }

    // signUp 후 바로 로그인 (email confirmation 비활성화 시 자동 세션 생성)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      setError('가입은 완료됐어요. 로그인 페이지에서 로그인해주세요.')
      setLoading(false)
      router.push('/login')
      return
    }

    router.push('/connect')
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-[#FFF9EF] to-[#EEF6F1] px-4 pt-8 pb-8 text-center">
        <div className="flex gap-4 justify-center items-center mb-4">
          <Link href="/" className="text-sm text-[#7A6555] inline-block">← 돌아가기</Link>
          <div className="inline-flex items-center gap-2 bg-[#FBF3DC] border border-[#F0D9A0] rounded-full px-4 py-1.5 text-sm font-semibold text-[#C9972B]">
            ✨ 무료 · 16주 커플 성경공부
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-[#2C1F0F] mb-1">함께 시작해요</h1>
        <p className="text-sm text-[#7A6555]">먼저 신청하고, 파트너를 초대하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto px-4 py-8 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#7A6555] mb-1.5">이름</label>
          <input type="text" required className="form-input"
            placeholder="내 이름을 입력해요"
            value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#7A6555] mb-1.5">이메일</label>
          <input type="email" required className="form-input"
            placeholder="example@email.com"
            value={form.email} onChange={e => set('email', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#7A6555] mb-1.5">비밀번호</label>
          <input type="password" required minLength={6} className="form-input"
            placeholder="6자 이상 입력해주세요"
            value={form.password} onChange={e => set('password', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#7A6555] mb-1.5">트랙 선택</label>
          <div className="space-y-2">
            {[
              { value: 'lover',   label: '💑 연인으로 교제 중', desc: '16주 연인 커플 성경공부' },
              { value: 'engaged', label: '💍 결혼 준비 중',     desc: '16주 결혼준비 커플 성경공부' },
              { value: 'married', label: '👫 결혼한 부부',      desc: '16주 부부 성경공부' },
            ].map(opt => (
              <label key={opt.value}
                className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                  form.track === opt.value ? 'border-[#C9972B] bg-[#FBF3DC]' : 'border-[#E8DDD0] bg-white'
                }`}>
                <input type="radio" name="track" value={opt.value}
                  checked={form.track === opt.value}
                  onChange={() => set('track', opt.value)}
                  className="mt-0.5 accent-[#C9972B]" />
                <div>
                  <div className="text-sm font-medium text-[#2C1F0F]">{opt.label}</div>
                  <div className="text-xs text-[#7A6555]">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#7A6555] mb-1.5">시작 시기</label>
          <div className="space-y-2">
            {[
              { value: '0', label: '바로 시작할게요',     desc: '이번 주부터 시작돼요' },
              { value: '7', label: '다음 주부터 시작할게요', desc: '일주일 후부터 시작돼요' },
            ].map(opt => (
              <label key={opt.value}
                className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                  form.start_offset === opt.value ? 'border-[#C9972B] bg-[#FBF3DC]' : 'border-[#E8DDD0] bg-white'
                }`}>
                <input type="radio" name="start" value={opt.value}
                  checked={form.start_offset === opt.value}
                  onChange={() => set('start_offset', opt.value)}
                  className="mt-0.5 accent-[#C9972B]" />
                <div>
                  <div className="text-sm font-medium text-[#2C1F0F]">{opt.label}</div>
                  <div className="text-xs text-[#7A6555]">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#7A6555] mb-1.5">발송 요일</label>
          <select className="form-input" value={form.send_day}
            onChange={e => set('send_day', e.target.value)}>
            <option value="monday">월요일 오전 9시</option>
            <option value="tuesday">화요일 오전 9시</option>
            <option value="wednesday">수요일 오전 9시</option>
            <option value="friday">금요일 오전 9시</option>
          </select>
        </div>

        <button type="submit"
          disabled={loading || !form.name || !form.email || form.password.length < 6}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-base"
          style={{ background: '#C9972B' }}>
          {loading ? '처리 중...' : '💑 신청하기'}
        </button>

        <p className="text-center text-xs text-[#7A6555]">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-[#C9972B] font-semibold">로그인</Link>
        </p>
      </form>
    </div>
  )
}
