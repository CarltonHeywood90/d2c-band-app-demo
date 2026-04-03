'use server'
import { createServer } from '@/lib/supabase-server'

export async function updateIdentity(formData: FormData) {
  const supabase = await createServer()

  const { error } = await supabase
    .from('site_settings')
    .upsert({
      id: 1, // Always update the same row
      band_name: formData.get('band_name'),
      bio: formData.get('bio'),
      primary_color: formData.get('primary_color'),
      secondary_color: formData.get('secondary_color'),
      logo_url: formData.get('logo_url'),
      banner_url: formData.get('banner_url'),
    })

  if (error) return { success: false, error: error.message }
  return { success: true }
}