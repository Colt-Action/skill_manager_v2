"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { werksbesichtigungSpeichern, werksbesichtigungStatusSetzen } from "@/lib/actions/werksbesichtigungen";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import WerksbesichtigungAllgemeineAngaben from "@/components/WerksbesichtigungAllgemeineAngaben";
import WerksbesichtigungExport from "@/components/WerksbesichtigungExport";
import WerksbesichtigungSpeicherLeiste, { type SpeicherZustand } from "@/components/WerksbesichtigungSpeicherLeiste";
import FoerderbandListe from "@/components/FoerderbandListe";
import SectionLinie from "@/components/SectionLinie";
import Icon from "@/components/icons/Icon";
import {
  KEINE_AENDERUNGEN,
  bandFelderAus,
  berichtFelderAus,
  positionFelderAus,
  type Aenderungen,
  type BandFelder,
  type BerichtFelder,
  type PositionFelder,
  type SpeicherArt,
} from "@/lib/werksbesichtigungAenderungen";
import type { FoerderbandEintragMitDetails, Kategorie, Werksbesichtigung } from "@/lib/supabase/types";

// Abstand der Toasts vom unteren Rand auf dieser Seite (mobil): oberhalb
// von Hauptnavigation und Speicherleiste, siehe ToastProvider.
const TOAST_ABSTAND_MOBIL = "9rem";

type Gruppe = "baender" | "positionen";

function hatFelder(objekt: object | undefined): boolean {
  return Boolean(objekt) && Object.keys(objekt as object).length > 0;
}

function hatAenderungen(a: Aenderungen): boolean {
  return (
    hatFelder(a.bericht) ||
    Object.values(a.baender).some(hatFelder) ||
    Object.values(a.positionen).some(hatFelder)
  );
}

// Entfernt aus dem Overlay alles, was es nicht mehr gibt (gelöschte Bänder/
// Positionen) oder was inzwischen dem gespeicherten Stand entspricht.
function bereinigen(
  a: Aenderungen,
  besuch: Werksbesichtigung,
  eintraege: FoerderbandEintragMitDetails[],
): Aenderungen {
  const bericht = berichtFelderAus(besuch);
  const neuerBericht: Partial<BerichtFelder> = {};
  for (const [feld, wert] of Object.entries(a.bericht) as [keyof BerichtFelder, string][]) {
    if (bericht[feld] !== wert) (neuerBericht as Record<string, unknown>)[feld] = wert;
  }

  const baender: Aenderungen["baender"] = {};
  const positionen: Aenderungen["positionen"] = {};
  for (const band of eintraege) {
    const basis = bandFelderAus(band);
    const aenderung = a.baender[band.id];
    if (aenderung) {
      const rest = Object.fromEntries(
        Object.entries(aenderung).filter(([feld, wert]) => basis[feld as keyof BandFelder] !== wert),
      );
      if (hatFelder(rest)) baender[band.id] = rest;
    }
    for (const pos of band.foerderband_positionen) {
      const posBasis = positionFelderAus(pos);
      const posAenderung = a.positionen[pos.id];
      if (posAenderung) {
        const rest = Object.fromEntries(
          Object.entries(posAenderung).filter(([feld, wert]) => posBasis[feld as keyof PositionFelder] !== wert),
        );
        if (hatFelder(rest)) positionen[pos.id] = rest;
      }
    }
  }
  return { bericht: neuerBericht, baender, positionen };
}

