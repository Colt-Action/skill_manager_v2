import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import QrCodeListe from "@/components/QrCodeListe";
import type { Teil } from "@/lib/supabase/types";

export default async function QrCodeSeite() {
  await getAktuellerAdminOderHoeher();
  const supabase = await createClient();

  const { data: teile } = await supabase.from("teile").select("*").order("name");

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
      <h1 className="text-2xl font-semibold text-slate-900">QR-Codes für Teile</h1>
      <p className="mt-1 text-sm text-slate-500">
        Drucke diese QR-Codes aus und bringe sie am jeweiligen Maschinenteil an. Ein Scan öffnet
        direkt die passenden Videos.
      </p>

      <QrCodeListe teile={(teile ?? []) as Teil[]} basisUrl={basisUrl} />
    </div>
  );
}
