# Task #030: 오버레이 아키텍처 구현 계획

**작성일**: 2025년 1월 9일  
**작성자**: Alpha Yang  
**우선순위**: High  
**예상 소요시간**: 3-4주  
**목적**: Cline 원본의 빠른 발전에 대응할 수 있는 지속가능한 오버레이 아키텍처 구현

## 📊 현재 상황 분석 및 실현 가능성 검증

### 1. 소스 코드 분석 결과

#### 1.1 현재 Caret의 핵심 차이점
```
📁 Caret 고유 구조 (실제 분석 결과)
├── src/core/persona/
│   ├── PersonaManager.ts (단일 파일 관리)
│   ├── templateCharacters.ts (템플릿 관리)
│   └── persona-controller.ts (메시지 처리)
├── src/core/prompts/ (JSON 기반 프롬프트 시스템)
│   ├── sections/*.json (13개 섹션)
│   ├── rules/*.json (3개 기본 규칙)
│   └── system.ts (통합 로더)
├── assets/
│   ├── template_characters/ (템플릿 캐릭터)
│   ├── rules/modes.json (모드 설정)
│   └── icons/, imgs/ (브랜딩 에셋)
└── webview-ui/src/components/settings/PersonaSettingsView.tsx
```

#### 1.2 Cline-upstream 구조 분석
```
📁 Cline 원본 구조
├── src/core/prompts/system.ts (단일 프롬프트 시스템)
├── 확장점이 제한적
├── PersonaManager 없음
├── JSON 프롬프트 시스템 없음
└── 템플릿 캐릭터 시스템 없음
```

### 2. 실현 가능성 평가

#### ✅ **HIGH 실현 가능성 요소**
1. **PersonaManager 분리**: 이미 독립적인 모듈로 구현됨
2. **프롬프트 시스템 오버레이**: JSON 로더 구조가 잘 설계됨
3. **에셋 분리**: assets/ 폴더가 이미 독립적
4. **컨트롤러 분리**: AbstractController 패턴 활용 가능

#### ⚠️ **MEDIUM 실현 가능성 요소**
1. **웹뷰 컴포넌트 분리**: React 컴포넌트 의존성 관리 필요
2. **빌드 시스템 통합**: TypeScript 컴파일 경로 조정 필요
3. **extension.ts 통합점**: 활성화 로직 분리 필요

#### ❌ **LOW 위험 요소**
1. **메시지 시스템 호환성**: ExtensionMessage/WebviewMessage 인터페이스 일치 필요
2. **상태 관리 동기화**: GlobalState 시스템 통합

## 🎯 제안하는 오버레이 아키텍처

### 핵심 설계 원칙
> **"Cline 원본 코드는 건드리지 않고, Caret 기능을 별도 레이어로 주입"**

```
📁 새로운 프로젝트 구조
├── cline-upstream/ (원본, 자동 업데이트)
├── caret/ (오버레이 레이어)
│   ├── backend/
│   │   ├── persona/ (PersonaManager, templateCharacters)
│   │   ├── prompts/ (JSON 프롬프트 시스템)
│   │   ├── controllers/ (persona-controller 등)
│   │   └── storage/ (Caret 전용 상태 관리)
│   ├── frontend/
│   │   ├── components/ (PersonaSettingsView 등)
│   │   ├── context/ (Caret 전용 컨텍스트)
│   │   └── utils/ (Caret 전용 유틸)
│   ├── assets/ (템플릿, 아이콘, 규칙)
│   └── config/
│       ├── extension-enhancer.ts (확장 기능 주입)
│       ├── webview-enhancer.ts (웹뷰 기능 주입)
│       └── prompt-overlay.ts (프롬프트 오버레이)
└── src/ (통합 진입점)
    ├── extension.ts (Cline + Caret 통합)
    ├── core/webview/ (Cline 웹뷰 + Caret 기능)
    └── shared/ (공통 타입 정의)
```

## 🚀 단계별 구현 계획

### Phase 1: 기반 구조 구축 (Week 1)
**목표**: 오버레이 아키텍처의 기본 골격 구성

#### 1.1 디렉토리 구조 생성
- [ ] `caret/` 폴더 생성 및 하위 구조 구축
- [ ] `cline-upstream/` 폴더 정리 (서브모듈 또는 복사)
- [ ] 기존 `src/` 폴더 백업

