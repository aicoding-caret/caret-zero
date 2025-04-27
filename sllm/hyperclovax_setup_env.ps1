# HyperCLOVA X Environment Setup Script
# This script sets up Python environment for HyperCLOVA X model inference

Write-Host "=================================================="
Write-Host "HyperCLOVA X Environment Setup"
Write-Host "=================================================="
Write-Host ""
# Find Python and check version
try {
    $pythonVersion = python --version
    $pythonMajorVersion = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
    Write-Host "Python found: $pythonVersion (Version: $pythonMajorVersion)"
    
    # Check if this is Windows Store Python (which has limitations)
    $pythonPath = python -c "import sys; print(sys.executable)" 2>$null
    $isWindowsStorePython = $pythonPath -match "WindowsApps"
    
    if ($isWindowsStorePython) {
        Write-Host "IMPORTANT: Windows Store Python detected. This version has limitations for package installation."
        Write-Host "Some packages may report as installed but fail to import. We'll try to work around these issues."
        Write-Host "For best results, consider installing a standard Python distribution from python.org."
        Write-Host ""
    }
    
    # Check if Python version is compatible
    $pythonVersionArray = $pythonMajorVersion -split '\.'
    
    # Check if the split worked as expected
    if ($pythonVersionArray.Count -ge 2) {
        $majorVersion = [int]$pythonVersionArray[0]
        $minorVersion = [int]$pythonVersionArray[1]
        
        if ($majorVersion -lt 3 -or ($majorVersion -eq 3 -and $minorVersion -lt 8)) {
            Write-Host "WARNING: Python version $pythonMajorVersion may be too old. PyTorch works best with Python 3.8-3.10."
        }
        if ($majorVersion -gt 3 -or ($majorVersion -eq 3 -and $minorVersion -gt 11)) {
            Write-Host "WARNING: Python version $pythonMajorVersion is very new. PyTorch may not fully support it yet."
            Write-Host "If torch installation fails, consider using Python 3.8-3.10 for best compatibility."
        }
    } else {
        Write-Host "WARNING: Could not parse Python version correctly. Continuing anyway."
    }
} catch {
    Write-Host "ERROR: Python not found. Please install Python 3.8 or higher."
    exit 1
}

# Get script and project directories
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_HOME = Split-Path -Parent $SCRIPT_DIR

# IMPORTANT: We will NOT use virtual environment to ensure compatibility with Caret
# Since Caret runs outside the virtual environment, we need system-wide packages
$PYTHON_EXECUTABLE = "python"
Write-Host "Using system Python for global installation (for Caret compatibility)"
Write-Host "Python executable: $PYTHON_EXECUTABLE"

# Create data directory if it doesn't exist
$DATA_DIR = Join-Path -Path $SCRIPT_DIR -ChildPath "models"
if (-not (Test-Path $DATA_DIR)) {
    New-Item -Path $DATA_DIR -ItemType Directory -Force | Out-Null
    Write-Host "Created models directory at $DATA_DIR"
}

# Flag file to track successful installation
$SUCCESS_FLAG = Join-Path -Path $SCRIPT_DIR -ChildPath ".hyperclovax_setup_complete"

# Flag to track if CUDA is available for PyTorch
$cudaAvailable = $false

# Check if we've already completed setup successfully
if (Test-Path $SUCCESS_FLAG) {
    $setupTime = Get-Content $SUCCESS_FLAG
    Write-Host "\nSetup was previously completed successfully on $setupTime"
    $reinstall = Read-Host "Do you want to reinstall packages anyway? (y/N)"
    if ($reinstall -ne "y" -and $reinstall -ne "Y") {
        Write-Host "Skipping installation. Setup is already complete."
        exit 0
    }
    Write-Host "Reinstalling packages..."
}

Write-Host "\nInstalling required packages globally..."
Write-Host "This may take some time, especially for PyTorch.\n"

# Create a list to track missing packages
$missingPackages = @()

# First check for FFmpeg (required for PyAV/av)
Write-Host "Checking for FFmpeg (required for PyAV/av package)..."
$ffmpegInstalled = $false

try {
    $ffmpegVersion = ffmpeg -version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "FFmpeg found: $($ffmpegVersion[0])"
        $ffmpegInstalled = $true
    }
} catch {
    Write-Host "FFmpeg not found in PATH."
}

