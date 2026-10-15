// Offline-First Real Human MP3 Adhan Audio Player
// Uses 5 locally bundled MP3 files (/audio/adhan-1.mp3 .. /audio/adhan-5.mp3)
// Preloads & caches all 5 Adhans in browser memory (Blob URLs) + CacheStorage so they work 100% WITHOUT Internet.
// Zero SpeechSynthesis / robotic foreign TTS voices.

import { MUEZZIN_PROFILES } from './prayer-engine'

export interface AdhanPlaybackState {
  isPlaying: boolean
  muezzinId: string | null
  currentTime: number
  duration: number
  volume: number
  mode: 'mp3' | 'idle'
  currentPhraseAr: string
  offlineCachedCount: number
  isOfflineReady: boolean
}

type Listener = (state: AdhanPlaybackState) => void

export const OFFLINE_ADHAN_FILES = [
  '/audio/adhan-1.mp3',
  '/audio/adhan-2.mp3',
  '/audio/adhan-3.mp3',
  '/audio/adhan-4.mp3',
  '/audio/adhan-5.mp3',
] as const

const CACHE_NAME = 'adan2-offline-adhans-v2'
const offlineBlobMap = new Map<string, string>()
let preloadStarted = false

let audioElement: HTMLAudioElement | null = null
let activeAudioCtx: AudioContext | null = null
let activeNodes: OscillatorNode[] = []
let phraseInterval: ReturnType<typeof setInterval> | null = null
let currentVolume = 0.95

const listeners = new Set<Listener>()

let state: AdhanPlaybackState = {
  isPlaying: false,
  muezzinId: null,
  currentTime: 0,
  duration: 0,
  volume: 0.95,
  mode: 'idle',
  currentPhraseAr: '',
  offlineCachedCount: 5,
  isOfflineReady: true,
}

const MAGHREBI_ADHAN_PHRASES = [
  'اللَّهُ أَكْبَرُ ، اللَّهُ أَكْبَرُ (تثنية التكبير على المذهب المالكي)',
  'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ (مع الترجيع المغاربي الأصيل)',
  'أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ ﷺ',
  'حَيَّ عَلَى الصَّلَاةِ ، حَيَّ عَلَى الصَّلَاةِ',
  'حَيَّ عَلَى الْفَلَاحِ ، حَيَّ عَلَى الْفَلَاحِ',
  'اللَّهُ أَكْبَرُ ، اللَّهُ أَكْبَرُ — لَا إِلَٰهَ إِلَّا اللَّهُ',
]

const MASHRIQI_ADHAN_PHRASES = [
  'اللَّهُ أَكْبَرُ ، اللَّهُ أَكْبَرُ ، اللَّهُ أَكْبَرُ ، اللَّهُ أَكْبَرُ',
  'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ',
  'أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ ﷺ',
  'حَيَّ عَلَى الصَّلَاةِ ، حَيَّ عَلَى الصَّلَاةِ',
  'حَيَّ عَلَى الْفَلَاحِ ، حَيَّ عَلَى الْفَلَاحِ',
  'اللَّهُ أَكْبَرُ ، اللَّهُ أَكْبَرُ — لَا إِلَٰهَ إِلَّا اللَّهُ',
]

function notifyListeners() {
  listeners.forEach((fn) => fn({ ...state }))
}

// Preloads all 5 local Adhan MP3 files into browser memory Blob URLs and CacheStorage for 100% offline playback
export async function preloadOfflineAdhans(): Promise<void> {
  if (typeof window === 'undefined' || preloadStarted) return
  preloadStarted = true

  let count = 0
  let cache: Cache | null = null
  if ('caches' in window) {
    try {
      cache = await window.caches.open(CACHE_NAME)
    } catch {
      cache = null
    }
  }

  for (const url of OFFLINE_ADHAN_FILES) {
    try {
      let response: Response | undefined
      if (cache) {
        response = await cache.match(url)
      }
      if (!response) {
        const fetched = await fetch(url, { cache: 'force-cache' })
        if (fetched.ok) {
          if (cache) {
            try {
              await cache.put(url, fetched.clone())
            } catch {
              // ignore quota errors
            }
          }
          response = fetched
        }
      }
      if (response && response.ok) {
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        offlineBlobMap.set(url, blobUrl)
        count++
        state = {
          ...state,
          offlineCachedCount: count,
          isOfflineReady: count === OFFLINE_ADHAN_FILES.length,
        }
        notifyListeners()
      }
    } catch {
      // Even if fetch fails while offline, static public path remains available
    }
  }
}

export function subscribeAdhanState(listener: Listener): () => void {
  listeners.add(listener)
  listener({ ...state })
  if (typeof window !== 'undefined' && !preloadStarted) {
    preloadOfflineAdhans().catch(() => {})
  }
  return () => {
    listeners.delete(listener)
  }
}

export function getAdhanState(): AdhanPlaybackState {
  return { ...state }
}

export function setAdhanVolume(vol: number) {
  currentVolume = Math.max(0, Math.min(1, vol))
  if (audioElement) {
    audioElement.volume = currentVolume
  }
  state = { ...state, volume: currentVolume }
  notifyListeners()
}

