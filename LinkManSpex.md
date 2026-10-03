# Programmierauftrag: LinkMan vollständig neu entwickeln

## 1. Auftrag

Entwickle **LinkMan** als saubere, wartbare Neuentwicklung. LinkMan ist ein lokales, deutschsprachiges Startseiten-Dashboard für den Browser. Der Benutzer organisiert häufig verwendete Links in frei sortierbaren Buckets, trennt Inhalte über Areas und ergänzt das Dashboard um kleine Widgets.

Die vorhandene Implementierung darf zur fachlichen Orientierung angesehen werden, soll aber **nicht lediglich refaktoriert oder kopiert** werden. Erstelle eine eigenständige, gut strukturierte Lösung. Bestehende LinkMan-JSON-Dateien müssen weiterhin geladen werden können, ohne Nutzerdaten zu verlieren.

Arbeite den Auftrag vollständig ab, triff bei kleinen visuellen Details sinnvolle Entscheidungen und frage nur nach, wenn eine Entscheidung die Datenkompatibilität oder den grundlegenden Funktionsumfang verändern würde.

## 2. Produktziel

LinkMan soll:

- lokal und ohne Benutzerkonto funktionieren;
- sehr schnell starten und auch mit mindestens 500 Links flüssig bleiben;
- alle Daten in einer menschenlesbaren JSON-Datei speichern können;
- ohne Cloud, Datenbank oder externen Anwendungsserver auskommen;
- auf Windows bequem im Hintergrund gestartet werden können;
- als kompakte, dunkle Browser-Startseite auf Desktop und kleineren Fenstern funktionieren;
- vorhandene Daten der bisherigen LinkMan-Version importieren können.

Nicht Bestandteil des Produkts sind Mehrbenutzerbetrieb, Anmeldung, Cloud-Synchronisierung, Browser-Erweiterung, Telemetrie oder ein Administrationsbereich.

## 3. Zielumgebung und technische Leitplanken

### 3.1 Laufzeit

- Zielbetriebssystem: Windows 10 und Windows 11.
- Zielbrowser: aktuelle Chromium-Browser, insbesondere Chrome und Edge.
- Lokaler Dienst: Node.js, gebunden an `127.0.0.1` auf Port `8765`.
- Standardadresse: `http://127.0.0.1:8765`.
- Die Kernfunktionen dürfen keine Internetverbindung benötigen. Externe Favicons und Webfonts dürfen ausfallen, ohne dass die Anwendung unbenutzbar wird.

### 3.2 Architektur

Die konkrete Frontend-Technik darf frei gewählt werden. Bevorzugt wird eine kleine, nachvollziehbare Lösung mit möglichst wenig Abhängigkeiten. Falls ein Build-System verwendet wird, müssen Quellcode, Build-Skripte und eine reproduzierbare Build-Anleitung mitgeliefert werden. Der lokale Produktionsstart darf keinen Entwicklungsserver voraussetzen.

Trenne mindestens folgende Verantwortlichkeiten sauber:

- Datenmodell, Validierung und Migration;
- Persistenz und Dateioperationen;
- UI-Komponenten und Dialoge;
- Drag-and-drop und Sortierung;
- Widget-Logik;
- lokaler HTTP-Dienst und Systeminformationen.

Keine fachliche Logik ausschließlich über DOM-Strukturen oder CSS-Klassennamen modellieren. Vermeide globale, unstrukturierte Zustände.

### 3.3 Sprache

- Alle sichtbaren Beschriftungen, Hinweise, Bestätigungen und Fehlermeldungen sind auf Deutsch.
- Quellcode, Typen und technische Dokumentation dürfen Englisch verwenden.
- Datumsdarstellung: deutsches Format, z. B. `01.10.2026` oder eine gleichwertige gut lesbare deutsche Darstellung.
- Zeitdarstellung: 24-Stunden-Format.

## 4. Visuelles Konzept und Grundlayout

Die Neuentwicklung soll den Charakter von LinkMan bewahren, muss aber kein pixelgenauer Nachbau sein.

### 4.1 Gestaltung

- Dunkles, kompaktes Dashboard mit Anthrazit- bis Schwarztönen.
- Akzentfarbe Orange/Orangerot.
- Hoher Kontrast und klar erkennbare Fokuszustände.
- Karten für Buckets und Widgets mit dezenter Umrandung und Schatten.
- Kompakte Linkzeilen mit Favicon und einzeilig gekürztem Namen.
- Überschriften dürfen eine technisch wirkende Schrift verwenden; für die normale UI ist eine gut lesbare Systemschrift vorzuziehen.
- Das Layout muss bei fehlenden externen Fonts vollständig funktionieren.

### 4.2 Board

