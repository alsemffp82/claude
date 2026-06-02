'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Copy, Share2, MessageCircle, CheckCircle2 } from 'lucide-react'

interface Props {
  couple: { invite_token: string; status: string; partner_b_info?: { name: string; email: string } | null } | null
  myName: string
  appUrl: string
}

export default function ConnectClient({ couple, myName, appUrl }: Props) {
  const [copied, setCopied] = useState(false)
  const [partnerEmail, setPartnerEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const inviteUrl = couple ? `${appUrl}/invite/${couple.invite_token}` : ''
  const isPaired = couple?.status === 'paired'

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendEmail = async () => {
    if (!partnerEmail) return
    setSending(true)
    await fetch('/api/invite/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: partnerEmail, invite_url: inviteUrl, from_name: myName }),
    })
    setEmailSent(true)
    setSending(false)
  }

  if (isPaired) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="card p-8 w-full max-w-sm text-center fade-up">
          <div className="text-5xl mb-4">💑</div>
          <h2 className="text-xl font-bold text-[#2C1F0F] mb-2">연결됐어요!</h2>
          <p className="text-sm text-[#7A6555] mb-2">
            <strong>{couple?.partner_b_info?.name}</strong>님과 함께 여정을 시작해요.
          </p>
          <Link href="/dashboard" className="btn-primary w-full mt-4 block">
            대시보드로 →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-sm mx-auto px-4 py-8 space-y-5 fade-up">
        <Link href="/dashboard" className="text-sm text-[#7A6555]">← 대시보드로 건너뛰기</Link>

        <div className="bg-gradient-to-br from-[#FBF3DC] to-[#EBF4EE] rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">💌</div>
          <h2 className="text-xl font-bold text-[#2C1F0F] mb-1">파트너를 초대해요</h2>
          <p className="text-sm text-[#7A6555]">아래 링크를 파트너에게 공유하면<br />두 사람이 하나의 여정으로 연결돼요.</p>
        </div>

        {/* Invite link */}
        <div className="card p-5 space-y-3">
          <div className="text-xs font-bold text-[#7A6555]">📎 초대 링크</div>
          <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-lg px-3 py-2.5">
            <span className="flex-1 text-xs text-[#7A6555] font-mono truncate">{inviteUrl}</span>
            <button onClick={copyLink}
              className="flex-shrink-0 text-xs font-semibold bg-[#C9972B] text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {copied ? '복사됨' : '복사'}
            </button>
          </div>
          <p className="text-xs text-[#7A6555] text-center">링크는 파트너가 합류할 때까지 유효해요</p>
          <div className="flex gap-2">
            <button onClick={() => {
              if (navigator.share) navigator.share({ title: '커플 성경공부 초대', url: inviteUrl })
              else copyLink()
            }}
              className="btn-secondary flex-1 text-sm py-2.5">
              <Share2 size={15} /> 공유하기
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-[#7A6555]">
          <div className="flex-1 h-px bg-[#E8DDD0]" />또는<div className="flex-1 h-px bg-[#E8DDD0]" />
        </div>

        {/* Email invite */}
        <div className="card p-5 space-y-3">
          <div className="text-xs font-bold text-[#7A6555]">✉️ 이메일로 직접 초대</div>
          {emailSent ? (
            <div className="text-center text-sm text-[#7A9E87] py-2">✅ 초대 이메일을 보냈어요!</div>
          ) : (
            <>
              <input type="email" className="form-input" placeholder="파트너 이메일"
                value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} />
              <button onClick={sendEmail} disabled={sending || !partnerEmail}
                className="btn-sage w-full text-sm py-2.5">
                {sending ? <span className="spinner" /> : '초대 보내기'}
              </button>
            </>
          )}
        </div>

        {/* Status */}
        <div className="card p-4">
          <div className="text-xs font-bold text-[#7A6555] mb-3">연결 상태</div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-[#FAF7F2] rounded-lg px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F0D9A0] flex items-center justify-center text-sm font-bold text-[#5C4033] flex-shrink-0">
                나
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{myName}</div>
                <div className="text-xs text-[#7A6555]">구독 완료 ✅</div>
              </div>
              <span className="text-xs font-semibold bg-[#FBF3DC] text-[#C9972B] px-2 py-1 rounded-full">주인장</span>
            </div>
            <div className="flex items-center gap-3 bg-[#FAF7F2] rounded-lg px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E8DDD0] flex items-center justify-center text-sm font-bold text-[#7A6555] flex-shrink-0">
                ?
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">파트너</div>
                <div className="text-xs text-[#7A6555]">초대 대기 중...</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium bg-[#FBF3DC] text-[#C9972B] px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9972B] animate-pulse" />
                대기 중
              </div>
            </div>
          </div>
        </div>

        <Link href="/dashboard" className="btn-secondary w-full text-sm text-center block">
          나중에 초대할게요 →
        </Link>
      </div>
    </div>
  )
}
