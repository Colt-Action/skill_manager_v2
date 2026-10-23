# Skill Manager – Field Mode / Mobile UX Rev. 01

Status: Entwurf, Stand 23.10.2026 (nachgeführt mit Auftrag U2b). Grundlage: Anforderungen von Alex nach den ersten Handy-Tests der Werksbesichtigung.

Dieses Dokument ergänzt `typenschild-rev02.html`. Das Typenschild-Design bleibt die visuelle Grundlage (Farben, Schriften, Feldlabels). Field Mode beschreibt nur die **Bedienlogik am Smartphone**. Es ist keine separate App und keine neue Designsprache.

## 1. Ziel

Ein Techniker erfasst einen Werksbericht auf dem Smartphone

- mit einer Hand,
- unter Zeitdruck,
- direkt an der Anlage,
- ohne seitliches Scrollen,
- mit möglichst wenig Tipparbeit,
- ohne komplizierte Navigation.

Priorität: **Geschwindigkeit → Klarheit → Fehlervermeidung → Orientierung.** Nicht maximale Informationsdichte.

Hauptgerät: Smartphone im Hochformat. Der Desktop bleibt funktionsfähig und darf dichter sein.

## 2. Verbindliche Grundsätze

1. Kein horizontales Scrollen. Die Seite darf nie breiter sein als der Bildschirm.
2. Kein Eingabefeld, Dropdown oder Text ragt aus dem Bildschirm oder der Karte.
3. Auf dem Handy steht das Label **über** dem Feld, nicht daneben.
4. Eingabefelder nutzen die volle verfügbare Breite.
5. Touch-Flächen sind mindestens etwa 44–48 px hoch. Keine winzigen Buttons oder Slider-Punkte.
6. Lange Texte brechen um und werden nicht abgeschnitten.
7. Neue Oberflächentexte gibt es in allen 11 Sprachen (wie bisher).

## 3. Bausteine

### 3.1 Kurze Auswahlmengen als Kacheln

Auswahlen mit wenigen Optionen (bis etwa fünf) erscheinen als große Tipp-Flächen statt als Dropdown. Die aktuelle Auswahl ist eindeutig sichtbar. Längere Listen (zum Beispiel Material, Bandbreite) bleiben Dropdowns in voller Breite.

- Position: Kopftrommel, Nach Ablaufpunkt, Washbox, Freifeld
- Gurtzustand: Neu, Leicht, Mittel, Stark

### 3.2 Geschwindigkeit

Der kleine Slider entfällt auf dem Handy. Stattdessen:

`[−]  2,5 m/s  [+]`

- eine klare Möglichkeit „Nicht angegeben“,
- zusätzlich direkte Zahleneingabe,
- `null` („nicht angegeben“) bleibt eindeutig von `0` unterschieden.

### 3.3 Produktauswahl (geführt)

Statt mehrerer schmaler Dropdowns nebeneinander eine geführte Auswahl, immer nur der aktuell relevante Schritt prominent:

1. Position
2. Produkt
3. Typ
4. Abstreifsegment
5. Verlagerung
6. Konfiguration

- **Industrie und Hersteller** sind Testdaten und werden in der Werksbesichtigung nicht abgefragt. Die Auswahl beginnt beim Produkt unter dem Pfad **Maschinenbau › HOSCH**. Dieser Startpfad ist eine einzige Konstante im Code, damit sich die beiden Ebenen später wieder einblenden lassen. Hat eine bestehende Position einen anderen Pfad, bleibt dieser sichtbar und wird nicht überschrieben.
- **Die Ebene Kategorie entfällt als eigener Schritt.** Der Typ ist eine Liste aller Typen des Produkts, gruppiert nach Kategorie (die Kategorie steht als Überschrift über ihren Typen).
- Gespeichert wird weiter die **tiefste gewählte Ebene**.

Nach der Wahl eine kompakte Zusammenfassung, zum Beispiel **Hauptabstreifer · B6**, mit einem klaren „Ändern“, darunter Abstreifsegment, Verlagerung und gewünschte Konfiguration.

