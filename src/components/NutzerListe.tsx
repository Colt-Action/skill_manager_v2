"use client";

import { useState } from "react";
import { nutzerRolleAendern, nutzerAktivStatusAendern } from "@/lib/actions/nutzerverwaltung";
import { rollenLabel } from "@/lib/format";
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
    } else {
      alert(ergebnis.fehler);
    }
    setLadeId(null);
  }

  async function aktivAendern(zielNutzer: DbUser, aktiv: boolean) {
    setLadeId(zielNutzer.id);
    const ergebnis = await nutzerAktivStatusAendern(zielNutzer.id, aktiv);
    if (ergebnis.erfolg) {
      setNutzer((liste) => liste.map((n) => (n.id === zielNutzer.id ? { ...n, aktiv } : n)));
    } else {
      alert(ergebnis.fehler);
    }
    setLadeId(null);
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">Nutzer</th>
            <th className="px-4 py-2">Standort</th>
            <th className="px-4 py-2">Rolle</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {nutzer.map((n) => {
            const bearbeitbar = darfBearbeiten(n);
            const rollenOptionen = istSuperadmin ? ALLE_ROLLEN : EINFACHE_ROLLEN;
            return (
              <tr key={n.id} className={n.aktiv ? "" : "opacity-50"}>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {n.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                        {n.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    )}
                    <span className="text-slate-800">
                      {n.name} {n.id === eigeneId && <span className="text-xs text-slate-400">(du)</span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-slate-500">{n.standort ?? "–"}</td>
                <td className="px-4 py-2">
                  {bearbeitbar ? (
                    <select
                      value={n.rolle}
                      disabled={ladeId === n.id}
                      onChange={(e) => rolleAendern(n, e.target.value as Rolle)}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
                    >
                      {rollenOptionen.map((r) => (
                        <option key={r} value={r}>
                          {rollenLabel(r)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-slate-600">{rollenLabel(n.rolle)}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      n.aktiv ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {n.aktiv ? "Aktiv" : "Deaktiviert"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {bearbeitbar && (
                    <button
                      type="button"
                      disabled={ladeId === n.id}
                      onClick={() => aktivAendern(n, !n.aktiv)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
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
