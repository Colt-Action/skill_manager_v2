"use client";

import { useState } from "react";
import Link from "next/link";
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
        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-background text-foreground-soft hover:text-foreground"
        title={t("benachrichtigungen.titel")}
      >
        🔔
        {ungelesenAnzahl > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-critical text-[10px] text-white">
            {ungelesenAnzahl > 9 ? "9+" : ungelesenAnzahl}
          </span>
        )}
      </button>

      {offen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOffen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl bg-surface p-2 text-foreground shadow-lg ring-1 ring-line">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="font-mono text-xs uppercase tracking-wide text-foreground-soft">
                {t("benachrichtigungen.titel")}
              </span>
              {ungelesenAnzahl > 0 && (
                <button
                  type="button"
                  onClick={alleMarkieren}
                  className="text-xs text-foreground-soft hover:text-accent"
                >
                  {t("benachrichtigungen.alleAlsGelesen")}
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {liste.length === 0 && (
                <p className="px-2 py-4 text-center text-sm text-foreground-soft">{t("benachrichtigungen.keine")}</p>
              )}
              {liste.map((b) => {
                const inhalt = (
                  <div
                    className={`rounded-lg px-2 py-2 text-sm hover:bg-background ${
                      b.gelesen ? "text-foreground-soft" : "font-medium text-foreground"
                    }`}
                  >
                    <p>{b.nachricht}</p>
                    <p className="mt-0.5 font-mono text-xs text-foreground-soft">
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
