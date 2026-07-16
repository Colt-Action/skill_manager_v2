"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { profilAktualisieren } from "@/lib/actions/profil";
import type { DbUser } from "@/lib/supabase/types";

export default function ProfilForm({ nutzer }: { nutzer: DbUser }) {
  const [name, setName] = useState(nutzer.name);
  const [standort, setStandort] = useState(nutzer.standort ?? "");
  const [firma, setFirma] = useState(nutzer.firma ?? "");
  const [avatarUrl, setAvatarUrl] = useState(nutzer.avatar_url);
  const [datei, setDatei] = useState<File | null>(null);
  const [vorschau, setVorschau] = useState<string | null>(null);
  const [speichert, setSpeichert] = useState(false);
  const [nachricht, setNachricht] = useState<string | null>(null);

  function bildAusgewaehlt(datei: File | null) {
    setDatei(datei);
    setVorschau(datei ? URL.createObjectURL(datei) : null);
  }

  async function speichern(e: React.FormEvent) {
    e.preventDefault();
    setSpeichert(true);
    setNachricht(null);

    try {
      let neueAvatarUrl: string | null = null;

      if (datei) {
        const supabase = createClient();
        const dateiname = `${nutzer.id}-${Date.now()}-${datei.name}`;
        const { error: uploadFehler } = await supabase.storage
          .from("avatare")
          .upload(dateiname, datei, { upsert: true });

        if (uploadFehler) {
          setNachricht(`Bild-Upload fehlgeschlagen: ${uploadFehler.message}`);
          return;
        }

        const { data: urlData } = supabase.storage.from("avatare").getPublicUrl(dateiname);
        neueAvatarUrl = urlData.publicUrl;
        setAvatarUrl(neueAvatarUrl);
      }

      const ergebnis = await profilAktualisieren({
        name,
        standort,
        firma,
        avatarUrl: neueAvatarUrl,
      });

      setNachricht(ergebnis.erfolg ? "Profil gespeichert." : ergebnis.fehler ?? "Fehler beim Speichern.");
    } finally {
      setSpeichert(false);
    }
  }

  return (
    <form onSubmit={speichern} className="mt-6 space-y-5">
      <div className="flex items-center gap-4">
        {vorschau || avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vorschau ?? avatarUrl ?? ""}
            alt=""
            className="h-16 w-16 rounded-full object-cover ring-1 ring-line"
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-xl font-bold text-accent-ink">
            {name?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
        <label className="block">
          <span className="text-sm font-medium text-foreground">Profilbild ändern</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => bildAusgewaehlt(e.target.files?.[0] ?? null)}
            className="mt-1 block text-sm text-foreground-soft file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent-ink"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-foreground">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">Standort (optional)</span>
        <input
          value={standort}
          onChange={(e) => setStandort(e.target.value)}
          placeholder="z. B. Deutschland, Brasilien, ..."
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">Firma/Abteilung (optional)</span>
        <input
          value={firma}
          onChange={(e) => setFirma(e.target.value)}
          placeholder="z. B. HOSCH, oder Name der Partnerfirma"
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </label>

      {nachricht && <p className="text-sm text-foreground-soft">{nachricht}</p>}

      <button
        type="submit"
        disabled={speichert}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
      >
        {speichert ? "Speichert …" : "Speichern"}
      </button>
    </form>
  );
}