- Buckets und Widgets erscheinen gemeinsam in einem responsiven Kartenraster.
- Richtwert für Kartenbreite auf großen Ansichten: etwa 220 bis 300 Pixel.
- Karten unterschiedlicher Höhe sollen platzsparend angeordnet werden, ohne sich zu überlappen.
- Auf schmalen Ansichten werden Spaltenbreite und Abstände reduziert.
- Auf Mobilbreite darf das Layout einspaltig werden.
- Leere Areas zeigen einen hilfreichen Leerzustand.

### 4.3 Fixierte Bedienleiste

Eine fixierte Bedienleiste kann unter `Funktionen → Titlebar andocken` unten (Standard), oben, rechts oder links angedockt werden. Die Position wird als `settings.titlebarPosition` mit den übrigen Einstellungen gespeichert. Die Leiste enthält:

- kompaktes Logo aus `Images/TinoLogo.png`;
- scrollbare Area-Tabs mit waagerechten Beschriftungen, oben/unten nebeneinander und an den Seiten untereinander;
- Schaltfläche zum Erstellen einer Area;
- kurzzeitig sichtbarer Statusmeldung;
- Schaltfläche `Funktionen`;
- Schaltfläche zum Hinzufügen eines Widgets;
- hervorgehobener Schaltfläche zum Hinzufügen eines Buckets.

Die Leiste darf Board-Inhalte nicht dauerhaft verdecken. Links und rechts richtet sich ihre Breite nach dem längsten Area-Namen (mindestens 64 Pixel); die Aktionsknöpfe stehen untereinander. Auf kleinen Ansichten dürfen Statusmeldungen ausgeblendet werden, die Kernaktionen müssen erreichbar bleiben.

## 5. Fachliches Datenmodell

Verwende beim Speichern das JSON-Schema mit `schemaVersion: 8`. Zusätzliche interne Felder sind nur zulässig, wenn ältere Dateien weiterhin kompatibel bleiben und unbekannte Werte nicht unnötig verworfen werden.

### 5.1 Vollständiges Beispieldokument

```json
{
  "schemaVersion": 8,
  "areas": [
    { "id": "default", "name": "Allgemein" },
    { "id": "area-private", "name": "Privat" }
  ],
  "activeAreaId": "default",
  "groupAreas": {
    "Arbeit": "default",
    "Medien": "area-private"
  },
  "categories": [
    "Arbeit",
    "Medien",
    "Arbeit / Dokumentation"
  ],
  "links": [
    {
      "id": "link-1",
      "url": "https://example.com/",
      "name": "Beispiel",
      "category": "Arbeit",
      "image": "",
      "icon": "https://www.google.com/s2/favicons?sz=128&domain_url=https%3A%2F%2Fexample.com%2F"
    }
  ],
  "groupOrder": ["Arbeit", "Medien"],
  "containerOrder": [
    "g:Arbeit",
    "w:clock-1",
    "g:Medien"
  ],
  "widgets": [
    {
      "id": "clock-1",
      "type": "analog-clock",
      "areaId": "default",
      "timezone": "Europe/Berlin",
      "showSeconds": true
    },
    {
      "id": "notes-1",
      "type": "quick-notes",
      "areaId": "default",
      "title": "Quick Notes",
      "items": [
        { "id": "note-1", "text": "Beispiel", "done": false }
      ]
    },
    {
      "id": "uptime-1",
      "type": "system-uptime",
      "areaId": "default",
      "breakMinutes": 45
    },
    {
      "id": "countdown-1",
      "type": "countdown",
      "areaId": "area-private",
      "events": [
        { "id": "event-1", "name": "Urlaub", "date": "2027-07-01" }
      ]
    }
  ],
  "settings": {
    "menuItemTextColor": "#dfdfe1",
    "menuItemFontSize": 13,
    "systemServiceUrl": "http://127.0.0.1:8765"
  }
}
```

### 5.2 Entitäten und Regeln

#### Area

- Felder: `id`, `name`, optional `backgroundImage` (Bildadresse, relativer Bildpfad oder eingebettetes Bild als Data-URL).
- IDs sind nicht leere, stabile Zeichenketten; für neue Entitäten UUIDs verwenden.
- Namen sind getrimmt, nicht leer und ohne Beachtung der Groß-/Kleinschreibung eindeutig.
- Mindestens eine Area muss immer existieren.
- Wenn keine gültige Area importiert wird, lege `{ "id": "default", "name": "Allgemein" }` an.

#### Bucket/Gruppe

