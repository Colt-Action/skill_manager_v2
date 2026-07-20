import { createClient } from "@/lib/supabase/server";
import NavClient from "@/components/NavClient";
import type { Benachrichtigung } from "@/lib/supabase/types";

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

  const { data: benachrichtigungen } = await supabase
    .from("benachrichtigungen")
    .select("*")
    .eq("user_id", user.id)
    .order("erstellt_am", { ascending: false })
    .limit(30);

  return (
    <NavClient
      name={profil.name}
      rolle={profil.rolle}
      avatarUrl={profil.avatar_url}
      istAdminOderHoeher={profil.rolle === "admin" || profil.rolle === "superadmin"}
      istSuperadmin={profil.rolle === "superadmin"}
      istZuschauer={profil.rolle === "zuschauer"}
      benachrichtigungen={(benachrichtigungen ?? []) as Benachrichtigung[]}
    />
  );
}
