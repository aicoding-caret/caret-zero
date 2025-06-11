# Caret: Cline 업스트림 병합 가이드 (서브 레파지토리 방식)

**작성자**: Alpha Yang
**목적**: `cline` 원본 저장소의 최신 변경 사항을 `caret-zero` 프로젝트의 `cline` 서브 레파지토리에 안전하게 병합하는 절차를 안내합니다.

---

## 1. 아키텍처 이해: 중첩된 서브 레파지토리 (Nested Sub-Repository)

`caret-zero`는 `cline`을 프로젝트 내부에 별도의 독립된 Git 저장소로 포함하는 **서브 레파지토리** 구조를 사용합니다.

- **`caret-zero/` (메인 저장소)**: `Caret`의 고유 기능, 오버레이 로직, 최종 빌드 설정 등을 관리하는 메인 프로젝트입니다.
- **`caret-zero/cline/` (서브 레파지토리)**: `cline` 원본 프로젝트를 그대로 클론한, 독립적인 Git 저장소입니다. 이 디렉토리 내부는 그 자체로 완전한 `cline` 프로젝트입니다.

### 📜 **핵심 원칙: `cline` 디렉토리 직접 수정 금지**

`cline` 디렉토리의 코드는 `cline` 원본 저장소와의 연결을 유지하기 위해 **절대 직접 수정하지 않는 것을 원칙**으로 합니다. 이는 병합을 단순화하고, `cline`의 변경 내역을 명확하게 추적하기 위함입니다. 필요한 기능 변경이나 확장은 `caret/` 또는 `src/` 디렉토리에서 `cline`의 기능을 래핑하거나 오버라이드하는 방식으로 구현해야 합니다.

(단, 아래 '문제 해결' 섹션에서 설명하는 빌드 환경 호환성 문제와 같은 예외적인 경우는 제외합니다.)

---

## 2. 병합 절차 (Step-by-Step)

### 2.1. `cline` 디렉토리로 이동

먼저, `caret-zero` 프로젝트 루트에서 `cline` 서브 레파지토리 디렉토리로 이동합니다.

```bash
cd cline
```

### 2.2. Upstream 변경 사항 가져오기 (`git pull`)

`cline` 디렉토리 안에서 `git pull` 명령을 사용하여 원본 저장소(`origin`, 즉 `cline/cline`)의 최신 변경 사항을 가져옵니다. `main` 브랜치를 기준으로 합니다.

```bash
# 현재 브랜치가 main이라고 가정
git pull origin main
```

> **참고:** `cline` 저장소의 원격(`remote`) 설정이 궁금하다면 `git remote -v` 명령어로 확인할 수 있습니다. `origin`이 `https://github.com/cline/cline.git`를 가리켜야 합니다.

### 2.3. 메인 프로젝트로 복귀

`cline`의 업데이트가 완료되면, 다시 `caret-zero` 루트 디렉토리로 돌아옵니다.

```bash
cd ..
```

---

## 3. 빌드 및 검증

`cline`이 업데이트되었으므로, `caret-zero` 프로젝트 전체에 변경 사항이 영향을 줄 수 있습니다. 반드시 전체 빌드와 테스트를 통해 호환성을 검증해야 합니다.

```bash
# 1. 의존성 재설치 (최상위 루트에서 실행)
# cline의 package.json 변경에 따른 의존성 업데이트를 위해 필수
npm install

# 2. 전체 프로젝트 컴파일
npm run compile

# 3. 전체 테스트 실행
npm run test
```

이 과정에서 발생하는 대부분의 오류는 `caret/`나 `src/`에서 `cline`의 변경된 코드를 사용하다가 발생하는 호환성 문제입니다. **오류가 발생한 `caret` 측 코드를 수정**하여 해결해야 하며, `cline` 코드를 직접 수정해서는 안 됩니다.

---

## 4. 문제 해결 (Troubleshooting)

### 🚨 알려진 문제: Windows 환경에서의 `protoc` 빌드 오류

Windows 환경에서 `npm run compile` 또는 `cline` 독립 빌드를 시도할 때, `protoc` 관련 오류가 발생하며 빌드가 실패할 수 있습니다.

- **원인**: `cline`이 사용하는 `grpc-tools` 패키지의 `protoc` 바이너리가 특정 Windows 환경과 호환되지 않거나, 관련 실행 파일을 찾지 못해 발생하는 문제입니다.
- **해결 방안**: `caret-zero` 프로젝트에 포함된 Windows 호환 빌드 스크립트와 실행 파일을 `cline` 디렉토리에 복사합니다.

#### **조치 방법**

1.  **파일 복사**: 아래 경로에 있는 **파일과 폴더를 모두** 복사합니다.
    -   **원본 파일**: `docs/development/resources/build-proto.js`
    -   **원본 폴더**: `docs/development/resources/protoc-31.0-win64`

2.  **파일 붙여넣기**: 복사한 파일과 폴더를 `cline`의 `proto` 디렉토리에 덮어씁니다.
    -   **대상**: `cline/proto/`

위와 같이 조치한 후 다시 빌드를 시도하면 정상적으로 진행됩니다. `cline`을 새로 `pull` 할 때마다 이 파일들이 다시 원본으로 덮어써질 수 있으므로, 오류 발생 시 이 가이드를 다시 확인해 주세요. 