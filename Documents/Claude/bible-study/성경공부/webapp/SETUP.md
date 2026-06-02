# 둘이한여정 — 설정 가이드

## 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. **Settings → API** 에서 다음 값 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## 2. 데이터베이스 스키마 실행

1. Supabase 대시보드 → **SQL Editor**
2. `supabase/schema.sql` 파일 내용을 전체 복사 후 붙여넣고 실행

## 3. Supabase Auth 설정

1. **Authentication → Settings**:
   - Site URL: `http://localhost:3000` (개발) 또는 실제 도메인
   - Redirect URLs: `http://localhost:3000/auth/callback`
2. **Authentication → Email Templates**:
   - Magic Link 이메일 템플릿을 한국어로 수정 가능

## 4. 환경 변수 설정

```bash
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase 값 입력
```

## 5. 개발 서버 실행

```bash
cd webapp
npm install   # 이미 했다면 생략
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 6. 개발 모드 팁

**매직링크 없이 테스트하기**: 개발 환경에서 `/api/subscribe` 응답에 `dev_magic_link`가 포함됩니다. 이 URL을 브라우저에 붙여넣으면 이메일 없이 로그인할 수 있습니다.

**Supabase 로컬 이메일 확인**: Supabase 대시보드 → Authentication → Users 에서 사용자 목록을 확인하고, 이메일 Confirm을 직접 할 수 있습니다.

## 7. 배포 (Vercel 권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

Vercel 대시보드에서 환경 변수 `.env.local` 내용을 동일하게 입력하고, `NEXT_PUBLIC_APP_URL`을 실제 도메인으로 변경하세요.
