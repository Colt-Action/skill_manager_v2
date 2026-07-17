import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAktuellerAdminOderHoeher } from "@/lib/auth";
import LernpfadVerwaltung from "@/components/LernpfadVerwaltung";
import type { Lernpfad, Video } from "@/lib/supabase/types";

interface LernpfadVideoZeile {
  reihenfolge: number;
  videos: Video | null;
}

export default async function AdminLernpfadDetailSeite({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await getAktuellerAdminOderHoeher();
  const { id } = await params;
  const supabase = await createClient();

  const { data: lernpfad } = await supabase.from("lernpfade").select("*").eq("id", id).single();
  if (!lernpfad) notFound();

  const [{ data: videoZeilen }, { data: alleVideos }] = await Promise.all([
    supabase
      .from("lernpfad_videos")
      .select("reihenfolge, videos(*)")
      .eq("lernpfad_id", id)
      .order("reihenfolge", { ascending: true }),
    supabase
      .from("videos")
      .select("id, titel")
      .eq("status", "veroeffentlicht")
      .order("titel", { ascending: true }),
  ]);

  const enthalteneVideos = ((videoZeilen ?? []) as unknown as LernpfadVideoZeile[])
    .map((z) => z.videos)
    .filter((v): v is Video => v !== null);

  const enthalteneIds = new Set(enthalteneVideos.map((v) => v.id));
  const verfuegbareVideos = (alleVideos ?? []).filter((v) => !enthalteneIds.has(v.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Verwaltung</p>
      <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-foreground">
        {(lernpfad as Lernpfad).titel}
      </h1>

      <LernpfadVerwaltung
        lernpfadId={id}
        enthalteneVideos={enthalteneVideos}
        verfuegbareVideos={verfuegbareVideos}
      />
    </div>
  );
}
