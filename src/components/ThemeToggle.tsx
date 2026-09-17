"use client";

import { useState } from "react";
import Icon from "@/components/icons/Icon";
import { useSprache } from "@/components/SprachProvider";

// Zeile im Profil-Popover statt eigenständigem Icon-Knopf in der Kopfleiste
// (Designkonzept "Typenschild" Rev. 02: Theme wandert ins Profil-Menü,
// Sprache bleibt in der Leiste sichtbar).
export default function ThemeToggle() {
  const { t } = useSprache();
  const [modus, setModus] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light",
  );

  function umschalten() {
    const neu = modus === "dark" ? "light" : "dark";
    setModus(neu);
    document.documentElement.setAttribute("data-theme", neu);
    try {
      localStorage.setItem("sm-theme", neu);
    } catch {
      // Falls localStorage blockiert ist (z.B. private Browsing) - egal,
      // die Auswahl gilt dann nur für diesen Seitenaufruf.
    }
  }

  return (
    <button
      type="button"
      onClick={umschalten}
      className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left text-sm text-ink hover:bg-paper-2"
    >
      <Icon name={modus === "dark" ? "sonne" : "mond"} size={18} />
      {modus === "dark" ? t("nav.themeHell") : t("nav.themeDunkel")}
    </button>
  );
}
