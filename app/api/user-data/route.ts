import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import type {
  UserDatabaseState,
  PrayerLogEntry,
  PredictiveInsight,
  SpiritualProgressDay,
} from '@/lib/store-types'
import type { PrayerId } from '@/lib/prayer-engine'

const DB_PATH = '/tmp/adan2-spiritual-db-v2.json'

function createInitialLogs(): PrayerLogEntry[] {
  const logs: PrayerLogEntry[] = []
  const prayers: PrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  const now = new Date()

  // Seed realistic 14-day prayer habit history so predictive AI & spiritual reports have rich data immediately
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateIso = d.toISOString().split('T')[0]

    prayers.forEach((prayerId, idx) => {
      // For today, leave upcoming prayers unlogged or log earlier ones
      if (i === 0 && idx > 2) return

      // Realistic user pattern: Fajr & Maghrib high khushu, Asr slightly delayed due to work hours
      const isAsr = prayerId === 'asr'
      const isFajr = prayerId === 'fajr'
      const delayMinutes = isAsr
        ? 14 + ((i * 3) % 12)
        : isFajr
          ? 6 + ((i * 2) % 8)
          : 4 + ((i + idx) % 7)

      const status: PrayerLogEntry['status'] =
        delayMinutes <= 10
          ? (i + idx) % 2 === 0
            ? 'jamaah'
            : 'on_time'
          : delayMinutes <= 22
            ? 'on_time'
            : 'late'

      const khushuRating = isFajr || prayerId === 'maghrib' ? 5 : isAsr ? 4 : 4 + ((i + idx) % 2)

      logs.push({
        dateIso,
        prayerId,
        status,
        delayMinutes,
        khushuRating: Math.min(5, khushuRating),
        loggedAt: new Date(d.getTime() + (idx + 5) * 3600 * 1000).toISOString(),
      })
    })
  }
  return logs
}

function getDefaultDatabase(): UserDatabaseState {
  return {
    preferences: {
      cityId: 'rabat',
      calcMethod: 'morocco_habous',
      madhab: 'shafi',
      muezzinId: 'morocco_rabat_habous',
      language: 'ar',
      ramadanMode: true,
      workScheduleStart: '09:00',
      workScheduleEnd: '17:00',
      sleepTime: '23:00',
      notifications: {
        fajr: {
          prayerId: 'fajr',
          enabled: true,
          preAlert15: true,
          preAlert5: true,
          vibration: true,
          quranVerseAlert: true,
        },
        dhuhr: {
          prayerId: 'dhuhr',
          enabled: true,
          preAlert15: true,
          preAlert5: true,
          vibration: true,
          quranVerseAlert: true,
        },
        asr: {
          prayerId: 'asr',
          enabled: true,
          preAlert15: true,
          preAlert5: true,
          vibration: true,
          quranVerseAlert: true,
        },
        maghrib: {
          prayerId: 'maghrib',
          enabled: true,
          preAlert15: true,
          preAlert5: true,
          vibration: true,
          quranVerseAlert: true,
        },
        isha: {
          prayerId: 'isha',
          enabled: true,
          preAlert15: true,
          preAlert5: true,
          vibration: true,
          quranVerseAlert: true,
        },
      },
    },
    logs: createInitialLogs(),
    streakDays: 12,
    lastSyncedAt: new Date().toISOString(),
    deviceId: 'adan-cloud-sync-v2',
  }
}

async function readDb(): Promise<UserDatabaseState> {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(raw) as UserDatabaseState
  } catch {
    const initial = getDefaultDatabase()
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8')
    } catch {
      // ignore write error if read-only
    }
    return initial
  }
}

async function writeDb(state: UserDatabaseState): Promise<void> {
  state.lastSyncedAt = new Date().toISOString()
  await fs.writeFile(DB_PATH, JSON.stringify(state, null, 2), 'utf-8')
}

