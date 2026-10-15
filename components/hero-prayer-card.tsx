'use client'

import React, { useState, useEffect } from 'react'
import {
  MapPin,
  LocateFixed,
  Moon,
  Sun,
  CheckCircle2,
  Volume2,
  VolumeX,
  Compass,
  Calendar,
  Settings,
} from 'lucide-react'
import {
  CITY_PRESETS,
  CALC_METHODS,
  MUEZZIN_PROFILES,
  type ComputedPrayerDay,
  type CalcMethodId,
  type PrayerId,
} from '@/lib/prayer-engine'
import {
  playAdhanByMuezzinId,
  stopAdhanAudio,
  subscribeAdhanState,
  triggerVibration,
} from '@/lib/audio-adhan'

interface HeroPrayerCardProps {
  schedule: ComputedPrayerDay
  cityId: string
  customCityLabel?: string
  calcMethod: CalcMethodId
  muezzinId: string
  lang: 'ar' | 'en'
  onSelectCity: (cityId: string) => void
  onUseGps: () => void
  onChangeMethod: (method: CalcMethodId) => void
  onLogPrayer: (prayerId: PrayerId, status: 'on_time' | 'jamaah', khushu: number) => void
  onOpenSettings?: () => void
  gpsLoading?: boolean
}

export function HeroPrayerCard({
  schedule,
  cityId,
  customCityLabel,
  calcMethod,
  muezzinId,
  lang,
  onSelectCity,
  onUseGps,
  onChangeMethod,
  onLogPrayer,
  onOpenSettings,
  gpsLoading,
}: HeroPrayerCardProps) {
  const isAr = lang === 'ar'
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false)
  const [currentPhrase, setCurrentPhrase] = useState('')
  const [loggedBanner, setLoggedBanner] = useState<string | null>(null)

  useEffect(() => {
    return subscribeAdhanState((st) => {
      setIsPlayingAdhan(st.isPlaying)
      setCurrentPhrase(st.currentPhraseAr)
    })
  }, [])

  const currentMuezzin =
    MUEZZIN_PROFILES.find((m) => m.id === muezzinId) || MUEZZIN_PROFILES[0]

  const handleToggleAdhan = () => {
    if (isPlayingAdhan) {
      stopAdhanAudio()
    } else {
      triggerVibration([200, 100, 250])
      playAdhanByMuezzinId(currentMuezzin.id)
    }
  }

  const handleQuickLog = (status: 'on_time' | 'jamaah') => {
    onLogPrayer(schedule.nextPrayer.id, status, 5)
    setLoggedBanner(
      isAr
        ? `تقبل الله! تم تسجيل صلاة ${schedule.nextPrayer.nameAr} (${status === 'jamaah' ? 'في جماعة' : 'في الوقت'})`
        : `May Allah accept! Logged ${schedule.nextPrayer.nameEn} (${status === 'jamaah' ? 'Congregation' : 'On Time'})`
    )
    setTimeout(() => setLoggedBanner(null), 4000)
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-card shadow-xl">
      {/* Generated Islamic architectural backdrop with dark emerald gradient overlay */}
      <div className="relative min-h-[250px] w-full overflow-hidden">
        <img
          src="/images/islamic-arch-hero.png"
          alt={isAr ? 'عمارة إسلامية' : 'Islamic Architecture'}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-35 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-emerald-950/75 to-background" />

        <div className="relative z-10 flex flex-col gap-3 p-3.5 sm:p-5 text-emerald-50">
          {/* Top row: Hijri & Gregorian Date + Qibla Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>{isAr ? schedule.hijriDateAr : schedule.hijriDateEn}</span>
              <span className="text-emerald-300/60">•</span>
              <span className="text-[11px] text-emerald-100/80">
                {isAr ? schedule.gregorianAr : schedule.gregorianEn}
              </span>
            </div>

            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-900/70 px-2.5 py-0.5 text-[11px] font-medium text-emerald-200 ring-1 ring-emerald-500/30">
              <Compass className="h-3 w-3 text-amber-400" />
              <span>
                {isAr ? `القبلة ${schedule.qiblaAngle}°` : `Qibla ${schedule.qiblaAngle}°`}
              </span>
            </div>
          </div>

          {/* Location & Calculation Method Selector Row */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-950/70 p-1.5 ring-1 ring-emerald-500/30">
              <MapPin className="h-4 w-4 shrink-0 text-amber-400 ms-1" />
              <select
                aria-label={isAr ? 'اختر المدينة' : 'Select City'}
                value={cityId}
                onChange={(e) => onSelectCity(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-emerald-50 focus:outline-none"
              >
                {customCityLabel && (
                  <option value="custom" className="bg-emerald-950 text-emerald-50">
                    {customCityLabel}
                  </option>
                )}
                {CITY_PRESETS.map((city) => (
                  <option
                    key={city.id}
                    value={city.id}
                    className="bg-emerald-950 text-emerald-50"
                  >
                    {isAr
                      ? `${city.nameAr} — ${city.countryAr}`
                      : `${city.nameEn} — ${city.countryEn}`}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onUseGps}
                disabled={gpsLoading}
                title={isAr ? 'تحديد الموقع عبر GPS' : 'Detect GPS Location'}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-700/70 px-2 py-1 text-[11px] font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                <LocateFixed className={`h-3 w-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'موقعي' : 'GPS'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-950/70 p-1.5 ring-1 ring-emerald-500/30">
              <select
                aria-label={isAr ? 'طريقة الحساب الفلكي' : 'Calculation Method'}
                value={calcMethod}
                onChange={(e) => onChangeMethod(e.target.value as CalcMethodId)}
                className="w-full bg-transparent px-1 text-xs text-emerald-100 focus:outline-none"
              >
                {CALC_METHODS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-emerald-950 text-emerald-50">
                    {isAr ? m.nameAr : m.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Hero Countdown & Next Prayer Focus */}
          <div className="my-1 flex flex-col items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-emerald-900/70 via-emerald-950/85 to-emerald-900/70 p-3.5 text-center shadow-inner sm:flex-row sm:text-start">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[11px] font-medium uppercase tracking-wider text-amber-300">
                {isAr ? 'الصلاة القادمة حسب التوقيت الفلكي' : 'Upcoming Obligatory Prayer'}
              </span>
              <div className="mt-0.5 flex items-baseline gap-2">
                <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                  {isAr ? `صلاة ${schedule.nextPrayer.nameAr}` : `${schedule.nextPrayer.nameEn} Prayer`}
                </h2>
                <span dir="ltr" className="tabular-nums text-sm font-bold text-amber-300">
                  {isAr ? schedule.nextPrayer.formatted12Ar : schedule.nextPrayer.formatted12En}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-200/85">
                {isAr
                  ? `المؤذن: ${currentMuezzin.nameAr} (${currentMuezzin.countryAr})`
                  : `Muezzin: ${currentMuezzin.nameEn} (${currentMuezzin.countryEn})`}
              </p>
              {isPlayingAdhan && currentPhrase && (
                <p className="mt-1 rounded-lg bg-amber-500/20 px-2.5 py-0.5 font-serif text-xs font-bold text-amber-200 ring-1 ring-amber-400/40">
                  ﴿ {currentPhrase} ﴾
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div
                dir="ltr"
                className="rounded-xl border border-amber-400/40 bg-black/40 px-3.5 py-1.5 font-mono text-2xl font-extrabold tracking-widest text-amber-300 shadow-md sm:text-3xl"
              >
                {schedule.nextPrayer.remainingFormatted}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleAdhan}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    isPlayingAdhan
                      ? 'bg-amber-500 text-emerald-950 shadow-sm'
                      : 'bg-emerald-700/80 text-emerald-50 hover:bg-emerald-600'
                  }`}
                >
                  {isPlayingAdhan ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5" />
                      <span>{isAr ? 'إيقاف الأذان' : 'Stop Adhan'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5 text-amber-300" />
                      <span>{isAr ? 'سماع الأذان' : 'Play Adhan'}</span>
                    </>
                  )}
                </button>

                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-900/80 px-2.5 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/40 transition hover:bg-emerald-800"
                  >
                    <Settings className="h-3.5 w-3.5 text-amber-300" />
                    <span>{isAr ? 'أصوات المؤذنين' : 'Voices'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleQuickLog('jamaah')}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/40 transition hover:bg-amber-500/30"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isAr ? 'صليت جماعة' : 'Prayed Jamaah'}</span>
                </button>
              </div>
            </div>
          </div>

          {loggedBanner && (
            <div className="rounded-xl bg-emerald-500/25 px-3 py-1.5 text-center text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/50">
              {loggedBanner}
            </div>
          )}

          {/* Ramadan Imsak, Iftar & Last Third of Night Strip */}
          <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
            <div className="rounded-xl bg-emerald-950/65 p-2 ring-1 ring-emerald-500/20">
              <div className="flex items-center justify-center gap-1 text-[10px] text-amber-300">
                <Moon className="h-3 w-3" />
                <span>{isAr ? 'الإمساك' : 'Imsak'}</span>
              </div>
              <p dir="ltr" className="mt-0.5 tabular-nums text-xs font-bold text-foreground">
                {isAr ? schedule.imsak.formatted12Ar : schedule.imsak.formatted12En}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-950/65 p-2 ring-1 ring-emerald-500/20">
              <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-300">
                <Sun className="h-3 w-3" />
                <span>{isAr ? 'الإفطار (المغرب)' : 'Iftar'}</span>
              </div>
              <p dir="ltr" className="mt-0.5 tabular-nums text-xs font-bold text-foreground">
                {isAr ? schedule.iftar.formatted12Ar : schedule.iftar.formatted12En}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-950/65 p-2 ring-1 ring-emerald-500/20">
              <div className="flex items-center justify-center gap-1 text-[10px] text-amber-200">
                <Moon className="h-3 w-3" />
                <span>{isAr ? 'ثلث الليل الأخير' : 'Last 3rd Night'}</span>
              </div>
              <p dir="ltr" className="mt-0.5 tabular-nums text-xs font-bold text-foreground">
                {isAr
                  ? schedule.lastThirdOfNight.formatted12Ar
                  : schedule.lastThirdOfNight.formatted12En}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
