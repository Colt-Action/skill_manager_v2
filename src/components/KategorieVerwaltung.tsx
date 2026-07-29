"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { herstellerReferenzfelderUmschalten, kategorieErstellen, teilErstellen } from "@/lib/actions/kategorien";
import { EBENEN_REIHENFOLGE, ebenenIcon, ebenenLabel, kinderVon } from "@/lib/kategorieBaum";
import { useSprache } from "@/components/SprachProvider";
import type { Kategorie, KategorieEbene, Teil } from "@/lib/supabase/types";

export default function KategorieVerwaltung({
  kategorien,
  teile,
}: {
  kategorien: Kategorie[];
  teile: Teil[];
}) {
  const { t } = useSprache();
  const router = useRouter();
  const [ids, setIds] = useState<(string | null)[]>(() => EBENEN_REIHENFOLGE.map(() => null));

  function auswaehlen(index: number, id: string | null) {
    setIds((vorherig) => {
      const neu = [...vorherig];
      neu[index] = id;
      for (let i = index + 1; i < neu.length; i++) neu[i] = null;
      return neu;
    });
  }

  // Teile hängen an der tiefsten Ebene (Unterkategorie), nicht mehr an
  // "kategorie" - so passt die Verwaltung zur 5-Ebenen-Struktur.
  const letzterIndex = EBENEN_REIHENFOLGE.length - 1;
  const unterkategorieId = ids[letzterIndex];

  const teileDerKategorie = unterkategorieId
    ? teile.filter((t) => t.kategorie_id === unterkategorieId).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {EBENEN_REIHENFOLGE.map((ebene, i) => (
        <Spalte
          key={ebene}
          ebene={ebene}
          eintraege={kinderVon(kategorien, ebene, i === 0 ? null : ids[i - 1])}
          ausgewaehlteId={ids[i]}
          onAuswaehlen={(id) => auswaehlen(i, id)}
          gesperrt={i > 0 && !ids[i - 1]}
          elternId={i === 0 ? null : ids[i - 1]}
          onErstellt={() => router.refresh()}
        />
      ))}

      {unterkategorieId && (
        <div className="sm:col-span-3 lg:col-span-5">
          <h2 className="mt-4 font-mono text-xs uppercase tracking-wide text-foreground-soft">
            {t("kategorieVerwaltung.teileInDieserKategorie")}
          </h2>
          <div className="mt-2 space-y-2">
            {teileDerKategorie.map((teil) => (
              <div key={teil.id} className="rounded-lg bg-surface p-3 text-sm ring-1 ring-line">
                <p className="font-medium text-foreground">
                  {teil.name} <span className="font-mono text-foreground-soft">· {teil.teilenummer}</span>
                </p>
                {teil.beschreibung && <p className="mt-0.5 text-foreground-soft">{teil.beschreibung}</p>}
              </div>
            ))}
            {teileDerKategorie.length === 0 && (
              <p className="text-sm text-foreground-soft">{t("kategorieVerwaltung.keineTeileInKategorie")}</p>
            )}
          </div>

          <NeuerTeilForm kategorieId={unterkategorieId} onErstellt={() => router.refresh()} />
        </div>
      )}
    </div>
  );
}

