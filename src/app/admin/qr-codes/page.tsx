import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import QrCodeListe from "@/components/QrCodeListe";
import type { Teil } from "@/lib/supabase/types";

export default async function QrCodeSeite() {
  await getAktuellerAdminOderHoeher();
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
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Verwaltung</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        QR-Codes für Teile
      </h1>
      <p className="mt-1 text-sm text-foreground-soft print:hidden">
        Drucke diese QR-Codes aus und bringe sie am jeweiligen Maschinenteil an. Ein Scan öffnet
        direkt die passenden Videos.
      </p>

      <div className="mt-6 rounded-xl bg-surface p-4 text-sm ring-1 ring-line print:hidden">
        <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
          Verknüpfung mit TAGs/NFC an Geräten
        </h2>
        <p className="mt-2 text-foreground-soft">
          Falls ein Gerät bereits einen eigenen TAG (QR-Code oder NFC-Chip) über die
          Service-App hat, kann diese App zusätzlich zur Geräte-Konfiguration einen Link auf
          Skill Manager anbieten, der direkt alle Videos zu den verbauten Teilen zeigt – ohne
          dass wir Zugriff auf die Service-App brauchen. Der Link muss nur so aufgebaut sein:
        </p>
        <p className="mt-2 overflow-x-auto rounded-lg bg-background px-3 py-2 font-mono text-xs text-foreground ring-1 ring-line">
          {basisUrl}/geraet?teile=
          {beispielTeilenummern.length > 0 ? beispielTeilenummern.join(",") : "TEILENUMMER1,TEILENUMMER2"}
          &geraet=Gerätename
        </p>
        <p className="mt-2 text-foreground-soft">
          Die Teilenummern (Komma-getrennt, ohne Leerzeichen) sind die gleichen wie hier bei
          „Kategorien &amp; Teile&ldquo; hinterlegt. „geraet=&ldquo; ist optional und nur eine
          Überschrift auf der Seite. Diesen Link-Aufbau kannst du an die Verantwortlichen der
          Service-App weitergeben, damit sie dort einen Button „Videos ansehen&ldquo; einbauen.
        </p>
      </div>

      <QrCodeListe teile={teileListe} basisUrl={basisUrl} />
    </div>
  );
}
