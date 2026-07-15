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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Skill Manager</h1>
        <p className="mt-1 text-sm text-slate-500">
          Erklärvideos zu Maschinenteilen – schnell finden, schnell verstehen.
        </p>

        <div className="mt-6 flex rounded-lg bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setModus("login")}
            className={`flex-1 rounded-md py-1.5 font-medium transition ${
              modus === "login" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setModus("registrieren")}
            className={`flex-1 rounded-md py-1.5 font-medium transition ${
              modus === "registrieren" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
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
              className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
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
            <p className="text-xs text-slate-400">
              Neue Konten starten automatisch mit der Rolle &bdquo;Techniker&ldquo;.
            </p>
            <button
              type="submit"
              disabled={regLaeuft}
              className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {regLaeuft ? "Registrieren…" : "Konto erstellen"}
            </button>
          </form>
        )}

        {istDeaktiviert && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Dieses Konto wurde deaktiviert. Wende dich an deinen Admin.
          </p>
        )}
        {zustand.fehler && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {zustand.fehler}
          </p>
        )}
        {zustand.hinweis && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
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
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
      />
      {hinweis && <span className="mt-1 block text-xs text-slate-400">{hinweis}</span>}
    </label>
  );
}
