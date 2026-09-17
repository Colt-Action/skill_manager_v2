import Link from "next/link";
import type { ReactNode } from "react";

export interface TypenschildFeld {
  label: string;
  wert: string;
}

interface GemeinsameProps {
  /** Teilenummer, z.B. "HD03". Fehlt sie, übernimmt der Titel die Nummern-Rolle. */
  nummer?: string | null;
  titel: string;
  href?: string;
  className?: string;
}

interface GrossProps extends GemeinsameProps {
  variante: "gross";
  felder: TypenschildFeld[];
  /** Liegt das Typenschild auf einem Kopfbild auf (Referenz-Detailseite mit Foto)? */
  aufBild?: boolean;
}

interface KarteProps extends GemeinsameProps {
  variante: "karte";
  /** Werte ohne Label, feste Reihenfolge (Material zuerst, hervorgehoben). Max. 4. */
  werte: string[];
}

interface ZeileProps extends GemeinsameProps {
  variante: "zeile";
  /** Kategorie-Pfad zwischen Titel und rechter Spalte (Annotationsfarbe). */
  mitte?: string;
  rechts?: ReactNode;
}

type Props = GrossProps | KarteProps | ZeileProps;

// Das Signature Element (Designkonzept "Typenschild" Rev. 02, Abschnitt F):
// Teilenummer groß links, Titel rechts, darunter ein Feldraster. Drei
// Ausprägungen - "gross" höchstens einmal pro Seite (Detail-Kopf), "karte"
// als Fuß einer Medienkarte, "zeile" für jede Art von Liste.
export default function Typenschild(props: Props) {
  const inhalt = renderInhalt(props);
  if (props.href) {
    return (
      <Link href={props.href} className={props.className}>
        {inhalt}
      </Link>
    );
  }
  return <div className={props.className}>{inhalt}</div>;
}

function renderInhalt(props: Props) {
  const { nummer, titel } = props;

  if (props.variante === "gross") {
    return (
      <div
        className={`border-t-[3px] border-signal bg-plate p-6 text-plate-ink md:p-8 ${
          props.aufBild ? "md:-mt-6 md:ml-6 md:max-w-[560px]" : ""
        }`}
      >
        {nummer ? (
          <>
            <div className="font-display text-[64px] font-extrabold uppercase leading-[0.85] tracking-[-0.005em] md:text-[96px] lg:text-[120px]">
              {nummer}
            </div>
            <p className="mt-2 text-base font-medium">{titel}</p>
          </>
        ) : (
          <div className="font-display text-[36px] font-extrabold leading-[0.95] md:text-[44px]">{titel}</div>
        )}
        {props.felder.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-plate-rule pt-3 md:grid-cols-3">
            {props.felder.map((f) => (
              <span key={f.label}>
                <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-plate-soft">
                  {f.label}
                </span>
                <span className="font-mono text-[13px] tabular-nums text-plate-ink">{f.wert}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (props.variante === "karte") {
    const [erste, ...rest] = props.werte;
    return (
      <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-3.5 p-3">
        {nummer && (
          <span className="row-span-2 font-display text-[34px] font-extrabold uppercase leading-[0.9]">
            {nummer}
          </span>
        )}
        <span className={`text-sm font-medium text-ink ${nummer ? "" : "col-span-2"}`}>{titel}</span>
        {props.werte.length > 0 && (
          <span
            className={`flex flex-wrap gap-x-3 font-mono text-[11.5px] tabular-nums text-ink-soft ${
              nummer ? "" : "col-span-2"
            }`}
          >
            {erste && <span className="font-medium text-ink">{erste}</span>}
            {rest.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </span>
        )}
      </div>
    );
  }

  // zeile
  return (
    <div
      className={`grid items-baseline gap-3 py-2 ${
        props.mitte ? "grid-cols-[72px_1fr_auto_auto]" : "grid-cols-[72px_1fr_auto]"
      }`}
    >
      <span className={`font-display text-[20px] font-extrabold uppercase ${nummer ? "" : "text-ink-faint"}`}>
        {nummer || "—"}
      </span>
      <span className="truncate text-sm text-ink">{titel}</span>
      {props.mitte && (
        <span className="hidden truncate font-mono text-[12px] text-annot md:inline">{props.mitte}</span>
      )}
      {props.rechts && <span className="font-mono text-[12px] tabular-nums text-ink-soft">{props.rechts}</span>}
    </div>
  );
}
