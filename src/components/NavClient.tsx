"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import SpracheAuswahl from "@/components/SpracheAuswahl";
import BenachrichtigungsGlocke from "@/components/BenachrichtigungsGlocke";
import Icon, { type IconName } from "@/components/icons/Icon";
import { useSprache } from "@/components/SprachProvider";
import { logout } from "@/app/login/actions";
import { rollenLabel } from "@/lib/format";
import type { Benachrichtigung } from "@/lib/supabase/types";

interface Props {
  name: string;
  rolle: string;
  avatarUrl: string | null;
  istAdminOderHoeher: boolean;
  istSuperadmin: boolean;
  istZuschauer: boolean;
  benachrichtigungen: Benachrichtigung[];
}

const ADMIN_LINK_SCHLUESSEL = [
  { href: "/admin", schluessel: "admin.pruefungFreigabe" },
  { href: "/admin/videos", schluessel: "admin.alleVideosBearbeiten" },
  { href: "/admin/referenzen", schluessel: "admin.alleReferenzenBearbeiten" },
  { href: "/admin/loeschanfragen", schluessel: "admin.loeschanfragen" },
  { href: "/admin/teil-anfragen", schluessel: "admin.teilMeldungen" },
  { href: "/admin/kategorien", schluessel: "admin.kategorienTeile" },
  { href: "/admin/uebersetzungen", schluessel: "uebersetzungen.seitenTitel" },
  { href: "/admin/lernpfade", schluessel: "nav.lernpfade" },
  { href: "/admin/qr-codes", schluessel: "admin.qrCodes" },
  { href: "/admin/analytics", schluessel: "admin.analytics" },
  { href: "/admin/nutzer", schluessel: "admin.nutzerverwaltung" },
];

const SUPERADMIN_LINK_SCHLUESSEL = [
  { href: "/admin/zugangscodes", schluessel: "zugangscodes.seitenTitel" },
];

const MEHR_LINK_SCHLUESSEL = [
  { href: "/referenzbereich", schluessel: "nav.referenzbereich" },
  { href: "/favoriten", schluessel: "nav.merkliste" },
  { href: "/profil", schluessel: "nav.meinProfil" },
  { href: "/lernpfade", schluessel: "nav.lernpfade" },
  { href: "/merkteams", schluessel: "nav.merkteams" },
  { href: "/teil-melden", schluessel: "nav.teilMelden" },
];

const MOBILE_TABS = [
  { href: "/", schluessel: "nav.start", icon: "start" as const },
  { href: "/videothek", schluessel: "nav.videothek", icon: "suche" as const },
];

