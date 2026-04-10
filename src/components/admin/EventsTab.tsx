"use client"

import { FormEvent, useState } from "react"
import { addEvent } from "@/actions/events"

export default function EventsTab() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await addEvent(formData)
      if (result.success) {
        alert("Event Added Successfully")
        e.currentTarget.reset()
      } else {
        // This will now catch our custom error messages like "Admin access required"
        alert(result.error || "Failed to add event")
      }
    } catch (err) {
      alert("A network error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
      <h3 className="text-lg font-bold text-white">Add Tour Date</h3>
      
      <input 
        name="venue_name" 
        placeholder="Venue Name" 
        required 
        className="w-full text-white bg-black border border-zinc-800 p-2 rounded focus:outline-none focus:border-white" 
      />
      
      <div className="grid grid-cols-2 gap-4">
        <input 
          name="city" 
          placeholder="City" 
          required 
          className="w-full text-white bg-black border border-zinc-800 p-2 rounded focus:outline-none focus:border-white" 
        />
        <input 
          name="state" 
          placeholder="State" 
          required 
          className="w-full text-white bg-black border border-zinc-800 p-2 rounded focus:outline-none focus:border-white" 
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 ml-1">Event Date & Time</label>
        <input 
          name="event_date" 
          type="datetime-local" 
          required 
          className="w-full text-white bg-black border border-zinc-800 p-2 rounded focus:outline-none focus:border-white" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 ml-1">Price (USD)</label>
          <input 
            name="ticket_price" 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            required // Added this
            className="w-full text-white bg-black border border-zinc-800 p-2 rounded focus:outline-none focus:border-white" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 ml-1">Capacity</label>
          <input 
            name="total_tickets" 
            type="number" 
            placeholder="Total Tickets" 
            className="w-full text-white bg-black border border-zinc-800 p-2 rounded focus:outline-none focus:border-white" 
          />
        </div>
      </div>

      <button 
        disabled={isSubmitting} 
        className="w-full bg-white text-black font-bold py-2 mt-2 rounded-lg disabled:opacity-50 hover:bg-zinc-200 transition-colors"
      >
        {isSubmitting ? "Deploying to Circuit..." : "Save Event"}
      </button>
    </form>
  )
}