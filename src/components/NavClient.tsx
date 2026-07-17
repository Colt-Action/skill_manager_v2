"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import BenachrichtigungsGlocke from "@/components/BenachrichtigungsGlocke";
import { logout } from "@/app/login/actions";
import { rollenLabel } from "@/lib/format";
import type { Benachrichtigung } from "@/lib/supabase/types";

interface Props {
  name: string;
  rolle: string;
  avatarUrl: string | null;
  istAdminOderHoeher: boolean;
  istZuschauer: boolean;
  benachrichtigungen: Benachrichtigung[];
}

const ADMIN_LINKS = [
  { href: "/admin", label: "Prüfung & Freigabe" },
  { href: "/admin/loeschanfragen", label: "Löschanfragen" },
  { href: "/admin/teil-anfragen", label: "Teil-Meldungen" },
  { href: "/admin/kategorien", label: "Kategorien & Teile" },
  { href: "/admin/lernpfade", label: "Lernpfade" },
  { href: "/admin/qr-codes", label: "QR-Codes" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/nutzer", label: "Nutzerverwaltung" },
];

const MEHR_LINKS = [
  { href: "/profil", label: "Mein Profil" },
  { href: "/lernpfade", label: "Lernpfade" },
  { href: "/teil-melden", label: "Teil melden" },
];

export default function NavClient({
  name,
  rolle,
  avatarUrl,
  istAdminOderHoeher,
  istZuschauer,
  benachrichtigungen,
}: Props) {
  const [drawerOffen, setDrawerOffen] = useState(false);
  const [adminOffen, setAdminOffen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-nav text-nav-foreground shadow-sm print:hidden">
        <nav className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3">
          <Link
            href="/"
            className="mr-2 flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide"
          >
            <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
            Skill Manager
          </Link>

          {/* Desktop-Links */}
          <div className="hidden items-center gap-1 md:flex">
            <Link href="/" className="rounded-md px-3 py-1.5 text-sm text-nav-foreground-soft hover:bg-white/10 hover:text-nav-foreground">
              Dashboard
            </Link>
            <Link href="/videothek" className="rounded-md px-3 py-1.5 text-sm text-nav-foreground-soft hover:bg-white/10 hover:text-nav-foreground">
              Videothek
            </Link>
            {!istZuschauer && (
              <Link href="/upload" className="rounded-md px-3 py-1.5 text-sm text-nav-foreground-soft hover:bg-white/10 hover:text-nav-foreground">
                Hochladen
              </Link>
            )}
            <Link href="/favoriten" className="rounded-md px-3 py-1.5 text-sm text-nav-foreground-soft hover:bg-white/10 hover:text-nav-foreground">
              Merkliste
            </Link>
            <Link href="/teil-melden" className="rounded-md px-3 py-1.5 text-sm text-nav-foreground-soft hover:bg-white/10 hover:text-nav-foreground">
              Teil melden
            </Link>
            <Link href="/lernpfade" className="rounded-md px-3 py-1.5 text-sm text-nav-foreground-soft hover:bg-white/10 hover:text-nav-foreground">
              Lernpfade
            </Link>

            {istAdminOderHoeher && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAdminOffen((o) => !o)}
                  className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-nav-foreground-soft hover:bg-white/10 hover:text-nav-foreground"
                >
                  Verwaltung <span className="text-xs">▾</span>
                </button>
                {adminOffen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAdminOffen(false)} />
                    <div className="absolute left-0 z-20 mt-1 w-56 rounded-lg bg-surface p-1.5 text-foreground shadow-lg ring-1 ring-line">
                      {ADMIN_LINKS.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setAdminOffen(false)}
                          className="block rounded-md px-2.5 py-1.5 text-sm hover:bg-background"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <form action="/videothek" className="ml-2 hidden lg:block">
            <input
              type="search"
              name="q"
              placeholder="Suche …"
              className="w-40 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-nav-foreground placeholder:text-nav-foreground-soft outline-none focus:border-accent focus:bg-white/10"
            />
          </form>

          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <BenachrichtigungsGlocke benachrichtigungen={benachrichtigungen} />

            {/* Profil - Desktop */}
            <Link
              href="/profil"
              className="hidden items-center gap-2 rounded-md px-2 py-1 text-sm text-nav-foreground-soft hover:bg-white/10 hover:text-nav-foreground md:flex"
            >
              <Avatar name={name} avatarUrl={avatarUrl} />
              <span>
                {name} <span className="font-mono text-xs opacity-70">· {rollenLabel(rolle)}</span>
              </span>
            </Link>
            <form action={logout} className="hidden md:block">
              <button
                type="submit"
                className="rounded-md border border-white/15 px-3 py-1 text-sm text-nav-foreground-soft hover:bg-white/10 hover:text-nav-foreground"
              >
                Logout
              </button>
            </form>
          </div>
        </nav>
      </header>

      {/* Mobile Bottom-Tab-Bar – ersetzt das alte Hamburger-Menü, damit sich
          die App auf dem Handy wie eine "echte" App bedient (Daumen-Reichweite). */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-line bg-nav pb-[env(safe-area-inset-bottom)] text-nav-foreground-soft md:hidden print:hidden">
        <TabLink href="/" icon="🏠" label="Start" />
        <TabLink href="/videothek" icon="🔍" label="Videothek" />
        {!istZuschauer && (
          <Link href="/upload" className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-lg text-accent-ink shadow-md">
              +
            </span>
            <span className="text-[10px] font-medium">Hochladen</span>
          </Link>
        )}
        <TabLink href="/favoriten" icon="⭐" label="Merkliste" />
        <button
          type="button"
          onClick={() => setDrawerOffen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs"
        >
          <span className="text-lg leading-none">☰</span>
          <span className="text-[10px] font-medium">Mehr</span>
        </button>
      </nav>

      {/* "Mehr"-Schublade: Profil, Teil melden, Admin-Links, Logout – bleibt
          immer im DOM und wird nur per Transition ein-/ausgeblendet, statt
          hart zu erscheinen/verschwinden. */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${
          drawerOffen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOffen(false)} />
        <div
          className={`absolute right-0 top-0 h-full w-72 overflow-y-auto bg-surface p-4 text-foreground shadow-xl transition-transform duration-300 ease-out ${
            drawerOffen ? "translate-x-0" : "translate-x-full"
          }`}
        >
            <div className="flex items-center justify-between">
              <Link href="/profil" className="flex items-center gap-2" onClick={() => setDrawerOffen(false)}>
                <Avatar name={name} avatarUrl={avatarUrl} />
                <span className="text-sm font-medium">
                  {name}
                  <span className="block font-mono text-xs text-foreground-soft">{rollenLabel(rolle)}</span>
                </span>
              </Link>
              <button type="button" onClick={() => setDrawerOffen(false)} className="p-1.5" aria-label="Menü schließen">
                ✕
              </button>
            </div>

            <form action="/videothek" className="mt-5">
              <input
                type="search"
                name="q"
                placeholder="Suche in der Videothek …"
                className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-soft outline-none focus:border-accent"
              />
            </form>

            <div className="mt-3 flex flex-col gap-0.5">
              {MEHR_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setDrawerOffen(false)}
                  className="rounded-md px-3 py-2 text-sm hover:bg-background"
                >
                  {l.label}
                </Link>
              ))}

              {istAdminOderHoeher && (
                <>
                  <p className="mt-3 px-3 font-mono text-xs uppercase tracking-wide text-foreground-soft">
                    Verwaltung
                  </p>
                  {ADMIN_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setDrawerOffen(false)}
                      className="rounded-md px-3 py-2 text-sm hover:bg-background"
                    >
                      {l.label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            <form action={logout} className="mt-5 border-t border-line pt-4">
              <button
                type="submit"
                className="w-full rounded-md border border-line px-3 py-2 text-left text-sm text-foreground-soft hover:bg-background"
              >
                Logout
              </button>
            </form>
          </div>
      </div>
    </>
  );
}

function TabLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs">
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-white/20" />;
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink">
      {name?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}
