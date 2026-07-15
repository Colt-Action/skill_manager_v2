import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { rollenLabel } from "@/lib/format";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profil } = await supabase
    .from("users")
    .select("name, rolle, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profil) return null;

  const istAdminOderHoeher = profil.rolle === "admin" || profil.rolle === "superadmin";
  const istZuschauer = profil.rolle === "zuschauer";

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="font-semibold text-slate-900">
          Skill Manager
        </Link>
        <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
          Videothek
        </Link>
        {!istZuschauer && (
          <Link href="/upload" className="text-sm text-slate-600 hover:text-slate-900">
            Video hochladen
          </Link>
        )}
        {istAdminOderHoeher && (
          <>
            <Link href="/admin" className="text-sm text-slate-600 hover:text-slate-900">
              Prüfung &amp; Freigabe
            </Link>
            <Link href="/admin/qr-codes" className="text-sm text-slate-600 hover:text-slate-900">
              QR-Codes
            </Link>
            <Link href="/admin/analytics" className="text-sm text-slate-600 hover:text-slate-900">
              Analytics
            </Link>
            <Link href="/admin/nutzer" className="text-sm text-slate-600 hover:text-slate-900">
              Nutzerverwaltung
            </Link>
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          <Link href="/profil" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            {profil.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profil.avatar_url}
                alt=""
                className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                {profil.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
            <span>
              {profil.name} · {rollenLabel(profil.rolle)}
            </span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
            >
              Logout
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
