import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import QrCodeListe from "@/components/QrCodeListe";
import { t } from "@/lib/i18n/t";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { Teil } from "@/lib/supabase/types";

export default async function QrCodeSeite() {
  const nutzer = await getAktuellerAdminOderHoeher();
  const sprache = istGueltigeSprache(nutzer.sprache) ? nutzer.sprache : STANDARD_SPRACHE;
  const supabase = await createClient();

  const { data: teile } = await supabase.from("teile").select("*").order("name");
  const teileListe = (teile ?? []) as Teil[];
  const beispielTeilenummern = teileListe.slice(0, 2).map((t) => t.teilenummer);

  // Für den QR-Code-Inhalt brauchen wir die volle Adresse dieser App
  // (z. B. "https://skill-manager.beispiel.de"). Die ermitteln wir aus den
  // Request-Headern, damit es sowohl lokal als auch nach dem Deployment
  // automatisch funktioniert.
  const headerListe = await headers();
  const host = headerListe.get("host") ?? "localhost:3000";
  const protokoll = headerListe.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const basisUrl = `${protokoll}://${host}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("nav.verwaltung", sprache)}</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        {t("admin.qrTitel", sprache)}
      </h1>
      <p className="mt-1 text-sm text-foreground-soft print:hidden">
        {t("admin.qrUntertitel", sprache)}
      </p>

      <div className="mt-6 rounded-xl bg-surface p-4 text-sm ring-1 ring-line print:hidden">
        <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
          {t("admin.qrTagVerknuepfung", sprache)}
        </h2>
        <p className="mt-2 text-foreground-soft">
          {t("admin.qrTagText1", sprache)}
        </p>
        <p className="mt-2 overflow-x-auto rounded-lg bg-background px-3 py-2 font-mono text-xs text-foreground ring-1 ring-line">
          {basisUrl}/geraet?teile=
          {beispielTeilenummern.length > 0 ? beispielTeilenummern.join(",") : "TEILENUMMER1,TEILENUMMER2"}
          &geraet=Gerätename
        </p>
        <p className="mt-2 text-foreground-soft">
          {t("admin.qrTagText2", sprache)}
        </p>
      </div>

      <QrCodeListe teile={teileListe} basisUrl={basisUrl} />
    </div>
  );
}
