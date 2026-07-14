// Supabase-Client für die Nutzung im Browser (in Client-Komponenten,
// also Dateien mit "use client" am Anfang).
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
