'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMsg('이메일 또는 비밀번호가 올바르지 않아요.')
      setLoading(false)
      return
    }

    router.push(next)
  }

  return (
    <form onSubmit={handleSubmit} className="fade-up">
      <h2 className="text-2xl font-bold text-[#2C1F0F] mb-1">로그인</h2>
      <p className="text-[#7A6555] text-sm mb-6">이메일과 비밀번호를 입력해주세요</p>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-semibold text-[#7A6555] mb-1.5">이메일</label>
        <input
          type="email" required className="form-input"
          placeholder="example@email.com"
          value={email} onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#7A6555] mb-1.5">비밀번호</label>
        <input
          type="password" required className="form-input"
          placeholder="비밀번호 입력"
          value={password} onChange={e => setPassword(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading || !email || !password}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm"
        style={{ background: '#C9972B' }}>
        {loading ? <span className="spinner" /> : '로그인'}
      </button>

      <p className="text-center text-xs text-[#7A6555] mt-4">
        처음이신가요?{' '}
        <Link href="/subscribe" className="text-[#C9972B] font-semibold">구독 신청하기</Link>
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-sm">
        <Link href="/" className="block text-center mb-6 text-lg font-bold text-[#5C4033]">
          💑 둘이한여정
        </Link>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
