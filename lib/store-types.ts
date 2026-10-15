import type { CalcMethodId, PrayerId } from './prayer-engine'

export interface PrayerLogEntry {
  dateIso: string // YYYY-MM-DD
  prayerId: PrayerId
  status: 'on_time' | 'late' | 'jamaah' | 'missed'
  delayMinutes: number // minutes after adhan time
  khushuRating: number // 1 to 5
  loggedAt: string
}

export interface PrayerNotificationSetting {
  prayerId: PrayerId
  enabled: boolean
  preAlert15: boolean
  preAlert5: boolean
  vibration: boolean
  quranVerseAlert: boolean
}

export interface UserPreferences {
  cityId: string
  customLat?: number
  customLng?: number
  customCityNameAr?: string
  customCityNameEn?: string
  calcMethod: CalcMethodId
  madhab: 'shafi' | 'hanafi'
  muezzinId: string
  language: 'ar' | 'en'
  ramadanMode: boolean
  workScheduleStart: string // e.g. "09:00"
  workScheduleEnd: string // e.g. "17:00"
  sleepTime: string // e.g. "23:00"
  notifications: Record<PrayerId, PrayerNotificationSetting>
}

export interface PredictiveInsight {
  prayerId: PrayerId
  nameAr: string
  nameEn: string
  avgDelayMinutes: number
  onTimeRate: number
  avgKhushu: number
  optimalOffsetMinutes: number
  recommendationAr: string
  recommendationEn: string
  riskLevel: 'low' | 'medium' | 'high'
}

export interface SpiritualProgressDay {
  dateIso: string
  dayLabelAr: string
  dayLabelEn: string
  completedCount: number
  onTimeCount: number
  jamaahCount: number
  avgKhushu: number
  score: number // 0 - 100
}

export interface UserDatabaseState {
  preferences: UserPreferences
  logs: PrayerLogEntry[]
  streakDays: number
  lastSyncedAt: string
  deviceId: string
}
