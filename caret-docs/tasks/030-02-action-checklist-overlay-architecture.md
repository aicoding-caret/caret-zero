# Task #030: 오버레이 아키텍처 구현 체크리스트

**작성일**: 2025년 1월 9일  
**작성자**: Alpha Yang  
**참조**: [030-01-plan-overlay-architecture-implementation.md](./030-01-plan-overlay-architecture-implementation.md)  
**상태**: 준비 완료

## 📋 Phase 1: 기반 구조 구축 (3-5일)

### 1.1 디렉토리 구조 생성
- [ ] **1.1.1** `caret/` 루트 폴더 생성
- [ ] **1.1.2** `caret/backend/` 폴더 생성
  - [ ] `caret/backend/persona/`
  - [ ] `caret/backend/prompts/`
  - [ ] `caret/backend/controllers/`
  - [ ] `caret/backend/storage/`
- [ ] **1.1.3** `caret/frontend/` 폴더 생성
  - [ ] `caret/frontend/components/`
  - [ ] `caret/frontend/context/`
  - [ ] `caret/frontend/utils/`
- [ ] **1.1.4** `caret/assets/` 폴더 생성
- [ ] **1.1.5** `caret/config/` 폴더 생성
- [ ] **1.1.6** 기존 `src/` 폴더를 `src-backup/`으로 백업
- [ ] **1.1.7** 새로운 `src/` 폴더 생성 (통합 진입점용)

### 1.2 cline-upstream 준비
- [ ] **1.2.1** `cline-upstream/` 폴더 상태 확인
- [ ] **1.2.2** cline-upstream 최신 상태 확인
- [ ] **1.2.3** cline-upstream 빌드 테스트

### 1.3 기본 설정 파일 생성
- [ ] **1.3.1** `caret/tsconfig.json` 생성
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@cline/*": ["../cline-upstream/src/*"],
      "@shared/*": ["../src/shared/*"]
    }
  },
  "include": [
    "**/*"
  ]
}
```
- [ ] **1.3.2** `caret/package.json` 생성
```json
{
  "name": "caret-overlay",
  "version": "1.0.0",
  "private": true,
  "description": "Caret overlay layer for Cline",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  }
}
```
- [ ] **1.3.3** `caret/README.md` 생성

### 1.4 타입 정의 기초 작업
- [ ] **1.4.1** `src/shared/` 폴더 생성
- [ ] **1.4.2** `src/shared/types.ts` 기본 구조 생성
- [ ] **1.4.3** Persona 타입 정의 확인 및 업데이트
- [ ] **1.4.4** ExtensionMessage 타입 호환성 확인

## 📋 Phase 2: 백엔드 레이어 분리 (5-7일)

### 2.1 PersonaManager 이전
- [ ] **2.1.1** `src-backup/core/persona/PersonaManager.ts` → `caret/backend/persona/PersonaManager.ts` 복사
- [ ] **2.1.2** PersonaManager.ts import 경로 수정
  - [ ] `'../../shared/types'` → `'../../../src/shared/types'`
  - [ ] 기타 상대 경로 조정
- [ ] **2.1.3** `src-backup/core/persona/templateCharacters.ts` → `caret/backend/persona/templateCharacters.ts` 복사
- [ ] **2.1.4** templateCharacters.ts import 경로 수정
- [ ] **2.1.5** `src-backup/core/controller/persona-controller.ts` → `caret/backend/controllers/persona-controller.ts` 복사
- [ ] **2.1.6** persona-controller.ts import 경로 수정
- [ ] **2.1.7** PersonaManager 관련 TypeScript 컴파일 테스트

### 2.2 프롬프트 시스템 이전
- [ ] **2.2.1** `src-backup/core/prompts/system.ts` → `caret/backend/prompts/system.ts` 복사
- [ ] **2.2.2** system.ts 내부 경로 참조 수정
  - [ ] `path.join(__dirname, "sections")` → `path.join(__dirname, "sections")`
  - [ ] `path.join(__dirname, "rules")` → `path.join(__dirname, "rules")`
- [ ] **2.2.3** `src-backup/core/prompts/sections/` → `caret/backend/prompts/sections/` 전체 복사
  - [ ] 13개 JSON 파일 확인
  - [ ] 폴더 구조 유지
- [ ] **2.2.4** `src-backup/core/prompts/rules/` → `caret/backend/prompts/rules/` 전체 복사
  - [ ] 3개 JSON 파일 확인
  - [ ] 폴더 구조 유지
- [ ] **2.2.5** 프롬프트 시스템 로딩 테스트

### 2.3 에셋 이전
- [ ] **2.3.1** `assets/template_characters/` → `caret/assets/template_characters/` 복사
- [ ] **2.3.2** `assets/rules/` → `caret/assets/rules/` 복사
- [ ] **2.3.3** `assets/icons/` → `caret/assets/icons/` 복사
- [ ] **2.3.4** `assets/imgs/` → `caret/assets/imgs/` 복사
- [ ] **2.3.5** 기타 Caret 전용 에셋 파일들 복사
- [ ] **2.3.6** 에셋 경로 참조 확인 및 수정

### 2.4 AbstractController 기반 클래스 생성
- [ ] **2.4.1** `caret/backend/controllers/base-controller.ts` 생성
```typescript
// AbstractController를 Caret 레이어에서 재정의
import * as vscode from "vscode"
import { ExtensionMessage } from "../../../src/shared/ExtensionMessage"
import { WebviewMessage } from "../../../src/shared/WebviewMessage"
import { ILogger } from "../../../src/services/logging/ILogger"

