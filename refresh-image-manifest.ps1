$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
if (-not $projectRoot) {
  $projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
}

$imagesRoot = Join-Path $projectRoot "assets/images"
$manifestPath = Join-Path $projectRoot "assets/js/image-manifest.js"
$allowedExtensions = @(".jpg", ".jpeg", ".png", ".webp", ".svg")
$excludePattern = "(logo|favicon)"

if (-not (Test-Path $imagesRoot)) {
  throw "Could not find image folder at $imagesRoot"
}

$images = Get-ChildItem -Path $imagesRoot -File |
  Where-Object {
    $allowedExtensions -contains $_.Extension.ToLowerInvariant() -and
    $_.Name -notmatch $excludePattern
  } |
  Sort-Object Name |
  ForEach-Object {
    "assets/images/$($_.Name)"
  }

$manifestLines = @("window.SharonCraftImageManifest = [")

foreach ($image in $images) {
  $encoded = ($image | ConvertTo-Json -Compress)
  $manifestLines += "  $encoded,"
}

$manifestLines += "];"

$manifestContent = ($manifestLines -join [Environment]::NewLine)
[System.IO.File]::WriteAllText($manifestPath, $manifestContent, [System.Text.Encoding]::UTF8)

Write-Output "Updated image manifest with $($images.Count) images."
