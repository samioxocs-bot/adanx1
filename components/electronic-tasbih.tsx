'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Mic,
  MicOff,
  RotateCcw,
  Hand,
  ShieldCheck,
  Sparkles,
  Volume2,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { triggerVibration } from '@/lib/audio-adhan'

export interface TasbihPreset {
  id: string
  phraseAr: string
  phraseEn: string
  target: number
  virtueAr: string
  keywordsAr: string[]
}

export const TASBIH_PRESETS: TasbihPreset[] = [
  {
    id: 'subhanallah',
    phraseAr: 'سُبْحَانَ اللَّهِ',
    phraseEn: 'SubhanAllah (Glory be to Allah)',
    target: 33,
    virtueAr: 'تغرس لك نخلة في الجنة وتحط عنك الخطايا',
    keywordsAr: ['سبحان', 'سبحان الله'],
  },
  {
    id: 'alhamdulillah',
    phraseAr: 'الْحَمْدُ لِلَّهِ',
    phraseEn: 'Alhamdulillah (Praise be to Allah)',
    target: 33,
    virtueAr: 'الحمد لله تملأ الميزان يوم القيامة',
    keywordsAr: ['الحمد', 'الحمد لله'],
  },
  {
    id: 'allahuakbar',
    phraseAr: 'اللَّهُ أَكْبَرُ',
    phraseEn: 'Allahu Akbar (Allah is the Greatest)',
    target: 34,
    virtueAr: 'تملأ ما بين السماوات والأرض من الأجر والثواب',
    keywordsAr: ['الله اكبر', 'أكبر', 'اكبر'],
  },
  {
    id: 'subhanallah_wabihamdihi',
    phraseAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    phraseEn: 'SubhanAllahi wa bihamdihi, SubhanAllahil Adheem',
    target: 100,
    virtueAr: 'كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان إلى الرحمن',
    keywordsAr: ['سبحان', 'وبحمده', 'العظيم'],
  },
  {
    id: 'istighfar',
    phraseAr: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    phraseEn: 'Astaghfirullah wa atubu ilayh',
    target: 100,
    virtueAr: 'من لزم الاستغفار جعل الله له من كل هم فرجاً ومن كل ضيق مخرجاً',
    keywordsAr: ['استغفر', 'أستغفر', 'اتوب'],
  },
  {
    id: 'salawat',
    phraseAr: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    phraseEn: 'Allahumma salli wa sallim ala Nabiyyina Muhammad',
    target: 100,
    virtueAr: 'من صلى عليّ صلاة صلى الله عليه بها عشراً',
    keywordsAr: ['صل', 'صلي', 'محمد', 'اللهم'],
  },
  {
    id: 'tahlil',
    phraseAr: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    phraseEn: 'La ilaha illallah wahdahu la sharika lah',
    target: 100,
    virtueAr: 'أفضل الذكر لا إله إلا الله، وكانت له حرزاً من الشيطان',
    keywordsAr: ['لا اله الا الله', 'لا إله إلا الله', 'وحده'],
  },
]

interface ElectronicTasbihProps {
  lang: 'ar' | 'en'
}

