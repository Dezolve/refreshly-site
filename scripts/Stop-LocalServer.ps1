param(
  [int]$Port = 4180
)

$ErrorActionPreference = "Stop"

$processes = Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -eq "python.exe" -and
    $_.CommandLine -match "http\.server\s+$Port(\s|$)"
  }

if (-not $processes) {
  Write-Output "No local preview server found on port $Port."
  exit 0
}

foreach ($process in $processes) {
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

Write-Output "Stopped local preview server on port $Port."
