'use client'

import React, { useState } from 'react'
import {
  Bell,
  BellOff,
  Check,
  Sparkles,
  BookOpen,
  Sunrise,
  Clock,
  Vibrate,
} from 'lucide-react'
import type { ComputedPrayerDay, PrayerId } from '@/lib/prayer-engine'
import type {
  PrayerLogEntry,
  PrayerNotificationSetting,
  PredictiveInsight,
} from '@/lib/store-types'

interface PrayerTimesListProps {
  schedule: ComputedPrayerDay
  logs: PrayerLogEntry[]
  notifications: Record<PrayerId, PrayerNotificationSetting>
  insights: PredictiveInsight[]
  lang: 'ar' | 'en'
  onLogPrayer: (prayerId: PrayerId, status: 'on_time' | 'jamaah' | 'late', khushu: number) => void
  onToggleNotification: (
    prayerId: PrayerId,
    patch: Partial<PrayerNotificationSetting>
  ) => void
}

export function PrayerTimesList({
  schedule,
  logs,
  notifications,
  insights,
  lang,
  onLogPrayer,
  onToggleNotification,
}: PrayerTimesListProps) {
  const isAr = lang === 'ar'
  const [expandedPrayer, setExpandedPrayer] = useState<PrayerId | null>('asr')
  const todayIso = schedule.dateIso

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-bold text-foreground sm:text-base">
            {isAr ? 'مواقيت الصلاة الخمس والصلوات المسنونة' : 'Daily Obligatory Prayer Schedule'}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {isAr
              ? 'اضغط على أي صلاة لعرض الآية القرآنية، توصية الذكاء الاصطناعي، وتخصيص التنبيهات'
              : 'Tap any prayer for Quranic reminder, AI optimal window, and alert controls'}
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground">
          <Sunrise className="h-3.5 w-3.5 text-amber-500" />
          <span>{isAr ? 'الشروق:' : 'Sunrise:'}</span>
          <span dir="ltr" className="tabular-nums font-bold">
            {isAr ? schedule.sunrise.formatted12Ar : schedule.sunrise.formatted12En}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {schedule.prayers.map((prayer) => {
          const isNext = prayer.id === schedule.nextPrayer.id
          const todayLog = logs.find(
            (l) => l.dateIso === todayIso && l.prayerId === prayer.id
          )
          const notif = notifications[prayer.id]
          const insight = insights.find((i) => i.prayerId === prayer.id)
          const isExpanded = expandedPrayer === prayer.id

          return (
            <div
              key={prayer.id}
              className={`rounded-2xl border transition-all ${
                isNext
                  ? 'border-amber-500/60 bg-gradient-to-r from-emerald-950/40 via-card to-amber-500/10 shadow-md ring-1 ring-amber-400/30'
                  : 'border-border bg-card/90 hover:border-emerald-500/30'
              }`}
            >
              {/* Main Prayer Row */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedPrayer(isExpanded ? null : prayer.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setExpandedPrayer(isExpanded ? null : prayer.id)
                  }
                }}
                className="flex cursor-pointer flex-wrap items-center justify-between gap-2 p-3"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-serif text-sm font-bold ${
                      isNext
                        ? 'bg-amber-500 text-emerald-950 shadow-sm'
                        : todayLog
                          ? 'bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/40'
                          : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {todayLog ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      prayer.nameAr.replace(/^ال/, '').slice(0, 2)
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-foreground">
                        {isAr ? `صلاة ${prayer.nameAr}` : prayer.nameEn}
                      </span>
                      {isNext && (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-amber-400/40">
                          {isAr ? 'الصلاة القادمة' : 'Next'}
                        </span>
                      )}
                      {todayLog && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          {todayLog.status === 'jamaah'
                            ? isAr
                              ? 'جماعة ★'
                              : 'Jamaah ★'
                            : isAr
                              ? 'تم الأداء'
                              : 'Prayed'}
                        </span>
                      )}
                    </div>

                    {insight && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                        <span>
                          {isAr
                            ? `أفضل وقت مقترح لك: +${insight.optimalOffsetMinutes} د بعد الأذان`
                            : `AI Optimal Window: +${insight.optimalOffsetMinutes}m after Adhan`}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-end">
                    <span
                      dir="ltr"
                      className={`tabular-nums text-sm font-extrabold sm:text-base ${
                        isNext ? 'text-amber-400' : 'text-foreground'
                      }`}
                    >
                      {isAr ? prayer.formatted12Ar : prayer.formatted12En}
                    </span>
                    <div className="text-[10px] text-muted-foreground tabular-nums" dir="ltr">
                      {prayer.formatted24}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleNotification(prayer.id, { enabled: !notif?.enabled })
                    }}
                    aria-label={isAr ? 'تفعيل أو إيقاف تنبيه الصلاة' : 'Toggle prayer alert'}
                    className={`rounded-xl p-2 transition ${
                      notif?.enabled
                        ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {notif?.enabled ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details: Quranic Verse, Smart Pre-Alert toggles, & Quick Habit Logger */}
              {isExpanded && (
                <div className="space-y-3 border-t border-border/60 bg-muted/30 p-3 text-xs">
                  {/* Quranic Verse Reminder */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{prayer.verseRefAr}</span>
                    </div>
                    <p className="mt-1 font-serif text-sm leading-relaxed text-foreground">
                      ﴿ {prayer.verseAr} ﴾
                    </p>
                    {!isAr && (
                      <p className="mt-1 text-[11px] italic text-muted-foreground">
                        {prayer.verseEn}
                      </p>
                    )}
                  </div>

                  {/* Notification Customization Pills (15m, 5m, Vibration) */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-muted-foreground">
                      {isAr ? 'تنبيهات ذكية مخصصة:' : 'Smart Alerts:'}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleNotification(prayer.id, { preAlert15: !notif?.preAlert15 })
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                          notif?.preAlert15
                            ? 'bg-emerald-600 text-white'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{isAr ? 'قبل 15 دقيقة' : '15m Before'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onToggleNotification(prayer.id, { preAlert5: !notif?.preAlert5 })
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                          notif?.preAlert5
                            ? 'bg-amber-500 text-emerald-950 font-semibold'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{isAr ? 'قبل 5 دقائق' : '5m Before'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onToggleNotification(prayer.id, { vibration: !notif?.vibration })
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                          notif?.vibration
                            ? 'bg-emerald-600/80 text-white'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <Vibrate className="h-3 w-3" />
                        <span>{isAr ? 'اهتزاز' : 'Vibrate'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Log Prayer Completion & Khushu */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2">
                    <span className="font-semibold text-muted-foreground">
                      {isAr ? 'تسجيل الأداء والخشوع:' : 'Log Prayer Status:'}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onLogPrayer(prayer.id, 'jamaah', 5)}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-emerald-500"
                      >
                        {isAr ? 'في جماعة (خشوع 5/5)' : 'In Congregation'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onLogPrayer(prayer.id, 'on_time', 4)}
                        className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground transition hover:bg-secondary/80"
                      >
                        {isAr ? 'في أول الوقت' : 'On Time'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onLogPrayer(prayer.id, 'late', 3)}
                        className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-300"
                      >
                        {isAr ? 'متأخراً' : 'Delayed'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
