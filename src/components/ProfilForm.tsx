"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { profilAktualisieren } from "@/lib/actions/profil";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";
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
    <form onSubmit={speichern} className="mt-6 border-t border-rule-strong">
      <DatenblattZeile label={t("profil.profilbildAendern")}>
        <div className="flex items-center gap-4">
          {vorschau || avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vorschau ?? avatarUrl ?? ""} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-signal text-xl font-bold text-signal-ink">
              {name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => bildAusgewaehlt(e.target.files?.[0] ?? null)}
            className="block text-sm text-ink-soft file:mr-3 file:rounded-[2px] file:border-0 file:bg-signal file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-signal-ink"
          />
        </div>
      </DatenblattZeile>

      <DatenblattZeile label={t("profil.name")}>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={eingabeKlasse} />
      </DatenblattZeile>

      <DatenblattZeile label={t("profil.standort")}>
        <input
          value={standort}
          onChange={(e) => setStandort(e.target.value)}
          placeholder={t("profil.standortPlatzhalter")}
          className={eingabeKlasse}
        />
      </DatenblattZeile>

      <DatenblattZeile label={t("nav.sprache")}>
        <div>
          <select
            value={sprache}
            onChange={(e) => {
              const wert = e.target.value;
              if (istGueltigeSprache(wert)) setSprache(wert);
            }}
            className={eingabeKlasse}
          >
            {SPRACHEN.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-ink-faint">{t("profil.spracheHinweis")}</span>
        </div>
      </DatenblattZeile>

      <DatenblattZeile label={t("profil.firma")}>
        <input
          value={firma}
          onChange={(e) => setFirma(e.target.value)}
          placeholder={t("profil.firmaPlatzhalter")}
          className={eingabeKlasse}
        />
      </DatenblattZeile>

      {nachricht && <p className="mt-3 text-sm text-ink-soft">{nachricht}</p>}

      <button
        type="submit"
        disabled={speichert}
        className="mt-4 rounded-[2px] bg-signal px-4 py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:opacity-90 disabled:opacity-50"
      >
        {speichert ? t("profil.speichertLaeuft") : t("profil.speichern")}
      </button>
    </form>
  );
}
