import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '둘이 한 여정 — 커플 성경공부',
  description: '결혼을 준비하는 두 사람을 위한 16주 성경 묵상 여정',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