function Spalte({
  ebene,
  eintraege,
  ausgewaehlteId,
  onAuswaehlen,
  gesperrt,
  elternId,
  onErstellt,
}: {
  ebene: KategorieEbene;
  eintraege: Kategorie[];
  ausgewaehlteId: string | null;
  onAuswaehlen: (id: string) => void;
  gesperrt: boolean;
  elternId: string | null;
  onErstellt: () => void;
}) {
  const { t } = useSprache();
  const [neuerName, setNeuerName] = useState("");
  const [neuZeigtReferenzfelder, setNeuZeigtReferenzfelder] = useState(false);
  const [erstelltGerade, setErstelltGerade] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [wirdUmgeschaltet, setWirdUmgeschaltet] = useState<string | null>(null);

  async function hinzufuegen() {
    if (!neuerName.trim()) return;
    setErstelltGerade(true);
    setFehler(null);
    const ergebnis = await kategorieErstellen({
      name: neuerName,
      ebene,
      parentKategorieId: elternId,
      zeigtReferenzZusatzfelder: neuZeigtReferenzfelder,
    });
    setErstelltGerade(false);
    if (ergebnis.erfolg) {
      setNeuerName("");
      setNeuZeigtReferenzfelder(false);
      onErstellt();
    } else {
      setFehler(ergebnis.fehler ?? t("kategorieVerwaltung.fehlerAnlegen"));
    }
  }

  async function referenzfelderUmschalten(k: Kategorie) {
    setWirdUmgeschaltet(k.id);
    await herstellerReferenzfelderUmschalten({
      kategorieId: k.id,
      aktiv: !k.zeigt_referenz_zusatzfelder,
    });
    setWirdUmgeschaltet(null);
    onErstellt();
  }

  return (
    <div className="rounded-xl bg-surface p-3 ring-1 ring-line">
      <h3 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground-soft">
        {ebenenIcon(ebene)} {ebenenLabel(ebene)}
      </h3>

      {gesperrt ? (
        <p className="mt-2 text-xs text-foreground-soft">{t("kategorieVerwaltung.erstDarueberAuswaehlen")}</p>
      ) : (
        <>
          <div className="mt-2 space-y-1">
            {eintraege.map((k) => (
              <div key={k.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onAuswaehlen(k.id)}
                  className={`block flex-1 rounded-md px-2 py-1.5 text-left text-sm ${
                    ausgewaehlteId === k.id
                      ? "bg-accent text-accent-ink"
                      : "text-foreground hover:bg-background"
                  }`}
                >
                  {k.name}
                </button>
                {ebene === "hersteller" && (
                  <label
                    title={t("kategorieVerwaltung.refTitle")}
                    className="flex shrink-0 items-center gap-1 px-1 text-[10px] text-foreground-soft"
                  >
                    <input
                      type="checkbox"
                      checked={k.zeigt_referenz_zusatzfelder}
                      disabled={wirdUmgeschaltet === k.id}
                      onChange={() => referenzfelderUmschalten(k)}
                      className="h-3.5 w-3.5 accent-accent"
                    />
                    {t("kategorieVerwaltung.refLabel")}
                  </label>
                )}
              </div>
            ))}
            {eintraege.length === 0 && (
              <p className="text-xs text-foreground-soft">{t("kategorieVerwaltung.nochNichtsAngelegt")}</p>
            )}
          </div>

          <div className="mt-3 flex gap-1">
            <input
              value={neuerName}
              onChange={(e) => setNeuerName(e.target.value)}
              placeholder={t("kategorieVerwaltung.neuPlatzhalter")}
              className="w-full rounded-md border border-line bg-background px-2 py-1 text-xs text-foreground"
            />
            <button
              type="button"
              onClick={hinzufuegen}
              disabled={erstelltGerade}
              className="shrink-0 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-ink disabled:opacity-50"
            >
              +
            </button>
          </div>
          {ebene === "hersteller" && (
            <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-foreground-soft">
              <input
                type="checkbox"
                checked={neuZeigtReferenzfelder}
                onChange={(e) => setNeuZeigtReferenzfelder(e.target.checked)}
                className="h-3.5 w-3.5 accent-accent"
              />
              {t("kategorieVerwaltung.zeigtReferenzfelder")}
            </label>
          )}
          {fehler && <p className="mt-1 text-xs text-critical">{fehler}</p>}
        </>
      )}
    </div>
  );
}

function NeuerTeilForm({
  kategorieId,
  onErstellt,
}: {
  kategorieId: string;
  onErstellt: () => void;
}) {
  const { t } = useSprache();
  const [name, setName] = useState("");
  const [teilenummer, setTeilenummer] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [speichert, setSpeichert] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setSpeichert(true);
    setFehler(null);
    const ergebnis = await teilErstellen({ name, teilenummer, beschreibung, kategorieId });
    setSpeichert(false);
    if (ergebnis.erfolg) {
      setName("");
      setTeilenummer("");
      setBeschreibung("");
      onErstellt();
    } else {
      setFehler(ergebnis.fehler ?? t("kategorieVerwaltung.fehlerAnlegen"));
    }
  }

  return (
    <form onSubmit={absenden} className="mt-4 rounded-xl bg-background p-4 ring-1 ring-line">
      <h3 className="text-sm font-medium text-foreground">{t("kategorieVerwaltung.neuenTeilAnlegen")}</h3>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("kategorieVerwaltung.nameDesTeils")}
          required
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground"
        />
        <input
          value={teilenummer}
          onChange={(e) => setTeilenummer(e.target.value)}
          placeholder={t("kategorieVerwaltung.idNr")}
          required
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground"
        />
        <input
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          placeholder={t("kategorieVerwaltung.beschreibung")}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-foreground"
        />
      </div>
      {fehler && <p className="mt-2 text-xs text-critical">{fehler}</p>}
      <button
        type="submit"
        disabled={speichert}
        className="mt-3 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink disabled:opacity-50"
      >
        {speichert ? t("profil.speichertLaeuft") : t("kategorieVerwaltung.teilAnlegenButton")}
      </button>
    </form>
  );
}
