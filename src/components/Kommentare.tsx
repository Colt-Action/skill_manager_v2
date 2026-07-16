"use client";

import { useState } from "react";
import { kommentarErstellen, kommentarLoeschen } from "@/lib/actions/kommentare";
import type { Kommentar } from "@/lib/supabase/types";

export interface KommentarMitAutor extends Kommentar {
  users: { name: string; avatar_url: string | null } | null;
}

export default function Kommentare({
  videoId,
  kommentare,
  eigeneNutzerId,
  istAdmin,
}: {
  videoId: string;
  kommentare: KommentarMitAutor[];
  eigeneNutzerId: string;
  istAdmin: boolean;
}) {
  const [liste, setListe] = useState(kommentare);
  const [text, setText] = useState("");
  const [sendet, setSendet] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSendet(true);
    const ergebnis = await kommentarErstellen(videoId, text);
    setSendet(false);
    if (ergebnis.erfolg) {
      setText("");
      // Einfachheitshalber laden wir die Seite nicht neu, sondern hängen den
      // Kommentar optimistisch lokal an - beim nächsten Laden der Seite
      // steht sowieso die serverseitige Wahrheit da.
      setListe((alt) => [
        ...alt,
        {
          id: crypto.randomUUID(),
          video_id: videoId,
          user_id: eigeneNutzerId,
          text: text.trim(),
          erstellt_am: new Date().toISOString(),
          users: null,
        },
      ]);
    }
  }

  async function loeschen(id: string) {
    setListe((alt) => alt.filter((k) => k.id !== id));
    await kommentarLoeschen(id, videoId);
  }

  return (
    <div className="mt-6 rounded-xl bg-surface p-5 ring-1 ring-line">
      <h2 className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Kommentare</h2>

      <div className="mt-3 space-y-3">
        {liste.length === 0 && <p className="text-sm text-foreground-soft">Noch keine Kommentare.</p>}
        {liste.map((k) => (
          <div key={k.id} className="flex items-start gap-2 text-sm">
            {k.users?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={k.users.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-line" />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-ink">
                {k.users?.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
            <div className="flex-1">
              <p className="text-foreground">
                <span className="font-medium text-foreground">{k.users?.name ?? "Du"}</span>{" "}
                {k.text}
              </p>
              <p className="font-mono text-xs text-foreground-soft">
                {new Date(k.erstellt_am).toLocaleString("de-DE")}
              </p>
            </div>
            {(k.user_id === eigeneNutzerId || istAdmin) && (
              <button
                type="button"
                onClick={() => loeschen(k.id)}
                className="text-xs text-foreground-soft hover:text-critical"
              >
                Löschen
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={absenden} className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Kommentar schreiben …"
          className="flex-1 rounded-lg border border-line bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={sendet}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink disabled:opacity-50"
        >
          Senden
        </button>
      </form>
    </div>
  );
}