export abstract class CaretController {
  constructor(
    protected context: vscode.ExtensionContext,
    protected logger: ILogger,
    protected postMessage: (message: ExtensionMessage) => Promise<void>
  ) {}
  
  abstract canHandle(messageType: string): boolean
  abstract handleMessage(message: WebviewMessage): Promise<boolean>
}
```
- [ ] **2.4.2** persona-controller.ts에서 CaretController 상속으로 변경

## 📋 Phase 3: 프론트엔드 레이어 분리 (4-6일)

### 3.1 React 컴포넌트 이전
- [ ] **3.1.1** `webview-ui/src/components/settings/PersonaSettingsView.tsx` → `caret/frontend/components/PersonaSettingsView.tsx` 복사
- [ ] **3.1.2** PersonaSettingsView.tsx import 경로 수정
  - [ ] `"../../context/ExtensionStateContext"` → 새로운 컨텍스트 경로
  - [ ] `"../../utils/vscode"` → `"../utils/vscode"`
- [ ] **3.1.3** `webview-ui/src/components/settings/TemplateCharacterSelectModal.tsx` → `caret/frontend/components/TemplateCharacterSelectModal.tsx` 복사
- [ ] **3.1.4** TemplateCharacterSelectModal.tsx import 경로 수정
- [ ] **3.1.5** 기타 Caret 전용 컴포넌트들 이전

### 3.2 Context 시스템 분리
- [ ] **3.2.1** `caret/frontend/context/CaretStateContext.tsx` 생성
```typescript
// Caret 전용 상태 관리
import React, { createContext, useContext, useReducer } from 'react'
import { Persona } from '../../../src/shared/types'

interface CaretState {
  persona?: Persona
  templateCharacters: any[]
  // 기타 Caret 전용 상태
}

// Context 구현...
```
- [ ] **3.2.2** 기존 ExtensionStateContext와의 통합점 설계
- [ ] **3.2.3** 상태 동기화 로직 구현

### 3.3 유틸리티 함수 분리
- [ ] **3.3.1** `caret/frontend/utils/vscode.ts` 생성
- [ ] **3.3.2** Caret 전용 메시지 헬퍼 함수들 구현
- [ ] **3.3.3** 타입 안전성 확보

## 📋 Phase 4: 통합 시스템 구축 (5-7일)

### 4.1 Extension Enhancer 구현
- [ ] **4.1.1** `caret/config/extension-enhancer.ts` 생성
```typescript
import * as vscode from 'vscode'
import { PersonaManager } from '../backend/persona/PersonaManager'
import { PersonaController } from '../backend/controllers/persona-controller'