function istAktiv(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function NavClient({
  name,
  rolle,
  avatarUrl,
  istAdminOderHoeher,
  istSuperadmin,
  istZuschauer,
  benachrichtigungen,
}: Props) {
  const { t } = useSprache();
  const pathname = usePathname();
  const [drawerOffen, setDrawerOffen] = useState(false);
  const [adminOffen, setAdminOffen] = useState(false);
  const [profilOffen, setProfilOffen] = useState(false);

  const adminLinks = [
    ...ADMIN_LINK_SCHLUESSEL,
    ...(istSuperadmin ? SUPERADMIN_LINK_SCHLUESSEL : []),
  ].map((l) => ({ href: l.href, label: t(l.schluessel) }));
  const mehrLinks = MEHR_LINK_SCHLUESSEL.map((l) => ({ href: l.href, label: t(l.schluessel) }));

  const desktopLinks = [
    { href: "/", schluessel: "nav.dashboard" },
    { href: "/videothek", schluessel: "nav.videothek" },
    { href: "/referenzbereich", schluessel: "nav.referenzbereich" },
    ...(!istZuschauer ? [{ href: "/upload", schluessel: "nav.hochladen" }] : []),
    { href: "/teil-melden", schluessel: "nav.teilMelden" },
    { href: "/lernpfade", schluessel: "nav.lernpfade" },
  ];

  // Bandlinie: der Signal-Abschnitt der Linie unter den Desktop-Links
  // wandert per translateX/width zum aktiven Link (Designkonzept
  // "Typenschild" Rev. 02 - das einzige verbliebene "Förderband"-Zitat,
  // bewusst nur als Linienbewegung, kein Bildmotiv).
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLElement | null>>({});
  const [band, setBand] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    function messen() {
      const container = navRef.current;
      const aktiverHref = desktopLinks.find((l) => istAktiv(pathname, l.href))?.href;
      const el = aktiverHref ? linkRefs.current[aktiverHref] : null;
      if (!container || !el) {
        setBand(null);
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setBand({ left: elRect.left - containerRect.left, width: elRect.width });
    }
    messen();
    window.addEventListener("resize", messen);
    return () => window.removeEventListener("resize", messen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 bg-plate text-plate-ink print:hidden">
        <div ref={navRef} className="relative mx-auto flex max-w-6xl items-center gap-0 px-4">
          <Link
            href="/"
            className="mr-3 flex flex-shrink-0 items-center gap-2 border-r border-plate-rule py-4 pr-6 font-display text-lg font-bold uppercase tracking-wide text-plate-ink"
          >
            <Logo className="h-6 w-6" />
            Skill Manager
          </Link>

          {/* Desktop-Links */}
          <div className="hidden items-stretch md:flex">
            {desktopLinks.map((l) => {
              const aktiv = istAktiv(pathname, l.href);
              return (
                <div key={l.href} className="flex items-center border-r border-plate-rule px-4 py-4">
                  <Link
                    ref={(el) => {
                      linkRefs.current[l.href] = el;
                    }}
                    href={l.href}
                    className={`text-sm ${aktiv ? "font-semibold text-plate-ink" : "text-plate-soft"}`}
                  >
                    {t(l.schluessel)}
                  </Link>
                </div>
              );
            })}

            {istAdminOderHoeher && (
              <div className="relative flex items-center border-r border-plate-rule px-4 py-4">
                <button
                  type="button"
                  onClick={() => setAdminOffen((o) => !o)}
                  className="flex items-center gap-1 text-sm text-plate-soft"
                >
                  {t("nav.verwaltung")} <Icon name="chevron" size={13} />
                </button>
                {adminOffen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAdminOffen(false)} />
                    <div className="absolute left-0 top-full z-20 mt-1 w-56 border border-rule bg-paper p-1.5 text-ink shadow-[0_12px_32px_-12px_rgba(21,22,26,.35)]">
                      {adminLinks.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setAdminOffen(false)}
                          className="block px-2.5 py-1.5 text-sm hover:bg-paper-2"
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

          <form action="/videothek" className="ml-3 hidden items-center gap-1.5 lg:flex">
            <Icon name="suche" size={15} className="text-plate-soft" />
            <input
              type="search"
              name="q"
              placeholder={t("nav.suchePlatzhalter")}
              className="h-9 w-[220px] bg-white/[.06] px-2 font-mono text-[13px] text-plate-ink placeholder:text-plate-soft outline-none"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 py-3">
            <SpracheAuswahl className="hidden h-9 bg-transparent px-2 font-mono text-xs uppercase tracking-wide text-plate-soft outline-none md:block" />
            <BenachrichtigungsGlocke benachrichtigungen={benachrichtigungen} />

            <div className="mx-1 hidden h-6 w-px bg-plate-rule md:block" />

            {/* Profil - Desktop */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setProfilOffen((o) => !o)}
                className="flex shrink-0 items-center gap-2 px-2 py-1 text-sm hover:bg-white/[.06]"
              >
                <Avatar name={name} avatarUrl={avatarUrl} />
                <span className="flex flex-col items-start leading-tight">
                  <span className="whitespace-nowrap text-plate-ink">{name}</span>
                  <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wide text-plate-soft">
                    {rollenLabel(rolle)}
                  </span>
                </span>
              </button>
              {profilOffen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfilOffen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-56 border border-rule bg-paper p-1.5 text-ink shadow-[0_12px_32px_-12px_rgba(21,22,26,.35)]">
                    <Link
                      href="/profil"
                      onClick={() => setProfilOffen(false)}
                      className="block px-2.5 py-2 text-sm hover:bg-paper-2"
                    >
                      {t("nav.meinProfil")}
                    </Link>
                    <div className="my-1 border-t border-rule" />
                    <ThemeToggle />
                    <div className="my-1 border-t border-rule" />
                    <form action={logout}>
                      <button
                        type="submit"
                        className="block w-full px-2.5 py-2 text-left text-sm text-ink-soft hover:bg-paper-2"
                      >
                        {t("nav.logout")}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative hidden h-[2px] bg-rule md:block">
          {band && (
            <span
              className="absolute top-0 h-[2px] bg-signal transition-[left,width] duration-[240ms] ease-out"
              style={{ left: band.left, width: band.width }}
            />
          )}
        </div>
      </header>

      {/* Mobile Bottom-Tab-Bar – ersetzt das alte Hamburger-Menü, damit sich
          die App auf dem Handy wie eine "echte" App bedient (Daumen-Reichweite). */}
      <nav className="fixed inset-x-0 bottom-0 z-30 bg-plate text-plate-soft md:hidden print:hidden">
        <div className="h-[2px] bg-rule" />
        <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
          {MOBILE_TABS.map((tab) => (
            <TabLink key={tab.href} href={tab.href} icon={tab.icon} label={t(tab.schluessel)} aktiv={istAktiv(pathname, tab.href)} />
          ))}
          {!istZuschauer && (
            <Link href="/upload" className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-signal text-signal-ink">
                <Icon name="upload" size={18} />
              </span>
              <span className="text-[10px] font-medium">{t("nav.hochladen")}</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setDrawerOffen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
          >
            <Icon name="mehr" size={22} />
            <span className="text-[10px] font-medium">{t("nav.mehr")}</span>
          </button>
        </div>
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
          className={`absolute right-0 top-0 h-full w-72 overflow-y-auto bg-paper p-4 text-ink transition-transform duration-300 ease-out ${
            drawerOffen ? "translate-x-0" : "translate-x-full"
          }`}
        >
            <div className="flex items-center justify-between">
              <Link href="/profil" className="flex items-center gap-2" onClick={() => setDrawerOffen(false)}>
                <Avatar name={name} avatarUrl={avatarUrl} />
                <span className="text-sm font-medium">
                  {name}
                  <span className="block font-mono text-xs text-ink-soft">{rollenLabel(rolle)}</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOffen(false)}
                className="p-1.5"
                aria-label={t("nav.menuSchliessen")}
              >
                <Icon name="schliessen" size={18} />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <SpracheAuswahl className="border border-rule bg-paper px-2 py-1 font-mono text-xs uppercase text-ink" />
            </div>

            <form action="/videothek" className="mt-3">
              <input
                type="search"
                name="q"
                placeholder={t("nav.suchePlatzhalter")}
                className="w-full border border-rule bg-paper-2 px-3 py-2 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-ink"
              />
            </form>

            <div className="mt-3 flex flex-col gap-0.5">
              {mehrLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setDrawerOffen(false)}
                  className="px-3 py-2 text-sm hover:bg-paper-2"
                >
                  {l.label}
                </Link>
              ))}

              {istAdminOderHoeher && (
                <>
                  <p className="mt-3 px-3 font-mono text-xs uppercase tracking-wide text-ink-faint">
                    {t("nav.verwaltung")}
                  </p>
                  {adminLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setDrawerOffen(false)}
                      className="px-3 py-2 text-sm hover:bg-paper-2"
                    >
                      {l.label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            <div className="mt-3 border-t border-rule pt-1">
              <ThemeToggle />
            </div>

            <form action={logout} className="mt-3 border-t border-rule pt-4">
              <button
                type="submit"
                className="w-full px-3 py-2 text-left text-sm text-ink-soft hover:bg-paper-2"
              >
                {t("nav.logout")}
              </button>
            </form>
          </div>
      </div>
    </>
  );
}

function TabLink({ href, icon, label, aktiv }: { href: string; icon: IconName; label: string; aktiv: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 ${aktiv ? "text-plate-ink" : "text-plate-soft"}`}
    >
      <Icon name={icon} size={22} />
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
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-signal text-xs font-bold text-signal-ink">
      {name?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}
