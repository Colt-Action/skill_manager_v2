// Markensymbol: ein Abzeichen/Schild (Zertifizierung, erreichte
// Trainingsstufe) mit eingelassenem Play-Dreieck (Video/Training) -
// verbindet Skill Manager, Referenzen und Training in einer Form statt
// eines wörtlichen Maschinenteils (Designkonzept "Typenschild" Rev. 02).
// Läuft auf der dunklen Kopfleiste; das Dreieck ist in --plate
// eingefärbt ("ausgestanzt"), der Schild-Umriss in --signal.
export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 2.5 L33.5 7.5 V19 C33.5 27.8 28 34 20 37.5 C12 34 6.5 27.8 6.5 19 V7.5 Z"
        fill="var(--signal)"
      />
      <path d="M16 13 L27 20 L16 27 Z" fill="var(--plate)" />
    </svg>
  );
}
