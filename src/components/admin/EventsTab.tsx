"use client"

import { FormEvent } from "react"
import { addEvent } from "@/actions/events"
import { useState } from "react"

export default function EventsTab() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await addEvent(formData)
      if (result.success) {
        alert("Event Added")
        e.currentTarget.reset()
      } else {
        alert(result.error || "Failed to add event")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
      <h3 className="text-lg font-bold">Add Tour Date</h3>
      <input name="venue_name" placeholder="Venue Name" required className="w-full text-white bg-black border border-zinc-800 p-2 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <input name="city" placeholder="City" required className="w-full text-white bg-black border border-zinc-800 p-2 rounded" />
        <input name="state" placeholder="State" required className="w-full text-white bg-black border border-zinc-800 p-2 rounded" />
      </div>
      <input name="event_date" type="date" required className="w-full text-white bg-black border border-zinc-800 p-2 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <input name="ticket_price" type="number" step="0.01" placeholder="Ticket Price" className="w-full text-white bg-black border border-zinc-800 p-2 rounded" />
        <input name="total_tickets" type="number" placeholder="Total Tickets" className="w-full text-white bg-black border border-zinc-800 p-2 rounded" />
      </div>
      <button disabled={isSubmitting} className="w-full bg-white text-black font-bold py-2 rounded-lg disabled:opacity-50">
        {isSubmitting ? "Saving..." : "Save Event"}
      </button>
    </form>
  )
}