export default function WerksbesichtigungEditor({
  besuch,
  eintraege,
  kategorien,
  darfBearbeiten,
  darfLoeschen,
}: {
  besuch: Werksbesichtigung;
  eintraege: FoerderbandEintragMitDetails[];
  kategorien: Kategorie[];
  darfBearbeiten: boolean;
  darfLoeschen: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();

  // aenderungen: noch nicht gespeicherte Eingaben (nur Felder, die vom
  // gespeicherten Stand abweichen). gespeichert: soeben erfolgreich
  // gespeicherte Werte, bis die neuen Props vom Server da sind - verhindert,
  // dass kurz der alte Wert aufblitzt.
  const [aenderungen, setAenderungen] = useState<Aenderungen>(KEINE_AENDERUNGEN);
  const [gespeichert, setGespeichert] = useState<Aenderungen>(KEINE_AENDERUNGEN);
  const [speichert, setSpeichert] = useState(false);
  const [letzterVersuchFehlgeschlagen, setLetzterVersuchFehlgeschlagen] = useState(false);
  const [fehlerJeEintrag, setFehlerJeEintrag] = useState<Record<string, string>>({});
  const [statusLaeuft, setStatusLaeuft] = useState(false);
  const [tastaturOffen, setTastaturOffen] = useState(false);

  // Neue Daten vom Server (nach Speichern, Anlegen, Löschen, Foto, …): sie
  // sind ab jetzt der gespeicherte Stand. Overlay entsprechend bereinigen -
  // ungespeicherte Eingaben bleiben erhalten. (Zustandsanpassung beim
  // Rendern statt in einem Effect, wie von React für Props-Wechsel empfohlen.)
  const [letzteDaten, setLetzteDaten] = useState({ besuch, eintraege });
  if (letzteDaten.besuch !== besuch || letzteDaten.eintraege !== eintraege) {
    setLetzteDaten({ besuch, eintraege });
    setGespeichert(KEINE_AENDERUNGEN);
    setAenderungen((a) => bereinigen(a, besuch, eintraege));
  }

  const berichtBasis: BerichtFelder = { ...berichtFelderAus(besuch), ...gespeichert.bericht };
  const bandBasis = (band: FoerderbandEintragMitDetails): BandFelder => ({
    ...bandFelderAus(band),
    ...gespeichert.baender[band.id],
  });
  const positionBasis = (pos: FoerderbandEintragMitDetails["foerderband_positionen"][number]): PositionFelder => ({
    ...positionFelderAus(pos),
    ...gespeichert.positionen[pos.id],
  });

  const bandWerte: Record<string, BandFelder> = {};
  const positionWerte: Record<string, PositionFelder> = {};
  const bandBasisWerte: Record<string, BandFelder> = {};
  const positionBasisWerte: Record<string, PositionFelder> = {};
  for (const band of eintraege) {
    bandBasisWerte[band.id] = bandBasis(band);
    bandWerte[band.id] = { ...bandBasisWerte[band.id], ...aenderungen.baender[band.id] };
    for (const pos of band.foerderband_positionen) {
      positionBasisWerte[pos.id] = positionBasis(pos);
      positionWerte[pos.id] = { ...positionBasisWerte[pos.id], ...aenderungen.positionen[pos.id] };
    }
  }
  const berichtWerte: BerichtFelder = { ...berichtBasis, ...aenderungen.bericht };

  const ungespeichert = hatAenderungen(aenderungen);
  const zustand: SpeicherZustand = speichert
    ? "speichert"
    : letzterVersuchFehlgeschlagen
      ? "fehler"
      : ungespeichert
        ? "ungespeichert"
        : "gespeichert";

  // Ein Feld gilt nur als geändert, wenn es vom gespeicherten Stand abweicht.
  // Setzt man es zurück, verschwindet es wieder aus dem Overlay - deshalb
  // gilt auch eine Position, deren Kaskade beim Laden ihren (unveränderten)
  // Pfad meldet, nie als geändert.
  function berichtAendern<K extends keyof BerichtFelder>(feld: K, wert: BerichtFelder[K]) {
    setLetzterVersuchFehlgeschlagen(false);
    setAenderungen((a) => {
      const bericht = { ...a.bericht };
      if (berichtBasis[feld] === wert) delete bericht[feld];
      else bericht[feld] = wert;
      return { ...a, bericht };
    });
  }

  function eintragAendern<F>(gruppe: Gruppe, id: string, feld: keyof F, wert: unknown, basis: F | undefined) {
    if (!basis) return;
    if (basis[feld] !== wert) setLetzterVersuchFehlgeschlagen(false);
    setAenderungen((a) => {
      const bisher = (a[gruppe][id] ?? {}) as Record<string, unknown>;
      const neu = { ...bisher };
      if (basis[feld] === wert) delete neu[feld as string];
      else neu[feld as string] = wert;
      const gruppeNeu = { ...a[gruppe] } as Record<string, Record<string, unknown>>;
      if (hatFelder(neu)) gruppeNeu[id] = neu;
      else delete gruppeNeu[id];
      return { ...a, [gruppe]: gruppeNeu };
    });
  }

  function bandAendern<K extends keyof BandFelder>(id: string, feld: K, wert: BandFelder[K]) {
    eintragAendern<BandFelder>("baender", id, feld, wert, bandBasisWerte[id]);
  }

  function positionAendern<K extends keyof PositionFelder>(id: string, feld: K, wert: PositionFelder[K]) {
    eintragAendern<PositionFelder>("positionen", id, feld, wert, positionBasisWerte[id]);
  }

  // Nutzlast für den Server: nur geänderte Felder. Zusammengehörige Felder
  // reisen gemeinsam (Material + Sonstiges, Position + Freitext), damit der
  // Server die Abhängigkeit korrekt auflösen kann.
  function nutzlast(a: Aenderungen): Aenderungen {
    const baender: Aenderungen["baender"] = {};
    for (const [id, felder] of Object.entries(a.baender)) {
      if (!hatFelder(felder) || !bandWerte[id]) continue;
      const werte = bandWerte[id];
      baender[id] =
        "material" in felder || "materialSonstiges" in felder
          ? { ...felder, material: werte.material, materialSonstiges: werte.materialSonstiges }
          : felder;
    }
    const positionen: Aenderungen["positionen"] = {};
    for (const [id, felder] of Object.entries(a.positionen)) {
      if (!hatFelder(felder) || !positionWerte[id]) continue;
      const werte = positionWerte[id];
      positionen[id] =
        "position" in felder || "positionFreitext" in felder
          ? { ...felder, position: werte.position, positionFreitext: werte.positionFreitext }
          : felder;
    }
    return { bericht: a.bericht, baender, positionen };
  }

  function fehlerSchluessel(art: SpeicherArt, id: string) {
    return art === "bericht" ? "bericht" : `${art}:${id}`;
  }

  // Speichert alle Änderungen. true = nichts mehr offen und kein Fehler.
  async function zwischenspeichern(): Promise<boolean> {
    if (!ungespeichert) {
      setLetzterVersuchFehlgeschlagen(false);
      return true;
    }
    const gesendet = nutzlast(aenderungen);
    setSpeichert(true);
    setFehlerJeEintrag({});

    let ergebnis;
    try {
      ergebnis = await werksbesichtigungSpeichern(besuch.id, gesendet);
    } catch (fehler) {
      setSpeichert(false);
      setLetzterVersuchFehlgeschlagen(true);
      toast(fehler instanceof Error ? fehler.message : t("profil.fehlerStandard"), "fehler");
      return false;
    }

    const okBaender = new Set(ergebnis.ok.baender);
    const okPositionen = new Set(ergebnis.ok.positionen);

    // Erfolgreich Gespeichertes aus dem Overlay nehmen - aber nur Felder, die
    // während des Speicherns nicht weiter verändert wurden.
    const entferneGesendete = <F,>(aktuell: Partial<F>, gesendeteFelder: Partial<F>): Partial<F> => {
      const rest = { ...aktuell } as Record<string, unknown>;
      for (const [feld, wert] of Object.entries(gesendeteFelder)) {
        if (rest[feld] === wert) delete rest[feld];
      }
      return rest as Partial<F>;
    };
    setAenderungen((a) => {
      const bericht = ergebnis.ok.bericht ? entferneGesendete(a.bericht, gesendet.bericht) : a.bericht;
      const baender = { ...a.baender };
      for (const id of okBaender) {
        const rest = entferneGesendete(baender[id] ?? {}, gesendet.baender[id] ?? {});
        if (hatFelder(rest)) baender[id] = rest;
        else delete baender[id];
      }
      const positionen = { ...a.positionen };
      for (const id of okPositionen) {
        const rest = entferneGesendete(positionen[id] ?? {}, gesendet.positionen[id] ?? {});
        if (hatFelder(rest)) positionen[id] = rest;
        else delete positionen[id];
      }
      return { bericht, baender, positionen };
    });
    setGespeichert((g) => {
      const baender = { ...g.baender };
      for (const id of okBaender) baender[id] = { ...baender[id], ...gesendet.baender[id] };
      const positionen = { ...g.positionen };
      for (const id of okPositionen) positionen[id] = { ...positionen[id], ...gesendet.positionen[id] };
      return {
        bericht: ergebnis.ok.bericht ? { ...g.bericht, ...gesendet.bericht } : g.bericht,
        baender,
        positionen,
      };
    });

    setFehlerJeEintrag(
      Object.fromEntries(ergebnis.fehler.map((f) => [fehlerSchluessel(f.art, f.id), f.meldung])),
    );
    setSpeichert(false);

    if (ergebnis.fehler.length === 0) {
      setLetzterVersuchFehlgeschlagen(false);
      toast(t("werksbesichtigungen.gespeichert"), "erfolg");
      return true;
    }

    setLetzterVersuchFehlgeschlagen(true);
    const okAnzahl = ergebnis.gesamt - ergebnis.fehler.length;
    const details = ergebnis.fehler.map((f) => `${f.nummer}: ${f.meldung}`).join("; ");
    toast(
      `${t("werksbesichtigungen.teilweiseGespeichert", { ok: String(okAnzahl), gesamt: String(ergebnis.gesamt) })} – ${details}`,
      "fehler",
    );
    return false;
  }

  async function abschliessen() {
    const alles = await zwischenspeichern();
    if (!alles) {
      toast(t("werksbesichtigungen.nichtAbgeschlossen"), "fehler");
      return;
    }
    setStatusLaeuft(true);
    const ergebnis = await werksbesichtigungStatusSetzen(besuch.id, "abgeschlossen");
    setStatusLaeuft(false);
    if (ergebnis.erfolg) {
      toast(t("werksbesichtigungen.abgeschlossenErfolg"), "erfolg");
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  async function wiederOeffnen() {
    setStatusLaeuft(true);
    const ergebnis = await werksbesichtigungStatusSetzen(besuch.id, "entwurf");
    setStatusLaeuft(false);
    if (ergebnis.erfolg) {
      toast(t("werksbesichtigungen.wiederEroeffnet"), "erfolg");
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  // Mobil: Toasts über Navigation und Speicherleiste anheben, solange diese
  // Seite offen ist.
  useEffect(() => {
    const wurzel = document.documentElement;
    wurzel.style.setProperty("--toast-unten", TOAST_ABSTAND_MOBIL);
    return () => {
      wurzel.style.removeProperty("--toast-unten");
    };
  }, []);

  // Mobil: Bei geöffneter Bildschirmtastatur (Fokus in einem Textfeld) wird
  // die feste Leiste ausgeblendet, damit sie weder Feld noch Tastatur
  // verdeckt.
  useEffect(() => {
    const istTextfeld = (ziel: EventTarget | null) => {
      if (ziel instanceof HTMLTextAreaElement) return true;
      if (!(ziel instanceof HTMLInputElement)) return false;
      return !["range", "checkbox", "radio", "file", "button", "submit", "reset", "color"].includes(ziel.type);
    };
    const fokusRein = (e: FocusEvent) => setTastaturOffen(istTextfeld(e.target));
    const fokusRaus = () => setTastaturOffen(false);
    document.addEventListener("focusin", fokusRein);
    document.addEventListener("focusout", fokusRaus);
    return () => {
      document.removeEventListener("focusin", fokusRein);
      document.removeEventListener("focusout", fokusRaus);
    };
  }, []);

  const laeuft = speichert || statusLaeuft;
  const abgeschlossen = besuch.status === "abgeschlossen";
  const leisteProps = {
    zustand,
    abgeschlossen,
    laeuft,
    onZwischenspeichern: () => void zwischenspeichern(),
    onAbschliessen: () => void abschliessen(),
    onWiederOeffnen: () => void wiederOeffnen(),
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/werksbesichtigungen"
          className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-signal"
        >
          <Icon name="chevron" size={12} className="rotate-90" /> {t("werksbesichtigungen.zurueck")}
        </Link>
        <WerksbesichtigungExport besuch={besuch} eintraege={eintraege} kategorien={kategorien} />
      </div>

      {darfBearbeiten && (
        <div className="mt-3 hidden border-y border-rule py-2 md:block">
          <WerksbesichtigungSpeicherLeiste {...leisteProps} />
        </div>
      )}

      <div className="mt-4">
        <SectionLinie titel={t("werksbesichtigungen.allgemeineAngaben")} />
        <WerksbesichtigungAllgemeineAngaben
          besuch={besuch}
          werte={berichtWerte}
          onAendern={berichtAendern}
          ungespeichert={hatFelder(aenderungen.bericht)}
          fehler={fehlerJeEintrag.bericht}
          darfBearbeiten={darfBearbeiten}
          darfLoeschen={darfLoeschen}
        />
      </div>

      <section className="mt-8">
        <SectionLinie titel={t("foerderband.titel")} />
        <FoerderbandListe
          werksbesichtigungId={besuch.id}
          eintraege={eintraege}
          kategorien={kategorien}
          darfBearbeiten={darfBearbeiten}
          bandWerte={bandWerte}
          positionWerte={positionWerte}
          onBandAendern={bandAendern}
          onPositionAendern={positionAendern}
          bandUngespeichert={(id) => hatFelder(aenderungen.baender[id])}
          positionUngespeichert={(id) => hatFelder(aenderungen.positionen[id])}
          bandFehler={(id) => fehlerJeEintrag[fehlerSchluessel("band", id)]}
          positionFehler={(id) => fehlerJeEintrag[fehlerSchluessel("position", id)]}
        />
      </section>

      {darfBearbeiten && (
        <>
          {/* Platzhalter, damit die feste Leiste mobil nichts am Seitenende verdeckt. */}
          <div aria-hidden className="h-20 md:hidden" />
          <div
            className={`fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 border-t border-rule-strong bg-paper px-4 py-2 md:hidden print:hidden ${
              tastaturOffen ? "hidden" : ""
            }`}
          >
            <WerksbesichtigungSpeicherLeiste {...leisteProps} />
          </div>
        </>
      )}
    </>
  );
}
