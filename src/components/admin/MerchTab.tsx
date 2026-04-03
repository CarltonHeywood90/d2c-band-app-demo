"use client"

import { useState, FormEvent } from "react"
import { addMerch } from "@/actions/merch"

export default function MerchTab() {
  const [isUploading, setIsUploading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    setIsUploading(true)

    try {
      // Keep the payload consistent with addMerch expectations (image_file upload happens server-side)
      const result = await addMerch(formData)
      if (result.success) {
        alert("Merch Item Added")
        form.reset()
      }
    } catch (err: unknown) {
      alert((err as Error).message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
      <h3 className="text-lg font-bold">Add Merch Item</h3>
      <input name="name" placeholder="Item Name" required className="w-full bg-black border border-zinc-800 p-2 rounded text-white" />
      <textarea name="description" placeholder="Description" className="w-full bg-black border border-zinc-800 p-2 rounded text-white" />
      <div className="grid grid-cols-2 gap-4">
        <input name="price" type="number" step="0.01" placeholder="Price" className="bg-black border border-zinc-800 p-2 rounded text-white" />
        <input name="stock_quantity" type="number" placeholder="Stock" className="bg-black border border-zinc-800 p-2 rounded text-white" />
      </div>
      <input name="image_file" type="file" accept="image/*" required className="w-full text-sm text-white" />
      <button disabled={isUploading} className="w-full bg-white text-black font-bold py-2 rounded-lg">
        {isUploading ? "Uploading..." : "Save Item"}
      </button>
    </form>
  )
}