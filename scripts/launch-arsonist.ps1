$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$pathValue = [System.Environment]::GetEnvironmentVariable("Path", "Process")
if (-not $pathValue) {
  $pathValue = [System.Environment]::GetEnvironmentVariable("PATH", "Process")
}
[System.Environment]::SetEnvironmentVariable("PATH", $null, "Process")
[System.Environment]::SetEnvironmentVariable("Path", $pathValue, "Process")

$npm = (Get-Command npm.cmd).Source
$localExe = Join-Path $projectRoot "release\ArsonistTimerDesktop\ArsonistTimer.exe"

if (Test-Path $localExe) {
  Start-Process -FilePath $localExe -WorkingDirectory (Split-Path -Parent $localExe) -WindowStyle Normal
  exit
}

if (-not (Test-Path (Join-Path $projectRoot "dist/index.html"))) {
  $build = Start-Process -FilePath $npm -ArgumentList @("run", "build") -WorkingDirectory $projectRoot -Wait -PassThru -WindowStyle Hidden
  if ($build.ExitCode -ne 0) {
    throw "Arsonist build failed with exit code $($build.ExitCode)."
  }
}

Start-Process -FilePath $npm -ArgumentList @("run", "app:open") -WorkingDirectory $projectRoot -WindowStyle Hidden