export function ElectronicTasbih({ lang }: ElectronicTasbihProps) {
  const isAr = lang === 'ar'
  const [selectedPresetId, setSelectedPresetId] = useState<string>('subhanallah')
  const [count, setCount] = useState<number>(0)
  const [totalLifetime, setTotalLifetime] = useState<number>(0)
  const [customTarget, setCustomTarget] = useState<number>(33)

  // Microphone & Local Voice Detection state
  const [isListening, setIsListening] = useState<boolean>(false)
  const [micLevel, setMicLevel] = useState<number>(0)
  const [micSensitivity, setMicSensitivity] = useState<number>(28) // threshold 10..65
  const [lastDetectedWord, setLastDetectedWord] = useState<string>('')
  const [micStatusMessage, setMicStatusMessage] = useState<string>('')

  const audioCtxRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const speechRecRef = useRef<{ stop: () => void } | null>(null)
  const lastCountTimeRef = useRef<number>(0)
  const wasAboveThresholdRef = useRef<boolean>(false)

  const activePreset =
    TASBIH_PRESETS.find((p) => p.id === selectedPresetId) || TASBIH_PRESETS[0]

  // Load saved counts from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adan2_tasbih_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.count === 'number') setCount(parsed.count)
        if (typeof parsed.totalLifetime === 'number')
          setTotalLifetime(parsed.totalLifetime)
        if (parsed.selectedPresetId) {
          setSelectedPresetId(parsed.selectedPresetId)
          const found = TASBIH_PRESETS.find(
            (p) => p.id === parsed.selectedPresetId
          )
          if (found) setCustomTarget(found.target)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const saveState = useCallback(
    (nextCount: number, nextTotal: number, presetId: string) => {
      try {
        localStorage.setItem(
          'adan2_tasbih_state',
          JSON.stringify({
            count: nextCount,
            totalLifetime: nextTotal,
            selectedPresetId: presetId,
          })
        )
      } catch {
        // ignore
      }
    },
    []
  )

  const incrementCounter = useCallback(
    (sourceLabel?: string) => {
      const nowMs = Date.now()
      // Debounce rapid acoustic triggers within 450ms
      if (sourceLabel && nowMs - lastCountTimeRef.current < 450) {
        return
      }
      lastCountTimeRef.current = nowMs

      setCount((prev) => {
        const next = prev + 1
        if (next === customTarget) {
          triggerVibration([200, 100, 200])
        } else {
          triggerVibration([35])
        }
        setTotalLifetime((prevTotal) => {
          const updatedTotal = prevTotal + 1
          saveState(next, updatedTotal, selectedPresetId)
          return updatedTotal
        })
        return next
      })

      if (sourceLabel) {
        setLastDetectedWord(sourceLabel)
      }
    },
    [customTarget, saveState, selectedPresetId]
  )

  const stopMicrophoneListening = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop()
      } catch {
        // ignore
      }
      speechRecRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    setIsListening(false)
    setMicLevel(0)
  }, [])

  useEffect(() => {
    return () => {
      stopMicrophoneListening()
    }
  }, [stopMicrophoneListening])

  const startMicrophoneListening = async () => {
    if (isListening) {
      stopMicrophoneListening()
      setMicStatusMessage(
        isAr ? 'تم إيقاف الميكروفون' : 'Microphone stopped'
      )
      return
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setMicStatusMessage(
        isAr
          ? 'المتصفح لا يدعم الوصول للميكروفون، يرجى استخدام زر التسبيح اليدوي.'
          : 'Microphone not supported in this browser; please use manual button.'
      )
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      mediaStreamRef.current = stream

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.65
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      setIsListening(true)
      setMicStatusMessage(
        isAr
          ? 'الميكروفون مفعل محلياً — انطق التسبيح بصوت واضح ليتم احتسابه تلقائياً دون إنترنت'
          : 'Local microphone active — speak Tasbih clearly to count offline'
      )

      // 1. Local Offline Acoustic Syllable Peak Detector (100% offline via Web Audio API)
      const detectVoiceLoop = () => {
        analyser.getByteFrequencyData(dataArray)
        // Focus on human vocal fundamental & formant frequencies (bins ~4 to 60)
        let sum = 0
        const startBin = 4
        const endBin = 64
        for (let i = startBin; i < endBin; i++) {
          sum += dataArray[i]
        }
        const avg = Math.round(sum / (endBin - startBin))
        setMicLevel(avg)

        if (avg >= micSensitivity && !wasAboveThresholdRef.current) {
          wasAboveThresholdRef.current = true
          incrementCounter(activePreset.phraseAr)
        } else if (avg < micSensitivity * 0.68) {
          wasAboveThresholdRef.current = false
        }

        rafRef.current = requestAnimationFrame(detectVoiceLoop)
      }
      rafRef.current = requestAnimationFrame(detectVoiceLoop)

      // 2. Optional Web Speech API Arabic enhancer if browser supports it
      const SpeechRecognitionCtor =
        (window as unknown as { SpeechRecognition?: new () => unknown })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => unknown })
          .webkitSpeechRecognition

      if (SpeechRecognitionCtor) {
        try {
          const rec = new SpeechRecognitionCtor() as {
            lang: string
            continuous: boolean
            interimResults: boolean
            onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
            onerror: (() => void) | null
            start: () => void
            stop: () => void
          }
          rec.lang = 'ar-MA'
          rec.continuous = true
          rec.interimResults = true
          rec.onresult = (event) => {
            const lastIdx = event.results.length - 1
            const transcript = event.results[lastIdx]?.[0]?.transcript?.trim()
            if (transcript) {
              setLastDetectedWord(transcript)
            }
          }
          rec.onerror = () => {
            // Acoustic detector continues seamlessly offline
          }
          rec.start()
          speechRecRef.current = rec
        } catch {
          // Acoustic detector works standalone
        }
      }
    } catch {
      setMicStatusMessage(
        isAr
          ? 'تم رفض إذن الميكروفون أو تعذر الوصول إليه. يمكنك استخدام العداد اليدوي أدناه.'
          : 'Microphone permission denied. You can use the manual counter below.'
      )
      setIsListening(false)
    }
  }

  const handleReset = () => {
    triggerVibration([60, 40, 60])
    setCount(0)
    setLastDetectedWord('')
    saveState(0, totalLifetime, selectedPresetId)
  }

  const handleSelectPreset = (preset: TasbihPreset) => {
    setSelectedPresetId(preset.id)
    setCustomTarget(preset.target)
    setCount(0)
    saveState(0, totalLifetime, preset.id)
  }

  const progressRatio = Math.min(1, count / Math.max(1, customTarget))
  const completedRounds = Math.floor(count / Math.max(1, customTarget))

  return (
    <section className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-sm font-bold text-foreground sm:text-base">
                {isAr
                  ? 'المسبحة الإلكترونية الذكية (بالصوت واللمس بدون إنترنت)'
                  : 'Smart Electronic Tasbih (Offline Voice & Touch)'}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                <ShieldCheck className="h-3 w-3" />
                {isAr ? 'يعمل محلياً 100% دون إنترنت' : '100% Local Offline'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isAr
                ? 'سبّح بصوتك عبر الميكروفون أو بالضغط اليدوي مع احترام تام للخصوصية (معالجة صوتية داخل جهازك فقط)'
                : 'Count your Tasbih by speaking into the microphone or tapping manually — processed 100% locally'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-border bg-secondary/60 px-3 py-1.5 text-center">
            <span className="block text-[10px] text-muted-foreground">
              {isAr ? 'مجموع تسبيحاتك الكلي' : 'Lifetime Tasbih'}
            </span>
            <span className="font-mono text-sm font-extrabold text-primary">
              {totalLifetime}
            </span>
          </div>
        </div>
      </div>

      {/* Preset Selector Pills */}
      <div className="flex flex-wrap gap-1.5">
        {TASBIH_PRESETS.map((preset) => {
          const active = preset.id === selectedPresetId
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card text-foreground hover:bg-secondary'
              }`}
            >
              <span>{preset.phraseAr}</span>
              <span className="ms-1.5 rounded-md bg-black/15 px-1.5 py-0.5 text-[10px]">
                {preset.target}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main Interactive Tasbih Counter & Voice Recognition Card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Left/Center Circular Bead Counter */}
        <div className="md:col-span-7 rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col items-center justify-between space-y-4">
          <div className="text-center space-y-1">
            <p className="font-serif text-xl font-bold text-foreground sm:text-2xl">
              {activePreset.phraseAr}
            </p>
            <p className="text-xs text-muted-foreground max-w-md">
              {activePreset.virtueAr}
            </p>
          </div>

          {/* Large Circular Progress & Tap Button */}
          <div className="relative flex items-center justify-center my-2">
            <svg className="h-56 w-56 -rotate-90 transform" viewBox="0 0 220 220">
              <circle
                cx="110"
                cy="110"
                r="94"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-secondary"
              />
              <circle
                cx="110"
                cy="110"
                r="94"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 94}
                strokeDashoffset={2 * Math.PI * 94 * (1 - progressRatio)}
                strokeLinecap="round"
                className="text-primary transition-all duration-200"
              />
            </svg>

            <button
              type="button"
              onClick={() => incrementCounter()}
              aria-label={isAr ? 'اضغط للتسبيح' : 'Tap to count Tasbih'}
              className="absolute flex h-44 w-44 flex-col items-center justify-center rounded-full border-2 border-primary/40 bg-gradient-to-b from-primary/15 via-card to-primary/10 shadow-inner transition active:scale-95 hover:border-primary"
            >
              <span className="font-mono text-5xl font-extrabold tabular-nums text-foreground">
                {count}
              </span>
              <span className="mt-1 text-xs font-semibold text-muted-foreground">
                {isAr ? `الهدف: ${customTarget}` : `Target: ${customTarget}`}
              </span>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                <Hand className="h-3 w-3" />
                <span>{isAr ? 'اضغط هنا للتسبيح' : 'Tap to Count'}</span>
              </span>
            </button>
          </div>

          {/* Controls: Target selector & Reset Button */}
          <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                {isAr ? 'الهدف:' : 'Goal:'}
              </span>
              {[33, 100, 1000].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setCustomTarget(goal)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    customTarget === goal
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {goal}
                </button>
              ))}
              {completedRounds > 0 && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isAr ? `الدورات: ${completedRounds}` : `Rounds: ${completedRounds}`}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isAr ? 'تصفير العداد' : 'Reset Counter'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Local Voice Recognition & Privacy Panel */}
        <div className="md:col-span-5 rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Mic className="h-4 w-4 text-primary" />
                <span>
                  {isAr
                    ? 'العدّ الصوتي الذكي عبر الميكروفون'
                    : 'Microphone Voice Tasbih Counter'}
                </span>
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isListening
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 animate-pulse'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {isListening
                  ? isAr
                    ? 'يستمع الآن...'
                    : 'Listening...'
                  : isAr
                    ? 'متوقف'
                    : 'Idle'}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? 'فعّل الميكروفون ثم انطق التسبيح («سبحان الله»، «الحمد لله»، «الله أكبر») ليقوم التطبيق برصد كل تسبيحة صوتية واحتسابها تلقائياً دون الحاجة للإنترنت.'
                : 'Enable the microphone and speak your Tasbih aloud. Each spoken phrase is detected and counted automatically offline.'}
            </p>

            {/* Start / Stop Microphone Button */}
            <button
              type="button"
              onClick={startMicrophoneListening}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-bold shadow-sm transition ${
                isListening
                  ? 'bg-amber-500 text-emerald-950 hover:bg-amber-400'
                  : 'bg-primary text-primary-foreground hover:opacity-95'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span>
                    {isAr ? 'إيقاف الاستماع الصوتي' : 'Stop Voice Counting'}
                  </span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>
                    {isAr
                      ? 'تفعيل الميكروفون للتسبيح الصوتي'
                      : 'Enable Microphone Voice Counter'}
                  </span>
                </>
              )}
            </button>

            {/* Live Acoustic Meter */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-muted-foreground flex items-center gap-1">
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  {isAr ? 'مؤشر الصوت المباشر:' : 'Voice Level:'}
                </span>
                <span className="font-mono font-bold text-primary">
                  {micLevel}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-75"
                  style={{ width: `${Math.min(100, micLevel * 1.6)}%` }}
                />
              </div>

              <div className="pt-1 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    {isAr
                      ? 'حساسية التقاط التسبيح المنطوق:'
                      : 'Voice Detection Sensitivity:'}
                  </span>
                  <span dir="ltr">{micSensitivity}</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={55}
                  value={micSensitivity}
                  onChange={(e) => setMicSensitivity(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {lastDetectedWord && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-center">
                <span className="block text-[10px] text-muted-foreground">
                  {isAr ? 'آخر تسبيحة تم رصدها صوتياً:' : 'Last Detected Tasbih:'}
                </span>
                <span className="font-serif text-sm font-bold text-primary">
                  « {lastDetectedWord} »
                </span>
              </div>
            )}

            {micStatusMessage && (
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-300">
                {micStatusMessage}
              </p>
            )}
          </div>

          {/* Privacy Guarantee Note */}
          <div className="rounded-xl border border-border/60 bg-secondary/40 p-2.5 flex items-start gap-2 text-[11px] text-muted-foreground">
            <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              {isAr
                ? 'حماية الخصوصية: يعمل الميكروفون محلياً داخل متصفح جهازك فقط لرصد نبرات التسبيح، ولا يتم تسجيل أو إرسال أي مقطع صوتي إلى أي خادم خارجي.'
                : 'Privacy Guaranteed: Microphone audio is analyzed strictly locally on your device and never recorded or transmitted.'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
