import { NextResponse } from 'next/server'
import { computePrayerSchedule, type CalcMethodId } from '@/lib/prayer-engine'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '21.4225')
  const lng = parseFloat(searchParams.get('lng') || '39.8262')
  const method = (searchParams.get('method') || 'umm_al_qura') as CalcMethodId
  const madhab = (searchParams.get('madhab') || 'shafi') as 'shafi' | 'hanafi'
  const dateParam = searchParams.get('date')

  const targetDate = dateParam ? new Date(dateParam) : new Date()
  const schedule = computePrayerSchedule(lat, lng, method, madhab, targetDate)

  return NextResponse.json({
    status: 'ok',
    coordinates: { lat, lng },
    method,
    madhab,
    schedule,
  })
}
