'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  RefreshCw,
  Wifi,
  WifiOff,
  MapPin,
} from 'lucide-react'
import { CITY_PRESETS } from '@/lib/prayer-engine'

interface WeatherSectionProps {
  cityId: string
  customCoords?: { lat: number; lng: number; label: string } | null
  lang: 'ar' | 'en'
  onSelectCity: (cityId: string) => void
}

interface DailyForecastItem {
  dateIso: string
  tempMax: number
  tempMin: number
  weatherCode: number
}

interface WeatherDataPayload {
  cityId: string
  cityNameAr: string
  cityNameEn: string
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  weatherCode: number
  daily: DailyForecastItem[]
  updatedAt: string
}

function getWeatherDescription(code: number, isAr: boolean): {
  label: string
  icon: 'sun' | 'cloud-sun' | 'cloud' | 'rain'
} {
  if (code === 0) {
    return { label: isAr ? 'سماء صافية ومشمسة' : 'Clear Sky', icon: 'sun' }
  }
  if (code === 1 || code === 2) {
    return {
      label: isAr ? 'غائم جزئياً ومعتدل' : 'Partly Cloudy',
      icon: 'cloud-sun',
    }
  }
  if (code === 3 || code === 45 || code === 48) {
    return { label: isAr ? 'غائم أو ضباب خفيف' : 'Overcast / Fog', icon: 'cloud' }
  }
  return {
    label: isAr ? 'زخات مطرية متفرقة' : 'Rain Showers',
    icon: 'rain',
  }
}

