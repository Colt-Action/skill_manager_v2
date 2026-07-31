// Markensymbol: Zahnrad (Maschinenteile/Technik) mit eingelassenem
// Play-Dreieck (Video/Training) - ersetzt das schlichte Farbquadrat aus
// den früheren Phasen. Läuft immer auf dunklem Nav-Hintergrund, daher ist
// das Dreieck bewusst in --nav-bg eingefärbt ("ausgestanzt").
export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <g fill="currentColor">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((winkel) => (
          <rect key={winkel} x="17" y="2" width="6" height="7" rx="1.5" transform={`rotate(${winkel} 20 20)`} />
        ))}
        <circle cx="20" cy="20" r="12" />
      </g>
      <path d="M16.5 13.5 L27 20 L16.5 26.5 Z" fill="var(--nav-bg)" />
    </svg>
  );
}
