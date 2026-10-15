'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import {
  Moon,
  Sun,
  Globe,
  Clock,
  BrainCircuit,
  Compass,
  Sparkles,
  Settings,
} from 'lucide-react'
import {
  CITY_PRESETS,
  computePrayerSchedule,
  type CalcMethodId,
  type PrayerId,
} from '@/lib/prayer-engine'
import type {
  UserDatabaseState,
  PredictiveInsight,
  SpiritualProgressDay,
  PrayerNotificationSetting,
} from '@/lib/store-types'
import {
  playPrePrayerChime,
  playAdhanByMuezzinId,
  triggerVibration,
} from '@/lib/audio-adhan'
import { PrayerTicker } from '@/components/prayer-ticker'
import { HeroPrayerCard } from '@/components/hero-prayer-card'
import { PrayerTimesList } from '@/components/prayer-times-list'
import { AiSpiritualCoach } from '@/components/ai-spiritual-coach'
import { QiblaCalendarFiqh } from '@/components/qibla-calendar-fiqh'
import { SettingsPanel } from '@/components/settings-panel'

type ApiUserResponse = UserDatabaseState & {
  predictiveInsights: PredictiveInsight[]
  progressDays: SpiritualProgressDay[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Adan2AppPage() {
  const { data, mutate } = useSWR<ApiUserResponse>('/api/user-data', fetcher)

  const [activeTab, setActiveTab] = useState<
    'prayers' | 'ai' | 'qibla' | 'settings'
  >('prayers')
  const [isDark, setIsDark] = useState(true)
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [cityId, setCityId] = useState('rabat')
  const [customCoords, setCustomCoords] = useState<{
    lat: number
    lng: number
    label: string
  } | null>(null)
  const [calcMethod, setCalcMethod] = useState<CalcMethodId>('morocco_habous')
  const [madhab, setMadhab] = useState<'shafi' | 'hanafi'>('shafi')
  const [muezzinId, setMuezzinId] = useState('morocco_rabat_habous')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [now, setNow] = useState<Date | null>(null)
  const [toastAlert, setToastAlert] = useState<string | null>(null)
  const [lastTriggeredAlertKey, setLastTriggeredAlertKey] = useState<string | null>(null)

  // Live 1-second astronomical countdown ticker (client-hydrated)
  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Sync initial preferences when server data arrives
  useEffect(() => {
    if (data?.preferences) {
      setCityId(data.preferences.cityId || 'rabat')
      setCalcMethod(data.preferences.calcMethod || 'morocco_habous')
      setMadhab(data.preferences.madhab || 'shafi')
      setMuezzinId(data.preferences.muezzinId || 'morocco_rabat_habous')
      setLang(data.preferences.language || 'ar')
    }
  }, [data?.preferences])

  // Apply Dark/Light theme and RTL/LTR direction on document root
  useEffect(() => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }
    html.dir = lang === 'ar' ? 'rtl' : 'ltr'
    html.lang = lang
  }, [isDark, lang])

  const selectedPreset =
    CITY_PRESETS.find((c) => c.id === cityId) || CITY_PRESETS[0]
  const activeLat =
    cityId === 'custom' && customCoords ? customCoords.lat : selectedPreset.lat
  const activeLng =
    cityId === 'custom' && customCoords ? customCoords.lng : selectedPreset.lng

  const schedule = computePrayerSchedule(
    activeLat,
    activeLng,
    calcMethod,
    madhab,
    now || new Date('2026-10-14T14:00:00Z'),
    selectedPreset.timeZone
  )

  const isAr = lang === 'ar'

  // Automatic real-time pre-Adhan (15m / 5m) and Adhan time alert trigger
  useEffect(() => {
    if (!now) return
    const nextP = schedule.nextPrayer
    const notif = data?.preferences?.notifications?.[nextP.id]
    if (notif && !notif.enabled) return

    const rem = nextP.remainingSeconds
    let triggerType: 'pre15' | 'pre5' | 'now' | null = null
    if (rem === 15 * 60 && (notif?.preAlert15 ?? true)) {
      triggerType = 'pre15'
    } else if (rem === 5 * 60 && (notif?.preAlert5 ?? true)) {
      triggerType = 'pre5'
    } else if (rem === 1) {
      triggerType = 'now'
    }

    if (!triggerType) return
    const alertKey = `${schedule.dateIso}-${nextP.id}-${triggerType}`
    if (lastTriggeredAlertKey === alertKey) return

    setLastTriggeredAlertKey(alertKey)
    if (notif?.vibration ?? true) {
      triggerVibration([200, 100, 200])
    }

    if (triggerType === 'now') {
      playAdhanByMuezzinId(muezzinId)
      setToastAlert(
        isAr
          ? `حان الآن موعد أذان ${nextP.nameAr} حسب التوقيت المحلي`
          : `It is now time for ${nextP.nameEn} Adhan`
      )
    } else {
      const mins = triggerType === 'pre15' ? 15 : 5
      playPrePrayerChime(mins)
      setToastAlert(
        isAr
          ? `تنبيه استباقي: متبقٍ ${mins} دقائق على أذان ${nextP.nameAr}`
          : `Reminder: ${mins} minutes remaining until ${nextP.nameEn} Adhan`
      )
    }
    const t = setTimeout(() => setToastAlert(null), 6000)
    return () => clearTimeout(t)
  }, [
    now,
    schedule.dateIso,
    schedule.nextPrayer,
    data?.preferences?.notifications,
    lastTriggeredAlertKey,
    muezzinId,
    isAr,
  ])

  const handleSelectCity = async (newCityId: string) => {
    setCityId(newCityId)
    const preset = CITY_PRESETS.find((c) => c.id === newCityId)
    if (preset) {
      setCalcMethod(preset.method)
    }
    await fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_preferences',
        preferences: {
          cityId: newCityId,
          calcMethod: preset ? preset.method : calcMethod,
        },
      }),
    })
    mutate()
  }

  const handleUseGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomCoords({
          lat: Math.round(pos.coords.latitude * 1000) / 1000,
          lng: Math.round(pos.coords.longitude * 1000) / 1000,
          label: isAr
            ? `موقعي الجغرافي (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`
            : `My GPS (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`,
        })
        setCityId('custom')
        setGpsLoading(false)
      },
      () => {
        setGpsLoading(false)
        setToastAlert(
          isAr
            ? 'تعذر الوصول لخدمة الموقع، تم اعتماد الرباط (وزارة الأوقاف المغربية) افتراضياً'
            : 'GPS permission unavailable; using Rabat coordinates.'
        )
        setTimeout(() => setToastAlert(null), 3500)
      },
      { timeout: 6000 }
    )
  }

  const handleChangeMethod = async (newMethod: CalcMethodId) => {
    setCalcMethod(newMethod)
    await fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_preferences',
        preferences: { calcMethod: newMethod },
      }),
    })
    mutate()
  }

  const handleChangeMadhab = async (newMadhab: 'shafi' | 'hanafi') => {
    setMadhab(newMadhab)
    await fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_preferences',
        preferences: { madhab: newMadhab },
      }),
    })
    mutate()
  }

  const handleLogPrayer = async (
    prayerId: PrayerId,
    status: 'on_time' | 'jamaah' | 'late',
    khushuRating: number
  ) => {
    const entry = {
      dateIso: schedule.dateIso,
      prayerId,
      status,
      delayMinutes: status === 'jamaah' ? 4 : status === 'on_time' ? 8 : 24,
      khushuRating,
      loggedAt: new Date().toISOString(),
    }
    await fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'log_prayer',
        entry,
      }),
    })
    mutate()
  }

  const handleToggleNotification = async (
    prayerId: PrayerId,
    patch: Partial<PrayerNotificationSetting>
  ) => {
    await fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle_notification',
        prayerId,
        patch,
      }),
    })
    mutate()
  }

  const handleSelectMuezzin = async (id: string) => {
    setMuezzinId(id)
    await fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_preferences',
        preferences: { muezzinId: id },
      }),
    })
    mutate()
  }

  const defaultNotifications: Record<PrayerId, PrayerNotificationSetting> = {
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
  }

  return (
    <div className="min-h-screen bg-background text-foreground islamic-pattern-bg flex flex-col">
      {/* 1. Dynamic Top Prayer Ticker */}
      <PrayerTicker
        schedule={schedule}
        lang={lang}
        onTestAlert={(mins) => {
          setToastAlert(
            isAr
              ? `تنبيه صوتي تجريبي: متبقٍ ${mins} دقائق على أذان ${schedule.nextPrayer.nameAr} — ﴿ حَافِظُوا عَلَى الصَّلَوَاتِ ﴾`
              : `Audio Alert Preview: ${mins} minutes until ${schedule.nextPrayer.nameEn} Adhan`
          )
          setTimeout(() => setToastAlert(null), 4500)
        }}
      />

      {/* 2. App Header Bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-amber-300 shadow-sm ring-1 ring-amber-400/40">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-serif text-base font-bold leading-none text-foreground sm:text-lg">
                {isAr ? 'أذان ٢ الذكي' : 'Adan 2 AI'}
              </h1>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {isAr
                  ? 'مواقيت وزارة الأوقاف المغربية • أصوات مغاربية وعالمية'
                  : 'Morocco Habous API • Maghrebi & World Adhan Voices'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
                activeTab === 'settings'
                  ? 'border-amber-400/50 bg-emerald-700 text-white'
                  : 'border-border bg-card text-foreground hover:bg-secondary'
              }`}
            >
              <Settings className="h-3.5 w-3.5 text-amber-400" />
              <span>{isAr ? 'الإعدادات والأصوات' : 'Settings'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
              aria-label="Toggle language"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card p-1.5 text-foreground transition hover:bg-secondary"
              aria-label={
                isAr ? 'تبديل الوضع الليلي والنهاري' : 'Toggle theme'
              }
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-emerald-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Optional Toast Banner for Pre-Adhan Audio Alert Preview */}
      {toastAlert && (
        <div className="mx-auto mt-2 max-w-4xl px-3">
          <div className="rounded-xl border border-amber-400/50 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300 shadow-sm">
            {toastAlert}
          </div>
        </div>
      )}

      {/* 3. Main Content Container */}
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-3 py-3.5 pb-16">
        {/* Hero Countdown & Ramadan Imsak/Iftar Card */}
        <HeroPrayerCard
          schedule={schedule}
          cityId={cityId}
          customCityLabel={customCoords?.label}
          calcMethod={calcMethod}
          muezzinId={muezzinId}
          lang={lang}
          onSelectCity={handleSelectCity}
          onUseGps={handleUseGps}
          onChangeMethod={handleChangeMethod}
          onLogPrayer={handleLogPrayer}
          onOpenSettings={() => setActiveTab('settings')}
          gpsLoading={gpsLoading}
        />

        {/* Segmented Navigation Tabs (4 Tabs including Settings & Voices) */}
        <nav
          aria-label={isAr ? 'أقسام التطبيق' : 'App sections'}
          className="grid grid-cols-4 gap-1 rounded-2xl border border-border bg-card/90 p-1 shadow-sm"
        >
          <button
            type="button"
            onClick={() => setActiveTab('prayers')}
            className={`flex items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] sm:text-xs font-bold transition ${
              activeTab === 'prayers'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{isAr ? 'المواقيت' : 'Prayers'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] sm:text-xs font-bold transition ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-3.5 w-3.5 shrink-0" />
            <span>{isAr ? 'الإعدادات والأصوات' : 'Voices & API'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] sm:text-xs font-bold transition ${
              activeTab === 'ai'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BrainCircuit className="h-3.5 w-3.5 shrink-0" />
            <span>{isAr ? 'الذكاء الروحي' : 'AI Coach'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qibla')}
            className={`flex items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] sm:text-xs font-bold transition ${
              activeTab === 'qibla'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Compass className="h-3.5 w-3.5 shrink-0" />
            <span>{isAr ? 'القبلة والفقه' : 'Qibla & Fiqh'}</span>
          </button>
        </nav>

        {/* Active Tab Section */}
        {activeTab === 'prayers' && (
          <PrayerTimesList
            schedule={schedule}
            logs={data?.logs || []}
            notifications={
              data?.preferences?.notifications || defaultNotifications
            }
            insights={data?.predictiveInsights || []}
            lang={lang}
            onLogPrayer={handleLogPrayer}
            onToggleNotification={handleToggleNotification}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            cityId={cityId}
            calcMethod={calcMethod}
            madhab={madhab}
            muezzinId={muezzinId}
            lang={lang}
            notifications={
              data?.preferences?.notifications || defaultNotifications
            }
            onSelectCity={handleSelectCity}
            onChangeMethod={handleChangeMethod}
            onChangeMadhab={handleChangeMadhab}
            onSelectMuezzin={handleSelectMuezzin}
            onToggleNotification={handleToggleNotification}
          />
        )}

        {activeTab === 'ai' && (
          <AiSpiritualCoach
            insights={data?.predictiveInsights || []}
            progressDays={data?.progressDays || []}
            streakDays={data?.streakDays || 12}
            lang={lang}
          />
        )}

        {activeTab === 'qibla' && (
          <QiblaCalendarFiqh
            schedule={schedule}
            muezzinId={muezzinId}
            lang={lang}
            onSelectMuezzin={handleSelectMuezzin}
            lastSyncedAt={data?.lastSyncedAt || '2026-10-14T14:00:00.000Z'}
          />
        )}
      </main>
    </div>
  )
}
