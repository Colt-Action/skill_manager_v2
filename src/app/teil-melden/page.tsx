import { getAktuellerNutzer } from "@/lib/auth";
import TeilMeldenForm from "@/components/TeilMeldenForm";

export default async function TeilMeldenSeite() {
  await getAktuellerNutzer();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Meldung</p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground">
        Teil nicht gefunden?
      </h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Beschreib kurz, welches Teil du gesucht hast und nicht gefunden hast. Ein Admin schaut
        sich das an und ergänzt die Kategorien/Teile bei Bedarf.
      </p>

      <TeilMeldenForm />
    </div>
  );
}
