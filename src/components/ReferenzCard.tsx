import Link from "next/link";
import LikeButton from "@/components/LikeButton";
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
}: {
  referenz: ReferenzMitDetails;
  kategorien: Kategorie[];
  aktuellerNutzerId?: string | null;
}) {
  const metadaten = einzeln(referenz.referenz_metadaten);
  const badges: string[] = [];
  const eigeneKategorieId = referenz.kategorie_id ?? referenz.teile?.kategorie_id ?? null;
  const pfad = pfadZuKategorie(kategorien, eigeneKategorieId);
  // Produkt, Kategorie, Unterkategorie = die letzten drei Ebenen der Kette.
  pfad.slice(2).forEach((id) => {
    const name = kategorien.find((k) => k.id === id)?.name;
    if (name) badges.push(name);
  });
  if (metadaten?.geschwindigkeit_ms != null) badges.push(`${metadaten.geschwindigkeit_ms.toFixed(1)} m/s`);
  if (metadaten?.foerderbandbreite) badges.push(metadaten.foerderbandbreite);

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
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 font-medium text-foreground group-hover:text-accent-deep">{referenz.titel}</h3>
        {referenz.teile && (
          <p className="font-mono text-xs text-blueprint">
            {referenz.teile.name} · Teil-Nr. {referenz.teile.teilenummer}
          </p>
        )}
        {referenz.referenz_tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
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
        {badges.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {badges.map((badge, i) => (
              <span key={i} className="rounded-full bg-blueprint/10 px-2 py-0.5 font-mono text-[10px] text-blueprint">
                {badge}
              </span>
            ))}
          </div>
        )}
        <div className="mt-1">
          <LikeButton
            id={referenz.id}
            umschalten={referenzLikeUmschalten}
            anfangsAnzahl={likes.length}
            anfangsGeliked={likes.some((l) => l.user_id === aktuellerNutzerId)}
            eingeloggt={Boolean(aktuellerNutzerId)}
          />
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