- Ein Bucket wird durch seinen Gruppennamen identifiziert.
- `groupAreas` ordnet Gruppennamen einer Area-ID zu.
- `groupOrder` hält die logische Reihenfolge aller Buckets.
- Die historische Bezeichnung `categories` bleibt aus Kompatibilitätsgründen erhalten.
- Ein Kategoriename kann `Gruppe / Unterbereich` enthalten. Der erste Teil ist die Gruppe, der Rest der Unterbereich. Die aktuelle UI muss Unterbereiche nicht separat darstellen, darf diese Information beim Laden, Verschieben, Umbenennen und Speichern aber nicht verlieren.
- Kategorien ohne Schrägstrich gehören zum Unterbereich `Allgemein`.

#### Link

- Felder: `id`, `url`, `name`, `category`, `image`, `icon`.
- URL, Name und Kategorie sind fachlich erforderlich.
- Fehlt bei der Eingabe ein Protokoll, soll zunächst `https://` ergänzt werden.
- Nur URLs akzeptieren, die sich mit der Browser-URL-API valide parsen lassen. Für neu eingegebene Links sollen mindestens HTTP und HTTPS zulässig sein; gefährliche Protokolle wie `javascript:` müssen abgelehnt werden.
- Fehlt ein Name, aus dem Hostnamen einen lesbaren Vorschlag ableiten.
- `image` aus Altdateien erhalten, auch wenn es in der UI nicht verwendet wird.

#### Container-Reihenfolge

- `containerOrder` enthält Bucket- und Widget-Schlüssel gemeinsam.
- Bucket-Schlüssel: `g:<Gruppenname>`.
- Widget-Schlüssel: `w:<Widget-ID>`.
- Beim Laden veraltete oder doppelte Schlüssel entfernen und fehlende gültige Schlüssel ergänzen.
- Die Reihenfolge gilt global; pro Area werden nur die dort enthaltenen Container angezeigt.

#### Einstellungen

- `menuItemTextColor`: valide sechsstellige Hex-Farbe, Standard `#dfdfe1`.
- `menuItemFontSize`: ganze Zahl von 10 bis 24, Standard `13`.
- `systemServiceUrl`: vollständige HTTP- oder HTTPS-Adresse ohne Zugangsdaten, Query oder Fragment, Standard `http://127.0.0.1:8765`.

## 6. Daten laden, speichern und wiederherstellen

### 6.1 Startreihenfolge

Beim Start:

- Ausstehende Änderungen unter `linkman_pending_config_v1` zuerst wiederherstellen; sie dürfen nicht durch einen älteren Dateistand ersetzt werden.
- Ohne ausstehende Änderungen zuerst `http://127.0.0.1:8765/api/config` laden. Der lokale Dienst verbindet `LinkData.json` automatisch zum Speichern ohne Dateidialog pro Start.
- Bei nicht erreichbarem Dienst gilt die folgende Fallback-Reihenfolge.
- Ein vorhandener Browserstand wird vor der relativen JSON-Datei geladen, damit noch nicht übertragene lokale Änderungen erhalten bleiben. Die letzte bestätigte Dateirevision unter `linkman_config_revision_v1` dient für spätere Schreibversuche als Vergleichsbasis.

1. Versuche nacheinander und ohne Browsercache `LinkData.json`, `linkman-data.json` und `LinkData1.json` relativ zur Anwendung zu laden.
2. Wenn keine Datei geladen werden kann, versuche den letzten Snapshot aus `localStorage` zu laden.
3. Wenn auch dieser fehlt, versuche historische Daten unter dem Schlüssel `linkman_data_v1` zu migrieren.
4. Andernfalls starte mit einer leeren Standard-Area.

Verwende für den aktuellen Cache einen klar versionierten Schlüssel, kompatibel zum bisherigen `linkman_cache_v2`.

### 6.2 Import und Normalisierung

- JSON-Dateien mit älteren Schema-Versionen müssen bestmöglich geladen werden, insbesondere die vorhandenen Versionen 5 und 6.
- Fehlende neue Felder erhalten Standardwerte.
- Ungültige einzelne Datensätze dürfen nicht die gesamte Datei unbrauchbar machen.
- Doppelte Areas, Gruppenreihenfolgen oder Container-Schlüssel bereinigen.
- Links mit ungültiger oder fehlender URL überspringen und dies nach dem Import verständlich melden.
- Widgets unbekannten Typs überspringen, bekannte Widgets normalisieren.
- Verweise auf nicht vorhandene Areas auf die erste gültige Area umleiten.
- Der Import darf die Quelldatei nicht ungefragt überschreiben.

### 6.3 Dateiaktionen im Dialog `Funktionen`

Implementiere:

- `JSON öffnen`;
- `Speichern`;
- `Speichern unter`;
- `JSON exportieren`.

Wenn die File System Access API verfügbar ist:

- Datei über den nativen Picker öffnen;
- ein geöffnetes File Handle merken;
- nach jeder fachlichen Änderung automatisch in diese Datei speichern;
- gleichzeitige Schreibvorgänge serialisieren, damit keine Änderung verloren geht;
- bei Schreibfehlern die Dateiverknüpfung lösen, den lokalen Snapshot behalten und eine klare Meldung anzeigen.

