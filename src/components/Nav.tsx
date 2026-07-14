import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profil } = await supabase
    .from("users")
    .select("name, rolle")
    .eq("id", user.id)
    .single();

  const istAdmin = profil?.rolle === "trainer_admin";

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="font-semibold text-slate-900">
          Skill Manager
        </Link>
        <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
          Videothek
        </Link>
        <Link href="/upload" className="text-sm text-slate-600 hover:text-slate-900">
          Video hochladen
        </Link>
        {istAdmin && (
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
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {profil?.name} · {istAdmin ? "Trainer/Admin" : "Techniker"}
          </span>
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
