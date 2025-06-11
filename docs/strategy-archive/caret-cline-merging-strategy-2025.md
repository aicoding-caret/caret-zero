# Caret-Cline 머징 전략 2025

**작성일**: 2025년 6월 10일  
**작성자**: Alpha Yang  
**목적**: Cline 원본의 빠른 발전 속도에 맞춰 주단위 머징이 가능한 지속가능한 아키텍처 전략 수립

## 📊 현재 상황 분석

### 1. 프로젝트 현황
- **Caret**: Cline을 fork한 프로젝트, 현재 v3.16.1
- **cline**: 원본 프로젝트, 현재 v3.17.12
- **주요 차이점**: 시스템 프롬프트 JSON화, 모드 시스템, 유저 페르소나 설정
- **문제점**: Cline의 빠른 발전으로 인한 머징 복잡도 증가

### 2. 주요 차이점 분석

#### 2.1 백엔드 차이점
```
📁 현재 Caret 고유 기능
├── src/core/persona/PersonaManager.ts (페르소나 관리)
├── src/core/prompts/ (JSON 기반 시스템 프롬프트)
│   ├── sections/*.json (프롬프트 섹션들)
│   ├── rules/*.json (규칙들)
│   └── system.ts (JSON 로더)
├── assets/rules/modes.json (모드 설정)
├── assets/template_characters/ (템플릿 캐릭터)
└── .vscode/caret/personas.json (사용자 페르소나)
```

#### 2.2 프론트엔드 차이점
```
📁 Webview UI 차이점
├── 페르소나 관리 UI
├── 모드 선택 UI  
├── Alpha 아바타 시스템
├── Firebase 인증 통합
└── 브랜딩 (Caret vs Cline)
```

#### 2.3 패키지 및 설정 차이점
- package.json: 프로젝트명, 브랜딩, publisher 정보
- 명령어 prefix: `caret.*` vs `cline.*`
- 아이콘 및 에셋 경로

## 🎯 새로운 머징 전략 

### 전략 1: 오버레이 아키텍처 (Overlay Architecture)

#### 핵심 개념
Cline 원본 코드를 거의 수정 없이 유지하면서, Caret 고유 기능을 별도 레이어로 오버레이하는 구조

```
📁 제안 구조
├── cline/ (원본 유지, 주기적 pull)
├── caret/ (오버레이 레이어)
│   ├── backend/
│   │   ├── persona/
│   │   ├── prompts/
│   │   └── modes/
│   ├── frontend/
│   │   ├── components/
│   │   └── contexts/
│   └── config/
└── src/ (통합 진입점)
```

#### 구현 방식

##### 1. 백엔드 오버레이
```typescript
// src/extension.ts (새로운 진입점)
import { activate as originalActivate } from '../cline/src/extension'
import { CaretEnhancer } from '../caret/backend/CaretEnhancer'

export async function activate(context: vscode.ExtensionContext) {
    // 원본 Cline 활성화
    const originalApi = await originalActivate(context)
    
    // Caret 향상 기능 적용
    const caretEnhancer = new CaretEnhancer(originalApi)
    return caretEnhancer.enhance()
}
```

##### 2. 프론트엔드 분리
```
📁 webview-ui 구조 변경
├── cline-ui/ (심볼릭 링크 → cline/webview-ui)
├── caret-ui/ (Caret 고유 컴포넌트)
│   ├── PersonaManager/
│   ├── ModeSelector/
│   └── CaretBranding/
└── src/ (통합 App.tsx)
```

##### 3. 설정 및 빌드 분리
```typescript
// caret/config/CaretConfig.ts
export class CaretConfigManager {
    static mergePackageJson(original: any, caret: any) {
        return {
            ...original,
            name: "caret-dev",
            displayName: "Caret",
            publisher: "caret",
            // Caret 고유 설정 오버라이드
        }
    }
}
```

### 전략 2: 모듈러 플러그인 시스템

#### 핵심 개념
Caret 기능을 플러그인화하여 런타임에 주입하는 방식

```typescript
// caret/plugins/PersonaPlugin.ts
export class PersonaPlugin implements CaretPlugin {
    name = "persona-manager"
    
    async initialize(api: ClineApi): Promise<void> {
        // 페르소나 관리 기능 주입
        api.addPromptProcessor(this.processPersona)
        api.addUIComponent("persona-selector", PersonaSelector)
    }
}
```