function buildAnalytics(state: UserDatabaseState) {
  const prayerMeta: { id: PrayerId; nameAr: string; nameEn: string }[] = [
    { id: 'fajr', nameAr: 'الفجر', nameEn: 'Fajr' },
    { id: 'dhuhr', nameAr: 'الظهر', nameEn: 'Dhuhr' },
    { id: 'asr', nameAr: 'العصر', nameEn: 'Asr' },
    { id: 'maghrib', nameAr: 'المغرب', nameEn: 'Maghrib' },
    { id: 'isha', nameAr: 'العشاء', nameEn: 'Isha' },
  ]

  const predictiveInsights: PredictiveInsight[] = prayerMeta.map((p) => {
    const entries = state.logs.filter((l) => l.prayerId === p.id)
    const count = entries.length || 1
    const avgDelay = Math.round(entries.reduce((acc, e) => acc + e.delayMinutes, 0) / count)
    const onTimeCount = entries.filter((e) => e.status === 'on_time' || e.status === 'jamaah').length
    const onTimeRate = Math.round((onTimeCount / count) * 100)
    const avgKhushu =
      Math.round((entries.reduce((acc, e) => acc + e.khushuRating, 0) / count) * 10) / 10

    const optimalOffsetMinutes = Math.max(5, Math.min(20, Math.round(avgDelay * 0.75)))
    const riskLevel: 'low' | 'medium' | 'high' =
      avgDelay > 16 ? 'high' : avgDelay > 10 ? 'medium' : 'low'

    let recommendationAr = ''
    let recommendationEn = ''

    if (p.id === 'asr' && avgDelay > 12) {
      recommendationAr = `لوحظ تأخر متوسطه ${avgDelay} دقيقة بسبب ساعات العمل (${state.preferences.workScheduleStart}-${state.preferences.workScheduleEnd}). ننصح بجدولة استراحة 10 دقائق بعد الأذان بـ ${optimalOffsetMinutes} دقائق.`
      recommendationEn = `Average ${avgDelay}m delay detected during work hours. Schedule a 10m break +${optimalOffsetMinutes}m after Adhan.`
    } else if (p.id === 'fajr') {
      recommendationAr = `ثبات ممتاز في صلاة الفجر (${onTimeRate}% في الوقت). النوم الساعة ${state.preferences.sleepTime} يساعدك على الاستيقاظ قبل الأذان بـ 15 دقيقة للتهجد.`
      recommendationEn = `Strong Fajr consistency (${onTimeRate}%). Sleeping at ${state.preferences.sleepTime} supports waking 15m before Adhan.`
    } else {
      recommendationAr = `أفضل وقت شخصي لك لأداء صلاة ${p.nameAr} بأعلى خشوع (${avgKhushu}/5) هو بعد الأذان بـ ${optimalOffsetMinutes} دقائق.`
      recommendationEn = `Your optimal personal window for ${p.nameEn} with peak Khushu (${avgKhushu}/5) is +${optimalOffsetMinutes}m after Adhan.`
    }

    return {
      prayerId: p.id,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      avgDelayMinutes: avgDelay,
      onTimeRate,
      avgKhushu,
      optimalOffsetMinutes,
      recommendationAr,
      recommendationEn,
      riskLevel,
    }
  })

  // Build 14-day spiritual progress series
  const now = new Date()
  const progressDays: SpiritualProgressDay[] = []
  const arWeekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const enWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateIso = d.toISOString().split('T')[0]
    const dayLogs = state.logs.filter((l) => l.dateIso === dateIso)
    const completedCount = dayLogs.filter((l) => l.status !== 'missed').length
    const onTimeCount = dayLogs.filter((l) => l.status === 'on_time' || l.status === 'jamaah').length
    const jamaahCount = dayLogs.filter((l) => l.status === 'jamaah').length
    const avgKhushu =
      dayLogs.length > 0
        ? Math.round((dayLogs.reduce((a, b) => a + b.khushuRating, 0) / dayLogs.length) * 10) / 10
        : 4.5
    const score = Math.min(
      100,
      Math.round((completedCount / 5) * 60 + (onTimeCount / 5) * 25 + (jamaahCount / 5) * 15)
    )

    progressDays.push({
      dateIso,
      dayLabelAr: arWeekdays[d.getDay()],
      dayLabelEn: enWeekdays[d.getDay()],
      completedCount,
      onTimeCount,
      jamaahCount,
      avgKhushu,
      score,
    })
  }

  return { predictiveInsights, progressDays }
}

export async function GET() {
  const state = await readDb()
  const analytics = buildAnalytics(state)
  return NextResponse.json({
    ...state,
    ...analytics,
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const state = await readDb()

  if (body.action === 'log_prayer') {
    const entry: PrayerLogEntry = body.entry
    // Replace existing log for same date + prayerId or push new
    const idx = state.logs.findIndex(
      (l) => l.dateIso === entry.dateIso && l.prayerId === entry.prayerId
    )
    if (idx >= 0) {
      state.logs[idx] = entry
    } else {
      state.logs.push(entry)
    }
  } else if (body.action === 'update_preferences') {
    state.preferences = {
      ...state.preferences,
      ...body.preferences,
    }
  } else if (body.action === 'toggle_notification') {
    const { prayerId, patch } = body as {
      prayerId: PrayerId
      patch: Partial<UserDatabaseState['preferences']['notifications'][PrayerId]>
    }
    if (state.preferences.notifications[prayerId]) {
      state.preferences.notifications[prayerId] = {
        ...state.preferences.notifications[prayerId],
        ...patch,
      }
    }
  }

  await writeDb(state)
  const analytics = buildAnalytics(state)
  return NextResponse.json({
    ...state,
    ...analytics,
  })
}
