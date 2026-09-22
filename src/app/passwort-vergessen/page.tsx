"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import Link from "next/link";
import { passwortVergessen, type LoginState } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/client";
import { useSprache } from "@/components/SprachProvider";
import LoginSchriftfeld from "@/components/LoginSchriftfeld";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";

const startZustand: LoginState = { fehler: null };
const SPEICHER_SCHLUESSEL = "sm-passwort-reset";

export default function PasswortVergessenSeite() {
  const router = useRouter();
  const { t } = useSprache();
  const [zustand, action, laeuft] = useActionState(passwortVergessen, startZustand);
  // Übersteht einen Tab-Wechsel/Neuladen (z.B. wenn der Nutzer den Tab
  // schließt, um die E-Mail zu lesen, und ihn dann neu öffnet): E-Mail und
  // Schritt werden gespeichert, damit man nicht wieder bei "E-Mail eingeben"
  // landet, obwohl der Code schon verschickt wurde.
  const [email, setEmail] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SPEICHER_SCHLUESSEL) ?? "{}").email ?? "";
    } catch {
      return "";
    }
  });
  const [schritt, setSchritt] = useState<"email" | "code" | "erledigt">(() => {
    try {
      const gespeichert = JSON.parse(sessionStorage.getItem(SPEICHER_SCHLUESSEL) ?? "{}");
      return gespeichert.schritt === "code" ? "code" : "email";
    } catch {
      return "email";
    }
  });
  const [code, setCode] = useState("");
  const [neuesPasswort, setNeuesPasswort] = useState("");
  const [codeFehler, setCodeFehler] = useState<string | null>(null);
  const [codeLaeuft, setCodeLaeuft] = useState(false);

  function schrittSetzenUndSpeichern(neuerSchritt: "email" | "code" | "erledigt", aktuelleEmail: string) {
    setSchritt(neuerSchritt);
    try {
      sessionStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify({ email: aktuelleEmail, schritt: neuerSchritt }));
    } catch {
      // sessionStorage evtl. blockiert - dann gilt der Fortschritt nur für
      // diese Seitenansicht.
    }
  }

  // Sobald der Server Action erfolgreich die E-Mail mit dem Code verschickt
  // hat, zum zweiten Schritt wechseln (Code + neues Passwort eingeben).
  // Vergleich während des Renderns (React-empfohlenes Muster) statt in
  // einem useEffect, um kaskadierende Renders zu vermeiden.
  const [vorherigerHinweis, setVorherigerHinweis] = useState(zustand.hinweis);
  if (zustand.hinweis !== vorherigerHinweis) {
    setVorherigerHinweis(zustand.hinweis);
    if (zustand.hinweis) schrittSetzenUndSpeichern("code", email);
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

    try {
      sessionStorage.removeItem(SPEICHER_SCHLUESSEL);
    } catch {
      // s.o.
    }
    setSchritt("erledigt");
    setTimeout(() => router.push("/"), 2000);
  }

  return (
    <LoginSchriftfeld eyebrow={t("login.eyebrow")} titel={t("passwortVergessen.titel")}>
      {schritt === "email" && (
        <>
          <p className="mt-1 text-sm text-ink-soft">{t("passwortVergessen.untertitel")}</p>
          <form action={action} className="mt-4">
            <DatenblattZeile label={t("login.labelEmail")}>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={eingabeKlasse}
              />
            </DatenblattZeile>
            {zustand.fehler && (
              <p className="mt-3 border-l-[3px] border-critical bg-paper-2 px-3 py-2 text-sm text-critical">
                {zustand.fehler}
              </p>
            )}
            <button
              type="submit"
              disabled={laeuft}
              className="mt-4 w-full rounded-[2px] bg-signal py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:opacity-90 disabled:opacity-50"
            >
              {laeuft ? t("passwortVergessen.sendetLaeuft") : t("passwortVergessen.sendenButton")}
            </button>
          </form>
        </>
      )}

      {schritt === "code" && (
        <>
          <p className="mt-4 border-l-[3px] border-ok bg-paper-2 px-3 py-2 text-sm text-ink">{zustand.hinweis}</p>
          <form onSubmit={codeAbsenden} className="mt-4">
            <DatenblattZeile label={t("passwortVergessen.codeLabel")}>
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={10}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`${eingabeKlasse} text-center font-mono text-lg tracking-[0.2em]`}
                />
                <span className="mt-1 block text-xs text-ink-faint">{t("passwortVergessen.codeHinweis")}</span>
              </div>
            </DatenblattZeile>
            <DatenblattZeile label={t("passwortZuruecksetzen.neuesPasswort")}>
              <div>
                <input
                  type="password"
                  required
                  value={neuesPasswort}
                  onChange={(e) => setNeuesPasswort(e.target.value)}
                  className={eingabeKlasse}
                />
                <span className="mt-1 block text-xs text-ink-faint">{t("login.passwortHinweis")}</span>
              </div>
            </DatenblattZeile>
            {codeFehler && (
              <p className="mt-3 border-l-[3px] border-critical bg-paper-2 px-3 py-2 text-sm text-critical">
                {codeFehler}
              </p>
            )}
            <button
              type="submit"
              disabled={codeLaeuft}
              className="mt-4 w-full rounded-[2px] bg-signal py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:opacity-90 disabled:opacity-50"
            >
              {codeLaeuft ? t("passwortZuruecksetzen.speichertLaeuft") : t("passwortZuruecksetzen.speichernButton")}
            </button>
            <button
              type="button"
              onClick={() => schrittSetzenUndSpeichern("email", email)}
              className="mt-3 w-full text-center text-xs text-ink-soft hover:text-ink"
            >
              {t("passwortVergessen.neuenCodeAnfordern")}
            </button>
          </form>
        </>
      )}

      {schritt === "erledigt" && (
        <p className="mt-4 border-l-[3px] border-ok bg-paper-2 px-3 py-2 text-sm text-ink">
          {t("passwortZuruecksetzen.erledigt")}
        </p>
      )}

      <Link href="/login" className="mt-4 block text-center text-sm text-annot hover:text-ink">
        {t("passwortVergessen.zurueckZumLogin")}
      </Link>
    </LoginSchriftfeld>
  );
}
