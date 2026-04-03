import { createClient } from '@/lib/supabase-client'

export async function getProjectIdentity() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching identity:', error)
    return null
  }
  return data
}

export async function getMusicLibrary() {
  const supabase = createClient()
  const { data } = await supabase
    .from('music_tracks')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

// Add these to your existing src/lib/data.ts

export async function getMerchInventory() {
  const supabase = createClient()
  const { data } = await supabase
    .from('merch_items')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export async function getTourCircuit() {
  const supabase = createClient()
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
  return data || []
}