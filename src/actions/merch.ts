// src/actions/merch.ts
'use server'

import { createServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function addMerch(formData: FormData) {
  const supabase = await createServer()
  
  try {
    // 1. Extract and Validate Input
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const priceRaw = formData.get('price') as string
    const file = formData.get('image_file') as File | null
    const imageUrlFromClient = formData.get('image_url') as string | null

    if (!name || !priceRaw) {
      throw new Error("Name and Price are required fields.")
    }

    let finalizedImageUrls: string[] = []

    // 2. Handle the Image Upload
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      const fileName = `item-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('merch')
        .upload(fileName, file) // Save directly to root of bucket

      if (uploadError) throw uploadError

      if (uploadData?.path) {
        // We only want the FILENAME, e.g., "item-123.jpg"
        finalizedImageUrls = [uploadData.path]
      }
    } else if (imageUrlFromClient) {
      // SANITIZATION: If the client accidentally sends "merch/item.jpg", 
      // we strip "merch/" to prevent double-pathing.
      const cleanPath = imageUrlFromClient.replace(/^merch\//, '')
      finalizedImageUrls = [cleanPath]
    }

    // 3. Database Insert
    // We only reach this if the upload was successful OR no file was provided
    const { data, error: dbError } = await supabase
      .from('merch_items')
      .insert([{
        name: name,
        description: description,
        // Convert "25.00" string to 2500 integer (cents)
        base_price: Math.round(parseFloat(priceRaw) * 100), 
        // Ensure this is an ARRAY [string]
        image_urls: finalizedImageUrls 
      }])
      .select()

    if (dbError) {
      console.error("Database Insert Error:", dbError)
      throw new Error(`Database save failed: ${dbError.message}`)
    }

    // 4. Clear Cache to show new data on landing page
    revalidatePath('/')
    
    return { success: true, id: data?.[0]?.id }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    console.error("Add Merch Action Failure:", errorMessage)
    return { success: false, error: errorMessage }
  }
}