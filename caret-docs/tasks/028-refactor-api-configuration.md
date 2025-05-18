# API Configuration Refactoring Task

## Overview
api.ts파일의 리팩토링 작업으로 json으로 분리하고 공통로직을 개발합니다. 
 - 백업 참고용 원본 파일 정보 (`private-cline/src/shared/api.ts`) 
 - 리팩토링할 파일 정보 (`/src/shared/api.ts`)
 - json은 분리했으나, api.ts파일내의 객체들을 외부참조하는 문제로 인해 에러가 많아 소스는 롤백함
   * api.ts의 객체들을 유지한채로 json로딩 방법만 구현하는 형태로 다시 리팩토링 필요. 따라서 아래의 컴포넌트 구현도 전면 검토 해야함

## 현재 상태 (2024-05-13) 
### ✅ 완료된 작업
1. **UI 컴포넌트**
   - [ ] `ApiProviderConfig.tsx`: Provider 설정 UI
   - [ ] `ModelInfoView.tsx`: 모델 정보 표시 UI

2. **설정 시스템**
   - [ ] `configLoader.ts`: Provider 설정 로드 시스템
   - [ ] `types.ts`: Provider 설정 타입 정의

3. **Provider 설정 JSON 파일**
   - [x] 20개 제공자의 Provider 설정 JSON 파일 생성 (`src/shared/providers/`)
   - [x] Provider 정보 구조 정의 (api 키, 엔드포인트 등)

4. **모델 정보 JSON 분리**
   - [x] 각 제공자별 모델 정보 파일 생성 (`src/shared/models/`)
   - [] `api.ts`의 하드코딩된 모델 정보(158개)를 JSON으로 분리
   - [x] 각 제공자별 모델 정보 파일 생성 (`src/shared/models/`)
   - [x] 모든 모델의 JSON 형식 변환 검증
   - [x] 지원 모델 문서 생성 (`caret-docs/supported-models.md`, `caret-docs/supported-models.ko.md`)
   - [x] README 파일에 지원 모델 정보 추가

### 🔄 진행 중/미완료 작업
1. **로더 시스템 확장**
   - [ ] `configLoader.ts` 확장 (모델 정보 로드 기능 추가)
   - [ ] 경로 참조 업데이트
   - [ ] 로드 로직 검증

2. **통합**
   - [ ] `api.ts` 연동 (하드코딩된 모델 정보 제거)
   - [ ] 모든 Provider 테스트
   - [ ] 에러 처리

## 모델 변환 완료 상태
| 프로바이더 | 모델 수 | 상태 |
|-----------|--------|------|
| 1. anthropic | 5 | ✅ 완료 |
| 2. bedrock | 12 | ✅ 완료 |
| 3. openrouter | 1+ | ✅ 완료 |
| 4. vertex | 17 | ✅ 완료 |
| 5. openai | 다수 | ✅ 완료 |
| 6. ollama | 3 | ✅ 완료 |
| 7. lmstudio | 1 | ✅ 완료 |
| 8. gemini | 14 | ✅ 완료 |
| 9. openai-native | 13 | ✅ 완료 |
| 10. requesty | 1+ | ✅ 완료 |
| 11. together | 3+ | ✅ 완료 |
| 12. deepseek | 2 | ✅ 완료 |
| 13. qwen (international) | 20 | ✅ 완료 |
| 14. qwen (mainland) | 22 | ✅ 완료 |
| 15. doubao | 4 | ✅ 완료 |
| 16. mistral | 10 | ✅ 완료 |
| 17. vscode-lm | 2 | ✅ 완료 |
| 18. litellm | 1+ | ✅ 완료 |
| 19. asksage | 3 | ✅ 완료 |
| 20. xai | 12 | ✅ 완료 |
| 21. sambanova | 12 | ✅ 완료 |
| **총계** | **158+** | ✅ **완료** |

## 다음 세션 작업 계획

### 1. 로더 시스템 확장 (세션 1)
#### 작업 단계
1. `configLoader.ts` 확장 (모델 정보 로드)
   ```typescript
   export const loadModelInfo = async (provider: string) => {
     try {
       const modelInfo = await import(`./models/${provider}.json`);
       return modelInfo.default;
     } catch (error) {
       console.error(`Failed to load model info for ${provider}:`, error);
       return null;
     }
   };
   ```

2. 특수 케이스 처리 (Qwen International/Mainland)
   ```typescript
   export const loadQwenModelInfo = async (region: "international" | "mainland") => {
     try {
       const modelInfo = await import(`./models/qwen-${region}.json`);
       return modelInfo.default;
     } catch (error) {
       console.error(`Failed to load Qwen model info for ${region}:`, error);
       return null;
     }
   };
   ```

3. 캐싱 최적화
   ```typescript
   const modelInfoCache: Record<string, any> = {};
   
   export const getModelInfo = async (provider: string) => {
     if (modelInfoCache[provider]) return modelInfoCache[provider];
     
     const info = await loadModelInfo(provider);
     if (info) modelInfoCache[provider] = info;
     return info;
   };
   ```

4. 로드 로직 검증
   - 파일 로드 테스트
   - 캐싱 테스트
   - 에러 처리 테스트

### 2. API 통합 (세션 2)
#### 작업 단계
1. `api.ts` 수정 준비
   - 하드코딩된 모델 정보 제거 계획
   - JSON 파일 로드 로직 설계
   - 필요한 타입 정의 검토/수정

2. 점진적 통합
   - 제공자별로 순차적으로 적용
   - 각 단계 테스트

