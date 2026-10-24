"use client";

import { useRouter } from "next/navigation";
import { foerderbandPositionLoeschen } from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse, textbereichKlasse } from "@/components/Datenblatt";
import EintragMarkierung from "@/components/EintragMarkierung";
import AuswahlKacheln from "@/components/AuswahlKacheln";
import ProduktAuswahl from "@/components/ProduktAuswahl";
import Icon from "@/components/icons/Icon";
import { produktTypText } from "@/lib/kategorieBaum";
import { useZusammenklappen } from "@/lib/useZusammenklappen";
import { ABSTREIFSEGMENT_OPTIONEN, UMMANTELUNG_OPTIONEN, VERLAGERUNG_OPTIONEN } from "@/lib/referenzvideoOptionen";
import { felderFuerKategorie } from "@/lib/produktFelder";
import { FOERDERBAND_POSITIONEN, POSITION_SCHLUESSEL } from "@/lib/werksbesichtigungOptionen";
import type { PositionFelder } from "@/lib/werksbesichtigungAenderungen";
import type { FoerderbandPosition, FoerderbandPositionEintragMitDetails, Kategorie } from "@/lib/supabase/types";

// Eine Position an einem Förderband. Werte und Änderungen kommen vom
// WerksbesichtigungEditor (zentrales Speichern); Löschen bleibt sofort wirksam.
// Ablauf (Field Mode 3.3): Position -> Produkt -> Typ -> Abstreifsegment ->
// Verlagerung -> Konfiguration.
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

  async function loeschen() {
    if (!confirm(t("foerderband.positionLoeschenBestaetigung"))) return;
    const ergebnis = await foerderbandPositionLoeschen(eintrag.id, werksbesichtigungId);
    if (ergebnis.erfolg) {
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  // "Vollständig und gespeichert": Produkt gewählt, bei Freifeld mit Text,
  // nichts ungespeichert, kein Fehler.
  const positionsName =
    werte.position === "freifeld"
      ? werte.positionFreitext.trim() || t(POSITION_SCHLUESSEL.freifeld)
      : t(POSITION_SCHLUESSEL[werte.position]);
  const vollstaendig =
    werte.produktKategorieId !== null && (werte.position !== "freifeld" || werte.positionFreitext.trim() !== "");
  const fertig = vollstaendig && !ungespeichert && !fehler;
  const [offen, setOffen] = useZusammenklappen(fertig);

  // Zum gewählten Produkt geltende Felder (lib/produktFelder.ts, dieselbe Regel
  // wie im Referenzbereich). Werte nicht geltender Felder bleiben erhalten,
  // werden aber nicht angezeigt.
  const produktFelder = felderFuerKategorie(kategorien, werte.produktKategorieId);

  if (!offen) {
    const teile = [
      positionsName,
      produktTypText(kategorien, werte.produktKategorieId),
      ...produktFelder.map((feld) => werte[feld] || null),
    ].filter((teil): teil is string => Boolean(teil));
    return (
      <div className="mt-3 min-w-0 border border-rule bg-paper-2">
        <button
          type="button"
          onClick={() => setOffen(true)}
          aria-expanded={false}
          className="flex min-h-12 w-full min-w-0 items-center gap-3 px-3 py-2.5 text-left"
        >
          <span className="min-w-0 flex-1 break-words text-sm text-ink">{teile.join(" · ")}</span>
          {fertig ? (
            <span className="flex shrink-0 items-center text-ok">
              <Icon name="haken" size={16} />
              <span className="sr-only">{t("foerderband.fertig")}</span>
            </span>
          ) : (
            <span className="shrink-0">
              <EintragMarkierung ungespeichert={ungespeichert} />
            </span>
          )}
          <Icon name="chevron" size={16} className="shrink-0 text-ink-soft" />
        </button>
        {fehler && (
          <div className="px-3 pb-2.5">
            <EintragMarkierung fehler={fehler} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 min-w-0 border border-rule bg-paper-2 p-3">
      <div className="flex items-start justify-between gap-1">
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("foerderband.position")}</span>
          <EintragMarkierung ungespeichert={ungespeichert} />
        </span>
        <button
          type="button"
          onClick={() => setOffen(false)}
          aria-expanded
          title={t("foerderband.zuklappen")}
          aria-label={t("foerderband.zuklappen")}
          className="-mt-2 flex h-11 w-11 shrink-0 items-center justify-center text-ink-soft hover:text-ink"
        >
          <Icon name="chevron" size={14} className="rotate-180" />
        </button>
        {darfBearbeiten && (
          <button type="button" onClick={loeschen} className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint hover:text-critical" title={t("foerderband.positionLoeschenButton")} aria-label={t("foerderband.positionLoeschenButton")}>
            <Icon name="schliessen" size={14} />
          </button>
        )}
      </div>
      <EintragMarkierung fehler={fehler} />

      <fieldset disabled={!darfBearbeiten} className="mt-1 min-w-0 disabled:opacity-70">
        <DatenblattZeile untereinander label={t("foerderband.position")}>
          {/* Pflichtfeld (Datenbank NOT NULL) - deshalb ohne "nichts gewählt". */}
          <AuswahlKacheln
            label={t("foerderband.position")}
            optionen={FOERDERBAND_POSITIONEN.map((p) => ({ wert: p, label: t(POSITION_SCHLUESSEL[p]) }))}
            wert={werte.position}
            onWaehlen={(wert) => {
              if (wert) onAendern("position", wert as FoerderbandPosition);
            }}
          />
        </DatenblattZeile>

        {werte.position === "freifeld" && (
          <DatenblattZeile untereinander label={t("foerderband.positionFreitextLabel")}>
            <input
              value={werte.positionFreitext}
              onChange={(e) => onAendern("positionFreitext", e.target.value)}
              placeholder={t("foerderband.positionFreitextPlatzhalter")}
              className={eingabeKlasse}
            />
          </DatenblattZeile>
        )}

        {/* Produkt und Typ: die Schritt-Titel der geführten Auswahl ersetzen
            die frühere Beschriftung "Produkt-Empfehlung". */}
        <div className="min-w-0 border-b border-rule py-2.5">
          <ProduktAuswahl
            kategorien={kategorien}
            wert={werte.produktKategorieId}
            onAendern={(id) => onAendern("produktKategorieId", id)}
            bearbeitbar={darfBearbeiten}
          />
        </div>

        {produktFelder.includes("abstreifsegment") && (
          <DatenblattZeile untereinander label={t("upload.abstreifsegment")}>
            <AuswahlKacheln
              label={t("upload.abstreifsegment")}
              optionen={ABSTREIFSEGMENT_OPTIONEN.map((a) => ({ wert: a, label: a }))}
              wert={werte.abstreifsegment}
              onWaehlen={(wert) => onAendern("abstreifsegment", wert)}
              leerErlaubt
            />
          </DatenblattZeile>
        )}

        {produktFelder.includes("verlagerung") && (
          <DatenblattZeile untereinander label={t("upload.verlagerung")}>
            <AuswahlKacheln
              label={t("upload.verlagerung")}
              optionen={VERLAGERUNG_OPTIONEN.map((v) => ({ wert: v, label: v }))}
              wert={werte.verlagerung}
              onWaehlen={(wert) => onAendern("verlagerung", wert)}
              leerErlaubt
              spaltenMobil={1}
            />
          </DatenblattZeile>
        )}

        {produktFelder.includes("ummantelung") && (
          <DatenblattZeile untereinander label={t("upload.ummantelung")}>
            <AuswahlKacheln
              label={t("upload.ummantelung")}
              optionen={UMMANTELUNG_OPTIONEN.map((u) => ({ wert: u, label: u }))}
              wert={werte.ummantelung}
              onWaehlen={(wert) => onAendern("ummantelung", wert)}
              leerErlaubt
            />
          </DatenblattZeile>
        )}

        <DatenblattZeile untereinander label={t("foerderband.konfiguration")}>
          <textarea
            value={werte.konfiguration}
            onChange={(e) => onAendern("konfiguration", e.target.value)}
            placeholder={t("foerderband.konfigurationPlatzhalter")}
            rows={2}
            className={textbereichKlasse}
          />
        </DatenblattZeile>
      </fieldset>
    </div>
  );
}