#### 1.2 타입 정의 통합
- [ ] `src/shared/types.ts` 확장 (Persona, ExtensionMessage 등)
- [ ] Cline-upstream 타입과 호환성 확인
- [ ] 공통 인터페이스 정의

### Phase 2: 백엔드 레이어 분리 (Week 2)
**목표**: PersonaManager와 프롬프트 시스템을 Caret 레이어로 이전

#### 2.1 PersonaManager 이전
```bash
# 현재 위치: src/core/persona/
# 목표 위치: caret/backend/persona/
```
- [ ] `PersonaManager.ts` → `caret/backend/persona/`
- [ ] `templateCharacters.ts` → `caret/backend/persona/`
- [ ] `persona-controller.ts` → `caret/backend/controllers/`
- [ ] 의존성 경로 수정 (import 경로 조정)

#### 2.2 프롬프트 시스템 이전
```bash
# 현재 위치: src/core/prompts/
# 목표 위치: caret/backend/prompts/
```
- [ ] `system.ts` → `caret/backend/prompts/`
- [ ] `sections/` → `caret/backend/prompts/sections/`
- [ ] `rules/` → `caret/backend/prompts/rules/`
- [ ] JSON 로더 로직 유지

#### 2.3 에셋 이전
- [ ] `assets/` → `caret/assets/`
- [ ] 템플릿 캐릭터, 아이콘, 규칙 파일 포함

### Phase 3: 프론트엔드 레이어 분리 (Week 2-3)
**목표**: Caret 전용 React 컴포넌트들을 별도 레이어로 분리

#### 3.1 컴포넌트 분리
```bash
# 현재 위치: webview-ui/src/components/settings/
# 목표 위치: caret/frontend/components/
```
- [ ] `PersonaSettingsView.tsx` → `caret/frontend/components/`
- [ ] `TemplateCharacterSelectModal.tsx` → `caret/frontend/components/`
- [ ] Caret 전용 스타일 컴포넌트 분리

#### 3.2 컨텍스트 확장
- [ ] `ExtensionStateContext.tsx`에서 Caret 상태 분리
- [ ] `caret/frontend/context/CaretStateContext.tsx` 생성
- [ ] 상태 동기화 로직 구현

### Phase 4: 통합 시스템 구축 (Week 3)
**목표**: Cline 원본과 Caret 레이어를 연결하는 통합 시스템

#### 4.1 Extension Enhancer 구현
```typescript
// caret/config/extension-enhancer.ts
export class ExtensionEnhancer {
  static enhance(context: vscode.ExtensionContext, clineController: any) {
    // PersonaManager 주입
    // 프롬프트 시스템 오버레이
    // 추가 명령어 등록
  }
}
```

#### 4.2 Webview Enhancer 구현
```typescript
// caret/config/webview-enhancer.ts
export class WebviewEnhancer {
  static enhance(provider: WebviewProvider) {
    // Caret 컴포넌트 추가
    // 메시지 핸들러 확장
    // 상태 동기화
  }
}
```

#### 4.3 통합 진입점 구현
```typescript
// src/extension.ts (새로운 통합 버전)
import { activate as clineActivate } from '../cline-upstream/src/extension'
import { ExtensionEnhancer } from '../caret/config/extension-enhancer'

export async function activate(context: vscode.ExtensionContext) {
  // Cline 원본 활성화
  const clineAPI = await clineActivate(context)
  
  // Caret 기능 추가
  const caretAPI = ExtensionEnhancer.enhance(context, clineAPI)
  
  return { ...clineAPI, ...caretAPI }
}
```

### Phase 5: 빌드 시스템 및 테스트 (Week 4)
**목표**: 통합 빌드 시스템과 테스트 환경 구축

#### 5.1 빌드 시스템 수정
- [ ] `tsconfig.json` 경로 설정 수정
- [ ] `package.json` 스크립트 조정
- [ ] 웹뷰 빌드 프로세스 통합

#### 5.2 테스트 시스템 구축
- [ ] Caret 레이어 단위 테스트
- [ ] 통합 테스트 (Cline + Caret)
- [ ] E2E 테스트 (PersonaManager, 프롬프트 시스템)

#### 5.3 자동 머징 준비
```bash
# 자동 머징 스크립트 예시
#!/bin/bash
# scripts/merge-upstream.sh
git subtree pull --prefix=cline-upstream origin main --squash
npm run build
npm test
```

