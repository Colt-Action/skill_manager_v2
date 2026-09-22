"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSprache } from "@/components/SprachProvider";
import LoginSchriftfeld from "@/components/LoginSchriftfeld";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";

// Ziel des Links aus der Passwort-vergessen-E-Mail. Supabase tauscht den
// Token im Hintergrund (GoTrue-eigene /auth/v1/verify-Route) gegen einen
// PKCE-"code" in der URL dieser Seite - erst hier, im Browser, muss dieser
// Code per exchangeCodeForSession() gegen eine echte Recovery-Sitzung
// eingelöst werden. Ohne diesen Schritt landet man zwar auf der Seite,
// hat aber nie eine Sitzung und kann kein neues Passwort setzen - das war
// der eigentliche Fehler, nicht nur eine fehlende Erklärung.
//
// Klappt der Link aus irgendeinem Grund nicht (abgelaufen, von einem
// Firmen-Mailscanner bereits verbraucht, o.ä.), bleibt der 6-stellige
// Code aus derselben E-Mail als Ausweichweg über /passwort-vergessen.
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
  const [status, setStatus] = useState<"prueft" | "bereit" | "fehlgeschlagen">("prueft");
  const [neuesPasswort, setNeuesPasswort] = useState("");
  const [speichert, setSpeichert] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [erledigt, setErledigt] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let aktiv = true;

    // Zuständig für den Hash-Fragment-Fall (#access_token=...&type=recovery):
    // der Browser-Client verarbeitet das beim Erstellen automatisch und
    // meldet sich hier über den Auth-Listener.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (!aktiv) return;
      if (event === "PASSWORD_RECOVERY") setStatus("bereit");
    });

    async function pruefen() {
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!aktiv) return;
        if (!error) {
          setStatus("bereit");
          return;
        }
      }

      // Falls schon eine gültige Recovery-Sitzung besteht (z.B. durch den
      // Auth-Listener oben schon gesetzt), nicht erneut auf "fehlgeschlagen"
      // zurückfallen.
      const { data } = await supabase.auth.getSession();
      if (!aktiv) return;
      if (data.session) {
        setStatus("bereit");
      } else {
        setStatus((s) => (s === "bereit" ? s : "fehlgeschlagen"));
      }
    }

    pruefen();

    return () => {
      aktiv = false;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (neuesPasswort.length < 6) {
      setFehler(t("login.passwortHinweis"));
      return;
    }
    setSpeichert(true);
    setFehler(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: neuesPasswort });
    setSpeichert(false);

    if (error) {
      setFehler(error.message);
      return;
    }

    setErledigt(true);
    setTimeout(() => router.push("/"), 2000);
  }

  if (status === "prueft") {
    return (
      <LoginSchriftfeld eyebrow={t("login.eyebrow")} titel={t("passwortZuruecksetzen.titel")}>
        <p className="mt-3 text-sm text-ink-soft">{t("passwortZuruecksetzen.bereiteVor")}</p>
      </LoginSchriftfeld>
    );
  }

  if (status === "fehlgeschlagen") {
    return (
      <LoginSchriftfeld eyebrow={t("login.eyebrow")} titel={t("passwortZuruecksetzen.linkHinweisTitel")}>
        <p className="mt-3 text-sm text-ink-soft">{t("passwortZuruecksetzen.linkHinweisText")}</p>
        <Link
          href="/passwort-vergessen"
          className="mt-4 block w-full rounded-[2px] bg-signal py-2 text-center text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:opacity-90"
        >
          {t("passwortZuruecksetzen.neuenCodeAnfordern")}
        </Link>
        <Link href="/login" className="mt-4 block text-center text-sm text-annot hover:text-ink">
          {t("passwortVergessen.zurueckZumLogin")}
        </Link>
      </LoginSchriftfeld>
    );
  }

  if (erledigt) {
    return (
      <LoginSchriftfeld eyebrow={t("login.eyebrow")} titel={t("passwortZuruecksetzen.titel")}>
        <p className="mt-4 border-l-[3px] border-ok bg-paper-2 px-3 py-2 text-sm text-ink">
          {t("passwortZuruecksetzen.erledigt")}
        </p>
      </LoginSchriftfeld>
    );
  }

  return (
    <LoginSchriftfeld eyebrow={t("login.eyebrow")} titel={t("passwortZuruecksetzen.titel")}>
      <form onSubmit={absenden} className="mt-4">
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
        {fehler && (
          <p className="mt-3 border-l-[3px] border-critical bg-paper-2 px-3 py-2 text-sm text-critical">{fehler}</p>
        )}
        <button
          type="submit"
          disabled={speichert}
          className="mt-4 w-full rounded-[2px] bg-signal py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:opacity-90 disabled:opacity-50"
        >
          {speichert ? t("passwortZuruecksetzen.speichertLaeuft") : t("passwortZuruecksetzen.speichernButton")}
        </button>
      </form>
    </LoginSchriftfeld>
  );
}