Wenn die API nicht verfügbar ist:

- Öffnen über ein verborgenes `input[type=file]` ermöglichen;
- Speichern und Exportieren als JSON-Download umsetzen;
- verständlich darauf hinweisen, dass keine dauerhafte Dateiverknüpfung besteht.

Jede Änderung muss zusätzlich einen aktuellen Snapshot in `localStorage` erzeugen. Die JSON-Ausgabe ist lesbar mit Einrückung zu formatieren.

Im automatischen Dienstmodus Änderungen nach 500 ms Ruhezeit serialisiert per JSON-POST an `/api/config` schreiben. SHA-256-Revisionen verhindern das Überschreiben inzwischen geänderter Dateistände. Fehler behalten ausstehende Änderungen lokal und werden alle zehn Sekunden erneut versucht. Externe Dateistände bei unverändertem lokalem Stand alle zehn Sekunden nachladen, außerhalb offener Editoren und fokussierter Eingaben. Vor dem Schreiben den alten Stand in `LinkMan-Backups` sichern; bei Konflikt beide Stände erhalten und den Pfad der Konfliktkopie dauerhaft anzeigen. Die Übertragung zwischen Computern übernimmt Synology Drive; gleichzeitig offline bearbeitete Dateistände können zusätzliche Synology-Konfliktdateien erzeugen.

### 6.4 Änderungsstatus

- Die letzte Area-Auswahl unter `linkman_active_area_v1` lokal pro Browser merken und beim Laden gegenüber der synchronisierten `activeAreaId` bevorzugen. Bei nicht mehr vorhandener Area auf eine gültige Area zurückfallen. Ein reiner Area-Wechsel löst keine Dateispeicherung aus.
- Den Einstellungsdialog in die Reiter Anzeige, Daten und Dienst aufteilen; Reiter per Pfeiltasten sowie Home/End bedienbar machen.

- Anzeigen, welche Datei verbunden ist.
- Ungespeicherte Änderungen sichtbar kennzeichnen.
- Erfolg und Fehler als vorübergehende Statusmeldung anzeigen, Richtwert zehn Sekunden.
- Abbruch eines Dateipickers ist kein Fehler.

## 7. Areas

- Areas erscheinen als Tabs in der frei andockbaren Bedienleiste.
- Klick aktiviert eine Area und zeigt ausschließlich ihre Buckets und Widgets.
- Plus-Schaltfläche öffnet einen Dialog zum Erstellen.
- Doppelklick auf einen Tab öffnet den Bearbeiten-Dialog.
- Rechtsklick auf einen Tab öffnet ein Kontextmenü mit `Löschen` und `Bearbeiten`; erst `Löschen` fordert eine Bestätigung an.
- Im Bearbeiten-Dialog können Name und Hintergrundbild geändert werden. Bilder können über eine Adresse oder relative Datei angegeben oder als Bilddatei ausgewählt und in der JSON eingebettet werden. Das Bild kann wieder entfernt werden.
- Jede Area zeigt ihren eigenen Hintergrund über die gesamte Ansicht; Areas ohne Bild verwenden den normalen dunklen Hintergrund. Ältere JSON-Dateien ohne Hintergrundbild bleiben kompatibel.
- Beim Erstellen wird die neue Area direkt aktiviert.
- Automatisch vorgeschlagener Name: `Neue Area`, danach `Neue Area 2`, `Neue Area 3` usw.
- Beim Löschen muss mindestens eine Area erhalten bleiben.
- Buckets und Widgets der gelöschten Area werden nach Bestätigung in eine andere verbleibende Area verschoben.
- Ein Bucket oder Widget kann per Drag-and-drop auf einen Area-Tab verschoben werden.
- Hält der Benutzer beim Ablegen eines Buckets `Strg`, wird der Bucket einschließlich aller Links kopiert. Widgets werden nicht über `Strg` kopiert.
- Eine Bucket-Kopie erhält einen eindeutigen Namen wie `<Name> Kopie`, gegebenenfalls mit weiterer Nummerierung, sowie neue IDs für alle kopierten Links.

## 8. Buckets und Links

### 8.1 Buckets

