# ORION Mission Control — Startup Script
# Opens the official development repository and launches Cursor.

$RepoPath = "E:\ORION\orion-app"

Write-Host ""
Write-Host "ORION Mission Control" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $RepoPath)) {
    Write-Host "Repository not found: $RepoPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Mission Control Status" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Repository: Unhealthy" -ForegroundColor Red
    Write-Host "GitHub: Unknown" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Set-Location $RepoPath

Write-Host "Verifying repository..." -ForegroundColor Gray
Write-Host ""
Get-Location
Write-Host ""

Write-Host "Git status:" -ForegroundColor Gray
git status
Write-Host ""

Write-Host "Synchronizing with GitHub..." -ForegroundColor Gray
git pull origin main
Write-Host ""

Write-Host "Latest commit:" -ForegroundColor Gray
git log -1 --oneline
Write-Host ""

$cursorCmd = Get-Command cursor -ErrorAction SilentlyContinue

if ($cursorCmd) {
    Write-Host "Launching Cursor..." -ForegroundColor Green

    try {
        & $cursorCmd.Source $RepoPath
    }
    catch {
        Write-Host "Failed to launch Cursor." -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}
else {
    Write-Host "Cursor command not found." -ForegroundColor Yellow
    Write-Host "Please open Cursor manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Mission Control Status" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repository: Healthy" -ForegroundColor Green
Write-Host "GitHub: Synchronized" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