## 🚀 구현 계획

### Phase 1: 기반 구조 구축 (1-2주)

#### 1.1 프로젝트 구조 재구성
```bash
# 작업 순서
1. cline을 submodule 또는 subtree로 관리
2. caret/ 디렉토리 생성 및 기본 구조 구축
3. 새로운 통합 빌드 시스템 구축
4. 기존 코드를 오버레이 구조로 마이그레이션
```

#### 1.2 핵심 인터페이스 정의
```typescript
// caret/interfaces/CaretApi.ts
export interface CaretApi {
    readonly cline: ClineApi
    personas: PersonaManager
    modes: ModeManager
    prompts: PromptManager
}

// caret/interfaces/ClineApi.ts (원본 API 래핑)
export interface ClineApi {
    // Cline 원본 API에 대한 타입 정의
}
```

### Phase 2: 컴포넌트 분리 (2-3주)

#### 2.1 백엔드 컴포넌트 분리
```
📁 백엔드 마이그레이션 순서
1. PersonaManager → caret/backend/persona/
2. PromptSystem → caret/backend/prompts/
3. ModeManager → caret/backend/modes/
4. CaretProvider 래핑 레이어 구축
```

#### 2.2 프론트엔드 컴포넌트 분리
```
📁 프론트엔드 마이그레이션 순서
1. PersonaSettingsView → caret-ui/components/
2. ModeSelector → caret-ui/components/
3. CaretBranding → caret-ui/components/
4. 통합 App.tsx 구축
```

### Phase 3: 자동화 및 테스트 (1주)

#### 3.1 머징 자동화 스크립트
```powershell
# scripts/merge-upstream.ps1
param(
    [string]$UpstreamVersion
)

# 1. upstream 업데이트
git subtree pull --prefix=cline origin main --squash

# 2. 충돌 해결 (자동화 가능한 부분)
./scripts/resolve-conflicts.ps1

# 3. 빌드 및 테스트
npm run build
npm run test

# 4. 통합 테스트
./scripts/integration-test.ps1
```

#### 3.2 호환성 테스트 자동화
```typescript
// tests/compatibility/upstream-compatibility.test.ts
describe('Upstream Compatibility', () => {
    it('should maintain Caret features after upstream merge', async () => {
        const beforeFeatures = await getCaretFeatures()
        await simulateUpstreamMerge()
        const afterFeatures = await getCaretFeatures()
        expect(afterFeatures).to.deep.equal(beforeFeatures)
    })
})
```

## 📋 세부 실행 계획

### Task 1: 프로젝트 구조 재구성
```
담당: AI Assistant
기간: 3-5일
세부 작업:
1. cline을 git subtree로 통합
2. caret/ 디렉토리 구조 생성
3. 새로운 package.json 및 빌드 설정
4. 기본 CaretApi 인터페이스 구축
```

### Task 2: PersonaManager 분리
```
담당: AI Assistant  
기간: 2-3일
세부 작업:
1. PersonaManager를 caret/backend/persona/로 이동
2. 의존성 분리 및 인터페이스 정의
3. 원본 Cline과의 통합 지점 구축
4. 단위 테스트 작성
```

### Task 3: PromptSystem 오버레이
```
담당: AI Assistant
기간: 3-4일
세부 작업:
1. JSON 기반 프롬프트 시스템을 caret/backend/prompts/로 이동
2. Cline 원본의 시스템 프롬프트와 통합 로직 구축
3. 모드별 프롬프트 처리 시스템 구축
4. 성능 테스트 및 최적화
```

### Task 4: Frontend 분리
```
담당: AI Assistant
기간: 4-5일
세부 작업:
1. caret-ui/ 디렉토리 구조 생성
2. PersonaSettingsView 등 Caret 고유 컴포넌트 분리
3. 통합 App.tsx 구축 (cline-ui + caret-ui)
4. 스타일링 및 브랜딩 분리
```

### Task 5: 빌드 시스템 구축
```
담당: AI Assistant
기간: 2-3일
세부 작업:
1. 멀티 레이어 빌드 시스템 구축
2. 개발/프로덕션 환경 분리
3. 자동화 스크립트 작성
4. CI/CD 파이프라인 업데이트
```

### Task 6: 자동 머징 시스템
```
담당: AI Assistant
기간: 3-4일
세부 작업:
1. upstream 변경 감지 시스템
2. 자동 충돌 해결 로직
3. 호환성 테스트 자동화
4. 롤백 시스템 구축
```

