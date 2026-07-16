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
      className="rounded-full p-1.5 text-nav-foreground-soft hover:bg-white/10 hover:text-nav-foreground"
    >
      {modus === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
