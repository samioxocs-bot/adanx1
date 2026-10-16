'use client'

import { Heart, ExternalLink } from 'lucide-react'

interface PayPalSupportBarProps {
  lang?: 'ar' | 'en'
}

function PayPalIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
    </svg>
  )
}

export function PayPalSupportBar({ lang = 'ar' }: PayPalSupportBarProps) {
  const isAr = lang === 'ar'
  const message = isAr
    ? 'ادعم التطبيق لتشجيعنا على الاستمرار وتطويره قدر استطاعتك ابتداءً من 1 دولار بما يرضي الله — صدقة جارية ونشر للعلم النافع — جزاكم الله خيراً'
    : 'Support the app to encourage continued development starting from $1 for the sake of Allah — May Allah reward you'

  return (
    <div className="w-full border-b border-primary/25 bg-gradient-to-r from-[#003087]/15 via-primary/15 to-[#0070ba]/15 backdrop-blur-sm overflow-hidden">
      <div className="mx-auto max-w-5xl px-3 py-1.5 flex items-center justify-between gap-3">
        {/* Direct PayPal Badge Button */}
        <a
          href="https://www.paypal.com/paypalme/wchry"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0070ba] hover:bg-[#003087] text-white text-[11px] sm:text-xs font-bold shadow-sm transition-all shrink-0 z-10"
        >
          <PayPalIcon className="w-3.5 h-3.5 text-white" />
          <span>{isAr ? 'ادعم عبر PayPal ($1+)' : 'Support via PayPal'}</span>
          <ExternalLink className="w-3 h-3 opacity-85" />
        </a>

        {/* Slow Scrolling Marquee */}
        <a
          href="https://www.paypal.com/paypalme/wchry"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 overflow-hidden relative group cursor-pointer py-0.5"
          title="https://www.paypal.com/paypalme/wchry"
        >
          <div className="animate-paypal-marquee whitespace-nowrap inline-flex items-center gap-10 text-xs font-bold text-foreground group-hover:text-primary transition-colors">
            <span className="inline-flex items-center gap-2">
              <PayPalIcon className="w-3.5 h-3.5 text-[#0070ba] dark:text-[#38bdf8]" />
              <span>{message}</span>
              <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            </span>
            <span className="inline-flex items-center gap-2" aria-hidden="true">
              <PayPalIcon className="w-3.5 h-3.5 text-[#0070ba] dark:text-[#38bdf8]" />
              <span>{message}</span>
              <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            </span>
          </div>
        </a>
      </div>
    </div>
  )
}
