import Link from 'next/link'
import { BookOpen, Heart, BarChart2, Mail } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur border-b border-[#E8DDD0]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-[#5C4033] text-base">💑 둘이한여정</span>
          <div className="flex gap-2">
            <Link href="/login" className="text-sm text-[#7A6555] px-3 py-1.5 rounded-lg hover:bg-[#E8DDD0] transition-colors">
              로그인
            </Link>
            <Link href="/subscribe" className="text-sm font-semibold bg-[#C9972B] text-white px-4 py-1.5 rounded-lg hover:bg-[#B8891F] transition-colors">
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#FFF9EF] to-[#EEF6F1] py-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-[#FBF3DC] border border-[#F0D9A0] rounded-full px-4 py-1.5 text-sm font-semibold text-[#C9972B] mb-6">
          💌 커플 성경공부 · 16주 여정
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2C1F0F] leading-tight mb-4">
          혼자라면 미뤘을 묵상을<br />
          <span className="text-[#C9972B]">둘이라면 해낸다.</span>
        </h1>
        <p className="text-lg text-[#7A6555] max-w-md mx-auto mb-8 leading-relaxed">
          결혼을 준비하는 두 사람을 위한 성경 묵상 여정.<br />
          매주 함께 읽고, 함께 나누고, 함께 자라갑니다.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/subscribe" className="btn-primary">✦ 함께 시작하기</Link>
          <Link href="/login" className="btn-secondary">로그인</Link>
        </div>
        <p className="mt-8 text-sm text-[#7A6555] italic border border-[#E8DDD0] bg-white/60 rounded-xl inline-block px-5 py-2.5">
          "두 사람, 한 여정 (Two people, One journey)"
        </p>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-[#2C1F0F] mb-2">왜 커플 성경공부인가요?</h2>
          <p className="text-[#7A6555]">혼자보다 함께가 더 오래, 더 깊이 갑니다.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Heart size={28} className="text-[#C9972B]" />, title: '함께 나누는 대화', desc: '각자 묵상 후 커플 전용 대화 질문으로 신앙을 나눠요' },
            { icon: <Mail size={28} className="text-[#7A9E87]" />, title: '주간 이메일', desc: '매주 3분 분량의 이메일이 그 주의 묵상을 안내해요' },
            { icon: <BarChart2 size={28} className="text-[#C9972B]" />, title: '함께 보는 진도', desc: '두 사람의 진도를 한눈에. 서로 응원하며 나아가요' },
            { icon: <BookOpen size={28} className="text-[#7A9E87]" />, title: '목양적 케어', desc: '강요 없이, 부담 없이. 언제든 다시 시작할 수 있어요' },
          ].map(f => (
            <div key={f.title} className="card p-5 text-center">
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-bold text-sm text-[#2C1F0F] mb-1">{f.title}</h3>
              <p className="text-xs text-[#7A6555] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4">
        <div className="max-w-lg mx-auto card p-8">
          <h2 className="text-xl font-bold text-[#2C1F0F] mb-2">어떻게 진행되나요?</h2>
          <p className="text-sm text-[#7A6555] mb-6">이메일은 후킹, 웹페이지는 깊이.</p>
          <ol className="space-y-6">
            {[
              { n: 1, title: '📬 주간 이메일 수신', desc: '매주 핵심 구절과 메시지 2~3문장. 3분 완독.' },
              { n: 2, title: '📖 깊은 묵상 페이지로', desc: '이메일 버튼 → 본문·해설·묵상 질문이 있는 웹페이지.' },
              { n: 3, title: '🤝 커플 대화 나누기', desc: '각자 묵상 후 함께 나눌 질문으로 대화해요.' },
              { n: 4, title: '✅ 완료 체크 & 진도 반영', desc: '완료하면 대시보드에 두 사람 진도가 업데이트돼요.' },
            ].map((step, i, arr) => (
              <li key={step.n} className="flex gap-4">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#C9972B] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {step.n}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-[-16px] w-px bg-[#E8DDD0]" />
                  )}
                </div>
                <div className="pb-4">
                  <h4 className="font-bold text-[#2C1F0F] mb-0.5">{step.title}</h4>
                  <p className="text-sm text-[#7A6555]">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/subscribe" className="btn-primary w-full mt-4">지금 시작하기 →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C1F0F] text-white/60 text-center text-xs py-6 mt-8">
        © 2026 둘이한여정
      </footer>
    </div>
  )
}
