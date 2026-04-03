// src/actions/music.ts
"use server"

import { createServer } from "@/lib/supabase-server" 
import { revalidatePath } from "next/cache"

export async function addTrack(formData: FormData) {
  const supabase = await createServer() 
  
  const trackData = {
    title: formData.get('title') as string,
    bpm: parseInt(formData.get('bpm') as string) || null,
    time_signature: formData.get('time_signature') as string || '4/4',
    file_path: formData.get('file_url') as string,
  }

  const { error } = await supabase
    .from('music_tracks')
    .insert([trackData])

  if (error) {
    console.error("Action Error:", error.message)
    return { success: false, error: error.message }
  }

  // Use 'layout' to break through nested route caching
  revalidatePath('/dashboard', 'layout')
  
  return { success: true }
}