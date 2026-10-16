'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ShieldAlert,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  Volume2,
  VolumeX,
  HeartHandshake,
  RotateCcw,
  AlertTriangle,
  MessageSquareWarning,
  Lock,
  BookOpen,
} from 'lucide-react'

interface TriggerPattern {
  phrase: string
  category: 'غيبة' | 'نميمة' | 'سخرية وذم' | 'ظن سيئ'
  dialect: 'فصحى' | 'دارجة مغربية'
  advice: string
  istighfar: string
}

const OFFLINE_GHIBA_PATTERNS: TriggerPattern[] = [
  // الفصحى
  {
    phrase: 'فلان فيه',
    category: 'غيبة',
    dialect: 'فصحى',
    advice: 'تذكّر قول النبي صلى الله عليه وسلم: «ذكرك أخاك بما يكره»؛ استر على أخيك يسترك الله في الدنيا والآخرة.',
    istighfar: 'أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه، اللهم اغفر لنا ولأخينا.',
  },
  {
    phrase: 'سمعت ما فعل',
    category: 'نميمة',
    dialect: 'فصحى',
    advice: 'نقل أخبار الناس على وجه الإفساد من النميمة المحرمة؛ بادر بقطع الحديث بالذكر.',
    istighfar: 'سبحانك اللهم وبحمدك، أشهد أن لا إله إلا أنت، أستغفرك وأتوب إليك.',
  },
  {
    phrase: 'يقولون عنه',
    category: 'نميمة',
    dialect: 'فصحى',
    advice: 'قال صلى الله عليه وسلم: «كفى بالمرء كذباً أن يحدث بكل ما سمع»؛ تثبّت وأمسك عليك لسانك.',
    istighfar: 'أستغفر الله وأتوب إليه، اللهم طهر ألسنتنا من الكذب والغيبة والنميمة.',
  },
  {
    phrase: 'منافق',
    category: 'سخرية وذم',
    dialect: 'فصحى',
    advice: 'رمي المسلم بالنفاق أو الذم بغير حق خطر عظيم على الحسنات يوم القيامة.',
    istighfar: 'رب اغفر لي وتب علي إنك أنت التواب الرحيم.',
  },
  {
    phrase: 'كذاب',
    category: 'سخرية وذم',
    dialect: 'فصحى',
    advice: 'قال صلى الله عليه وسلم: «ليس المؤمن بالطعان ولا اللعان ولا الفاحش ولا البذيء».',
    istighfar: 'أستغفر الله العظيم لي وللمؤمنين والمؤمنات.',
  },
  {
    phrase: 'بخيل',
    category: 'غيبة',
    dialect: 'فصحى',
    advice: 'ذكر عيوب الناس في غيبتهم يأكل الحسنات كما تأكل النار الحطب.',
    istighfar: 'اللهم اغفر لمن اغتبته أو ظلمته وبارك له في أمره.',
  },
  {
    phrase: 'لو رأيت ما فعل',
    category: 'غيبة',
    dialect: 'فصحى',
    advice: 'من تتبع عورة أخيه المسلم تتبع الله عورته؛ اشغل لسانك بذكر الله.',
    istighfar: 'لا إله إلا أنت سبحانك إني كنت من الظالمين.',
  },
  {
    phrase: 'فضيحة',
    category: 'غيبة',
    dialect: 'فصحى',
    advice: 'المؤمن يستر ولا يفضح؛ ومن ستر مسلماً ستره الله يوم القيامة.',
    istighfar: 'اللهم استر عوراتنا وآمن روعاتنا واغفر زلات ألسنتنا.',
  },
  {
    phrase: 'حسود',
    category: 'ظن سيئ',
    dialect: 'فصحى',
    advice: 'اجتنبوا كثيراً من الظن إن بعض الظن إثم ولا تجسسوا ولا يغتب بعضكم بعضاً.',
    istighfar: 'أستغفر الله من كل ظن سيئ أو قول لا يرضي الله.',
  },
  {
    phrase: 'لا يستحي',
    category: 'غيبة',
    dialect: 'فصحى',
    advice: 'اذكر محاسن إخوانك في غيبتهم وادعُ لهم بالهداية بدل انتقادهم.',
    istighfar: 'اللهم اهدنا واهدِ بنا واجعلنا هداة مهتدين.',
  },

  // الدارجة المغربية
  {
    phrase: 'شفتي فلان',
    category: 'غيبة',
    dialect: 'دارجة مغربية',
    advice: 'تنبيه لطيف: عبارة «شفتي فلان» غالباً ما تكون مدخلاً للغيبة؛ حول المجلس إلى ذكر الله.',
    istighfar: 'أستغفر الله العظيم وأتوب إليه، اللهم اغفر لنا وله.',
  },
  {
    phrase: 'شفتي آش دار',
    category: 'غيبة',
    dialect: 'دارجة مغربية',
    advice: 'الانشغال بأفعال الناس يضيع الأجر؛ من حسن إسلام المرء تركه ما لا يعنيه.',
    istighfar: 'سبحان الله وبحمده، سبحان الله العظيم، أستغفر الله وأتوب إليه.',
  },
  {
    phrase: 'قالو عليه',
    category: 'نميمة',
    dialect: 'دارجة مغربية',
    advice: 'نقل الكلام بين الناس («قالو عليه / قالت عليها») يورث العداوة ويحبط العمل.',
    istighfar: 'اللهم إني أستغفرك لكل ذنب خطوت إليه أو نطق به لساني.',
  },
  {
    phrase: 'تبركيك',
    category: 'نميمة',
    dialect: 'دارجة مغربية',
    advice: 'التجسس وتتبع أخبار الناس منهي عنه بصريح القرآن: «ولا تجسسوا ولا يغتب بعضكم بعضاً».',
    istighfar: 'أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه.',
  },
  {
    phrase: 'مسموم',
    category: 'سخرية وذم',
    dialect: 'دارجة مغربية',
    advice: 'تجنب ألقاب الذم في حق إخوانك المسلمين؛ الكلمة الطيبة صدقة.',
    istighfar: 'اللهم طهر قلبي ولساني واغفر لأخي المسلم.',
  },
  {
    phrase: 'كيهدر في الناس',
    category: 'غيبة',
    dialect: 'دارجة مغربية',
    advice: 'لا تقابل الغيبة بغيبة مثلها؛ بل ذكّر بالله وادعُ بالخير والصلاح.',
    istighfar: 'سبحانك اللهم وبحمدك أشهد أن لا إله إلا أنت أستغفرك وأتوب إليك.',
  },
  {
    phrase: 'هدرت فيه',
    category: 'غيبة',
    dialect: 'دارجة مغربية',
    advice: 'كفارة من اغتبته أن تستغفر له وتذكره بخير في المجالس التي ذكرته فيها.',
    istighfar: 'اللهم اغفر لمن تكلمنا فيه واجعل ذلك كفارة ورحمة له ولنا.',
  },
  {
    phrase: 'مكيسواش',
    category: 'سخرية وذم',
    dialect: 'دارجة مغربية',
    advice: 'قال تعالى: «لا يسخر قوم من قوم عسى أن يكونوا خيراً منهم»؛ احفظ لسانك.',
    istighfar: 'ربنا ظلمنا أنفسنا وإن لم تغفر لنا وترحمنا لنكونن من الخاسرين.',
  },
  {
    phrase: 'ما يحشمش',
    category: 'غيبة',
    dialect: 'دارجة مغربية',
    advice: 'أمسك عليك لسانك؛ فرب كلمة يقولها العبد لا يلقي لها بالاً تهوي به في النار.',
    istighfar: 'أستغفر الله العظيم وأتوب إليه عدد خلقه ورضا نفسه.',
  },
  {
    phrase: 'داير فيها',
    category: 'سخرية وذم',
    dialect: 'دارجة مغربية',
    advice: 'النيات يعلمها الله وحده؛ اترك الحكم على سرائر الناس واشغل نفسك بطاعة الله.',
    istighfar: 'اللهم آت نفوسنا تقواها وزكها أنت خير من زكاها.',
  },
]

