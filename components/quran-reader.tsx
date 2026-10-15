'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  BookOpen,
  Search,
  Play,
  Pause,
  Download,
  CheckCircle2,
  Bookmark,
  Volume2,
  Loader2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

export interface QuranAyah {
  number: number
  numberInSurah: number
  text: string
  juz: number
  page: number
}

export interface QuranSurah {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  revelationType: 'Meccan' | 'Medinan'
  ayahs: QuranAyah[]
}

interface QuranReaderProps {
  lang: 'ar' | 'en'
}

const QURAN_TEXT_CACHE = 'adan2-offline-quran-text-v1'
const QURAN_AUDIO_CACHE = 'adan2-offline-quran-audio-v1'

// السور المدمجة محلياً داخل حزمة التطبيق وتعمل فوراً بدون إنترنت
const BUNDLED_SURAH_NUMBERS = new Set([1, 36, 67, 112, 113, 114])

function padSurahNumber(num: number): string {
  return String(num).padStart(3, '0')
}

export function getSurahAudioUrl(surahNum: number): string {
  const padded = padSurahNumber(surahNum)
  if (BUNDLED_SURAH_NUMBERS.has(surahNum)) {
    return `/audio/quran/${padded}.mp3`
  }
  return `https://server8.mp3quran.net/afs/${padded}.mp3`
}

