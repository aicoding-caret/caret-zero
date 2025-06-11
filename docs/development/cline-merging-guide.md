# Caret-Zero: Cline 업스트림 병합 가이드

**작성자**: Alpha Yang
**목적**: `cline` 원본 저장소의 최신 변경 사항을 `caret-zero` 프로젝트에 안전하게 병합하는 절차와 주요 해결 방안을 안내합니다. 이 가이드는 신규 개발자도 프로젝트의 아키텍처를 이해하고 작업을 수행할 수 있도록 상세한 설명을 제공합니다.

---

## 1. 아키텍처 이해: 오버레이 구조

`caret-zero`는 `cline`의 빠른 개발 속도에 효과적으로 대응하기 위해 **오버레이 아키텍처(Overlay Architecture)**를 채택하고 있습니다.

- **`cline/` 디렉토리 (기반 레이어)**: `cline` 원본 소스 코드를 관리하는 공간입니다. 주기적으로 업스트림의 최신 코드를 가져와 업데이트합니다.
- **`caret/` 디렉토리 (오버레이 레이어)**: `caret-zero`만의 고유 기능(페르소나, 모드 등)을 구현하는 공간입니다. `cline`의 기능을 확장하거나 변경하는 코드가 여기에 위치합니다.
- **통합 진입점 (`src/`)**: `cline`과 `caret`의 기능을 조합하여 최종적으로 확장 프로그램을 실행하는 역할을 합니다.

### 📜 **핵심 원칙: `cline` 디렉토리 수정 금지**

`cline` 디렉토리의 코드는 업스트림과 동일한 상태를 유지하는 것을 원칙으로 합니다. 이는 병합 시 발생하는 충돌을 최소화하고, 원본과의 차이점을 명확하게 관리하기 위함입니다. `cline`의 코드를 직접 수정하는 대신, `caret` 레이어에서 기능을 래핑하거나 오버라이드하는 방식으로 기능을 구현해야 합니다.

(단, 아래 '문제 해결' 섹션에서 설명하는 빌드 환경 호환성 문제와 같은 예외적인 경우는 제외합니다.)

---

## 2. 병합 절차 (Step-by-Step)

### 2.1. 사전 준비: Upstream 원격 저장소 확인

먼저 `cline`의 원본 저장소가 git 원격(remote)으로 등록되어 있는지 확인합니다. 일반적으로 `upstream`이라는 이름을 사용합니다.

```bash
git remote -v
# upstream  https://github.com/care-t/care.git (fetch)
# upstream  https://github.com/care-t/care.git (push)
```

만약 `upstream`이 등록되어 있지 않다면, 아래 명령어로 추가합니다.

```bash
git remote add upstream https://github.com/cline/cline
```

### 2.2. Upstream 변경 사항 가져오기

`git subtree pull` 명령을 사용하여 `upstream`의 최신 변경 사항을 `cline` 디렉토리로 병합합니다.

```bash
# git subtree pull --prefix=<하위 디렉토리> <원격 저장소 이름> <브랜치명> --squash
git subtree pull --prefix=cline upstream main --squash
```

- `--prefix=cline`: `cline` 디렉토리에 변경 사항을 적용합니다.
- `upstream main`: `upstream` 원격 저장소의 `main` 브랜치를 가져옵니다.
- `--squash`: 업스트림의 커밋 히스토리를 하나로 합쳐서 가져옵니다. 프로젝트의 메인 히스토리를 깔끔하게 유지하는 데 도움이 됩니다.

### 2.3. 충돌 해결 (Conflict Resolution)

병합 과정에서 충돌이 발생할 수 있습니다. `package.json`, `package-lock.json` 등에서 충돌이 자주 발생합니다.

- **충돌 해결 원칙**: `cline`의 변경 사항을 최대한 존중하되, `caret-zero`의 핵심 의존성이나 설정이 깨지지 않도록 주의합니다.
- VSCode와 같은 도구를 사용하여 충돌 부분을 하나씩 확인하고, "incoming change"(`cline`의 변경)를 선택할지 "current change"(현재 코드)를 유지할지 결정합니다.
- 충돌 해결 후, 파일을 저장하고 `git add <충돌 해결된 파일>` 명령으로 스테이징합니다.

모든 충돌을 해결한 후, 병합 커밋을 완료합니다.
```bash
git commit
```

---

## 3. 빌드 및 검증

병합이 완료되면, 프로젝트가 정상적으로 동작하는지 반드시 확인해야 합니다.

```bash
# 1. 의존성 재설치
npm install

# 2. 전체 프로젝트 컴파일
npm run compile

# 3. 전체 테스트 실행
npm run test
```

이 과정에서 오류가 발생한다면, 아래 '문제 해결' 섹션을 참조하거나 충돌 해결 과정에 실수가 없었는지 다시 확인합니다.

---

## 4. 문제 해결 (Troubleshooting)

### 🚨 알려진 문제: Windows 환경에서의 `protoc` 빌드 오류

Windows 환경에서 `npm run compile` 또는 `cline` 독립 빌드를 시도할 때, `protoc` 관련 오류(`status: 3221225781` 또는 `MODULE_NOT_FOUND`)가 발생하며 빌드가 실패할 수 있습니다.

- **원인**: `cline`이 사용하는 `grpc-tools` 패키지의 `protoc` 바이너리가 특정 Windows 환경과 호환되지 않거나, 관련 실행 파일을 찾지 못해 발생하는 문제입니다.
- **해결 방안**: `caret-zero` 프로젝트에 포함된 Windows 호환 빌드 스크립트와 실행 파일을 `cline` 디렉토리에 복사합니다.

#### **조치 방법**

1.  **파일 복사**: 아래 경로에 있는 **파일과 폴더를 모두** 복사합니다.
    -   **원본 파일**: `docs/development/resources/build-proto.js`
    -   **원본 폴더**: `docs/development/resources/protoc-31.0-win64`

2.  **파일 붙여넣기**: 복사한 파일과 폴더를 `cline`의 `proto` 디렉토리에 덮어씁니다.
    -   **대상**: `cline/proto/`

위와 같이 조치한 후 다시 빌드를 시도하면 정상적으로 진행됩니다. `cline`을 새로 병합할 때마다 이 파일들이 다시 원본으로 덮어써질 수 있으므로, 오류 발생 시 이 가이드를 다시 확인해 주세요. 