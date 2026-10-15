'use client'

import React from 'react'
import { Volume2, BellRing, Sparkles } from 'lucide-react'
import type { ComputedPrayerDay } from '@/lib/prayer-engine'
import { playPrePrayerChime, triggerVibration } from '@/lib/audio-adhan'

interface PrayerTickerProps {
  schedule: ComputedPrayerDay
  lang: 'ar' | 'en'
  onTestAlert?: (mins: 5 | 15) => void
}

function IslamicStarIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 1L14.8 6.2L20.5 5.5L17.8 10.8L22 15L16.3 16.2L15.5 22L11.2 18.2L6 21L7.2 15.3L2 12.5L7.2 9.7L6 4L11.2 6.8L12 1Z" />
    </svg>
  )
}

export function PrayerTicker({
  schedule,
  lang,
  onTestAlert,
}: PrayerTickerProps) {
  const isAr = lang === 'ar'
  const { nextPrayer, prayers, imsak, iftar } = schedule

  const handleChimeTest = (mins: 5 | 15) => {
    playPrePrayerChime(mins)
    triggerVibration([150, 80, 150])
    onTestAlert?.(mins)
  }

  return (
    <div className="w-full border-b border-border bg-card/95 text-foreground backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 font-bold text-primary shrink-0">
            <IslamicStarIcon className="h-3 w-3 text-amber-500" />
            <span>
              {isAr
                ? `القادمة: ${nextPrayer.nameAr}`
                : `Next: ${nextPrayer.nameEn}`}
            </span>
          </span>
          <span
            dir="ltr"
            className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] font-extrabold tracking-wider text-secondary-foreground shrink-0"
          >
            -{nextPrayer.remainingFormatted}
          </span>

          <div className="hidden md:flex items-center gap-1.5 ps-2 border-s border-border">
            {prayers.map((p) => {
              const isNext = p.id === nextPrayer.id
              return (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] ${
                    isNext
                      ? 'bg-amber-500/15 font-bold text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30'
                      : 'text-muted-foreground'
                  }`}
                >
                  <span>{isAr ? p.nameAr : p.nameEn}</span>
                  <span dir="ltr" className="tabular-nums font-semibold">
                    {isAr ? p.formatted12Ar : p.formatted12En}
                  </span>
                </span>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
            <Sparkles className="h-2.5 w-2.5 text-amber-500" />
            <span>{isAr ? 'الإمساك:' : 'Imsak:'}</span>
            <span dir="ltr" className="tabular-nums font-bold">
              {isAr ? imsak.formatted12Ar : imsak.formatted12En}
            </span>
          </span>

          <button
            type="button"
            onClick={() => handleChimeTest(15)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground transition hover:bg-secondary/80"
          >
            <BellRing className="h-2.5 w-2.5 text-primary" />
            <span>{isAr ? 'تنبيه 15د' : '15m'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleChimeTest(5)}
            className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 transition hover:bg-amber-500/25"
          >
            <Volume2 className="h-2.5 w-2.5" />
            <span>{isAr ? 'تنبيه 5د' : '5m'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
