import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import MerkStern from "@/components/MerkStern";
import { referenzLikeUmschalten } from "@/lib/actions/referenzen";
import { pfadZuKategorie } from "@/lib/kategorieBaum";
import { dauerFormatieren } from "@/lib/format";
import type { Kategorie, ReferenzMitDetails } from "@/lib/supabase/types";

const TYP_ICON: Record<string, string> = { video: "🎥", foto: "📷", dokument: "📄", link: "🔗" };

function einzeln<T>(wert: T | T[] | null | undefined): T | null {
  if (!wert) return null;
  return Array.isArray(wert) ? (wert[0] ?? null) : wert;
}

export default function ReferenzCard({
  referenz,
  kategorien,
  aktuellerNutzerId,
  gemerkt,
}: {
  referenz: ReferenzMitDetails;
  kategorien: Kategorie[];
  aktuellerNutzerId?: string | null;
  gemerkt?: boolean;
}) {
  const metadaten = einzeln(referenz.referenz_metadaten);
  const eigeneKategorieId = referenz.kategorie_id ?? referenz.teile?.kategorie_id ?? null;
  const pfad = pfadZuKategorie(kategorien, eigeneKategorieId);
  // Produkt, Kategorie, Unterkategorie = die letzten drei Ebenen der Kette.
  const kategorieNamen = pfad
    .slice(2)
    .map((id) => kategorien.find((k) => k.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const metaZeile = [...kategorieNamen, metadaten?.foerderbandbreite].filter(Boolean).join(" · ");

  const likes = referenz.referenz_likes ?? [];

  return (
    <Link
      href={`/referenzbereich/${referenz.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-accent hover:shadow-lg animate-fade-in-up"
    >
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-nav">
        <ReferenzVorschaubild referenz={referenz} />
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-blueprint px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-white">
          {TYP_ICON[referenz.typ]} {referenz.typ}
        </span>
        {gemerkt !== undefined && (
          <span className="absolute right-2 top-2">
            <MerkStern referenzId={referenz.id} anfangsGemerkt={gemerkt} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start gap-2">
          {referenz.teile?.teilenummer && (
            <span className="mt-0.5 shrink-0 rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-accent-deep">
              {referenz.teile.teilenummer}
            </span>
          )}
          <h3 className="line-clamp-2 font-medium text-foreground group-hover:text-accent-deep">{referenz.titel}</h3>
        </div>
        {referenz.referenz_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {referenz.referenz_tags.slice(0, 4).map(({ tags }) => (
              <span
                key={tags.id}
                className="rounded-full bg-background px-2 py-0.5 text-[11px] text-foreground-soft ring-1 ring-line"
              >
                {tags.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-baseline justify-between gap-2 border-t border-line pt-2 text-xs text-foreground-soft">
          <span className="truncate">{metaZeile || " "}</span>
          <span className="flex shrink-0 items-center gap-2">
            {metadaten?.geschwindigkeit_ms != null && (
              <span className="font-mono text-foreground">
                <span className="text-[13px] font-bold">{metadaten.geschwindigkeit_ms.toFixed(1)}</span> m/s
              </span>
            )}
            <LikeButton
              id={referenz.id}
              umschalten={referenzLikeUmschalten}
              anfangsAnzahl={likes.length}
              anfangsGeliked={likes.some((l) => l.user_id === aktuellerNutzerId)}
              eingeloggt={Boolean(aktuellerNutzerId)}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ReferenzVorschaubild({ referenz }: { referenz: ReferenzMitDetails }) {
  if (referenz.typ === "video") {
    const inhalt = einzeln(referenz.referenz_video);
    return (
      <>
        {inhalt?.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={inhalt.thumbnail_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
          />
        ) : inhalt ? (
          <video src={inhalt.datei_url} className="h-full w-full object-cover opacity-90" muted preload="metadata" />
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg">▶</span>
        </span>
        {inhalt?.dauer != null && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-xs text-white">
            {dauerFormatieren(inhalt.dauer)}
          </span>
        )}
      </>
    );
  }

  if (referenz.typ === "foto") {
    const inhalt = einzeln(referenz.referenz_foto);
    const bild = inhalt?.nachher_url ?? inhalt?.vorher_url;
    if (!bild) return <span className="text-4xl">📷</span>;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={bild} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
    );
  }

  if (referenz.typ === "dokument") {
    return <span className="text-4xl">📄</span>;
  }

  return <span className="text-4xl">🔗</span>;
}
