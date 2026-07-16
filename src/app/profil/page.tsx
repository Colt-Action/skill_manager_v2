import { getAktuellerNutzer } from "@/lib/auth";
import ProfilForm from "@/components/ProfilForm";

export default async function ProfilSeite() {
  const nutzer = await getAktuellerNutzer();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Mitarbeiterakte</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        Mein Profil
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Passe deinen Namen, Standort und dein Profilbild an.
      </p>

      <ProfilForm nutzer={nutzer} />
    </div>
  );
}
