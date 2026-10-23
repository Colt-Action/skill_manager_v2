"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { foerderbandFotoEntfernen, foerderbandFotoHinzufuegen } from "@/lib/actions/werksbesichtigungen";
import { bildKomprimieren } from "@/lib/bildKomprimieren";
import { useToast } from "@/components/ToastProvider";
import { useSprache } from "@/components/SprachProvider";
import Icon from "@/components/icons/Icon";
import type { FoerderbandFoto } from "@/lib/supabase/types";

interface LokalerUpload {
  schluessel: string;
  vorschau: string;
  status: "laeuft" | "fertig" | "fehler";
  meldung?: string;
  url?: string;
}

// Fotos eines Förderbands (Field Mode 3.5). Großer Knopf "Foto aufnehmen /
// hinzufügen" ohne capture-Attribut, damit iOS Kamera oder Mediathek
// anbietet. Jedes Foto zeigt seinen Status (Hochladen, fertig, Fehler); die
// Vorschau behält das Seitenverhältnis (object-contain). Löschen nur über
// einen sichtbaren Knopf mit Bestätigung. Anlegen und Löschen wirken sofort.
export default function FoerderbandFotos({
  fotos,
  foerderbandEintragId,
  werksbesichtigungId,
  darfBearbeiten,
}: {
  fotos: FoerderbandFoto[];
  foerderbandEintragId: string;
  werksbesichtigungId: string;
  darfBearbeiten: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useSprache();
  const [uploads, setUploads] = useState<LokalerUpload[]>([]);

  const gespeicherteUrls = new Set(fotos.map((f) => f.foto_url));
  // Lokale Einträge, deren Foto inzwischen vom Server kommt, nicht doppelt zeigen.
  const sichtbareUploads = uploads.filter((u) => !u.url || !gespeicherteUrls.has(u.url));

  function uploadAktualisieren(schluessel: string, aenderung: Partial<LokalerUpload>) {
    setUploads((liste) => liste.map((u) => (u.schluessel === schluessel ? { ...u, ...aenderung } : u)));
  }

  function uploadEntfernen(schluessel: string) {
    setUploads((liste) => {
      const eintrag = liste.find((u) => u.schluessel === schluessel);
      if (eintrag) URL.revokeObjectURL(eintrag.vorschau);
      return liste.filter((u) => u.schluessel !== schluessel);
    });
  }

  async function fotoAusgewaehlt(datei: File | null) {
    if (!datei) return;
    const schluessel = crypto.randomUUID();
    // Bereits beim Server angekommene lokale Einträge aufräumen.
    setUploads((liste) => {
      const bleiben = liste.filter((u) => !u.url || !gespeicherteUrls.has(u.url));
      liste.filter((u) => !bleiben.includes(u)).forEach((u) => URL.revokeObjectURL(u.vorschau));
      return [...bleiben, { schluessel, vorschau: URL.createObjectURL(datei), status: "laeuft" }];
    });

    try {
      // Verkleinerung vor dem Upload (bildKomprimieren: lange Kante max.
      // 1600 px, JPEG 0,82, Seitenverhältnis bleibt).
      const verkleinert = await bildKomprimieren(datei);
      const supabase = createClient();
      const dateiname = `${werksbesichtigungId}/${foerderbandEintragId}/${crypto.randomUUID()}.jpg`;
      const { error: uploadFehler } = await supabase.storage
        .from("werksbesichtigung-fotos")
        .upload(dateiname, verkleinert, { contentType: "image/jpeg" });
      if (uploadFehler) {
        uploadAktualisieren(schluessel, { status: "fehler", meldung: uploadFehler.message });
        return;
      }
      const { data: urlData } = supabase.storage.from("werksbesichtigung-fotos").getPublicUrl(dateiname);
      const ergebnis = await foerderbandFotoHinzufuegen(foerderbandEintragId, werksbesichtigungId, urlData.publicUrl);
      if (ergebnis.erfolg) {
        uploadAktualisieren(schluessel, { status: "fertig", url: urlData.publicUrl });
        router.refresh();
      } else {
        uploadAktualisieren(schluessel, { status: "fehler", meldung: ergebnis.fehler ?? t("profil.fehlerStandard") });
      }
    } catch (fehler) {
      uploadAktualisieren(schluessel, {
        status: "fehler",
        meldung: fehler instanceof Error ? fehler.message : t("profil.fehlerStandard"),
      });
    }
  }

  async function fotoEntfernen(fotoId: string) {
    if (!confirm(t("foerderband.fotoLoeschenBestaetigung"))) return;
    const ergebnis = await foerderbandFotoEntfernen(fotoId, werksbesichtigungId);
    if (ergebnis.erfolg) {
      router.refresh();
    } else {
      toast(ergebnis.fehler ?? t("profil.fehlerStandard"), "fehler");
    }
  }

  const kachel = "relative flex aspect-[4/3] items-center justify-center overflow-hidden border border-rule bg-plate";

  return (
    <div className="min-w-0">
      {(fotos.length > 0 || sichtbareUploads.length > 0) && (
        <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((foto) => (
            <li key={foto.id} className="min-w-0">
              <div className={kachel}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto.foto_url} alt="" className="h-full w-full object-contain" />
              </div>
              {darfBearbeiten && (
                <button
                  type="button"
                  onClick={() => fotoEntfernen(foto.id)}
                  className="mt-1 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-[2px] border border-rule text-xs text-ink-soft hover:border-critical hover:text-critical"
                >
                  <Icon name="schliessen" size={12} />
                  {t("foerderband.fotoEntfernen")}
                </button>
              )}
            </li>
          ))}
          {sichtbareUploads.map((upload) => (
            <li key={upload.schluessel} className="min-w-0">
              <div className={kachel}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={upload.vorschau}
                  alt=""
                  className={`h-full w-full object-contain ${upload.status === "laeuft" ? "opacity-50" : ""}`}
                />
                <span
                  role="status"
                  className={`absolute inset-x-0 bottom-0 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] ${
                    upload.status === "fehler"
                      ? "bg-critical text-white"
                      : upload.status === "fertig"
                        ? "bg-ok text-white"
                        : "bg-black/60 text-plate-ink"
                  }`}
                >
                  {upload.status === "laeuft"
                    ? t("foerderband.fotoStatusHochladen")
                    : upload.status === "fertig"
                      ? t("foerderband.fotoStatusFertig")
                      : t("foerderband.fotoStatusFehler")}
                </span>
              </div>
              {upload.status === "fehler" && (
                <>
                  <p className="mt-1 break-words text-xs text-critical">{upload.meldung}</p>
                  <button
                    type="button"
                    onClick={() => uploadEntfernen(upload.schluessel)}
                    className="mt-1 min-h-11 w-full rounded-[2px] border border-rule text-xs text-ink-soft"
                  >
                    {t("werksbesichtigungen.entfernenButton")}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {darfBearbeiten && (
        <label className="mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[2px] border border-ink px-4 text-sm font-medium text-ink hover:bg-paper-2 md:w-auto md:self-start">
          <Icon name="foto" size={18} />
          {t("foerderband.fotoAufnehmen")}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              void fotoAusgewaehlt(e.target.files?.[0] ?? null);
              // Gleiche Datei erneut wählbar machen.
              e.target.value = "";
            }}
            className="sr-only"
          />
        </label>
      )}
    </div>
  );
}
