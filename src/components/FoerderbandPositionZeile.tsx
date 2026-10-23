"use client";

import { useRouter } from "next/navigation";
import { foerderbandPositionLoeschen } from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";
import EintragMarkierung from "@/components/EintragMarkierung";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import Icon from "@/components/icons/Icon";
import { produktUndTyp, tiefsteKategorieId } from "@/lib/kategorieBaum";
import { ABSTREIFSEGMENT_OPTIONEN, VERLAGERUNG_OPTIONEN } from "@/lib/referenzvideoOptionen";
import { FOERDERBAND_POSITIONEN, POSITION_SCHLUESSEL } from "@/lib/werksbesichtigungOptionen";
import type { PositionFelder } from "@/lib/werksbesichtigungAenderungen";
import type { FoerderbandPosition, FoerderbandPositionEintragMitDetails, Kategorie } from "@/lib/supabase/types";

// Eine Position an einem Förderband. Werte und Änderungen kommen vom
// WerksbesichtigungEditor (zentrales Speichern); Löschen bleibt sofort wirksam.
export default function FoerderbandPositionZeile({
  eintrag,
  werksbesichtigungId,
  kategorien,
  darfBearbeiten,
  werte,
  onAendern,
  ungespeichert,
  fehler,
}: {
  eintrag: FoerderbandPositionEintragMitDetails;
  werksbesichtigungId: string;
  kategorien: Kategorie[];
  darfBearbeiten: boolean;
  werte: PositionFelder;
  onAendern: <K extends keyof PositionFelder>(feld: K, wert: PositionFelder[K]) => void;
  ungespeichert: boolean;
  fehler?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();

  const { produkt: produktName, typ: typName } = produktUndTyp(kategorien, werte.produktKategorieId);

  // Gespeichert wird die tiefste gewählte Ebene (z.B. der Typ B6), nicht nur
  // das Produkt. Ohne gewähltes Produkt bleibt es wie bisher bei null, damit
  // z.B. ein bloßer Hersteller nicht als Produkt-Empfehlung landet. Die
  // Kaskade meldet ihren Pfad schon beim Laden - der Editor wertet das nur
  // als Änderung, wenn die ID vom gespeicherten Wert abweicht, deshalb gelten
  // Altpositionen auf Ebene Produkt nie als geändert.
  function pfadGeaendert(pfad: KategoriePfad) {
    onAendern("produktKategorieId", pfad.produktId ? tiefsteKategorieId(pfad) : null);
  }

  async function loeschen() {
    if (!confirm(t("foerderband.positionLoeschenBestaetigung"))) return;
    const ergebnis = await foerderbandPositionLoeschen(eintrag.id, werksbesichtigungId);
    if (ergebnis.erfolg) {
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  return (
    <div className="mt-3 border border-rule bg-paper-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("foerderband.position")}</span>
          <EintragMarkierung ungespeichert={ungespeichert} />
        </span>
        {darfBearbeiten && (
          <button type="button" onClick={loeschen} className="shrink-0 text-ink-faint hover:text-critical" title={t("foerderband.positionLoeschenButton")}>
            <Icon name="schliessen" size={14} />
          </button>
        )}
      </div>
      <EintragMarkierung fehler={fehler} />

      <fieldset disabled={!darfBearbeiten} className="mt-1 disabled:opacity-70">
        <DatenblattZeile label={t("foerderband.position")}>
          <select
            value={werte.position}
            onChange={(e) => onAendern("position", e.target.value as FoerderbandPosition)}
            className={eingabeKlasse}
          >
            {FOERDERBAND_POSITIONEN.map((p) => (
              <option key={p} value={p}>
                {t(POSITION_SCHLUESSEL[p])}
              </option>
            ))}
          </select>
        </DatenblattZeile>

        {werte.position === "freifeld" && (
          <DatenblattZeile label={t("foerderband.positionFreitextLabel")}>
            <input
              value={werte.positionFreitext}
              onChange={(e) => onAendern("positionFreitext", e.target.value)}
              placeholder={t("foerderband.positionFreitextPlatzhalter")}
              className={eingabeKlasse}
            />
          </DatenblattZeile>
        )}

        <DatenblattZeile label={t("foerderband.produkt")}>
          <div>
            <KategorieKaskade kategorien={kategorien} startPfad={werte.produktKategorieId} onAendern={pfadGeaendert} />
            {typName && (
              <p className="mt-2 text-sm text-ink">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">{t("foerderband.typ")}:</span>{" "}
                <span className="font-medium">{produktName ? `${produktName} · ${typName}` : typName}</span>
              </p>
            )}
          </div>
        </DatenblattZeile>

        <DatenblattZeile label={t("upload.abstreifsegment")}>
          <select
            value={werte.abstreifsegment}
            onChange={(e) => onAendern("abstreifsegment", e.target.value)}
            className={eingabeKlasse}
          >
            <option value="">{t("upload.bitteWaehlen")}</option>
            {ABSTREIFSEGMENT_OPTIONEN.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </DatenblattZeile>

        <DatenblattZeile label={t("upload.verlagerung")}>
          <select value={werte.verlagerung} onChange={(e) => onAendern("verlagerung", e.target.value)} className={eingabeKlasse}>
            <option value="">{t("upload.bitteWaehlen")}</option>
            {VERLAGERUNG_OPTIONEN.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </DatenblattZeile>

        <DatenblattZeile label={t("foerderband.konfiguration")}>
          <textarea
            value={werte.konfiguration}
            onChange={(e) => onAendern("konfiguration", e.target.value)}
            placeholder={t("foerderband.konfigurationPlatzhalter")}
            rows={2}
            className="w-full rounded-[2px] border border-rule bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-ink"
          />
        </DatenblattZeile>
      </fieldset>
    </div>
  );
}
