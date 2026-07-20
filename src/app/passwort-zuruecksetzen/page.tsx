"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSprache } from "@/components/SprachProvider";

export default function PasswortZuruecksetzenSeite() {
  const router = useRouter();
  const { t } = useSprache();
  const [passwort, setPasswort] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [erledigt, setErledigt] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (passwort.length < 6) {
      setFehler(t("login.passwortHinweis"));
      return;
    }
    setLaeuft(true);
    setFehler(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwort });
    setLaeuft(false);
    if (error) {
      setFehler(error.message);
      return;
    }
    setErledigt(true);
    setTimeout(() => router.push("/"), 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-nav px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-surface p-8 text-foreground shadow-2xl ring-1 ring-line">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("login.eyebrow")}</p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-wrap-balance">
            {t("passwortZuruecksetzen.titel")}
          </h1>

          {erledigt ? (
            <p className="mt-6 rounded-md bg-success/10 px-3 py-2 text-sm text-success-ink">
              {t("passwortZuruecksetzen.erledigt")}
            </p>
          ) : (
            <form onSubmit={absenden} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-foreground-soft">{t("passwortZuruecksetzen.neuesPasswort")}</span>
                <input
                  type="password"
                  value={passwort}
                  onChange={(e) => setPasswort(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <span className="mt-1 block text-xs text-foreground-soft">{t("login.passwortHinweis")}</span>
              </label>
              {fehler && <p className="rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">{fehler}</p>}
              <button
                type="submit"
                disabled={laeuft}
                className="w-full rounded-lg bg-accent py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
              >
                {laeuft ? t("passwortZuruecksetzen.speichertLaeuft") : t("passwortZuruecksetzen.speichernButton")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
