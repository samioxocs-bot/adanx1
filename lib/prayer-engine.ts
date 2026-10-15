import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  SunnahTimes,
  Qibla,
  Madhab,
  CalculationParameters,
} from 'adhan'

export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
export type CalcMethodId =
  | 'morocco_habous'
  | 'algeria_awqaf'
  | 'tunisia_awqaf'
  | 'umm_al_qura'
  | 'muslim_world_league'
  | 'egyptian'
  | 'karachi'
  | 'isna'
  | 'dubai'
  | 'kuwait'
  | 'qatar'
  | 'turkey_diyanet'

export type RegionGroup =
  | 'maghreb'
  | 'haramain_gulf'
  | 'egypt_levant'
  | 'islamic_world'

export interface CityPreset {
  id: string
  nameAr: string
  nameEn: string
  countryAr: string
  countryEn: string
  region: RegionGroup
  lat: number
  lng: number
  timeZone: string
  method: CalcMethodId
  habousCityKey?: string
}

export const CITY_PRESETS: CityPreset[] = [
  // المدن المغربية — وزارة الأوقاف والشؤون الإسلامية بالمغرب
  {
    id: 'rabat',
    nameAr: 'الرباط',
    nameEn: 'Rabat',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    lat: 34.0209,
    lng: -6.8416,
    timeZone: 'Africa/Casablanca',
    method: 'morocco_habous',
    habousCityKey: 'rabat',
  },
  {
    id: 'casablanca',
    nameAr: 'الدار البيضاء',
    nameEn: 'Casablanca',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    lat: 33.5731,
    lng: -7.5898,
    timeZone: 'Africa/Casablanca',
    method: 'morocco_habous',
    habousCityKey: 'casablanca',
  },
  {
    id: 'fes',
    nameAr: 'فاس',
    nameEn: 'Fes',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    lat: 34.0181,
    lng: -5.0078,
    timeZone: 'Africa/Casablanca',
    method: 'morocco_habous',
    habousCityKey: 'fes',
  },
  {
    id: 'marrakech',
    nameAr: 'مراكش',
    nameEn: 'Marrakech',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    lat: 31.6295,
    lng: -7.9811,
    timeZone: 'Africa/Casablanca',
    method: 'morocco_habous',
    habousCityKey: 'marrakech',
  },
  {
    id: 'tangier',
    nameAr: 'طنجة',
    nameEn: 'Tangier',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    lat: 35.7595,
    lng: -5.834,
    timeZone: 'Africa/Casablanca',
    method: 'morocco_habous',
    habousCityKey: 'tangier',
  },
  {
    id: 'agadir',
    nameAr: 'أكادير',
    nameEn: 'Agadir',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    lat: 30.4278,
    lng: -9.5981,
    timeZone: 'Africa/Casablanca',
    method: 'morocco_habous',
    habousCityKey: 'agadir',
  },
  {
    id: 'meknes',
    nameAr: 'مكناس',
    nameEn: 'Meknes',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    lat: 33.8935,
    lng: -5.5473,
    timeZone: 'Africa/Casablanca',
    method: 'morocco_habous',
    habousCityKey: 'meknes',
  },
  {
    id: 'oujda',
    nameAr: 'وجدة',
    nameEn: 'Oujda',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    lat: 34.6814,
    lng: -1.9086,
    timeZone: 'Africa/Casablanca',
    method: 'morocco_habous',
    habousCityKey: 'oujda',
  },
  {
    id: 'tetouan',
    nameAr: 'تطوان',
    nameEn: 'Tetouan',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    lat: 35.5785,
    lng: -5.3684,
    timeZone: 'Africa/Casablanca',
    method: 'morocco_habous',
    habousCityKey: 'tetouan',
  },
  {
    id: 'laayoune',
    nameAr: 'العيون',
    nameEn: 'Laayoune',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    lat: 27.1536,
    lng: -13.2033,
    timeZone: 'Africa/Casablanca',
    method: 'morocco_habous',
    habousCityKey: 'laayoune',
  },
  // باقي دول المغرب العربي
  {
    id: 'algiers',
    nameAr: 'الجزائر العاصمة',
    nameEn: 'Algiers',
    countryAr: 'الجزائر',
    countryEn: 'Algeria',
    region: 'maghreb',
    lat: 36.7538,
    lng: 3.0588,
    timeZone: 'Africa/Algiers',
    method: 'algeria_awqaf',
  },
  {
    id: 'tunis',
    nameAr: 'تونس العاصمة',
    nameEn: 'Tunis',
    countryAr: 'تونس',
    countryEn: 'Tunisia',
    region: 'maghreb',
    lat: 36.8065,
    lng: 10.1815,
    timeZone: 'Africa/Tunis',
    method: 'tunisia_awqaf',
  },
  {
    id: 'tripoli',
    nameAr: 'طرابلس',
    nameEn: 'Tripoli',
    countryAr: 'ليبيا',
    countryEn: 'Libya',
    region: 'maghreb',
    lat: 32.8872,
    lng: 13.1913,
    timeZone: 'Africa/Tripoli',
    method: 'egyptian',
  },
  {
    id: 'nouakchott',
    nameAr: 'نواكشوط',
    nameEn: 'Nouakchott',
    countryAr: 'موريتانيا',
    countryEn: 'Mauritania',
    region: 'maghreb',
    lat: 18.0735,
    lng: -15.9582,
    timeZone: 'Africa/Nouakchott',
    method: 'muslim_world_league',
  },
  // الحرمين الشريفين والخليج
  {
    id: 'makkah',
    nameAr: 'مكة المكرمة',
    nameEn: 'Makkah',
    countryAr: 'السعودية',
    countryEn: 'Saudi Arabia',
    region: 'haramain_gulf',
    lat: 21.4225,
    lng: 39.8262,
    timeZone: 'Asia/Riyadh',
    method: 'umm_al_qura',
  },
  {
    id: 'madinah',
    nameAr: 'المدينة المنورة',
    nameEn: 'Madinah',
    countryAr: 'السعودية',
    countryEn: 'Saudi Arabia',
    region: 'haramain_gulf',
    lat: 24.4672,
    lng: 39.6112,
    timeZone: 'Asia/Riyadh',
    method: 'umm_al_qura',
  },
  {
    id: 'riyadh',
    nameAr: 'الرياض',
    nameEn: 'Riyadh',
    countryAr: 'السعودية',
    countryEn: 'Saudi Arabia',
    region: 'haramain_gulf',
    lat: 24.7136,
    lng: 46.6753,
    timeZone: 'Asia/Riyadh',
    method: 'umm_al_qura',
  },
  {
    id: 'dubai',
    nameAr: 'دبي',
    nameEn: 'Dubai',
    countryAr: 'الإمارات',
    countryEn: 'UAE',
    region: 'haramain_gulf',
    lat: 25.2048,
    lng: 55.2708,
    timeZone: 'Asia/Dubai',
    method: 'dubai',
  },
  {
    id: 'doha',
    nameAr: 'الدوحة',
    nameEn: 'Doha',
    countryAr: 'قطر',
    countryEn: 'Qatar',
    region: 'haramain_gulf',
    lat: 25.2854,
    lng: 51.531,
    timeZone: 'Asia/Qatar',
    method: 'qatar',
  },
  {
    id: 'kuwait_city',
    nameAr: 'مدينة الكويت',
    nameEn: 'Kuwait City',
    countryAr: 'الكويت',
    countryEn: 'Kuwait',
    region: 'haramain_gulf',
    lat: 29.3759,
    lng: 47.9774,
    timeZone: 'Asia/Kuwait',
    method: 'kuwait',
  },
  // مصر والشام والقدس والعراق
  {
    id: 'cairo',
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    countryAr: 'مصر',
    countryEn: 'Egypt',
    region: 'egypt_levant',
    lat: 30.0444,
    lng: 31.2357,
    timeZone: 'Africa/Cairo',
    method: 'egyptian',
  },
  {
    id: 'alquds',
    nameAr: 'القدس الشريف',
    nameEn: 'Al-Quds',
    countryAr: 'فلسطين',
    countryEn: 'Palestine',
    region: 'egypt_levant',
    lat: 31.7683,
    lng: 35.2137,
    timeZone: 'Asia/Jerusalem',
    method: 'muslim_world_league',
  },
  {
    id: 'damascus',
    nameAr: 'دمشق',
    nameEn: 'Damascus',
    countryAr: 'سوريا',
    countryEn: 'Syria',
    region: 'egypt_levant',
    lat: 33.5138,
    lng: 36.2765,
    timeZone: 'Asia/Damascus',
    method: 'muslim_world_league',
  },
  {
    id: 'baghdad',
    nameAr: 'بغداد',
    nameEn: 'Baghdad',
    countryAr: 'العراق',
    countryEn: 'Iraq',
    region: 'egypt_levant',
    lat: 33.3152,
    lng: 44.3661,
    timeZone: 'Asia/Baghdad',
    method: 'muslim_world_league',
  },
  // تركيا وآسيا وأوروبا
  {
    id: 'istanbul',
    nameAr: 'إسطنبول',
    nameEn: 'Istanbul',
    countryAr: 'تركيا',
    countryEn: 'Turkey',
    region: 'islamic_world',
    lat: 41.0082,
    lng: 28.9784,
    timeZone: 'Europe/Istanbul',
    method: 'turkey_diyanet',
  },
  {
    id: 'kuala_lumpur',
    nameAr: 'كوالالمبور',
    nameEn: 'Kuala Lumpur',
    countryAr: 'ماليزيا',
    countryEn: 'Malaysia',
    region: 'islamic_world',
    lat: 3.139,
    lng: 101.6869,
    timeZone: 'Asia/Kuala_Lumpur',
    method: 'muslim_world_league',
  },
  {
    id: 'jakarta',
    nameAr: 'جاكرتا',
    nameEn: 'Jakarta',
    countryAr: 'إندونيسيا',
    countryEn: 'Indonesia',
    region: 'islamic_world',
    lat: -6.2088,
    lng: 106.8456,
    timeZone: 'Asia/Jakarta',
    method: 'muslim_world_league',
  },
  {
    id: 'london',
    nameAr: 'لندن',
    nameEn: 'London',
    countryAr: 'المملكة المتحدة',
    countryEn: 'United Kingdom',
    region: 'islamic_world',
    lat: 51.5074,
    lng: -0.1278,
    timeZone: 'Europe/London',
    method: 'muslim_world_league',
  },
]