export class ExtensionEnhancer {
  static async enhance(context: vscode.ExtensionContext, clineAPI: any) {
    // PersonaManager 초기화
    // 추가 명령어 등록
    // Caret 전용 기능 활성화
    
    return {
      personaManager: PersonaManager,
      // 기타 Caret API
    }
  }
}
```
- [ ] **4.1.2** PersonaManager 통합 로직 구현
- [ ] **4.1.3** 프롬프트 시스템 오버레이 로직 구현
- [ ] **4.1.4** 추가 VSCode 명령어 등록

### 4.2 Webview Enhancer 구현
- [ ] **4.2.1** `caret/config/webview-enhancer.ts` 생성
```typescript
import { WebviewProvider } from '@cline/core/webview'
import { CaretStateProvider } from '../frontend/context/CaretStateContext'

export class WebviewEnhancer {
  static enhance(provider: WebviewProvider) {
    // Caret 컴포넌트 추가
    // 메시지 핸들러 확장
    // 상태 동기화 설정
  }
}
```
- [ ] **4.2.2** React 컴포넌트 통합 로직
- [ ] **4.2.3** 메시지 라우팅 확장

### 4.3 통합 진입점 구현
- [ ] **4.3.1** `src/extension.ts` 새로 생성
```typescript
import { activate as clineActivate, deactivate as clineDeactivate } from '../cline-upstream/src/extension'
import { ExtensionEnhancer } from '../caret/config/extension-enhancer'
import * as vscode from 'vscode'

export async function activate(context: vscode.ExtensionContext) {
  try {
    // Cline 원본 활성화
    const clineAPI = await clineActivate(context)
    
    // Caret 기능 추가
    const caretAPI = await ExtensionEnhancer.enhance(context, clineAPI)
    
    return { ...clineAPI, ...caretAPI }
  } catch (error) {
    console.error('Failed to activate Caret:', error)
    throw error
  }
}

export function deactivate() {
  return clineDeactivate()
}
```
- [ ] **4.3.2** 오류 처리 및 폴백 로직 구현
- [ ] **4.3.3** 초기화 순서 최적화

### 4.4 상태 동기화 시스템
- [ ] **4.4.1** `caret/config/state-sync.ts` 생성
```typescript
export class StateSynchronizer {
  static async syncPersonaState(context: vscode.ExtensionContext, persona: Persona) {
    // VSCode GlobalState ↔ PersonaManager 동기화
  }
  
  static async syncWebviewState(webviewState: any, caretState: any) {
    // 웹뷰 상태 ↔ Caret 상태 동기화
  }
}
```
- [ ] **4.4.2** 양방향 동기화 로직 구현
- [ ] **4.4.3** 충돌 해결 메커니즘 구현

## 📋 Phase 5: 빌드 시스템 및 테스트 (3-5일)

### 5.1 TypeScript 설정 통합
- [ ] **5.1.1** 루트 `tsconfig.json` 수정
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@cline/*": ["cline-upstream/src/*"],
      "@caret/*": ["caret/*"],
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": [
    "src/**/*",
    "caret/**/*",
    "cline-upstream/src/**/*"
  ],
  "exclude": [
    "src-backup/**/*"
  ]
}
```
- [ ] **5.1.2** 컴파일 경로 검증
- [ ] **5.1.3** 타입 충돌 해결

### 5.2 빌드 스크립트 수정
- [ ] **5.2.1** `package.json` scripts 섹션 업데이트
```json
{
  "scripts": {
    "build": "npm run build:caret && npm run build:main",
    "build:caret": "tsc -p caret/tsconfig.json",
    "build:main": "tsc -p tsconfig.json",
    "build:webview": "cd webview-ui && npm run build",
    "test": "npm run test:caret && npm run test:integration",
    "test:caret": "jest caret/**/*.test.ts",
    "test:integration": "jest src/**/*.test.ts"
  }
}
```
- [ ] **5.2.2** 빌드 검증 및 오류 수정
- [ ] **5.2.3** 웹뷰 빌드 프로세스 통합

