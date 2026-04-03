// src/components/public/MusicPlayer.tsx
"use client"
import { useState, useRef } from 'react'

interface MusicTrack {
  id: string
  title: string
  bpm: number | null
  time_signature: string
  created_at: string
  file_url: string
  file_url_stream?: string
}

export default function MusicPlayer({ track }: { track: MusicTrack }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const AUDIO_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/music/${track.file_url}`

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
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