export const CALC_METHODS: {
  id: CalcMethodId
  nameAr: string
  nameEn: string
  badgeAr?: string
}[] = [
  {
    id: 'morocco_habous',
    nameAr: 'وزارة الأوقاف والشؤون الإسلامية بالمغرب (Habous API)',
    nameEn: 'Moroccan Ministry of Habous & Islamic Affairs (Method 21)',
    badgeAr: 'رسمي - المغرب',
  },
  {
    id: 'algeria_awqaf',
    nameAr: 'وزارة الشؤون الدينية والأوقاف بالجزائر',
    nameEn: 'Algerian Ministry of Religious Affairs',
    badgeAr: 'المغرب العربي',
  },
  {
    id: 'tunisia_awqaf',
    nameAr: 'وزارة الشؤون الدينية بالجمهورية التونسية',
    nameEn: 'Tunisian Ministry of Religious Affairs',
    badgeAr: 'المغرب العربي',
  },
  {
    id: 'umm_al_qura',
    nameAr: 'تقويم أم القرى (مكة المكرمة)',
    nameEn: 'Umm Al-Qura University, Makkah',
  },
  {
    id: 'muslim_world_league',
    nameAr: 'رابطة العالم الإسلامي',
    nameEn: 'Muslim World League (MWL)',
  },
  {
    id: 'egyptian',
    nameAr: 'الهيئة المصرية العامة للمساحة',
    nameEn: 'Egyptian General Authority',
  },
  {
    id: 'dubai',
    nameAr: 'دائرة الشؤون الإسلامية بدبي',
    nameEn: 'Dubai Islamic Affairs',
  },
  {
    id: 'qatar',
    nameAr: 'دار التقويم القطري',
    nameEn: 'Qatar Calendar House',
  },
  {
    id: 'kuwait',
    nameAr: 'وزارة الأوقاف الكويتية',
    nameEn: 'Kuwait Ministry of Awqaf',
  },
  {
    id: 'turkey_diyanet',
    nameAr: 'رئاسة الشؤون الدينية التركية (ديانت)',
    nameEn: 'Diyanet İşleri Başkanlığı, Turkey',
  },
  {
    id: 'isna',
    nameAr: 'الجمعية الإسلامية لأمريكا الشمالية',
    nameEn: 'ISNA (North America)',
  },
  {
    id: 'karachi',
    nameAr: 'جامعة العلوم الإسلامية بكراتشي',
    nameEn: 'University of Islamic Sciences, Karachi',
  },
]

