"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { login, registrieren, type LoginState } from "./actions";

const startZustand: LoginState = { fehler: null };

export default function LoginSeite() {
  return (
    <Suspense fallback={null}>
      <LoginInhalt />
    </Suspense>
  );
}

function LoginInhalt() {
  const [modus, setModus] = useState<"login" | "registrieren">("login");
  const [loginZustand, loginAction, loginLaeuft] = useActionState(login, startZustand);
  const [regZustand, regAction, regLaeuft] = useActionState(registrieren, startZustand);
  const searchParams = useSearchParams();
  const istDeaktiviert = searchParams.get("deaktiviert") === "1";

  const zustand = modus === "login" ? loginZustand : regZustand;

  return (
    <div className="flex min-h-screen items-center justify-center bg-nav px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 text-foreground shadow-2xl ring-1 ring-line">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Werkstatt-Zugang</p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-wrap-balance">
          Skill Manager
        </h1>
        <p className="mt-1 text-sm text-foreground-soft">
          Erklärvideos zu Maschinenteilen – schnell finden, schnell verstehen.
        </p>

        <div className="mt-6 flex rounded-lg bg-background p-1 text-sm ring-1 ring-line">
          <button
            type="button"
            onClick={() => setModus("login")}
            className={`flex-1 rounded-md py-1.5 font-semibold transition ${
              modus === "login" ? "bg-accent text-accent-ink" : "text-foreground-soft"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setModus("registrieren")}
            className={`flex-1 rounded-md py-1.5 font-semibold transition ${
              modus === "registrieren" ? "bg-accent text-accent-ink" : "text-foreground-soft"
            }`}
          >
            Registrieren
          </button>
        </div>

        {modus === "login" ? (
          <form action={loginAction} className="mt-6 space-y-4">
            <Feld label="E-Mail" name="email" type="email" />
            <Feld label="Passwort" name="passwort" type="password" />
            <button
              type="submit"
              disabled={loginLaeuft}
              className="w-full rounded-lg bg-accent py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
            >
              {loginLaeuft ? "Einloggen…" : "Einloggen"}
            </button>
          </form>
        ) : (
          <form action={regAction} className="mt-6 space-y-4">
            <Feld label="Name" name="name" type="text" />
            <Feld label="E-Mail" name="email" type="email" />
            <Feld label="Passwort" name="passwort" type="password" hinweis="mind. 6 Zeichen" />
            <Feld
              label="Zugangscode"
              name="zugangscode"
              type="text"
              hinweis="Frag deinen Admin nach dem Firmen-Zugangscode"
            />
            <p className="text-xs text-foreground-soft">
              Neue Konten starten automatisch mit der Rolle „Techniker&ldquo;.
            </p>
            <button
              type="submit"
              disabled={regLaeuft}
              className="w-full rounded-lg bg-accent py-2 text-sm font-bold uppercase tracking-wide text-accent-ink transition hover:bg-accent-deep disabled:opacity-50"
            >
              {regLaeuft ? "Registrieren…" : "Konto erstellen"}
            </button>
          </form>
        )}

        {istDeaktiviert && (
          <p className="mt-4 rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">
            Dieses Konto wurde deaktiviert. Wende dich an deinen Admin.
          </p>
        )}
        {zustand.fehler && (
          <p className="mt-4 rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">
            {zustand.fehler}
          </p>
        )}
        {zustand.hinweis && (
          <p className="mt-4 rounded-md bg-accent/10 px-3 py-2 text-sm text-accent-deep">
            {zustand.hinweis}
          </p>
        )}
      </div>
    </div>
  );
}

function Feld({
  label,
  name,
  type,
  hinweis,
}: {
  label: string;
  name: string;
  type: string;
  hinweis?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground-soft">{label}</span>
      <input
        name={name}
        type={type}
        required
        className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
      {hinweis && <span className="mt-1 block text-xs text-foreground-soft">{hinweis}</span>}
    </label>
  );
}
