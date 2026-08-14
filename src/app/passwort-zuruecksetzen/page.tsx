"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Der Passwort-Reset läuft seit Phase 25 über einen Code (siehe
// /passwort-vergessen), nicht mehr über einen klickbaren Link - Firmen-
// Mailscanner (z.B. Outlook Safe Links) riefen den Link automatisch auf
// und verbrauchten dabei den Einmal-Code, bevor der Nutzer selbst klickte.
// Diese Route bleibt als Weiterleitung bestehen, falls noch alte E-Mails
// mit dem früheren Link im Umlauf sind.
export default function PasswortZuruecksetzenSeite() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/passwort-vergessen");
  }, [router]);

  return null;
}
