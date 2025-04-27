# HyperCLOVA X SEED Vision Model Test Script
# Description: This script is for testing the HyperCLOVA X model locally

# --- Configuration ---
# Find project root directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_HOME = Split-Path -Parent $SCRIPT_DIR
$MODEL_PATH = Join-Path -Path $SCRIPT_DIR -ChildPath "models\HyperCLOVAX-SEED-Vision-Instruct-3B"

# Check for environment variables in .env file
$envFile = Join-Path -Path $SCRIPT_DIR -ChildPath ".env"
$envDevice = "cpu"  # Default to CPU for safety

if (Test-Path $envFile) {
    Write-Host "Reading configuration from .env file..."
    $envContent = Get-Content -Path $envFile -ErrorAction SilentlyContinue
    foreach ($line in $envContent) {
        if ($line -match "CARET_HYPERCLOVAX_DEVICE=(.*)") {
            $envDevice = $matches[1].Trim()
            Write-Host "Found device configuration: $envDevice"
        }
    }
}

# Check if CUDA is actually available when requesting CUDA mode
$cudaAvailable = $false
try {
    $cudaAvailable = python -c "import torch; print(torch.cuda.is_available())" 2>$null
    if ($cudaAvailable -eq "True") {
        $cudaAvailable = $true
        Write-Host "PyTorch with CUDA support detected."
        $DEVICE = "cuda"
    } else {
        $cudaAvailable = $false
        Write-Host "PyTorch without CUDA support detected. Will use CPU mode."
        $DEVICE = "cpu"  # Default to CPU if CUDA isn't available
    }
} catch {
    Write-Host "Error checking CUDA availability. Will use CPU mode."
    $DEVICE = "cpu"  # Default to CPU in case of errors
}

# Use environment variable's device if it was set
if ($envDevice -ne "") {
    # Only use cuda if both requested and available
    if ($envDevice -eq "cuda" -and -not $cudaAvailable) {
        Write-Host "WARNING: CUDA requested in .env but not available in PyTorch. Using CPU instead."
        $DEVICE = "cpu"
    } else {
        $DEVICE = $envDevice
    }
}

# Set test image path
$TEST_IMAGE_PATH = Join-Path -Path $PROJECT_HOME -ChildPath "assets\imgs\main_banner.webp"
$PROMPT = "이 이미지를 자세히 설명해 주세요."

Write-Host "=================================================" 
Write-Host "HyperCLOVA X SEED Vision Model Local Test"
Write-Host "Model Path: $MODEL_PATH"
Write-Host "Device: $DEVICE"
Write-Host "Test Image: $TEST_IMAGE_PATH"
Write-Host "=================================================" 
Write-Host ""

# --- Validate Configuration ---
if (-not (Test-Path $MODEL_PATH)) {
    Write-Host "ERROR: Model directory not found: $MODEL_PATH"
    Write-Host "Please run hyperclovax_download.ps1 script first to download the model."
    exit 1
}

if (-not (Test-Path $TEST_IMAGE_PATH)) {
    Write-Host "WARNING: Test image not found: $TEST_IMAGE_PATH"
    Write-Host "Will continue without test image. You'll need to provide input manually."
    $useTestImage = $false
} else {
    $useTestImage = $true
    Write-Host "Test image found. Will use it for automated testing."
}

# --- Check Python and Required Libraries ---
try {
    $pythonVersion = python --version
    Write-Host "Python found: $pythonVersion"
} catch {
    Write-Host "ERROR: Python not found. Please install Python 3.8 or higher."
    exit 1
}

# Check required libraries
try {
    python -c "import torch, PIL, transformers" 2>$null
    Write-Host "Required libraries found (torch, PIL, transformers)"
} catch {
    Write-Host "ERROR: Required Python libraries not found."
    Write-Host "Install them using: pip install torch Pillow transformers einops timm av"
    exit 1
}

# --- Prepare Test Input ---
Write-Host ""
Write-Host "Preparing test input..."

if ($useTestImage) {
    try {
        # Convert image to base64
        $base64String = [Convert]::ToBase64String([IO.File]::ReadAllBytes($TEST_IMAGE_PATH))
        Write-Host "Image converted to base64 successfully."
        
        # Create test JSON
        $testJson = @{
            prompt = $PROMPT
            image_base64 = $base64String
        } | ConvertTo-Json -Compress
        
        # Save to temp file for input
        $tempJsonFile = Join-Path -Path $env:TEMP -ChildPath "hyperclovax_test_input.json"
        $testJson | Out-File -FilePath $tempJsonFile -Encoding utf8
        Write-Host "Test JSON created and saved to temporary file."
        
        $useJsonFile = $true
    } catch {
        Write-Host "WARNING: Failed to prepare test image: $_"
        Write-Host "Will continue with manual input."
        $useJsonFile = $false
    }
} else {
    $useJsonFile = $false
}

# --- Start Test ---
Write-Host ""
Write-Host "Starting HyperCLOVA X inference script..."

if (-not $useJsonFile) {
    Write-Host "Example JSON input: '{\"prompt\": \"Describe this image.\", \"image_base64\": \"...\"}'"
    Write-Host "If running interactively, enter input then EOF (Ctrl+Z followed by Enter)."
}

Write-Host ""

# Run the script
$PYTHON_SCRIPT = Join-Path -Path $SCRIPT_DIR -ChildPath "hyperclovax_test_run.py"

if ($useJsonFile) {
    Write-Host "Running with prepared test image..."
    Get-Content -Path $tempJsonFile | python $PYTHON_SCRIPT --model_path $MODEL_PATH --device $DEVICE
    
    # Clean up temp file
    Remove-Item -Path $tempJsonFile -Force -ErrorAction SilentlyContinue
} else {
    # Run with manual input
    python $PYTHON_SCRIPT --model_path $MODEL_PATH --device $DEVICE
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python script execution failed. Check the output above."
} else {
    Write-Host "Python script executed successfully."
}

Write-Host ""
pause