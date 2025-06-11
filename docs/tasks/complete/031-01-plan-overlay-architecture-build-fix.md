# Task #031: 오버레이 아키텍처 빌드 설정 최종 수정

## 📌 **가장 중요한 핵심 원칙**

1.  **`Caret`은 `cline`의 확장 레이어입니다.**
    - `cline`은 원본 소스이며, `Caret`은 그 위에 추가 기능을 얹는 오버레이입니다.

2.  **`cline`과 `Caret`은 반드시 독립적으로 빌드되어야 합니다.**
    - `cline`을 먼저 단독으로 빌드하여 안정성을 확인한 후, `Caret` 레이어 및 전체 통합 빌드를 진행해야 합니다.

3.  **`cline`의 소스 코드는 절대 직접 수정하지 않습니다.**
    - 모든 커스터마이징과 기능 추가는 `caret/` 디렉토리 내에서만 이루어져야 합니다.
    - **예외**: `cline`의 독립 빌드 자체가 불가능한 환경 호환성 문제의 경우, 빌드를 위해 최소한으로 수정할 수 있습니다. (상세 내용은 머징 전략 문서 참고)

---

## 📚 **필수 참고 문서 - Caret-Cline 머징 전략**

> **출처: [docs/strategy-archive/caret-cline-merging-strategy-2025.md](../strategy-archive/caret-cline-merging-strategy-2025.md)**

### 🎯 **오버레이 아키텍처 핵심 개념**
```
📁 목표 구조
├── cline/ (원본 Cline, 절대 건드리지 않음)
├── caret/ (오버레이 레이어 - Cline을 확장)
│   ├── backend/ (PersonaManager 등 Caret 백엔드)
│   ├── frontend/ (Caret 전용 React 컴포넌트)
│   ├── config/ (통합 로직: ExtensionEnhancer, WebviewEnhancer)
│   └── assets/ (템플릿, 아이콘)
└── src/extension.ts (통합 진입점: Cline + Caret)
```

### 🔄 **머징 플로우**
1. **Cline 업데이트**: `cline/` 폴더만 교체
2. **Caret 기능**: `caret/` 폴더는 영향받지 않음
3. **자동 통합**: `src/extension.ts`에서 두 시스템 결합

---

## 📊 **현재 상황 점검 (2025-01-11 오후)**

### ✅ **완료된 작업들 (95%)**
- ✅ **디렉토리 구조**: 오버레이 아키텍처 100% 완성
- ✅ **파일 분리**: 모든 Caret 기능이 `caret/` 폴더로 분리됨
- ✅ **의존성 해결**: 프로토버프 생성, 패키지 설치, cline 소스 복사 완료
- ✅ **통합 시스템**: ExtensionEnhancer, WebviewEnhancer 구현 완료

### ❌ **남은 문제 (5%)**

#### **핵심 문제: caret/tsconfig.json 설정 모순**
```json
// 현재 설정 (모순적)
{
  "paths": {
    "@cline/*": ["../src/*"]    // ← 이 경로는 정상 (src/는 Caret 메인 소스)
  },
  "exclude": [
    "../src/**/*"               // ← 하지만 이 경로를 제외함! (문제)
  ]
}
```

#### **오류 증상**
```bash
$ npm run build:caret
# 결과: 10개 모듈을 찾을 수 없음 (@core, @utils, @shared 등)
```

---

## 🎯 **해결 계획**

### **Step 1: tsconfig.json 수정 (2분)**
```json
// caret/tsconfig.json 수정
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@cline/*": ["../src/*"],  // ← 정상 유지 (src/는 Caret 메인 소스)
      "@shared/*": ["../src/shared/*"]
    },
    "skipLibCheck": true
  },
  "include": [
    "backend/**/*",
    "frontend/**/*", 
    "config/**/*"
  ],
  "exclude": [
    "../cline/**/*",   // ← cline 컴파일 제외 유지
    "node_modules"              // ← ../src/**/* 제거 (핵심 수정!)
  ]
}
```

### **Step 2: base-controller.ts import 수정 (1분)**
```typescript
// caret/backend/controllers/base-controller.ts
// 현재 (잘못):
// export interface ExtensionMessage { ... }

// 수정:
import { ExtensionMessage, WebviewMessage } from "../../../src/shared/types"
```

### **Step 3: persona-controller.ts import 수정 (1분)**
```typescript
// caret/backend/controllers/persona-controller.ts
import { ExtensionMessage, WebviewMessage, Persona } from "../../../src/shared/types"
```

### **Step 4: 빌드 테스트 (1분)**
```bash
npm run build:caret        # Caret 레이어만 컴파일 성공 확인
npm run compile            # 전체 컴파일 성공 확인
```

---

## 🎯 **완료 기준**

### ✅ **성공 기준**
1. `npm run build:caret` → 0 errors
2. `npm run compile` → 전체 빌드 성공
3. VSCode에서 확장 실행 가능

### 📋 **테스트 체크리스트**
- [ ] Caret 빌드 성공 (`npm run build:caret`)
- [ ] 타입 체크 성공 (`npm run check-types`)
- [ ] 린트 성공 (`npm run lint`) 
- [ ] esbuild 번들링 성공 (`node esbuild.js`)
- [ ] VSCode 확장 로드 테스트

---

## ⏱️ **예상 소요 시간: 5분**

1. **tsconfig.json 수정**: 1분
2. **TypeScript 파일 수정**: 2분  
3. **빌드 테스트**: 2분

---

## 🚨 **중요 사항**

### **절대 하지 말 것**
- ❌ **(가장 중요)** `cline` 폴더의 소스 코드를 직접 수정하는 행위
- ❌ Caret의 import 경로를 `cline`이 아닌 다른 곳으로 변경
- ❌ 오버레이 아키텍처 구조 변경

### **핵심 원칙**
- ✅ `Caret`은 `cline`을 import해서 확장하는 것이 정상입니다.
- ✅ `cline`은 **읽기 전용(Read-only)** 으로 취급해야 합니다.
- ✅ 모든 수정은 `caret/` 폴더 내에서만 이루어져야 합니다.

---

## 📁 **주요 파일 위치**

```
caret-zero/
├── caret/tsconfig.json                           ← 수정 대상 1
├── caret/backend/controllers/base-controller.ts  ← 수정 대상 2  
├── caret/backend/controllers/persona-controller.ts ← 수정 대상 3
└── src/shared/types.ts                           ← import 소스
```

---

## 🎉 **완료 후 효과**

1. **오버레이 아키텍처 100% 완성**
2. **Cline upstream 머징 자동화 기반 구축**
3. **개발 효율성 극대화**

---

*작성: Alpha (알파) | 일시: 2025-01-11*
*Task #030 후속작업으로 최종 5% 마무리* 