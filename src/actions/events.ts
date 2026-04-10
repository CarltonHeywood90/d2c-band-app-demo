'use server'

import { createServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Define a type for the response to keep the frontend clean
type ActionResponse = {
  success: boolean
  error?: string
}

export async function addEvent(formData: FormData): Promise<ActionResponse> {
  const supabase = await createServer()

  // 1. Auth Guard: Ensure only admins can trigger this server action
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: "Forbidden: Admin access required" }
  }

  try {
    // 2. Data Extraction & Parsing
    const venue = formData.get('venue_name') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const dateStr = formData.get('event_date') as string
    const priceRaw = formData.get('ticket_price') as string
    const totalTicketsRaw = formData.get('total_tickets') as string

    // 3. Robust Validation (Matches NOT NULL constraints in schema)
    if (!venue || !priceRaw || !dateStr) {
      return { success: false, error: "Missing required fields: Venue, Price, and Date." }
    }

    // Convert price to cents (integer) and handle potential decimal issues
    const ticketPrice = Math.round(parseFloat(priceRaw) * 100)
    const totalTickets = totalTicketsRaw ? parseInt(totalTicketsRaw, 10) : null

    if (isNaN(ticketPrice)) {
      return { success: false, error: "Invalid ticket price format." }
    }

    // 4. Database Insert
    const { error: dbError } = await supabase
      .from('events')
      .insert([
        {
          venue_name: venue.trim(),
          city: city?.trim() || null,
          state: state?.trim() || null,
          event_date: new Date(dateStr).toISOString(),
          ticket_price: ticketPrice,
          total_tickets: totalTickets,
          tickets_sold: 0, // Matches schema default
          status: 'active', // Ensure this matches your DB Enum ('active')
        },
      ])

    if (dbError) {
      console.error("Supabase Database Error:", dbError)
      // Check for common RLS or Enum errors
      if (dbError.code === '42501') return { success: false, error: "RLS Policy Violation: Check admin permissions." }
      if (dbError.code === '22P02') return { success: false, error: "Invalid data format for status or date." }
      throw dbError
    }

    // 5. Cache Invalidation
    revalidatePath('/events')
    revalidatePath('/') 
    
    return { success: true }

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Circuit deployment failed"
    console.error("Event Insert Failure:", msg)
    return { success: false, error: msg }
  }
}