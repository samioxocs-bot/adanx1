'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import {
  Volume2,
  VolumeX,
  Check,
  Radio,
  Globe2,
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
  type CalcMethodId,
  type RegionGroup,
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
  const [regionFilter, setRegionFilter] = useState<'offline5' | 'all' | RegionGroup>('offline5')
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

  // Keep Habous city selector synchronized when user changes city from header/hero
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

  const filteredMuezzins =
    regionFilter === 'offline5'
      ? MUEZZIN_PROFILES.filter((m) => m.isCoreOffline)
      : regionFilter === 'all'
        ? MUEZZIN_PROFILES
        : MUEZZIN_PROFILES.filter((m) => m.region === regionFilter)

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

  const regionTabs: {
    id: 'offline5' | 'all' | RegionGroup
    labelAr: string
    labelEn: string
    count: number
  }[] = [
    {
      id: 'offline5',
      labelAr: '5 أذانات بدون إنترنت (مخزنة بالجهاز)',
      labelEn: '5 Offline Adhans (Built-in)',
      count: 5,
    },
    {
      id: 'all',
      labelAr: 'جميع الدول (18)',
      labelEn: 'All Countries (18)',
      count: MUEZZIN_PROFILES.length,
    },
    {
      id: 'maghreb',
      labelAr: 'الأصوات المغاربية (8)',
      labelEn: 'Maghreb Voices (8)',
      count: MUEZZIN_PROFILES.filter((m) => m.region === 'maghreb').length,
    },
    {
      id: 'haramain_gulf',
      labelAr: 'الحرمين والخليج (4)',
      labelEn: 'Haramain & Gulf (4)',
      count: MUEZZIN_PROFILES.filter((m) => m.region === 'haramain_gulf').length,
    },
    {
      id: 'egypt_levant',
      labelAr: 'مصر والقدس والشام (3)',
      labelEn: 'Egypt, Quds & Levant (3)',
      count: MUEZZIN_PROFILES.filter((m) => m.region === 'egypt_levant').length,
    },
    {
      id: 'islamic_world',
      labelAr: 'تركيا وآسيا (3)',
      labelEn: 'Turkey & Asia (3)',
      count: MUEZZIN_PROFILES.filter((m) => m.region === 'islamic_world').length,
    },
  ]

  return (
    <section className="space-y-4">
      {/* 1. Live Interactive Adhan Audio Controller & Volume Bar */}
      <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-emerald-950/90 via-card to-emerald-950/75 p-4 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                audioState.isPlaying
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300 animate-pulse'
                  : 'border-emerald-500/30 bg-emerald-900/50 text-emerald-300'
              }`}
            >
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-sm font-bold text-foreground">
                  {isAr
                    ? 'مشغل الأذان الحقيقي بدون إنترنت (5 أذانات MP3 مدمجة بالجهاز)'
                    : 'Offline Real Human Adhan Player (5 Built-in MP3s)'}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <ShieldCheck className="h-3 w-3 text-amber-400" />
                  {isAr
                    ? `يعمل بدون إنترنت (${audioState.offlineCachedCount}/5 محفوظة)`
                    : `Works Offline (${audioState.offlineCachedCount}/5 Cached)`}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isAr
                  ? `المؤذن المعتمد حالياً: ${activeMuezzin.nameAr} — صوت بشري حقيقي ١٠٠٪ بدون أي قارئ آلي`
                  : `Selected Muezzin: ${activeMuezzin.nameEn} — 100% Authentic Human Recording`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePlayStopMuezzin(activeMuezzin.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                audioState.isPlaying
                  ? 'bg-amber-500 text-emerald-950 hover:bg-amber-400'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
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
                    {isAr ? 'تجربة تشغيل الأذان الآن' : 'Test Play Adhan Now'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Adhan Words & Progress Bar when playing */}
        {audioState.isPlaying && (
          <div className="rounded-xl border border-amber-400/30 bg-black/35 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-amber-300">
              <span>
                {playingProfile
                  ? isAr
                    ? `${playingProfile.nameAr} (${playingProfile.mosqueAr})`
                    : playingProfile.nameEn
                  : ''}
              </span>
              <span dir="ltr" className="tabular-nums font-bold">
                {audioState.currentTime}s / {audioState.duration || 45}s
              </span>
            </div>
            <p className="font-serif text-center text-base font-bold text-white py-1">
              ﴿ {audioState.currentPhraseAr} ﴾
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-950">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-300"
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-2.5 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Volume2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-[11px] text-muted-foreground shrink-0">
              {isAr ? 'مستوى صوت الأذان:' : 'Adhan Volume:'}
            </span>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={audioState.volume}
              onChange={(e) => setAdhanVolume( parseFloat(e.target.value) )}
              className="w-full max-w-[160px] accent-amber-500"
              aria-label={isAr ? 'مستوى صوت الأذان' : 'Adhan Volume'}
            />
            <span dir="ltr" className="tabular-nums text-[11px] font-bold text-amber-300">
              {Math.round(audioState.volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => playPrePrayerChime(15)}
              className="rounded-lg border border-emerald-500/30 bg-emerald-950/50 px-2.5 py-1 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-900/60"
            >
              {isAr ? 'جرس قبل 15 د' : '15m Chime'}
            </button>
            <button
              type="button"
              onClick={() => playPrePrayerChime(5)}
              className="rounded-lg border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/25"
            >
              {isAr ? 'جرس قبل 5 د' : '5m Chime'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Maghrebi & World Muezzin Voices Directory */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Globe2 className="h-4 w-4 text-amber-400" />
              <span>
                {isAr
                  ? 'مكتبة أصوات الأذان المغاربية وجميع الدول الإسلامية'
                  : 'Maghrebi & World Islamic Adhan Voices'}
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isAr
                ? 'اختر واستمع لأصوات المغرب والجزائر وتونس وليبيا وموريتانيا والحرمين ومصر والقدس والشام وتركيا وآسيا'
                : 'Select and preview authentic Maghrebi, Haramain, Egyptian, Levantine, Turkish & Asian Adhan voices'}
            </p>
          </div>
        </div>

        {/* Region Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {regionTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRegionFilter(tab.id)}
              className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition ${
                regionFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Muezzin Cards Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {filteredMuezzins.map((m) => {
            const isSelected = m.id === muezzinId
            const isThisPlaying =
              audioState.isPlaying && audioState.muezzinId === m.id
            const isMaghreb = m.region === 'maghreb'

            return (
              <div
                key={m.id}
                className={`flex flex-col justify-between rounded-xl border p-3 transition ${
                  isSelected
                    ? 'border-amber-400/60 bg-emerald-950/45 shadow-sm'
                    : 'border-border bg-muted/20 hover:border-emerald-500/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1 mb-1">
                        <span
                          className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                            isMaghreb
                              ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30'
                              : 'bg-emerald-500/15 text-emerald-300'
                          }`}
                        >
                          {isAr ? m.countryAr : m.countryEn}
                        </span>
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-200 ring-1 ring-emerald-500/30">
                          <ShieldCheck className="h-2.5 w-2.5 text-amber-300" />
                          {isAr
                            ? `بدون إنترنت • أذان #${m.offlineSlot || 1}`
                            : `Offline • Adhan #${m.offlineSlot || 1}`}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground">
                        {isAr ? m.nameAr : m.nameEn}
                      </h4>
                    </div>
                    {isSelected && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 shrink-0">
                        <Check className="h-3 w-3" />
                        {isAr ? 'معتمد' : 'Active'}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    {isAr ? m.mosqueAr : m.mosqueEn}
                  </p>
                  <p className="text-[10px] font-medium text-amber-300/90">
                    {m.maqamAr} • {m.takbeerStyleAr}
                  </p>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-1.5 border-t border-border/40 pt-2">
                  <button
                    type="button"
                    onClick={() => handlePlayStopMuezzin(m.id)}
                    className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 px-2.5 text-[11px] font-bold transition ${
                      isThisPlaying
                        ? 'bg-amber-500 text-emerald-950'
                        : 'bg-emerald-600/25 text-emerald-300 hover:bg-emerald-600/40'
                    }`}
                  >
                    {isThisPlaying ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5" />
                        <span>{isAr ? 'إيقاف الصوت' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>{isAr ? 'تشغيل الأذان' : 'Play Adhan'}</span>
                      </>
                    )}
                  </button>

                  {!isSelected && (
                    <button
                      type="button"
                      onClick={() => onSelectMuezzin(m.id)}
                      className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-secondary"
                    >
                      {isAr ? 'اختيار' : 'Select'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Moroccan Ministry of Habous & Islamic Affairs Official API Integration */}
      <div className="rounded-2xl border border-emerald-500/35 bg-card p-4 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/20 text-amber-400 ring-1 ring-amber-400/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-foreground">
                  {isAr
                    ? 'واجهة API وزارة الأوقاف والشؤون الإسلامية بالمغرب'
                    : 'Moroccan Ministry of Habous & Islamic Affairs API'}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  {isAr ? 'متصل مباشر' : 'Connected'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isAr
                  ? 'مواقيت الصلاة الرسمية للمدن المغربية وفق معايير وزارة الأوقاف (الفجر 19° • العشاء 17° • المذهب المالكي)'
                  : 'Official Moroccan prayer times via Ministry of Habous parameters (Fajr 19°, Isha 17°, Maliki)'}
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
            <span>{isAr ? 'تحديث من الوزارة' : 'Sync API'}</span>
          </button>
        </div>

        {/* Moroccan City Selector for Habous API */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-2">
            <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
            <div className="w-full">
              <label className="block text-[10px] text-muted-foreground">
                {isAr
                  ? 'اختر المدينة المغربية من قاعدة وزارة الأوقاف:'
                  : 'Select Moroccan City (Habous Directory):'}
              </label>
              <select
                value={habousCity}
                onChange={(e) => handleApplyHabousCity(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-foreground focus:outline-none mt-0.5"
              >
                {(habousData?.citiesList || [
                  { id: 'rabat', nameAr: 'الرباط', nameEn: 'Rabat', regionAr: 'الرباط - سلا - القنيطرة', habousVilleCode: 1 },
                  { id: 'casablanca', nameAr: 'الدار البيضاء', nameEn: 'Casablanca', regionAr: 'الدار البيضاء - سطات', habousVilleCode: 58 },
                  { id: 'fes', nameAr: 'فاس', nameEn: 'Fes', regionAr: 'فاس - مكناس', habousVilleCode: 81 },
                  { id: 'marrakech', nameAr: 'مراكش', nameEn: 'Marrakech', regionAr: 'مراكش - آسفي', habousVilleCode: 104 },
                  { id: 'tangier', nameAr: 'طنجة', nameEn: 'Tangier', regionAr: 'طنجة - تطوان - الحسيمة', habousVilleCode: 31 },
                  { id: 'agadir', nameAr: 'أكادير', nameEn: 'Agadir', regionAr: 'سوس - ماسة', habousVilleCode: 117 },
                  { id: 'meknes', nameAr: 'مكناس', nameEn: 'Meknes', regionAr: 'فاس - مكناس', habousVilleCode: 85 },
                  { id: 'oujda', nameAr: 'وجدة', nameEn: 'Oujda', regionAr: 'الشرق', habousVilleCode: 45 },
                  { id: 'tetouan', nameAr: 'تطوان', nameEn: 'Tetouan', regionAr: 'طنجة - تطوان - الحسيمة', habousVilleCode: 35 },
                  { id: 'laayoune', nameAr: 'العيون', nameEn: 'Laayoune', regionAr: 'العيون - الساقية الحمراء', habousVilleCode: 142 },
                ]).map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    className="bg-emerald-950 text-emerald-50"
                  >
                    {isAr
                      ? `${c.nameAr} (${c.regionAr}) — رمز الوزارة #${c.habousVilleCode}`
                      : `${c.nameEn} — Habous Code #${c.habousVilleCode}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-xl border border-border bg-muted/25 p-2.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {isAr ? 'المصدر الفقهي والفلكي:' : 'Official Source:'}
              </span>
              <span className="font-bold text-amber-400">
                habous.gov.ma (Method 21)
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">
                {isAr ? 'التاريخ الهجري المغربي:' : 'Moroccan Hijri Date:'}
              </span>
              <span className="font-bold text-emerald-300">
                {habousData?.hijri?.fullAr || '...'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Timings Returned from /api/morocco-habous */}
        {habousData?.timings && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 text-center">
              {[
                { labelAr: 'الفجر', labelEn: 'Fajr', val: habousData.timings.fajr },
                { labelAr: 'الشروق', labelEn: 'Sunrise', val: habousData.timings.sunrise },
                { labelAr: 'الظهر', labelEn: 'Dhuhr', val: habousData.timings.dhuhr },
                { labelAr: 'العصر', labelEn: 'Asr', val: habousData.timings.asr },
                { labelAr: 'المغرب', labelEn: 'Maghrib', val: habousData.timings.maghrib },
                { labelAr: 'العشاء', labelEn: 'Isha', val: habousData.timings.isha },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-950/35 p-2"
                >
                  <span className="block text-[10px] text-emerald-300">
                    {isAr ? item.labelAr : item.labelEn}
                  </span>
                  <span
                    dir="ltr"
                    className="mt-0.5 block tabular-nums text-xs font-extrabold text-amber-300"
                  >
                    {item.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-[11px]">
              <span className="text-emerald-200">
                {isAr
                  ? `نقطة النهاية البرمجية: GET /api/morocco-habous?city=${habousCity}`
                  : `API Endpoint: GET /api/morocco-habous?city=${habousCity}`}
              </span>
              <button
                type="button"
                onClick={() => handleApplyHabousCity(habousCity)}
                className="rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-bold text-emerald-950 hover:bg-amber-400"
              >
                {isAr
                  ? `اعتماد توقيت ${habousData.city.nameAr} في التطبيق`
                  : `Apply ${habousData.city.nameEn} Schedule`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. General Calculation Method, Madhab & Notification Settings */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr
              ? 'إعدادات طريقة الحساب الفلكي والمذهب الفقهي'
              : 'Calculation Method & Juristic Madhab Settings'}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-muted-foreground">
              {isAr ? 'الهيئة أو الوزارة المعتمدة للحساب:' : 'Calculation Authority:'}
            </label>
            <select
              value={calcMethod}
              onChange={(e) => onChangeMethod(e.target.value as CalcMethodId)}
              className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
            >
              {CALC_METHODS.map((m) => (
                <option key={m.id} value={m.id} className="bg-emerald-950 text-white">
                  {isAr ? m.nameAr : m.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-muted-foreground">
              {isAr ? 'المذهب الفقهي لحساب وقت العصر:' : 'Asr Juristic Method:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeMadhab('shafi')}
                className={`rounded-xl border py-2 px-2.5 text-xs font-bold transition ${
                  madhab === 'shafi'
                    ? 'border-emerald-500 bg-emerald-600 text-white'
                    : 'border-border bg-muted/30 text-muted-foreground'
                }`}
              >
                {isAr ? 'المالكي / الشافعي / الحنبلي' : 'Maliki / Shafi / Hanbali'}
              </button>
              <button
                type="button"
                onClick={() => onChangeMadhab('hanafi')}
                className={`rounded-xl border py-2 px-2.5 text-xs font-bold transition ${
                  madhab === 'hanafi'
                    ? 'border-emerald-500 bg-emerald-600 text-white'
                    : 'border-border bg-muted/30 text-muted-foreground'
                }`}
              >
                {isAr ? 'المذهب الحنفي' : 'Hanafi Madhab'}
              </button>
            </div>
          </div>
        </div>

        {/* Per-prayer notification quick summary */}
        <div className="border-t border-border/50 pt-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <BellRing className="h-3.5 w-3.5 text-amber-400" />
            <span>
              {isAr
                ? 'تخصيص التنبيهات الصوتية للصلوات الخمس'
                : 'Five Daily Prayers Audio Alerts'}
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
                    className={`flex items-center justify-between rounded-xl border p-2 text-xs font-bold transition ${
                      setting?.enabled
                        ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                        : 'border-border bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    <span>{isAr ? labelsAr[pid] : pid.toUpperCase()}</span>
                    <Sparkles
                      className={`h-3.5 w-3.5 ${
                        setting?.enabled
                          ? 'text-amber-400'
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
