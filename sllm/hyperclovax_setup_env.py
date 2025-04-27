#!/usr/bin/env python3
# HyperCLOVA X Environment Setup Script
# This script sets up Python environment for HyperCLOVA X model inference

import os
import sys
import subprocess
import platform
import shutil

def check_command_exists(command):
    """Check if a command exists in the system PATH"""
    return shutil.which(command) is not None

def run_command(cmd, check=True):
    """Run a command and return its output"""
    print(f"Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, check=check, text=True, capture_output=True)
        if result.stdout:
            print(result.stdout.strip())
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        if e.stdout:
            print(f"Output: {e.stdout.strip()}")
        if e.stderr:
            print(f"Error: {e.stderr.strip()}")
        return False

def main():
    print("=================================================")
    print("HyperCLOVA X Environment Setup")
    print("=================================================")
    print()
    
    # Check Python version
    print(f"Python version: {platform.python_version()}")
    if sys.version_info < (3, 8):
        print("ERROR: Python 3.8 or higher is required.")
        sys.exit(1)
    
    # Install PyTorch
    print("\nChecking for PyTorch...")
    try:
        import torch
        print(f"PyTorch already installed. Version: {torch.__version__}")
        print(f"CUDA available: {torch.cuda.is_available()}")
    except ImportError:
        print("PyTorch not found. Installing...")
        
        # Check if NVIDIA GPU is present
        has_nvidia_gpu = check_command_exists("nvidia-smi")
        if has_nvidia_gpu:
            try:
                subprocess.run(["nvidia-smi"], check=True, capture_output=True)
                print("NVIDIA GPU detected.")
                # Install PyTorch with CUDA
                print("Installing PyTorch with CUDA support...")
                run_command([sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio", "--index-url", "https://download.pytorch.org/whl/cu121"])
            except subprocess.CalledProcessError:
                has_nvidia_gpu = False
                
        if not has_nvidia_gpu:
            print("No NVIDIA GPU detected or nvidia-smi failed. Installing CPU-only PyTorch...")
            run_command([sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio"])
    
    # Install transformers and other required packages
    print("\nInstalling transformers and other required packages...")
    run_command([sys.executable, "-m", "pip", "install", "transformers", "Pillow", "huggingface_hub"])
    
    # Verify installation
    print("\nVerifying installation...")
    try:
        import torch
        import transformers
        import PIL
        
        print(f"Python executable: {sys.executable}")
        print(f"PyTorch version: {torch.__version__} | CUDA available: {torch.cuda.is_available()}")
        print(f"Transformers version: {transformers.__version__}")
        print(f"PIL version: {PIL.__version__}")
        
        print("\nEnvironment setup complete!")
    except ImportError as e:
        print(f"ERROR during verification: {e}")
        print("Some packages may not have installed correctly.")
        sys.exit(1)
    
    print("\nNext steps:")
    print("1. Download the model using: python hyperclovax_download.py")
    print("2. Test the model using: python run_hyperclovax.py")
    print()
    
    if platform.system() == "Windows":
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()