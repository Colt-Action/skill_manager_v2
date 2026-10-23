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
import { ABSTREIFSEGMENT_OPTIONEN, VERLAGERUNG_OPTIONEN } from "@/lib/referenzvideoOptionen";
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

  return (
    <div className="mt-3 min-w-0 border border-rule bg-paper-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("foerderband.position")}</span>
          <EintragMarkierung ungespeichert={ungespeichert} />
        </span>
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

        <DatenblattZeile untereinander label={t("upload.abstreifsegment")}>
          <AuswahlKacheln
            label={t("upload.abstreifsegment")}
            optionen={ABSTREIFSEGMENT_OPTIONEN.map((a) => ({ wert: a, label: a }))}
            wert={werte.abstreifsegment}
            onWaehlen={(wert) => onAendern("abstreifsegment", wert)}
            leerErlaubt
          />
        </DatenblattZeile>

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
