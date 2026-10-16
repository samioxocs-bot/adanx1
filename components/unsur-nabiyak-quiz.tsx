'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Trophy,
  Clock,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  BookOpen,
  Compass,
  Shield,
  Users,
  Heart,
  ScrollText,
  Award,
  Flame,
  ArrowRight,
  Volume2,
  VolumeX,
  HelpCircle,
  Shuffle,
  Star,
} from 'lucide-react'

export interface QuizQuestion {
  id: string
  q: string
  options: string[]
  correctIndex: number
  difficulty: 'سهل' | 'متوسط' | 'صعب'
  points: number
  explanation: string
  source: string
}

export interface QuizCategory {
  id: string
  title: string
  subtitle: string
  totalQuestions: number
  questions: QuizQuestion[]
}

interface QuizDataset {
  version: string
  totalQuestions: number
  categories: QuizCategory[]
}

interface UserQuizStats {
  totalPoints: number
  totalAnswered: number
  totalCorrect: number
  bestStreak: number
  categoryScores: Record<string, { answered: number; correct: number; points: number }>
  seenIds: Record<string, string[]>
}

const STORAGE_KEY = 'morocco_prayer_unsur_nabiyak_stats_v1'

const DEFAULT_STATS: UserQuizStats = {
  totalPoints: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  categoryScores: {},
  seenIds: {},
}

const CATEGORY_META: Record<
  string,
  {
    icon: typeof BookOpen
    badge: string
    accentClass: string
  }
> = {
  'quran-stories': {
    icon: BookOpen,
    badge: '200 سؤال قرآني',
    accentClass: 'from-emerald-600/20 to-teal-700/10 border-emerald-500/30',
  },
  seerah: {
    icon: Compass,
    badge: '200 سؤال في السيرة',
    accentClass: 'from-amber-500/20 to-yellow-700/10 border-amber-500/30',
  },
  sahaba: {
    icon: Users,
    badge: '200 سؤال في الصحابة',
    accentClass: 'from-sky-500/20 to-blue-700/10 border-sky-500/30',
  },
  ghazawat: {
    icon: Shield,
    badge: '200 سؤال في الغزوات',
    accentClass: 'from-rose-500/20 to-red-700/10 border-rose-500/30',
  },
  'women-of-prophethood': {
    icon: Heart,
    badge: '200 سؤال في سيدات النبوة',
    accentClass: 'from-purple-500/20 to-fuchsia-700/10 border-purple-500/30',
  },
  hadith: {
    icon: ScrollText,
    badge: '200 سؤال في الحديث',
    accentClass: 'from-teal-500/20 to-emerald-700/10 border-teal-500/30',
  },
}

function getRankTitle(points: number): { title: string; nextAt: number; level: number } {
  if (points >= 5000) return { title: 'حامل لواء السنة والبيان', nextAt: 10000, level: 6 }
  if (points >= 2500) return { title: 'حافظ السيرة العطرة', nextAt: 5000, level: 5 }
  if (points >= 1200) return { title: 'فقيه الغزوات والتاريخ', nextAt: 2500, level: 4 }
  if (points >= 500) return { title: 'فارس المسابقة النبوية', nextAt: 1200, level: 3 }
  if (points >= 150) return { title: 'محب السيرة النبوية', nextAt: 500, level: 2 }
  return { title: 'طالب علم مبتدئ', nextAt: 150, level: 1 }
}

function playFeedbackTone(type: 'correct' | 'wrong' | 'tick' | 'win', enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    if (type === 'correct') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, now)
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12)
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      osc.start(now)
      osc.stop(now + 0.35)
    } else if (type === 'wrong') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(280, now)
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.25)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      osc.start(now)
      osc.stop(now + 0.3)
    } else if (type === 'tick') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, now)
      gain.gain.setValueAtTime(0.03, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
      osc.start(now)
      osc.stop(now + 0.05)
    } else if (type === 'win') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.setValueAtTime(554.37, now + 0.12)
      osc.frequency.setValueAtTime(659.25, now + 0.24)
      osc.frequency.setValueAtTime(880, now + 0.36)
      gain.gain.setValueAtTime(0.14, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
      osc.start(now)
      osc.stop(now + 0.6)
    }
  } catch {
    // ignore audio context errors
  }
}