export function getCalculationParams(
  method: CalcMethodId,
  madhab: 'shafi' | 'hanafi' = 'shafi'
): CalculationParameters {
  let params: CalculationParameters
  switch (method) {
    case 'morocco_habous': {
      // Official Moroccan Ministry of Habous parameters: Fajr 19°, Isha 17°, +5m Dhuhr precaution, +4m Maghrib precaution
      params = CalculationMethod.Other()
      params.fajrAngle = 19
      params.ishaAngle = 17
      params.adjustments.dhuhr = 5
      params.adjustments.maghrib = 4
      break
    }
    case 'algeria_awqaf': {
      // Algerian Ministry: Fajr 18°, Isha 17°, +3m Maghrib
      params = CalculationMethod.Other()
      params.fajrAngle = 18
      params.ishaAngle = 17
      params.adjustments.maghrib = 3
      break
    }
    case 'tunisia_awqaf': {
      // Tunisian Ministry: Fajr 18°, Isha 18°
      params = CalculationMethod.Other()
      params.fajrAngle = 18
      params.ishaAngle = 18
      break
    }
    case 'turkey_diyanet':
      params = CalculationMethod.Turkey()
      break
    case 'umm_al_qura':
      params = CalculationMethod.UmmAlQura()
      break
    case 'egyptian':
      params = CalculationMethod.Egyptian()
      break
    case 'dubai':
      params = CalculationMethod.Dubai()
      break
    case 'qatar':
      params = CalculationMethod.Qatar()
      break
    case 'kuwait':
      params = CalculationMethod.Kuwait()
      break
    case 'isna':
      params = CalculationMethod.NorthAmerica()
      break
    case 'karachi':
      params = CalculationMethod.Karachi()
      break
    case 'muslim_world_league':
    default:
      params = CalculationMethod.MuslimWorldLeague()
      break
  }
  params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi
  return params
}

export interface PrayerScheduleItem {
  id: PrayerId
  nameAr: string
  nameEn: string
  time: Date
  formatted24: string
  formatted12Ar: string
  formatted12En: string
  isNext: boolean
  isPassed: boolean
  verseAr: string
  verseRefAr: string
  verseEn: string
  recommendedWindowMinutes: number
}

export interface ComputedPrayerDay {
  dateIso: string
  hijriDateAr: string
  hijriDateEn: string
  hijriMonthAr: string
  hijriDay: number
  hijriYear: number
  gregorianAr: string
  gregorianEn: string
  prayers: PrayerScheduleItem[]
  sunrise: {
    time: Date
    formatted12Ar: string
    formatted12En: string
  }
  imsak: {
    time: Date
    formatted12Ar: string
    formatted12En: string
  }
  iftar: {
    time: Date
    formatted12Ar: string
    formatted12En: string
  }
  lastThirdOfNight: {
    time: Date
    formatted12Ar: string
    formatted12En: string
  }
  nextPrayer: {
    id: PrayerId
    nameAr: string
    nameEn: string
    time: Date
    formatted12Ar: string
    formatted12En: string
    remainingSeconds: number
    remainingFormatted: string
    alertState: 'none' | 'pre15' | 'pre5' | 'now'
  }
  qiblaAngle: number
  distanceToKaabaKm: number
}

const PRAYER_META: Record<
  PrayerId,
  {
    nameAr: string
    nameEn: string
    verseAr: string
    verseRefAr: string
    verseEn: string
    recommendedWindowMinutes: number
  }
> = {
  fajr: {
    nameAr: 'الفجر',
    nameEn: 'Fajr',
    verseAr:
      'أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا',
    verseRefAr: 'سورة الإسراء - آية 78',
    verseEn: 'Indeed, the recitation of dawn is ever witnessed. (Al-Isra 17:78)',
    recommendedWindowMinutes: 20,
  },
  dhuhr: {
    nameAr: 'الظهر',
    nameEn: 'Dhuhr',
    verseAr:
      'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ',
    verseRefAr: 'سورة البقرة - آية 238',
    verseEn:
      'Maintain with care the obligatory prayers and stand before Allah devoutly. (Al-Baqarah 2:238)',
    recommendedWindowMinutes: 25,
  },
  asr: {
    nameAr: 'العصر',
    nameEn: 'Asr',
    verseAr:
      'وَالْعَصْرِ * إِنَّ الْإِنسَانَ لَفِي خُسْرٍ * إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ',
    verseRefAr: 'سورة العصر - آية 1-3',
    verseEn:
      'By time, indeed mankind is in loss, except those who believe and do righteous deeds. (Al-Asr 103:1-3)',
    recommendedWindowMinutes: 20,
  },
  maghrib: {
    nameAr: 'المغرب',
    nameEn: 'Maghrib',
    verseAr: 'فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ',
    verseRefAr: 'سورة الروم - آية 17',
    verseEn:
      'So exalted is Allah when you reach the evening and when you reach the morning. (Ar-Rum 30:17)',
    recommendedWindowMinutes: 12,
  },
  isha: {
    nameAr: 'العشاء',
    nameEn: 'Isha',
    verseAr: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا',
    verseRefAr: 'سورة النساء - آية 103',
    verseEn:
      'Indeed, prayer has been decreed upon the believers a decree of specified times. (An-Nisa 4:103)',
    recommendedWindowMinutes: 30,
  },
}

