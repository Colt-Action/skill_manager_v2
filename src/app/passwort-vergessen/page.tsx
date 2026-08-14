"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import Link from "next/link";
import { passwortVergessen, type LoginState } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/client";
import { useSprache } from "@/components/SprachProvider";
import SpracheAuswahl from "@/components/SpracheAuswahl";

const startZustand: LoginState = { fehler: null };

export default function PasswortVergessenSeite() {
  const router = useRouter();
  const { t } = useSprache();
  const [zustand, action, laeuft] = useActionState(passwortVergessen, startZustand);
  const [email, setEmail] = useState("");
  const [schritt, setSchritt] = useState<"email" | "code" | "erledigt">("email");
  const [code, setCode] = useState("");
  const [neuesPasswort, setNeuesPasswort] = useState("");
  const [codeFehler, setCodeFehler] = useState<string | null>(null);
  const [codeLaeuft, setCodeLaeuft] = useState(false);

  // Sobald der Server Action erfolgreich die E-Mail mit dem Code verschickt
  // hat, zum zweiten Schritt wechseln (Code + neues Passwort eingeben).
  // Vergleich während des Renderns (React-empfohlenes Muster) statt in
  // einem useEffect, um kaskadierende Renders zu vermeiden.
  const [vorherigerHinweis, setVorherigerHinweis] = useState(zustand.hinweis);
  if (zustand.hinweis !== vorherigerHinweis) {
    setVorherigerHinweis(zustand.hinweis);
    if (zustand.hinweis) setSchritt("code");
  }

  async function codeAbsenden(e: React.FormEvent) {
    e.preventDefault();
    if (neuesPasswort.length < 6) {
      setCodeFehler(t("login.passwortHinweis"));
      return;
    }
    setCodeLaeuft(true);
    setCodeFehler(null);

    const supabase = createClient();
    const { error: verifyFehler } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "recovery",
    });
    if (verifyFehler) {
      setCodeLaeuft(false);
      setCodeFehler(t("passwortVergessen.codeUngueltig"));
      return;
    }

    const { error: updateFehler } = await supabase.auth.updateUser({ password: neuesPasswort });
    setCodeLaeuft(false);
    if (updateFehler) {
      setCodeFehler(updateFehler.message);
      return;
    }

    setSchritt("erledigt");
    setTimeout(() => router.push("/"), 2000);
  }

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

          {schritt === "email" && (
            <>
              <p className="mt-1 text-sm text-foreground-soft">{t("passwortVergessen.untertitel")}</p>
              <form action={action} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-foreground-soft">{t("login.labelEmail")}</span>
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
            </>
          )}

          {schritt === "code" && (
            <>
              <p className="mt-6 rounded-md bg-success/10 px-3 py-2 text-sm text-success-ink">{zustand.hinweis}</p>
              <form onSubmit={codeAbsenden} className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-foreground-soft">{t("passwortVergessen.codeLabel")}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-center font-mono text-lg tracking-[0.3em] text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <span className="mt-1 block text-xs text-foreground-soft">{t("passwortVergessen.codeHinweis")}</span>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-foreground-soft">{t("passwortZuruecksetzen.neuesPasswort")}</span>
                  <input
                    type="password"
                    required
                    value={neuesPasswort}
                    onChange={(e) => setNeuesPasswort(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <span className="mt-1 block text-xs text-foreground-soft">{t("login.passwortHinweis")}</span>
                </label>
                {codeFehler && (
                  <p className="rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">{codeFehler}</p>
                )}
                <button
                  type="submit"
                  disabled={codeLaeuft}
                  className="w-full rounded-lg bg-accent py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
                >
                  {codeLaeuft ? t("passwortZuruecksetzen.speichertLaeuft") : t("passwortZuruecksetzen.speichernButton")}
                </button>
                <button
                  type="button"
                  onClick={() => setSchritt("email")}
                  className="w-full text-center text-xs text-foreground-soft hover:text-accent"
                >
                  {t("passwortVergessen.neuenCodeAnfordern")}
                </button>
              </form>
            </>
          )}

          {schritt === "erledigt" && (
            <p className="mt-6 rounded-md bg-success/10 px-3 py-2 text-sm text-success-ink">
              {t("passwortZuruecksetzen.erledigt")}
            </p>
          )}

          <Link href="/login" className="mt-4 block text-center text-sm text-accent hover:text-accent-deep">
            {t("passwortVergessen.zurueckZumLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