export function WeatherSection({
  cityId,
  customCoords,
  lang,
  onSelectCity,
}: WeatherSectionProps) {
  const isAr = lang === 'ar'
  const [weather, setWeather] = useState<WeatherDataPayload | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const selectedCity =
    CITY_PRESETS.find((c) => c.id === cityId) || CITY_PRESETS[0]
  const lat =
    cityId === 'custom' && customCoords ? customCoords.lat : selectedCity.lat
  const lng =
    cityId === 'custom' && customCoords ? customCoords.lng : selectedCity.lng
  const cityNameAr =
    cityId === 'custom' && customCoords
      ? customCoords.label
      : selectedCity.nameAr
  const cityNameEn =
    cityId === 'custom' && customCoords
      ? customCoords.label
      : selectedCity.nameEn

  const fetchWeather = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    const cacheKey = `adan2_weather_${cityId}`

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Africa%2FCasablanca`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Network error')
      const json = await res.json()

      const dailyList: DailyForecastItem[] = (json.daily?.time || [])
        .slice(0, 5)
        .map((d: string, idx: number) => ({
          dateIso: d,
          tempMax: Math.round(json.daily.temperature_2m_max?.[idx] ?? 24),
          tempMin: Math.round(json.daily.temperature_2m_min?.[idx] ?? 15),
          weatherCode: json.daily.weather_code?.[idx] ?? 0,
        }))

      const payload: WeatherDataPayload = {
        cityId,
        cityNameAr,
        cityNameEn,
        temperature: Math.round(json.current?.temperature_2m ?? 22),
        feelsLike: Math.round(json.current?.apparent_temperature ?? 22),
        humidity: Math.round(json.current?.relative_humidity_2m ?? 60),
        windSpeed: Math.round(json.current?.wind_speed_10m ?? 14),
        weatherCode: json.current?.weather_code ?? 0,
        daily: dailyList,
        updatedAt: new Date().toISOString(),
      }

      setWeather(payload)
      setIsOfflineFallback(false)
      try {
        localStorage.setItem(cacheKey, JSON.stringify(payload))
      } catch {
        // ignore
      }
    } catch {
      // Load last cached weather if offline
      try {
        const saved = localStorage.getItem(cacheKey)
        if (saved) {
          setWeather(JSON.parse(saved))
          setIsOfflineFallback(true)
        } else {
          setIsOfflineFallback(true)
          setErrorMsg(
            isAr
              ? 'ميزة الطقس تتطلب اتصالاً بالإنترنت لتحديث البيانات الحالية للمدينة المختارة.'
              : 'Weather requires an active internet connection to fetch live data.'
          )
        }
      } catch {
        setIsOfflineFallback(true)
      }
    } finally {
      setLoading(false)
    }
  }, [cityId, lat, lng, cityNameAr, cityNameEn, isAr])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  const renderIcon = (
    type: 'sun' | 'cloud-sun' | 'cloud' | 'rain',
    sizeClass = 'h-8 w-8'
  ) => {
    switch (type) {
      case 'sun':
        return <Sun className={`${sizeClass} text-amber-500`} />
      case 'cloud-sun':
        return <CloudSun className={`${sizeClass} text-amber-500`} />
      case 'rain':
        return <CloudRain className={`${sizeClass} text-sky-500`} />
      default:
        return <Cloud className={`${sizeClass} text-slate-400`} />
    }
  }

  const currentMeta = getWeatherDescription(weather?.weatherCode ?? 0, isAr)

  return (
    <section className="space-y-4">
      {/* Header & Online Requirement Notice */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <CloudSun className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-sm font-bold text-foreground sm:text-base">
                {isAr
                  ? `حالة الطقس المباشرة — ${cityNameAr}`
                  : `Live Weather Forecast — ${cityNameEn}`}
              </h2>
              {isOfflineFallback ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300">
                  <WifiOff className="h-3 w-3" />
                  {isAr
                    ? 'غير متصل — عرض آخر بيانات محفوظة'
                    : 'Offline — Showing Last Saved Data'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  <Wifi className="h-3 w-3" />
                  {isAr ? 'محدث عبر الإنترنت' : 'Live Online Data'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isAr
                ? 'درجة الحرارة الحالية، الرطوبة، سرعة الرياح، وتوقعات الأيام القادمة للمدينة المختارة (تعمل عبر الإنترنت)'
                : 'Current temperature, humidity, wind speed, and 5-day forecast (Online feature)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-2.5 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <select
              aria-label={isAr ? 'اختر المدينة للطقس' : 'Select City'}
              value={cityId}
              onChange={(e) => onSelectCity(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none"
            >
              {CITY_PRESETS.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  className="bg-card text-foreground"
                >
                  {isAr ? `${c.nameAr} (${c.regionAr})` : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={fetchWeather}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            <span>{isAr ? 'تحديث الطقس' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {errorMsg && !weather && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center space-y-2">
          <WifiOff className="h-8 w-8 text-amber-500 mx-auto" />
          <p className="text-sm font-bold text-foreground">{errorMsg}</p>
        </div>
      )}

      {weather && (
        <>
          {/* Current Weather Hero Card */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-6 rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  {isAr ? 'درجة الحرارة الآن في' : 'Current Weather in'}{' '}
                  <strong className="text-foreground">
                    {isAr ? weather.cityNameAr : weather.cityNameEn}
                  </strong>
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    dir="ltr"
                    className="font-mono text-5xl font-extrabold text-foreground"
                  >
                    {weather.temperature}°C
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {currentMeta.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? `الشعور الفعلي بالحرارة: ${weather.feelsLike}°C`
                    : `Feels like: ${weather.feelsLike}°C`}
                </p>
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/70">
                {renderIcon(currentMeta.icon, 'h-12 w-12')}
              </div>
            </div>

            {/* Metrics Grid: Humidity, Wind, High/Low */}
            <div className="md:col-span-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Droplets className="h-4 w-4 text-sky-500" />
                  <span>{isAr ? 'الرطوبة' : 'Humidity'}</span>
                </div>
                <span
                  dir="ltr"
                  className="font-mono text-2xl font-extrabold text-foreground mt-2"
                >
                  {weather.humidity}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {isAr ? 'نسبة رطوبة الجو' : 'Relative Humidity'}
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Wind className="h-4 w-4 text-emerald-500" />
                  <span>{isAr ? 'الرياح' : 'Wind'}</span>
                </div>
                <span
                  dir="ltr"
                  className="font-mono text-2xl font-extrabold text-foreground mt-2"
                >
                  {weather.windSpeed} <small className="text-xs">km/h</small>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {isAr ? 'سرعة الرياح السطحية' : 'Wind Speed'}
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Thermometer className="h-4 w-4 text-amber-500" />
                  <span>{isAr ? 'العظمى / الصغرى' : 'High / Low'}</span>
                </div>
                <span
                  dir="ltr"
                  className="font-mono text-xl font-extrabold text-foreground mt-2"
                >
                  {weather.daily[0]?.tempMax ?? weather.temperature}° /{' '}
                  {weather.daily[0]?.tempMin ?? weather.temperature - 6}°
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {isAr ? 'خلال اليوم' : 'Today Range'}
                </span>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Strip */}
          {weather.daily.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-foreground">
                {isAr
                  ? 'توقعات درجات الحرارة للأيام الخمسة القادمة'
                  : '5-Day Temperature Forecast'}
              </h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {weather.daily.map((day, idx) => {
                  const meta = getWeatherDescription(day.weatherCode, isAr)
                  const dayLabel =
                    idx === 0
                      ? isAr
                        ? 'اليوم'
                        : 'Today'
                      : new Intl.DateTimeFormat(isAr ? 'ar-MA' : 'en-US', {
                          weekday: 'long',
                        }).format(new Date(day.dateIso + 'T12:00:00Z'))

                  return (
                    <div
                      key={day.dateIso}
                      className="rounded-xl border border-border bg-secondary/40 p-3 text-center space-y-1.5"
                    >
                      <span className="block text-xs font-bold text-foreground">
                        {dayLabel}
                      </span>
                      <div className="flex justify-center py-1">
                        {renderIcon(meta.icon, 'h-6 w-6')}
                      </div>
                      <span className="block text-[10px] text-muted-foreground">
                        {meta.label}
                      </span>
                      <div
                        dir="ltr"
                        className="flex items-center justify-center gap-2 font-mono text-xs font-extrabold"
                      >
                        <span className="text-foreground">{day.tempMax}°</span>
                        <span className="text-muted-foreground">
                          {day.tempMin}°
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
