---
description: Arbeitet offene Aufträge aus docs/inbox ab und legt Berichte in docs/outbox ab
---

Lies zuerst `docs/jarvis-workflow.md` vollständig. Prüfe dann `docs/inbox/`: Nimm die Auftragsdateien (`NNN-*.md`, mit den Zeilen `Von: JARVIS (Hauptchat)` und `ID: NNN`) in aufsteigender Reihenfolge, für die es noch keine Datei `docs/outbox/NNN-bericht.md` gibt. Führe jeden Auftrag nach den Regeln aus `docs/jarvis-workflow.md` aus und lege den Bericht in `docs/outbox/` ab. Pushen, Zusammenführen in main und Löschen von Branches nur, wenn die Auftragsdatei eine passende Zeile `FREIGABE VON ALEX:` enthält. Sind keine offenen Aufträge da, sage das in einem Satz. Gib nach jedem Auftrag nur einen kurzen Satz aus (Nummer, Status, Pfad des Berichts).
