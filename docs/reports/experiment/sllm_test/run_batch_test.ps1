# Set PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Set working directory
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $ScriptPath

# Set Python environment
$env:PYTHONIOENCODING = "utf-8"

# --- Configuration ---

# 테스트 환경 정의 (API 타입, URL, 모델 목록) - 밤샘 테스트용 vLLM 설정
$Environments = @(
    @{ 
        ApiType = "vllm";   
        ApiUrl = "http://localhost:8000";   
        Models = @(
            "Qwen/Qwen2.5-Coder-32B-Instruct-AWQ", 
            "Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4"
            # "Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int8" # 로딩 시간 문제로 제외
        ) 
    }
)

# 테스트 반복 횟수 (Continuous 테스트용) - 밤샘 테스트용
$Repetitions = 3 

# vLLM 관련 설정 (vLLM 환경 사용 시)
$volume_path = "D:\dev\caret\models" # 모델 캐시 저장 경로 (호스트 경로) - 실제 경로로 수정!
$host_port = 8000 # 호스트에서 사용할 포트 (vLLM 기본값)
$container_port = 8000 # 컨테이너 내부 포트 (vLLM 기본값)
$vllm_image = "vllm/vllm-openai:v0.5.1" 
$container_name_base = "vllm_test_container" # 기본 컨테이너 이름 (모델별로 이름 변경됨)
$health_check_timeout_sec = 600 # vLLM 준비 대기 시간 (초)
$shm_size = "16g" # 공유 메모리 크기

# --- End Configuration ---

# --- Load .env file ---
$envFilePath = Join-Path $ScriptPath "..\.env" # 루트의 .env 파일 경로
if (Test-Path $envFilePath) {
    Get-Content $envFilePath | ForEach-Object {
        if ($_ -match '^\s*([^#\s=]+)\s*=\s*(.*)\s*$') {
            $name = $matches[1]
            $value = $matches[2]
            # PowerShell 환경 변수로 설정 ($env: prefix 사용)
            Set-Item -Path "env:$name" -Value $value 
            Write-Host "Loaded env var: $name"
        }
    }
} else {
    Write-Warning ".env file not found at $envFilePath"
}

# 토큰 로드 확인 (vLLM 사용 시 중요)
if (-not $env:HUGGING_FACE_HUB_TOKEN) {
    Write-Warning "HUGGING_FACE_HUB_TOKEN not found in environment variables or .env file. vLLM might fail for gated models."
}
# --- End Load .env file ---

# 결과 저장 디렉토리
$ResultDir = ".\experiment_results"
New-Item -ItemType Directory -Force -Path $ResultDir | Out-Null

# 로그 파일 경로 (실행 시마다 고유하게)
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = Join-Path $ResultDir "batch_test_${Timestamp}.log"

