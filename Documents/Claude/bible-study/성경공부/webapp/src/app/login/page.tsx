'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const inviteToken = searchParams.get('invite_token')
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const redirectTo = new URL('/auth/callback', appUrl)
    redirectTo.searchParams.set('next', next)
    if (inviteToken) redirectTo.searchParams.set('invite_token', inviteToken)

    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo.toString() },
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center fade-up">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="text-xl font-bold text-[#2C1F0F] mb-2">이메일을 확인해주세요</h2>
        <p className="text-[#7A6555] text-sm leading-relaxed">
          <strong>{email}</strong> 로 로그인 링크를 보냈어요.<br />
          링크를 클릭하면 바로 시작할 수 있어요.
        </p>
        <p className="text-xs text-[#7A6555] mt-4">스팸함도 확인해보세요</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="fade-up">
      <h2 className="text-2xl font-bold text-[#2C1F0F] mb-1">로그인</h2>
      <p className="text-[#7A6555] text-sm mb-6">이메일로 로그인 링크를 보내드려요</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          링크가 만료됐거나 유효하지 않아요. 다시 시도해주세요.
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-semibold text-[#7A6555] mb-1.5">이메일</label>
        <input
          type="email"
          required
          className="form-input"
          placeholder="example@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          suppressHydrationWarning
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className="btn-primary w-full"
      >
        {loading ? <span className="spinner" /> : '📧 로그인 링크 받기'}
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