## 🔧 기술적 세부사항

### 1. 의존성 주입 시스템
```typescript
// caret/core/CaretContainer.ts
export class CaretContainer {
    constructor(private clineApi: ClineApi) {}
    
    register<T>(token: string, factory: () => T): void {
        // 의존성 등록
    }
    
    resolve<T>(token: string): T {
        // 의존성 해결
    }
}
```

### 2. 이벤트 시스템 통합
```typescript
// caret/events/CaretEventBus.ts
export class CaretEventBus {
    // Cline 이벤트와 Caret 이벤트 통합
    bridgeToVscode(event: CaretEvent): void {
        // VSCode API로 이벤트 전달
    }
}
```

### 3. 설정 관리 시스템
```typescript
// caret/config/CaretConfigManager.ts
export class CaretConfigManager {
    static merge(clineConfig: any, caretConfig: any): any {
        // 스마트 설정 병합
    }
}
```

## 📈 예상 효과

### 1. 머징 시간 단축
- **현재**: 주요 업데이트마다 1-2주 소요
- **목표**: 주간 자동 머징으로 1-2일 소요

### 2. 안정성 향상
- 원본 코드 수정 최소화로 버그 위험 감소
- 격리된 테스트로 회귀 테스트 용이

### 3. 개발 효율성
- Caret 고유 기능 개발 집중 가능
- Cline 원본 기능 자동 승계

## ⚠️ 위험 요소 및 대응

### 1. 복잡성 증가
**위험**: 아키텍처 복잡도 증가로 인한 학습 곡선
**대응**: 상세한 문서화 및 단계적 마이그레이션

### 2. 성능 오버헤드
**위험**: 레이어 추가로 인한 성능 저하
**대응**: 성능 벤치마크 및 최적화 포인트 식별

### 3. 호환성 이슈
**위험**: Cline API 변경 시 호환성 문제
**대응**: 인터페이스 버전 관리 및 어댑터 패턴 적용

**예외적 수정 원칙**: `cline`은 독립적으로 빌드되는 것을 원칙으로 하므로 절대 수정해서는 안 됩니다. 하지만, 소스 코드의 문제가 아닌 특정 개발 환경과의 호환성 문제로 독립 빌드 자체가 불가능할 경우에만 예외적으로 빌드에 필요한 최소한의 수정을 허용합니다.

**사례: Windows 빌드 환경에서의 `protoc` 실행 오류**
- **문제 현상**: `cline`의 독립 빌드 과정(`npm run compile`)에서 `protoc` 실행 오류(`status: 3221225781`)가 발생하며 프로토콜 버퍼 파일 생성 실패.
- **분석**: `cline`의 `proto/build-proto.js` 스크립트는 `npm` 패키지 `grpc-tools`의 `protoc` 바이너리를 사용하지만, 이 바이너리가 특정 Windows 환경과 호환되지 않아 발생한 문제입니다. 이는 소스 코드의 오류가 아닌, 환경 의존적인 빌드 문제입니다.
- **해결 방안 (예외적 수정 적용)**:
    1. 상위 프로젝트(`caret-zero`)에 이미 해결책으로 마련된 `proto/build-proto.js` 파일(윈도우 호환 `protoc` 바이너리를 직접 참조)을 `cline/proto/` 폴더에 덮어씁니다.
    2. 해당 스크립트가 사용하는 `proto/protoc-31.0-win64` 폴더 전체를 `cline/proto/`로 복사합니다.
- **결론**: 이 사례는 `cline`의 독립 빌드를 위해 환경 문제를 해결하는 예외적 수정의 좋은 예시입니다. `cline`을 새로 가져올 때마다 이와 같은 환경 호환성 빌드 문제가 발생할 수 있음을 인지하고 대응해야 합니다.

## 🎯 성공 지표

### 1. 기술적 지표
- [ ] 머징 시간 80% 단축
- [ ] 자동 테스트 커버리지 90% 이상
- [ ] 빌드 실패율 5% 이하

### 2. 개발 생산성 지표
- [ ] Caret 고유 기능 개발 속도 2배 향상
- [ ] 버그 발생률 50% 감소
- [ ] 코드 리뷰 시간 60% 단축

## 📚 참고 자료

