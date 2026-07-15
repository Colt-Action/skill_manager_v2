# Skill Manager

Interne Plattform für Techniker: kurze Erklärvideos (15–30 Sek.) zu
Maschinenteilen finden, ansehen, hochladen und freigeben.

**Stack:** Next.js (App Router, TypeScript) · Supabase (Datenbank, Auth,
Storage) · Tailwind CSS

## Was kann die App? (MVP)

- Login (E-Mail/Passwort)
- **Videothek** (Startseite): geführte Filterung Maschinentyp → Kategorie →
  Teil, plus Live-Suche über Titel, Tags/Synonyme und Teilenummer
- **Video-Detailseite**: Player, Schritt-für-Schritt-Beschreibung,
  "War das hilfreich?"-Feedback
- **Upload-Seite** für Techniker: Video hochladen, grob zuordnen, landet
  automatisch im Status "In Prüfung"
- **Admin-Bereich** (`/admin`): Prüfliste, Kategorie/Teil/Tags korrigieren,
  Beschreibung ergänzen, freigeben
- **QR-Codes** (`/admin/qr-codes`): pro Teil erzeugen, als PNG herunterladen;
  ein Scan führt direkt zu den passenden Videos (`/t/<code>`)
- **Analytics** (`/admin/analytics`): meistgesehene Videos, Suchanfragen ohne
  Treffer

## Lokal starten – Schritt für Schritt

### 1. Supabase-Projekt anlegen

1. Gehe zu [supabase.com](https://supabase.com) und lege ein kostenloses
   Projekt an (dauert ca. 2 Minuten, bis es bereit ist).
2. Öffne in deinem Projekt links **SQL Editor** → **New query**.
3. Kopiere den Inhalt von `supabase/migrations/20260714000000_init.sql`
   hinein und klicke auf **Run**. Das legt alle Tabellen und
   Zugriffsregeln an.
3b. Führe danach genauso `supabase/migrations/20260715000000_phase1_rollen_profil.sql`
   aus (erweitert die Rollen um Superadmin/Admin/Zuschauer, Profil-Felder,
   Foto-Upload-Speicher).
4. Optional, aber empfohlen für den ersten Test: führe danach auch
   `supabase/seed.sql` aus (legt ein paar Beispiel-Kategorien und -Teile
   an, damit die Auswahlfelder beim Hochladen nicht leer sind).
5. Damit die Registrierung im MVP sofort funktioniert (ohne dass man erst
   eine Bestätigungs-E-Mail anklicken muss): Gehe zu **Authentication** →
   **Providers** → **Email** und schalte "Confirm email" aus. (Für einen
   echten Produktivbetrieb später wieder einschalten!)

### 2. Umgebungsvariablen eintragen

1. Gehe in Supabase zu **Project Settings** → **API**.
2. Kopiere **Project URL** und den **anon public** Key.
3. Kopiere die Datei `.env.local.example` zu `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Trage die beiden Werte in `.env.local` ein.
5. Optional: Trage eine dritte Zeile `REGISTRATION_ACCESS_CODE=DeinCode` ein,
   damit sich nur Leute registrieren können, die diesen Code kennen. Ohne
   diese Zeile ist die Registrierung offen für alle mit dem Link.

### 3. App installieren und starten

```bash
npm install
npm run dev
```

Öffne anschließend [http://localhost:3000](http://localhost:3000) im
Browser.

### 4. Ausprobieren

1. Auf der Login-Seite oben auf **Registrieren** klicken, ein Testkonto
   anlegen (z. B. `du@test.de`). Neue Konten starten automatisch als
   **Techniker**.
2. Um einen **Superadmin**-Zugang zu bekommen (nur einmalig nötig, für den
   ersten Account): gehe in Supabase zu **Table Editor** → Tabelle `users`,
   suche deinen neuen Nutzer und ändere das Feld `rolle` von `techniker` auf
   `superadmin`. Danach im Browser aus- und wieder einloggen. Als Superadmin
   kannst du danach weitere Nutzer direkt in der App unter
   **Nutzerverwaltung** zu Admin machen.
3. Als Techniker: gehe auf **Video hochladen**, wähle eine kurze Videodatei
   von deinem Rechner, ordne sie einer Kategorie/einem Teil zu und sende sie
   ab. Das Video hat danach den Status "In Prüfung".
4. Als Admin/Superadmin: gehe auf **Prüfung & Freigabe**, ergänze bei Bedarf
   Beschreibung/Tags und klicke auf **Freigeben**. Danach erscheint das
   Video in der Videothek auf der Startseite.
5. Unter **QR-Codes** kannst du für jedes Teil einen QR-Code generieren und
   als PNG herunterladen. Scannt man ihn (z. B. mit dem Handy im selben
   Netzwerk), öffnet er direkt die Videos zu diesem Teil.
6. Unter **Analytics** siehst du die meistgesehenen Videos und Suchbegriffe,
   zu denen es keine Treffer gab.
7. Unter **Nutzerverwaltung** (nur Admin/Superadmin) siehst du alle Nutzer,
   kannst Rollen ändern und Konten deaktivieren (statt löschen – so bleiben
   hochgeladene Videos beim Firmenaustritt eines Nutzers erhalten).
8. Unter **Mein Profil** (Klick auf Namen/Bild oben rechts) kannst du Name,
   Standort und Profilbild anpassen.

### Rollen-Übersicht

- **Superadmin**: alles, inkl. Admins ernennen/entfernen
- **Admin**: Videos freigeben, Kategorien/Teile pflegen, Techniker/Zuschauer
  verwalten
- **Techniker**: Videos hochladen, eigenes Profil verwalten
- **Zuschauer**: nur ansehen + Feedback geben, kein Upload

## Projektstruktur (grober Überblick)

```
src/
  app/                  Seiten (Next.js App Router)
    login/               Login & Registrierung
    upload/              Upload-Seite für Techniker
    videos/[id]/         Video-Detailseite
    admin/                Prüfliste, QR-Codes, Analytics
    t/[qrCodeId]/         Ziel-Seite für gescannte QR-Codes
  components/            Wiederverwendbare UI-Bausteine
  lib/
    supabase/             Supabase-Client (Browser/Server) + Typen
    actions/               Server Actions (Datenbank-Schreibzugriffe)
    auth.ts                Hilfsfunktionen für Login-Prüfung
  proxy.ts                Middleware: hält Login-Status aktuell, schützt Seiten
supabase/
  migrations/             Datenbank-Schema (SQL)
  seed.sql                Optionale Testdaten
```

## Nächste mögliche Schritte (nicht Teil des MVP)

- Mehrsprachigkeit nutzen (Spalte `sprachen_verfuegbar` ist schon vorbereitet)
- Kamera-basiertes QR-Scannen direkt in der App (aktuell: Scan mit
  Handy-Kamera-App, die den Link öffnet)
- Feingranularere Berechtigungen, E-Mail-Bestätigung wieder aktivieren
- Video-Kompression/Thumbnails beim Upload
