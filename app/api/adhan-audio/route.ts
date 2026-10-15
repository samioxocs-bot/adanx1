import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// All Muezzin IDs mapped to verified local offline MP3 files in /public/audio/
const LOCAL_ADHAN_FILES: Record<string, string> = {
  morocco_rabat_habous: 'adhan-1.mp3',
  morocco_hassan_ii: 'adhan-1.mp3',
  morocco_fes_qarawiyyin: 'adhan-2.mp3',
  morocco_marrakech_koutoubia: 'adhan-2.mp3',
  algeria_algiers: 'adhan-2.mp3',
  tunisia_zitouna: 'adhan-1.mp3',
  libya_tripoli: 'adhan-2.mp3',
  mauritania_chinguetti: 'adhan-1.mp3',
  makkah_haram: 'adhan-3.mp3',
  madinah_haram: 'adhan-4.mp3',
  alafasy: 'adhan-3.mp3',
  uae_zayed: 'adhan-4.mp3',
  abdulbasit: 'adhan-5.mp3',
  alquds_aqsa: 'adhan-5.mp3',
  damascus_umayyad: 'adhan-4.mp3',
  istanbul_ayasofya: 'adhan-3.mp3',
  malaysia_putra: 'adhan-4.mp3',
  indonesia_istiqlal: 'adhan-5.mp3',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id') || 'morocco_rabat_habous'
  const fileName = LOCAL_ADHAN_FILES[id] || 'adhan-1.mp3'

  try {
    const filePath = path.join(process.cwd(), 'public', 'audio', fileName)
    const fileBuffer = fs.readFileSync(filePath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(fileBuffer.byteLength),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read local Adhan audio', details: String(error) },
      { status: 500 }
    )
  }
}
