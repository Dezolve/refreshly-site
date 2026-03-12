param(
  [int]$Port = 4180
)

$ErrorActionPreference = "Stop"

function Test-Url {
  param(
    [string]$Url
  )

  try {
    $response = curl.exe -I --silent --show-error $Url
    Write-Output "OK  $Url"
    Write-Output $response
  } catch {
    Write-Output "FAIL $Url"
    Write-Output $_.Exception.Message
  }
}

Test-Url -Url "http://localhost:$Port/"
Test-Url -Url "http://localhost:$Port/assets/css/site.css"
