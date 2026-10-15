import { NextResponse } from 'next/server'
import { CITY_PRESETS, computePrayerSchedule } from '@/lib/prayer-engine'

export interface HabousCityInfo {
  id: string
  habousVilleCode: number
  nameAr: string
  nameEn: string
  regionAr: string
  lat: number
  lng: number
}

export const MOROCCO_HABOUS_CITIES: HabousCityInfo[] = CITY_PRESETS.map((c) => ({
  id: c.id,
  habousVilleCode: c.habousVilleCode,
  nameAr: c.nameAr,
  nameEn: c.nameEn,
  regionAr: c.regionAr,
  lat: c.lat,
  lng: c.lng,
}))

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cityQuery = (searchParams.get('city') || 'rabat').toLowerCase()
  const matchedCity =
    MOROCCO_HABOUS_CITIES.find(
      (c) =>
        c.id === cityQuery ||
        c.nameEn.toLowerCase() === cityQuery ||
        c.nameAr === cityQuery
    ) || MOROCCO_HABOUS_CITIES[0]

  const lat = parseFloat(searchParams.get('lat') || String(matchedCity.lat))
  const lng = parseFloat(searchParams.get('lng') || String(matchedCity.lng))

  const localSchedule = computePrayerSchedule(
    lat,
    lng,
    'morocco_habous',
    'shafi',
    new Date(),
    'Africa/Casablanca'
  )

  try {
    const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
      matchedCity.nameEn
    )}&country=Morocco&method=21`

    const res = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const json = await res.json()
      const timings = json?.data?.timings
      const hijri = json?.data?.date?.hijri

      if (timings) {
        return NextResponse.json({
          status: 'ok',
          source: 'وزارة الأوقاف والشؤون الإسلامية بالمغرب (Habous Method 21 API)',
          sourceUrl: 'https://www.habous.gov.ma',
          ministryParams: {
            fajrAngle: 19,
            ishaAngle: 17,
            madhab: 'المالكي (عصر قياسي + احتياط الزوال 5 دقائق)',
            habousVilleCode: matchedCity.habousVilleCode,
          },
          city: matchedCity,
          timings: {
            imsak: timings.Imsak,
            fajr: timings.Fajr,
            sunrise: timings.Sunrise,
            dhuhr: timings.Dhuhr,
            asr: timings.Asr,
            maghrib: timings.Maghrib,
            isha: timings.Isha,
            lastThird: timings.Lastthird,
          },
          hijri: hijri
            ? {
                day: hijri.day,
                monthAr: hijri.month?.ar,
                monthEn: hijri.month?.en,
                year: hijri.year,
                fullAr: `${hijri.day} ${hijri.month?.ar} ${hijri.year} هـ`,
              }
            : {
                fullAr: localSchedule.hijriDateAr,
              },
          citiesList: MOROCCO_HABOUS_CITIES,
          syncedAt: new Date().toISOString(),
        })
      }
    }
  } catch {
    // Fallback to local Habous computation if external network is unreachable
  }

  const prayerMap = Object.fromEntries(
    localSchedule.prayers.map((p) => [p.id, p.formatted24])
  )

  return NextResponse.json({
    status: 'ok',
    source: 'المعيار الفلكي الرسمي لوزارة الأوقاف والشؤون الإسلامية بالمغرب (فجر 19° / عشاء 17°)',
    sourceUrl: 'https://www.habous.gov.ma',
    ministryParams: {
      fajrAngle: 19,
      ishaAngle: 17,
      madhab: 'المالكي (عصر قياسي + احتياط الزوال 5 دقائق)',
      habousVilleCode: matchedCity.habousVilleCode,
    },
    city: matchedCity,
    timings: {
      imsak: localSchedule.imsak.formatted12En,
      fajr: prayerMap.fajr,
      sunrise: localSchedule.sunrise.formatted12En,
      dhuhr: prayerMap.dhuhr,
      asr: prayerMap.asr,
      maghrib: prayerMap.maghrib,
      isha: prayerMap.isha,
      lastThird: localSchedule.lastThirdOfNight.formatted12En,
    },
    hijri: {
      fullAr: localSchedule.hijriDateAr,
    },
    citiesList: MOROCCO_HABOUS_CITIES,
    syncedAt: new Date().toISOString(),
  })
}