Die bestehende Kategorie-Komponente wird auch in der Videothek genutzt und darf nicht verändert werden. Die geführte Auswahl ist eine zusätzliche Darstellung für die Werksbesichtigung. Umsetzung in Auftrag U2c.

### 3.4 Förderbänder

Jedes Förderband ist ein klar erkennbarer eigener Arbeitsbereich. Der Nutzer sieht jederzeit, an welchem Band er arbeitet.

Ein fertiges Band klappt kompakt zusammen, zum Beispiel:

`Band 1 · FB-01 · Kohle · 1200 mm · 3 Positionen ✓`

„Fertig“ heißt: Förderband-ID gesetzt und keine ungespeicherten Änderungen. Positionen sind keine Pflicht.

### 3.5 Fotos

- großer Button „Foto aufnehmen / hinzufügen“,
- Smartphone-Kamera direkt nutzbar,
- klarer Upload- und Komprimierungsstatus,
- brauchbare Vorschau,
- einfaches, aber nicht versehentliches Löschen,
- keine verzerrten Bilder.

### 3.6 Speichern

Zentrales Speichern für den ganzen Bericht (Bericht, alle Förderbänder, alle Positionen). Keine Einzel-Speichern-Knöpfe je Band oder Position.

Feste Leiste am unteren Rand (über der Hauptnavigation), die weder Felder noch die Bildschirmtastatur verdeckt; auf dem Desktop oben neben dem Export:

`Zwischenspeichern | Bericht abschließen`

Vier eindeutige Zustände, sichtbar in der Leiste: **Ungespeicherte Änderungen · Speichern … · Gespeichert · Fehler.** Es darf nie „gespeichert“ erscheinen, wenn etwas nicht gespeichert wurde. Teilfehler werden einzeln gemeldet; erneutes Speichern ist gefahrlos.

### 3.7 Schnellerfassung

„Vorheriges Förderband kopieren“.

- Wird übernommen: Material, Bandbreite, Geschwindigkeit, Gurtverbindung, Gurtzustand.
- Wird nicht automatisch übernommen: Förderband-ID, Fotos, Positionen.
- Position duplizieren wird später geprüft.

### 3.8 Referenz-Vorschläge (später, Auftrag U4)

Keine Tabelle. Höchstens drei kompakte Vorschläge, zum Beispiel:

**92 % Übereinstimmung**
Hauptabstreifer · B6
Hartmetall X4 · PFS / PEM
Deutschland
4 von 5 Merkmalen verglichen

Knöpfe: `Details`, `Übernehmen`.

## 4. Umfang je Auftrag

Abstreifsegment und Verlagerung je Position sind bereits umgesetzt (U2a, mit Datenbank-Migration).

**U2b – Zentrales Speichern**

- zentraler Zustand für Bericht, Förderbänder und Positionen
- feste Leiste mit „Zwischenspeichern“ und „Bericht abschließen“ und den vier Zuständen (3.6)
- Warnung bei ungespeicherten Änderungen und Export-Hinweis „Ungespeicherte Änderungen sind nicht enthalten.“

**U2c – Mobile-Bedienung (Field Mode)**

1. kein horizontaler Overflow
2. Werksbesichtigung auf einem normalen Smartphone sauber bedienbar
3. Förderband schnell erfassbar, fertige Bänder klappen zusammen (3.4)
4. Position verständlich und schnell erfassbar, geführte Produktauswahl (3.3)
5. Geschwindigkeit mobil gut bedienbar (3.2)
6. Position und Gurtzustand als Kacheln (3.1)
7. Fotos mobil nutzbar (3.5)
8. keine abgeschnittenen Texte, Eingaben oder Buttons
9. „Vorheriges Förderband kopieren“ (3.7); Position duplizieren wird geprüft

**U3 – Berichtslayout** (PDF und Word)

**U4 – Referenz-Vorschläge** (3.8)

Lieber ein stabiler, überzeugender Kernablauf als viele halbfertige Funktionen.
