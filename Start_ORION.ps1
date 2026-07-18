# =============================================================================
# ORION Mission Control — Engineering Launcher v1.0
# =============================================================================
#
# Official startup script for the ORION Platform development repository.
# Verifies repository health, synchronizes with GitHub, and displays
# the current engineering context before each development session.
#
# Repository : E:\ORION\orion-app
# Branch     : main
# Owner      : Mohammad Shafi Goroo — Founder & CEO
#
# Usage      : Run Start_ORION.bat or execute this script directly.
# =============================================================================

#region Configuration

# Official ORION development repository (Mission Control source of truth)
$RepoPath = "E:\ORION\orion-app"

# Founder identity for session greeting
$FounderName = "Mohammad Shafi Goroo"

# Current engineering context — update at the start of each sprint
$CurrentSprint = "11E"
$EngineeringSpec = "ES-011"

#endregion Configuration

#region Helper Functions

<#
.SYNOPSIS
    Returns a time-appropriate greeting for the Founder.
#>
function Get-FounderGreeting {
    $hour = (Get-Date).Hour

    $period = switch ($hour) {
        { $_ -ge 5 -and $_ -lt 12 } { "Good morning" }
        { $_ -ge 12 -and $_ -lt 17 } { "Good afternoon" }
        default { "Good evening" }
    }

    return "$period, $FounderName."
}

<#
.SYNOPSIS
    Displays the Mission Control banner.
#>
function Show-MissionControlBanner {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "  ORION MISSION CONTROL v1.0" -ForegroundColor Cyan
    Write-Host "  Engineering Launcher" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
}

<#
.SYNOPSIS
    Displays the current engineering context.
#>
function Show-EngineeringContext {
    param(
        [string]$Branch
    )

    Write-Host "Engineering Context" -ForegroundColor Yellow
    Write-Host "-------------------" -ForegroundColor DarkGray
    Write-Host ("  Repository              : {0}" -f $RepoPath)
    Write-Host ("  Current Branch          : {0}" -f $Branch)
    Write-Host ("  Sprint                  : {0}" -f $CurrentSprint)
    Write-Host ("  Engineering Specification : {0}" -f $EngineeringSpec)
    Write-Host ""
}

<#
.SYNOPSIS
    Returns concise repository health indicators.
#>
function Get-RepositoryHealth {
    param(
        [bool]$PullSucceeded
    )

    # Working tree state
    $statusOutput = git status --porcelain 2>$null
    $workingTreeClean = [string]::IsNullOrWhiteSpace($statusOutput)
    $workingTreeStatus = if ($workingTreeClean) { "Clean" } else { "Modified" }

    # Remote sync state (based on post-pull branch tracking)
    $githubStatus = if ($PullSucceeded) { "Synchronized" } else { "Sync failed" }

    $branchStatus = git status -sb 2>$null | Select-Object -First 1

    if ($branchStatus -match "\[ahead (\d+)\]") {
        $githubStatus = "Ahead"
    }
    elseif ($branchStatus -match "\[behind (\d+)\]") {
        $githubStatus = "Behind"
    }
    elseif ($branchStatus -match "\[ahead (\d+), behind (\d+)\]") {
        $githubStatus = "Diverged"
    }

    # Overall health
    $overallHealthy = $workingTreeClean -and $PullSucceeded -and ($githubStatus -eq "Synchronized" -or $githubStatus -eq "Ahead")
    $overallStatus = if ($overallHealthy) { "Healthy" } else { "Attention Required" }

    return [PSCustomObject]@{
        WorkingTree = $workingTreeStatus
        GitHub      = $githubStatus
        Overall     = $overallStatus
        IsClean     = $workingTreeClean
    }
}

<#
.SYNOPSIS
    Displays concise repository health status.
#>
function Show-RepositoryHealth {
    param(
        [PSCustomObject]$Health
    )

    Write-Host "Repository Health" -ForegroundColor Yellow
    Write-Host "-----------------" -ForegroundColor DarkGray
    Write-Host ("  Working Tree : {0}" -f $Health.WorkingTree)
    Write-Host ("  GitHub       : {0}" -f $Health.GitHub)
    Write-Host ("  Overall      : {0}" -f $Health.Overall)
    Write-Host ""
}

<#
.SYNOPSIS
    Displays the Mission Control session summary.
#>
function Show-MissionControlSummary {
    param(
        [PSCustomObject]$Health,
        [string]$LatestCommit
    )

    Write-Host "Mission Control Summary" -ForegroundColor Cyan
    Write-Host "-----------------------" -ForegroundColor DarkGray
    Write-Host ("  Sprint       : {0}" -f $CurrentSprint)
    Write-Host ("  Specification: {0}" -f $EngineeringSpec)
    Write-Host ("  Repository   : {0}" -f $Health.Overall)
    Write-Host ("  GitHub       : {0}" -f $Health.GitHub)
    Write-Host ("  Latest Commit: {0}" -f $LatestCommit)
    Write-Host ""
}

<#
.SYNOPSIS
    Waits for a key press before closing the window.
#>
function Wait-ForExit {
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

#endregion Helper Functions

#region Main

Show-MissionControlBanner
Write-Host (Get-FounderGreeting) -ForegroundColor Green
Write-Host ""

# Validate repository path before continuing
if (-not (Test-Path $RepoPath)) {
    Write-Host "Repository not found: $RepoPath" -ForegroundColor Red
    Write-Host ""
    Show-MissionControlSummary -Health ([PSCustomObject]@{
        WorkingTree = "Unknown"
        GitHub      = "Unknown"
        Overall     = "Unhealthy"
        IsClean     = $false
    }) -LatestCommit "Unavailable"
    Wait-ForExit
    exit 1
}

Set-Location $RepoPath

# Resolve current branch for context and health checks
$currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($currentBranch)) {
    $currentBranch = "unknown"
}

Show-EngineeringContext -Branch $currentBranch

# Synchronize with GitHub
Write-Host "Synchronizing with GitHub..." -ForegroundColor Gray
git pull origin main
$pullSucceeded = ($LASTEXITCODE -eq 0)
Write-Host ""

# Show concise changes only when the working tree is not clean
$health = Get-RepositoryHealth -PullSucceeded $pullSucceeded

if (-not $health.IsClean) {
    Write-Host "Pending Changes" -ForegroundColor Yellow
    Write-Host "---------------" -ForegroundColor DarkGray
    git status --short
    Write-Host ""
}

Show-RepositoryHealth -Health $health

# Display latest commit
Write-Host "Latest Commit" -ForegroundColor Yellow
Write-Host "-------------" -ForegroundColor DarkGray
$latestCommit = git log -1 --oneline 2>$null
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($latestCommit)) {
    $latestCommit = "Unavailable"
}
Write-Host "  $latestCommit"
Write-Host ""

Show-MissionControlSummary -Health $health -LatestCommit $latestCommit
Wait-ForExit

#endregion Main
