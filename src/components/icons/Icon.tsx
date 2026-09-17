// Konstruierter Strich-Icon-Satz (Designkonzept "Typenschild" Rev. 02,
// Abschnitt C): 24px-Raster, Strichstärke 1,75, gerade Enden und spitze
// Ecken (square/miter statt round) - ersetzt alle Emoji in der UI. Farbe
// erbt über currentColor vom umgebenden Text.

export type IconName =
  | "video"
  | "foto"
  | "dokument"
  | "link"
  | "play"
  | "suche"
  | "filter"
  | "stern"
  | "sternVoll"
  | "herz"
  | "herzVoll"
  | "glocke"
  | "sonne"
  | "mond"
  | "upload"
  | "team"
  | "teilTag"
  | "chevron"
  | "schliessen"
  | "haken"
  | "index"
  | "karten"
  | "start"
  | "mehr";

const PFADE: Record<IconName, React.ReactNode> = {
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" />
      <path d="M16 10l5-3v10l-5-3z" />
    </>
  ),
  foto: (
    <>
      <rect x="3" y="7" width="18" height="13" />
      <path d="M8 7l2-3h4l2 3" />
      <rect x="9" y="11" width="6" height="6" />
    </>
  ),
  dokument: (
    <>
      <path d="M6 3h8l5 5v13H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6" />
    </>
  ),
  link: (
    <>
      <path d="M10 14l4-4" />
      <path d="M8 16l-2 2a3 3 0 0 1-4-4l2-2" />
      <path d="M16 8l2-2a3 3 0 0 1 4 4l-2 2" />
    </>
  ),
  play: <path d="M7 4l12 8-12 8z" />,
  suche: (
    <>
      <rect x="4" y="4" width="11" height="11" />
      <path d="M15 15l5 5" />
    </>
  ),
  filter: <path d="M3 5h18M6 12h12M10 19h4" />,
  stern: <path d="M12 3l2.8 6 6.2.6-4.7 4.2 1.4 6.2L12 16.8 6.3 20l1.4-6.2L3 9.6 9.2 9z" />,
  sternVoll: (
    <path d="M12 3l2.8 6 6.2.6-4.7 4.2 1.4 6.2L12 16.8 6.3 20l1.4-6.2L3 9.6 9.2 9z" fill="currentColor" />
  ),
  herz: <path d="M12 20S3 14.5 3 8.5C3 5.5 5.5 3 8.5 3c1.7 0 3.1.8 3.5 2 .4-1.2 1.8-2 3.5-2C18.5 3 21 5.5 21 8.5 21 14.5 12 20 12 20z" />,
  herzVoll: (
    <path
      d="M12 20S3 14.5 3 8.5C3 5.5 5.5 3 8.5 3c1.7 0 3.1.8 3.5 2 .4-1.2 1.8-2 3.5-2C18.5 3 21 5.5 21 8.5 21 14.5 12 20 12 20z"
      fill="currentColor"
    />
  ),
  glocke: (
    <>
      <path d="M6 16V10a6 6 0 0 1 12 0v6l2 2H4z" />
      <path d="M10 21h4" />
    </>
  ),
  sonne: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  mond: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />,
  upload: (
    <>
      <path d="M12 3v13M6 9l6-6 6 6" />
      <path d="M4 21h16" />
    </>
  ),
  team: (
    <>
      <circle cx="8" cy="8" r="3" />
      <path d="M2 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 14a4.5 4.5 0 0 1 6.5 4v1" />
    </>
  ),
  teilTag: (
    <>
      <path d="M3 3h9l9 9-9 9-9-9z" />
      <rect x="7" y="7" width="2" height="2" fill="currentColor" stroke="none" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  schliessen: <path d="M5 5l14 14M19 5L5 19" />,
  haken: <path d="M4 12l5 5L20 6" />,
  index: <path d="M4 6h16M4 12h16M4 18h16" />,
  karten: (
    <>
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </>
  ),
  start: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v10h12V10" />
    </>
  ),
  mehr: (
    <>
      <rect x="4" y="5" width="16" height="2.2" fill="currentColor" stroke="none" />
      <rect x="4" y="11" width="16" height="2.2" fill="currentColor" stroke="none" />
      <rect x="4" y="17" width="16" height="2.2" fill="currentColor" stroke="none" />
    </>
  ),
};

export default function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
    >
      {PFADE[name]}
    </svg>
  );
}