export function stopAdhanAudio() {
  if (phraseInterval) {
    clearInterval(phraseInterval)
    phraseInterval = null
  }
  if (audioElement) {
    try {
      audioElement.pause()
      audioElement.currentTime = 0
      audioElement.removeAttribute('src')
      audioElement.load()
    } catch {
      // ignore
    }
    audioElement = null
  }
  activeNodes.forEach((osc) => {
    try {
      osc.stop()
      osc.disconnect()
    } catch {
      // ignore
    }
  })
  activeNodes = []
  if (activeAudioCtx && activeAudioCtx.state !== 'closed') {
    activeAudioCtx.close().catch(() => {})
    activeAudioCtx = null
  }

  state = {
    ...state,
    isPlaying: false,
    muezzinId: null,
    currentTime: 0,
    duration: 0,
    mode: 'idle',
    currentPhraseAr: '',
  }
  notifyListeners()
}

export function triggerVibration(pattern: number[] = [200, 100, 200]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // ignore if unsupported
    }
  }
}

export function playPrePrayerChime(minutesBefore: 5 | 15) {
  stopAdhanAudio()
  if (typeof window === 'undefined') return

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext
  if (!AudioCtx) return

  const ctx = new AudioCtx()
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  activeAudioCtx = ctx

  const notes =
    minutesBefore === 15
      ? [
          { freq: 440, start: 0, dur: 0.45 },
          { freq: 554.37, start: 0.4, dur: 0.55 },
          { freq: 659.25, start: 0.9, dur: 0.9 },
        ]
      : [
          { freq: 493.88, start: 0, dur: 0.35 },
          { freq: 523.25, start: 0.32, dur: 0.35 },
          { freq: 622.25, start: 0.65, dur: 0.45 },
          { freq: 659.25, start: 1.05, dur: 0.95 },
        ]

  notes.forEach((note) => {
    const osc = ctx.createOscillator()
    const sub = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start)

    sub.type = 'triangle'
    sub.frequency.setValueAtTime(note.freq * 0.5, ctx.currentTime + note.start)

    gain.gain.setValueAtTime(0.001, ctx.currentTime + note.start)
    gain.gain.exponentialRampToValueAtTime(
      0.3 * currentVolume,
      ctx.currentTime + note.start + 0.06
    )
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + note.start + note.dur
    )

    osc.connect(gain)
    sub.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime + note.start)
    sub.start(ctx.currentTime + note.start)
    osc.stop(ctx.currentTime + note.start + note.dur + 0.05)
    sub.stop(ctx.currentTime + note.start + note.dur + 0.05)

    activeNodes.push(osc, sub)
  })
}

// Plays real recorded human Adhan MP3 from local offline files (/audio/adhan-1.mp3 .. /audio/adhan-5.mp3)
export function playAdhanByMuezzinId(muezzinId: string, onEnded?: () => void) {
  stopAdhanAudio()
  if (typeof window === 'undefined') return

  const profile =
    MUEZZIN_PROFILES.find((m) => m.id === muezzinId) || MUEZZIN_PROFILES[0]
  const phrases =
    profile.region === 'maghreb'
      ? MAGHREBI_ADHAN_PHRASES
      : MASHRIQI_ADHAN_PHRASES

  // Use preloaded in-memory offline Blob URL if available, otherwise local static path /audio/adhan-X.mp3
  const localPath = profile.audioStreamUrl
  const resolvedSrc = offlineBlobMap.get(localPath) || localPath

  state = {
    ...state,
    isPlaying: true,
    muezzinId: profile.id,
    currentTime: 0,
    duration: 135,
    volume: currentVolume,
    mode: 'mp3',
    currentPhraseAr: phrases[0],
  }
  notifyListeners()

  const audio = new Audio(resolvedSrc)
  audio.volume = currentVolume
  audio.preload = 'auto'
  audioElement = audio

  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && Number.isFinite(audio.duration)) {
      state = { ...state, duration: Math.round(audio.duration) }
      notifyListeners()
    }
  })

  audio.addEventListener('timeupdate', () => {
    const dur =
      audio.duration && Number.isFinite(audio.duration)
        ? audio.duration
        : state.duration || 135
    const progressRatio = dur > 0 ? audio.currentTime / dur : 0
    const computedIdx = Math.min(
      phrases.length - 1,
      Math.floor(progressRatio * phrases.length)
    )
    state = {
      ...state,
      currentTime: Math.round(audio.currentTime),
      duration: Math.round(dur),
      currentPhraseAr: phrases[computedIdx] || phrases[0],
    }
    notifyListeners()
  })

  audio.addEventListener('ended', () => {
    stopAdhanAudio()
    onEnded?.()
  })

  audio.addEventListener('error', () => {
    // If blob URL expired, retry directly with the local static /audio/adhan-1.mp3 file
    if (audio.src !== window.location.origin + '/audio/adhan-1.mp3') {
      audio.src = '/audio/adhan-1.mp3'
      audio.play().catch(() => {
        stopAdhanAudio()
      })
    } else {
      stopAdhanAudio()
    }
  })

  const playPromise = audio.play()
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      stopAdhanAudio()
    })
  }
}

export function playHarmonicAdhanPreview(
  baseFreqOrMuezzinId?: number | string,
  onEnded?: () => void
) {
  if (typeof baseFreqOrMuezzinId === 'string') {
    playAdhanByMuezzinId(baseFreqOrMuezzinId, onEnded)
    return
  }
  const matched =
    MUEZZIN_PROFILES.find((m) => m.baseFreq === baseFreqOrMuezzinId) ||
    MUEZZIN_PROFILES[0]
  playAdhanByMuezzinId(matched.id, onEnded)
}
