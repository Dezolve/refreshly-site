param(
  [int]$Port = 4180
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$pythonCommand = if (Get-Command py -ErrorAction SilentlyContinue) { "py" } elseif (Get-Command python -ErrorAction SilentlyContinue) { "python" } else { $null }

if (-not $pythonCommand) {
  throw "Python was not found on PATH. Install Python or launch from an environment where `py` or `python` is available."
}

$staleProcesses = Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -eq "python.exe" -and
    $_.CommandLine -match "http\.server\s+$Port(\s|$)"
  }

foreach ($process in $staleProcesses) {
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

$logDir = Join-Path $repoRoot ".tmp"
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

$stdoutLog = Join-Path $logDir "local-server-$Port.out.log"
$stderrLog = Join-Path $logDir "local-server-$Port.err.log"

if (Test-Path $stdoutLog) {
  Remove-Item $stdoutLog -Force
}

if (Test-Path $stderrLog) {
  Remove-Item $stderrLog -Force
}

$arguments = if ($pythonCommand -eq "py") {
  @("-m", "http.server", $Port, "--bind", "0.0.0.0")
} else {
  @("-m", "http.server", $Port, "--bind", "0.0.0.0")
}

$process = Start-Process `
  -FilePath $pythonCommand `
  -ArgumentList $arguments `
  -WorkingDirectory $repoRoot `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog `
  -PassThru

Start-Sleep -Seconds 1

if ($process.HasExited) {
  $stderr = if (Test-Path $stderrLog) { Get-Content $stderrLog -Raw } else { "" }
  throw "Local server failed to start on port $Port.`n$stderr"
}

$ethernetAdapter = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.IPAddress -notmatch "^127\." -and
    $_.IPAddress -notmatch "^169\.254\." -and
    $_.InterfaceAlias -notmatch "vEthernet|WSL|Bluetooth|Loopback"
  } |
  Select-Object -First 1

$lanUrl = if ($ethernetAdapter) { "http://$($ethernetAdapter.IPAddress):$Port" } else { $null }

Write-Output "Local preview server started."
Write-Output "PID: $($process.Id)"
Write-Output "Desktop URL: http://localhost:$Port"
if ($lanUrl) {
  Write-Output "Phone URL: $lanUrl"
}
Write-Output "CSS check: http://localhost:$Port/assets/css/site.css"
Write-Output "Stop it with: .\scripts\Stop-LocalServer.ps1 -Port $Port"