- Die globale Plus-Schaltfläche erstellt in der aktiven Area einen leeren Bucket.
- Namensvorschlag: `Neue Gruppe`, danach `Neue Gruppe (2)`, `Neue Gruppe (3)` usw.
- Ein Bucket zeigt Titel, Link-hinzufügen-Schaltfläche und Löschen-Schaltfläche.
- Ein leerer Bucket zeigt `Links hier ablegen`.
- Doppelklick auf den Titel erlaubt direktes Umbenennen; Enter übernimmt, Escape verwirft.
- Umbenennen muss alle zugehörigen Kategorien, Links, Area-Zuordnungen und Ordnungsschlüssel konsistent aktualisieren.
- Kollisionen mit bereits vorhandenen Gruppennamen müssen verhindert oder über eine klar kommunizierte, deterministische Zusammenführung behandelt werden. Bevorzugt: Umbenennen ablehnen und eine Meldung anzeigen.
- Löschen entfernt nach Bestätigung den Bucket und alle enthaltenen Links.

### 8.2 Links

- Link hinzufügen öffnet einen Dialog mit URL, Name und Favicon-Vorschau.
- Während der URL-Eingabe werden Favicon und, solange der Name nicht bewusst verändert wurde, ein Namensvorschlag aktualisiert.
- Speichern mit leerem Namen verwendet den Namensvorschlag.
- Klick auf eine Linkzeile öffnet die Zieladresse in einem neuen Tab mit sicherem `noopener`/`noreferrer`-Verhalten.
- Rechtsklick auf eine Linkzeile öffnet ein kontextbezogenes Menü mit `Bearbeiten` und `Löschen`.
- Löschen verlangt eine Bestätigung.
- Escape schließt Dialoge und Kontextmenüs; Enter speichert gültige Dialoge.

### 8.3 Favicon-Kaskade

Favicons werden in dieser Reihenfolge versucht:

1. gespeicherte Icon-URL;
2. `<Origin>/favicon.ico`;
3. DuckDuckGo Icon Service für den Hostnamen;
4. Google S2 Favicon Service für die vollständige URL;
5. lokal erzeugtes, datenschutzneutrales SVG mit ein oder zwei Initialen.

Ein fehlendes oder fehlerhaftes externes Icon darf weder eine kaputte Bildanzeige noch einen Funktionsausfall verursachen.

## 9. Drag-and-drop

- Links können innerhalb eines Buckets sortiert und in andere Buckets verschoben werden.
- Beim Verschieben bleibt ein historischer Unterbereich der Kategorie erhalten; nur die Gruppe ändert sich.
- Bucket- und Widget-Karten können gemeinsam frei sortiert werden.
- Ablage vor, nach oder am Ende muss visuell eindeutig markiert sein.
- Ziehen eines Links darf beim Loslassen nicht versehentlich dessen URL öffnen.
- Interaktive Elemente in Widgets oder Kartenaktionen dürfen keinen Kartendrag starten.
- Alle erfolgreichen Verschiebungen werden sofort gespeichert.
- Die DnD-Implementierung muss mit Maus funktionieren. Eine zugängliche alternative Sortiermöglichkeit per Tastatur oder Aktionsmenü ist ausdrücklich erwünscht.

## 10. Widgets

Über die Widget-Schaltfläche öffnet sich ein Menü mit genau diesen Typen:

- Analoge Uhr;
- Quick Notes;
- Computer-Uptime;
- Countdown.

Neue Widgets werden der aktiven Area zugeordnet. Jedes Widget kann nach Bestätigung gelöscht und per Drag-and-drop zwischen Areas sowie im Board verschoben werden.

### 10.1 Analoge Uhr

Daten:

```json
{
  "id": "...",
  "type": "analog-clock",
  "areaId": "...",
  "timezone": "Europe/Berlin",
  "showSeconds": true
}
```

Anforderungen:

- Analoge Darstellung mit Stunden- und Minutenzeiger, optional Sekundenzeiger.
- Zusätzlich digitale Uhrzeit anzeigen.
- Zeitzone anzeigen.
- Aktualisierung mindestens einmal pro Sekunde.
- Eigenschaften-Dialog für IANA-Zeitzone und Sekundenzeiger.
- Browser-Zeitzone als Standard, ersatzweise UTC.
- Eingabe gegen `Intl.DateTimeFormat` validieren.
- Zeitzonen-Vorschläge aus `Intl.supportedValuesOf('timeZone')`, falls verfügbar, ergänzt um mindestens `Europe/Berlin`, `UTC`, `Europe/London`, `America/New_York`, `America/Los_Angeles`, `Asia/Tokyo`, `Australia/Sydney`.

### 10.2 Quick Notes

Daten:

```json
{
  "id": "...",
  "type": "quick-notes",
  "areaId": "...",
  "title": "Quick Notes",
  "items": [
    { "id": "...", "text": "Aufgabe", "done": false }
  ]
}
```

Anforderungen:

- Titel direkt im Widget editierbar.
- Beliebig viele Einträge hinzufügen und entfernen.
- Jeder Eintrag hat Checkbox, einzeiliges Textfeld und Löschen-Schaltfläche.
- Erledigte Einträge werden optisch reduziert und durchgestrichen.
- Änderungen direkt persistieren, ohne separaten Speichern-Dialog.
- Historische Quick-Notes-Einträge, die nur als String vorliegen, zu `{ id, text, done: false }` migrieren.

