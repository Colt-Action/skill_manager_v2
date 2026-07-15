import { getAktuellerNutzer } from "@/lib/auth";
import ProfilForm from "@/components/ProfilForm";

export default async function ProfilSeite() {
  const nutzer = await getAktuellerNutzer();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Mein Profil</h1>
      <p className="mt-1 text-sm text-slate-500">
        Passe deinen Namen, Standort und dein Profilbild an.
      </p>

      <ProfilForm nutzer={nutzer} />
    </div>
  );
}
