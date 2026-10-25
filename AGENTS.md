<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design-Grundlagen

- `docs/typenschild-rev02.html` – Designsystem „Typenschild“ Rev. 02 (Farben, Schriften, Bausteine). Verbindlich für alle sichtbaren Änderungen, vor allem Abschnitt C (Visual System) und I (Spezifikation).
- `docs/field-mode-rev01.md` – Field Mode Rev. 01: Bedienlogik der Werksbesichtigung am Smartphone. Ergänzt das Typenschild-Design und gilt dort zusätzlich.

# JARVIS-Arbeitsweise (Aufträge über docs/inbox)

Aufträge kommen über Dateien in `docs/inbox/`, Berichte gehen nach `docs/outbox/`. Der Befehl `/inbox` arbeitet offene Aufträge ab. Verbindlich ist `docs/jarvis-workflow.md`: Lies es vor jedem Auftrag aus der Inbox. Pushen, Zusammenführen und Löschen von Branches nur mit ausdrücklicher Freigabe in der Auftragsdatei.
