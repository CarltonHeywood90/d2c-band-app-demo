// src/components/public/MerchCard.tsx
"use client"

interface MerchItem {
  id: string;
  name: string;
  description?: string;
  base_price: number; 
  image_urls: string[]; 
}

export default function MerchCard({ item }: { item: MerchItem }) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const BUCKET_URL = `${SUPABASE_URL}/storage/v1/object/public/merch/`;
  
  // 1. Extract the raw path from the Postgres Array
  const rawPath = item.image_urls && item.image_urls.length > 0 
    ? item.image_urls[0] 
    : null;

  // 2. The "Sanitizer" Logic
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    
    // Case A: It's already a full HTTP URL (External or pre-rendered)
    if (path.startsWith('http')) return path;

    // Case B: The path includes the bucket name (e.g., "merch/item.jpg")
    // We strip "merch/" to avoid the double-pathing bug (.../merch/merch/item.jpg)
    const cleanPath = path.replace(/^merch\//, '');
    
    return `${BUCKET_URL}${cleanPath}`;
  };

  const displayImage = getImageUrl(rawPath);

  return (
    <div className="group border border-current border-opacity-10 p-4 hover:border-opacity-100 transition-all cursor-crosshair">
      <div className="aspect-square bg-zinc-900 mb-4 overflow-hidden relative">
        {displayImage ? (
          <img 
            src={displayImage} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
            alt={item.name}
            // Error handling: if the URL still fails, show the placeholder
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) parent.innerHTML = '<div class="absolute inset-0 flex items-center justify-center opacity-20 font-mono text-[10px]">404_NOT_FOUND</div>';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20 font-mono text-[10px]">
            NO_SIGNAL
          </div>
        )}
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold uppercase tracking-tight">{item.name}</h4>
          <p className="text-[10px] opacity-50 font-mono italic leading-tight max-w-[150px]">
            {item.description}
          </p>
        </div>
        <span className="font-mono font-bold text-sm">
          ${(item.base_price / 100).toFixed(2)}
        </span>
      </div>
    </div>
  );
}