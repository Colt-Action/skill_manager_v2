import type { Metadata } from "next";
import { Big_Shoulders, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import ToastProvider from "@/components/ToastProvider";
import SprachProvider from "@/components/SprachProvider";
import { createClient } from "@/lib/supabase/server";
import { STANDARD_SPRACHE, istGueltigeSprache } from "@/lib/i18n/sprachen";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-data-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Skill Manager",
  description: "Erklärvideos zu Maschinenteilen für Techniker",
};

// Verhindert ein kurzes "Aufblitzen" der Standard-Optik beim Laden: setzt
// den gespeicherten (oder System-)Modus, bevor React überhaupt rendert.
const themeInitScript = `
  (function () {
    try {
      var gespeichert = localStorage.getItem('sm-theme');
      var modus = gespeichert || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', modus);
    } catch (e) {}
  })();
`;

async function ermittleSprache() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return STANDARD_SPRACHE;

    const { data: profil } = await supabase.from("users").select("sprache").eq("id", user.id).single();
    const wert = profil?.sprache;
    return wert && istGueltigeSprache(wert) ? wert : STANDARD_SPRACHE;
  } catch {
    return STANDARD_SPRACHE;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sprache = await ermittleSprache();

  return (
    <html
      lang={sprache}
      className={`${bigShoulders.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SprachProvider initialSprache={sprache}>
          <ToastProvider>
            <Nav />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
          </ToastProvider>
        </SprachProvider>
      </body>
    </html>
  );
}