if (-not $ffmpegInstalled) {
    Write-Host "Attempting to download and install FFmpeg automatically..."
    $ffmpegTempPath = Join-Path -Path $env:TEMP -ChildPath "ffmpeg_temp"
    $ffmpegZipPath = Join-Path -Path $ffmpegTempPath -ChildPath "ffmpeg.zip"
    $ffmpegExtractPath = Join-Path -Path $ffmpegTempPath -ChildPath "extract"
    $ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
    
    # Create temp directory
    New-Item -Path $ffmpegTempPath -ItemType Directory -Force | Out-Null
    
    try {
        # Download FFmpeg
        Write-Host "Downloading FFmpeg..."
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $ffmpegUrl -OutFile $ffmpegZipPath
        
        # Extract FFmpeg
        Write-Host "Extracting FFmpeg..."
        Expand-Archive -Path $ffmpegZipPath -DestinationPath $ffmpegExtractPath -Force
        
        # Find the bin directory
        $ffmpegBinDir = Get-ChildItem -Path $ffmpegExtractPath -Recurse -Directory | Where-Object { $_.Name -eq "bin" } | Select-Object -First 1
        
        if ($ffmpegBinDir) {
            # Add to session PATH
            $env:Path = "$($ffmpegBinDir.FullName);$env:Path"
            Write-Host "FFmpeg added to PATH for current session: $($ffmpegBinDir.FullName)"
            $ffmpegInstalled = $true
            
            # Option to add to permanent PATH
            Write-Host "Note: For future sessions, you may want to add FFmpeg to your system PATH."
        } else {
            Write-Host "WARNING: Could not find FFmpeg bin directory in extracted files."
        }
    } catch {
        Write-Host "WARNING: Failed to download or extract FFmpeg: $_"
        Write-Host "You may need to download and install FFmpeg manually from https://ffmpeg.org/download.html"
    }
}

# Special handling for av package
Write-Host "\nChecking for PyAV (av) package..."
try {
    $avImportResult = & $PYTHON_EXECUTABLE -c "import av; print('PyAV available')" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PyAV package (av) is installed and working."
    } else {
        Write-Host "PyAV package (av) not working. Attempting to install..."
        
        # Try to install with pip
        & $PYTHON_EXECUTABLE -m pip install av --no-cache-dir
        
        # If that fails, try specific installation methods
        $avImportResult = & $PYTHON_EXECUTABLE -c "import av; print('PyAV available')" 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Standard installation failed. Trying alternative methods..."
            
            # Try with --no-deps first
            & $PYTHON_EXECUTABLE -m pip install av --no-deps
            & $PYTHON_EXECUTABLE -m pip install av
            
            # Check again
            $avImportResult = & $PYTHON_EXECUTABLE -c "import av; print('PyAV available')" 2>$null
        }
        
        # Final check
        if ($LASTEXITCODE -eq 0) {
            Write-Host "PyAV package installed successfully."
        } else {
            Write-Host "WARNING: Could not install PyAV (av). Video processing may not work."
            $missingPackages += "av"
            
            # Try to modify the model code to handle missing av package
            Modify-ModelCodeForAvPackage
        }
    }
} catch {
    Write-Host "ERROR checking/installing PyAV (av): $_"
    Write-Host "Video processing may not work. Continuing with installation."
    $missingPackages += "av"
}

# Function to modify preprocessor.py for missing av package
function Modify-ModelCodeForAvPackage {
    Write-Host "Attempting to modify model code to work without av package..."
    
    # Look for the preprocessor.py file in the HuggingFace cache
    $cacheDir = Join-Path -Path $HOME -ChildPath ".cache\huggingface\modules\transformers_modules"
    $modelDir = Join-Path -Path $cacheDir -ChildPath "HyperCLOVAX-SEED-Vision-Instruct-3B"
    $preprocessorPath = Join-Path -Path $modelDir -ChildPath "preprocessor.py"
    
    if (Test-Path $preprocessorPath) {
        Write-Host "Found preprocessor.py at $preprocessorPath"
        
        try {
            # Create a backup first
            Copy-Item -Path $preprocessorPath -Destination "$preprocessorPath.bak" -Force
            Write-Host "Created backup at $preprocessorPath.bak"
            
            # Read the content of the file
            $content = Get-Content -Path $preprocessorPath -Raw
            
            # Check if it has the av import we need to replace
            if ($content -match "import av") {
                # Modify the file to disable av imports and add stub implementation
                $modified = $content -replace "import av", @"
# import av  # Disabled due to installation issues

# Stub implementation for av
class FakeAVContainer:
    def __init__(self, *args, **kwargs):
        print('Warning: Video processing requires the av package which is not available.')
        self.streams = FakeStreams()
    
    def decode(self, *args, **kwargs):
        return []

class FakeStreams:
    def __init__(self):
        self.video = [FakeVideoStream()]

class FakeVideoStream:
    def __init__(self):
        self.average_rate = 24  # Default FPS value

# Create fake objects
def open(*args, **kwargs):
    return FakeAVContainer()

# Create fake av module
av = type('', (), {})()
av.open = open
"@
                
                # Write the modified content back
                $modified | Out-File -FilePath $preprocessorPath -Encoding utf8 -NoNewline
                
                Write-Host "Model code modified to work without av package. Video processing will be disabled."
                Write-Host "A backup of the original file was saved to $preprocessorPath.bak"
            } else {
                Write-Host "The file does not contain the expected av import pattern."
                Write-Host "It may have been already modified or has a different structure."
            }
        } catch {
            Write-Host "Failed to modify model code: $_"
            Write-Host "You may need to manually modify $preprocessorPath to disable av imports and video processing."
        }
    } else {
        Write-Host "Could not find preprocessor.py at $preprocessorPath."
        Write-Host "The model may not be downloaded yet or is in a different location."
    }
}

