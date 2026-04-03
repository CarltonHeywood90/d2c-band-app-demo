"use client"

import { useState } from "react"
import { addTrack } from "@/actions/music"
import { createClient } from "@/lib/supabase-client"

export default function MusicTab() {
  const [isUploading, setIsUploading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    setIsUploading(true)

    try {
      const supabase = createClient()
      const audioFile = formData.get('audio_file') as File
      const title = formData.get('title') as string

      // Storage Upload
      const fileExt = audioFile.name.split('.').pop()
      const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`
      const filePath = `library/${fileName}`
      
      const { error: storageError } = await supabase.storage.from('music').upload(filePath, audioFile)
      if (storageError) throw storageError

      // Metadata Hand-off
      formData.set('file_url', filePath)
      formData.delete('audio_file')
      const result = await addTrack(formData)
      
      if (result.success) {
        alert("Track Committed to Vault")
        form.reset()
      } else {
        // THIS is where the hidden error is likely hiding
        alert(`Server Error: ${result.error}`)
        console.error("DB Sync failed:", result.error)
      }
    } catch (error) {
      alert(`Upload Error: ${(error as Error).message}`)
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 p-6 rounded-xl border border-zinc-800 text-white">
      <h3 className="text-lg font-bold">Upload Master Recording</h3>
      <input name="title" placeholder="Track Title" required className="w-full bg-black border border-zinc-800 p-2 rounded text-white" />
      <div className="grid grid-cols-2 gap-4">
        <input name="bpm" type="number" placeholder="BPM" className="bg-black border border-zinc-800 p-2 rounded text-white" />
        <input name="time_signature" placeholder="Time Sig (e.g. 10:4)" className="bg-black border border-zinc-800 p-2 rounded text-white" />
      </div>
      <input name="audio_file" type="file" accept="audio/*" required className="w-full text-sm text-zinc-500 file:bg-zinc-800 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg" />
      <button disabled={isUploading} className="w-full bg-white text-black font-bold py-2 rounded-lg">
        {isUploading ? "Uploading..." : "Save Track"}
      </button>
    </form>
  )
}