"use client";

import { useState } from "react";
import { nutzerRolleAendern, nutzerAktivStatusAendern } from "@/lib/actions/nutzerverwaltung";
import { rollenLabel } from "@/lib/format";
import { useToast } from "@/components/ToastProvider";
import StatusBadge from "@/components/StatusBadge";
import type { DbUser, Rolle } from "@/lib/supabase/types";

const ALLE_ROLLEN: Rolle[] = ["superadmin", "admin", "techniker", "zuschauer"];
const EINFACHE_ROLLEN: Rolle[] = ["techniker", "zuschauer"];

export default function NutzerListe({
  nutzerListe,
  eigeneId,
  istSuperadmin,
}: {
  nutzerListe: DbUser[];
  eigeneId: string;
  istSuperadmin: boolean;
}) {
  const [nutzer, setNutzer] = useState(nutzerListe);
  const [ladeId, setLadeId] = useState<string | null>(null);
  const toast = useToast();

  function darfBearbeiten(zielNutzer: DbUser) {
    if (zielNutzer.id === eigeneId) return false;
    if (istSuperadmin) return true;
    // Admin darf nur Techniker/Zuschauer anfassen, keine Admin/Superadmin-Konten.
    return zielNutzer.rolle === "techniker" || zielNutzer.rolle === "zuschauer";
  }

  async function rolleAendern(zielNutzer: DbUser, neueRolle: Rolle) {
    setLadeId(zielNutzer.id);
    const ergebnis = await nutzerRolleAendern(zielNutzer.id, neueRolle);
    if (ergebnis.erfolg) {
      setNutzer((liste) =>
        liste.map((n) => (n.id === zielNutzer.id ? { ...n, rolle: neueRolle } : n)),
      );
      toast(`Rolle von ${zielNutzer.name} geändert.`, "erfolg");
    } else {
      toast(ergebnis.fehler ?? "Fehler beim Ändern der Rolle.", "fehler");
    }
    setLadeId(null);
  }

  async function aktivAendern(zielNutzer: DbUser, aktiv: boolean) {
    setLadeId(zielNutzer.id);
    const ergebnis = await nutzerAktivStatusAendern(zielNutzer.id, aktiv);
    if (ergebnis.erfolg) {
      setNutzer((liste) => liste.map((n) => (n.id === zielNutzer.id ? { ...n, aktiv } : n)));
      toast(`${zielNutzer.name} wurde ${aktiv ? "reaktiviert" : "deaktiviert"}.`, "erfolg");
    } else {
      toast(ergebnis.fehler ?? "Fehler beim Ändern des Status.", "fehler");
    }
    setLadeId(null);
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl bg-surface ring-1 ring-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-background font-mono text-xs uppercase tracking-wide text-foreground-soft">
          <tr>
            <th className="px-4 py-2">Nutzer</th>
            <th className="px-4 py-2">Standort</th>
            <th className="px-4 py-2">Rolle</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {nutzer.map((n) => {
            const bearbeitbar = darfBearbeiten(n);
            const rollenOptionen = istSuperadmin ? ALLE_ROLLEN : EINFACHE_ROLLEN;
            return (
              <tr key={n.id} className={n.aktiv ? "" : "opacity-50"}>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {n.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-line" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink">
                        {n.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    )}
                    <span className="text-foreground">
                      {n.name} {n.id === eigeneId && <span className="text-xs text-foreground-soft">(du)</span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-foreground-soft">{n.standort ?? "–"}</td>
                <td className="px-4 py-2">
                  {bearbeitbar ? (
                    <select
                      value={n.rolle}
                      disabled={ladeId === n.id}
                      onChange={(e) => rolleAendern(n, e.target.value as Rolle)}
                      className="rounded-lg border border-line bg-background px-2 py-1 text-sm text-foreground"
                    >
                      {rollenOptionen.map((r) => (
                        <option key={r} value={r}>
                          {rollenLabel(r)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-foreground-soft">{rollenLabel(n.rolle)}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge label={n.aktiv ? "Aktiv" : "Deaktiviert"} ton={n.aktiv ? "success" : "neutral"} />
                </td>
                <td className="px-4 py-2 text-right">
                  {bearbeitbar && (
                    <button
                      type="button"
                      disabled={ladeId === n.id}
                      onClick={() => aktivAendern(n, !n.aktiv)}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs text-foreground hover:bg-background disabled:opacity-50"
                    >
                      {n.aktiv ? "Deaktivieren" : "Reaktivieren"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
