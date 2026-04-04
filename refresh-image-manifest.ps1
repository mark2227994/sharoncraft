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

$images = Get-ChildItem -Path $imagesRoot -File -Recurse |
  Where-Object {
    $allowedExtensions -contains $_.Extension.ToLowerInvariant() -and
    $_.Name -notmatch $excludePattern -and
    $_.Name -ne ".gitkeep"
  } |
  Sort-Object Name |
  ForEach-Object {
    $relativePath = $_.FullName.Substring($imagesRoot.Length).TrimStart('\', '/').Replace('\', '/')
    "assets/images/$relativePath"
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
