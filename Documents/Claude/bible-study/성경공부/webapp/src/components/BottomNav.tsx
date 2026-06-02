'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Settings, Link2 } from 'lucide-react'

const tabs = [
  { href: '/dashboard', label: '홈', icon: Home },
  { href: '/week/current', label: '이번 주', icon: BookOpen },
  { href: '/connect', label: '연결', icon: Link2 },
  { href: '/settings', label: '설정', icon: Settings },
]

function isActive(href: string, path: string) {
  if (href === '/week/current') return path.startsWith('/week')
  return path === href
}

export default function BottomNav() {
  const path = usePathname()

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-60 bg-white border-r border-[#E8DDD0] z-50">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[#E8DDD0]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🕊️</span>
            <div>
              <div className="text-sm font-extrabold text-[#2C1F0F] leading-tight">둘이 한 여정</div>
              <div className="text-xs text-[#7A6555]">커플 성경공부</div>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, path)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#FBF3DC] text-[#C9972B]'
                    : 'text-[#7A6555] hover:bg-[#FAF7F2] hover:text-[#2C1F0F]'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-[#E8DDD0]">
          <p className="text-xs text-[#7A6555] leading-relaxed">
            "두 사람이 함께하면<br />한 사람보다 낫다"
          </p>
          <p className="text-xs text-[#E8DDD0] mt-1">전도서 4:9</p>
        </div>
      </aside>

      {/* ── Mobile bottom bar (< md) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8DDD0]">
        <div className="flex">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, path)
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  active ? 'text-[#C9972B]' : 'text-[#7A6555]'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