const TIMEZONE_UTC_OFFSET_MINUTES: Record<string, number> = {
  'Africa/Casablanca': 60,
  'Africa/Algiers': 60,
  'Africa/Tunis': 60,
  'Africa/Tripoli': 120,
  'Africa/Nouakchott': 0,
  'Asia/Riyadh': 180,
  'Asia/Dubai': 240,
  'Asia/Qatar': 180,
  'Asia/Kuwait': 180,
  'Africa/Cairo': 180,
  'Asia/Jerusalem': 180,
  'Asia/Damascus': 180,
  'Asia/Baghdad': 180,
  'Europe/Istanbul': 180,
  'Asia/Kuala_Lumpur': 480,
  'Asia/Jakarta': 420,
  'Europe/London': 60,
  UTC: 0,
}

function getShiftedUtcDate(date: Date, timeZone = 'Africa/Casablanca'): Date {
  const offsetMinutes = TIMEZONE_UTC_OFFSET_MINUTES[timeZone] ?? 60
  return new Date(date.getTime() + offsetMinutes * 60_000)
}

export function formatTime12Ar(date: Date, timeZone = 'Africa/Casablanca'): string {
  const shifted = getShiftedUtcDate(date, timeZone)
  const h24 = shifted.getUTCHours()
  const m = shifted.getUTCMinutes()
  const h12 = h24 % 12 || 12
  const suffix = h24 >= 12 ? 'م' : 'ص'
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`
}

export function formatTime12En(date: Date, timeZone = 'Africa/Casablanca'): string {
  const shifted = getShiftedUtcDate(date, timeZone)
  const h24 = shifted.getUTCHours()
  const m = shifted.getUTCMinutes()
  const h12 = h24 % 12 || 12
  const suffix = h24 >= 12 ? 'PM' : 'AM'
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`
}

