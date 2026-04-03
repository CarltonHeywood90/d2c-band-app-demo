// src/components/public/MusicPlayer.tsx
"use client"
import { useState, useRef, useMemo } from 'react'
import { createClient } from "@/lib/supabase-client" // Ensure this helper exists

interface MusicTrack {
  id: string
  title: string
  bpm: number | null
  time_signature: string
  created_at: string
  file_path: string    // Changed from file_url to match DB
  user_id?: string     // Added to match the new column
}

export default function MusicPlayer({ track }: { track: MusicTrack }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const supabase = createClient()

  // Use useMemo so we don't recalculate the URL on every render
  const AUDIO_URL = useMemo(() => {
    const { data } = supabase.storage
      .from('music')
      .getPublicUrl(track.file_path) // 'track.file_path' should be 'library/filename.wav'
    
    return data.publicUrl
  }, [track.file_path, supabase])

  const togglePlay = async () => {
    if (!audioRef.current) return
    
    try {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        // High-fidelity WAVs can return a promise that needs to be caught
        await audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } catch (err) {
      console.error("Playback failed:", err)
      alert("Format not supported or file not found at: " + AUDIO_URL)
    }
  }

  return (
    <div className="group flex items-center gap-6 p-6 border-b border-current border-opacity-10 hover:bg-current hover:bg-opacity-[0.03] transition-all">
      <audio 
        ref={audioRef} 
        src={AUDIO_URL} 
        onEnded={() => setIsPlaying(false)} 
      />
      
      <button 
        onClick={togglePlay}
        className="w-14 h-14 rounded-full border border-current flex items-center justify-center group-hover:scale-105 transition-transform bg-transparent"
      >
        {isPlaying ? (
          <div className="flex gap-1">
            <div className="w-1.5 h-4 bg-current" />
            <div className="w-1.5 h-4 bg-current" />
          </div>
        ) : (
          <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-current border-b-[8px] border-b-transparent ml-1" />
        )}
      </button>
      
      <div className="flex-1">
        <h4 className="font-bold uppercase text-xl tracking-tighter">{track.title}</h4>
        <div className="flex gap-6 text-[10px] font-mono opacity-40 uppercase tracking-widest mt-1">
          {track.bpm && <span>BPM: {track.bpm}</span>}
          {track.time_signature && <span>SIG: {track.time_signature}</span>}
        </div>
      </div>
    </div>
  )
}