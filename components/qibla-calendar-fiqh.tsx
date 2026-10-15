'use client'

import React, { useState } from 'react'
import {
  Compass,
  Calendar,
  BookOpen,
  Share2,
  Check,
  RefreshCw,
} from 'lucide-react'
import {
  FIQH_TOPICS,
  formatTime12Ar,
  formatTime12En,
  type ComputedPrayerDay,
} from '@/lib/prayer-engine'

interface QiblaCalendarFiqhProps {
  schedule: ComputedPrayerDay
  lang: 'ar' | 'en'
  lastSyncedAt: string
}

export function QiblaCalendarFiqh({
  schedule,
  lang,
  lastSyncedAt,
}: QiblaCalendarFiqhProps) {
  const isAr = lang === 'ar'
  const [deviceHeading, setDeviceHeading] = useState<number>(0)
  const [selectedFiqhId, setSelectedFiqhId] = useState<string>(FIQH_TOPICS[0].id)
  const [copiedShare, setCopiedShare] = useState(false)

  const relativeRotation = (schedule.qiblaAngle - deviceHeading + 360) % 360
  const isAlignedWithKaaba =
    Math.abs(relativeRotation) < 8 || Math.abs(relativeRotation - 360) < 8

  const shareText = isAr
    ? `تذكير من تطبيق أذان المغرب والقرآن الكريم:\nالصلاة القادمة: ${schedule.nextPrayer.nameAr} عند الساعة ${schedule.nextPrayer.formatted12Ar}\n﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾`
    : `Reminder from Adan 2:\nNext Prayer: ${schedule.nextPrayer.nameEn} at ${schedule.nextPrayer.formatted12En}\n"Indeed, prayer has been decreed upon the believers a decree of specified times."`

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: isAr ? 'تذكير مواقيت الصلاة - أذان ٢' : 'Adan 2 Prayer Reminder',
          text: shareText,
        })
        return
      } catch {
        // fallback to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 3000)
    }
  }

  const upcomingIslamicEvents = [
    {
      nameAr: 'الأيام البيض (13-15 من الشهر الهجري)',
      nameEn: 'The Three White Days (13-15 Hijri)',
      descAr: 'صيام ثلاثة أيام من كل شهر هجري يعدل صيام الدهر',
      badgeAr: 'سنة مؤكدة',
    },
    {
      nameAr: 'شهر رمضان المبارك',
      nameEn: 'Blessed Month of Ramadan',
      descAr: 'إمساك وإفطار دقيق مع تنبيهات السحور والثلث الأخير من الليل',
      badgeAr: 'مفعل في الواجهة',
    },
    {
      nameAr: 'يوم عرفة ويوم عاشوراء',
      nameEn: 'Day of Arafah & Day of Ashura',
      descAr: 'تنبيهات استباقية لصيام الأيام الفاضلة ومضاعفة الأجور',
      badgeAr: 'تقويم الهجري',
    },
  ]

  const activeFiqh =
    FIQH_TOPICS.find((f) => f.id === selectedFiqhId) || FIQH_TOPICS[0]

  return (
    <section className="space-y-4">
      {/* 1. Accurate Interactive Qibla Compass */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">
              {isAr ? 'بوصلة القبلة الدقيقة' : 'Precision Qibla Compass'}
            </h3>
          </div>
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
            {schedule.qiblaAngle}° • {schedule.distanceToKaabaKm} km
          </span>
        </div>

        <div className="flex flex-col items-center gap-3 py-2">
          <div
            className={`relative flex h-44 w-44 items-center justify-center rounded-full border-2 transition-all duration-300 ${
              isAlignedWithKaaba
                ? 'border-amber-500 bg-primary/10 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                : 'border-primary/30 bg-secondary/50'
            }`}
          >
            {/* Cardinal points */}
            <span className="absolute top-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              N
            </span>
            <span className="absolute bottom-1.5 text-[10px] font-semibold text-muted-foreground">
              S
            </span>
            <span className="absolute right-2 text-[10px] font-semibold text-muted-foreground">
              E
            </span>
            <span className="absolute left-2 text-[10px] font-semibold text-muted-foreground">
              W
            </span>

            {/* Rotating Qibla Pointer */}
            <div
              style={{ transform: `rotate(${relativeRotation}deg)` }}
              className="flex h-32 w-32 items-center justify-center transition-transform duration-300"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                {/* Kaaba icon at top of pointer */}
                <rect
                  x="42"
                  y="6"
                  width="16"
                  height="14"
                  rx="2"
                  fill="#111827"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
                <line
                  x1="42"
                  y1="11"
                  x2="58"
                  y2="11"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
                {/* Golden Needle */}
                <polygon points="50,22 44,52 50,47 56,52" fill="#F59E0B" />
                <polygon
                  points="50,78 45,52 50,56 55,52"
                  fill="#10B981"
                  opacity="0.5"
                />
                <circle cx="50" cy="50" r="4" fill="#F59E0B" />
              </svg>
            </div>
          </div>

          <div className="w-full max-w-xs space-y-1 text-center">
            <label className="block text-[11px] text-muted-foreground">
              {isAr
                ? `محاكاة اتجاه الهاتف (${deviceHeading}°) — حرك المؤشر لمطابقة الكعبة:`
                : `Simulate Device Heading (${deviceHeading}°):`}
            </label>
            <input
              type="range"
              min={0}
              max={359}
              value={deviceHeading}
              onChange={(e) => setDeviceHeading(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            {isAlignedWithKaaba && (
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {isAr
                  ? '✓ أنت الآن متجه تماماً نحو الكعبة المشرفة'
                  : '✓ Perfectly aligned with the Holy Kaaba'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Islamic Fiqh of Prayer Encyclopedia (Maliki & General Rulings) */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? 'موسوعة الأحكام الفقهية للصلاة (المذهب المالكي)' : 'Fiqh Rulings of Prayer'}
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FIQH_TOPICS.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setSelectedFiqhId(topic.id)}
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                selectedFiqhId === topic.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {isAr ? topic.titleAr : topic.titleEn}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-primary/20 bg-muted/30 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {isAr ? activeFiqh.titleAr : activeFiqh.titleEn}
            </span>
            <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
              {isAr ? activeFiqh.categoryAr : activeFiqh.categoryEn}
            </span>
          </div>
          <p className="text-muted-foreground">
            {isAr ? activeFiqh.summaryAr : activeFiqh.summaryEn}
          </p>
          <ul className="list-disc space-y-1 ps-4 text-foreground">
            {activeFiqh.detailsAr.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
          <p className="border-t border-border/50 pt-2 font-serif text-xs font-bold text-amber-700 dark:text-amber-300">
            {activeFiqh.evidenceAr}
          </p>
        </div>
      </div>

      {/* 3. Hijri & Gregorian Calendar + Social Reminder Sharing */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Calendar className="h-4 w-4 text-amber-500" />
            <span>
              {isAr
                ? 'التقويم الهجري والمواسم الإيمانية'
                : 'Hijri Calendar & Seasons'}
            </span>
          </div>
          <div className="space-y-1.5">
            {upcomingIslamicEvents.map((ev, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-muted/40 p-2 text-[11px] flex items-start justify-between gap-2"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {isAr ? ev.nameAr : ev.nameEn}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {ev.descAr}
                  </p>
                </div>
                <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                  {ev.badgeAr}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {isAr
                  ? 'مشاركة التذكير وحفظ البيانات محلياً'
                  : 'Share Reminder & Local Sync'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                <RefreshCw className="h-3 w-3" />
                {isAr ? 'محفوظ دون إنترنت' : 'Saved Offline'}
              </span>
            </div>
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-2.5 text-[11px] leading-relaxed text-foreground whitespace-pre-line">
              {shareText}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground">
              {isAr
                ? `آخر تحديث: ${formatTime12Ar(new Date(lastSyncedAt))}`
                : `Last updated: ${formatTime12En(new Date(lastSyncedAt))}`}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-emerald-950 transition hover:bg-amber-400"
            >
              {copiedShare ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{isAr ? 'نشر التذكير' : 'Share Reminder'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