# Install PyTorch (with CUDA if available)
try {
    Write-Host "Checking for PyTorch..."
    $torchInstalled = & $PYTHON_EXECUTABLE -c "import torch; print(f'PyTorch {torch.__version__} found. CUDA: {torch.cuda.is_available()}')" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host $torchInstalled
        # Check if CUDA is actually available
        $cudaAvailable = & $PYTHON_EXECUTABLE -c "import torch; print(torch.cuda.is_available())" 2>$null
        if ($cudaAvailable -eq "True") {
            $cudaAvailable = $true
            Write-Host "PyTorch with CUDA support detected."
        } else {
            $cudaAvailable = $false
            Write-Host "PyTorch without CUDA support detected. Will use CPU mode."
        }
    } else {
        Write-Host "PyTorch not found. Installing..."
        
        # Get Python version for appropriate wheel
        $pythonVersionForWheel = & $PYTHON_EXECUTABLE -c "import sys; print(f'{sys.version_info.major}{sys.version_info.minor}')" 2>$null
        
        # Check if NVIDIA GPU is present
        $hasNvidiaGPU = $false
        try {
            $gpuInfo = nvidia-smi
            $hasNvidiaGPU = $true
            Write-Host "NVIDIA GPU detected."
        } catch {
            Write-Host "No NVIDIA GPU detected or nvidia-smi not found."
        }
        
        $installTorch = $true
        
        # For newer Python versions, direct wheel installation might be needed
        if ($majorVersion -gt 3 -or ($majorVersion -eq 3 -and $minorVersion -gt 11)) {
            Write-Host "For Python $pythonMajorVersion, attempting CPU-only PyTorch installation..."
            
            # Install CPU version by default for newer Python versions
            Write-Host "Installing CPU-only PyTorch..."
            & $PYTHON_EXECUTABLE -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
            
            # Check if the installation was successful
            $torchCheck = & $PYTHON_EXECUTABLE -c "import torch; print('Success')" 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "PyTorch installed successfully."
                $installTorch = $false
            } else {
                Write-Host "Standard installation failed. Attempting direct wheel installation..."
                
                # Try direct wheel file installation for common versions
                if ($pythonVersionForWheel -eq "311") {
                    & $PYTHON_EXECUTABLE -m pip install https://download.pytorch.org/whl/cpu/torch-2.1.0%2Bcpu-cp311-cp311-win_amd64.whl
                } elseif ($pythonVersionForWheel -eq "310") {
                    & $PYTHON_EXECUTABLE -m pip install https://download.pytorch.org/whl/cpu/torch-2.1.0%2Bcpu-cp310-cp310-win_amd64.whl
                } elseif ($pythonVersionForWheel -eq "39") {
                    & $PYTHON_EXECUTABLE -m pip install https://download.pytorch.org/whl/cpu/torch-2.1.0%2Bcpu-cp39-cp39-win_amd64.whl
                } else {
                    Write-Host "Could not find a PyTorch wheel for Python $pythonMajorVersion."
                    Write-Host "Visit https://pytorch.org/get-started/locally/ for manual installation instructions."
                }
                
                # Check if the direct wheel installation was successful
                $torchCheck = & $PYTHON_EXECUTABLE -c "import torch; print('Success')" 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "PyTorch installed successfully through direct wheel."
                    $installTorch = $false
                }
            }
        }
        
        # For compatible Python versions, use standard installation
        if ($installTorch) {
            if ($hasNvidiaGPU -and $majorVersion -eq 3 -and $minorVersion -le 11) {
                # Install PyTorch with CUDA
                Write-Host "Installing PyTorch with CUDA support..."
                & $PYTHON_EXECUTABLE -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
            } else {
                # Install CPU-only PyTorch
                Write-Host "Installing CPU-only PyTorch..."
                & $PYTHON_EXECUTABLE -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
            }
        }
    }
} catch {
    Write-Host "ERROR installing PyTorch: $_"
    Write-Host "You may need to visit https://pytorch.org/get-started/locally/ and follow installation instructions."
    $missingPackages += "torch"
}

