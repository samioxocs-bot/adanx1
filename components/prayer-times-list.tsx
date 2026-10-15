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
  onLogPrayer: (
    prayerId: PrayerId,
    status: 'on_time' | 'jamaah' | 'late',
    khushu: number
  ) => void
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
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <h3 className="text-sm font-bold text-foreground sm:text-base">
            {isAr
              ? 'مواقيت الصلوات الخمس المفروضة (توقيت وزارة الأوقاف المغربية)'
              : 'Daily Obligatory Prayer Schedule'}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {isAr
              ? 'اضغط على أي صلاة لعرض الآية القرآنية وتخصيص التنبيهات الصوتية'
              : 'Tap any prayer for Quranic reminder and alert settings'}
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
          <Sunrise className="h-3.5 w-3.5 text-amber-500" />
          <span>{isAr ? 'الشروق:' : 'Sunrise:'}</span>
          <span dir="ltr" className="tabular-nums">
            {isAr
              ? schedule.sunrise.formatted12Ar
              : schedule.sunrise.formatted12En}
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
                  ? 'border-amber-500/60 bg-gradient-to-r from-primary/10 via-card to-amber-500/10 shadow-sm ring-1 ring-amber-500/30'
                  : 'border-border bg-card hover:border-primary/40 shadow-xs'
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
                className="flex cursor-pointer flex-wrap items-center justify-between gap-2 p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-serif text-sm font-bold ${
                      isNext
                        ? 'bg-amber-500 text-emerald-950 shadow-sm'
                        : todayLog
                          ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
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
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/40">
                          {isAr ? 'الصلاة القادمة' : 'Next'}
                        </span>
                      )}
                      {todayLog && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
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
                        <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>
                          {isAr
                            ? `أفضل وقت مقترح: +${insight.optimalOffsetMinutes} د بعد الأذان`
                            : `Optimal Window: +${insight.optimalOffsetMinutes}m after Adhan`}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-end">
                    <span
                      dir="ltr"
                      className={`tabular-nums text-sm font-extrabold sm:text-base ${
                        isNext
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-foreground'
                      }`}
                    >
                      {isAr ? prayer.formatted12Ar : prayer.formatted12En}
                    </span>
                    <div
                      className="text-[10px] font-semibold text-muted-foreground tabular-nums"
                      dir="ltr"
                    >
                      {prayer.formatted24}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleNotification(prayer.id, {
                        enabled: !notif?.enabled,
                      })
                    }}
                    aria-label={
                      isAr
                        ? 'تفعيل أو إيقاف تنبيه الصلاة'
                        : 'Toggle prayer alert'
                    }
                    className={`rounded-xl p-2 transition ${
                      notif?.enabled
                        ? 'bg-primary/15 text-primary hover:bg-primary/25'
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

              {/* Expanded Details */}
              {isExpanded && (
                <div className="space-y-3 border-t border-border/60 bg-muted/30 p-3.5 text-xs">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{prayer.verseRefAr}</span>
                    </div>
                    <p className="mt-1 font-serif text-sm sm:text-base leading-relaxed text-foreground">
                      ﴿ {prayer.verseAr} ﴾
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-muted-foreground">
                      {isAr ? 'تنبيهات استباقية:' : 'Smart Alerts:'}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleNotification(prayer.id, {
                            preAlert15: !notif?.preAlert15,
                          })
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                          notif?.preAlert15
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{isAr ? 'قبل 15 دقيقة' : '15m Before'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onToggleNotification(prayer.id, {
                            preAlert5: !notif?.preAlert5,
                          })
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                          notif?.preAlert5
                            ? 'bg-amber-500 text-emerald-950'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{isAr ? 'قبل 5 دقائق' : '5m Before'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onToggleNotification(prayer.id, {
                            vibration: !notif?.vibration,
                          })
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                          notif?.vibration
                            ? 'bg-primary/85 text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <Vibrate className="h-3 w-3" />
                        <span>{isAr ? 'اهتزاز' : 'Vibrate'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2">
                    <span className="font-semibold text-muted-foreground">
                      {isAr ? 'تسجيل الأداء:' : 'Log Prayer:'}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onLogPrayer(prayer.id, 'jamaah', 5)}
                        className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground transition hover:opacity-90"
                      >
                        {isAr ? 'في جماعة' : 'In Congregation'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onLogPrayer(prayer.id, 'on_time', 4)}
                        className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-bold text-secondary-foreground"
                      >
                        {isAr ? 'في أول الوقت' : 'On Time'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onLogPrayer(prayer.id, 'late', 3)}
                        className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300"
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