### 10.3 Computer-Uptime

Daten:

```json
{
  "id": "...",
  "type": "system-uptime",
  "areaId": "...",
  "breakMinutes": 45
}
```

Anforderungen:

- Zeige Startdatum und Startzeit der aktuellen Windows-Sitzung; wenn nicht ermittelbar, verwende die System-Bootzeit.
- Datum und Startzeit hintereinander in einer gemeinsamen Zeile ohne sichtbare Beschriftungen anzeigen.
- Berechne die heutige verstrichene Zeit als `jetzt - max(Sitzungsstart, Tagesbeginn)`, niemals kleiner als null. Bis einschließlich 6 Stunden entspricht die Arbeitszeit der verstrichenen Zeit; erst bei mehr als 6 Stunden wird die gesamte eingestellte Pause abgezogen, niemals mit einem Ergebnis kleiner als null. Zeitwert und grafische Skala verwenden dieselbe Arbeitszeit.
- Zeige Arbeitszeit als `HH:MM:SS`; Stunden dürfen über 23 hinausgehen.
- Den verstrichenen Arbeitszeitwert in einer eigenen sichtbaren Zeile oberhalb der grafischen Skala anzeigen.
- Pause als ganze Minuten von 0 bis 1440 editierbar.
- Pfeil hoch/runter und die Eingabefeld-Pfeile ändern die Pause in 15-Minuten-Schritten; keine Schnellwahl-Schaltflächen.
- Grafische Arbeitszeitskala von 0 bis 10 Stunden mit Positionsmarker; bei mehr als 10 Stunden bleibt der Marker am rechten Ende, der Zeitwert bleibt exakt.
- Die Skala verläuft vor 8 Stunden von Rot über Orange und Gelb zu Grün, bleibt von 8 bis 9 Stunden grün und verläuft danach über Gelb und Orange zu Rot bei 10 Stunden.
- Farbstufen der Arbeitszeit:
  - unter 6 Stunden: Rot;
  - ab 6 Stunden: Orange;
  - ab 7 Stunden: Gelb;
  - ab 8 Stunden: Grün;
  - über 9 Stunden: Gelb;
  - ab 9,6 Stunden: Orange;
  - ab 10 Stunden: Rot.
- UI jede Sekunde aktualisieren.
- Systemdaten höchstens einmal pro Minute neu abrufen, außer bei einem ausdrücklichen Verbindungstest.
- Bei nicht erreichbarem Dienst keine Endlosschleife oder störenden Dialoge erzeugen, sondern einen Hinweis im Widget anzeigen.

### 10.4 Countdown

Daten:

```json
{
  "id": "...",
  "type": "countdown",
  "areaId": "...",
  "events": [
    { "id": "...", "name": "Urlaub", "date": "2027-07-01" }
  ]
}
```

Anforderungen:

- Ereignisse über einen Dialog mit Titel und Datum erstellen.
- Datum streng als gültiges Kalenderdatum im Format `YYYY-MM-DD` speichern.
- Anzeige je Ereignis: Titel, formatiertes Datum und Differenz in ganzen Kalendertagen (`1 Tag`, sonst `n Tage`).
- Berechnung auf Basis lokaler Kalendertage, aber über UTC-Tageswerte, damit Zeitumstellungen kein Off-by-one verursachen.
- Farbstufen:
  - mehr als 5 Tage: neutral;
  - 4 bis 5 Tage: Gelb;
  - 1 bis 3 Tage: Orange;
  - heute oder vergangen: Rot.
- Rechtsklick auf ein Ereignis bietet `Bearbeiten` und `Löschen`.
- Countdown-Werte regelmäßig aktualisieren.
- Sortierung der Ereignisse:
  1. heutige und zukünftige Ereignisse zuerst, aufsteigend nach Datum; der als Nächstes erreichte Termin steht ganz oben;
  2. vergangene Ereignisse danach, absteigend nach Datum; das zuletzt verstrichene steht zuerst;
  3. ungültige historische Einträge ganz unten;
  4. gleiche Daten behalten ihre bisherige relative Reihenfolge.
- Die Sortierung ist eine Anzeigeentscheidung und soll das zugrunde liegende Array nicht unabsichtlich mutieren.
- Die Reihenfolge muss auch nach einem Tageswechsel ohne manuelle Datenänderung korrekt werden.
- Auf sehr schmalen Ansichten darf das ausgeschriebene Datum ausgeblendet werden; Titel und Tagesdifferenz bleiben sichtbar.

## 11. Dialog `Funktionen`

Zusätzlich zu den Dateiaktionen enthält er:

- Farbauswahl für Linktexte und Menüeinträge;
- Zurücksetzen der Farbe auf `#dfdfe1`;
- Regler für Schriftgröße von 10 bis 24 Pixeln;
- Zurücksetzen der Schriftgröße auf 13 Pixel;
- Eingabe für die Adresse des lokalen Dienstes;
- Schaltfläche `Verbindung testen`;
- Anzeige des verbundenen Dateinamens und des Änderungsstatus.

Farbe und Schriftgröße sollen direkt als Vorschau wirken und dauerhaft gespeichert werden. Ungültige Dienstadressen dürfen nicht übernommen werden.

## 12. Lokaler Node.js-Dienst

Implementiere einen kleinen Produktionsserver ohne unnötige Framework-Abhängigkeit.

### 12.1 Netzwerk

- Lauscht ausschließlich auf `127.0.0.1:8765`.
- Liefert die gebauten statischen Dateien aus; `/` liefert die Hauptseite.
- MIME-Typen mindestens für HTML, JSON, JavaScript, CSS, SVG, PNG, JPEG und ICO.
- Statische Antworten nicht aggressiv cachen; JSON-Systemdaten mit `Cache-Control: no-store`.
- Path-Traversal sicher verhindern, auch bei URL-kodierten Pfaden.
- Nicht unterstützte Methoden mit HTTP 405 beantworten.
- Ungültige URLs mit 400, verbotene Pfade mit 403, fehlende Dateien mit 404.

### 12.2 API `GET /api/system-info`

Antwort:

```json
{
  "bootTimeMs": 1760000000000,
  "sessionStartMs": 1760003600000,
  "uptimeSeconds": 12345
}
```

- `bootTimeMs`: aus `Date.now() - os.uptime() * 1000`.
- `sessionStartMs`: unter Windows Startzeit des frühesten `explorer.exe`-Prozesses derselben Benutzersitzung; bei Fehler oder Nicht-Windows `0`.
- `uptimeSeconds`: Wert von `os.uptime()`.
- Externe Befehle mit Timeout, ohne sichtbares Fenster und ohne ungefangenen Fehler ausführen.
- CORS für lokale Nutzung erlauben und `OPTIONS` für Private-Network-Anfragen korrekt beantworten.

## 13. Windows-Start und Autostart

Liefere funktionale Starthelfer:

- `LinkMan starten.cmd`: startet den Server nur, falls Port 8765 noch nicht erreichbar ist, und öffnet danach die Anwendung im Standardbrowser.
- `LinkMan Hintergrundstart.vbs`: startet Node und den Server unsichtbar, ohne dauerhaftes Konsolenfenster.
- `LinkMan Autostart installieren.cmd` plus PowerShell-Skript:
  - prüft, ob Node.js vorhanden ist;
  - erstellt im persönlichen Windows-Autostart eine Verknüpfung;
  - benötigt keine Administratorrechte;
  - startet oder erneuert die laufende LinkMan-Serverinstanz;
  - prüft anschließend `/api/system-info` und meldet Erfolg oder einen verständlichen Fehler.
- `LinkMan Autostart entfernen.cmd` plus PowerShell-Skript:
  - entfernt nur die LinkMan-Verknüpfung;
  - beendet nur Node-Prozesse, deren Kommandozeile auf den LinkMan-Server dieses Projektordners zeigt.
- `AUTOSTART.md` mit kurzer deutscher Anleitung.

Keine fremden Node-Prozesse beenden und keine systemweiten Einstellungen verändern.

## 14. Bedienbarkeit, Barrierearmut und Sicherheit

- Semantische Buttons, Links, Formfelder, Dialogrollen und verständliche `aria-label`s verwenden.
- Tastaturfokus sichtbar machen.
- Dialoge sollen den Fokus sinnvoll setzen, Escape unterstützen und nach Möglichkeit den Fokus beim Schließen zurückgeben.
- Kontextmenüs vollständig innerhalb des sichtbaren Viewports positionieren.
- Nutzerdaten vor HTML-Ausgabe sicher behandeln; kein ungeprüftes `innerHTML` mit Benutzereingaben.
- Externe Links sicher in einem neuen Tab öffnen.
- Keine Ausführung importierter Inhalte und keine dynamische Codeauswertung.
- Löschvorgänge für Links, Buckets, Areas, Widgets und Countdown-Ereignisse bestätigen, sofern sie nicht leicht rückgängig zu machen sind.
- Fehler dürfen keine Nutzerdaten im lokalen Snapshot zerstören.

## 15. Tests und Qualitätssicherung

Liefere automatisierte Tests für die fachlich kritischen Teile. Mindestens:

1. URL-Normalisierung einschließlich fehlendem Protokoll und Ablehnung gefährlicher Protokolle.
2. Import einer Schema-5/6-Datei und Normalisierung auf Schema 8.
3. Erhalt von Kategorien mit Unterbereichen.
4. Bereinigung von doppelten oder verwaisten Reihenfolgeeinträgen.
5. Area-Löschen und Umhängen ihrer Inhalte.
6. Bucket-Kopie mit neuen Link-IDs.
7. Linksortierung innerhalb und zwischen Buckets.
8. Analoge Uhr mit mindestens zwei Zeitzonen.
9. Arbeitszeitberechnung und alle Farbschwellen.
10. Countdown-Tagesberechnung über einen Sommer-/Winterzeitwechsel.
11. Countdown-Sortierung mit zukünftigen, heutigen, vergangenen, gleichen und ungültigen Daten.
12. JSON-Roundtrip ohne Verlust relevanter Felder.
13. Serverantwort von `/api/system-info`.
14. Schutz vor Path Traversal.

Führe außerdem einen End-to-End- oder Browser-Smoke-Test für diesen Ablauf aus:

1. Anwendung starten.
2. Area erstellen und umbenennen.
3. Bucket mit zwei Links erstellen.
4. Links sortieren und einen Link bearbeiten.
5. Bucket in eine andere Area verschieben und mit `Strg` kopieren.
6. Alle vier Widgettypen anlegen und konfigurieren.
7. Countdown-Ereignisse in unsortierter Eingabereihenfolge anlegen und korrekte Anzeige prüfen.
8. Daten exportieren, Anwendung neu laden und Daten wieder importieren.
9. Prüfen, dass Reihenfolgen, Area-Zuordnungen, Einstellungen und Widgetinhalte identisch erhalten sind.

Die Konsole soll beim normalen Betrieb frei von Fehlern und unbehandelten Promise-Rejections sein.

## 16. Abnahmekriterien

Die Neuentwicklung gilt erst als abgeschlossen, wenn:

- alle in dieser Spezifikation genannten Kernfunktionen implementiert sind;
- vorhandene `LinkData.json`, `LinkData1.json` und `LinkData2.json` ohne Datenverlust geladen werden können;
- Speichern und erneutes Laden einen stabilen JSON-Roundtrip ergeben;
- Links, Buckets und Widgets per Drag-and-drop korrekt sortier- und verschiebbar sind;
- Areas einschließlich Verschieben und Kopieren funktionieren;
- alle vier Widgets funktionieren und persistiert werden;
- Countdown-Termine in der beschriebenen Reihenfolge erscheinen;
- der lokale Server und `/api/system-info` funktionieren;
- Windows-Start- und Autostartskripte mit Pfaden funktionieren, die Leerzeichen enthalten;
- automatisierte Tests erfolgreich durchlaufen;
- ein Produktionsstart aus einem frisch ausgecheckten Projekt anhand der README möglich ist;
- keine privaten Beispieldaten fest in Quellcode oder Tests eingebaut wurden.

## 17. Erwartete Liefergegenstände

Mindestens abzugeben sind:

- vollständiger Quellcode der Neuentwicklung;
- statisch auslieferbare Produktionsanwendung beziehungsweise reproduzierbarer Build;
- lokaler Node.js-Server;
- Windows-Start- und Autostarthelfer;
- `README.md` mit Voraussetzungen, Installation, Entwicklung, Tests, Build, Start und Datenmigration;
- automatisierte Tests;
- eine kleine anonymisierte Beispieldatei, z. B. `LinkData.example.json`;
- kurze technische Dokumentation des Datenmodells und der wichtigsten Architekturentscheidungen.

## 18. Vorgehensweise für die umsetzende KI

1. Analysiere die vorhandenen JSON-Dateien und sichere ihre Kompatibilität durch Tests, ohne deren private Inhalte in neue Beispieldaten zu kopieren.
2. Lege eine klare Projektstruktur und ein typisiertes Datenmodell an.
3. Implementiere Migration und Persistenz vor den komplexen UI-Interaktionen.
4. Baue Areas, Buckets und Links einschließlich Reihenfolge und Drag-and-drop.
5. Implementiere die vier Widgets.
6. Implementiere lokalen Server und Windows-Starthelfer.
7. Führe Unit-, Integrations- und Browser-Smoke-Tests aus.
8. Dokumentiere Start, Build, Migration und bekannte Einschränkungen.
9. Liefere keine bloßen Mockups oder Teilimplementierungen. Hinterlasse keine funktionskritischen TODOs.

Bei einer sinnvollen Abweichung von dieser Spezifikation muss die Abweichung vor der Umsetzung begründet werden. Datenkompatibilität, lokale Nutzbarkeit und die beschriebenen Benutzerabläufe haben Vorrang vor der Wahl eines bestimmten Frameworks.
