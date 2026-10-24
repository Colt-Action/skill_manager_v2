"use client";

import { useRouter } from "next/navigation";

const KLASSE =
  "inline-flex items-center border border-critical bg-paper px-2 py-0.5 font-mono text-[11px] font-medium text-critical";

// Hinweis "n Angaben fehlen" oben rechts auf der Referenzkarte. Wer die
// Referenz bearbeiten darf, kommt per Klick direkt zum Bearbeiten-Formular
// (die Karte selbst ist ein Link zur Detailseite, daher Knopf statt
// verschachteltem Link); alle anderen sehen dieselbe Markierung ohne Link.
export default function FehlendeAngabenHinweis({
  text,
  bearbeitenHref,
  bearbeitenText,
}: {
  text: string;
  bearbeitenHref?: string;
  bearbeitenText?: string;
}) {
  const router = useRouter();
  if (!bearbeitenHref) return <span className={KLASSE}>{text}</span>;
  return (
    <button
      type="button"
      title={bearbeitenText}
      aria-label={bearbeitenText ? `${text} – ${bearbeitenText}` : text}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(bearbeitenHref);
      }}
      className={`${KLASSE} min-h-7 hover:underline`}
    >
      {text}
    </button>
  );
}
