"use client";

import { useRouter } from "next/navigation";

const KLASSE = "font-mono text-[10px] text-ink-soft";

// Dezente Angabe "n Angaben fehlen" auf der Referenzkarte (kleine graue
// Schrift, kein farbiger Block). Wer die Referenz bearbeiten darf, kommt per
// Klick direkt zum Bearbeiten-Formular (die Karte selbst ist ein Link zur
// Detailseite, daher Knopf statt verschachteltem Link); alle anderen sehen
// dieselbe Angabe ohne Link.
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
      className={`${KLASSE} underline decoration-dotted underline-offset-2 hover:text-ink`}
    >
      {text}
    </button>
  );
}
