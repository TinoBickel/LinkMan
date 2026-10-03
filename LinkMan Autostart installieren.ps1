$ErrorActionPreference = 'Stop'

$projectDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverScript = Join-Path $projectDirectory 'server.js'
$launcherScript = Join-Path $projectDirectory 'LinkMan Hintergrundstart.vbs'
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue

if (-not $nodeCommand) {
    throw 'Node.js wurde nicht gefunden. Bitte zuerst Node.js installieren.'
}

if (-not (Test-Path -LiteralPath $serverScript -PathType Leaf)) {
    throw "server.js wurde nicht gefunden: $serverScript"
}

if (-not (Test-Path -LiteralPath $launcherScript -PathType Leaf)) {
    throw "Der Hintergrundstarter wurde nicht gefunden: $launcherScript"
}

$startupDirectory = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupDirectory 'LinkMan Local Server.lnk'
$wscriptPath = Join-Path $env:WINDIR 'System32\wscript.exe'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $wscriptPath
$shortcut.Arguments = ('"{0}" "{1}"' -f $launcherScript, $nodeCommand.Source)
$shortcut.WorkingDirectory = $projectDirectory
$shortcut.WindowStyle = 7
$shortcut.Description = 'Startet den lokalen LinkMan-Server unsichtbar.'
$shortcut.Save()

$serverProcesses = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
        $_.CommandLine -and
        $_.CommandLine.IndexOf($serverScript, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
    }
foreach ($process in $serverProcesses) {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 300
Start-Process -FilePath $wscriptPath -ArgumentList ('"{0}" "{1}"' -f $launcherScript, $nodeCommand.Source) -WindowStyle Hidden

$available = $false
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    try {
        $response = Invoke-RestMethod -Uri 'http://127.0.0.1:8765/api/system-info' -TimeoutSec 1
        if ($null -ne $response.sessionStartMs) {
            $available = $true
            break
        }
    } catch {
        # Der Server braucht beim ersten Start eventuell einen kurzen Moment.
    }
}

if (-not $available) {
    throw 'Der Autostart wurde angelegt, aber LinkMan ist noch nicht erreichbar.'
}

Write-Host ''
Write-Host 'LinkMan-Autostart wurde erfolgreich eingerichtet.' -ForegroundColor Green
Write-Host 'Bitte diese Adresse als Browser-Startseite verwenden:'
Write-Host 'http://127.0.0.1:8765' -ForegroundColor Cyan