# Check and install required packages
Write-Host ""
Write-Host "Checking and installing required packages..."

# Define the required packages with their import names and installation names
$packageMapping = @(
    @{ImportName = "transformers"; InstallName = "transformers"; Required = $true},
    @{ImportName = "PIL"; InstallName = "Pillow"; Required = $true},
    @{ImportName = "huggingface_hub"; InstallName = "huggingface_hub"; Required = $true},
    @{ImportName = "einops"; InstallName = "einops"; Required = $true},
    @{ImportName = "timm"; InstallName = "timm"; Required = $true},
    @{ImportName = "cv2"; InstallName = "opencv-python"; Required = $true},
    @{ImportName = "tqdm"; InstallName = "tqdm"; Required = $true},
    @{ImportName = "regex"; InstallName = "regex"; Required = $true},
    @{ImportName = "tokenizers"; InstallName = "tokenizers"; Required = $true},
    @{ImportName = "safetensors"; InstallName = "safetensors"; Required = $true},
    @{ImportName = "sentencepiece"; InstallName = "sentencepiece"; Required = $true}
)

# Install each package individually and verify installation
foreach ($package in $packageMapping) {
    # Check if package is installed - this more reliably checks actual imports rather than pip status
    $checkCmd = "try:\n    import $($package.ImportName)\n    print('OK')\nexcept ImportError as e:\n    print('MISSING: ' + str(e))"
    $result = & $PYTHON_EXECUTABLE -c $checkCmd 2>$null
    
    $installed = $false
    if ($result -match "OK") {
        Write-Host "Package $($package.InstallName) is already installed and working."
        $installed = $true
    } else {
        $error = $result -replace "MISSING: ", ""
        Write-Host "Package $($package.InstallName) is not installed or not working. Error: $error"
        Write-Host "Attempting installation..."
        
        # Special handling for problematic packages
        if ($package.InstallName -eq "sentencepiece") {
            # Try to install with wheel instead of source
            Write-Host "Using pre-compiled wheel for sentencepiece..."
            & $PYTHON_EXECUTABLE -m pip install --upgrade pip
            
            # Try with the --no-build-isolation flag
            & $PYTHON_EXECUTABLE -m pip install sentencepiece --no-build-isolation
        } 
        elseif ($package.InstallName -eq "opencv-python") {
            # Explicitly install opencv-python and ensure it completes
            Write-Host "Installing opencv-python explicitly..."
            & $PYTHON_EXECUTABLE -m pip install opencv-python --no-cache-dir
        }
        else {
            # Normal installation
            & $PYTHON_EXECUTABLE -m pip install $($package.InstallName)
        }
        
        # Verify installation by actually importing the module
        $verifyCmd = "try:\n    import $($package.ImportName)\n    print('OK')\nexcept ImportError as e:\n    print('MISSING: ' + str(e))"
        $verifyResult = & $PYTHON_EXECUTABLE -c $verifyCmd 2>$null
        
        if ($verifyResult -match "OK") {
            Write-Host "Successfully installed $($package.InstallName)."
            $installed = $true
        } else {
            $error = $verifyResult -replace "MISSING: ", ""
            Write-Host "WARNING: Failed to install $($package.InstallName). Error: $error"
            
            # Try alternative installation methods for problematic packages
            if ($package.InstallName -eq "opencv-python") {
                Write-Host "Trying alternative installation for opencv-python..."
                & $PYTHON_EXECUTABLE -m pip install opencv-python-headless
                
                # Verify again
                $verifyResult = & $PYTHON_EXECUTABLE -c $verifyCmd 2>$null
                if ($verifyResult -match "OK") {
                    Write-Host "Successfully installed opencv-python-headless as alternative."
                    $installed = $true
                }
            }
            elseif ($package.InstallName -eq "sentencepiece") {
                Write-Host "Trying alternative installation for sentencepiece..."
                # Try a different version
                & $PYTHON_EXECUTABLE -m pip install sentencepiece==0.1.99 --no-build-isolation
                
                # Verify again
                $verifyResult = & $PYTHON_EXECUTABLE -c $verifyCmd 2>$null
                if ($verifyResult -match "OK") {
                    Write-Host "Successfully installed sentencepiece with alternative version."
                    $installed = $true
                }
            }
        }
    }
    
    # Keep track of packages that could not be installed/imported properly
    if (-not $installed) {
        $missingPackages += $package.InstallName
    }
}

