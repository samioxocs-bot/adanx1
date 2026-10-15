import { NextResponse } from 'next/server'
import { computePrayerSchedule } from '@/lib/prayer-engine'

export interface HabousCityInfo {
  id: string
  habousVilleCode: number
  nameAr: string
  nameEn: string
  regionAr: string
  lat: number
  lng: number
}

export const MOROCCO_HABOUS_CITIES: HabousCityInfo[] = [
  { id: 'rabat', habousVilleCode: 1, nameAr: 'الرباط', nameEn: 'Rabat', regionAr: 'الرباط - سلا - القنيطرة', lat: 34.0209, lng: -6.8416 },
  { id: 'casablanca', habousVilleCode: 58, nameAr: 'الدار البيضاء', nameEn: 'Casablanca', regionAr: 'الدار البيضاء - سطات', lat: 33.5731, lng: -7.5898 },
  { id: 'fes', habousVilleCode: 81, nameAr: 'فاس', nameEn: 'Fes', regionAr: 'فاس - مكناس', lat: 34.0181, lng: -5.0078 },
  { id: 'marrakech', habousVilleCode: 104, nameAr: 'مراكش', nameEn: 'Marrakech', regionAr: 'مراكش - آسفي', lat: 31.6295, lng: -7.9811 },
  { id: 'tangier', habousVilleCode: 31, nameAr: 'طنجة', nameEn: 'Tangier', regionAr: 'طنجة - تطوان - الحسيمة', lat: 35.7595, lng: -5.834 },
  { id: 'agadir', habousVilleCode: 117, nameAr: 'أكادير', nameEn: 'Agadir', regionAr: 'سوس - ماسة', lat: 30.4278, lng: -9.5981 },
  { id: 'meknes', habousVilleCode: 85, nameAr: 'مكناس', nameEn: 'Meknes', regionAr: 'فاس - مكناس', lat: 33.8935, lng: -5.5473 },
  { id: 'oujda', habousVilleCode: 45, nameAr: 'وجدة', nameEn: 'Oujda', regionAr: 'الشرق', lat: 34.6814, lng: -1.9086 },
  { id: 'tetouan', habousVilleCode: 35, nameAr: 'تطوان', nameEn: 'Tetouan', regionAr: 'طنجة - تطوان - الحسيمة', lat: 35.5785, lng: -5.3684 },
  { id: 'laayoune', habousVilleCode: 142, nameAr: 'العيون', nameEn: 'Laayoune', regionAr: 'العيون - الساقية الحمراء', lat: 27.1536, lng: -13.2033 },
  { id: 'dakhla', habousVilleCode: 150, nameAr: 'الداخلة', nameEn: 'Dakhla', regionAr: 'الداخلة - وادي الذهب', lat: 23.6848, lng: -15.9579 },
]

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

  // Compute local astronomical Habous schedule as baseline
  const localSchedule = computePrayerSchedule(
    lat,
    lng,
    'morocco_habous',
    'shafi', // Maliki and Shafi share standard Asr shadow=1
    new Date(),
    'Africa/Casablanca'
  )

  try {
    // Query Method 21 (Official Moroccan Ministry of Habous and Islamic Affairs)
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
