# HyperCLOVA X SEED Vision Model Downloader
# Configuration
$MODEL_NAME = "naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B"

# Get project root directory (project_home) based on script location
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_HOME = Split-Path -Parent $SCRIPT_DIR
$DOWNLOAD_DIR = Join-Path -Path $PROJECT_HOME -ChildPath "sllm\models\HyperCLOVAX-SEED-Vision-Instruct-3B"

Write-Host "================================================="
Write-Host "Downloading HyperCLOVA X SEED Vision Model"
Write-Host "Model: $MODEL_NAME"
Write-Host "Project Home: $PROJECT_HOME"
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

# Check Required Setup Libraries
Write-Host "Checking for required setup Python libraries (transformers, huggingface_hub)..."
try {
    python -c "import transformers, huggingface_hub" 2>$null
    Write-Host "Required setup libraries already installed."
} catch {
    Write-Host "Setup libraries not found or incomplete. Attempting installation..."
    python -m pip install transformers huggingface_hub
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install setup libraries. Please install them manually:"
        Write-Host "pip install transformers huggingface_hub"
        exit 1
    }
    Write-Host "Setup libraries installed successfully."
}

# Check Required Runtime Libraries
Write-Host "Checking for required runtime Python libraries (torch, Pillow)..."
try {
    python -c "import torch, PIL" 2>$null
    Write-Host "Required runtime libraries already installed."
} catch {
    Write-Host "Runtime libraries not found or incomplete. Attempting installation..."
    Write-Host "Installing torch and Pillow... This might take some time."
    python -m pip install torch Pillow
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install runtime libraries. Please install them manually:"
        Write-Host "pip install torch Pillow"
        Write-Host "For GPU support, refer to PyTorch installation instructions: https://pytorch.org/get-started/locally/"
        exit 1
    }
    Write-Host "Runtime libraries installed successfully."
}

# Check Hugging Face Login
Write-Host "Checking Hugging Face CLI login status..."
try {
    huggingface-cli whoami 2>$null
    Write-Host "Already logged in to Hugging Face CLI."
} catch {
    Write-Host "WARNING: Not logged in to Hugging Face CLI."
    Write-Host "Attempting login. Please enter your Hugging Face Hub token when prompted."
    huggingface-cli login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Hugging Face CLI login failed. Please log in manually using 'huggingface-cli login'."
        Write-Host "You might need to install huggingface_hub first: pip install huggingface_hub"
        exit 1
    }
    Write-Host "Hugging Face CLI login successful."
}

# Create Target Directory
Write-Host "Creating target directory if it doesn't exist: $DOWNLOAD_DIR"
if (-not (Test-Path $DOWNLOAD_DIR)) {
    try {
        New-Item -Path $DOWNLOAD_DIR -ItemType Directory -Force | Out-Null
        Write-Host "Directory created."
    } catch {
        Write-Host "ERROR: Failed to create directory $DOWNLOAD_DIR. Check permissions."
        exit 1
    }
} else {
    Write-Host "Directory already exists."
}

# Download Model
Write-Host "Starting model download using huggingface-cli..."
huggingface-cli download $MODEL_NAME --local-dir $DOWNLOAD_DIR --local-dir-use-symlinks False
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Model download failed. Check network connection, Hugging Face token, and available disk space."
    exit 1
}
Write-Host "Model download completed successfully to $DOWNLOAD_DIR."

Write-Host "=================================================="
Write-Host "Setup Complete!"
Write-Host "=================================================="
Write-Host ""
Write-Host "NEXT STEPS:"
Write-Host "1. Set the environment variable CARET_HYPERCLOVAX_MODEL_PATH to:"
Write-Host $DOWNLOAD_DIR
Write-Host "2. (Optional) Set CARET_HYPERCLOVAX_DEVICE to 'cuda' or 'cpu'."
Write-Host "3. Restart Caret or your terminal for the environment variables to take effect."
Write-Host ""

pause