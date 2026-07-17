"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { profilAktualisieren } from "@/lib/actions/profil";
import { useSprache } from "@/components/SprachProvider";
import { SPRACHEN, istGueltigeSprache } from "@/lib/i18n/sprachen";
import type { DbUser } from "@/lib/supabase/types";

export default function ProfilForm({ nutzer }: { nutzer: DbUser }) {
  const { sprache, setSprache, t } = useSprache();
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
          setNachricht(t("profil.fehlerBildUpload", { meldung: uploadFehler.message }));
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

      setNachricht(ergebnis.erfolg ? t("profil.gespeichert") : ergebnis.fehler ?? t("profil.fehlerStandard"));
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
          <span className="text-sm font-medium text-foreground">{t("profil.profilbildAendern")}</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => bildAusgewaehlt(e.target.files?.[0] ?? null)}
            className="mt-1 block text-sm text-foreground-soft file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent-ink"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-foreground">{t("profil.name")}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">{t("profil.standort")}</span>
        <input
          value={standort}
          onChange={(e) => setStandort(e.target.value)}
          placeholder={t("profil.standortPlatzhalter")}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">{t("nav.sprache")}</span>
        <select
          value={sprache}
          onChange={(e) => {
            const wert = e.target.value;
            if (istGueltigeSprache(wert)) setSprache(wert);
          }}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        >
          {SPRACHEN.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-foreground-soft">
          {t("profil.spracheHinweis")}
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">{t("profil.firma")}</span>
        <input
          value={firma}
          onChange={(e) => setFirma(e.target.value)}
          placeholder={t("profil.firmaPlatzhalter")}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </label>

      {nachricht && <p className="text-sm text-foreground-soft">{nachricht}</p>}

      <button
        type="submit"
        disabled={speichert}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
      >
        {speichert ? t("profil.speichertLaeuft") : t("profil.speichern")}
      </button>
    </form>
  );
}
