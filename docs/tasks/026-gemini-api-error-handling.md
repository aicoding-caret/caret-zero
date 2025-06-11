# Task 026: Gemini API 에러 처리 개선

## Task Information

- **Task Number:** 026
- **Task Name:** gemini-api-error-handling
- **Status:** In Progress

## Task Purpose

Gemini API 호출 시 발생하는 에러를 처리하고, 재시도 상태 및 최종 실패 상태를 웹뷰 UI에 명확하게 표시하여 사용자 경험을 개선합니다.
현재 Gemini 에러 지연에 대한 처리가 제대로 이루어지지 않고 UI가 업데이트 되지 않습니다.
기존에 controller 에서 webview로 `retryStatus` 메시지를 전송하여 로직을 처리하게 되어있는데 이 코드에 문제가 있는것으로 추정됩니다.
몇번의 재시도 끝에 최종 실패에 대한 API에러 메시지가 출력됩니다. 이때 status에 대한 상태가 넘어가게 되어있는데, 이는 정상적으로 처리 되므로 해당 로직을 분석후, 확인하거나 해당 로직을 이용하게 수정합니다.
 분석후 'retryStatus'가 불필요한 경우 삭제합니다.
  * 되는 로직만을 사용합니다. 새로운 로직을 가능한 만들지 않습니다.
  * UI는 "API 요청중.." 메시지 대신  "(2/5회) API요청 제한에 *초 후 재시도 합니다." 이렇게 노출 되고 대기하거나, 카운트를 해줄것
  * retryStatus 와 state 값이 혼용 되고 있을 수 있음, 이를 state값으로 통일할 것
  * 아래의 현상을 보면 메시지 발송이 제대로 안된것일 수 있으므로,  Created retry status message 로그이후 내용을 좀 더 상세하게 로깅을 하고 문제를 확인 중



## Execution Steps

## Reference Materials

-   [`webview-ui/src/components/chat/ChatView.tsx`](/webview-ui/src/components/chat/ChatView.tsx)
-   [`src/extension/controller/`](/src/extension/controller/) (관련 컨트롤러 파일 경로 확인 필요)
-   [`src/extension/utils/retry.ts`](/src/extension/utils/retry.ts) (가정)


## 현재 상태 및 다음 단계 (2025-04-15 알파 handover)

현재 Gemini API 재시도 로직 관련 타입 에러 해결을 진행 중입니다. 몇 가지 수정이 이루어졌지만, 여전히 해결해야 할 타입 에러들이 남아있습니다.

**남아있는 작업:**
로그를 보니 Gemini API에서 할당량 초과 에러가 발생하고 있고, 재시도 로직이 작동하고 있는 것 같습니다. 하지만 사용자가 "화면만 안나오는 것 같네"라고 말한 것으로 보아 웹뷰 UI에 재시도 상태가 표시되지 않는 문제가 있는 것 같습니다.

로그에서 다음과 같은 내용을 확인할 수 있습니다:

[Extension Host] [Retry] Updating state with retryStatus:라는 로그가 있어 retryStatus가 업데이트되고 있는 것 같습니다.
에러 타입은 '할당량 초과'로 표시되고 있습니다.
재시도 지연 시간은 59000ms(59초)로 설정되어 있습니다.
재시도 횟수는 2회로 표시되고 있습니다.
그러나 웹뷰 UI에 이러한 정보가 표시되지 않는 것 같습니다. 이 문제를 해결하기 위해 다음 부분을 확인해야 합니다:

ExtensionStateContext에서 retryStatus가 제대로 업데이트되고 있는지 확인
ChatView.tsx에서 retryStatus를 제대로 구독하고 있는지 확인
RetryStatusContainer 컴포넌트가 제대로 렌더링되고 있는지 확인
먼저 webview-ui/src/context/ExtensionStateContext.tsx 파일을 확인해보겠습니다.

## 현재 상태 및 다음 단계 (2025-04-15 업데이트)

오늘 작업 결과:
1. `src/core/storage/state-keys.ts` 파일에 `"retryStatus"` 키를 `GlobalStateKey` 타입에 추가했습니다.
2. `src/core/controller/index.ts` 파일에 `RetryStatusMessage` 타입을 import 구문에 추가했습니다.
3. `getStateToPostToWebview` 함수에 `retryStatus` 상수를 선언하고 `return` 객체에 추가했습니다.


** 추가 수정 예정 내역:**
 - 아래의 일일 할당량 모두 사용시 메시지 처리 필요
 [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:streamGenerateContent?alt=sse: [429 Too Many Requests] You exceeded your current quota. Please migrate to Gemini 2.5 Pro Preview (models/gemini-2.5-pro-preview-03-25) for higher quota limits. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. [{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_requests_per_model_per_day","quotaId":"GenerateRequestsPerDayPerProjectPerModel"}]},{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Learn more about Gemini API quotas","url":"https://ai.google.dev/gemini-api/docs/rate-limits"}]}]

- 오늘의 구글 무료 할당량을 모두 사용하였습니다. 다른 모델로 변경하거나 유료 결제를 진행 바랍니다. 라는 메시지 출력하고 종료시켜야함
