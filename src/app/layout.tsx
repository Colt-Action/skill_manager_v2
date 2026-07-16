import type { Metadata } from "next";
import { Big_Shoulders, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Nav from "@/components/Nav";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${bigShoulders.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
