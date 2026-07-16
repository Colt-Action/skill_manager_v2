"use client";

import { useState } from "react";
import Link from "next/link";
import { alsGelesenMarkieren, alleAlsGelesenMarkieren } from "@/lib/actions/benachrichtigungen";
import type { Benachrichtigung } from "@/lib/supabase/types";

export default function BenachrichtigungsGlocke({
  benachrichtigungen,
}: {
  benachrichtigungen: Benachrichtigung[];
}) {
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
        className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
        title="Benachrichtigungen"
      >
        🔔
        {ungelesenAnzahl > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {ungelesenAnzahl > 9 ? "9+" : ungelesenAnzahl}
          </span>
        )}
      </button>

      {offen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOffen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-medium text-slate-500">Benachrichtigungen</span>
              {ungelesenAnzahl > 0 && (
                <button
                  type="button"
                  onClick={alleMarkieren}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  Alle als gelesen markieren
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {liste.length === 0 && (
                <p className="px-2 py-4 text-center text-sm text-slate-400">Keine Benachrichtigungen.</p>
              )}
              {liste.map((b) => {
                const inhalt = (
                  <div
                    className={`rounded-lg px-2 py-2 text-sm hover:bg-slate-50 ${
                      b.gelesen ? "text-slate-500" : "font-medium text-slate-900"
                    }`}
                  >
                    <p>{b.nachricht}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
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
