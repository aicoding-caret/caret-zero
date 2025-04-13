# Replace In File 도구 버그 수정 보고서

**작성자**: Luke & Alpha  
**날짜**: 2025-04-14  
**중요도**: 높음 (모든 Windows 사용자 영향)

## 요약

`replace_in_file` 도구에서 발견된 중요 버그를 수정했습니다. 이 버그는 특히 Windows 환경에서 멀티라인 블록을 처리할 때 파일 내용이 손상되거나 원본 텍스트가 중복 추가되는 문제를 발생시켰습니다. 모든 Windows 사용자(줄바꿈 형식이 CRLF인 환경)에서 발생 가능한 문제이며, 특히 복잡한 텍스트 대체 작업 시 심각한 데이터 손실을 초래할 수 있습니다.

## 버그 재현 방법

다음과 같은 조건에서 버그가 재현됩니다:

1. Windows 환경에서 Cline 사용 (줄바꿈 형식이 CRLF)
2. `replace_in_file` 도구를 사용하여 다중 줄 텍스트 블록 교체
3. AI가 제공한 SEARCH/REPLACE 블록 형식의 줄바꿈이 불일치하는 경우

버그 발생 시 다음과 같은 현상이 관찰됩니다:
- SEARCH 블록은 정확히 일치하는데도 파일 전체 내용이 REPLACE 내용으로 덮어쓰여짐
- 파일의 일부 내용이 중복해서 추가됨
- 파일 구조(들여쓰기, 줄바꿈)가 완전히 손상됨

## 원인 분석

두 가지 주요 원인이 확인되었습니다:

1. **프롬프트 불일치**:
   - `TOOL_DEFINITIONS.json`과 마크다운 프롬프트 간 SEARCH/REPLACE 블록 형식의 불일치
   - JSON: `<<<<<<< SEARCH [content]` (줄바꿈 없음)
   - 마크다운: `<<<<<<< SEARCH\n[content]` (줄바꿈 있음)

2. **코드 구현 문제**:
   - `diff.ts`의 `constructNewFileContent` 함수에서 줄바꿈 처리 로직 불완전
   - Windows(CRLF)와 Unix(LF) 줄바꿈 형식 처리 일관성 부족
   - 파일 종료 처리 시 이미 처리된 내용을 중복 추가하는 문제

## 수정 내용

### 1. 프롬프트 일관성 개선
- `TOOL_DEFINITIONS.json`과 `EDITING_FILES_GUIDE.json`에서 SEARCH/REPLACE 블록 형식을 명확하게 수정
- 줄바꿈 문자(`\n`)를 명시적으로 추가하여 AI 에이전트가 올바른 형식을 사용하도록 개선

### 2. 코드 개선
- `remainderProcessed` 플래그 추가하여 원본 내용 중복 추가 방지
- 원본 파일의 줄바꿈 형식(CRLF/LF) 탐지 및 보존 로직 강화
- REPLACE 블록 줄바꿈 처리 로직 개선으로 원본 파일 구조 유지
- 상세 로깅 추가로 디버깅 용이성 향상

### 핵심 코드 수정
```typescript
// 남은 내용 중복 처리 방지 플래그
let remainderProcessed = false

// 블록 처리 중 나머지 내용 추가 시 플래그 설정
if (remainingContent.length > 0) {
  result += remainingContent;
  remainderProcessed = true; // 남은 내용 처리 완료 표시
}

// 파일 종료 처리 시 중복 방지
if (isFinal && lastProcessedIndex < originalContent.length && !remainderProcessed) {
  // 아직 처리되지 않은 내용만 추가
  result += originalContent.slice(lastProcessedIndex);
} else if (isFinal && remainderProcessed) {
  // 이미 처리된 경우 로그만 남김
  log.debug(`[파일 종료 처리] 남은 내용이 이미 처리되어 중복 추가 하지 않음`);
}
```

## 결론 및 권장사항

이 버그는 모든 Windows 사용자에게 영향을 미치며, 특히 복잡한 파일 수정 작업에서 데이터 손실을 초래할 수 있는 중요 문제입니다. 수정 사항은 기존 로직에 최소한의 변경을 적용하여 안정성을 향상시키면서도 upstream 호환성을 유지했습니다.

**권장사항**:
1. 이 수정 사항을 최대한 빨리 upstream Cline에 PR로 제출하여 모든 사용자가 혜택을 받을 수 있도록 함
2. 추가 테스트를 통해 다양한 운영체제와 언어 환경에서 안정성 검증 필요
3. 사용자 문서에 `replace_in_file` 도구 사용 모범 사례 추가 고려

## 추가 개선 가능성

향후 다음과 같은 추가 개선을 고려할 수 있습니다:
1. 유니코드 및 다국어 텍스트 처리 강화
2. 자동 줄바꿈 정규화 및 호환성 개선
3. 대체 내용 검증 로직 추가
