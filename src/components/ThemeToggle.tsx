"use client";

import { useState } from "react";

export default function ThemeToggle() {
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
      title={modus === "dark" ? "Helles Design" : "Dunkles Design"}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.055] text-[var(--nav-console-foreground-soft)] hover:text-[var(--nav-console-foreground)]"
    >
      {modus === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
