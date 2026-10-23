# Skill Manager – Field Mode / Mobile UX Rev. 01

Status: Entwurf, Stand 23.10.2026. Grundlage: Anforderungen von Alex nach den ersten Handy-Tests der Werksbesichtigung.

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
3. Kategorie
4. Typ (tiefste relevante Ebene)
5. Konfiguration

Nach der Wahl eine kompakte Zusammenfassung, zum Beispiel **Hauptabstreifer · B6**, mit einem klaren „Ändern“. Später kommen darunter Abstreifsegment, Verlagerung und gewünschte Konfiguration.

Die bestehende Kategorie-Komponente wird auch in der Videothek genutzt und darf nicht verändert werden. Die geführte Auswahl ist eine zusätzliche Darstellung für die Werksbesichtigung.

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

Ziel (Stufe 2): feste Leiste am unteren Rand, die weder Felder noch die Bildschirmtastatur verdeckt:

`Zwischenspeichern | Bericht abschließen`

Eindeutige Zustände: Ungespeicherte Änderungen · Speichern … · Gespeichert · Fehler. Es darf nie „gespeichert“ erscheinen, wenn etwas nicht gespeichert wurde.

Stufe 1 (bis zur Demo): Band und Position behalten je einen großen Speichern-Knopf. Nach dem Speichern klappt die Karte zu einer Zusammenfassungszeile mit Haken zusammen.

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

## 4. Umfang in Stufen

**Stufe 1, vor dem Termin am 27.10.2026** (ohne Datenbank-Migration, ohne zentrales Speichern):

1. kein horizontaler Overflow mehr
2. Werksbesichtigung auf einem normalen Smartphone sauber bedienbar
3. Förderband schnell erfassbar
4. Position verständlich und schnell erfassbar
5. Geschwindigkeit mobil gut bedienbar
6. Gurtzustand gut auswählbar
7. Produktauswahl ohne mehrere abgeschnittene Dropdowns
8. Fotos mobil nutzbar
9. Speichern eindeutig (Einzel-Speichern mit Zuklappen)
10. keine abgeschnittenen Texte, Eingaben oder Buttons

Optional, wenn die Zeit reicht: „Vorheriges Förderband kopieren“.

**Stufe 2, nach dem Termin:**

- Abstreifsegment und Verlagerung (mit Datenbank-Migration)
- zentrales Speichern mit fester Leiste und allen Zuständen
- Warnung bei ungespeicherten Änderungen und Export-Hinweis „Ungespeicherte Änderungen sind nicht enthalten.“
- Position duplizieren
- Berichtslayout (PDF und Word) und Referenz-Vorschläge

Lieber ein stabiler, überzeugender Kernablauf als viele halbfertige Funktionen.