# 로그 함수
function Write-Log {
    param(
        [string]$Message
    )
    $LogEntry = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

# --- Script Start ---

Write-Log "Starting batch test run..."
Write-Log "Timestamp: $Timestamp"
Write-Log "Repetitions per scenario set (continuous): $Repetitions"

# 필수 패키지 설치
Write-Log "Updating pip and installing requirements..."
python -m pip install --upgrade pip | Out-Null
pip install -r requirements.txt | Out-Null
Write-Log "Requirements installed."

# GPU 상태 확인
Write-Log "`nChecking GPU status..."
nvidia-smi
if ($LASTEXITCODE -ne 0) {
    Write-Log "Warning: Unable to check NVIDIA GPU status"
}

# 각 환경 설정에 대해 테스트 실행
foreach ($envInfo in $Environments) {
    $apiType = $envInfo.ApiType
    $apiUrl = $envInfo.ApiUrl
    $modelsToTest = $envInfo.Models

    Write-Log "========================================"
    Write-Log "Processing Environment: API Type = $apiType, API URL = $apiUrl"
    Write-Log "========================================"

    # 각 모델에 대해 테스트 실행
    foreach ($model in $modelsToTest) {
        $safeModelName = $model -replace '[:/]', '_' # 파일명에 안전한 모델 이름
        $container_name = "${container_name_base}_${safeModelName}" # 모델별 고유 컨테이너 이름

        Write-Log "----------------------------------------"
        Write-Log "Testing Model: $model (API: $apiType)"
        Write-Log "----------------------------------------"

        # --- vLLM Container Management ---
        if ($apiType -eq "vllm") {
            # 1. Stop and Remove existing container if it exists
            Write-Log "Checking for existing vLLM container '$container_name'..."
            $existingContainer = docker ps -a -q --filter "name=$container_name"
            if ($existingContainer) {
                Write-Log "Stopping existing container '$container_name' ($existingContainer)..."
                docker stop $existingContainer | Out-Null
                Write-Log "Removing existing container '$container_name' ($existingContainer)..."
                docker rm $existingContainer | Out-Null
                Write-Log "Waiting a bit after cleanup..."
                Start-Sleep -Seconds 5
            } else {
                Write-Log "No existing container named '$container_name' found."
            }

            # 2. Start the new vLLM container
            Write-Log "Starting new vLLM container '$container_name' for model '$model'..."
            
            # Determine quantization and dtype based on model name
            $quantizationMethod = $null
            $dtype = "float16" # Default dtype
            if ($model -like "*-AWQ*") {
                $quantizationMethod = "awq"
            } elseif ($model -like "*-GPTQ*") {
                $quantizationMethod = "gptq" # Revert back to gptq as gptq_marlin caused error
                $dtype = "auto" # Let vLLM determine dtype for GPTQ
            }

            $dockerArgs = @(
                "run", "--gpus", "all", "-d", "--name", $container_name,
                "-p", "${host_port}:${container_port}", 
                "-v", "${volume_path}:/root/.cache/huggingface", 
                "--shm-size", $shm_size, 
                "-e", "HUGGING_FACE_HUB_TOKEN=$($env:HUGGING_FACE_HUB_TOKEN)", 
                "-e", "VLLM_DISABLE_TORCH_COMPILE=1", 
                "-e", "NCCL_P2P_DISABLE=1", 
                $vllm_image,
                "--model", $model,
                "--tensor-parallel-size", "2", 
                "--port", $container_port,
                "--dtype", $dtype, 
                "--trust-remote-code" 
            )
            # Add quantization argument only if a method was determined
            if ($quantizationMethod) {
                $dockerArgs += "--quantization", $quantizationMethod
                Write-Log "Using quantization: $quantizationMethod"
            } else {
                 Write-Log "No specific quantization method detected in model name, running without --quantization flag."
            }


            Write-Log "Executing: docker $($dockerArgs -join ' ')"
            docker $dockerArgs | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Log "Error: Failed to start vLLM container for $model. Skipping tests for this model."
                continue # Skip to the next model
            }

            # 3. Health Check Loop
            Write-Log "Waiting for vLLM container to be ready (Timeout: ${health_check_timeout_sec}s)..."
            $health_check_url = "http://localhost:${host_port}/health" 
            $startTime = Get-Date
            $ready = $false
            while (((Get-Date) - $startTime).TotalSeconds -lt $health_check_timeout_sec) {
                try {
                    $response = Invoke-WebRequest -Uri $health_check_url -UseBasicParsing -TimeoutSec 5 
                    if ($response.StatusCode -eq 200) {
                        Write-Log "vLLM container is ready!"
                        $ready = $true
                        break
                    }
                } catch { }
                Write-Log "Still waiting for vLLM..."
                Start-Sleep -Seconds 10
            }

            if (-not $ready) {
                Write-Log "Error: vLLM container did not become ready. Stopping container and skipping tests for $model."
                docker stop $container_name | Out-Null
                docker rm $container_name | Out-Null
                continue 
            }
        }
        # --- End vLLM Container Management ---

        # --- Run Tests ---
        # 1. 초기 로딩 테스트 (1회 실행, 모든 시나리오 중 첫 번째 프롬프트만)
        $TestType = "initial"
        $OutputFileName = "${safeModelName}_${apiType}_${Timestamp}_${TestType}.json"
        $OutputPath = Join-Path $ResultDir $OutputFileName
        Write-Log "  Running Initial test (first prompt of first scenario)... Output: $OutputPath"
        # run_test.py 가 initial 타입일 때 첫 프롬프트만 실행 (스크립트 내부 로직)
        # 밤샘 테스트: 모든 시나리오/프롬프트 실행 (제한 없음)
        # stderr(2)를 로그 파일에 추가(>>)하고 stdout(1)은 JSON 파일로 출력(|)
        python .\run_test.py --api-type $apiType --api-url $apiUrl --model $model --test-type $TestType 2>> $LogFile | Out-File -Encoding utf8 $OutputPath
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Error: Initial test failed for $model. Check log file for details."
            # Optionally continue to continuous tests or skip model
        }

        # 2. 연속 응답 테스트 (모든 시나리오, 모든 프롬프트, 지정된 횟수만큼 반복)
        $TestType = "continuous"
        for ($i = 1; $i -le $Repetitions; $i++) {
            $OutputFileName = "${safeModelName}_${apiType}_${Timestamp}_${TestType}_${i}.json"
            $OutputPath = Join-Path $ResultDir $OutputFileName
            Write-Log "  Running Continuous test (Repetition $i/$Repetitions, all scenarios/prompts)... Output: $OutputPath" # 로그 메시지 수정
            # 밤샘 테스트: 모든 시나리오/프롬프트 실행 (제한 없음)
            # stderr(2)를 로그 파일에 추가(>>)하고 stdout(1)은 JSON 파일로 출력(|)
            python .\run_test.py --api-type $apiType --api-url $apiUrl --model $model --test-type $TestType 2>> $LogFile | Out-File -Encoding utf8 $OutputPath
            if ($LASTEXITCODE -ne 0) {
                # 로그 파일에 이미 오류가 기록되었으므로, 여기서는 실패 사실만 기록
                Write-Log "Error: Continuous test repetition $i failed for $model. Check log file for details."
            }
            Start-Sleep -Seconds 5 # 각 반복 사이에 잠시 대기
        }
        # --- End Run Tests ---

        # --- Stop vLLM container after testing the model ---
        if ($apiType -eq "vllm") {
            Write-Log "Stopping vLLM container '$container_name' after testing model '$model'..."
            docker stop $container_name | Out-Null
            docker rm $container_name | Out-Null
            Write-Log "vLLM container '$container_name' stopped and removed."
            Write-Log "Waiting before potentially starting next model..."
            Start-Sleep -Seconds 10
        }
        # --- End vLLM Container Stop ---

        Write-Log "Finished testing model: $model"
        Write-Log "----------------------------------------"

    } # End model loop
} # End environment loop

# 최종 보고서 생성
Write-Log "Analyzing results and generating final report..."
python .\generate_report.py --results-dir $ResultDir --timestamp $Timestamp 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Log "Error: Report generation failed."
} else {
    Write-Log "Report generation completed: ${ResultDir}/performance_report_${Timestamp}.md"
}

Write-Log "Batch test run finished."
Write-Log "Results are available in the ${ResultDir} directory."

# Pause after completion (Commented out for automatic shutdown)
# Write-Host "`nTest completed. Press any key to exit..."
# $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Automatic Shutdown after completion
Write-Log "All tests completed. Shutting down the computer..."
shutdown /s /t 0
