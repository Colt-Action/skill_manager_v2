"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  lernpfadLoeschen,
  lernpfadVideoEntfernen,
  lernpfadVideoHinzufuegen,
  lernpfadVideoVerschieben,
} from "@/lib/actions/lernpfade";
import { useToast } from "@/components/ToastProvider";
import type { Video } from "@/lib/supabase/types";

const ALLE = "";

export default function LernpfadVerwaltung({
  lernpfadId,
  enthalteneVideos,
  verfuegbareVideos,
}: {
  lernpfadId: string;
  enthalteneVideos: Video[];
  verfuegbareVideos: { id: string; titel: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [ausgewaehlt, setAusgewaehlt] = useState(ALLE);
  const [laeuft, setLaeuft] = useState(false);

  async function hinzufuegen() {
    if (!ausgewaehlt) return;
    setLaeuft(true);
    const ergebnis = await lernpfadVideoHinzufuegen({ lernpfadId, videoId: ausgewaehlt });
    setLaeuft(false);
    if (ergebnis.erfolg) {
      setAusgewaehlt(ALLE);
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? "Fehler beim Hinzufügen.", "fehler");
    }
  }

  async function entfernen(videoId: string) {
    const ergebnis = await lernpfadVideoEntfernen({ lernpfadId, videoId });
    if (ergebnis.erfolg) {
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? "Fehler beim Entfernen.", "fehler");
    }
  }

  async function verschieben(videoId: string, richtung: "hoch" | "runter") {
    const ergebnis = await lernpfadVideoVerschieben({ lernpfadId, videoId, richtung });
    if (ergebnis.erfolg) {
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? "Verschieben nicht möglich.", "fehler");
    }
  }

  async function lernpfadEntfernen() {
    if (!confirm("Diesen Lernpfad wirklich löschen? Die Videos selbst bleiben erhalten.")) return;
    const ergebnis = await lernpfadLoeschen(lernpfadId);
    if (ergebnis.erfolg) {
      router.push("/admin/lernpfade");
    } else {
      toast(ergebnis.fehler ?? "Fehler beim Löschen.", "fehler");
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-[240px] flex-1 block">
          <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">Video hinzufügen</span>
          <select
            value={ausgewaehlt}
            onChange={(e) => setAusgewaehlt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-foreground"
          >
            <option value={ALLE}>Bitte wählen</option>
            {verfuegbareVideos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.titel}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={hinzufuegen}
          disabled={!ausgewaehlt || laeuft}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-ink disabled:opacity-50"
        >
          Hinzufügen
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {enthalteneVideos.length === 0 && (
          <p className="text-sm text-foreground-soft">Noch keine Videos in diesem Lernpfad.</p>
        )}
        {enthalteneVideos.map((video, i) => (
          <div key={video.id} className="flex items-center gap-3 rounded-lg bg-surface p-3 ring-1 ring-line">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-accent-ink">
              {i + 1}
            </span>
            <span className="flex-1 text-sm text-foreground">{video.titel}</span>
            <button
              type="button"
              onClick={() => verschieben(video.id, "hoch")}
              disabled={i === 0}
              className="rounded-md border border-line px-2 py-1 text-xs text-foreground hover:bg-background disabled:opacity-30"
              aria-label="Nach oben verschieben"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => verschieben(video.id, "runter")}
              disabled={i === enthalteneVideos.length - 1}
              className="rounded-md border border-line px-2 py-1 text-xs text-foreground hover:bg-background disabled:opacity-30"
              aria-label="Nach unten verschieben"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => entfernen(video.id)}
              className="rounded-md border border-critical/30 px-2 py-1 text-xs text-critical hover:bg-critical/10"
            >
              Entfernen
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={lernpfadEntfernen}
        className="mt-6 rounded-lg border border-critical/30 px-3 py-1.5 text-xs text-critical hover:bg-critical/10"
      >
        Lernpfad komplett löschen
      </button>
    </div>
  );
}
