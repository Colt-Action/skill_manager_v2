// Supabase-Client für die Nutzung auf dem Server (in Server-Komponenten,
// Server Actions und Route Handlers). Er liest/schreibt den Login-Status
// über Cookies, deshalb braucht er Zugriff auf die Next.js "cookies()".
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Wird aufgerufen, wenn setAll() aus einer Server-Komponente
            // heraus aufgerufen wird. Das darf man ignorieren, solange die
            // Middleware (middleware.ts) die Session ebenfalls aktualisiert.
          }
        },
      },
    },
  );
}
