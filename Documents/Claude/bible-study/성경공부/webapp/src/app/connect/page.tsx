import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConnectClient from './ConnectClient'
import BottomNav from '@/components/BottomNav'

export default async function ConnectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: couple } = await supabase
    .from('couples')
    .select('*, partner_b_info:subscribers!couples_partner_b_fkey(name,email)')
    .eq('partner_a', user!.id)
    .maybeSingle()

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('name')
    .eq('id', user!.id)
    .single()

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 md:pb-0 md:pl-60">
      <ConnectClient
        couple={couple}
        myName={subscriber?.name ?? ''}
        appUrl={process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}
      />
      <BottomNav />
    </div>
  )
}
