'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import {
  Volume2,
  VolumeX,
  Check,
  Radio,
  Building2,
  Sliders,
  BellRing,
  Sparkles,
  RefreshCw,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import {
  MUEZZIN_PROFILES,
  CALC_METHODS,
  CITY_PRESETS,
  MOROCCO_REGIONS_ORDER,
  type CalcMethodId,
  type PrayerId,
} from '@/lib/prayer-engine'
import type { PrayerNotificationSetting } from '@/lib/store-types'
import {
  playAdhanByMuezzinId,
  stopAdhanAudio,
  subscribeAdhanState,
  setAdhanVolume,
  playPrePrayerChime,
  triggerVibration,
  type AdhanPlaybackState,
} from '@/lib/audio-adhan'

interface HabousApiResponse {
  status: string
  source: string
  sourceUrl: string
  ministryParams: {
    fajrAngle: number
    ishaAngle: number
    madhab: string
    habousVilleCode: number
  }
  city: {
    id: string
    habousVilleCode: number
    nameAr: string
    nameEn: string
    regionAr: string
    lat: number
    lng: number
  }
  timings: {
    imsak: string
    fajr: string
    sunrise: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    lastThird: string
  }
  hijri: {
    fullAr: string
  }
  citiesList: {
    id: string
    habousVilleCode: number
    nameAr: string
    nameEn: string
    regionAr: string
  }[]
  syncedAt: string
}

