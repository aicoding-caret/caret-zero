# HyperCLOVA X SEED Vision 모델 설치 가이드

이 가이드는 Caret Zero 환경에서 HyperCLOVA X SEED Vision 모델을 설치하고 실행하기 위한 단계별 지침을 제공합니다. ✨

## 사전 요구 사항

### 1. Python 설치 (Python.org)

Windows Store Python이 아닌 공식 Python.org 버전을 사용해야 합니다:

1. [Python.org](https://www.python.org/downloads/) 에서 Python 3.8 - 3.11 버전을 다운로드합니다.
2. 설치 시 "Add Python to PATH" 옵션을 체크합니다.
3. 설치 후 명령 프롬프트에서 확인:

> **중요**: Windows Store Python을 사용하고 계시다면, Python.org 버전으로 전환해주세요. Windows Store Python은 일부 라이브러리와 호환성 문제가 있습니다.

### 2. CUDA 지원 (GPU 사용 시)

GPU 가속을 위해 CUDA가 필요합니다:

1. NVIDIA GPU가 있는지 확인합니다.
2. NVIDIA 드라이버가 최신 버전인지 확인합니다.
3. (GPU 사용 시) CUDA를 지원하는 PyTorch를 설치합니다. CUDA를 사용하려면 NVIDIA GPU가 필요하며, NVIDIA 드라이버가 최신 버전이어야 합니다. 일반적으로 다음 명령어를 사용하여 PyTorch를 설치할 수 있습니다:
   ```powershell
   pip install torch torchvision torchaudio

   CUDA 설치 확인:
python
CopyInsert
python -c "import torch; print(torch.cuda.is_available())"
True가 출력되면 CUDA가 정상적으로 설치된 것입니다.
3. av 패키지 설치
HyperCLOVA X 모델은 비디오 처리를 위해 'av' 패키지를 필요로 합니다:

아래 명령어로 av 패키지를 설치합니다:
```powershell
pip install av
```
설치에 문제가 발생하는 경우, `hyperclovax_setup_env.ps1` 스크립트가 자동으로 문제를 해결하고 필요한 설정을 수행합니다.
설치 확인:
python
CopyInsert
python -c "import av; print('av 설치 성공')"
모델 설정 및 실행 방법
1. 환경 설정 스크립트 실행
먼저 환경 설정 스크립트를 실행하여 필요한 모든 패키지를 설치합니다:

powershell
CopyInsert
cd d:\dev\caret-zero\sllm
.\hyperclovax_setup_env.ps1
이 스크립트는 다음을 수행합니다:

Python 및 필수 패키지 확인
PyTorch(CUDA 지원) 설치
FFmpeg 설치
av 패키지 설치
2. 모델 다운로드
다음 명령어로 모델을 다운로드합니다:

powershell
CopyInsert in Terminal
.\hyperclovax_download.ps1
이 스크립트는 HuggingFace에서 모델을 다운로드합니다. Hugging Face 계정이 필요할 수 있습니다.

3. 모델 테스트
설치가 완료되면 모델을 테스트해 봅니다:

powershell
CopyInsert in Terminal
.\hyperclovax_test_interface.ps1
문제 해결
av 패키지 설치 실패 시
av 패키지 설치에 문제가 있는 경우, 모델 코드를 수정하여 av 없이도 작동하도록 할 수 있습니다. 이는 hyperclovax_setup_env.ps1 스크립트에 이미 구현되어 있습니다.

CUDA 인식 문제
CUDA가 설치되었지만 인식되지 않는 경우:

올바른 Python 버전을 사용하고 있는지 확인합니다 (Windows Store Python이 아닌지 확인).
환경 변수 PATH에 Python.org 설치 경로가 Windows Store Python보다 먼저 오는지 확인합니다.
NVIDIA 드라이버를 최신 버전으로 업데이트합니다.
모델 실행 오류
다음 사항을 확인하세요:

HuggingFace에서 모델이 올바르게 다운로드되었는지 확인
환경 변수가 올바르게 설정되었는지 확인
CARET_HYPERCLOVAX_MODEL_PATH가 모델 디렉토리를 가리키는지 확인
CARET_HYPERCLOVAX_DEVICE 환경 변수가 'cuda' 또는 'cpu'로 설정되었는지 확인합니다. 이 변수는 `hyperclovax_setup_env.ps1` 스크립트에 의해 자동으로 설정됩니다.
참고
이 가이드는 Windows 환경을 기준으로 작성되었으며, 특히 다음 버전을 권장합니다:

Python 3.8 - 3.11
PyTorch 2.0 이상 (CUDA 11.8)
최신 NVIDIA 드라이버
HyperCLOVA X SEED Vision-Instruct-3B 모델
문제가 계속되면 스크립트 출력의 오류 메시지를 확인하고, HuggingFace 모델 카드를 참조하세요.
