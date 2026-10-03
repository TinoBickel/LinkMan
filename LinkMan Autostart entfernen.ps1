$ErrorActionPreference = 'Stop'

$projectDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverScript = Join-Path $projectDirectory 'server.js'
$startupDirectory = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupDirectory 'LinkMan Local Server.lnk'

if (Test-Path -LiteralPath $shortcutPath) {
    Remove-Item -LiteralPath $shortcutPath -Force
    Write-Host 'Der LinkMan-Autostart wurde entfernt.' -ForegroundColor Green
} else {
    Write-Host 'Es ist kein LinkMan-Autostart eingerichtet.'
}

$serverProcesses = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
        $_.CommandLine -and
        $_.CommandLine.IndexOf($serverScript, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
    }

foreach ($process in $serverProcesses) {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

