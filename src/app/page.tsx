// src/app/page.tsx
import Link from "next/link";
import MerchCard from "@/components/public/MerchCard";
import { createServer } from "@/lib/supabase-server";

export default async function LandingPage() {
  const supabase = await createServer();
  
  // Fetch just a few items for the "Teaser"
  const { data: merch } = await supabase
    .from("merch_items")
    .select("*")
    .limit(3);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* --- NAVIGATION / HEADER --- */}
      <nav className="p-6 flex justify-between items-center border-b border-zinc-900">
        <h1 className="font-bold tracking-tighter text-xl uppercase">Brutal Honesty, Relentless Drive</h1>
        <Link 
          href="/login" 
          className="px-4 py-2 border border-white text-xs font-mono hover:bg-white hover:text-black transition-all uppercase tracking-widest"
        >
          Enter the Vault
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-4">
          Unreleased Artifacts
        </h2>
        <p className="max-w-xl mx-auto opacity-50 font-mono text-xs uppercase">
          Exclusive music, early-access merch, and digital ephemera. 
          Access restricted to verified personnel.
        </p>
      </section>

      {/* --- MERCH TEASER --- */}
      <section className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {merch?.map((item) => (
            <MerchCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-20 border-t border-zinc-900 mt-20 text-center">
        <Link 
          href="/login" 
          className="text-2xl font-bold hover:line-through transition-all uppercase"
        >
          Sign In to See More →
        </Link>
      </section>
    </main>
  );
}