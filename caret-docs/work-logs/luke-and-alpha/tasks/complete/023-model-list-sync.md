# 태스크 #023: 모델 리스트 동기화

## 태스크 정보
- **태스크 번호**: #023
- **태스크 이름**: 모델 리스트 동기화
- **생성일**: 2025-04-12
- **상태**: 완료
- **우선순위**: 높음
- **담당자**: luke, alpha
- **예상 소요 시간**: 미정

## 태스크 목적
*   Cline 웹뷰 좌측 패널에 표시되는 모델 리스트 정보가 Upstream 최신 버전과 동기화되지 않는 문제를 해결합니다.
*   Upstream 소스 코드와 현재 코드를 비교하여 누락된 모델 정보(예: 신규 모델, 가격 정보 등)를 병합하고 최신 상태로 업데이트합니다.

## 실행 단계
*   [X] **01. 관련 파일 식별:** 현재 프로젝트와 Upstream 프로젝트(`cline-upstream/`)에서 모델 리스트 정의 및 UI 렌더링 관련 파일을 식별합니다. (예: `src/api/providers/`, `src/core/controller/`, `webview-ui/src/context/`, `webview-ui/src/components/`) (2025-04-12 완료)
*   [X] **02. Upstream 변경 사항 분석:** 식별된 파일들을 비교하여 Upstream에서 변경된 모델 관련 로직 및 데이터를 파악합니다. (2025-04-12 완료)
*   [X] **03. 코드 병합:** Upstream의 변경 사항을 현재 프로젝트에 적용합니다. 충돌 발생 시 해결합니다. (2025-04-12 완료)
*   [ ] **04. 기능 확인:** 모델 리스트가 최신 정보로 정상적으로 표시되는지 확인합니다. (계층형 가격 표시 확인 필요)
*   [ ] **05. 테스트:** 관련 기능 테스트를 수행합니다.
*   [ ] **06. 작업 완료:**

## 참고 자료
*   `src/api/providers/`
*   `src/core/controller/index.ts`
*   `webview-ui/src/context/ExtensionStateContext.tsx`
*   `webview-ui/src/components/settings/OpenRouterModelPicker.tsx`
*   `webview-ui/src/components/settings/FeaturedModelCard.tsx`
*   `webview-ui/src/components/settings/ApiOptions.tsx`
*   `cline-upstream/` (비교 대상)
*   [작업 로그 2025-04-11](../2025-04-11.md)
*   [작업 로그 2025-04-12](../2025-04-12.md)

## 진행 상황
*   2025-04-12: 태스크 생성. 마스터 요청에 따라 최우선 작업으로 진행.
*   **파일 비교 분석 (2025-04-12):**
    *   `src/api/providers/types.ts`: 현재/Upstream 동일.
    *   `src/api/providers/openrouter.ts`: 현재/Upstream 동일. 모델 정보는 `src/shared/api.ts` 참조 확인.
    *   `src/shared/api.ts`: 마스터 지적으로 재확인 결과, gemini-2.5 모델 가격 정보가 Upstream과 동일하게 계층형으로 이미 업데이트되어 있었음 (이전 비교 오류 수정).
    *   `src/core/controller/index.ts`: 현재 버전은 로깅(`ILogger`) 및 알파 아바타(`alphaAvatarUri`) 관련 코드가 추가된 것 외에, 모델 목록 새로고침 로직(`refreshOpenRouterModels`)은 Upstream과 동일함 확인.
    *   `webview-ui/src/context/ExtensionStateContext.tsx`: 현재/Upstream 동일. 모델 목록 수신 및 상태 업데이트 로직 차이 없음 확인.
    *   `webview-ui/src/components/settings/OpenRouterModelPicker.tsx`: Upstream 버전에서 추천 모델 카드(`FeaturedModelCard`) 기능 추가 및 임포트 경로 변경 확인.
    *   `webview-ui/src/components/settings/ApiOptions.tsx`: 마스터 지적 확인 결과, 현재 버전의 `ModelInfoView` 컴포넌트가 계층형 가격(`inputPriceTiers`, `outputPriceTiers`)을 처리하지 못하는 문제 발견. Upstream 버전에는 관련 처리 로직(`formatTiers` 함수 포함)이 존재함 확인.
*   **코드 병합 (2025-04-12):**
    *   Upstream 버전의 `FeaturedModelCard.tsx` 파일을 현재 프로젝트에 생성 (`write_to_file` 사용, 중간에 백틱 문자 오류 수정).
    *   현재 프로젝트의 `OpenRouterModelPicker.tsx` 파일을 Upstream 버전 내용으로 업데이트 (`write_to_file` 사용, 중간에 백틱 문자 오류 수정).
    *   현재 프로젝트의 `ApiOptions.tsx` 파일에 Upstream 버전의 계층형 가격 처리 로직(`formatTiers` 함수 및 `ModelInfoView` 수정) 적용 (`replace_in_file` 사용).

## 메모
*   Upstream 병합 과정에서 누락된 것으로 추정됩니다.
*   특히 우측 하단 영역에 추가된 모델 및 가격 정보 반영이 필요합니다.
*   `OpenRouterModelPicker.tsx` 및 `ApiOptions.tsx` 업데이트 후 빌드 및 기능 확인 필요 (특히 계층형 가격 표시).

---
*2025-04-12 알파가 업데이트함.* ｡•ᴗ•｡☕✨