### 5.3 테스트 시스템 구축
- [ ] **5.3.1** `caret/backend/__tests__/PersonaManager.test.ts` 생성
```typescript
import { PersonaManager } from '../persona/PersonaManager'
import { Persona } from '../../../src/shared/types'

describe('PersonaManager', () => {
  test('should load persona from file', () => {
    // 테스트 구현
  })
  
  test('should save persona to file', () => {
    // 테스트 구현
  })
})
```
- [ ] **5.3.2** `caret/backend/__tests__/prompt-system.test.ts` 생성
- [ ] **5.3.3** 통합 테스트 작성
- [ ] **5.3.4** E2E 테스트 작성

### 5.4 자동 머징 스크립트
- [ ] **5.4.1** `scripts/` 폴더 생성
- [ ] **5.4.2** `scripts/merge-upstream.sh` 생성
```bash
#!/bin/bash
set -e

echo "Updating cline-upstream..."
cd cline-upstream
git pull origin main
cd ..

echo "Building project..."
npm run build

echo "Running tests..."
npm test

echo "Merge completed successfully!"
```
- [ ] **5.4.3** Windows용 `scripts/merge-upstream.bat` 생성
- [ ] **5.4.4** 스크립트 실행 권한 설정

## 📋 Phase 6: 검증 및 최적화 (2-3일)

### 6.1 기능 검증
- [ ] **6.1.1** PersonaManager 기능 테스트
  - [ ] 템플릿 캐릭터 로드
  - [ ] 페르소나 저장/업데이트
  - [ ] 웹뷰 연동
- [ ] **6.1.2** 프롬프트 시스템 테스트
  - [ ] JSON 로딩
  - [ ] 모드별 프롬프트 생성
  - [ ] 오류 처리
- [ ] **6.1.3** 통합 기능 테스트
  - [ ] 확장 활성화
  - [ ] 웹뷰 표시
  - [ ] 메시지 통신

### 6.2 성능 최적화
- [ ] **6.2.1** 번들 크기 분석
- [ ] **6.2.2** 로딩 시간 측정
- [ ] **6.2.3** 메모리 사용량 프로파일링
- [ ] **6.2.4** 필요시 최적화 적용

### 6.3 문서화
- [ ] **6.3.1** `caret/README.md` 완성
- [ ] **6.3.2** API 문서 작성
- [ ] **6.3.3** 개발자 가이드 작성
- [ ] **6.3.4** 마이그레이션 가이드 작성

## 🚨 주의사항 및 체크포인트

### 중요 체크포인트
- [ ] **CP1**: Phase 1 완료 후 디렉토리 구조 검증
- [ ] **CP2**: Phase 2 완료 후 백엔드 컴파일 성공 확인
- [ ] **CP3**: Phase 3 완료 후 프론트엔드 빌드 성공 확인
- [ ] **CP4**: Phase 4 완료 후 통합 테스트 성공 확인
- [ ] **CP5**: Phase 5 완료 후 전체 빌드 및 테스트 성공 확인

### 위험 요소 모니터링
- [ ] **타입 충돌**: 각 Phase에서 TypeScript 컴파일 확인
- [ ] **경로 문제**: import 경로 수정 후 즉시 검증
- [ ] **의존성 문제**: package.json 변경 시 npm install 재실행
- [ ] **상태 동기화**: 웹뷰-확장 간 메시지 통신 테스트

### 롤백 계획
각 Phase 시작 전에 현재 상태 백업:
- [ ] **Git 커밋**: 각 Phase 시작 전 현재 상태 커밋
- [ ] **백업 폴더**: 중요 파일들의 개별 백업
- [ ] **설정 파일**: tsconfig.json, package.json 백업

---

**총 예상 소요 시간**: 22-33일  
**최종 검토자**: Luke  
**최종 수정일**: 2025년 1월 9일  
**상태**: 실행 준비 완료 