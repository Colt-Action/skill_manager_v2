"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, registrieren, type LoginState } from "./actions";
import { useSprache } from "@/components/SprachProvider";
import LoginSchriftfeld from "@/components/LoginSchriftfeld";
import { DatenblattZeile, eingabeKlasse } from "@/components/Datenblatt";

const startZustand: LoginState = { fehler: null };

export default function LoginSeite() {
  return (
    <Suspense fallback={null}>
      <LoginInhalt />
    </Suspense>
  );
}

function LoginInhalt() {
  const { t } = useSprache();
  const [modus, setModus] = useState<"login" | "registrieren">("login");
  const [loginZustand, loginAction, loginLaeuft] = useActionState(login, startZustand);
  const [regZustand, regAction, regLaeuft] = useActionState(registrieren, startZustand);
  const searchParams = useSearchParams();
  const istDeaktiviert = searchParams.get("deaktiviert") === "1";

  const zustand = modus === "login" ? loginZustand : regZustand;

  return (
    <LoginSchriftfeld eyebrow={t("login.eyebrow")} titel={t("login.titel")} untertitel={t("login.untertitel")}>
      <div className="mt-6 flex border-b border-rule text-sm">
        <button
          type="button"
          onClick={() => setModus("login")}
          className={`flex-1 border-b-2 py-2 font-semibold ${
            modus === "login" ? "border-signal text-ink" : "border-transparent text-ink-soft"
          }`}
        >
          {t("login.tabLogin")}
        </button>
        <button
          type="button"
          onClick={() => setModus("registrieren")}
          className={`flex-1 border-b-2 py-2 font-semibold ${
            modus === "registrieren" ? "border-signal text-ink" : "border-transparent text-ink-soft"
          }`}
        >
          {t("login.tabRegistrieren")}
        </button>
      </div>

      {modus === "login" ? (
        <form action={loginAction} className="mt-4">
          <Feld label={t("login.labelEmail")} name="email" type="email" />
          <Feld label={t("login.labelPasswort")} name="passwort" type="password" />
          <button
            type="submit"
            disabled={loginLaeuft}
            className="mt-4 w-full rounded-[2px] bg-signal py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:opacity-90 disabled:opacity-50"
          >
            {loginLaeuft ? t("login.buttonEinloggenLaeuft") : t("login.buttonEinloggen")}
          </button>
          <Link href="/passwort-vergessen" className="mt-3 block text-center text-sm text-annot hover:text-ink">
            {t("login.passwortVergessen")}
          </Link>
        </form>
      ) : (
        <form action={regAction} className="mt-4">
          <Feld label={t("login.labelName")} name="name" type="text" />
          <Feld label={t("login.labelEmail")} name="email" type="email" />
          <Feld label={t("login.labelPasswort")} name="passwort" type="password" hinweis={t("login.passwortHinweis")} />
          <Feld
            label={t("login.labelZugangscode")}
            name="zugangscode"
            type="text"
            hinweis={t("login.zugangscodeHinweis")}
          />
          <p className="mt-3 text-xs text-ink-faint">{t("login.rolleHinweis")}</p>
          <button
            type="submit"
            disabled={regLaeuft}
            className="mt-4 w-full rounded-[2px] bg-signal py-2 text-sm font-bold uppercase tracking-wide text-signal-ink transition hover:opacity-90 disabled:opacity-50"
          >
            {regLaeuft ? t("login.buttonRegistrierenLaeuft") : t("login.buttonRegistrieren")}
          </button>
        </form>
      )}

      {istDeaktiviert && (
        <p className="mt-4 border-l-[3px] border-critical bg-paper-2 px-3 py-2 text-sm text-critical">
          {t("login.deaktiviertHinweis")}
        </p>
      )}
      {zustand.fehler && (
        <p className="mt-4 border-l-[3px] border-critical bg-paper-2 px-3 py-2 text-sm text-critical">
          {zustand.fehler}
        </p>
      )}
      {zustand.hinweis && (
        <p className="mt-4 border-l-[3px] border-ok bg-paper-2 px-3 py-2 text-sm text-ink">{zustand.hinweis}</p>
      )}
    </LoginSchriftfeld>
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
    <DatenblattZeile label={label}>
      <div>
        <input name={name} type={type} required className={eingabeKlasse} />
        {hinweis && <span className="mt-1 block text-xs text-ink-faint">{hinweis}</span>}
      </div>
    </DatenblattZeile>
  );
}