export function UnsurNabiyakQuiz() {
  const [dataset, setDataset] = useState<QuizDataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserQuizStats>(DEFAULT_STATS)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Game settings & session state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [questionsPerRound, setQuestionsPerRound] = useState<number>(10)
  const [secondsPerQuestion, setSecondsPerQuestion] = useState<number>(25)

  const [roundQuestions, setRoundQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25)
  const [roundScore, setRoundScore] = useState(0)
  const [roundCorrect, setRoundCorrect] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [roundFinished, setRoundFinished] = useState(false)
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false)
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([])

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load offline dataset & saved stats
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setStats({ ...DEFAULT_STATS, ...JSON.parse(saved) })
      }
    } catch {
      // ignore
    }

    fetch('/data/unsur-nabiyak-quiz.json')
      .then(res => res.json())
      .then((data: QuizDataset) => {
        setDataset(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const saveStats = useCallback((updater: (prev: UserQuizStats) => UserQuizStats) => {
    setStats(prev => {
      const next = updater(prev)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  // Build a fresh randomized round of questions that prioritizes unseen questions
  // and reshuffles options every time the user restarts or exits!
  const startNewRound = useCallback(
    (categoryId: string, count = questionsPerRound, timerSec = secondsPerQuestion) => {
      if (!dataset) return

      let pool: QuizQuestion[] = []
      if (categoryId === 'all-mixed') {
        dataset.categories.forEach(c => {
          pool.push(...c.questions)
        })
      } else {
        const cat = dataset.categories.find(c => c.id === categoryId)
        if (!cat) return
        pool = [...cat.questions]
      }

      const seenList = stats.seenIds[categoryId] || []
      const seenSet = new Set(seenList)

      let unseen = pool.filter(q => !seenSet.has(q.id))
      // If unseen is less than needed, reset seen history for this category so all 200 cycle freshly
      let resetHistory = false
      if (unseen.length < count) {
        unseen = [...pool]
        resetHistory = true
      }

      // Fisher-Yates true random shuffle
      const shuffled = [...unseen]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }

      // Also randomize option order inside each selected question so choices change every time
      const picked = shuffled.slice(0, count).map(q => {
        const correctText = q.options[q.correctIndex]
        const opts = [...q.options]
        for (let i = opts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[opts[i], opts[j]] = [opts[j], opts[i]]
        }
        return {
          ...q,
          options: opts,
          correctIndex: opts.indexOf(correctText),
        }
      })

      // Record newly picked IDs into seenIds so exiting or restarting immediately gives new questions
      const newIds = picked.map(q => q.id)
      saveStats(prev => ({
        ...prev,
        seenIds: {
          ...prev.seenIds,
          [categoryId]: resetHistory ? newIds : [...(prev.seenIds[categoryId] || []), ...newIds],
        },
      }))

      setSelectedCategoryId(categoryId)
      setRoundQuestions(picked)
      setCurrentIndex(0)
      setSelectedOption(null)
      setIsAnswered(false)
      setTimeLeft(timerSec)
      setRoundScore(0)
      setRoundCorrect(0)
      setCurrentStreak(0)
      setRoundFinished(false)
      setFiftyFiftyUsed(false)
      setHiddenOptions([])
    },
    [dataset, questionsPerRound, secondsPerQuestion, stats.seenIds, saveStats]
  )

  // Countdown timer effect
  useEffect(() => {
    if (!selectedCategoryId || roundFinished || isAnswered || roundQuestions.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired -> mark as unanswered/wrong
          clearInterval(timerRef.current!)
          setIsAnswered(true)
          setSelectedOption(-1)
          setCurrentStreak(0)
          playFeedbackTone('wrong', soundEnabled)
          saveStats(s => ({
            ...s,
            totalAnswered: s.totalAnswered + 1,
          }))
          return 0
        }
        if (prev <= 5) {
          playFeedbackTone('tick', soundEnabled)
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [selectedCategoryId, roundFinished, isAnswered, roundQuestions.length, soundEnabled, saveStats])

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered || roundFinished) return
    const currentQ = roundQuestions[currentIndex]
    if (!currentQ) return

    setSelectedOption(optionIndex)
    setIsAnswered(true)

    const isCorrect = optionIndex === currentQ.correctIndex
    const speedBonus = Math.max(0, Math.floor((timeLeft / secondsPerQuestion) * 10))
    const streakBonus = currentStreak >= 2 ? currentStreak * 3 : 0
    const earnedPoints = isCorrect ? currentQ.points + speedBonus + streakBonus : 0

    if (isCorrect) {
      playFeedbackTone('correct', soundEnabled)
      const nextStreak = currentStreak + 1
      setCurrentStreak(nextStreak)
      setRoundScore(prev => prev + earnedPoints)
      setRoundCorrect(prev => prev + 1)

      const catKey = selectedCategoryId || 'all-mixed'
      saveStats(prev => {
        const catPrev = prev.categoryScores[catKey] || { answered: 0, correct: 0, points: 0 }
        return {
          ...prev,
          totalPoints: prev.totalPoints + earnedPoints,
          totalAnswered: prev.totalAnswered + 1,
          totalCorrect: prev.totalCorrect + 1,
          bestStreak: Math.max(prev.bestStreak, nextStreak),
          categoryScores: {
            ...prev.categoryScores,
            [catKey]: {
              answered: catPrev.answered + 1,
              correct: catPrev.correct + 1,
              points: catPrev.points + earnedPoints,
            },
          },
        }
      })
    } else {
      playFeedbackTone('wrong', soundEnabled)
      setCurrentStreak(0)
      const catKey = selectedCategoryId || 'all-mixed'
      saveStats(prev => {
        const catPrev = prev.categoryScores[catKey] || { answered: 0, correct: 0, points: 0 }
        return {
          ...prev,
          totalAnswered: prev.totalAnswered + 1,
          categoryScores: {
            ...prev.categoryScores,
            [catKey]: {
              ...catPrev,
              answered: catPrev.answered + 1,
            },
          },
        }
      })
    }
  }

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= roundQuestions.length) {
      setRoundFinished(true)
      playFeedbackTone('win', soundEnabled)
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
      setTimeLeft(secondsPerQuestion)
      setHiddenOptions([])
    }
  }

  const handleUseFiftyFifty = () => {
    if (fiftyFiftyUsed || isAnswered) return
    const currentQ = roundQuestions[currentIndex]
    if (!currentQ) return
    const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== currentQ.correctIndex)
    // Shuffle and hide 2 wrong options
    const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2)
    setHiddenOptions(toHide)
    setFiftyFiftyUsed(true)
  }

  const handleExitToCategories = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSelectedCategoryId(null)
    setRoundQuestions([])
    setRoundFinished(false)
  }

  const rank = getRankTitle(stats.totalPoints)

  if (loading) {
    return (
      <div className="luxury-card rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-base font-bold text-foreground">جاري تحميل موسوعة «انصر نبيك» (1200 سؤال بدون إنترنت)...</p>
      </div>
    )
  }

  const activeCategory =
    selectedCategoryId === 'all-mixed'
      ? {
          id: 'all-mixed',
          title: 'التحدي الشامل (جميع الأقسام)',
          subtitle: 'أسئلة متنوعة من الأقسام الستة (1200 سؤال)',
          totalQuestions: 1200,
          questions: [],
        }
      : dataset?.categories.find(c => c.id === selectedCategoryId)

  const currentQuestion = roundQuestions[currentIndex]

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="luxury-card rounded-2xl p-5 sm:p-6 border border-primary/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تعمل 100% بدون إنترنت • 1,200 سؤال موثق</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-foreground flex items-center gap-2.5">
              <span>مسابقة «انصر نبيك صلى الله عليه وسلم» الكبرى</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              تعلّم سيرة حبيبك المصطفى صلى الله عليه وسلم وقصص القرآن والصحابة والغزوات وسيدات النبوة والحديث الشريف عبر 200 سؤال متجدد لكل قسم تتغير تلقائياً عند كل جولة أو إعادة.
            </p>
          </div>

          {/* User Cumulative Score & Rank Card */}
          <div className="flex items-center gap-3 bg-secondary/70 border border-border rounded-2xl p-3.5 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">مجموع نقاطك:</span>
                <span className="text-lg font-bold tabular-nums text-primary">{stats.totalPoints} نقطة</span>
              </div>
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                <Award className="w-3.5 h-3.5 text-accent" />
                <span>الرتبة: {rank.title}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                إجابات صحيحة: {stats.totalCorrect} من {stats.totalAnswered} • أعلى سلسلة: {stats.bestStreak}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection Screen */}
      {!selectedCategoryId && (
        <div className="space-y-6">
          {/* Round Settings Bar */}
          <div className="luxury-card rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">عدد أسئلة الجولة:</span>
                <div className="flex items-center gap-1 bg-secondary rounded-xl p-1 border border-border">
                  {[10, 20, 50].map(num => (
                    <button
                      key={num}
                      onClick={() => setQuestionsPerRound(num)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        questionsPerRound === num
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {num} سؤالاً
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">مؤقت السؤال:</span>
                <div className="flex items-center gap-1 bg-secondary rounded-xl p-1 border border-border">
                  {[15, 25, 40].map(sec => (
                    <button
                      key={sec}
                      onClick={() => setSecondsPerQuestion(sec)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        secondsPerQuestion === sec
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {sec} ثانية
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary border border-border text-xs font-bold text-foreground hover:border-primary/40 transition-all"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                <span>{soundEnabled ? 'الصوت مفعّل' : 'الصوت مكتوم'}</span>
              </button>

              <button
                onClick={() => startNewRound('all-mixed')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-95 transition-all"
              >
                <Shuffle className="w-4 h-4" />
                <span>تحدي شامل عشوائي (1200 سؤال)</span>
              </button>
            </div>
          </div>

          {/* 6 Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataset?.categories.map(cat => {
              const meta = CATEGORY_META[cat.id] || CATEGORY_META['quran-stories']
              const Icon = meta.icon
              const catStat = stats.categoryScores[cat.id] || { answered: 0, correct: 0, points: 0 }
              const seenCount = (stats.seenIds[cat.id] || []).length

              return (
                <div
                  key={cat.id}
                  className={`luxury-card rounded-2xl p-5 border transition-all hover:scale-[1.01] hover:border-primary/50 flex flex-col justify-between bg-gradient-to-br ${meta.accentClass}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-card/90 border border-border flex items-center justify-center text-primary shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-card/90 border border-border text-[11px] font-bold text-primary">
                        {meta.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-serif text-foreground mb-1">{cat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{cat.subtitle}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>الأسئلة المكتشفة: {Math.min(200, seenCount)} / 200</span>
                      <span className="font-bold text-primary">{catStat.points} نقطة</span>
                    </div>

                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min(100, (seenCount / 200) * 100)}%` }}
                      />
                    </div>

                    <button
                      onClick={() => startNewRound(cat.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all"
                    >
                      <span>ابدأ جولة جديدة ({questionsPerRound} سؤالاً)</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Quiz Round Screen */}
      {selectedCategoryId && !roundFinished && currentQuestion && (
        <div className="luxury-card rounded-2xl p-5 sm:p-7 border border-primary/30 space-y-6">
          {/* Top Bar: Category, Question Counter, Timer, Score, Exit/Restart */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExitToCategories}
                className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground flex items-center gap-1.5 transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>الأقسام</span>
              </button>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">{activeCategory?.title}</h3>
                <p className="text-[11px] text-muted-foreground">
                  السؤال {currentIndex + 1} من {roundQuestions.length} • مستوى {currentQuestion.difficulty} ({currentQuestion.points} نقطة)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Streak */}
              {currentStreak > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{currentStreak} متتالية</span>
                </div>
              )}

              {/* Round Points */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-bold">
                <Star className="w-3.5 h-3.5" />
                <span>{roundScore} نقطة</span>
              </div>

              {/* Countdown Timer */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold tabular-nums transition-all ${
                  timeLeft <= 5
                    ? 'bg-destructive/15 border-destructive text-destructive animate-pulse'
                    : 'bg-secondary border-border text-foreground'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft} ث</span>
              </div>

              {/* Instant Change / Restart with New Questions */}
              <button
                onClick={() => startNewRound(selectedCategoryId)}
                title="تغيير الأسئلة وإعادة الجولة بأسئلة جديدة"
                className="p-2 rounded-xl bg-secondary hover:bg-primary/15 border border-border text-foreground hover:text-primary transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / roundQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-secondary/60 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                سؤال الاختيار من متعدد (QCM)
              </span>
              {!fiftyFiftyUsed && !isAnswered && (
                <button
                  onClick={handleUseFiftyFifty}
                  className="text-xs font-bold px-3 py-1 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 transition-all flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>حذف إجابتين (مرة في الجولة)</span>
                </button>
              )}
            </div>
            <p className="text-lg sm:text-xl font-bold font-serif text-foreground leading-relaxed">
              {currentQuestion.q}
            </p>
          </div>

          {/* 4 Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((opt, idx) => {
              const isHidden = hiddenOptions.includes(idx)
              if (isHidden) {
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border/30 bg-secondary/20 text-muted-foreground/40 text-xs text-center line-through select-none"
                  >
                    تم استبعاد هذا الخيار
                  </div>
                )
              }

              const isCorrectOption = idx === currentQuestion.correctIndex
              const isSelected = selectedOption === idx

              let btnStyle = 'bg-card hover:bg-secondary/80 border-border text-foreground'
              if (isAnswered) {
                if (isCorrectOption) {
                  btnStyle = 'bg-emerald-500/15 border-emerald-500 text-foreground ring-1 ring-emerald-500/40'
                } else if (isSelected && !isCorrectOption) {
                  btnStyle = 'bg-destructive/15 border-destructive text-foreground ring-1 ring-destructive/40'
                } else {
                  btnStyle = 'bg-card/50 border-border/50 text-muted-foreground opacity-70'
                }
              }

              const letters = ['أ', 'ب', 'ج', 'د']

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl border text-right transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isAnswered && isCorrectOption
                          ? 'bg-emerald-500 text-white'
                          : isAnswered && isSelected && !isCorrectOption
                          ? 'bg-destructive text-white'
                          : 'bg-secondary text-foreground border border-border'
                      }`}
                    >
                      {letters[idx]}
                    </span>
                    <span className="text-sm sm:text-base font-medium leading-relaxed">{opt}</span>
                  </div>

                  {isAnswered && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                  {isAnswered && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Explanation & Next Button after Answering */}
          {isAnswered && (
            <div className="p-4 sm:p-5 rounded-2xl bg-primary/10 border border-primary/30 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">
                  {selectedOption === currentQuestion.correctIndex
                    ? 'أحسنت! إجابة صحيحة وموفقة'
                    : selectedOption === -1
                    ? 'انتهى الوقت المحدد للسؤال'
                    : 'إجابة غير صحيحة — إليك الفائدة العلمية:'}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  المصدر: {currentQuestion.source}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">{currentQuestion.explanation}</p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:opacity-95 transition-all"
                >
                  <span>{currentIndex + 1 >= roundQuestions.length ? 'عرض النتيجة النهائية' : 'السؤال التالي'}</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Round Finished Summary Screen */}
      {selectedCategoryId && roundFinished && (
        <div className="luxury-card rounded-2xl p-6 sm:p-8 border border-primary/30 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary mx-auto">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-serif text-foreground">اكتملت جولة «{activeCategory?.title}»!</h3>
            <p className="text-sm text-muted-foreground">
              بارك الله في علمك؛ في كل مرة تعيد فيها الجولة أو تخرج وتعود ستظهر لك أسئلة جديدة من بنك الـ 200 سؤال الخاص بالقسم.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-secondary/70 border border-border">
              <div className="text-xs text-muted-foreground mb-1">نقاط الجولة</div>
              <div className="text-xl font-bold tabular-nums text-primary">+{roundScore}</div>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/70 border border-border">
              <div className="text-xs text-muted-foreground mb-1">الإجابات الصحيحة</div>
              <div className="text-xl font-bold tabular-nums text-emerald-500">
                {roundCorrect} / {roundQuestions.length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/70 border border-border">
              <div className="text-xs text-muted-foreground mb-1">الرصيد الكلي</div>
              <div className="text-xl font-bold tabular-nums text-accent">{stats.totalPoints}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startNewRound(selectedCategoryId)}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2 shadow-md hover:opacity-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>جولة جديدة بأسئلة مختلفة</span>
            </button>
            <button
              onClick={handleExitToCategories}
              className="px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-sm font-bold transition-all"
            >
              اختيار قسم آخر
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
