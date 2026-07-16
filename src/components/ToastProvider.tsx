"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastArt = "info" | "erfolg" | "fehler";

interface ToastEintrag {
  id: number;
  nachricht: string;
  art: ToastArt;
}

const ToastContext = createContext<((nachricht: string, art?: ToastArt) => void) | null>(null);

// Ersetzt window.alert() durch dezente, zum Design passende Einblendungen,
// die sich nach ein paar Sekunden von selbst wieder ausblenden.
export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast muss innerhalb von ToastProvider verwendet werden.");
  return toast;
}

let naechsteId = 1;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEintrag[]>([]);

  const toast = useCallback((nachricht: string, art: ToastArt = "info") => {
    const id = naechsteId++;
    setToasts((liste) => [...liste, { id, nachricht, art }]);
    setTimeout(() => {
      setToasts((liste) => liste.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-4 md:items-end md:pr-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`w-full max-w-sm rounded-lg px-4 py-2.5 text-sm shadow-lg ring-1 ${
              t.art === "fehler"
                ? "bg-critical/10 text-critical ring-critical/30"
                : t.art === "erfolg"
                  ? "bg-success/10 text-success-ink ring-success/30"
                  : "bg-surface text-foreground ring-line"
            }`}
          >
            {t.nachricht}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
