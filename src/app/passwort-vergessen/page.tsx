"use client";

import { useActionState } from "react";
import Link from "next/link";
import { passwortVergessen, type LoginState } from "@/app/login/actions";
import { useSprache } from "@/components/SprachProvider";
import SpracheAuswahl from "@/components/SpracheAuswahl";

const startZustand: LoginState = { fehler: null };

export default function PasswortVergessenSeite() {
  const { t } = useSprache();
  const [zustand, action, laeuft] = useActionState(passwortVergessen, startZustand);

  return (
    <div className="flex min-h-screen items-center justify-center bg-nav px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-3 flex justify-end">
          <SpracheAuswahl className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-nav-foreground outline-none" />
        </div>
        <div className="rounded-2xl bg-surface p-8 text-foreground shadow-2xl ring-1 ring-line">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("login.eyebrow")}</p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-wrap-balance">
            {t("passwortVergessen.titel")}
          </h1>
          <p className="mt-1 text-sm text-foreground-soft">{t("passwortVergessen.untertitel")}</p>

          {zustand.hinweis ? (
            <p className="mt-6 rounded-md bg-success/10 px-3 py-2 text-sm text-success-ink">{zustand.hinweis}</p>
          ) : (
            <form action={action} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-foreground-soft">{t("login.labelEmail")}</span>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </label>
              {zustand.fehler && (
                <p className="rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">{zustand.fehler}</p>
              )}
              <button
                type="submit"
                disabled={laeuft}
                className="w-full rounded-lg bg-accent py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
              >
                {laeuft ? t("passwortVergessen.sendetLaeuft") : t("passwortVergessen.sendenButton")}
              </button>
            </form>
          )}

          <Link href="/login" className="mt-4 block text-center text-sm text-accent hover:text-accent-deep">
            {t("passwortVergessen.zurueckZumLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
