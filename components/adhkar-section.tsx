'use client'

import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  BookOpen,
} from 'lucide-react'
import {
  ADHKAR_CATEGORIES,
  AUTHENTIC_ADHKAR_LIST,
  type AdhkarCategoryId,
} from '@/lib/adhkar-data'
import { triggerVibration } from '@/lib/audio-adhan'

interface AdhkarSectionProps {
  lang: 'ar' | 'en'
}

export function AdhkarSection({ lang }: AdhkarSectionProps) {
  const isAr = lang === 'ar'
  const [selectedCategory, setSelectedCategory] =
    useState<AdhkarCategoryId>('morning')
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})

  // Load saved progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adan2_adhkar_progress')
      if (saved) {
        setProgressMap(JSON.parse(saved))
      }
    } catch {
      // ignore
    }
  }, [])

  const saveProgress = (nextMap: Record<string, number>) => {
    setProgressMap(nextMap)
    try {
      localStorage.setItem('adan2_adhkar_progress', JSON.stringify(nextMap))
    } catch {
      // ignore
    }
  }

  const categoryItems = AUTHENTIC_ADHKAR_LIST.filter(
    (item) => item.categoryId === selectedCategory
  )
  const activeCatMeta =
    ADHKAR_CATEGORIES.find((c) => c.id === selectedCategory) ||
    ADHKAR_CATEGORIES[0]

  const completedInCategory = categoryItems.filter(
    (item) => (progressMap[item.id] || 0) >= item.repeatCount
  ).length

  const handleTapDhikr = (id: string, target: number) => {
    const current = progressMap[id] || 0
    if (current >= target) return
    const next = current + 1
    triggerVibration(next === target ? [120, 60, 120] : [25])
    saveProgress({
      ...progressMap,
      [id]: next,
    })
  }

  const handleResetCategory = () => {
    const next = { ...progressMap }
    for (const item of categoryItems) {
      delete next[item.id]
    }
    saveProgress(next)
  }

  return (
    <section className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-sm font-bold text-foreground sm:text-base">
                {isAr
                  ? 'حصن المسلم — الأذكار والأدعية النبوية الصحيحة'
                  : 'Hisn Al-Muslim — Authentic Islamic Adhkar'}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                <ShieldCheck className="h-3 w-3" />
                {isAr ? 'متاحة بالكامل بدون إنترنت' : '100% Offline Ready'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isAr
                ? activeCatMeta.descAr
                : 'Authentic prophetic supplications with interactive repetition counter'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-border bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground">
            {isAr
              ? `الإنجاز: ${completedInCategory} / ${categoryItems.length}`
              : `Done: ${completedInCategory} / ${categoryItems.length}`}
          </span>
          <button
            type="button"
            onClick={handleResetCategory}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{isAr ? 'إعادة القسم' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        {ADHKAR_CATEGORIES.map((cat) => {
          const isSelected = cat.id === selectedCategory
          const catList = AUTHENTIC_ADHKAR_LIST.filter(
            (i) => i.categoryId === cat.id
          )
          const catDone = catList.filter(
            (i) => (progressMap[i.id] || 0) >= i.repeatCount
          ).length
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-start justify-between rounded-xl border p-2.5 text-start transition ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-foreground hover:bg-secondary/70'
              }`}
            >
              <span className="text-xs font-bold">
                {isAr ? cat.nameAr : cat.nameEn}
              </span>
              <span
                className={`mt-1 text-[10px] font-semibold ${
                  isSelected
                    ? 'text-primary-foreground/85'
                    : 'text-muted-foreground'
                }`}
              >
                {catDone}/{catList.length} {isAr ? 'مكتمل' : 'Done'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Adhkar Cards List */}
      <div className="space-y-3">
        {categoryItems.map((item) => {
          const count = progressMap[item.id] || 0
          const isCompleted = count >= item.repeatCount
          const remaining = Math.max(0, item.repeatCount - count)

          return (
            <div
              key={item.id}
              onClick={() => handleTapDhikr(item.id, item.repeatCount)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTapDhikr(item.id, item.repeatCount)
                }
              }}
              className={`cursor-pointer rounded-2xl border p-4 transition select-none ${
                isCompleted
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-border bg-card hover:border-primary/40 shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    {item.titleAr}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{isAr ? 'تم الإنجاز' : 'Completed'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                      <span>
                        {isAr
                          ? `اضغط للتكرار: متبقٍ ${remaining} من ${item.repeatCount}`
                          : `Tap: ${remaining} / ${item.repeatCount} left`}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <p className="font-serif text-lg sm:text-xl leading-loose text-foreground py-2">
                {item.textAr}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                <span>
                  <strong className="text-primary">
                    {isAr ? 'الفضل: ' : 'Virtue: '}
                  </strong>
                  {item.virtueAr}
                </span>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                  {item.sourceAr}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
