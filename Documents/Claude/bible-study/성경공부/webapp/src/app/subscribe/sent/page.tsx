'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SentContent() {
  const params = useSearchParams()
  const email = params.get('email') ?? ''
  return (
    <div className="text-center fade-up">
      <div className="text-5xl mb-4">📬</div>
      <h2 className="text-xl font-bold text-[#2C1F0F] mb-2">이메일을 확인해주세요</h2>
      <p className="text-sm text-[#7A6555] leading-relaxed">
        <strong>{email}</strong>로 로그인 링크를 보냈어요.<br />
        링크를 클릭하면 바로 파트너 초대 링크를 받을 수 있어요.
      </p>
      <p className="text-xs text-[#7A6555] mt-3">스팸함도 확인해보세요</p>
    </div>
  )
}

export default function SubscribeSentPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-sm">
        <Suspense>
          <SentContent />
        </Suspense>
      </div>
    </div>
  )
}