3. 롤백 계획
   - 문제 발생 시 원래 코드로 롤백할 수 있는 전략

### 3. 최종 테스트 및 문서화 (세션 3)
#### 작업 단계
1. 전체 시스템 테스트
   - 각 Provider별 JSON 파일 로드 테스트
   - 모델 정보 접근 테스트
   - 에러 케이스 테스트

2. 성능 테스트
   - 로드 시간 측정
   - 캐싱 효과 검증

3. 최종 문서화
   - 코드 주석 추가
   - README 업데이트
   - 사용 예제 작성

## 주의사항
1. **기존 구현 유지**
   - UI 컴포넌트 구조 유지
   - 설정 시스템 로직 유지
   - 기존 기능 동작 보장

2. **변경 시 주의**
   - 모델 정보의 정확성 유지
   - 가격 정보 정확히 유지
   - 기능 지원 정보 정확히 유지 (이미지, 컴퓨터 사용 등)

3. **검증 필수 사항**
   - 모든 Provider의 설정이 누락 없이 이동되었는지 확인
   - 모든 모델 정보가 정확히 JSON으로 변환되었는지 확인
   - 특히 Gemini 모델의 특수 구조 확인
   - 설정 로드 테스트 수행

## 잠재적 문제 및 대응 방안
1. **경로 참조 문제**
   - 문제: import 경로 문제로 파일을 찾지 못함
   - 해결: 상대 경로와 절대 경로 모두 테스트, 경로 설정 확인

2. **타입 시스템 호환성**
   - 문제: JSON에서 로드한 데이터와 기존 타입 간 불일치
   - 해결: 타입 가드 또는 변환 함수 구현

3. **성능 이슈**
   - 문제: JSON 파일 로드로 인한 성능 저하
   - 해결: 캐싱 메커니즘 구현, 지연 로딩 적용

4. **누락된 필드**
   - 문제: 일부 필드가 변환 과정에서 누락됨
   - 해결: 철저한 검증 및 테스트 케이스 구현

## 현재 상태 업데이트 (2024-05-20)

### 진행 상황 요약
1. **모델 정보의 JSON 분리** ✅
   - 모든 제공자(Provider)의 모델 정보를 JSON 파일로 성공적으로 분리
   - JSON 파일들은 `src/shared/models/` 디렉토리에 위치

2. **configLoader.ts 개발** ✅
   - JSON 파일에서 모델 정보를 로드하는 유틸리티 함수 구현 
   - `getModelInfo`, `getDefaultModelId`, `getModelById` 등의 함수 구현

3. **하드코딩 제거 시도** 🔄
   - `api.ts`에서 하드코딩된 모델 정보 제거 시도
   - 다른 파일들의 참조 문제로 인해 어려움 발생

### 현재 문제점
1. **중복 선언 오류**
   - `api.ts` 파일에서 모델 객체들(예: `anthropicModels`)이 두 번 선언되어 발생하는 린터 에러
   - 첫 번째 선언: 19-38줄 `export const anthropicModels: Record<string, ModelInfo> = {}`
   - 두 번째 선언: 326-345줄 `export const anthropicModels = {} as Record<string, ModelInfo>`

2. **빌드 오류**
   - 모델 객체들을 제거했을 때 다른 파일에서 참조 오류 발생
   - 162개 이상의 오류가 33개 파일에서 발생
   - 주요 오류: `anthropicModels`, `bedrockModels` 등의 exported member not found

3. **타입 문제**
   - 일부 파일에서 `ModelInfo` 타입 관련 문제 (예: vscode-lm.ts)
   - 필수 속성인 `id`와 `name`이 누락됨

### 개선 방향
1. **점진적 접근 방법**
   - 모든 것을 한번에 변경하지 않고 단계적으로 진행
   - 호환성 유지가 최우선 목표

2. **빈 객체 유지 전략**
   - `api.ts`에 빈 모델 객체를 유지 (예: `export const anthropicModels = {} as Record<string, ModelInfo>`)
   - `initializeModelObjects` 함수를 통해 JSON 데이터로 이 빈 객체들을 채우는 방식
   - 외부 파일에서의 참조 호환성 유지

3. **중복 선언 해결**
   - 첫 번째 선언(19-38줄)을 제거하고 한 곳에서만 선언하도록 수정
   - 혹은 TypeScript의 declare 방식으로 변경 검토

### 구현 계획
1. **중복 선언 문제 해결** (세션 1)
   - `api.ts` 파일에서 모델 객체들의 중복 선언 제거
   - 린터 에러 해결 확인

2. **초기화 로직 검증** (세션 2)
   - `initializeModelObjects` 함수가 올바르게 동작하는지 확인
   - 모듈 로드 시 자동 초기화 확인

3. **개별 Provider 테스트** (세션 3)
   - 각 제공자별로 모델 정보가 올바르게 로드되는지 테스트
   - 기존 기능과 동일하게 동작하는지 확인

4. **추가 리팩토링** (세션 4, 선택적)
   - 성공적인 기본 통합 후, 추가 개선 작업 진행
   - 코드 간소화 및 최적화
   - 더 명확한 타입 정의

### 롤백 계획
문제 발생 시 다음 명령으로 원래 상태로 복원 가능:
```
git checkout src/shared/api.ts
```

이 방식은 기능적 변경 없이 코드 구조만 개선하는 것을 목표로 합니다. 호환성을 유지하면서 점진적으로 하드코딩 제거를 진행하겠습니다.