"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { updateIdentity } from "@/actions/identity"

interface SiteSettings {
  band_name: string
  primary_color: string
  secondary_color: string
  bio: string
  logo_preview?: string
  banner_preview?: string
}

export default function IdentityTab({ settings, setSettings }: { settings: SiteSettings; setSettings: React.Dispatch<React.SetStateAction<SiteSettings>> }) {
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev: SiteSettings) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const name = e.target.name === "logo_file" ? "logo_preview" : "banner_preview"
      
      // Create a local blob URL so the preview updates instantly
      const localUrl = URL.createObjectURL(file)
      setSettings((prev: SiteSettings) => ({ ...prev, [name]: localUrl }))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const logoFile = formData.get('logo_file') as File
      const bannerFile = formData.get('banner_file') as File

      // Upload Logo
      if (logoFile?.size > 0) {
        const path = `logo-${Date.now()}`
        const { error } = await supabase.storage.from('identity').upload(path, logoFile)
        if (error) throw error
        formData.set('logo_url', path)
      }

      // Upload Banner
      if (bannerFile?.size > 0) {
        const path = `banner-${Date.now()}`
        const { error } = await supabase.storage.from('identity').upload(path, bannerFile)
        if (error) throw error
        formData.set('banner_url', path)
      }

      const result = await updateIdentity(formData)
      if (result.success) alert("Sovereign Identity Synchronized.")
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Visual DNA</h3>
        
        <InputField label="Project Name" name="band_name" value={settings.band_name} onChange={handleChange} />
        
        <div className="grid grid-cols-2 gap-4">
          <FileField label="Logo (SVG/PNG)" name="logo_file" onChange={handleFileChange} />
          <FileField label="Banner (JPG)" name="banner_file" onChange={handleFileChange} />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-white mb-2 font-bold">Manifesto</label>
          <textarea 
            name="bio"
            value={settings.bio}
            onChange={handleChange}
            className="w-full bg-black border border-zinc-800 p-3 rounded h-24 text-sm text-white outline-none focus:border-zinc-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ColorInput label="Accent" name="primary_color" value={settings.primary_color} onChange={handleChange} />
          <ColorInput label="Base" name="secondary_color" value={settings.secondary_color} onChange={handleChange} />
        </div>
      </div>
      
      <button disabled={isSaving} className="w-full bg-white text-black font-black py-4 rounded-lg uppercase text-xs tracking-widest hover:bg-zinc-200 transition-all">
        {isSaving ? "Syncing..." : "Commit Changes"}
      </button>
    </form>
  )
}

// Helper Components
const InputField = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-[10px] uppercase text-white mb-2 font-bold">{label}</label>
    <input {...props} className="w-full bg-black border border-zinc-800 p-3 rounded text-white outline-none focus:border-zinc-500" />
  </div>
)

const ColorInput = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="bg-black p-3 rounded border border-zinc-800 flex items-center justify-between">
    <label className="text-[10px] uppercase text-white font-bold">{label}</label>
    <input type="color" {...props} className="w-8 h-8 bg-transparent border-none cursor-pointer" />
  </div>
)

const FileField = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="bg-black p-3 rounded border border-zinc-800">
    <label className="block text-[10px] uppercase text-white mb-2 font-bold">{label}</label>
    <input type="file" {...props} className="text-[10px] text-white" />
  </div>
)