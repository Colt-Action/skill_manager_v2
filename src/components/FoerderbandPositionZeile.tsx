"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  foerderbandPositionAktualisieren,
  foerderbandPositionLoeschen,
} from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";
import KategorieKaskade, { type KategoriePfad } from "@/components/KategorieKaskade";
import Icon from "@/components/icons/Icon";
import { FOERDERBAND_POSITIONEN } from "@/lib/werksbesichtigungOptionen";
import type { FoerderbandPosition, FoerderbandPositionEintragMitDetails, Kategorie } from "@/lib/supabase/types";

const POSITION_SCHLUESSEL: Record<FoerderbandPosition, string> = {
  kopftrommel: "foerderband.positionKopftrommel",
  ablaufpunkt: "foerderband.positionAblaufpunkt",
  waschbox: "foerderband.positionWaschbox",
  freifeld: "foerderband.positionFreifeld",
};

export default function FoerderbandPositionZeile({
  eintrag,
  werksbesichtigungId,
  kategorien,
  darfBearbeiten,
}: {
  eintrag: FoerderbandPositionEintragMitDetails;
  werksbesichtigungId: string;
  kategorien: Kategorie[];
  darfBearbeiten: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();

  const [position, setPosition] = useState<FoerderbandPosition>(eintrag.position);
  const [positionFreitext, setPositionFreitext] = useState(eintrag.position_freitext ?? "");
  const [produktPfad, setProduktPfad] = useState<KategoriePfad | null>(null);
  const [konfiguration, setKonfiguration] = useState(eintrag.konfiguration);
  const [speichert, setSpeichert] = useState(false);

  const produktKategorieId = produktPfad ? produktPfad.produktId : eintrag.produkt_kategorie_id;

  async function speichern() {
    setSpeichert(true);
    const ergebnis = await foerderbandPositionAktualisieren(eintrag.id, werksbesichtigungId, {
      position,
      positionFreitext,
      produktKategorieId,
      konfiguration,
    });
    setSpeichert(false);
    if (ergebnis.erfolg) {
      toast(t("werksbesichtigungen.gespeichert"), "erfolg");
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
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
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          {t("foerderband.position")}
        </span>
        {darfBearbeiten && (
          <button type="button" onClick={loeschen} className="shrink-0 text-ink-faint hover:text-critical" title={t("foerderband.positionLoeschenButton")}>
            <Icon name="schliessen" size={14} />
          </button>
        )}
      </div>

      <fieldset disabled={!darfBearbeiten} className="mt-1 disabled:opacity-70">
        <DatenblattZeile label={t("foerderband.position")}>
          <select value={position} onChange={(e) => setPosition(e.target.value as FoerderbandPosition)} className={eingabeKlasse}>
            {FOERDERBAND_POSITIONEN.map((p) => (
              <option key={p} value={p}>
                {t(POSITION_SCHLUESSEL[p])}
              </option>
            ))}
          </select>
        </DatenblattZeile>

        {position === "freifeld" && (
          <DatenblattZeile label={t("foerderband.positionFreitextLabel")}>
            <input
              value={positionFreitext}
              onChange={(e) => setPositionFreitext(e.target.value)}
              placeholder={t("foerderband.positionFreitextPlatzhalter")}
              className={eingabeKlasse}
            />
          </DatenblattZeile>
        )}

        <DatenblattZeile label={t("foerderband.produkt")}>
          <KategorieKaskade kategorien={kategorien} startPfad={eintrag.produkt_kategorie_id} onAendern={setProduktPfad} />
        </DatenblattZeile>

        <DatenblattZeile label={t("foerderband.konfiguration")}>
          <textarea
            value={konfiguration}
            onChange={(e) => setKonfiguration(e.target.value)}
            placeholder={t("foerderband.konfigurationPlatzhalter")}
            rows={2}
            className="w-full rounded-[2px] border border-rule bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-ink"
          />
        </DatenblattZeile>
      </fieldset>

      {darfBearbeiten && (
        <button
          type="button"
          onClick={speichern}
          disabled={speichert}
          className="mt-3 rounded-[2px] border border-rule bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper-2 disabled:opacity-50"
        >
          {speichert ? t("werksbesichtigungen.speichertLaeuft") : t("werksbesichtigungen.speichern")}
        </button>
      )}
    </div>
  );
}
