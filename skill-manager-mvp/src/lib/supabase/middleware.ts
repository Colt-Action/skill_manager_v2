import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Diese Funktion läuft vor jedem Seitenaufruf. Sie sorgt dafür, dass der
// Login (die "Session") frisch bleibt, und leitet nicht eingeloggte Nutzer
// zur Login-Seite um, wenn sie eine geschützte Seite aufrufen.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const oeffentlichePfade = ["/login"];
  const istOeffentlich = oeffentlichePfade.some((pfad) =>
    request.nextUrl.pathname.startsWith(pfad),
  );

  if (!user && !istOeffentlich) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