interface SettingsPanelProps {
  cityId: string
  calcMethod: CalcMethodId
  madhab: 'shafi' | 'hanafi'
  muezzinId: string
  lang: 'ar' | 'en'
  notifications: Record<PrayerId, PrayerNotificationSetting>
  onSelectCity: (cityId: string) => void
  onChangeMethod: (method: CalcMethodId) => void
  onChangeMadhab: (madhab: 'shafi' | 'hanafi') => void
  onSelectMuezzin: (id: string) => void
  onToggleNotification: (
    prayerId: PrayerId,
    patch: Partial<PrayerNotificationSetting>
  ) => void
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function SettingsPanel({
  cityId,
  calcMethod,
  madhab,
  muezzinId,
  lang,
  notifications,
  onSelectCity,
  onChangeMethod,
  onChangeMadhab,
  onSelectMuezzin,
  onToggleNotification,
}: SettingsPanelProps) {
  const isAr = lang === 'ar'
  const [habousCity, setHabousCity] = useState<string>(() => {
    const preset = CITY_PRESETS.find((c) => c.id === cityId)
    return preset?.habousCityKey || 'rabat'
  })
  const [audioState, setAudioState] = useState<AdhanPlaybackState>({
    isPlaying: false,
    muezzinId: null,
    currentTime: 0,
    duration: 0,
    volume: 0.95,
    mode: 'idle',
    currentPhraseAr: '',
    offlineCachedCount: 5,
    isOfflineReady: true,
  })

  useEffect(() => {
    return subscribeAdhanState(setAudioState)
  }, [])

  useEffect(() => {
    const preset = CITY_PRESETS.find((c) => c.id === cityId)
    if (preset?.habousCityKey) {
      setHabousCity(preset.habousCityKey)
    }
  }, [cityId])

  const {
    data: habousData,
    isLoading: habousLoading,
    mutate: refreshHabous,
  } = useSWR<HabousApiResponse>(
    `/api/morocco-habous?city=${encodeURIComponent(habousCity)}`,
    fetcher
  )

  const activeMuezzin =
    MUEZZIN_PROFILES.find((m) => m.id === muezzinId) || MUEZZIN_PROFILES[0]

  const playingProfile = audioState.muezzinId
    ? MUEZZIN_PROFILES.find((m) => m.id === audioState.muezzinId)
    : null

  const handlePlayStopMuezzin = (id: string) => {
    if (audioState.isPlaying && audioState.muezzinId === id) {
      stopAdhanAudio()
    } else {
      triggerVibration([150, 80, 150])
      onSelectMuezzin(id)
      playAdhanByMuezzinId(id)
    }
  }

  const handleApplyHabousCity = (targetCityId: string) => {
    setHabousCity(targetCityId)
    onSelectCity(targetCityId)
    onChangeMethod('morocco_habous')
  }

  return (
    <section className="space-y-4">
      {/* 1. 5 Selected Offline Adhan Voices & Audio Controller */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                audioState.isPlaying
                  ? 'border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-300 animate-pulse'
                  : 'border-primary/30 bg-primary/15 text-primary'
              }`}
            >
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-sm font-bold text-foreground sm:text-base">
                  {isAr
                    ? 'الأصوات الخمسة المختارة للأذان (تعمل بدون إنترنت)'
                    : '5 Curated Offline Adhan Voices'}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  {isAr
                    ? `متاحة محلياً (${audioState.offlineCachedCount}/5)`
                    : `Offline Ready (${audioState.offlineCachedCount}/5)`}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isAr
                  ? `الصوت المعتمد حالياً: ${activeMuezzin.nameAr}`
                  : `Selected Adhan: ${activeMuezzin.nameEn}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handlePlayStopMuezzin(activeMuezzin.id)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm ${
              audioState.isPlaying
                ? 'bg-amber-500 text-emerald-950 hover:bg-amber-400'
                : 'bg-primary text-primary-foreground hover:opacity-95'
            }`}
          >
            {audioState.isPlaying ? (
              <>
                <VolumeX className="h-4 w-4" />
                <span>{isAr ? 'إيقاف صوت الأذان' : 'Stop Adhan'}</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                <span>
                  {isAr ? 'تشغيل الأذان المختار' : 'Play Selected Adhan'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Live Adhan Words & Progress Bar when playing */}
        {audioState.isPlaying && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300">
              <span>
                {playingProfile
                  ? isAr
                    ? `${playingProfile.nameAr} (${playingProfile.mosqueAr})`
                    : playingProfile.nameEn
                  : ''}
              </span>
              <span dir="ltr" className="tabular-nums">
                {audioState.currentTime}s / {audioState.duration || 45}s
              </span>
            </div>
            <p className="font-serif text-center text-base font-bold text-foreground py-1">
              ﴿ {audioState.currentPhraseAr} ﴾
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      8,
                      ((audioState.currentTime || 1) /
                        (audioState.duration || 45)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Volume Slider & Pre-Adhan Chime Test */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Volume2 className="h-4 w-4 text-primary shrink-0" />
            <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
              {isAr ? 'مستوى صوت الأذان:' : 'Adhan Volume:'}
            </span>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={audioState.volume}
              onChange={(e) => setAdhanVolume(parseFloat(e.target.value))}
              className="w-full max-w-[160px] accent-emerald-600"
              aria-label={isAr ? 'مستوى صوت الأذان' : 'Adhan Volume'}
            />
            <span
              dir="ltr"
              className="tabular-nums text-[11px] font-bold text-primary"
            >
              {Math.round(audioState.volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => playPrePrayerChime(15)}
              className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground hover:bg-secondary/80"
            >
              {isAr ? 'تجربة تنبيه 15 د' : '15m Chime'}
            </button>
            <button
              type="button"
              onClick={() => playPrePrayerChime(5)}
              className="rounded-lg border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/25"
            >
              {isAr ? 'تجربة تنبيه 5 د' : '5m Chime'}
            </button>
          </div>
        </div>

        {/* The 5 Curated Offline Adhan Cards */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {MUEZZIN_PROFILES.map((m) => {
            const isSelected = m.id === muezzinId
            const isThisPlaying =
              audioState.isPlaying && audioState.muezzinId === m.id

            return (
              <div
                key={m.id}
                className={`flex flex-col justify-between rounded-xl border p-3 transition ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-muted/25 hover:border-primary/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                      <ShieldCheck className="h-3 w-3" />
                      {isAr
                        ? `صوت محلي #${m.offlineSlot} • ${m.countryAr}`
                        : `Offline #${m.offlineSlot} • ${m.countryEn}`}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shrink-0">
                        <Check className="h-3 w-3" />
                        {isAr ? 'معتمد' : 'Active'}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-foreground pt-1">
                    {isAr ? m.nameAr : m.nameEn}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {isAr ? m.mosqueAr : m.mosqueEn}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-border/50 pt-2">
                  <button
                    type="button"
                    onClick={() => handlePlayStopMuezzin(m.id)}
                    className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 px-2.5 text-[11px] font-bold transition ${
                      isThisPlaying
                        ? 'bg-amber-500 text-emerald-950'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    {isThisPlaying ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5" />
                        <span>{isAr ? 'إيقاف' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>{isAr ? 'استماع' : 'Play'}</span>
                      </>
                    )}
                  </button>

                  {!isSelected && (
                    <button
                      type="button"
                      onClick={() => onSelectMuezzin(m.id)}
                      className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-secondary"
                    >
                      {isAr ? 'اعتماد' : 'Select'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Moroccan Ministry of Habous & Islamic Affairs Official Directory (All 70+ Cities) */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-foreground">
                  {isAr
                    ? 'مواقيت وزارة الأوقاف والشؤون الإسلامية لجميع المدن المغربية'
                    : 'Moroccan Ministry of Habous Prayer Timings (All Cities)'}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  {isAr ? `${CITY_PRESETS.length} مدينة مغربية` : `${CITY_PRESETS.length} Cities`}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isAr
                  ? 'مواقيت دقيقة مطابقة لتقويم وزارة الأوقاف المغربية (زاوية الفجر 19° • العشاء 17° • المذهب المالكي) ومحفوظة دون إنترنت'
                  : 'Official Moroccan Ministry of Habous parameters (Fajr 19°, Isha 17°, Maliki) cached offline'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refreshHabous()}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-secondary-foreground hover:bg-secondary/80"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${habousLoading ? 'animate-spin' : ''}`}
            />
            <span>{isAr ? 'تحديث المواقيت' : 'Sync Timings'}</span>
          </button>
        </div>

        {/* Grouped Moroccan Cities Selector by 12 Regions */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-2.5">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div className="w-full">
              <label className="block text-[10px] font-semibold text-muted-foreground">
                {isAr
                  ? 'اختر مدينتك المغربية (مصنفة حسب الجهات الـ 12):'
                  : 'Select Your Moroccan City (Grouped by 12 Regions):'}
              </label>
              <select
                value={habousCity}
                onChange={(e) => handleApplyHabousCity(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-foreground focus:outline-none mt-0.5"
              >
                {MOROCCO_REGIONS_ORDER.map((regionName) => (
                  <optgroup
                    key={regionName}
                    label={`جهة ${regionName}`}
                    className="bg-card text-foreground font-bold"
                  >
                    {CITY_PRESETS.filter((c) => c.regionAr === regionName).map(
                      (c) => (
                        <option
                          key={c.id}
                          value={c.id}
                          className="bg-card text-foreground"
                        >
                          {isAr
                            ? `${c.nameAr} — (${c.regionAr})`
                            : `${c.nameEn} — (${c.regionAr})`}
                        </option>
                      )
                    )}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-xl border border-border bg-muted/30 p-2.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {isAr ? 'المعيار الرسمي المعتمد:' : 'Official Standard:'}
              </span>
              <span className="font-bold text-primary">
                وزارة الأوقاف المغربية (habous.gov.ma)
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">
                {isAr ? 'التاريخ الهجري:' : 'Hijri Date:'}
              </span>
              <span className="font-bold text-foreground">
                {habousData?.hijri?.fullAr || '...'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Timings Returned from /api/morocco-habous */}
        {habousData?.timings && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 text-center">
            {[
              { labelAr: 'الفجر', labelEn: 'Fajr', val: habousData.timings.fajr },
              {
                labelAr: 'الشروق',
                labelEn: 'Sunrise',
                val: habousData.timings.sunrise,
              },
              { labelAr: 'الظهر', labelEn: 'Dhuhr', val: habousData.timings.dhuhr },
              { labelAr: 'العصر', labelEn: 'Asr', val: habousData.timings.asr },
              {
                labelAr: 'المغرب',
                labelEn: 'Maghrib',
                val: habousData.timings.maghrib,
              },
              { labelAr: 'العشاء', labelEn: 'Isha', val: habousData.timings.isha },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-secondary/50 p-2.5"
              >
                <span className="block text-[10px] font-semibold text-muted-foreground">
                  {isAr ? item.labelAr : item.labelEn}
                </span>
                <span
                  dir="ltr"
                  className="mt-0.5 block tabular-nums text-xs font-extrabold text-primary"
                >
                  {item.val}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Calculation Method, Madhab & Notification Settings */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr
              ? 'إعدادات الحساب الفقهي والتنبيهات الصوتية'
              : 'Calculation & Prayer Alert Settings'}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-muted-foreground">
              {isAr ? 'الهيئة المعتمدة للحساب:' : 'Calculation Authority:'}
            </label>
            <select
              value={calcMethod}
              onChange={(e) => onChangeMethod(e.target.value as CalcMethodId)}
              className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
            >
              {CALC_METHODS.map((m) => (
                <option key={m.id} value={m.id} className="bg-card text-foreground">
                  {isAr ? m.nameAr : m.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-muted-foreground">
              {isAr ? 'المذهب الفقهي لحساب العصر:' : 'Asr Juristic Method:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeMadhab('shafi')}
                className={`rounded-xl border py-2 px-2.5 text-xs font-bold transition ${
                  madhab === 'shafi'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground'
                }`}
              >
                {isAr ? 'المالكي / الشافعي / الحنبلي' : 'Maliki / Shafi'}
              </button>
              <button
                type="button"
                onClick={() => onChangeMadhab('hanafi')}
                className={`rounded-xl border py-2 px-2.5 text-xs font-bold transition ${
                  madhab === 'hanafi'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground'
                }`}
              >
                {isAr ? 'المذهب الحنفي' : 'Hanafi Madhab'}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 pt-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <BellRing className="h-3.5 w-3.5 text-amber-500" />
            <span>
              {isAr
                ? 'تفعيل أو إيقاف تنبيه الأذان للصلوات الخمس'
                : 'Enable/Disable Adhan Alerts'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerId[]).map(
              (pid) => {
                const setting = notifications[pid]
                const labelsAr: Record<PrayerId, string> = {
                  fajr: 'الفجر',
                  dhuhr: 'الظهر',
                  asr: 'العصر',
                  maghrib: 'المغرب',
                  isha: 'العشاء',
                }
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() =>
                      onToggleNotification(pid, {
                        enabled: !setting?.enabled,
                      })
                    }
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition ${
                      setting?.enabled
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    <span>{isAr ? labelsAr[pid] : pid.toUpperCase()}</span>
                    <Sparkles
                      className={`h-3.5 w-3.5 ${
                        setting?.enabled
                          ? 'text-amber-500'
                          : 'text-muted-foreground/40'
                      }`}
                    />
                  </button>
                )
              }
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
