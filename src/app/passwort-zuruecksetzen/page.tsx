"use client";

import Link from "next/link";
import { useSprache } from "@/components/SprachProvider";
import LoginSchriftfeld from "@/components/LoginSchriftfeld";

// Der Passwort-Reset läuft über einen Code (siehe /passwort-vergessen), nicht
// über einen klickbaren Link - Firmen-Mailscanner (z.B. Outlook Safe Links)
// riefen den Link automatisch auf und verbrauchten dabei den Einmal-Code,
// bevor der Nutzer selbst klickte. Diese Route ist trotzdem das Linkziel im
// E-Mail-Template (falls noch alte E-Mails im Umlauf sind oder jemand den
// Link statt des Codes anklickt) - sie erklärt jetzt aktiv, was zu tun ist,
// statt den Nutzer kommentarlos zu /passwort-vergessen zurückzuschicken.
export default function PasswortZuruecksetzenSeite() {
  const { t } = useSprache();

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
