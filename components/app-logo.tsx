'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Heart } from 'lucide-react'

export function AppLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dimensions =
    size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11'

  return (
    <div
      className={`relative flex ${dimensions} shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 p-1 shadow-md ring-1 ring-amber-400/50`}
      aria-hidden="true"
    >
      {/* Subtle inner golden glow */}
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_30%,rgba(245,158,11,0.28),transparent_70%)]" />

      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full w-full"
      >
        {/* Moroccan 8-Pointed Star (Rub el Hizb) Outer Frame */}
        <rect
          x="13"
          y="13"
          width="38"
          height="38"
          rx="4"
          stroke="url(#goldGrad)"
          strokeWidth="1.8"
          strokeOpacity="0.85"
        />
        <rect
          x="13"
          y="13"
          width="38"
          height="38"
          rx="4"
          transform="rotate(45 32 32)"
          stroke="url(#goldGrad)"
          strokeWidth="1.8"
          strokeOpacity="0.85"
        />

        {/* Moroccan Mihrab Arch */}
        <path
          d="M21 46V31C21 23.5 26 18.5 32 16C38 18.5 43 23.5 43 31V46H21Z"
          fill="url(#emeraldInner)"
          stroke="url(#goldGrad)"
          strokeWidth="1.6"
        />

        {/* Hanging Mishkat Lantern Chain & Glow */}
        <line
          x1="32"
          y1="16"
          x2="32"
          y2="23"
          stroke="#FBBF24"
          strokeWidth="1.4"
        />
        <path
          d="M28.5 26C28.5 24 30 23 32 23C34 23 35.5 24 35.5 26L34.3 33.5C34 35 33.1 36 32 36C30.9 36 30 35 29.7 33.5L28.5 26Z"
          fill="url(#lanternGlow)"
          stroke="#FDE68A"
          strokeWidth="1.2"
        />
        {/* Inner Lantern Flame */}
        <circle cx="32" cy="29.5" r="2.2" fill="#FEF3C7" />

        {/* Open Noble Quran at Base of Mihrab */}
        <path
          d="M23.5 43.5C26.5 42.2 29.5 42.6 32 44.2C34.5 42.6 37.5 42.2 40.5 43.5V46.5C37.5 45.4 34.5 45.7 32 47.2C29.5 45.7 26.5 45.4 23.5 46.5V43.5Z"
          fill="#FBBF24"
        />

        {/* Top Crescent Crown */}
        <path
          d="M34.2 9.2C33.1 9.9 31.6 9.8 30.6 8.9C29.6 8 29.4 6.5 30.1 5.4C28.5 5.9 27.6 7.6 28.1 9.3C28.6 11 30.4 11.9 32.1 11.4C33.1 11.1 33.9 10.2 34.2 9.2Z"
          fill="#FDE68A"
        />

        <defs>
          <linearGradient
            id="goldGrad"
            x1="10"
            y1="8"
            x2="54"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FDE68A" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
          <linearGradient
            id="emeraldInner"
            x1="32"
            y1="16"
            x2="32"
            y2="46"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#065F46" stopOpacity="0.9" />
            <stop offset="1" stopColor="#022C22" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient
            id="lanternGlow"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(32 29.5) scale(6)"
          >
            <stop stopColor="#FEF08A" />
            <stop offset="1" stopColor="#D97706" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

const DAILY_ILLUMINATIONS = [
  {
    textAr: '﴿ اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ ﴾',
    sourceAr: 'سورة النور • الآية ٣٥',
    textEn: '“Allah is the Light of the heavens and the earth. The example of His light is like a niche within which is a lamp.”',
    sourceEn: 'Surah An-Nur • Ayah 35',
  },
  {
    textAr: 'قال رسول الله صلى الله عليه وسلم: «مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا»',
    sourceAr: 'رواه مسلم',
    textEn: 'The Prophet (peace be upon him) said: “Whoever sends blessings upon me once, Allah will send blessings upon him tenfold.”',
    sourceEn: 'Sahih Muslim',
  },
  {
    textAr: 'قال رسول الله صلى الله عليه وسلم: «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»',
    sourceAr: 'متفق عليه',
    textEn: 'The Prophet (peace be upon him) said: “The most beloved deeds to Allah are the most consistent of them, even if small.”',
    sourceEn: 'Agreed Upon',
  },
  {
    textAr: '﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾',
    sourceAr: 'سورة الرعد • الآية ٢٨',
    textEn: '“Unquestionably, by the remembrance of Allah hearts are assured.”',
    sourceEn: 'Surah Ar-Ra’d • Ayah 28',
  },
]

export function DailyNoorBanner({ lang }: { lang: 'ar' | 'en' }) {
  const isAr = lang === 'ar'
  const [salawatCount, setSalawatCount] = useState(0)
  const [idx, setIdx] = useState(0)
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mishkat_salawat_counter_v1')
      if (saved) setSalawatCount(parseInt(saved, 10) || 0)
    } catch {
      // ignore
    }
    const dayIndex = new Date().getDate() % DAILY_ILLUMINATIONS.length
    setIdx(dayIndex)
  }, [])

  const handleSalawat = () => {
    const next = salawatCount + 1
    setSalawatCount(next)
    setPulsing(true)
    setTimeout(() => setPulsing(false), 300)
    try {
      localStorage.setItem('mishkat_salawat_counter_v1', String(next))
    } catch {
      // ignore
    }
  }

  const item = DAILY_ILLUMINATIONS[idx]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-emerald-950/90 via-card to-emerald-950/90 p-3.5 sm:px-5 sm:py-3.5 shadow-sm">
      {/* Subtle geometric corner glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wide text-amber-400">
                {isAr ? 'إشراقة مِشكاة اليوم' : 'Daily Mishkat Illumination'}
              </span>
              <span className="text-[10px] text-muted-foreground">• {isAr ? item.sourceAr : item.sourceEn}</span>
            </div>
            <p className="font-serif text-xs sm:text-sm font-bold text-foreground mt-0.5 leading-relaxed">
              {isAr ? item.textAr : item.textEn}
            </p>
          </div>
        </div>

        {/* Interactive Salawat Button */}
        <button
          type="button"
          onClick={handleSalawat}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-bold text-amber-300 transition-all hover:bg-amber-500/25 active:scale-95 shrink-0 ${
            pulsing ? 'ring-2 ring-amber-400 scale-[1.02]' : ''
          }`}
        >
          <Heart className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{isAr ? 'صلِّ على النبي' : 'Send Salawat'}</span>
          <span className="rounded-lg bg-background/60 px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-amber-300 border border-amber-500/30">
            {salawatCount}
          </span>
        </button>
      </div>
    </div>
  )
}
