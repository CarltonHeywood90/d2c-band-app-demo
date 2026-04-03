// src/actions/music.ts
"use server"

import { createServer } from "@/lib/supabase-server" // Ensure you have a server-side client helper
import { revalidatePath } from "next/cache"

export async function addTrack(formData: FormData) {
  const supabase = await createServer() // Server-side client
  
  // Extract data from formData
  const trackData = {
    title: formData.get('title') as string,
    bpm: parseInt(formData.get('bpm') as string) || null,
    time_signature: formData.get('time_signature') as string || '4/4',
    file_path: formData.get('file_url') as string,
    // user_id is handled by Postgres default or auth.uid()
  }

  const { error } = await supabase
    .from('music_tracks') // Ensure this matches your plural table name
    .insert([trackData])

  if (error) {
    console.error("Action Error:", error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}