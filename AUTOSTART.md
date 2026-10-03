# LinkMan automatisch mit Windows starten

Damit das Computer-Uptime-Widget die echte Windows-Startzeit anzeigen kann,
muss der kleine lokale LinkMan-Server im Hintergrund laufen.

## Einmalige Einrichtung

1. `LinkMan Autostart installieren.cmd` doppelt anklicken.
2. Der Dienst ist danach fest unter `http://127.0.0.1:8765` erreichbar.

LinkMan verwendet diese Adresse standardmäßig für das Computer-Uptime-Widget.
Der Dienst lädt und speichert außerdem `LinkData.json` automatisch im Projektordner.
Bei laufendem Dienst muss nach dem Start kein Dateidialog bestätigt werden.
Beide Computer benötigen den eingerichteten Autostart und denselben durch Synology Drive synchronisierten Projektordner.
LinkMan prüft die Datei alle zehn Sekunden auf Änderungen. Die Übertragung zwischen Computern übernimmt Synology Drive.

Noch nicht gespeicherte Änderungen werden im Browser gesichert und nach dem nächsten Start erneut geschrieben.
Beim ersten Wechsel zur automatischen Speicherung wird ein abweichender bisheriger Browserstand ebenfalls als separate Kopie gesichert. Der Pfad steht unter Funktionen.
Vor jeder Dateiänderung wird der bisherige Stand im Ordner `LinkMan-Backups` gesichert.
Bei gleichzeitig bearbeiteten unterschiedlichen Ständen wird die lokale Änderung als `Konflikt-*.json` in diesem Ordner gesichert; die aktuelle `LinkData.json` wird nicht überschrieben.
Der Konflikt wird unter Funktionen angezeigt. Die gewünschte Version kann über `JSON öffnen` geladen und anschließend bewusst gespeichert werden.
Synology-Konflikte bei noch nicht übertragenen Änderungen auf beiden Computern müssen zusätzlich in Synology Drive aufgelöst werden.

Die Dienstadresse kann in LinkMan unter **Funktionen** geändert und direkt
getestet werden, falls der Dienst auf einem anderen Computer oder über eine
abweichende Adresse bereitgestellt wird.

Ein Eintrag im persönlichen Windows-Autostart startet LinkMan danach bei jeder
Anmeldung automatisch. Es wird kein CMD-Fenster offengehalten und es sind keine
Administratorrechte erforderlich.

## Entfernen

Zum Abschalten des automatischen Starts
`LinkMan Autostart entfernen.cmd` doppelt anklicken.
