# Automation script to perform git diffs and compare results

# Paths - Adjust if necessary
$ErrorActionPreference = "Stop" # Exit script on first error

# Determine Workspace Root based on the script's new location
$global:currentScriptDir = $PSScriptRoot
$global:scriptsDir = Split-Path $global:currentScriptDir
$global:caretZeroDir = Split-Path $global:scriptsDir # This should be the workspace root D:\dev\caret-zero

# Verify workspace root (optional, for debugging)
# Write-Output "PSScriptRoot: $PSScriptRoot"
# Write-Output "Current Script Dir: $global:currentScriptDir"
# Write-Output "Scripts Dir: $global:scriptsDir"
# Write-Output "Workspace Root: $global:caretZeroDir"

$global:caretUpstreamDir = Join-Path $global:caretZeroDir "caret-upstream"

$global:caretUpstreamChangesFile = Join-Path $global:caretZeroDir "docs/tasks/029-02-action-git-caret-upstream-changes.txt"
$global:caretZeroChangesFile = Join-Path $global:caretZeroDir "docs/tasks/029-02-action-git-caret-zero-changes.txt"
# Updated path for the Python script
$global:compareScriptPath = Join-Path $global:caretZeroDir "scripts/merging-job/compare_diff_files.py"

Write-Output "=================================================================="
Write-Output "Starting Automated Diff Comparison Process..."
Write-Output "=================================================================="

# --- 1. Extract caret-upstream changes ---
Write-Output "
>>> 1. Extracting caret-upstream changes (v3.10.1 vs v3.16.1)..."
if (Test-Path $global:caretUpstreamDir) {
    try {
        git -C $global:caretUpstreamDir diff --name-only v3.10.1 v3.16.1 > $global:caretUpstreamChangesFile
        Write-Output "SUCCESS: caret-upstream changes written to $global:caretUpstreamChangesFile"
    } catch {
        Write-Error "ERROR in step 1: Failed to run git diff for caret-upstream. Details: $($_.Exception.Message)"
        exit 1
    }
} else {
    Write-Error "ERROR in step 1: caret-upstream directory not found at $($global:caretUpstreamDir)"
    exit 1
}

# --- 2. Extract caret-zero changes ---
Write-Output "
>>> 2. Extracting caret-zero changes (1cd3bd50 vs HEAD)..."
try {
    git diff --name-only 1cd3bd50 HEAD > $global:caretZeroChangesFile
    Write-Output "SUCCESS: caret-zero changes written to $global:caretZeroChangesFile"
} catch {
    Write-Error "ERROR in step 2: Failed to run git diff for caret-zero. Details: $($_.Exception.Message)"
    exit 1
}

# --- 3. Compare diff files using Python script ---
Write-Output "
>>> 3. Comparing diff files using Python script... ($global:compareScriptPath)"
if (Test-Path $global:compareScriptPath) {
    try {
        python $global:compareScriptPath
        # Python script now handles its own success/error messages and exit codes.
        # We check the last exit code from the python script.
        if ($LASTEXITCODE -ne 0) {
            Write-Error "ERROR in step 3: Python script exited with code $LASTEXITCODE. Check Python script logs for details."
            exit 1 # Ensure PowerShell script also exits with an error
        } else {
            Write-Output "SUCCESS: Python script completed successfully. Comparison files generated in scripts/ directory."
        }
    } catch {
        Write-Error "ERROR in step 3: Failed to execute Python script. Details: $($_.Exception.Message)"
        exit 1
    }
} else {
    Write-Error "ERROR in step 3: Python script not found at $($global:compareScriptPath)"
    exit 1
}

Write-Output "
=================================================================="
Write-Output "Automated Diff Comparison Process Completed Successfully!"
Write-Output "=================================================================="

exit 0 