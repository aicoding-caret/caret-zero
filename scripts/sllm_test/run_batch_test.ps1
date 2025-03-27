# Set PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Set working directory
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $ScriptPath

# Set Python environment
$env:PYTHONIOENCODING = "utf-8"

# Check Ollama installation
$ollama_version = ollama --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Ollama is not installed. Please install from https://ollama.ai/download"
    exit 1
}
Write-Host "Ollama version: $ollama_version"

# Update pip
Write-Host "Updating pip..."
python -m pip install --upgrade pip

# Install required Python packages
Write-Host "Installing required packages..."
pip install -r requirements.txt

# Check GPU status
Write-Host "`nChecking GPU status..."
nvidia-smi
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Unable to check NVIDIA GPU status"
}

# Model list
$models = @(
    "qwen2.5-coder:14b",
    "qwen2.5-coder:32b",
    "gemma3:12b",
    "gemma3:27b"
)

# Context sizes
$contexts = @(12800, 41200, 51200, 76800)

# Results directory
$results_dir = "experiment_results"
if (-not (Test-Path $results_dir)) {
    New-Item -ItemType Directory -Path $results_dir
}

# Timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Log file
$log_file = Join-Path $results_dir "batch_test_${timestamp}.log"

# Log function
function Write-Log {
    param($Message)
    $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): $Message"
    Write-Host $logMessage
    Add-Content -Path $log_file -Value $logMessage
}

Write-Log "Starting sLLM performance test"
Write-Log "----------------------------------------"

# Run tests for each model and context size combination
foreach ($model in $models) {
    $safe_model_name = $model -replace ':', '_'
    
    foreach ($context in $contexts) {
        Write-Log "Starting test series for: $model (context: $context)"
        
        # 모델 정리
        Write-Log "Cleaning up any running models..."
        $running_models = (ollama ps | Select-Object -Skip 1 | Where-Object { $_ -ne '' })
        if ($running_models) {
            foreach ($running_line in $running_models) {
                $model_to_stop = ($running_line -split '\s+')[0]
                if ($model_to_stop) {
                    Write-Log "Stopping model: $model_to_stop"
                    ollama stop $model_to_stop
                }
            }
            Write-Log "Waiting for models to unload..."
            Start-Sleep -Seconds 10
        }
        
        # 1. 초기 로딩 테스트 (모델 로딩 시간 포함)
        Write-Log "Running initial load test..."
        $result_file = Join-Path $results_dir "${safe_model_name}_ctx${context}_${timestamp}_initial.json"
        $test_output = python run_test.py --model $model --context $context --test-type "initial"
        if ($LASTEXITCODE -eq 0) {
            $test_output | Out-File -FilePath $result_file -Encoding UTF8
        } else {
            Write-Log "Error: Initial test failed - $test_output"
            continue
        }
        
        # 2-4. 연속 응답 테스트 (3회)
        Write-Log "Running continuous response tests..."
        for ($i = 1; $i -le 3; $i++) {
            Write-Log "Running continuous test #$i..."
            $result_file = Join-Path $results_dir "${safe_model_name}_ctx${context}_${timestamp}_continuous_$i.json"
            $test_output = python run_test.py --model $model --context $context --test-type "continuous"
            if ($LASTEXITCODE -eq 0) {
                $test_output | Out-File -FilePath $result_file -Encoding UTF8
            } else {
                Write-Log "Error: Continuous test #$i failed - $test_output"
            }
            Start-Sleep -Seconds 2  # 짧은 대기 시간
        }
        
        # 테스트 시리즈 완료 후 모델 정리
        Write-Log "Cleaning up after test series..."
        ollama stop $model
        Start-Sleep -Seconds 10
        
        Write-Log "Test series completed for: $model (context: $context)"
        Write-Log "----------------------------------------"
    }
}

# Generate final report
Write-Log "Analyzing results and generating report..."
$report_output = python generate_report.py --results-dir $results_dir --timestamp $timestamp 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Log "Error: Report generation failed - $report_output"
} else {
    Write-Log "Report generation completed"
}

Write-Log "Test suite completed!"
Write-Log "Results are available in the ${results_dir} directory"
Write-Log "Report: ${results_dir}/performance_report_${timestamp}.md"

# Pause after completion
Write-Host "`nTest completed. Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
