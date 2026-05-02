$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$releaseRoot = Join-Path $projectRoot "release\ArsonistTimerDesktop"
$electronRuntime = Join-Path $projectRoot "node_modules\electron\dist"
$appRoot = Join-Path $releaseRoot "resources\app"
$exePath = Join-Path $releaseRoot "ArsonistTimer.exe"
$iconPath = Join-Path $projectRoot "electron\assets\arsonisttimer-clock.ico"

$resolvedProject = (Resolve-Path $projectRoot).Path
$releaseParent = Join-Path $projectRoot "release"
if (-not (Test-Path $releaseParent)) {
  New-Item -ItemType Directory -Path $releaseParent | Out-Null
}

if (Test-Path $releaseRoot) {
  $resolvedRelease = (Resolve-Path $releaseRoot).Path
  if (-not $resolvedRelease.StartsWith($resolvedProject, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove release folder outside project: $resolvedRelease"
  }
  Remove-Item -LiteralPath $releaseRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $releaseRoot | Out-Null
Copy-Item -Path (Join-Path $electronRuntime "*") -Destination $releaseRoot -Recurse -Force
Rename-Item -LiteralPath (Join-Path $releaseRoot "electron.exe") -NewName "ArsonistTimer.exe"

New-Item -ItemType Directory -Path $appRoot | Out-Null
Copy-Item -Path (Join-Path $projectRoot "dist") -Destination $appRoot -Recurse -Force
Copy-Item -Path (Join-Path $projectRoot "electron") -Destination $appRoot -Recurse -Force
Copy-Item -Path (Join-Path $projectRoot "package.json") -Destination $appRoot -Force

$rceditScript = @'
const { rcedit } = require("rcedit");

rcedit(process.argv[2], {
  icon: process.argv[3],
  "file-version": "2.0.0",
  "product-version": "2.0.0",
  "version-string": {
    CompanyName: "ArsonistTimer",
    FileDescription: "ArsonistTimer",
    InternalName: "ArsonistTimer",
    OriginalFilename: "ArsonistTimer.exe",
    ProductName: "ArsonistTimer"
  }
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
'@

$rceditScriptPath = Join-Path $releaseRoot "rcedit-arsonist.cjs"
Set-Content -LiteralPath $rceditScriptPath -Value $rceditScript -Encoding UTF8
node $rceditScriptPath $exePath $iconPath
if ($LASTEXITCODE -ne 0) {
  throw "Failed to update ArsonistTimer.exe resources."
}
Remove-Item -LiteralPath $rceditScriptPath -Force

Write-Host "Packaged local app:"
Write-Host $exePath
