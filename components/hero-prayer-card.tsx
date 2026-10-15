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
} from 'lucide-react'
import {
  CITY_PRESETS,
  MOROCCO_REGIONS_ORDER,
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
  onLogPrayer: (
    prayerId: PrayerId,
    status: 'on_time' | 'jamaah',
    khushu: number
  ) => void
  onOpenSettings?: () => void
  gpsLoading?: boolean
}

export function HeroPrayerCard({
  schedule,
  cityId,
  customCityLabel,
  muezzinId,
  lang,
  onSelectCity,
  onUseGps,
  onLogPrayer,
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
  const currentCity =
    CITY_PRESETS.find((c) => c.id === cityId) || CITY_PRESETS[0]

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
        ? `تقبل الله طاعتكم! تم تسجيل صلاة ${schedule.nextPrayer.nameAr} (${status === 'jamaah' ? 'في جماعة' : 'في الوقت'})`
        : `May Allah accept! Logged ${schedule.nextPrayer.nameEn}`
    )
    setTimeout(() => setLoggedBanner(null), 4000)
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-md">
      <div className="relative w-full overflow-hidden p-4 sm:p-5 space-y-3.5">
        {/* Top row: Hijri & Gregorian Date + Qibla Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-primary">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span>{isAr ? schedule.hijriDateAr : schedule.hijriDateEn}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {isAr ? schedule.gregorianAr : schedule.gregorianEn}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-secondary-foreground">
            <Compass className="h-3 w-3 text-amber-500" />
            <span>
              {isAr
                ? `اتجاه القبلة: ${schedule.qiblaAngle}°`
                : `Qibla: ${schedule.qiblaAngle}°`}
            </span>
          </div>
        </div>

        {/* Moroccan City Selector (All 70+ Cities across 12 Regions) + GPS */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-secondary/50 p-2">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <MapPin className="h-4 w-4 shrink-0 text-primary ms-1" />
            <div className="w-full">
              <span className="block text-[10px] font-semibold text-muted-foreground">
                {isAr
                  ? 'المدينة المغربية المعتمدة (توقيت وزارة الأوقاف والشؤون الإسلامية):'
                  : 'Moroccan City (Ministry of Habous Official Timing):'}
              </span>
              <select
                aria-label={isAr ? 'اختر المدينة المغربية' : 'Select Moroccan City'}
                value={cityId}
                onChange={(e) => onSelectCity(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-foreground focus:outline-none"
              >
                {customCityLabel && (
                  <option value="custom" className="bg-card text-foreground">
                    {customCityLabel}
                  </option>
                )}
                {MOROCCO_REGIONS_ORDER.map((regionName) => (
                  <optgroup
                    key={regionName}
                    label={`جهة ${regionName}`}
                    className="bg-card text-foreground font-bold"
                  >
                    {CITY_PRESETS.filter((c) => c.regionAr === regionName).map(
                      (city) => (
                        <option
                          key={city.id}
                          value={city.id}
                          className="bg-card text-foreground"
                        >
                          {isAr
                            ? `${city.nameAr} — (${city.regionAr})`
                            : `${city.nameEn} — (${city.regionAr})`}
                        </option>
                      )
                    )}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={onUseGps}
            disabled={gpsLoading}
            title={isAr ? 'تحديد الموقع عبر GPS' : 'Detect GPS Location'}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
          >
            <LocateFixed
              className={`h-3.5 w-3.5 ${gpsLoading ? 'animate-spin' : ''}`}
            />
            <span>{isAr ? 'تحديد موقعي' : 'GPS'}</span>
          </button>
        </div>

        {/* Center Hero Countdown & Next Prayer Focus */}
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/12 via-card to-amber-500/10 p-4 text-center shadow-sm sm:flex-row sm:text-start">
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-[11px] font-bold text-primary">
              {isAr
                ? `الصلاة القادمة في ${customCityLabel || currentCity.nameAr}`
                : `Upcoming Prayer in ${customCityLabel || currentCity.nameEn}`}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2.5">
              <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                {isAr
                  ? `صلاة ${schedule.nextPrayer.nameAr}`
                  : `${schedule.nextPrayer.nameEn} Prayer`}
              </h2>
              <span
                dir="ltr"
                className="tabular-nums text-base font-extrabold text-amber-600 dark:text-amber-400"
              >
                {isAr
                  ? schedule.nextPrayer.formatted12Ar
                  : schedule.nextPrayer.formatted12En}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {isAr
                ? `صوت الأذان المختار: ${currentMuezzin.nameAr}`
                : `Adhan Voice: ${currentMuezzin.nameEn}`}
            </p>
            {isPlayingAdhan && currentPhrase && (
              <p className="mt-1.5 rounded-lg bg-amber-500/15 px-2.5 py-1 font-serif text-xs font-bold text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30">
                ﴿ {currentPhrase} ﴾
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              dir="ltr"
              className="rounded-xl border border-primary/30 bg-secondary/80 px-4 py-1.5 font-mono text-2xl font-extrabold tracking-widest text-foreground shadow-sm sm:text-3xl"
            >
              {schedule.nextPrayer.remainingFormatted}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleAdhan}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                  isPlayingAdhan
                    ? 'bg-amber-500 text-emerald-950'
                    : 'bg-primary text-primary-foreground hover:opacity-95'
                }`}
              >
                {isPlayingAdhan ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    <span>{isAr ? 'إيقاف الأذان' : 'Stop Adhan'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{isAr ? 'سماع الأذان' : 'Play Adhan'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleQuickLog('jamaah')}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground transition hover:bg-secondary"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>{isAr ? 'صليت جماعة' : 'Prayed Jamaah'}</span>
              </button>
            </div>
          </div>
        </div>

        {loggedBanner && (
          <div className="rounded-xl bg-primary/15 px-3 py-1.5 text-center text-xs font-bold text-primary ring-1 ring-primary/30">
            {loggedBanner}
          </div>
        )}

        {/* Ramadan Imsak, Iftar & Last Third of Night Strip */}
        <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
          <div className="rounded-xl border border-border bg-secondary/40 p-2">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground">
              <Moon className="h-3 w-3 text-amber-500" />
              <span>{isAr ? 'الإمساك' : 'Imsak'}</span>
            </div>
            <p
              dir="ltr"
              className="mt-0.5 tabular-nums text-xs font-extrabold text-foreground"
            >
              {isAr ? schedule.imsak.formatted12Ar : schedule.imsak.formatted12En}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-secondary/40 p-2">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground">
              <Sun className="h-3 w-3 text-primary" />
              <span>{isAr ? 'الإفطار (المغرب)' : 'Iftar'}</span>
            </div>
            <p
              dir="ltr"
              className="mt-0.5 tabular-nums text-xs font-extrabold text-foreground"
            >
              {isAr ? schedule.iftar.formatted12Ar : schedule.iftar.formatted12En}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-secondary/40 p-2">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground">
              <Moon className="h-3 w-3 text-amber-500" />
              <span>{isAr ? 'ثلث الليل الأخير' : 'Last 3rd Night'}</span>
            </div>
            <p
              dir="ltr"
              className="mt-0.5 tabular-nums text-xs font-extrabold text-foreground"
            >
              {isAr
                ? schedule.lastThirdOfNight.formatted12Ar
                : schedule.lastThirdOfNight.formatted12En}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