export function QuranReader({ lang }: QuranReaderProps) {
  const isAr = lang === 'ar'
  const [surahs, setSurahs] = useState<QuranSurah[]>([])
  const [loadingText, setLoadingText] = useState(true)
  const [textOfflineReady, setTextOfflineReady] = useState(false)
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [bookmarkedSurah, setBookmarkedSurah] = useState<number>(1)
  const [bookmarkedAyah, setBookmarkedAyah] = useState<number>(1)

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingSurahNum, setPlayingSurahNum] = useState<number | null>(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [cachedAudioSurahs, setCachedAudioSurahs] = useState<Set<number>>(
    () => new Set(BUNDLED_SURAH_NUMBERS)
  )
  const [downloadingSurah, setDownloadingSurah] = useState<number | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load saved bookmark
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adan2_quran_bookmark')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.surah) {
          setBookmarkedSurah(parsed.surah)
          setSelectedSurahNum(parsed.surah)
        }
        if (parsed.ayah) setBookmarkedAyah(parsed.ayah)
      }
    } catch {
      // ignore
    }
  }, [])

  // Load complete 114 Surahs from local static file (/data/quran-uthmani.json) and persist in CacheStorage
  useEffect(() => {
    let mounted = true
    async function loadQuranData() {
      setLoadingText(true)
      try {
        let res: Response | undefined
        if ('caches' in window) {
          try {
            const cache = await window.caches.open(QURAN_TEXT_CACHE)
            res = await cache.match('/data/quran-uthmani.json')
            if (!res) {
              const fetched = await fetch('/data/quran-uthmani.json')
              if (fetched.ok) {
                await cache.put('/data/quran-uthmani.json', fetched.clone())
                res = fetched
              }
            }
          } catch {
            res = await fetch('/data/quran-uthmani.json')
          }
        } else {
          res = await fetch('/data/quran-uthmani.json')
        }

        if (res && res.ok) {
          const json = await res.json()
          if (mounted && Array.isArray(json.surahs)) {
            setSurahs(json.surahs)
            setTextOfflineReady(true)
          }
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoadingText(false)
      }
    }

    async function checkCachedAudio() {
      if (!('caches' in window)) return
      try {
        const cache = await window.caches.open(QURAN_AUDIO_CACHE)
        const keys = await cache.keys()
        const nextSet = new Set<number>(BUNDLED_SURAH_NUMBERS)
        for (const req of keys) {
          const match = req.url.match(/\/(\d{3})\.mp3$/)
          if (match) {
            nextSet.add(parseInt(match[1], 10))
          }
        }
        if (mounted) setCachedAudioSurahs(nextSet)
      } catch {
        // ignore
      }
    }

    loadQuranData()
    checkCachedAudio()

    return () => {
      mounted = false
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const activeSurah =
    surahs.find((s) => s.number === selectedSurahNum) || surahs[0]

  const filteredSurahs = surahs.filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.trim().toLowerCase()
    return (
      s.name.includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      String(s.number) === q
    )
  })

  const handleSaveBookmark = (surahNum: number, ayahNum: number) => {
    setBookmarkedSurah(surahNum)
    setBookmarkedAyah(ayahNum)
    try {
      localStorage.setItem(
        'adan2_quran_bookmark',
        JSON.stringify({ surah: surahNum, ayah: ayahNum })
      )
    } catch {
      // ignore
    }
  }

  const handlePlaySurahAudio = async (surahNum: number) => {
    if (isPlaying && playingSurahNum === surahNum && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const rawUrl = getSurahAudioUrl(surahNum)
    let playSrc = rawUrl

    // Check CacheStorage for offline blob
    if ('caches' in window) {
      try {
        const cache = await window.caches.open(QURAN_AUDIO_CACHE)
        const matched = await cache.match(rawUrl)
        if (matched && matched.ok) {
          const blob = await matched.blob()
          playSrc = URL.createObjectURL(blob)
        }
      } catch {
        // fallback to rawUrl
      }
    }

    const audio = new Audio(playSrc)
    audioRef.current = audio
    setPlayingSurahNum(surahNum)
    setIsPlaying(true)
    setAudioProgress(0)

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setAudioDuration(Math.round(audio.duration))
      }
    })

    audio.addEventListener('timeupdate', () => {
      setAudioProgress(Math.round(audio.currentTime))
      if (audio.duration && Number.isFinite(audio.duration)) {
        setAudioDuration(Math.round(audio.duration))
      }
    })

    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setAudioProgress(0)
    })

    audio.addEventListener('error', () => {
      setIsPlaying(false)
    })

    audio.play().catch(() => {
      setIsPlaying(false)
    })
  }

  const handleDownloadSurahOffline = async (surahNum: number) => {
    if (cachedAudioSurahs.has(surahNum) || downloadingSurah === surahNum) return
    setDownloadingSurah(surahNum)
    try {
      const url = getSurahAudioUrl(surahNum)
      const response = await fetch(url)
      if (response.ok && 'caches' in window) {
        const cache = await window.caches.open(QURAN_AUDIO_CACHE)
        await cache.put(url, response.clone())
        setCachedAudioSurahs((prev) => {
          const next = new Set(prev)
          next.add(surahNum)
          return next
        })
      }
    } catch {
      // ignore offline error
    } finally {
      setDownloadingSurah(null)
    }
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <section className="space-y-4">
      {/* Top Quran Header & Offline Status Banner */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-sm font-bold text-foreground sm:text-base">
                  {isAr
                    ? 'القرآن الكريم كاملاً (114 سورة بالرسم العثماني المعتمد)'
                    : 'The Noble Quran (Complete 114 Surahs - Uthmani Script)'}
                </h2>
                {textOfflineReady && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    {isAr
                      ? 'النص الكامل والتلاوات الأساسية محفوظة بدون إنترنت'
                      : 'Full Text & Core Recitations Offline Ready'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isAr
                  ? 'قراءة واستماع بدون إنترنت • تلاوة الشيخ مشاري راشد العفاسي مع إمكانية التنزيل المسبق لأي سورة'
                  : 'Offline Quran Reading & Audio Recitation with Pre-download Support'}
              </p>
            </div>
          </div>

          {/* Font Size & Bookmark Quick Jump */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedSurahNum(bookmarkedSurah)}
              className="inline-flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-300 transition hover:bg-amber-500/20"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>
                {isAr
                  ? `علامة الحفظ (سورة #${bookmarkedSurah} آية ${bookmarkedAyah})`
                  : `Bookmark (${bookmarkedSurah}:${bookmarkedAyah})`}
              </span>
            </button>

            <div className="flex items-center rounded-xl border border-border bg-secondary p-0.5 text-xs">
              {(['sm', 'md', 'lg'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setFontSize(sz)}
                  className={`rounded-lg px-2 py-1 font-bold transition ${
                    fontSize === sz
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sz === 'sm' ? 'أ-' : sz === 'md' ? 'أ' : 'أ+'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audio Recitation Bar for Active Surah */}
        {activeSurah && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handlePlaySurahAudio(activeSurah.number)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition hover:opacity-90"
                aria-label={isAr ? 'تشغيل أو إيقاف التلاوة' : 'Play or pause recitation'}
              >
                {isPlaying && playingSurahNum === activeSurah.number ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-sm font-bold text-foreground">
                    {activeSurah.name} ({activeSurah.englishName})
                  </span>
                  <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                    {activeSurah.revelationType === 'Meccan'
                      ? isAr
                        ? 'مكية'
                        : 'Meccan'
                      : isAr
                        ? 'مدنية'
                        : 'Medinan'}{' '}
                    • {activeSurah.ayahs.length} {isAr ? 'آية' : 'Ayahs'}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Volume2 className="h-3 w-3 text-primary" />
                  <span>
                    {isAr
                      ? 'القارئ: الشيخ مشاري راشد العفاسي'
                      : 'Reciter: Mishary Rashid Alafasy'}
                  </span>
                  {playingSurahNum === activeSurah.number && audioDuration > 0 && (
                    <span dir="ltr" className="font-mono text-[10px] font-bold text-primary ms-2">
                      {formatSeconds(audioProgress)} / {formatSeconds(audioDuration)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cachedAudioSurahs.has(activeSurah.number) ? (
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/15 px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    {isAr ? 'التلاوة متاحة بدون إنترنت' : 'Audio Offline Ready'}
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDownloadSurahOffline(activeSurah.number)}
                  disabled={downloadingSurah === activeSurah.number}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-card px-2.5 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/10 disabled:opacity-50"
                >
                  {downloadingSurah === activeSurah.number ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{isAr ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      <span>
                        {isAr ? 'تنزيل التلاوة بدون إنترنت' : 'Download Offline'}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout: Surah Index + Mushaf Reader */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left/Right Sidebar: Surah Directory (114 Surahs) */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-3 shadow-sm flex flex-col max-h-[580px]">
          <div className="relative mb-2.5">
            <Search className="h-4 w-4 text-muted-foreground absolute top-2.5 start-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث باسم السورة أو رقمها (1 - 114)...'
                  : 'Search Surah name or number (1-114)...'
              }
              className="w-full rounded-xl border border-border bg-muted/40 py-2 ps-9 pe-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pe-1">
            {loadingText ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs">
                  {isAr
                    ? 'جارٍ تحميل المصحف الشريف كاملاً...'
                    : 'Loading Complete Noble Quran...'}
                </span>
              </div>
            ) : (
              filteredSurahs.map((surah) => {
                const isSelected = surah.number === selectedSurahNum
                const isOfflineAudio = cachedAudioSurahs.has(surah.number)
                return (
                  <button
                    key={surah.number}
                    type="button"
                    onClick={() => setSelectedSurahNum(surah.number)}
                    className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-start transition ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-secondary/70 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                          isSelected
                            ? 'bg-black/20 text-white'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        {surah.number}
                      </span>
                      <div>
                        <p className="font-serif text-sm font-bold leading-tight">
                          {surah.name}
                        </p>
                        <p
                          className={`text-[10px] ${
                            isSelected
                              ? 'text-primary-foreground/80'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {surah.englishName} • {surah.ayahs.length}{' '}
                          {isAr ? 'آية' : 'Ayahs'}
                        </p>
                      </div>
                    </div>

                    {isOfflineAudio && (
                      <span
                        title={
                          isAr
                            ? 'صوت السورة متاح بدون إنترنت'
                            : 'Offline audio available'
                        }
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-primary/15 text-primary'
                        }`}
                      >
                        {isAr ? 'صوت محلي' : 'Offline'}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Mushaf Reading Pane */}
        <div className="lg:col-span-8 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm flex flex-col justify-between max-h-[580px] overflow-y-auto">
          {activeSurah ? (
            <div className="space-y-4">
              {/* Surah Ornate Banner */}
              <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-r from-primary/15 via-amber-500/10 to-primary/15 px-4 py-3 text-center">
                <button
                  type="button"
                  disabled={activeSurah.number <= 1}
                  onClick={() =>
                    setSelectedSurahNum((n) => Math.max(1, n - 1))
                  }
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span>{isAr ? 'السابقة' : 'Prev'}</span>
                </button>

                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground sm:text-2xl">
                    {activeSurah.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {isAr
                      ? `ترتيبها ${activeSurah.number} • آياتها ${activeSurah.ayahs.length} • الجزء ${activeSurah.ayahs[0]?.juz || 1}`
                      : `Surah #${activeSurah.number} • ${activeSurah.ayahs.length} Ayahs • Juz ${activeSurah.ayahs[0]?.juz || 1}`}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={activeSurah.number >= 114}
                  onClick={() =>
                    setSelectedSurahNum((n) => Math.min(114, n + 1))
                  }
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground disabled:opacity-40"
                >
                  <span>{isAr ? 'التالية' : 'Next'}</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Basmala (for all Surahs except At-Tawbah #9 and Al-Fatihah #1 where it's Ayah 1) */}
              {activeSurah.number !== 1 && activeSurah.number !== 9 && (
                <div className="py-2 text-center font-serif text-xl font-bold text-primary sm:text-2xl">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>
              )}

              {/* Continuous Uthmani Mushaf Text */}
              <div
                dir="rtl"
                className={`rounded-2xl border border-border/70 bg-muted/20 p-4 sm:p-6 font-serif leading-[2.35] text-justify text-foreground select-text ${
                  fontSize === 'sm'
                    ? 'text-lg'
                    : fontSize === 'md'
                      ? 'text-xl sm:text-2xl'
                      : 'text-2xl sm:text-3xl'
                }`}
              >
                {activeSurah.ayahs.map((ayah) => {
                  const isBookmarked =
                    bookmarkedSurah === activeSurah.number &&
                    bookmarkedAyah === ayah.numberInSurah
                  // Strip duplicate Basmala from Ayah 1 in Surahs other than 1 and 9 if included in Uthmani string
                  let displayText = ayah.text
                  if (
                    activeSurah.number !== 1 &&
                    activeSurah.number !== 9 &&
                    ayah.numberInSurah === 1
                  ) {
                    displayText = displayText
                      .replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '')
                      .trim()
                  }

                  return (
                    <span
                      key={ayah.number}
                      onClick={() =>
                        handleSaveBookmark(
                          activeSurah.number,
                          ayah.numberInSurah
                        )
                      }
                      title={
                        isAr
                          ? 'اضغط لحفظ علامة القراءة عند هذه الآية'
                          : 'Click to bookmark this Ayah'
                      }
                      className={`inline cursor-pointer rounded px-1 transition ${
                        isBookmarked
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/40'
                          : 'hover:bg-primary/10'
                      }`}
                    >
                      {displayText}{' '}
                      <span className="mx-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-500/50 bg-amber-500/10 font-sans text-xs font-extrabold text-amber-700 dark:text-amber-300 align-middle">
                        {ayah.numberInSurah}
                      </span>{' '}
                    </span>
                  )
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>
                  {isAr
                    ? '💡 نصيحة: اضغط على أي آية لحفظ موضع قراءتك والعودة إليه لاحقاً بدون إنترنت.'
                    : 'Tip: Click any Ayah to save your reading bookmark offline.'}
                </span>
                <span className="font-serif font-bold text-primary">
                  صَدَقَ اللَّهُ الْعَظِيمُ
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
