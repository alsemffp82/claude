import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, invite_url, from_name } = await req.json()
  // 실제 운영 시 Resend / Nodemailer / 스티비 API 연동
  // 개발 모드에서는 콘솔 출력
  console.log(`[초대 이메일] To: ${email}, From: ${from_name}, URL: ${invite_url}`)
  return NextResponse.json({ ok: true })
}