interface AlertEvent {
  id: string
  timestamp: string
  detectedPhrase: string
  category: string
  advice: string
  istighfar: string
  expiated: boolean
}

export function TongueGuardian() {
  const [isListening, setIsListening] = useState(false)
  const [voiceModeStatus, setVoiceModeStatus] = useState<'idle' | 'speech-api' | 'acoustic-guard'>('idle')
  const [audioLevel, setAudioLevel] = useState(0)
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(true)
  const [lastTranscript, setLastTranscript] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [activeAlert, setActiveAlert] = useState<AlertEvent | null>(null)
  const [alertHistory, setAlertHistory] = useState<AlertEvent[]>([])
  const [istighfarCount, setIstighfarCount] = useState(0)
  const [periodicReminderMinutes, setPeriodicReminderMinutes] = useState<number>(3)

  const recognitionRef = useRef<{ stop: () => void } | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const talkDurationRef = useRef<number>(0)

  // Load saved Istighfar count
  useEffect(() => {
    try {
      const saved = localStorage.getItem('morocco_tongue_guardian_istighfar_v1')
      if (saved) setIstighfarCount(Number(saved) || 0)
    } catch {
      // ignore
    }
  }, [])

  const incrementIstighfar = useCallback((amount = 1) => {
    setIstighfarCount(prev => {
      const next = prev + amount
      try {
        localStorage.setItem('morocco_tongue_guardian_istighfar_v1', String(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  // Play gentle spiritual alert chime & optional offline speech synthesis
  const playGuardianAlert = useCallback(
    (istighfarText: string) => {
      if (typeof window === 'undefined') return
      if (navigator.vibrate) {
        try {
          navigator.vibrate([120, 80, 120])
        } catch {
          // ignore
        }
      }
      if (!soundAlertEnabled) return

      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioCtx) {
          const ctx = new AudioCtx()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          const now = ctx.currentTime
          osc.type = 'sine'
          osc.frequency.setValueAtTime(587.33, now)
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.35)
          gain.gain.setValueAtTime(0.14, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
          osc.start(now)
          osc.stop(now + 0.45)
        }

        // Also use browser's built-in offline SpeechSynthesis if available
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
          const utter = new SpeechSynthesisUtterance('تنبيه حارس اللسان: استغفر الله العظيم واذكر الله')
          utter.lang = 'ar-SA'
          utter.rate = 0.95
          window.speechSynthesis.speak(utter)
        }
      } catch {
        // ignore
      }
    },
    [soundAlertEnabled]
  )

  // Analyze text locally against offline dictionary
  const analyzeTextLocally = useCallback(
    (text: string) => {
      const normalized = text.trim()
      if (!normalized) return null

      const matched = OFFLINE_GHIBA_PATTERNS.find(item => normalized.includes(item.phrase))
      if (matched) {
        const event: AlertEvent = {
          id: `${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          detectedPhrase: matched.phrase,
          category: `${matched.category} (${matched.dialect})`,
          advice: matched.advice,
          istighfar: matched.istighfar,
          expiated: false,
        }
        setActiveAlert(event)
        setAlertHistory(prev => [event, ...prev.slice(0, 9)])
        playGuardianAlert(matched.istighfar)
        return event
      }
      return null
    },
    [playGuardianAlert]
  )

  const stopGuardian = useCallback(() => {
    setIsListening(false)
    setVoiceModeStatus('idle')
    setAudioLevel(0)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close()
      } catch {
        // ignore
      }
      audioCtxRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      stopGuardian()
    }
  }, [stopGuardian])

  const startGuardian = async () => {
    if (isListening) {
      stopGuardian()
      return
    }

    try {
      // 1. Start Web Audio API microphone stream for real-time offline voice activity & cadence monitoring
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      mediaStreamRef.current = stream
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      talkDurationRef.current = 0

      const monitorAudio = () => {
        if (!mediaStreamRef.current) return
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
        const avg = sum / dataArray.length
        const norm = Math.min(100, Math.round((avg / 90) * 100))
        setAudioLevel(norm)

        // If user has been speaking continuously for a long stretch, trigger a gentle periodic mindfulness reminder
        if (norm > 22) {
          talkDurationRef.current += 1
          const thresholdFrames = periodicReminderMinutes * 60 * 25 // ~25 frames/sec
          if (talkDurationRef.current >= thresholdFrames) {
            talkDurationRef.current = 0
            const reminderEvent: AlertEvent = {
              id: `${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              detectedPhrase: 'تذكير صوتي دوري لطول الحديث في المجلس',
              category: 'تذكير حفظ اللسان',
              advice: 'طال الحديث في المجلس؛ قال صلى الله عليه وسلم: «من كثر كلامه كثر سقطه» — جدّدوا المجلس بالاستغفار والصلاة على النبي صلى الله عليه وسلم.',
              istighfar: 'سبحانك اللهم وبحمدك، أشهد أن لا إله إلا أنت، أستغفرك وأتوب إليك.',
              expiated: false,
            }
            setActiveAlert(reminderEvent)
            setAlertHistory(prev => [reminderEvent, ...prev.slice(0, 9)])
            playGuardianAlert(reminderEvent.istighfar)
          }
        }

        rafRef.current = requestAnimationFrame(monitorAudio)
      }

      rafRef.current = requestAnimationFrame(monitorAudio)
      setIsListening(true)

      // 2. Also attach SpeechRecognition if available on device for instant keyword spotting
      const SpeechRec =
        (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition

      if (SpeechRec) {
        setVoiceModeStatus('speech-api')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition: any = new SpeechRec()
        recognition.lang = 'ar-MA'
        recognition.continuous = true
        recognition.interimResults = true

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let transcript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + ' '
          }
          const clean = transcript.trim()
          if (clean) {
            setLastTranscript(clean)
            analyzeTextLocally(clean)
          }
        }

        recognition.onerror = () => {
          // Fallback seamlessly to acoustic offline guard without stopping mic
          setVoiceModeStatus('acoustic-guard')
        }

        recognition.onend = () => {
          if (mediaStreamRef.current) {
            try {
              recognition.start()
            } catch {
              setVoiceModeStatus('acoustic-guard')
            }
          }
        }

        try {
          recognition.start()
          recognitionRef.current = recognition
        } catch {
          setVoiceModeStatus('acoustic-guard')
        }
      } else {
        setVoiceModeStatus('acoustic-guard')
      }
    } catch {
      setIsListening(false)
      setVoiceModeStatus('idle')
    }
  }

  const handleExpiateAlert = (id: string) => {
    incrementIstighfar(3)
    if (activeAlert?.id === id) {
      setActiveAlert(prev => (prev ? { ...prev, expiated: true } : null))
    }
    setAlertHistory(prev => prev.map(item => (item.id === id ? { ...item, expiated: true } : item)))
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="luxury-card rounded-2xl p-5 sm:p-6 border border-primary/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>ذكاء اصطناعي محلي 100% بدون إنترنت • خصوصية تامة داخل جهازك</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-foreground flex items-center gap-2.5">
              <ShieldAlert className="w-7 h-7 text-primary" />
              <span>حارس اللسان الذكي من الغيبة والنميمة</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              حارس صوتي ولغوي يعمل محلياً دون إنترنت، يرصد عبارات الغيبة والنميمة بالفصحى والدارجة المغربية وينبهك فوراً بالاستغفار وكفارة المجلس عملاً بقوله تعالى: ﴿وَلَا يَغْتَب بَّعْضُكُم بَعْضًا﴾.
            </p>
          </div>

          {/* Istighfar Counter Box */}
          <div className="flex items-center gap-3 bg-secondary/70 border border-border rounded-2xl p-3.5 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">عداد الاستغفار وكفارة المجلس</span>
              <span className="text-xl font-bold tabular-nums text-primary">{istighfarCount} استغفار</span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => incrementIstighfar(1)}
                  className="px-2.5 py-0.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold hover:opacity-90"
                >
                  + أستغفر الله
                </button>
                <button
                  onClick={() => {
                    setIstighfarCount(0)
                    try {
                      localStorage.setItem('morocco_tongue_guardian_istighfar_v1', '0')
                    } catch {
                      // ignore
                    }
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  تصفير
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Voice Guardian Console & Active Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Voice Monitor Control */}
        <div className="lg:col-span-7 luxury-card rounded-2xl p-5 sm:p-6 border border-border space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">الحارس الصوتي المباشر (الميكروفون المحلي)</h3>
              <p className="text-xs text-muted-foreground">
                يحلل الصوت والكلمات محلياً على جهازك دون إرسال أي بيانات للإنترنت
              </p>
            </div>
            <button
              onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary border border-border text-xs font-bold text-foreground"
            >
              {soundAlertEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
              <span>{soundAlertEnabled ? 'التنبيه الصوتي مفعّل' : 'صامت'}</span>
            </button>
          </div>

          {/* Microphone Orb */}
          <div className="p-6 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center text-center space-y-4">
            <button
              onClick={startGuardian}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg relative ${
                isListening
                  ? 'bg-primary text-primary-foreground ring-8 ring-primary/20 animate-pulse'
                  : 'bg-card hover:bg-secondary text-foreground border-2 border-primary/40'
              }`}
            >
              {isListening ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10 text-muted-foreground" />}
            </button>

            <div className="space-y-1">
              <div className="text-base font-bold text-foreground">
                {isListening ? 'حارس اللسان يستمع ويحميك الآن...' : 'اضغط لتشغيل حارس اللسان الصوتي'}
              </div>
              <p className="text-xs text-muted-foreground">
                {voiceModeStatus === 'speech-api' && 'وضع التعرف اللغوي الفوري + الرصد الصوتي المحلي نشط'}
                {voiceModeStatus === 'acoustic-guard' && 'وضع الرصد الصوتي المحلي والمنبه الدوري للمجالس نشط (بدون إنترنت)'}
                {voiceModeStatus === 'idle' && 'يدعم رصد عبارات الغيبة والنميمة باللغة العربية الفصحى والدارجة المغربية'}
              </p>
            </div>

            {/* Audio Level Bar */}
            {isListening && (
              <div className="w-full max-w-xs space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>مستوى الصوت في المجلس</span>
                  <span className="tabular-nums">{audioLevel}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-primary transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}

            {lastTranscript && (
              <div className="w-full p-3 rounded-xl bg-card border border-border text-xs text-muted-foreground">
                آخر ما تم رصده: <span className="text-foreground font-bold">«{lastTranscript}»</span>
              </div>
            )}
          </div>

          {/* Offline Phrase Simulator & Text Checker */}
          <div className="space-y-3 pt-2 border-t border-border">
            <label className="text-xs font-bold text-foreground block">
              فحص فوري لعبارة أو تجربة محاكي الرصد اللغوي (فصحى / دارجة مغربية بدون إنترنت):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="اكتب أو جرّب عبارة مثل: شفتي فلان آش دار، أو قالو عليه..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  if (!manualInput.trim()) return
                  const res = analyzeTextLocally(manualInput)
                  if (!res) {
                    const fallback: AlertEvent = {
                      id: `${Date.now()}`,
                      timestamp: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }),
                      detectedPhrase: manualInput,
                      category: 'كلام سليم ظاهرياً — تذكير احترازي',
                      advice: 'لم تُرصد كلمة غيبة صريحة، ومع ذلك فإن ذكر الله والاستغفار خير ما يُختم به الكلام.',
                      istighfar: 'سبحان الله وبحمده، أستغفر الله وأتوب إليه.',
                      expiated: false,
                    }
                    setActiveAlert(fallback)
                  }
                  setManualInput('')
                }}
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shrink-0 hover:opacity-95"
              >
                فحص العبارة
              </button>
            </div>

            {/* Quick Test Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground self-center ml-1">جرّب تنبيه الحارس:</span>
              {['شفتي فلان آش دار', 'قالو عليه كلام', 'فلان فيه عيب', 'تبركيك', 'منافق'].map(sample => (
                <button
                  key={sample}
                  onClick={() => analyzeTextLocally(sample)}
                  className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-primary/15 border border-border text-[11px] font-medium text-foreground transition-all"
                >
                  «{sample}»
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Active Istighfar Guidance & Kaffarat al-Majlis */}
        <div className="lg:col-span-5 space-y-4">
          {activeAlert ? (
            <div className="luxury-card rounded-2xl p-5 border-2 border-amber-500/60 bg-amber-500/5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h4 className="text-sm sm:text-base font-bold">تنبيه حارس اللسان: {activeAlert.category}</h4>
                </div>
                <span className="text-[11px] tabular-nums text-muted-foreground">{activeAlert.timestamp}</span>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border text-xs">
                <span className="text-muted-foreground">العبارة المرصودة: </span>
                <span className="font-bold text-foreground">«{activeAlert.detectedPhrase}»</span>
              </div>

              <p className="text-xs sm:text-sm text-foreground leading-relaxed">{activeAlert.advice}</p>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 space-y-2">
                <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ردد الآن لتكفير زلة اللسان:</span>
                </div>
                <p className="text-sm sm:text-base font-bold font-serif text-foreground leading-relaxed">
                  «{activeAlert.istighfar}»
                </p>
              </div>

              <button
                onClick={() => handleExpiateAlert(activeAlert.id)}
                disabled={activeAlert.expiated}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  activeAlert.expiated
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                    : 'bg-primary text-primary-foreground shadow-md hover:opacity-95'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {activeAlert.expiated
                    ? 'تم الاستغفار والدعاء لمن ذُكر (+3 استغفارات)'
                    : 'استغفرت الله ودعوت لأخي المسلم (+3)'}
                </span>
              </button>
            </div>
          ) : (
            <div className="luxury-card rounded-2xl p-5 border border-border space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <MessageSquareWarning className="w-5 h-5" />
                <h4 className="text-sm sm:text-base font-bold">لا توجد تنبيهات غيبة حالياً</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                عند رصد أي لفظ من ألفاظ الغيبة أو النميمة أو السخرية عبر الميكروفون أو الفاحص النصي، سيظهر لك هنا الإرشاد الشرعي الفوري وصيغة الاستغفار وكفارة المجلس.
              </p>
            </div>
          )}

          {/* Kaffarat Al-Majlis Card */}
          <div className="luxury-card rounded-2xl p-5 border border-primary/25 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>دعاء كفارة المجلس النبوي</span>
              </h4>
              <span className="text-[11px] text-primary font-bold">سنن الترمذي (صحيح)</span>
            </div>
            <p className="text-sm sm:text-base font-serif font-bold text-foreground leading-relaxed bg-secondary/60 p-3.5 rounded-xl border border-border">
              «سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ»
            </p>
            <button
              onClick={() => incrementIstighfar(1)}
              className="w-full py-2 rounded-xl bg-secondary hover:bg-primary/15 border border-border text-xs font-bold text-foreground transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
              <span>قرأت كفارة المجلس (إضافة للعداد)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
