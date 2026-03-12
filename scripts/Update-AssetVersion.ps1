param(
  [string]$Version = (Get-Date -Format "yyyyMMdd-HHmmss")
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$targetFiles = @(
  "index.html",
  "privacy.html",
  "support.html",
  "terms.html"
)

foreach ($relativePath in $targetFiles) {
  $fullPath = Join-Path $repoRoot $relativePath
  $content = Get-Content $fullPath -Raw

  $updated = $content `
    -replace '/assets/css/site\.css(?:\?v=[^"]*)?', "/assets/css/site.css?v=$Version" `
    -replace '/assets/js/site\.js(?:\?v=[^"]*)?', "/assets/js/site.js?v=$Version"

  Set-Content -Path $fullPath -Value $updated -NoNewline
}

Write-Output "Updated asset version to $Version"
foreach ($relativePath in $targetFiles) {
  Write-Output $relativePath
}