export function formatTime24(date: Date, timeZone = 'Africa/Casablanca'): string {
  const shifted = getShiftedUtcDate(date, timeZone)
  const h24 = shifted.getUTCHours()
  const m = shifted.getUTCMinutes()
  return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function calculateDistanceToKaabaKm(lat: number, lng: number): number {
  const kaabaLat = 21.422487
  const kaabaLng = 39.826206
  const R = 6371
  const dLat = ((kaabaLat - lat) * Math.PI) / 180
  const dLng = ((kaabaLng - lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((kaabaLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

export function computePrayerSchedule(
  lat: number,
  lng: number,
  method: CalcMethodId = 'morocco_habous',
  madhab: 'shafi' | 'hanafi' = 'shafi',
  now: Date = new Date(),
  timeZone = 'Africa/Casablanca'
): ComputedPrayerDay {
  const coords = new Coordinates(lat, lng)
  const params = getCalculationParams(method, madhab)
  const shiftedNow = getShiftedUtcDate(now, timeZone)
  // Use Date.UTC so the astronomical engine receives the exact solar calendar date in the target city regardless of local server/browser timezone
  const solarDate = new Date(
    Date.UTC(
      shiftedNow.getUTCFullYear(),
      shiftedNow.getUTCMonth(),
      shiftedNow.getUTCDate(),
      12,
      0,
      0
    )
  )
  const prayerTimes = new PrayerTimes(coords, solarDate, params)
  const sunnahTimes = new SunnahTimes(prayerTimes)
  const qiblaAngle = Math.round(Qibla(coords) * 10) / 10

  // Imsak is traditionally 10 minutes before Fajr
  const imsakTime = new Date(prayerTimes.fajr.getTime() - 10 * 60 * 1000)
  const iftarTime = prayerTimes.maghrib

  const rawEntries: { id: PrayerId; time: Date }[] = [
    { id: 'fajr', time: prayerTimes.fajr },
    { id: 'dhuhr', time: prayerTimes.dhuhr },
    { id: 'asr', time: prayerTimes.asr },
    { id: 'maghrib', time: prayerTimes.maghrib },
    { id: 'isha', time: prayerTimes.isha },
  ]

  // Find next prayer
  let nextPrayerEntry = rawEntries.find(
    (item) => item.time.getTime() > now.getTime()
  )
  let isTomorrowFajr = false

  if (!nextPrayerEntry) {
    const tomorrowSolar = new Date(
      Date.UTC(
        shiftedNow.getUTCFullYear(),
        shiftedNow.getUTCMonth(),
        shiftedNow.getUTCDate() + 1,
        12,
        0,
        0
      )
    )
    const tomorrowPrayers = new PrayerTimes(coords, tomorrowSolar, params)
    nextPrayerEntry = { id: 'fajr', time: tomorrowPrayers.fajr }
    isTomorrowFajr = true
  }

  const remainingMs = Math.max(
    0,
    nextPrayerEntry.time.getTime() - now.getTime()
  )
  const remainingSeconds = Math.floor(remainingMs / 1000)
  const hrs = Math.floor(remainingSeconds / 3600)
  const mins = Math.floor((remainingSeconds % 3600) / 60)
  const secs = remainingSeconds % 60
  const remainingFormatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  let alertState: 'none' | 'pre15' | 'pre5' | 'now' = 'none'
  if (remainingSeconds <= 60) {
    alertState = 'now'
  } else if (remainingSeconds <= 5 * 60) {
    alertState = 'pre5'
  } else if (remainingSeconds <= 15 * 60) {
    alertState = 'pre15'
  }

  const prayers: PrayerScheduleItem[] = rawEntries.map((entry) => {
    const meta = PRAYER_META[entry.id]
    const isNext = !isTomorrowFajr && nextPrayerEntry?.id === entry.id
    const isPassed = entry.time.getTime() <= now.getTime()
    return {
      id: entry.id,
      nameAr: meta.nameAr,
      nameEn: meta.nameEn,
      time: entry.time,
      formatted24: formatTime24(entry.time, timeZone),
      formatted12Ar: formatTime12Ar(entry.time, timeZone),
      formatted12En: formatTime12En(entry.time, timeZone),
      isNext,
      isPassed,
      verseAr: meta.verseAr,
      verseRefAr: meta.verseRefAr,
      verseEn: meta.verseEn,
      recommendedWindowMinutes: meta.recommendedWindowMinutes,
    }
  })

  let hijriDateAr = ''
  let hijriDateEn = ''
  let hijriMonthAr = ''
  let hijriDay = 1
  let hijriYear = 1448

  try {
    hijriDateAr = new Intl.DateTimeFormat(
      'ar-SA-u-ca-islamic-umalqura-nu-latn',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }
    ).format(shiftedNow)
    hijriDateEn = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(shiftedNow)
    hijriMonthAr = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      month: 'long',
      timeZone: 'UTC',
    }).format(shiftedNow)
    const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).formatToParts(shiftedNow)
    const dPart = parts.find((p) => p.type === 'day')
    const yPart = parts.find((p) => p.type === 'year')
    if (dPart) hijriDay = parseInt(dPart.value, 10) || 1
    if (yPart) hijriYear = parseInt(yPart.value, 10) || 1448
  } catch {
    hijriDateAr = '3 جمادى الأولى 1448 هـ'
    hijriDateEn = '3 Jumada Al-Ula 1448 AH'
    hijriMonthAr = 'جمادى الأولى'
  }

  const gregorianAr = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(shiftedNow)

  const gregorianEn = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(shiftedNow)

  const nextMeta = PRAYER_META[nextPrayerEntry.id]

  return {
    dateIso: shiftedNow.toISOString().split('T')[0],
    hijriDateAr,
    hijriDateEn,
    hijriMonthAr,
    hijriDay,
    hijriYear,
    gregorianAr,
    gregorianEn,
    prayers,
    sunrise: {
      time: prayerTimes.sunrise,
      formatted12Ar: formatTime12Ar(prayerTimes.sunrise, timeZone),
      formatted12En: formatTime12En(prayerTimes.sunrise, timeZone),
    },
    imsak: {
      time: imsakTime,
      formatted12Ar: formatTime12Ar(imsakTime, timeZone),
      formatted12En: formatTime12En(imsakTime, timeZone),
    },
    iftar: {
      time: iftarTime,
      formatted12Ar: formatTime12Ar(iftarTime, timeZone),
      formatted12En: formatTime12En(iftarTime, timeZone),
    },
    lastThirdOfNight: {
      time: sunnahTimes.lastThirdOfTheNight,
      formatted12Ar: formatTime12Ar(sunnahTimes.lastThirdOfTheNight, timeZone),
      formatted12En: formatTime12En(sunnahTimes.lastThirdOfTheNight, timeZone),
    },
    nextPrayer: {
      id: nextPrayerEntry.id,
      nameAr: nextMeta.nameAr,
      nameEn: nextMeta.nameEn,
      time: nextPrayerEntry.time,
      formatted12Ar: formatTime12Ar(nextPrayerEntry.time, timeZone),
      formatted12En: formatTime12En(nextPrayerEntry.time, timeZone),
      remainingSeconds,
      remainingFormatted,
      alertState,
    },
    qiblaAngle,
    distanceToKaabaKm: calculateDistanceToKaabaKm(lat, lng),
  }
}

export interface MuezzinProfile {
  id: string
  nameAr: string
  nameEn: string
  countryAr: string
  countryEn: string
  region: RegionGroup
  mosqueAr: string
  mosqueEn: string
  maqamAr: string
  takbeerStyleAr: string
  baseFreq: number
  audioStreamUrl: string
  offlineSlot?: 1 | 2 | 3 | 4 | 5
  isCoreOffline?: boolean
}

export const MUEZZIN_PROFILES: MuezzinProfile[] = [
  // === الأصوات الـ 5 الأساسية المخزنة محلياً (تعمل 100% بدون إنترنت) ===
  {
    id: 'morocco_rabat_habous',
    nameAr: 'الأذان الأول (بدون إنترنت): الأذان المغربي الرسمي — الرباط',
    nameEn: 'Offline Adhan 1: Official Moroccan Habous (Rabat)',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    mosqueAr: 'مسجد حسان ومسجد السنة - الرباط (مخزن بالجهاز)',
    mosqueEn: 'Hassan & As-Sunnah Mosque, Rabat (Offline Ready)',
    maqamAr: 'الطبع المغربي الأندلسي الأصيل',
    takbeerStyleAr: 'صيغة المذهب المالكي (تثنية التكبير وترجيع الشهادتين)',
    baseFreq: 293.66,
    audioStreamUrl: '/audio/adhan-1.mp3',
    offlineSlot: 1,
    isCoreOffline: true,
  },
  {
    id: 'morocco_fes_qarawiyyin',
    nameAr: 'الأذان الثاني (بدون إنترنت): أذان جامع القرويين والكتبية — فاس ومراكش',
    nameEn: 'Offline Adhan 2: Al-Qarawiyyin & Koutoubia (Morocco)',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    mosqueAr: 'جامع القرويين بفاس وجامع الكتبية بمراكش (مخزن بالجهاز)',
    mosqueEn: 'Al-Qarawiyyin & Koutoubia Mosques (Offline Ready)',
    maqamAr: 'طبع الأصبهان والحجاز المغاربي',
    takbeerStyleAr: 'صيغة المذهب المالكي المغاربي',
    baseFreq: 277.18,
    audioStreamUrl: '/audio/adhan-2.mp3',
    offlineSlot: 2,
    isCoreOffline: true,
  },
  {
    id: 'makkah_haram',
    nameAr: 'الأذان الثالث (بدون إنترنت): أذان المسجد الحرام — مكة المكرمة',
    nameEn: 'Offline Adhan 3: Masjid Al-Haram (Makkah)',
    countryAr: 'السعودية',
    countryEn: 'Saudi Arabia',
    region: 'haramain_gulf',
    mosqueAr: 'المسجد الحرام بمكة المكرمة (مخزن بالجهاز)',
    mosqueEn: 'Masjid Al-Haram, Makkah (Offline Ready)',
    maqamAr: 'مقام الحجاز المكي الأصيل',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 293.66,
    audioStreamUrl: '/audio/adhan-3.mp3',
    offlineSlot: 3,
    isCoreOffline: true,
  },
  {
    id: 'madinah_haram',
    nameAr: 'الأذان الرابع (بدون إنترنت): أذان المسجد النبوي الشريف — المدينة المنورة',
    nameEn: 'Offline Adhan 4: Al-Masjid An-Nabawi (Madinah)',
    countryAr: 'السعودية',
    countryEn: 'Saudi Arabia',
    region: 'haramain_gulf',
    mosqueAr: 'المسجد النبوي الشريف بالمدينة (مخزن بالجهاز)',
    mosqueEn: 'Al-Masjid An-Nabawi, Madinah (Offline Ready)',
    maqamAr: 'مقام البياتي المدني الخاشع',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 329.63,
    audioStreamUrl: '/audio/adhan-4.mp3',
    offlineSlot: 4,
    isCoreOffline: true,
  },
  {
    id: 'alquds_aqsa',
    nameAr: 'الأذان الخامس (بدون إنترنت): أذان المسجد الأقصى والجامع الأزهر',
    nameEn: 'Offline Adhan 5: Al-Aqsa & Al-Azhar Mosque Adhan',
    countryAr: 'فلسطين / مصر',
    countryEn: 'Palestine / Egypt',
    region: 'egypt_levant',
    mosqueAr: 'المسجد الأقصى المبارك والجامع الأزهر (مخزن بالجهاز)',
    mosqueEn: 'Al-Aqsa & Al-Azhar Mosques (Offline Ready)',
    maqamAr: 'المقام المقدسي والراست المصري',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 311.13,
    audioStreamUrl: '/audio/adhan-5.mp3',
    offlineSlot: 5,
    isCoreOffline: true,
  },

  // === باقي أصوات الدول المغاربية والإسلامية (مرتبطة بالملفات الصوتية المحلية وتعمل بدون إنترنت) ===
  {
    id: 'morocco_hassan_ii',
    nameAr: 'أذان مسجد الحسن الثاني الكبير',
    nameEn: 'Hassan II Grand Mosque Adhan',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    mosqueAr: 'مسجد الحسن الثاني - الدار البيضاء',
    mosqueEn: 'Hassan II Mosque, Casablanca',
    maqamAr: 'مقام الاستهلال المغربي الخاشع',
    takbeerStyleAr: 'صيغة المذهب المالكي المغاربي',
    baseFreq: 311.13,
    audioStreamUrl: '/audio/adhan-1.mp3',
    offlineSlot: 1,
  },
  {
    id: 'morocco_marrakech_koutoubia',
    nameAr: 'أذان جامع الكتبية بمراكش',
    nameEn: 'Koutoubia Mosque Adhan (Marrakech)',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    mosqueAr: 'جامع الكتبية - مراكش',
    mosqueEn: 'Koutoubia Mosque, Marrakech',
    maqamAr: 'الطبع المراكشي المغربي',
    takbeerStyleAr: 'صيغة المذهب المالكي المغاربي',
    baseFreq: 329.63,
    audioStreamUrl: '/audio/adhan-2.mp3',
    offlineSlot: 2,
  },
  {
    id: 'algeria_algiers',
    nameAr: 'الأذان الجزائري المغاربي الأصيل',
    nameEn: 'Great Mosque of Algiers Adhan',
    countryAr: 'الجزائر',
    countryEn: 'Algeria',
    region: 'maghreb',
    mosqueAr: 'الجامع الأعظم - الجزائر العاصمة',
    mosqueEn: 'Djamaa el Djazair, Algiers',
    maqamAr: 'مقام الزيدان والحجاز الجزائري',
    takbeerStyleAr: 'صيغة المذهب المالكي المغاربي',
    baseFreq: 293.66,
    audioStreamUrl: '/audio/adhan-2.mp3',
    offlineSlot: 2,
  },
  {
    id: 'tunisia_zitouna',
    nameAr: 'أذان جامع الزيتونة المعمور',
    nameEn: 'Ez-Zitouna Mosque Adhan (Tunis)',
    countryAr: 'تونس',
    countryEn: 'Tunisia',
    region: 'maghreb',
    mosqueAr: 'جامع الزيتونة - تونس العاصمة',
    mosqueEn: 'Ez-Zitouna Grand Mosque, Tunis',
    maqamAr: 'طبع الحسين والبياتي التونسي',
    takbeerStyleAr: 'صيغة المذهب المالكي المغاربي',
    baseFreq: 349.23,
    audioStreamUrl: '/audio/adhan-1.mp3',
    offlineSlot: 1,
  },
  {
    id: 'libya_tripoli',
    nameAr: 'الأذان الليبي الطرابلسي',
    nameEn: 'Tripoli Grand Mosque Adhan (Libya)',
    countryAr: 'ليبيا',
    countryEn: 'Libya',
    region: 'maghreb',
    mosqueAr: 'جامع قرجي والناقة - طرابلس',
    mosqueEn: 'Gurgi Mosque, Tripoli',
    maqamAr: 'الأداء المغاربي الليبي',
    takbeerStyleAr: 'صيغة المذهب المالكي المغاربي',
    baseFreq: 311.13,
    audioStreamUrl: '/audio/adhan-2.mp3',
    offlineSlot: 2,
  },
  {
    id: 'mauritania_chinguetti',
    nameAr: 'الأذان الشنقيطي الموريتاني',
    nameEn: 'Chinguetti & Nouakchott Adhan (Mauritania)',
    countryAr: 'موريتانيا',
    countryEn: 'Mauritania',
    region: 'maghreb',
    mosqueAr: 'المسجد الجامع بنواكشوط وشنقيط',
    mosqueEn: 'Grand Mosque of Nouakchott',
    maqamAr: 'مقام التيدنيت الشنقيطي الخاشع',
    takbeerStyleAr: 'صيغة المذهب المالكي المغاربي',
    baseFreq: 261.63,
    audioStreamUrl: '/audio/adhan-1.mp3',
    offlineSlot: 1,
  },
  {
    id: 'alafasy',
    nameAr: 'الشيخ مشاري راشد العفاسي',
    nameEn: 'Sheikh Mishary Rashid Alafasy',
    countryAr: 'الكويت',
    countryEn: 'Kuwait',
    region: 'haramain_gulf',
    mosqueAr: 'المسجد الكبير - الكويت',
    mosqueEn: 'Grand Mosque, Kuwait',
    maqamAr: 'مقام النهاوند الخاشع',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 261.63,
    audioStreamUrl: '/audio/adhan-3.mp3',
    offlineSlot: 3,
  },
  {
    id: 'uae_zayed',
    nameAr: 'أذان جامع الشيخ زايد الكبير',
    nameEn: 'Sheikh Zayed Grand Mosque Adhan',
    countryAr: 'الإمارات',
    countryEn: 'UAE',
    region: 'haramain_gulf',
    mosqueAr: 'جامع الشيخ زايد - أبوظبي',
    mosqueEn: 'Sheikh Zayed Mosque, Abu Dhabi',
    maqamAr: 'مقام الصبا والبياتي الخليجي',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 293.66,
    audioStreamUrl: '/audio/adhan-4.mp3',
    offlineSlot: 4,
  },
  {
    id: 'abdulbasit',
    nameAr: 'الشيخ عبد الباسط عبد الصمد',
    nameEn: 'Sheikh Abdulbasit Abdulsamad',
    countryAr: 'مصر',
    countryEn: 'Egypt',
    region: 'egypt_levant',
    mosqueAr: 'مسجد الإمام الشافعي - القاهرة',
    mosqueEn: 'Imam Shafi Mosque, Cairo',
    maqamAr: 'مقام الراست والبياتي المصري',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 349.23,
    audioStreamUrl: '/audio/adhan-5.mp3',
    offlineSlot: 5,
  },
  {
    id: 'damascus_umayyad',
    nameAr: 'الأذان الدمشقي الجماعي (الجامع الأموي)',
    nameEn: 'Umayyad Mosque Choral Adhan (Damascus)',
    countryAr: 'سوريا',
    countryEn: 'Syria',
    region: 'egypt_levant',
    mosqueAr: 'الجامع الأموي الكبير - دمشق',
    mosqueEn: 'Umayyad Mosque, Damascus',
    maqamAr: 'جوق المؤذنين بالجامع الأموي',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 277.18,
    audioStreamUrl: '/audio/adhan-4.mp3',
    offlineSlot: 4,
  },
  {
    id: 'istanbul_ayasofya',
    nameAr: 'أذان مسجد آيا صوفيا والسلطان أحمد',
    nameEn: 'Hagia Sophia & Blue Mosque Adhan',
    countryAr: 'تركيا',
    countryEn: 'Turkey',
    region: 'islamic_world',
    mosqueAr: 'مسجد آيا صوفيا الكبير - إسطنبول',
    mosqueEn: 'Hagia Sophia Grand Mosque, Istanbul',
    maqamAr: 'مقام الصبا والحجاز العثماني',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 329.63,
    audioStreamUrl: '/audio/adhan-3.mp3',
    offlineSlot: 3,
  },
  {
    id: 'malaysia_putra',
    nameAr: 'أذان المسجد الوطني بماليزيا',
    nameEn: 'Putra Mosque Adhan (Malaysia)',
    countryAr: 'ماليزيا',
    countryEn: 'Malaysia',
    region: 'islamic_world',
    mosqueAr: 'مسجد بوترا - كوالالمبور',
    mosqueEn: 'Putra Mosque, Kuala Lumpur',
    maqamAr: 'مقام النهاوند الآسيوي الهادئ',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 261.63,
    audioStreamUrl: '/audio/adhan-4.mp3',
    offlineSlot: 4,
  },
  {
    id: 'indonesia_istiqlal',
    nameAr: 'أذان مسجد الاستقلال بجاكرتا',
    nameEn: 'Istiqlal Grand Mosque Adhan (Indonesia)',
    countryAr: 'إندونيسيا',
    countryEn: 'Indonesia',
    region: 'islamic_world',
    mosqueAr: 'مسجد الاستقلال الكبير - جاكرتا',
    mosqueEn: 'Istiqlal Mosque, Jakarta',
    maqamAr: 'مقام البياتي الجاوي الخاشع',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 293.66,
    audioStreamUrl: '/audio/adhan-5.mp3',
    offlineSlot: 5,
  },
]

export interface FiqhTopic {
  id: string
  categoryAr: string
  categoryEn: string
  titleAr: string
  titleEn: string
  summaryAr: string
  summaryEn: string
  detailsAr: string[]
  evidenceAr: string
}

export const FIQH_TOPICS: FiqhTopic[] = [
  {
    id: 'maliki_adhan',
    categoryAr: 'فقه الأذان المغاربي',
    categoryEn: 'Maghrebi & Maliki Adhan Fiqh',
    titleAr: 'صفة الأذان في المذهب المالكي والغرب الإسلامي',
    titleEn: 'Maliki Adhan Formula in Morocco & Maghreb',
    summaryAr:
      'الخصائص الفقهية للأذان المغاربي المعتمد لدى وزارة الأوقاف والشؤون الإسلامية بالمغرب وسائر بلاد المغرب العربي.',
    summaryEn:
      'Authentic Maliki jurisprudence of Adhan practiced across Morocco, Algeria, Tunisia, Libya, and Mauritania.',
    detailsAr: [
      'تثنية التكبير في أول الأذان (الله أكبر، الله أكبر — مرتين) عملاً بعمل أهل المدينة المنورة الذي نقله الإمام مالك رحمه الله',
      'الترجيع في الشهادتين: النطق بالشهادتين سراً بصوت منخفض ثم إعادتهما جهراً بصوت مرتفع',
      'التثويب في أذان الفجر (الصلاة خير من النوم — مرتين) بعد حي على الفلاح',
      'الإقامة تكون مفردة في ألفاظها عند المالكية إلا قد قامت الصلاة',
    ],
    evidenceAr:
      'حديث أبي محذورة رضي الله عنه في صحيح مسلم، وما استقر عليه عمل أهل المدينة في موطأ الإمام مالك',
  },
  {
    id: 'shuroot',
    categoryAr: 'الشروط والأركان',
    categoryEn: 'Conditions & Pillars',
    titleAr: 'شروط صحة الصلاة التسعة',
    titleEn: 'The Nine Conditions of Valid Prayer',
    summaryAr: 'الشروط التي تسبق الصلاة ويجب تحققها لصحة الأداء والقبول.',
    summaryEn:
      'Prerequisites that must be fulfilled before and during prayer.',
    detailsAr: [
      'الإسلام والعقل والتمييز',
      'رفع الحدث الأصغر بالوضوء والأكبر بالاغتسال',
      'إزالة النجاسة عن البدن والثوب والمكان',
      'ستر العورة ودخول الوقت الشرعي المحدد فلكياً أو عبر تقويم وزارة الأوقاف',
      'استقبال القبلة والنية بالقلب دون التلفظ بها',
    ],
    evidenceAr:
      'قال تعالى: {إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا} [النساء: 103]',
  },
  {
    id: 'arkan',
    categoryAr: 'الشروط والأركان',
    categoryEn: 'Conditions & Pillars',
    titleAr: 'فرائض وأركان الصلاة',
    titleEn: 'The Essential Pillars of Prayer',
    summaryAr: 'الأجزاء الأساسية التي لا تسقط سهواً ولا جهلاً ولا عمداً.',
    summaryEn:
      'Essential integrals of prayer that cannot be omitted intentionally or by forgetfulness.',
    detailsAr: [
      'القيام في الفرض مع القدرة وتكبيرة الإحرام',
      'قراءة الفاتحة في كل ركعة والركوع والرفع منه',
      'السجود على الجبهة والأعضاء والجلوس بين السجدتين',
      'الطمأنينة والاعتدال في جميع الأركان والجلوس للتشهد الأخير',
      'السلام والترتيب بين الأركان',
    ],
    evidenceAr:
      'حديث المسيء صلاته: «إذا قمت إلى الصلاة فكبر، ثم اقرأ ما تيسر معك من القرآن...» متفق عليه',
  },
  {
    id: 'sujood_sahw',
    categoryAr: 'أحكام السهو',
    categoryEn: 'Forgetfulness Prostration',
    titleAr: 'أحكام سجود السهو القبلي والبعدي',
    titleEn: 'Rulings of Sujood As-Sahw (Pre & Post Salam)',
    summaryAr:
      'كيفية جبر الخلل الواقع في الصلاة بسبب الزيادة أو النقص أو الشك على المذهب المالكي ومذاهب الجمهور.',
    summaryEn:
      'How to remedy unintended additions, omissions, or doubts during prayer.',
    detailsAr: [
      'السجود القبلي (قبل السلام): يشرع عند نقص سنة مؤكدة كترك السورة بعد الفاتحة أو التشهد الأوسط، أو عند اجتماع نقص وزيادة تغليباً لجانب النقص',
      'السجود البعدي (بعد السلام): يشرع عند محض الزيادة السهوية من جنس الصلاة كزيادة ركعة أو سجدة سهواً',
      'إذا شك المصلي في عدد الركعات بنى على اليقين (الأقل) وأتى بما بقي وسجد للسهو',
    ],
    evidenceAr:
      'قال النبي ﷺ: «إذا شك أحدكم في صلاته فليطرح الشك وليبن على ما استيقن» رواه مسلم',
  },
  {
    id: 'musafir',
    categoryAr: 'الرخص الشرعية',
    categoryEn: 'Travel & Concessions',
    titleAr: 'قصر الصلاة وجمعها للمسافر',
    titleEn: 'Shortening & Combining Prayers for Travelers',
    summaryAr:
      'تيسير الشريعة الإسلامية في قصر الرباعية إلى ركعتين والجمع بين الصلاتين.',
    summaryEn:
      'Islamic ease allowing 4-unit prayers to be shortened to 2 units during travel.',
    detailsAr: [
      'تقصر الصلاة الرباعية (الظهر، العصر، العشاء) إلى ركعتين عند مفارقة عمران البلد',
      'يجوز الجمع بين الظهر والعصر، وبين المغرب والعشاء جمع تقديم أو جمع تأخير حسب الأرفق بالمسافر',
      'الفجر والمغرب لا يدخلهما القصر ويبقيان على عدد ركعاتهما',
    ],
    evidenceAr:
      'قال تعالى: {وَإِذَا ضَرَبْتُمْ فِي الْأَرْضِ فَلَيْسَ عَلَيْكُمْ جُنَاحٌ أَن تَقْصُرُوا مِنَ الصَّلَاةِ} [النساء: 101]',
  },
]
