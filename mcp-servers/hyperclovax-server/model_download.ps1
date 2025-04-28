# HyperCLOVA X SEED Vision Model Downloader
# Configuration
$MODEL_NAME = "naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B"

# Get script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

# Calculate download directory relative to the script location
# Create 'models' subdir within the script's directory
$MODEL_SUBDIR = $MODEL_NAME -replace '/', '-' # Replace slashes for directory name
$DOWNLOAD_DIR = Join-Path $SCRIPT_DIR "models/$MODEL_SUBDIR" # Path is now script_dir/models/model-name

# .env 파일에서 HUGGINGFACE_TOKEN 읽기 (이 부분은 유지)
$envPath = Join-Path $SCRIPT_DIR ".env"
if (Test-Path $envPath) {
    if ($envContent = Get-Content $envPath | Where-Object { $_ -match '^HUGGINGFACE_TOKEN=' }) {
        $HUGGINGFACE_TOKEN = $envContent -replace '^HUGGINGFACE_TOKEN=', ''
    } else {
        Write-Host "ERROR: .env 파일에 HUGGINGFACE_TOKEN이 없습니다."
        exit 1
    }
} else {
    Write-Host "ERROR: .env 파일을 찾을 수 없습니다: $envPath"
    exit 1
}

Write-Host "================================================="
Write-Host "Downloading HyperCLOVA X SEED Vision Model"
Write-Host "Model: $MODEL_NAME"
Write-Host "Script Dir: $SCRIPT_DIR"
Write-Host "Target Directory: $DOWNLOAD_DIR"
Write-Host "================================================="
Write-Host ""
# Check Python
Write-Host "Checking for Python..."
try {
    $pythonVersion = python --version
    Write-Host "Python found: $pythonVersion"
} catch {
    Write-Host "ERROR: Python not found or not in PATH. Please install Python 3.8+ and ensure it's in your PATH."
    exit 1
}

# Check pip
Write-Host "Checking for pip..."
try {
    $pipVersion = python -m pip --version
    Write-Host "pip found: $pipVersion"
} catch {
    Write-Host "ERROR: pip not found. Please ensure pip is installed for your Python environment."
    exit 1
}

# Ensure required Python packages for model download
Write-Host "Checking and installing required Python packages for model download..."
$requiredPackages = @("huggingface_hub[cli]", "transformers", "Pillow")
foreach ($pkg in $requiredPackages) {
    $pkgName = $pkg.Split('[')[0]
    $checkCmd = "import importlib.util; exit(0) if importlib.util.find_spec('" + $pkgName + "') else exit(1)"
    python -c $checkCmd
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Installing $pkg..."
        python -m pip install $pkg
    } else {
        Write-Host "$pkg already installed."
    }
}

# Check Required Runtime Libraries
Write-Host "Checking for required runtime Python libraries (torch)..."
try {
    python -c "import torch" 2>$null
    Write-Host "Required runtime libraries already installed."
} catch {
    Write-Host "Runtime libraries not found or incomplete. Attempting installation..."
    Write-Host "Installing torch... This might take some time."
    python -m pip install torch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install runtime libraries. Please install them manually:"
        Write-Host "pip install torch"
        Write-Host "For GPU support, refer to PyTorch installation instructions: https://pytorch.org/get-started/locally/"
        exit 1
    }
    Write-Host "Runtime libraries installed successfully."
}

# Find huggingface-cli executable
$cliCandidates = @(
    (Join-Path $env:USERPROFILE "AppData\Roaming\Python\Python*\Scripts\huggingface-cli.exe"),
    (Join-Path $env:LOCALAPPDATA "Packages\PythonSoftwareFoundation.Python.*\LocalCache\local-packages\Python*\Scripts\huggingface-cli.exe")
)
$cliPath = $null
foreach ($pattern in $cliCandidates) {
    $found = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $cliPath = $found.FullName; break }
}
if (-not $cliPath) {
    Write-Host "ERROR: huggingface-cli not found. Please add it to PATH or specify the full path."
    exit 1
}

# Hugging Face Token from .env
if ($envContent = Get-Content $envPath | Where-Object { $_ -match '^HUGGINGFACE_TOKEN=' }) {
    $HUGGINGFACE_TOKEN = $envContent -replace '^HUGGINGFACE_TOKEN=', ''
} else {
    Write-Host "ERROR: .env 파일에 HUGGINGFACE_TOKEN이 없습니다."
    exit 1
}

Write-Host "Checking Hugging Face CLI login status..."
# 로그인(토큰 직접 사용)
& $cliPath login --token $HUGGINGFACE_TOKEN
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Hugging Face CLI 로그인 실패. 토큰을 확인하세요."
    exit 1
}

Write-Host "Creating target directory if it doesn't exist: $DOWNLOAD_DIR"
if (-not (Test-Path $DOWNLOAD_DIR)) {
    New-Item -Path $DOWNLOAD_DIR -ItemType Directory -Force | Out-Null
    Write-Host "Directory created."
} else {
    Write-Host "Directory already exists."
}

Write-Host "Starting model download using huggingface-cli..."
& $cliPath download $MODEL_NAME --local-dir $DOWNLOAD_DIR --local-dir-use-symlinks False
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Model download failed. Check network connection, Hugging Face token, and available disk space."
    exit 1
}
Write-Host "Model download completed successfully to $DOWNLOAD_DIR."

Write-Host "=================================================="
Write-Host "Download Complete!"
Write-Host "=================================================="
Write-Host ""
Write-Host "NEXT STEPS:"
Write-Host "1. Ensure the .env file in '$SCRIPT_DIR' has the correct MODEL_PATH pointing to:"
Write-Host " MODEL_PATH=$DOWNLOAD_DIR"
Write-Host "2. Run build_and_run_windows.ps1 :"
Write-Host ""

pause
