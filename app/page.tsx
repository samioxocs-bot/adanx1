'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import {
  Moon,
  Sun,
  Globe,
  Clock,
  BookOpen,
  Sparkles,
  Hand,
  CloudSun,
  Compass,
  Settings,
  Trophy,
  ShieldAlert,
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
import { QuranReader } from '@/components/quran-reader'
import { AdhkarSection } from '@/components/adhkar-section'
import { ElectronicTasbih } from '@/components/electronic-tasbih'
import { WeatherSection } from '@/components/weather-section'
import { QiblaCalendarFiqh } from '@/components/qibla-calendar-fiqh'
import { SettingsPanel } from '@/components/settings-panel'
import { UnsurNabiyakQuiz } from '@/components/unsur-nabiyak-quiz'
import { TongueGuardian } from '@/components/tongue-guardian'
import { PayPalSupportBar } from '@/components/paypal-support-bar'

type ApiUserResponse = UserDatabaseState & {
  predictiveInsights: PredictiveInsight[]
  progressDays: SpiritualProgressDay[]
}

export type AppSectionTab =
  | 'prayers'
  | 'quran'
  | 'unsur-nabiyak'
  | 'tongue-guardian'
  | 'adhkar'
  | 'tasbih'
  | 'weather'
  | 'qibla'
  | 'settings'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Adan2AppPage() {
  const { data, mutate } = useSWR<ApiUserResponse>('/api/user-data', fetcher)

  const [activeTab, setActiveTab] = useState<AppSectionTab>('prayers')
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
  const [lastTriggeredAlertKey, setLastTriggeredAlertKey] = useState<
    string | null
  >(null)

  // Live 1-second astronomical countdown ticker
  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load persisted theme and offline preferences from localStorage first
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('adan2_theme')
      if (savedTheme === 'light') {
        setIsDark(false)
      } else if (savedTheme === 'dark') {
        setIsDark(true)
      }
      const savedCity = localStorage.getItem('adan2_city_id')
      if (savedCity && CITY_PRESETS.some((c) => c.id === savedCity)) {
        setCityId(savedCity)
      }
      const savedMuezzin = localStorage.getItem('adan2_muezzin_id')
      if (savedMuezzin) {
        setMuezzinId(savedMuezzin)
      }
    } catch {
      // ignore
    }
  }, [])

  // Sync preferences when server data arrives
  useEffect(() => {
    if (data?.preferences) {
      if (
        data.preferences.cityId &&
        CITY_PRESETS.some((c) => c.id === data.preferences.cityId)
      ) {
        setCityId(data.preferences.cityId)
      }
      setCalcMethod(data.preferences.calcMethod || 'morocco_habous')
      setMadhab(data.preferences.madhab || 'shafi')
      if (data.preferences.muezzinId) {
        setMuezzinId(data.preferences.muezzinId)
      }
      setLang(data.preferences.language || 'ar')
    }
  }, [data?.preferences])

  // Apply Dark/Light theme and RTL/LTR direction on document root & persist
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
    try {
      localStorage.setItem('adan2_theme', isDark ? 'dark' : 'light')
    } catch {
      // ignore
    }
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
    now || new Date('2026-10-15T14:00:00Z'),
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
          ? `حان الآن موعد أذان ${nextP.nameAr} حسب التوقيت المحلي لمدينة ${selectedPreset.nameAr}`
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
    selectedPreset.nameAr,
  ])

  const handleSelectCity = async (newCityId: string) => {
    setCityId(newCityId)
    try {
      localStorage.setItem('adan2_city_id', newCityId)
    } catch {
      // ignore
    }
    const preset = CITY_PRESETS.find((c) => c.id === newCityId)
    if (preset) {
      setCalcMethod(preset.method)
    }
    try {
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
    } catch {
      // Works offline via local state + localStorage
    }
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
            ? 'تعذر الوصول لخدمة الموقع، تم اعتماد توقيت الرباط (وزارة الأوقاف المغربية) افتراضياً'
            : 'GPS permission unavailable; using Rabat coordinates.'
        )
        setTimeout(() => setToastAlert(null), 3500)
      },
      { timeout: 6000 }
    )
  }

  const handleChangeMethod = async (newMethod: CalcMethodId) => {
    setCalcMethod(newMethod)
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_preferences',
          preferences: { calcMethod: newMethod },
        }),
      })
      mutate()
    } catch {
      // ignore offline
    }
  }

  const handleChangeMadhab = async (newMadhab: 'shafi' | 'hanafi') => {
    setMadhab(newMadhab)
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_preferences',
          preferences: { madhab: newMadhab },
        }),
      })
      mutate()
    } catch {
      // ignore offline
    }
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
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_prayer',
          entry,
        }),
      })
      mutate()
    } catch {
      // ignore offline
    }
  }

  const handleToggleNotification = async (
    prayerId: PrayerId,
    patch: Partial<PrayerNotificationSetting>
  ) => {
    try {
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
    } catch {
      // ignore offline
    }
  }

  const handleSelectMuezzin = async (id: string) => {
    setMuezzinId(id)
    try {
      localStorage.setItem('adan2_muezzin_id', id)
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_preferences',
          preferences: { muezzinId: id },
        }),
      })
      mutate()
    } catch {
      // ignore offline
    }
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

  const navTabs: {
    id: AppSectionTab
    labelAr: string
    labelEn: string
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { id: 'prayers', labelAr: 'المواقيت', labelEn: 'Prayers', icon: Clock },
    { id: 'quran', labelAr: 'القرآن الكريم', labelEn: 'Quran', icon: BookOpen },
    {
      id: 'unsur-nabiyak',
      labelAr: 'انصر نبيك',
      labelEn: 'Prophet Quiz',
      icon: Trophy,
    },
    {
      id: 'tongue-guardian',
      labelAr: 'حارس اللسان',
      labelEn: 'Tongue Guard',
      icon: ShieldAlert,
    },
    { id: 'adhkar', labelAr: 'الأذكار', labelEn: 'Adhkar', icon: Sparkles },
    { id: 'tasbih', labelAr: 'المسبحة', labelEn: 'Tasbih', icon: Hand },
    { id: 'weather', labelAr: 'الطقس', labelEn: 'Weather', icon: CloudSun },
    { id: 'qibla', labelAr: 'القبلة والفقه', labelEn: 'Qibla', icon: Compass },
    {
      id: 'settings',
      labelAr: 'الأذان والإعدادات',
      labelEn: 'Adhan & Settings',
      icon: Settings,
    },
  ]

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

      {/* 1.5 Slow Scrolling PayPal Support Ticker */}
      <PayPalSupportBar lang={lang} />

      {/* 2. Clean Header Bar (No duplicate buttons) */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-serif text-base font-bold leading-none text-foreground sm:text-lg">
                {isAr
                  ? 'أذان المغرب والقرآن الكريم'
                  : 'Morocco Adhan & Noble Quran'}
              </h1>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {isAr
                  ? 'مواقيت وزارة الأوقاف المغربية • القرآن والأذكار والمسبحة بدون إنترنت'
                  : 'Morocco Ministry of Habous • Offline Quran, Adhkar & Tasbih'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground transition hover:bg-secondary"
              aria-label="Toggle language"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground transition hover:bg-secondary"
              aria-label={
                isAr ? 'تبديل الوضع الليلي والنهاري' : 'Toggle theme'
              }
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline">
                    {isAr ? 'الوضع النهاري' : 'Light'}
                  </span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">
                    {isAr ? 'الوضع الليلي' : 'Dark'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Optional Toast Banner */}
      {toastAlert && (
        <div className="mx-auto mt-2 max-w-5xl px-3 w-full">
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-sm">
            {toastAlert}
          </div>
        </div>
      )}

      {/* 3. Main Content Container */}
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-3 py-3.5 pb-16">
        {/* Hero Countdown & Moroccan City Selector */}
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
          gpsLoading={gpsLoading}
        />

        {/* Unified 9-Section Navigation Bar */}
        <nav
          aria-label={isAr ? 'أقسام التطبيق' : 'App sections'}
          className="grid grid-cols-3 gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-sm sm:grid-cols-5 lg:grid-cols-9"
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[11px] sm:text-xs font-bold transition ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {isAr ? tab.labelAr : tab.labelEn}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Active Section */}
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

        {activeTab === 'quran' && <QuranReader lang={lang} />}

        {activeTab === 'unsur-nabiyak' && <UnsurNabiyakQuiz />}

        {activeTab === 'tongue-guardian' && <TongueGuardian />}

        {activeTab === 'adhkar' && <AdhkarSection lang={lang} />}

        {activeTab === 'tasbih' && <ElectronicTasbih lang={lang} />}

        {activeTab === 'weather' && (
          <WeatherSection
            cityId={cityId}
            customCoords={customCoords}
            lang={lang}
            onSelectCity={handleSelectCity}
          />
        )}

        {activeTab === 'qibla' && (
          <QiblaCalendarFiqh
            schedule={schedule}
            lang={lang}
            lastSyncedAt={data?.lastSyncedAt || '2026-10-15T14:00:00.000Z'}
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
      </main>
    </div>
  )
}
