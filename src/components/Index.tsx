import Typenschild from "@/components/Typenschild";

export interface IndexZeile {
  id: string;
  href: string;
  nummer?: string | null;
  titel: string;
  kategorie?: string;
  rechts?: string;
}

// Die Stückliste (Designkonzept "Typenschild" Rev. 02, Abschnitt F/I):
// dichte Zeilen statt Karten, die mobile Grundform für Videothek und
// Referenzbereich.
export default function Index({ zeilen }: { zeilen: IndexZeile[] }) {
  return (
    <div className="border-t border-rule-strong">
      {zeilen.map((zeile) => (
        <Typenschild
          key={zeile.id}
          variante="zeile"
          href={zeile.href}
          nummer={zeile.nummer}
          titel={zeile.titel}
          mitte={zeile.kategorie}
          rechts={zeile.rechts}
          className="block border-b border-rule px-1 transition-colors duration-150 hover:bg-paper-2"
        />
      ))}
    </div>
  );
}
