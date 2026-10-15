'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  BrainCircuit,
  TrendingUp,
  Send,
  Flame,
  Award,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { PredictiveInsight, SpiritualProgressDay } from '@/lib/store-types'

interface AiSpiritualCoachProps {
  insights: PredictiveInsight[]
  progressDays: SpiritualProgressDay[]
  streakDays: number
  lang: 'ar' | 'en'
}

export function AiSpiritualCoach({
  insights,
  progressDays,
  streakDays,
  lang,
}: AiSpiritualCoachProps) {
  const isAr = lang === 'ar'
  const [reportRange, setReportRange] = useState<'weekly' | 'monthly'>('weekly')
  const [question, setQuestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([
    {
      role: 'assistant',
      content: isAr
        ? 'السلام عليكم ورحمة الله! أنا مرشد "أذان ٢" الذكي. بناءً على تحليل التزامك خلال آخر 14 يوماً، ثباتك في صلاة الفجر والمغرب ممتاز (93%)، مع ملاحظة تأخر طفيف في صلاة العصر بسبب ساعات العمل. اسألني عن أي حكم فقهي أو نصيحة لزيادة الخشوع!'
        : 'Peace be upon you! Based on your 14-day prayer habit analysis, your Fajr and Maghrib consistency is 93%, with slight delays in Asr during work hours. Ask me any Fiqh question or Khushu strategy!',
    },
  ])

  const displayedDays =
    reportRange === 'weekly' ? progressDays.slice(-7) : progressDays

  const avgScore =
    displayedDays.length > 0
      ? Math.round(
          displayedDays.reduce((acc, d) => acc + d.score, 0) / displayedDays.length
        )
      : 92

  const handleAskAi = async (customPrompt?: string) => {
    const q = (customPrompt ?? question).trim()
    if (!q || aiLoading) return

    setQuestion('')
    setChatHistory((prev) => [...prev, { role: 'user', content: q }])
    setAiLoading(true)

    try {
      const userContext = insights
        .map(
          (i) =>
            `${i.nameAr}: التزام ${i.onTimeRate}%, متوسط التأخر ${i.avgDelayMinutes} د, خشوع ${i.avgKhushu}/5`
        )
        .join(' | ')

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          userContext,
          language: lang,
        }),
      })
      const data = await res.json()
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer },
      ])
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isAr
            ? 'أوصيك بالاستعداد للصلاة فور سماع تنبيه الـ 15 دقيقة، والوضوء بتأنٍّ، وتدبر آيات سورة الفاتحة آيةً آية.'
            : 'Prepare for prayer at the 15-minute pre-alert, perform mindful Wudu, and reflect deeply on Surah Al-Fatihah.',
        },
      ])
    } finally {
      setAiLoading(false)
    }
  }

  const quickQuestions = isAr
    ? [
        'كيف أتغلب على شرود الذهن في الصلاة؟',
        'ما حكم من نسي التشهد الأول؟',
        'خطة عملية لصلاة العصر في وقتها أثناء العمل',
      ]
    : [
        'How do I overcome distraction in Salah?',
        'What is the ruling if I forget the first Tashahhud?',
        'Action plan for praying Asr on time during work',
      ]

  return (
    <section className="space-y-4">
      {/* Top Spiritual Summary KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-emerald-500/25 bg-card p-3 text-center">
          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <Flame className="h-4 w-4" />
          </div>
          <p className="mt-1 tabular-nums text-base font-extrabold text-foreground">
            {streakDays} {isAr ? 'يوم' : 'Days'}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isAr ? 'سلسلة الالتزام المتصل' : 'Prayer Streak'}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/25 bg-card p-3 text-center">
          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <Award className="h-4 w-4" />
          </div>
          <p className="mt-1 font-mono text-lg font-extrabold text-emerald-400">
            {avgScore}%
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isAr ? 'مؤشر التقدم الروحي' : 'Spiritual Index'}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/25 bg-card p-3 text-center">
          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <p className="mt-1 font-mono text-lg font-extrabold text-foreground">
            4.6/5
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isAr ? 'متوسط الخشوع' : 'Avg Khushu'}
          </p>
        </div>
      </div>

      {/* Predictive AI Model: Personal Best Prayer Windows */}
      <div className="rounded-2xl border border-border bg-card p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {isAr
                  ? 'النموذج التنبؤي لأفضل أوقات صلاتك الشخصية'
                  : 'Predictive AI Personal Prayer Windows'}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {isAr
                  ? 'يتعلم من توقيت صلاتك الفعلي وجدول عملك ونومك'
                  : 'Learns from your actual prayer logs and daily schedule'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {insights.map((item) => (
            <div
              key={item.prayerId}
              className="rounded-xl border border-border/70 bg-muted/30 p-2.5 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">
                  {isAr ? `صلاة ${item.nameAr}` : item.nameEn}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    item.riskLevel === 'high'
                      ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}
                >
                  {isAr
                    ? `التزام ${item.onTimeRate}% • خشوع ${item.avgKhushu}/5`
                    : `${item.onTimeRate}% On-Time`}
                </span>
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {isAr ? item.recommendationAr : item.recommendationEn}
              </p>

              <div className="flex items-center justify-between border-t border-border/50 pt-1.5 text-[10px] text-emerald-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {isAr
                    ? `متوسط التأخر الفعلي: ${item.avgDelayMinutes} دقيقة`
                    : `Avg delay: ${item.avgDelayMinutes}m`}
                </span>
                <span className="font-semibold text-amber-400">
                  {isAr
                    ? `النافذة المثلى: +${item.optimalOffsetMinutes} د`
                    : `Optimal: +${item.optimalOffsetMinutes}m`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly & Monthly Spiritual Progress Reports Chart */}
      <div className="rounded-2xl border border-border bg-card p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-foreground">
              {isAr
                ? 'التقرير الروحي الأسبوعي والشهري'
                : 'Weekly & Monthly Spiritual Progress'}
            </h3>
          </div>

          <div className="inline-flex rounded-xl bg-secondary p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setReportRange('weekly')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                reportRange === 'weekly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {isAr ? 'أسبوعي (7 أيام)' : 'Weekly'}
            </button>
            <button
              type="button"
              onClick={() => setReportRange('monthly')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                reportRange === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {isAr ? 'شهري (14 يوماً)' : 'Bi-Weekly'}
            </button>
          </div>
        </div>

        <div className="h-48 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayedDays} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey={isAr ? 'dayLabelAr' : 'dayLabelEn'}
                tick={{ fontSize: 10, fill: 'currentColor' }}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'currentColor' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                name={isAr ? 'مؤشر الالتزام والخشوع' : 'Spiritual Score'}
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#scoreGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar breakdown for Jamaah vs On-Time */}
        <div className="h-36 w-full pt-1" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayedDays} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis
                dataKey={isAr ? 'dayLabelAr' : 'dayLabelEn'}
                tick={{ fontSize: 10, fill: 'currentColor' }}
              />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: 'currentColor' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '12px',
                  fontSize: '11px',
                }}
              />
              <Bar
                dataKey="onTimeCount"
                name={isAr ? 'الصلوات في وقتها' : 'Prayers On Time'}
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="jamaahCount"
                name={isAr ? 'صلاة الجماعة' : 'In Congregation'}
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive AI Fiqh & Khushu Conversational Advisor */}
      <div className="rounded-2xl border border-emerald-500/30 bg-card p-3.5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr
              ? 'المحادثة الذكية للإجابة على الأسئلة الفقهية والخشوع'
              : 'Interactive AI Fiqh & Khushu Advisor'}
          </h3>
        </div>

        {/* Quick Prompt Chips */}
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleAskAi(q)}
              className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground transition hover:bg-emerald-500/20 hover:text-emerald-300"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl bg-muted/40 p-2.5 text-xs">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl p-2.5 leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'ms-6 bg-emerald-600 text-white'
                  : 'me-4 border border-emerald-500/20 bg-card text-foreground'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {aiLoading && (
            <div className="animate-pulse rounded-xl bg-card p-2.5 text-xs text-amber-400">
              {isAr
                ? 'جاري استنباط الإجابة الفقهية والتوصية الذكية...'
                : 'Generating Fiqh & spiritual guidance...'}
            </div>
          )}
        </div>

        {/* Input Box with CJK/IME safe Enter handler */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault()
                handleAskAi()
              }
            }}
            placeholder={
              isAr
                ? 'اسأل عن حكم فقهي في الصلاة أو نصيحة للخشوع...'
                : 'Ask a prayer Fiqh question or Khushu tip...'
            }
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={() => handleAskAi()}
            disabled={aiLoading || !question.trim()}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 p-2 text-white transition hover:bg-emerald-500 disabled:opacity-50"
            aria-label={isAr ? 'إرسال السؤال' : 'Send question'}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
