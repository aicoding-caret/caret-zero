# Get the current version from package.json
$version = (Get-Content -Raw -Path ./package.json | ConvertFrom-Json).version

# Get the current date in YYYYMMDD format
$date = Get-Date -Format "yyyyMMdd"

# Define the output file name
$outputFile = "caret-v$($version)-$($date).vsix"
$releaseFolder = "release"
$outputFolderPath = Join-Path -Path $releaseFolder -ChildPath $outputFile

# Create the release directory if it doesn't exist
if (-not (Test-Path -Path $releaseFolder)) {
    New-Item -ItemType Directory -Path $releaseFolder
}

# Run the vsce package command
# Note: You may need to install vsce globally first: npm install -g @vscode/vsce
npx @vscode/vsce package --out $outputFolderPath

Write-Host "✅ Successfully created release package: $outputFolderPath" 