# Instead of exiting on first failure, collect all missing packages and report at the end
if ($missingPackages.Count -gt 0) {
    Write-Host ""
    Write-Host "WARNING: The following packages could not be installed or imported properly:"
    foreach ($pkg in $missingPackages) {
        Write-Host "  - $pkg"
    }
    
    if ($isWindowsStorePython) {
        Write-Host ""
        Write-Host "This is likely due to limitations in Windows Store Python."
        Write-Host "You may need to install a standard Python distribution from python.org and try again."
    }
    
    $continueAnyway = Read-Host "Do you want to continue anyway? Some features may not work properly. (y/N)"
    if ($continueAnyway -ne "y" -and $continueAnyway -ne "Y") {
        Write-Host "Setup aborted due to missing dependencies."
        exit 1
    }
    Write-Host "Continuing with incomplete setup..."
}

# Verify installation
Write-Host ""
Write-Host "Verifying installation..."
try {
    $verificationCommand = "import sys; print('Python executable:', sys.executable); \ntry:\n    import torch; print('PyTorch version:', torch.__version__, '| CUDA available:', torch.cuda.is_available())\nexcept ImportError: print('PyTorch not installed')\ntry:\n    import transformers; print('Transformers version:', transformers.__version__)\nexcept ImportError: print('Transformers not installed')\ntry:\n    import PIL; print('PIL version:', PIL.__version__)\nexcept ImportError: print('PIL not installed')\ntry:\n    import cv2; print('OpenCV version:', cv2.__version__)\nexcept ImportError: print('OpenCV not installed')\ntry:\n    import einops, timm; print('einops and timm installed')\nexcept ImportError: print('einops or timm not installed')\ntry:\n    import av; print('PyAV version:', av.__version__)\nexcept ImportError: print('PyAV not installed (video processing will be limited)')\n"
    
    $verificationResult = & $PYTHON_EXECUTABLE -c $verificationCommand 2>$null
    $verificationResult | ForEach-Object { Write-Host $_ }
    
    # Don't exit on verification errors, just warn the user
    if ($verificationResult -match "not installed") {
        Write-Host ""
        Write-Host "WARNING: Some required packages are not installed. The model may not work properly."
        if ($verificationResult -match "OpenCV not installed") {
            Write-Host "WARNING: OpenCV (cv2) is not installed, which is required for the model."
            Write-Host "Image processing may not work correctly."
        }
        if ($verificationResult -match "PyAV not installed") {
            Write-Host "WARNING: PyAV is not installed, video processing will be limited, but image processing should still work."
        }
    } else {
        Write-Host ""
        Write-Host "Environment setup complete!"
        
        # Save success flag with timestamp
        Get-Date -Format "yyyy-MM-dd HH:mm:ss" | Out-File -FilePath $SUCCESS_FLAG -Force
    }
} catch {
    Write-Host "ERROR during verification: $_"
    Write-Host "Some packages may not have installed correctly."
}

Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Download the model using: .\hyperclovax_download.ps1"
Write-Host "2. Test the model using: .\hyperclovax_test_interface.ps1"
Write-Host ""

Write-Host "NOTE: If you're using the Windows Store version of Python (which you are),"
Write-Host "you may need to manually install some packages or set up the environment in a different way."
Write-Host "Consider installing a standard Python distribution from python.org for better compatibility."

# Set environment variables for device
$envFile = Join-Path -Path $SCRIPT_DIR -ChildPath ".env"
if ($cudaAvailable) {
    Write-Host "Setting CARET_HYPERCLOVAX_DEVICE=cuda in environment."
    "CARET_HYPERCLOVAX_DEVICE=cuda" | Out-File -FilePath $envFile -Encoding utf8 -Append
} else {
    Write-Host "Setting CARET_HYPERCLOVAX_DEVICE=cpu in environment (no CUDA support)."
    "CARET_HYPERCLOVAX_DEVICE=cpu" | Out-File -FilePath $envFile -Encoding utf8 -Append
}

pause