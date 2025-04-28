#!/usr/bin/env python3
# HyperCLOVA X SEED Vision Model Downloader

import os
import sys
import subprocess
import platform

# Configuration
MODEL_NAME = "naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B"
DOWNLOAD_DIR = "D:\dev\caret-zero\models\HyperCLOVAX-SEED-Vision-Instruct-3B"

def print_header():
    print("==================================================")
    print("Downloading HyperCLOVA X SEED Vision Model")
    print(f"Model: {MODEL_NAME}")
    print(f"Target Directory: {DOWNLOAD_DIR}")
    print("==================================================")
    print()

def run_command(cmd, error_msg, exit_on_error=True):
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ERROR: {error_msg}")
        if exit_on_error:
            sys.exit(1)
        return False
    return True

def check_installation(package_name):
    try:
        __import__(package_name)
        return True
    except ImportError:
        return False

def main():
    print_header()
    
    # Check Python (already running Python, so this is just to print the version)
    print("Checking Python version...")
    print(f"Python found: {platform.python_version()}")
    
    # Check pip
    print("Checking for pip...")
    try:
        import pip
        print("pip found.")
    except ImportError:
        print("ERROR: pip not found. Please ensure pip is installed for your Python environment.")
        sys.exit(1)
    
    # Check Required Setup Libraries
    print("Checking for required setup Python libraries (transformers, huggingface_hub)...")
    missing_setup_libs = []
    for lib in ["transformers", "huggingface_hub"]:
        if not check_installation(lib):
            missing_setup_libs.append(lib)
    
    if missing_setup_libs:
        print("Setup libraries not found or incomplete. Attempting installation...")
        for lib in missing_setup_libs:
            run_command(
                [sys.executable, "-m", "pip", "install", lib],
                f"Failed to install {lib}. Please install it manually."
            )
        print("Setup libraries installed successfully.")
    else:
        print("Required setup libraries already installed.")
    
    # Check Required Runtime Libraries
    print("Checking for required runtime Python libraries (torch, Pillow)...")
    missing_runtime_libs = []
    for lib in ["torch", "PIL"]:
        if not check_installation(lib):
            missing_runtime_libs.append(lib)
    
    if missing_runtime_libs:
        print("Runtime libraries not found or incomplete. Attempting installation...")
        print("Installing libraries... This might take some time.")
        for lib in missing_runtime_libs:
            lib_name = "pillow" if lib == "PIL" else lib
            run_command(
                [sys.executable, "-m", "pip", "install", lib_name],
                f"Failed to install {lib_name}. Please install it manually."
            )
        print("Runtime libraries installed successfully.")
    else:
        print("Required runtime libraries already installed.")
    
    # Check Hugging Face Login via huggingface-cli
    print("Checking Hugging Face CLI login status...")
    try:
        from huggingface_hub.commands.user import whoami_command
        whoami_command()
        print("Already logged in to Hugging Face Hub.")
    except Exception:
        print("WARNING: Not logged in to Hugging Face Hub.")
        print("Attempting login. Please enter your Hugging Face Hub token when prompted.")
        from huggingface_hub.commands.user import login_command
        login_command()
        print("Hugging Face Hub login successful.")
    
    # Create Target Directory
    print(f"Creating target directory if it doesn't exist: {DOWNLOAD_DIR}")
    if not os.path.exists(DOWNLOAD_DIR):
        try:
            os.makedirs(DOWNLOAD_DIR, exist_ok=True)
            print("Directory created.")
        except Exception as e:
            print(f"ERROR: Failed to create directory {DOWNLOAD_DIR}. {str(e)}")
            sys.exit(1)
    else:
        print("Directory already exists.")
    
    # Download Model
    print("Starting model download...")
    try:
        from huggingface_hub import snapshot_download
        snapshot_download(
            repo_id=MODEL_NAME,
            local_dir=DOWNLOAD_DIR,
            local_dir_use_symlinks=False
        )
        print(f"Model download completed successfully to {DOWNLOAD_DIR}.")
    except Exception as e:
        print(f"ERROR: Model download failed. {str(e)}")
        print("Check network connection, Hugging Face token, and available disk space.")
        sys.exit(1)
    
    print("==================================================")
    print("Setup Complete!")
    print("==================================================")
    print()
    print("NEXT STEPS:")
    print(f"1. Set the environment variable CARET_HYPERCLOVAX_MODEL_PATH to:")
    print(f"   {DOWNLOAD_DIR}")
    print("2. (Optional) Set CARET_HYPERCLOVAX_DEVICE to 'cuda' or 'cpu'.")
    print("3. Restart Caret or your terminal for the environment variables to take effect.")
    
    if platform.system() == "Windows":
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()