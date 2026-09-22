"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/icons/Icon";
import { alsGelesenMarkieren, alleAlsGelesenMarkieren } from "@/lib/actions/benachrichtigungen";
import { useSprache } from "@/components/SprachProvider";
import type { Benachrichtigung } from "@/lib/supabase/types";

export default function BenachrichtigungsGlocke({
  benachrichtigungen,
}: {
  benachrichtigungen: Benachrichtigung[];
}) {
  const { t } = useSprache();
  const [liste, setListe] = useState(benachrichtigungen);
  const [offen, setOffen] = useState(false);
  const ungelesenAnzahl = liste.filter((b) => !b.gelesen).length;

  async function klick(b: Benachrichtigung) {
    if (!b.gelesen) {
      setListe((alt) => alt.map((x) => (x.id === b.id ? { ...x, gelesen: true } : x)));
      await alsGelesenMarkieren(b.id);
    }
    setOffen(false);
  }

  async function alleMarkieren() {
    setListe((alt) => alt.map((x) => ({ ...x, gelesen: true })));
    await alleAlsGelesenMarkieren();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center text-plate-soft hover:text-plate-ink"
        aria-label={t("benachrichtigungen.titel")}
        title={t("benachrichtigungen.titel")}
      >
        <Icon name="glocke" size={19} />
        {ungelesenAnzahl > 0 && (
          <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-critical text-[9px] text-white">
            {ungelesenAnzahl > 9 ? "9+" : ungelesenAnzahl}
          </span>
        )}
      </button>

      {offen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOffen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] border border-rule bg-paper p-2 text-ink shadow-[0_12px_32px_-12px_rgba(21,22,26,.35)]">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                {t("benachrichtigungen.titel")}
              </span>
              {ungelesenAnzahl > 0 && (
                <button type="button" onClick={alleMarkieren} className="text-xs text-ink-soft hover:text-signal">
                  {t("benachrichtigungen.alleAlsGelesen")}
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {liste.length === 0 && (
                <p className="px-2 py-4 text-center text-sm text-ink-soft">{t("benachrichtigungen.keine")}</p>
              )}
              {liste.map((b) => {
                const inhalt = (
                  <div className={`px-2 py-2 text-sm hover:bg-paper-2 ${b.gelesen ? "text-ink-soft" : "font-medium text-ink"}`}>
                    <p>{b.nachricht}</p>
                    <p className="mt-0.5 font-mono text-xs text-ink-soft">
                      {new Date(b.erstellt_am).toLocaleString("de-DE")}
                    </p>
                  </div>
                );
                return b.link ? (
                  <Link key={b.id} href={b.link} onClick={() => klick(b)}>
                    {inhalt}
                  </Link>
                ) : (
                  <div key={b.id} onClick={() => klick(b)} className="cursor-pointer">
                    {inhalt}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
