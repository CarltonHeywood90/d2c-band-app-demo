// src/actions/music.ts
'use server'

import { createServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function addTrack(formData: FormData) {
  const supabase = await createServer()
  
  try {
    const file = formData.get('audio_file') as File
    const releaseId = formData.get('release_id') as string // MUST exist in music_releases
    const title = formData.get('title') as string
    const bpm = formData.get('bpm') as string
    const sig = formData.get('time_signature') as string

    let audioPath = ""

    if (file && file.size > 0) {
      const fileName = `track-${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage.from('music').upload(fileName, file)
      if (error) throw error
      audioPath = data.path
    }

    const { error: dbError } = await supabase
      .from('music_tracks')
      .insert([{
        title: title,
        release_id: releaseId,
        bpm: parseFloat(bpm) || null, // DB is 'double precision'
        time_signature: sig,
        file_url: audioPath,
        file_url_stream: audioPath, // Using same file for stream for now
      }])

    if (dbError) throw dbError
    
    revalidatePath('/')
    return { success: true }

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Audio sync failed"
    console.error("Music Insert Failed:", msg)
    return { success: false, error: msg }
  }
}