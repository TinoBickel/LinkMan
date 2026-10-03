# LinkMan

Lokale Startseite mit Links, Areas und Widgets. Die Anwendung besteht aus einer HTML-Seite und einem lokalen Node.js-Dienst ohne Laufzeit-Abhaengigkeiten.

## Start unter Windows

1. Node.js installieren und dieses Repository herunterladen oder klonen.
2. Bei einer neuen Installation `LinkData.example.json` als `LinkData.json` kopieren. Eine vorhandene persoenliche Datei weiterverwenden und nicht ersetzen.
3. `LinkMan starten.cmd` ausfuehren oder `npm start` starten und `http://127.0.0.1:8765` oeffnen.

Den automatischen Windows-Start beschreibt [AUTOSTART.md](AUTOSTART.md).

## Konfiguration und Synchronisierung

Bei laufendem Dienst werden Aenderungen automatisch in `LinkData.json` gespeichert. Der lokale Dienst muss auf beiden Computern laufen. Synology Drive kann den gemeinsamen Projektordner synchronisieren; LinkMan laedt angekommene Dateiaenderungen alle zehn Sekunden nach.

Die zuletzt ausgewaehlte Area wird lokal pro Browser gemerkt. Offene Aenderungen werden im Browser gesichert und nach einem Neustart erneut gespeichert. Vor Dateiaenderungen entstehen Sicherungen in `LinkMan-Backups`. Bei erkannten Konflikten werden beide Versionen erhalten. Gleichzeitige Aenderungen vor Abschluss der Synology-Uebertragung koennen zusaetzliche Synology-Konflikte erzeugen.

Persoenliche Konfigurationen und Sicherungen sind von Git ausgeschlossen. Das Repository enthaelt nur eine leere Beispielkonfiguration.

## Tests

`npm install` installiert Playwright fuer die Tests. Unter Windows mit installiertem Microsoft Edge startet `npm test` die API- und Browsertests in einem temporaeren Projektordner. Die persoenliche Konfiguration wird dabei nicht veraendert.

Die Tests pruefen automatische Speicherung, Wiederherstellung, Konflikte, Area-Auswahl sowie die Einstellungen auf Desktop und Mobil.
