// src/actions/events.ts
'use server'

import { createServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function addEvent(formData: FormData) {
  const supabase = await createServer()
  
  try {
    const venue = formData.get('venue_name') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const date = formData.get('event_date') as string
    const priceRaw = formData.get('ticket_price') as string
    const totalTickets = formData.get('total_tickets') as string

    const { error: dbError } = await supabase
      .from('events')
      .insert([{
        venue_name: venue,
        city,
        state,
        event_date: new Date(date).toISOString(),
        ticket_price: priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null,
        total_tickets: totalTickets ? parseInt(totalTickets, 10) : null,
        status: 'active'
      }])

    if (dbError) throw dbError
    
    revalidatePath('/')
    return { success: true }

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Circuit deployment failed"
    console.error("Event Insert Failure:", msg)
    return { success: false, error: msg }
  }
}