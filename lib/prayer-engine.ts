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
  regionAr: string
  region: RegionGroup
  lat: number
  lng: number
  timeZone: string
  method: CalcMethodId
  habousCityKey: string
  habousVilleCode: number
}

// القائمة الشاملة لجميع المدن المغربية في الجهات الـ 12 للمملكة المغربية وفق وزارة الأوقاف والشؤون الإسلامية
export const CITY_PRESETS: CityPreset[] = [
  // 1. جهة الرباط - سلا - القنيطرة
  { id: 'rabat', nameAr: 'الرباط', nameEn: 'Rabat', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الرباط - سلا - القنيطرة', region: 'maghreb', lat: 34.0209, lng: -6.8416, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'rabat', habousVilleCode: 1 },
  { id: 'sale', nameAr: 'سلا', nameEn: 'Sale', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الرباط - سلا - القنيطرة', region: 'maghreb', lat: 34.0531, lng: -6.7985, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'sale', habousVilleCode: 2 },
  { id: 'temara', nameAr: 'تمارة', nameEn: 'Temara', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الرباط - سلا - القنيطرة', region: 'maghreb', lat: 33.9287, lng: -6.9066, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'temara', habousVilleCode: 3 },
  { id: 'skhirat', nameAr: 'الصخيرات', nameEn: 'Skhirat', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الرباط - سلا - القنيطرة', region: 'maghreb', lat: 33.8525, lng: -7.0317, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'skhirat', habousVilleCode: 4 },
  { id: 'kenitra', nameAr: 'القنيطرة', nameEn: 'Kenitra', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الرباط - سلا - القنيطرة', region: 'maghreb', lat: 34.261, lng: -6.5802, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'kenitra', habousVilleCode: 5 },
  { id: 'khemisset', nameAr: 'الخميسات', nameEn: 'Khemisset', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الرباط - سلا - القنيطرة', region: 'maghreb', lat: 33.824, lng: -6.0663, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'khemisset', habousVilleCode: 6 },
  { id: 'tiflet', nameAr: 'تيفلت', nameEn: 'Tiflet', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الرباط - سلا - القنيطرة', region: 'maghreb', lat: 33.8947, lng: -6.3065, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'tiflet', habousVilleCode: 7 },
  { id: 'sidi_kacem', nameAr: 'سيدي قاسم', nameEn: 'Sidi Kacem', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الرباط - سلا - القنيطرة', region: 'maghreb', lat: 34.2215, lng: -5.7078, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'sidi_kacem', habousVilleCode: 8 },
  { id: 'sidi_slimane', nameAr: 'سيدي سليمان', nameEn: 'Sidi Slimane', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الرباط - سلا - القنيطرة', region: 'maghreb', lat: 34.2648, lng: -5.926, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'sidi_slimane', habousVilleCode: 9 },
  { id: 'souk_el_arbaa', nameAr: 'سوق الأربعاء الغرب', nameEn: 'Souk El Arbaa', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الرباط - سلا - القنيطرة', region: 'maghreb', lat: 34.6868, lng: -5.9999, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'souk_el_arbaa', habousVilleCode: 10 },

  // 2. جهة الدار البيضاء - سطات
  { id: 'casablanca', nameAr: 'الدار البيضاء', nameEn: 'Casablanca', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الدار البيضاء - سطات', region: 'maghreb', lat: 33.5731, lng: -7.5898, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'casablanca', habousVilleCode: 58 },
  { id: 'mohammedia', nameAr: 'المحمدية', nameEn: 'Mohammedia', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الدار البيضاء - سطات', region: 'maghreb', lat: 33.6861, lng: -7.3829, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'mohammedia', habousVilleCode: 59 },
  { id: 'el_jadida', nameAr: 'الجديدة', nameEn: 'El Jadida', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الدار البيضاء - سطات', region: 'maghreb', lat: 33.2316, lng: -8.5007, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'el_jadida', habousVilleCode: 60 },
  { id: 'azemmour', nameAr: 'أزمور', nameEn: 'Azemmour', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الدار البيضاء - سطات', region: 'maghreb', lat: 33.2878, lng: -8.3422, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'azemmour', habousVilleCode: 61 },
  { id: 'settat', nameAr: 'سطات', nameEn: 'Settat', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الدار البيضاء - سطات', region: 'maghreb', lat: 33.001, lng: -7.6166, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'settat', habousVilleCode: 62 },
  { id: 'berrechid', nameAr: 'برشيد', nameEn: 'Berrechid', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الدار البيضاء - سطات', region: 'maghreb', lat: 33.2655, lng: -7.5875, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'berrechid', habousVilleCode: 63 },
  { id: 'benslimane', nameAr: 'بن سليمان', nameEn: 'Benslimane', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الدار البيضاء - سطات', region: 'maghreb', lat: 33.619, lng: -7.1211, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'benslimane', habousVilleCode: 64 },
  { id: 'bouznika', nameAr: 'بوزنيقة', nameEn: 'Bouznika', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الدار البيضاء - سطات', region: 'maghreb', lat: 33.7894, lng: -7.1597, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'bouznika', habousVilleCode: 65 },
  { id: 'sidi_bennour', nameAr: 'سيدي بنور', nameEn: 'Sidi Bennour', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الدار البيضاء - سطات', region: 'maghreb', lat: 32.6524, lng: -8.4277, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'sidi_bennour', habousVilleCode: 66 },

  // 3. جهة فاس - مكناس
  { id: 'fes', nameAr: 'فاس', nameEn: 'Fes', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'فاس - مكناس', region: 'maghreb', lat: 34.0181, lng: -5.0078, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'fes', habousVilleCode: 81 },
  { id: 'meknes', nameAr: 'مكناس', nameEn: 'Meknes', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'فاس - مكناس', region: 'maghreb', lat: 33.8935, lng: -5.5473, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'meknes', habousVilleCode: 85 },
  { id: 'taza', nameAr: 'تازة', nameEn: 'Taza', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'فاس - مكناس', region: 'maghreb', lat: 34.2133, lng: -4.0103, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'taza', habousVilleCode: 86 },
  { id: 'sefrou', nameAr: 'صفرو', nameEn: 'Sefrou', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'فاس - مكناس', region: 'maghreb', lat: 33.8305, lng: -4.8353, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'sefrou', habousVilleCode: 87 },
  { id: 'ifrane', nameAr: 'إفران', nameEn: 'Ifrane', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'فاس - مكناس', region: 'maghreb', lat: 33.5228, lng: -5.1109, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'ifrane', habousVilleCode: 88 },
  { id: 'azrou', nameAr: 'أزرو', nameEn: 'Azrou', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'فاس - مكناس', region: 'maghreb', lat: 33.4417, lng: -5.2247, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'azrou', habousVilleCode: 89 },
  { id: 'el_hajeb', nameAr: 'الحاجب', nameEn: 'El Hajeb', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'فاس - مكناس', region: 'maghreb', lat: 33.6878, lng: -5.371, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'el_hajeb', habousVilleCode: 90 },
  { id: 'boulemane', nameAr: 'بولمان', nameEn: 'Boulemane', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'فاس - مكناس', region: 'maghreb', lat: 33.3625, lng: -4.73, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'boulemane', habousVilleCode: 91 },
  { id: 'missour', nameAr: 'ميسور', nameEn: 'Missour', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'فاس - مكناس', region: 'maghreb', lat: 33.0489, lng: -3.9922, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'missour', habousVilleCode: 92 },
  { id: 'taounate', nameAr: 'تاونات', nameEn: 'Taounate', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'فاس - مكناس', region: 'maghreb', lat: 34.5369, lng: -4.64, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'taounate', habousVilleCode: 93 },

  // 4. جهة مراكش - آسفي
  { id: 'marrakech', nameAr: 'مراكش', nameEn: 'Marrakech', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'مراكش - آسفي', region: 'maghreb', lat: 31.6295, lng: -7.9811, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'marrakech', habousVilleCode: 104 },
  { id: 'safi', nameAr: 'آسفي', nameEn: 'Safi', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'مراكش - آسفي', region: 'maghreb', lat: 32.2994, lng: -9.2372, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'safi', habousVilleCode: 105 },
  { id: 'essaouira', nameAr: 'الصويرة', nameEn: 'Essaouira', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'مراكش - آسفي', region: 'maghreb', lat: 31.5085, lng: -9.7595, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'essaouira', habousVilleCode: 106 },
  { id: 'el_kelaa_des_sraghna', nameAr: 'قلعة السراغنة', nameEn: 'El Kelaa des Sraghna', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'مراكش - آسفي', region: 'maghreb', lat: 32.0481, lng: -7.4083, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'el_kelaa_des_sraghna', habousVilleCode: 107 },
  { id: 'benguerir', nameAr: 'بن جرير', nameEn: 'Ben Guerir', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'مراكش - آسفي', region: 'maghreb', lat: 32.2359, lng: -7.9538, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'benguerir', habousVilleCode: 108 },
  { id: 'youssoufia', nameAr: 'اليوسفية', nameEn: 'Youssoufia', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'مراكش - آسفي', region: 'maghreb', lat: 32.2463, lng: -8.5294, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'youssoufia', habousVilleCode: 109 },
  { id: 'chichaoua', nameAr: 'شيشاوة', nameEn: 'Chichaoua', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'مراكش - آسفي', region: 'maghreb', lat: 31.5439, lng: -8.7644, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'chichaoua', habousVilleCode: 110 },

  // 5. جهة طنجة - تطوان - الحسيمة
  { id: 'tangier', nameAr: 'طنجة', nameEn: 'Tangier', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'طنجة - تطوان - الحسيمة', region: 'maghreb', lat: 35.7595, lng: -5.834, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'tangier', habousVilleCode: 31 },
  { id: 'tetouan', nameAr: 'تطوان', nameEn: 'Tetouan', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'طنجة - تطوان - الحسيمة', region: 'maghreb', lat: 35.5785, lng: -5.3684, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'tetouan', habousVilleCode: 35 },
  { id: 'al_hoceima', nameAr: 'الحسيمة', nameEn: 'Al Hoceima', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'طنجة - تطوان - الحسيمة', region: 'maghreb', lat: 35.2517, lng: -3.9372, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'al_hoceima', habousVilleCode: 36 },
  { id: 'chefchaouen', nameAr: 'شفشاون', nameEn: 'Chefchaouen', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'طنجة - تطوان - الحسيمة', region: 'maghreb', lat: 35.1688, lng: -5.2636, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'chefchaouen', habousVilleCode: 37 },
  { id: 'larache', nameAr: 'العرائش', nameEn: 'Larache', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'طنجة - تطوان - الحسيمة', region: 'maghreb', lat: 35.1932, lng: -6.1557, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'larache', habousVilleCode: 38 },
  { id: 'ksar_el_kebir', nameAr: 'القصر الكبير', nameEn: 'Ksar El Kebir', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'طنجة - تطوان - الحسيمة', region: 'maghreb', lat: 35.0017, lng: -5.9053, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'ksar_el_kebir', habousVilleCode: 39 },
  { id: 'asilah', nameAr: 'أصيلة', nameEn: 'Asilah', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'طنجة - تطوان - الحسيمة', region: 'maghreb', lat: 35.4652, lng: -6.0342, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'asilah', habousVilleCode: 40 },
  { id: 'fnideq', nameAr: 'الفنيدق', nameEn: 'Fnideq', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'طنجة - تطوان - الحسيمة', region: 'maghreb', lat: 35.8491, lng: -5.3575, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'fnideq', habousVilleCode: 41 },
  { id: 'mdiq', nameAr: 'المضيق', nameEn: "M'diq", countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'طنجة - تطوان - الحسيمة', region: 'maghreb', lat: 35.6858, lng: -5.3253, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'mdiq', habousVilleCode: 42 },
  { id: 'ouazzane', nameAr: 'وزان', nameEn: 'Ouazzane', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'طنجة - تطوان - الحسيمة', region: 'maghreb', lat: 34.7958, lng: -5.5785, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'ouazzane', habousVilleCode: 43 },

  // 6. جهة سوس - ماسة
  { id: 'agadir', nameAr: 'أكادير', nameEn: 'Agadir', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'سوس - ماسة', region: 'maghreb', lat: 30.4278, lng: -9.5981, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'agadir', habousVilleCode: 117 },
  { id: 'inezgane', nameAr: 'إنزكان', nameEn: 'Inezgane', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'سوس - ماسة', region: 'maghreb', lat: 30.3554, lng: -9.5364, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'inezgane', habousVilleCode: 118 },
  { id: 'ait_melloul', nameAr: 'أيت ملول', nameEn: 'Ait Melloul', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'سوس - ماسة', region: 'maghreb', lat: 30.3342, lng: -9.4972, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'ait_melloul', habousVilleCode: 119 },
  { id: 'taroudant', nameAr: 'تارودانت', nameEn: 'Taroudant', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'سوس - ماسة', region: 'maghreb', lat: 30.4703, lng: -8.877, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'taroudant', habousVilleCode: 120 },
  { id: 'tiznit', nameAr: 'تزنيت', nameEn: 'Tiznit', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'سوس - ماسة', region: 'maghreb', lat: 29.6974, lng: -9.7316, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'tiznit', habousVilleCode: 121 },
  { id: 'ouled_teima', nameAr: 'أولاد تايمة', nameEn: 'Ouled Teima', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'سوس - ماسة', region: 'maghreb', lat: 30.3947, lng: -9.2089, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'ouled_teima', habousVilleCode: 122 },
  { id: 'tata', nameAr: 'طاطا', nameEn: 'Tata', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'سوس - ماسة', region: 'maghreb', lat: 29.7478, lng: -7.9736, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'tata', habousVilleCode: 123 },

  // 7. جهة الشرق
  { id: 'oujda', nameAr: 'وجدة', nameEn: 'Oujda', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الشرق', region: 'maghreb', lat: 34.6814, lng: -1.9086, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'oujda', habousVilleCode: 45 },
  { id: 'nador', nameAr: 'الناظور', nameEn: 'Nador', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الشرق', region: 'maghreb', lat: 35.1681, lng: -2.9335, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'nador', habousVilleCode: 46 },
  { id: 'berkane', nameAr: 'بركان', nameEn: 'Berkane', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الشرق', region: 'maghreb', lat: 34.92, lng: -2.32, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'berkane', habousVilleCode: 47 },
  { id: 'taourirt', nameAr: 'تاوريرت', nameEn: 'Taourirt', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الشرق', region: 'maghreb', lat: 34.4073, lng: -2.8973, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'taourirt', habousVilleCode: 48 },
  { id: 'guercif', nameAr: 'جرسيف', nameEn: 'Guercif', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الشرق', region: 'maghreb', lat: 34.2257, lng: -3.3536, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'guercif', habousVilleCode: 49 },
  { id: 'jerada', nameAr: 'جرادة', nameEn: 'Jerada', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الشرق', region: 'maghreb', lat: 34.31, lng: -2.16, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'jerada', habousVilleCode: 50 },
  { id: 'figuig', nameAr: 'فكيك', nameEn: 'Figuig', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الشرق', region: 'maghreb', lat: 32.1089, lng: -1.2286, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'figuig', habousVilleCode: 51 },
  { id: 'bouarfa', nameAr: 'بوعرفة', nameEn: 'Bouarfa', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الشرق', region: 'maghreb', lat: 32.5333, lng: -1.9667, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'bouarfa', habousVilleCode: 52 },

  // 8. جهة بني ملال - خنيفرة
  { id: 'beni_mellal', nameAr: 'بني ملال', nameEn: 'Beni Mellal', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'بني ملال - خنيفرة', region: 'maghreb', lat: 32.3373, lng: -6.3498, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'beni_mellal', habousVilleCode: 71 },
  { id: 'khouribga', nameAr: 'خريبكة', nameEn: 'Khouribga', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'بني ملال - خنيفرة', region: 'maghreb', lat: 32.8811, lng: -6.9063, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'khouribga', habousVilleCode: 72 },
  { id: 'khenifra', nameAr: 'خنيفرة', nameEn: 'Khenifra', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'بني ملال - خنيفرة', region: 'maghreb', lat: 32.934, lng: -5.6675, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'khenifra', habousVilleCode: 73 },
  { id: 'fqih_ben_salah', nameAr: 'الفقيه بن صالح', nameEn: 'Fqih Ben Salah', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'بني ملال - خنيفرة', region: 'maghreb', lat: 32.5009, lng: -6.6878, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'fqih_ben_salah', habousVilleCode: 74 },
  { id: 'azilal', nameAr: 'أزيلال', nameEn: 'Azilal', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'بني ملال - خنيفرة', region: 'maghreb', lat: 31.9616, lng: -6.5711, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'azilal', habousVilleCode: 75 },
  { id: 'oued_zem', nameAr: 'وادي زم', nameEn: 'Oued Zem', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'بني ملال - خنيفرة', region: 'maghreb', lat: 32.8628, lng: -6.5736, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'oued_zem', habousVilleCode: 76 },
  { id: 'kasba_tadla', nameAr: 'قصبة تادلة', nameEn: 'Kasba Tadla', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'بني ملال - خنيفرة', region: 'maghreb', lat: 32.5978, lng: -6.2683, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'kasba_tadla', habousVilleCode: 77 },

  // 9. جهة درعة - تافيلالت
  { id: 'errachidia', nameAr: 'الرشيدية', nameEn: 'Errachidia', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'درعة - تافيلالت', region: 'maghreb', lat: 31.9314, lng: -4.4244, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'errachidia', habousVilleCode: 128 },
  { id: 'ouarzazate', nameAr: 'ورزازات', nameEn: 'Ouarzazate', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'درعة - تافيلالت', region: 'maghreb', lat: 30.9189, lng: -6.8934, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'ouarzazate', habousVilleCode: 129 },
  { id: 'midelt', nameAr: 'ميدلت', nameEn: 'Midelt', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'درعة - تافيلالت', region: 'maghreb', lat: 32.6852, lng: -4.7451, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'midelt', habousVilleCode: 130 },
  { id: 'tinghir', nameAr: 'تنغير', nameEn: 'Tinghir', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'درعة - تافيلالت', region: 'maghreb', lat: 31.5147, lng: -5.5328, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'tinghir', habousVilleCode: 131 },
  { id: 'zagora', nameAr: 'زاكورة', nameEn: 'Zagora', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'درعة - تافيلالت', region: 'maghreb', lat: 30.3324, lng: -5.8384, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'zagora', habousVilleCode: 132 },
  { id: 'arfoud', nameAr: 'أرفود', nameEn: 'Arfoud', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'درعة - تافيلالت', region: 'maghreb', lat: 31.4347, lng: -4.2328, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'arfoud', habousVilleCode: 133 },
  { id: 'rissani', nameAr: 'الريصاني', nameEn: 'Rissani', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'درعة - تافيلالت', region: 'maghreb', lat: 31.2833, lng: -4.2667, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'rissani', habousVilleCode: 134 },

  // 10. جهة كلميم - واد نون
  { id: 'guelmim', nameAr: 'كلميم', nameEn: 'Guelmim', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'كلميم - واد نون', region: 'maghreb', lat: 28.987, lng: -10.0574, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'guelmim', habousVilleCode: 136 },
  { id: 'tan_tan', nameAr: 'طانطان', nameEn: 'Tan-Tan', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'كلميم - واد نون', region: 'maghreb', lat: 28.438, lng: -11.1032, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'tan_tan', habousVilleCode: 137 },
  { id: 'sidi_ifni', nameAr: 'سيدي إفني', nameEn: 'Sidi Ifni', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'كلميم - واد نون', region: 'maghreb', lat: 29.3797, lng: -10.173, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'sidi_ifni', habousVilleCode: 138 },
  { id: 'assa', nameAr: 'آسا', nameEn: 'Assa', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'كلميم - واد نون', region: 'maghreb', lat: 28.6094, lng: -9.4297, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'assa', habousVilleCode: 139 },

  // 11. جهة العيون - الساقية الحمراء
  { id: 'laayoune', nameAr: 'العيون', nameEn: 'Laayoune', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'العيون - الساقية الحمراء', region: 'maghreb', lat: 27.1536, lng: -13.2033, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'laayoune', habousVilleCode: 142 },
  { id: 'smara', nameAr: 'السمارة', nameEn: 'Smara', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'العيون - الساقية الحمراء', region: 'maghreb', lat: 26.7384, lng: -11.6719, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'smara', habousVilleCode: 143 },
  { id: 'boujdour', nameAr: 'بوجدور', nameEn: 'Boujdour', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'العيون - الساقية الحمراء', region: 'maghreb', lat: 26.1259, lng: -14.4842, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'boujdour', habousVilleCode: 144 },
  { id: 'tarfaya', nameAr: 'طرفاية', nameEn: 'Tarfaya', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'العيون - الساقية الحمراء', region: 'maghreb', lat: 27.9392, lng: -12.9261, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'tarfaya', habousVilleCode: 145 },

  // 12. جهة الداخلة - وادي الذهب
  { id: 'dakhla', nameAr: 'الداخلة', nameEn: 'Dakhla', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الداخلة - وادي الذهب', region: 'maghreb', lat: 23.6848, lng: -15.9579, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'dakhla', habousVilleCode: 150 },
  { id: 'lagouira', nameAr: 'الكويرة', nameEn: 'Lagouira', countryAr: 'المغرب', countryEn: 'Morocco', regionAr: 'الداخلة - وادي الذهب', region: 'maghreb', lat: 20.8333, lng: -17.0917, timeZone: 'Africa/Casablanca', method: 'morocco_habous', habousCityKey: 'lagouira', habousVilleCode: 151 },
]

export const MOROCCO_REGIONS_ORDER = [
  'الرباط - سلا - القنيطرة',
  'الدار البيضاء - سطات',
  'فاس - مكناس',
  'مراكش - آسفي',
  'طنجة - تطوان - الحسيمة',
  'سوس - ماسة',
  'الشرق',
  'بني ملال - خنيفرة',
  'درعة - تافيلالت',
  'كلميم - واد نون',
  'العيون - الساقية الحمراء',
  'الداخلة - وادي الذهب',
] as const

export const CALC_METHODS: {
  id: CalcMethodId
  nameAr: string
  nameEn: string
  badgeAr?: string
}[] = [
  {
    id: 'morocco_habous',
    nameAr: 'وزارة الأوقاف والشؤون الإسلامية بالمغرب (المعيار الرسمي)',
    nameEn: 'Moroccan Ministry of Habous & Islamic Affairs (Method 21)',
    badgeAr: 'رسمي - المغرب',
  },
  {
    id: 'muslim_world_league',
    nameAr: 'رابطة العالم الإسلامي',
    nameEn: 'Muslim World League (MWL)',
  },
  {
    id: 'umm_al_qura',
    nameAr: 'تقويم أم القرى (مكة المكرمة)',
    nameEn: 'Umm Al-Qura University, Makkah',
  },
  {
    id: 'egyptian',
    nameAr: 'الهيئة المصرية العامة للمساحة',
    nameEn: 'Egyptian General Authority',
  },
]

export function getCalculationParams(
  method: CalcMethodId,
  madhab: 'shafi' | 'hanafi' = 'shafi'
): CalculationParameters {
  let params: CalculationParameters
  switch (method) {
    case 'morocco_habous': {
      // معايير وزارة الأوقاف والشؤون الإسلامية بالمغرب: زاوية الفجر 19°، العشاء 17°، احتياط الزوال +5 دقائق، احتياط المغرب +4 دقائق
      params = CalculationMethod.Other()
      params.fajrAngle = 19
      params.ishaAngle = 17
      params.adjustments.dhuhr = 5
      params.adjustments.maghrib = 4
      break
    }
    case 'umm_al_qura':
      params = CalculationMethod.UmmAlQura()
      break
    case 'egyptian':
      params = CalculationMethod.Egyptian()
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
  'Africa/Casablanca': 60, // التوقيت الرسمي للمملكة المغربية UTC+1
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

  const imsakTime = new Date(prayerTimes.fajr.getTime() - 10 * 60 * 1000)
  const iftarTime = prayerTimes.maghrib

  const rawEntries: { id: PrayerId; time: Date }[] = [
    { id: 'fajr', time: prayerTimes.fajr },
    { id: 'dhuhr', time: prayerTimes.dhuhr },
    { id: 'asr', time: prayerTimes.asr },
    { id: 'maghrib', time: prayerTimes.maghrib },
    { id: 'isha', time: prayerTimes.isha },
  ]

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

  const gregorianAr = new Intl.DateTimeFormat('ar-MA-u-nu-latn', {
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
  offlineSlot: 1 | 2 | 3 | 4 | 5
  isCoreOffline: boolean
}

// 5 أصوات أذان مختارة بعناية فقط — مخزنة محلياً وتعمل 100% دون الحاجة إلى الإنترنت
export const MUEZZIN_PROFILES: MuezzinProfile[] = [
  {
    id: 'morocco_rabat_habous',
    nameAr: 'الأذان المغربي الرسمي — صومعة حسان (الرباط)',
    nameEn: 'Official Moroccan Adhan — Hassan Mosque (Rabat)',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    mosqueAr: 'مسجد حسان ومسجد السنة - الرباط',
    mosqueEn: 'Hassan & As-Sunnah Mosque, Rabat',
    maqamAr: 'الطبع المغربي الأندلسي الأصيل',
    takbeerStyleAr: 'صيغة المذهب المالكي (تثنية التكبير وترجيع الشهادتين)',
    baseFreq: 293.66,
    audioStreamUrl: '/audio/adhan-1.mp3',
    offlineSlot: 1,
    isCoreOffline: true,
  },
  {
    id: 'morocco_fes_qarawiyyin',
    nameAr: 'الأذان المغربي الأصيل — جامع القرويين والكتبية',
    nameEn: 'Moroccan Heritage Adhan — Al-Qarawiyyin & Koutoubia',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    region: 'maghreb',
    mosqueAr: 'جامع القرويين بفاس وجامع الكتبية بمراكش',
    mosqueEn: 'Al-Qarawiyyin (Fes) & Koutoubia (Marrakech)',
    maqamAr: 'طبع الأصبهان والاستهلال المغربي',
    takbeerStyleAr: 'صيغة المذهب المالكي المغاربي',
    baseFreq: 277.18,
    audioStreamUrl: '/audio/adhan-2.mp3',
    offlineSlot: 2,
    isCoreOffline: true,
  },
  {
    id: 'makkah_haram',
    nameAr: 'أذان المسجد الحرام — مكة المكرمة',
    nameEn: 'Masjid Al-Haram Adhan — Makkah',
    countryAr: 'الحرم المكي',
    countryEn: 'Makkah',
    region: 'haramain_gulf',
    mosqueAr: 'المسجد الحرام بمكة المكرمة',
    mosqueEn: 'Masjid Al-Haram, Makkah',
    maqamAr: 'الأداء الحجازي المكي الخاشع',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 293.66,
    audioStreamUrl: '/audio/adhan-3.mp3',
    offlineSlot: 3,
    isCoreOffline: true,
  },
  {
    id: 'madinah_haram',
    nameAr: 'أذان المسجد النبوي الشريف — المدينة المنورة',
    nameEn: 'Al-Masjid An-Nabawi Adhan — Madinah',
    countryAr: 'الحرم النبوي',
    countryEn: 'Madinah',
    region: 'haramain_gulf',
    mosqueAr: 'المسجد النبوي الشريف بالمدينة المنورة',
    mosqueEn: 'Al-Masjid An-Nabawi, Madinah',
    maqamAr: 'الأداء المدني الخاشع',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 329.63,
    audioStreamUrl: '/audio/adhan-4.mp3',
    offlineSlot: 4,
    isCoreOffline: true,
  },
  {
    id: 'alquds_aqsa',
    nameAr: 'أذان المسجد الأقصى المبارك — القدس الشريف',
    nameEn: 'Al-Aqsa Mosque Adhan — Al-Quds',
    countryAr: 'القدس الشريف',
    countryEn: 'Al-Quds',
    region: 'egypt_levant',
    mosqueAr: 'المسجد الأقصى المبارك بالقدس الشريف',
    mosqueEn: 'Al-Aqsa Mosque, Jerusalem',
    maqamAr: 'الأداء المقدسي الأصيل',
    takbeerStyleAr: 'صيغة الجمهور (تربيع التكبير)',
    baseFreq: 311.13,
    audioStreamUrl: '/audio/adhan-5.mp3',
    offlineSlot: 5,
    isCoreOffline: true,
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
    categoryAr: 'فقه الأذان المغربي',
    categoryEn: 'Moroccan Maliki Adhan Fiqh',
    titleAr: 'صفة الأذان في المذهب المالكي بالمغرب',
    titleEn: 'Maliki Adhan Formula in Morocco',
    summaryAr:
      'الخصائص الفقهية للأذان المغربي المعتمد لدى وزارة الأوقاف والشؤون الإسلامية بالمملكة المغربية.',
    summaryEn:
      'Authentic Maliki jurisprudence of Adhan practiced across the Kingdom of Morocco.',
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
      'ستر العورة ودخول الوقت الشرعي المحدد عبر تقويم وزارة الأوقاف',
      'استقبال القبلة والنية بالقلب دون التلفظ بها',
    ],
    evidenceAr:
      'قال تعالى: ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾ [النساء: 103]',
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
      'كيفية جبر الخلل الواقع في الصلاة بسبب الزيادة أو النقص أو الشك على المذهب المالكي.',
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
      'قال تعالى: ﴿ وَإِذَا ضَرَبْتُمْ فِي الْأَرْضِ فَلَيْسَ عَلَيْكُمْ جُنَاحٌ أَن تَقْصُرُوا مِنَ الصَّلَاةِ ﴾ [النساء: 101]',
  },
]
