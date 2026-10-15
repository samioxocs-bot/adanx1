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
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1L14.8 6.2L20.5 5.5L17.8 10.8L22 15L16.3 16.2L15.5 22L11.2 18.2L6 21L7.2 15.3L2 12.5L7.2 9.7L6 4L11.2 6.8L12 1Z" />
    </svg>
  )
}

export function PrayerTicker({ schedule, lang, onTestAlert }: PrayerTickerProps) {
  const isAr = lang === 'ar'
  const { nextPrayer, prayers, imsak, iftar } = schedule

  const handleChimeTest = (mins: 5 | 15) => {
    playPrePrayerChime(mins)
    triggerVibration([150, 80, 150])
    onTestAlert?.(mins)
  }

  return (
    <div className="w-full border-b border-emerald-500/20 bg-emerald-950/90 text-emerald-50 backdrop-blur-md">
      {/* Top compact status bar for mobile & desktop */}
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-1.5 px-2.5 py-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 font-semibold text-amber-300 ring-1 ring-amber-400/40">
            <IslamicStarIcon className="h-3 w-3 text-amber-400" />
            <span>
              {isAr ? `القادمة: ${nextPrayer.nameAr}` : `Next: ${nextPrayer.nameEn}`}
            </span>
          </span>
          <span
            dir="ltr"
            className="rounded bg-emerald-900/90 px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-emerald-200 ring-1 ring-emerald-500/30"
          >
            -{nextPrayer.remainingFormatted}
          </span>
        </div>

        {/* 15m and 5m audio alert quick triggers */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleChimeTest(15)}
            title={isAr ? 'تجربة تنبيه قبل الأذان بـ 15 دقيقة' : 'Test 15m pre-Adhan chime'}
            className="inline-flex items-center gap-1 rounded-md bg-emerald-800/70 px-1.5 py-0.5 text-[10px] font-medium text-emerald-100 transition hover:bg-emerald-700 active:scale-95"
          >
            <BellRing className="h-2.5 w-2.5 text-amber-300" />
            <span>{isAr ? 'تنبيه 15د' : '15m Alert'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleChimeTest(5)}
            title={isAr ? 'تجربة تنبيه قبل الأذان بـ 5 دقائق' : 'Test 5m pre-Adhan chime'}
            className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-200 ring-1 ring-amber-400/30 transition hover:bg-amber-500/30 active:scale-95"
          >
            <Volume2 className="h-2.5 w-2.5 text-amber-300" />
            <span>{isAr ? 'تنبيه 5د' : '5m Alert'}</span>
          </button>
        </div>
      </div>

      {/* Horizontal scrollable / dynamic ticker strip of all prayers + Ramadan Imsak & Iftar */}
      <div className="overflow-x-auto border-t border-emerald-500/15 bg-emerald-950/60 px-2.5 py-1.5 no-scrollbar">
        <div className="mx-auto flex max-w-5xl items-center gap-2 whitespace-nowrap text-[11px]">
          {prayers.map((p) => {
            const isNext = p.id === nextPrayer.id
            return (
              <div
                key={p.id}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 transition ${
                  isNext
                    ? 'bg-gradient-to-r from-amber-500/30 to-emerald-600/30 font-bold text-amber-200 ring-1 ring-amber-400/50 shadow-sm'
                    : p.isPassed
                      ? 'bg-emerald-900/30 text-emerald-300/60'
                      : 'bg-emerald-900/50 text-emerald-100'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isNext
                      ? 'animate-ping bg-amber-400'
                      : p.isPassed
                        ? 'bg-emerald-600'
                        : 'bg-emerald-400'
                  }`}
                />
                <span>{isAr ? p.nameAr : p.nameEn}</span>
                <span dir="ltr" className="tabular-nums text-[10px] font-semibold opacity-95">
                  {isAr ? p.formatted12Ar : p.formatted12En}
                </span>
              </div>
            )
          })}

          <div className="h-3 w-px bg-emerald-500/25" />

          <div className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2 py-0.5 text-amber-200">
            <Sparkles className="h-2.5 w-2.5 text-amber-400" />
            <span>{isAr ? 'الإمساك:' : 'Imsak:'}</span>
            <span dir="ltr" className="tabular-nums text-[10px] font-semibold">
              {isAr ? imsak.formatted12Ar : imsak.formatted12En}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-0.5 text-emerald-200">
            <span>{isAr ? 'الإفطار:' : 'Iftar:'}</span>
            <span dir="ltr" className="tabular-nums text-[10px] font-semibold">
              {isAr ? iftar.formatted12Ar : iftar.formatted12En}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
