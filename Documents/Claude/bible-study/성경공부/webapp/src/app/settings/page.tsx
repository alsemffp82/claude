import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const uid = user!.id

  const { data: subscriber } = await supabase
    .from('subscribers').select('*').eq('id', uid).single()

  const { data: couple } = await supabase
    .from('couples').select('status, invite_token')
    .or(`partner_a.eq.${uid},partner_b.eq.${uid}`)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 md:pb-0 md:pl-60">
      <SettingsClient
        subscriber={subscriber}
        coupleStatus={couple?.status ?? 'solo'}
        inviteToken={couple?.invite_token ?? ''}
      />
      <BottomNav />
    </div>
  )
}
