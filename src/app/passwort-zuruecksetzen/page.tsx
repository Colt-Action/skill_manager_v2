"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSprache } from "@/components/SprachProvider";

export default function PasswortZuruecksetzenSeite() {
  return (
    <Suspense fallback={null}>
      <PasswortZuruecksetzenInhalt />
    </Suspense>
  );
}

function PasswortZuruecksetzenInhalt() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useSprache();
  const code = searchParams.get("code");
  const [passwort, setPasswort] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(() =>
    code ? null : t("passwortZuruecksetzen.fehlerLink"),
  );
  const [erledigt, setErledigt] = useState(false);
  const [sitzungBereit, setSitzungBereit] = useState(false);

  // Der Link aus der E-Mail enthält einen einmaligen "code", der erst gegen
  // eine echte (temporäre) Sitzung eingetauscht werden muss, bevor sich das
  // Passwort ändern lässt - sonst meldet Supabase "Auth session missing".
  useEffect(() => {
    if (!code) return;
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setFehler(t("passwortZuruecksetzen.fehlerLink"));
        return;
      }
      setSitzungBereit(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          ) : !sitzungBereit ? (
            <p className="mt-6 text-sm text-foreground-soft">
              {fehler ? (
                <span className="block rounded-md bg-critical/10 px-3 py-2 text-critical">{fehler}</span>
              ) : (
                t("passwortZuruecksetzen.bereiteVor")
              )}
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
