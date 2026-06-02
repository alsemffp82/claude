'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  token: string
  inviterName: string
  currentUserEmail?: string
  coupleId: string
}

export default function InviteClient({ token, inviterName, currentUserEmail, coupleId }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState(currentUserEmail ?? '')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email, name }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || '오류가 발생했어요.')
      setLoading(false)
      return
    }

    if (data.dev_magic_link) {
      // dev 모드: 링크 표시
      window.location.href = data.dev_magic_link
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="card p-8 w-full max-w-sm text-center fade-up">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-[#2C1F0F] mb-2">이메일을 확인해주세요</h2>
          <p className="text-sm text-[#7A6555] leading-relaxed">
            <strong>{email}</strong>로 로그인 링크를 보냈어요.<br />
            링크를 클릭하면 {inviterName}님과 연결돼요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-sm fade-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">💑</div>
          <h2 className="text-xl font-bold text-[#2C1F0F] mb-1">
            {inviterName}님이 초대했어요
          </h2>
          <p className="text-sm text-[#7A6555]">
            함께 성경을 읽고 대화하는 여정을 시작해요.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#7A6555] mb-1.5">내 이름</label>
            <input type="text" required className="form-input" placeholder="내 이름을 입력해요"
              value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A6555] mb-1.5">이메일</label>
            <input type="email" required className="form-input" placeholder="example@email.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <span className="spinner" /> : '✨ 여정에 합류하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