## 📋 상세 작업 명세

### 핵심 파일들의 이전 계획

#### 1. PersonaManager 관련 (3개 파일)
```
현재 위치 → 목표 위치
src/core/persona/PersonaManager.ts → caret/backend/persona/PersonaManager.ts
src/core/persona/templateCharacters.ts → caret/backend/persona/templateCharacters.ts
src/core/controller/persona-controller.ts → caret/backend/controllers/persona-controller.ts
```
**수정 사항**:
- import 경로 수정 (`../../shared/types` → `../../../src/shared/types`)
- 워크스페이스 경로 로직 유지
- AbstractController 상속 구조 유지

#### 2. 프롬프트 시스템 관련 (16개 파일)
```
현재 위치 → 목표 위치
src/core/prompts/system.ts → caret/backend/prompts/system.ts
src/core/prompts/sections/*.json (13개) → caret/backend/prompts/sections/
src/core/prompts/rules/*.json (3개) → caret/backend/prompts/rules/
```
**수정 사항**:
- JSON 파일 경로 참조 수정
- 폴백 메커니즘 유지 (.json → .md)
- 모드 시스템 통합

#### 3. 프론트엔드 컴포넌트 (2개 파일)
```
현재 위치 → 목표 위치
webview-ui/src/components/settings/PersonaSettingsView.tsx → caret/frontend/components/PersonaSettingsView.tsx
webview-ui/src/components/settings/TemplateCharacterSelectModal.tsx → caret/frontend/components/TemplateCharacterSelectModal.tsx
```
**수정 사항**:
- import 경로 수정
- ExtensionStateContext 의존성 조정
- vscode 메시지 시스템 호환성 유지

## 🔧 기술적 도전 과제 및 해결책

### 1. 메시지 시스템 호환성
**문제**: ExtensionMessage와 WebviewMessage 인터페이스 일치성
**해결책**: 
```typescript
// src/shared/types.ts에서 타입 통합
type UnifiedMessage = ClineMessage & CaretMessage
```

### 2. 상태 관리 동기화
**문제**: GlobalState와 PersonaManager의 상태 동기화
**해결책**:
```typescript
// caret/config/state-sync.ts
export class StateSynchronizer {
  static syncPersonaState(context: vscode.ExtensionContext, persona: Persona) {
    // 양방향 동기화 로직
  }
}
```

### 3. 빌드 복잡성
**문제**: 다중 소스 경로와 TypeScript 컴파일
**해결책**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@cline/*": ["cline-upstream/src/*"],
      "@caret/*": ["caret/*"],
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

## 📈 성공 지표

### 1. 기능적 지표
- [ ] PersonaManager 정상 작동 (템플릿 로드, 저장, 업데이트)
- [ ] JSON 프롬프트 시스템 정상 작동
- [ ] 모든 기존 Caret 기능 동작 확인
- [ ] Cline 원본 기능 손상 없음

### 2. 유지보수성 지표
- [ ] Cline-upstream 업데이트 시 충돌 없음
- [ ] 자동 머징 스크립트 성공률 95% 이상
- [ ] 빌드 시간 기존 대비 150% 이내

### 3. 개발 효율성 지표
- [ ] 새로운 Caret 기능 추가 시간 단축
- [ ] 코드 중복률 20% 이하
- [ ] 테스트 커버리지 80% 이상

## 🚨 리스크 관리

### High Risk
1. **Cline 인터페이스 변경**: 정기 호환성 체크 자동화
2. **상태 동기화 실패**: 폴백 메커니즘 구현
3. **빌드 시스템 복잡화**: 단계별 검증

### Medium Risk
1. **성능 저하**: 프로파일링 및 최적화
2. **메모리 사용량 증가**: 모니터링 시스템 구축

### Low Risk
1. **UI 불일치**: 디자인 시스템 통합
2. **로깅 중복**: 통합 로깅 시스템

## 📝 다음 단계

1. **승인 대기**: 이 계획서 검토 및 승인
2. **체크리스트 작성**: 상세 실행 체크리스트 생성
3. **프로토타입 구현**: Phase 1 작업 시작
4. **지속적 피드백**: 주간 진행 상황 리뷰

---

**검토자**: Luke  
**최종 수정일**: 2025년 1월 9일  
**상태**: 검토 대기 중 