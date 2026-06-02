export type SubscriberStatus = 'active' | 'paused' | 'canceled'
export type CoupleStatus = 'solo' | 'paired'

export interface Subscriber {
  id: string
  email: string
  name: string
  language: string
  start_date: string
  send_day: string
  status: SubscriberStatus
  created_at: string
}

export interface Couple {
  id: string
  partner_a: string
  partner_b: string | null
  invite_token: string
  status: CoupleStatus
  created_at: string
}

export interface Progress {
  id: string
  subscriber_id: string
  week_no: number
  completed_at: string
}

export interface DailyVerse {
  ref: string
  text: string
  meditation: string
}

export interface ContentWeek {
  week_no: number
  title: string
  theme: string
  verse_ref: string
  verse_text: string
  reading: string
  personal_questions: string[]
  couple_questions: string[]
  application: string
  daily_verses?: DailyVerse[]  // 7 daily devotionals for this week
}

// Joined types for UI
export interface CoupleWithPartner {
  couple: Couple
  partner: Subscriber | null
  myProgress: Progress[]
  partnerProgress: Progress[]
}

export interface WeekStatus {
  week_no: number
  me_done: boolean
  partner_done: boolean
}
