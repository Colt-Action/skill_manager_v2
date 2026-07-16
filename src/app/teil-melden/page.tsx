import { getAktuellerNutzer } from "@/lib/auth";
import TeilMeldenForm from "@/components/TeilMeldenForm";

export default async function TeilMeldenSeite() {
  await getAktuellerNutzer();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Teil nicht gefunden?</h1>
      <p className="mt-1 text-sm text-slate-500">
        Beschreib kurz, welches Teil du gesucht hast und nicht gefunden hast. Ein Admin schaut
        sich das an und ergänzt die Kategorien/Teile bei Bedarf.
      </p>

      <TeilMeldenForm />
    </div>
  );
}