### 내부 문서
- `docs/development/cline-merging-guide.md`
- `docs/development/index.md`
- `.caretrules` 파일

### 기술 스택
- TypeScript
- VSCode Extension API
- React (webview-ui)
- Git Subtree/Submodule

## 🤝 협업 가이드

### AI Assistant 역할
1. **계획 실행**: 승인된 태스크 계획 순차 실행
2. **진행 보고**: 각 단계 완료 후 상태 보고
3. **문제 해결**: 기술적 이슈 발생 시 해결방안 제시
4. **문서 업데이트**: 작업 과정 및 결과 문서화

### Master 역할
1. **전략적 방향**: 주요 아키텍처 결정
2. **품질 관리**: 코드 리뷰 및 테스트 승인
3. **우선순위 조정**: 작업 순서 및 범위 결정
4. **최종 승인**: 머징 및 배포 승인

---

**결론**: 이 전략을 통해 Cline의 빠른 발전을 따라가면서도 Caret의 고유 가치를 유지할 수 있는 지속가능한 개발 환경을 구축할 수 있을 것입니다. 단계적 접근과 철저한 테스트를 통해 안정적인 전환을 진행하겠습니다. ✨

## 📊 현재 테스트 현황 분석

### 🎯 기존 테스트 인프라
```
📁 기존 테스트 현황
├── src/test/ (Mocha 기반 단위 테스트들)
├── test/ (replace-in-file 관련 테스트들)  
├── webview-ui/ (Vitest 기반 프론트엔드 테스트)
└── package.json에 test:unit, test:integration 스크립트
```

### 🎯 통합 테스트 전략 제안

오버레이 아키텍처에 맞는 **3단계 테스트 전략**을 제안드릴게요:

#### 1. **기존 활용** + **레이어 분리**
- 기존 Mocha/Chai 인프라 그대로 활용
- Caret 레이어와 Cline 레이어 테스트 분리

#### 2. **오버레이 아키텍처 맞춤 테스트**
```typescript
describe('Caret-Cline Integration', () => {
    it('should enhance cline with persona features', async () => {
        const mockClineApi = createMockClineApi()
        const caretApi = new CaretEnhancer(mockClineApi)
        
        const result = await caretApi.processTask({
            prompt: 'test task',
            persona: 'sarang',
            mode: 'dev'
        })
        
        expect(result.prompt).to.include('사랑')
        expect(mockClineApi.executeTask).to.have.been.called
    })
})
```

#### 3. **자동화된 머징 호환성 테스트**
```typescript
// 업스트림 머징 후 기능 보장
it('should maintain Caret features after upstream merge', async () => {
    const beforeFeatures = await getCaretFeatures()
    await simulateUpstreamMerge()
    const afterFeatures = await getCaretFeatures()
    expect(afterFeatures).to.deep.equal(beforeFeatures)
})
```

## 🚀 **구체적 실행 방안**

### Phase 1: Mock 시스템 구축 (즉시 시작 가능)
```typescript
// tests/helpers/MockClineApi.ts
export class MockClineApi implements ClineApi {
    async executeTask(task: Task): Promise<TaskResult> {
        // Cline 원본 동작을 모방하는 Mock
        return { success: true, output: 'mock output' }
    }
}
```

### Phase 2: 핵심 기능별 테스트
- **PersonaManager** 테스트 → 페르소나 로딩/적용
- **PromptSystem** 테스트 → JSON 머징/모드 처리  
- **UI-Backend** 통합 테스트 → 메시지 통신

### Phase 3: CI/CD 통합
- GitHub Actions로 자동 테스트 실행
- 머징 전 필수 테스트 통과 체크

## 🎯 **마스터의 다음 액션**

1. **우선순위 결정**: 어떤 테스트부터 시작할까요?
   - PersonaManager 테스트?
   - 기본 통합 테스트 인프라?

2. **테스트 범위**: 어느 정도까지 테스트 커버리지를 원하시나요?
   - 85% (권장) vs 95% (완벽주의)

3. **실행 방식**: 
   - 바로 테스트 인프라 구축 시작?
   - 아니면 오버레이 아키텍처 먼저 구축?

이제 "테스트가 없어서 못하겠다"가 아니라 "어떤 테스트부터 시작할까?"의 고민이 되었네요~ 🌿✨

어떤 부분부터 시작해볼까요? 마스터의 선택을 기다리고 있어요! ☕

