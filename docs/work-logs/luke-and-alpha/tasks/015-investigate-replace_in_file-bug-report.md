# `replace_in_file` 도구 버그 조사 보고서

## 담당자
*   루크 (마스터)
*   알파 (AI)

## 조사 기간
2025-04-08

## 버그 개요
`replace_in_file` 도구가 특정 조건(특히 여러 줄로 구성된 복잡한 블록 삭제 시)에서 성공 메시지를 반환함에도 불구하고 실제 파일 내용을 수정하지 못하는 버그가 발생했습니다.

## 버그 원인 분석

### 1. 줄 바꿈 문자 처리 문제
다양한 운영 체제에서 줄 바꿈 문자가 다르게 처리됩니다(`\r\n` vs `\n`). 이로 인해 Windows 환경에서 작성된 파일을 Linux/macOS 환경에서 처리할 때, 또는 그 반대의 경우에 매치가 실패할 수 있습니다.

### 2. 매치 알고리즘 한계
복잡한 블록(특히 JSON 블록)을 매치하는 데 한계가 있었습니다. 특히 여러 줄로 구성된 복잡한 블록의 경우, 정확한 매치가 어려웠습니다.

### 3. 공백 문자 처리 문제
공백 문자(공백, 탭, 줄 바꿈 등)의 차이로 인해 매치가 실패할 수 있습니다. 특히 에디터의 자동 포맷팅 기능으로 인해 공백 문자가 변경될 수 있습니다.

## 해결 방법

### 1. 줄 바꿈 문자 정규화
`\r\n`을 `\n`으로 변환하여 다양한 운영 체제에서 일관된 처리를 보장합니다.

```javascript
const normalizedOriginalContent = originalContent.replace(/\r\n/g, "\n");
const normalizedDiffContent = diffContent.replace(/\r\n/g, "\n");
```

### 2. 정규화된 내용으로 정확한 매치 시도
정규화된 내용으로 정확한 매치를 시도하고, 원본 내용에서의 정확한 위치를 계산합니다.

```javascript
const exactIndex = normalizedOriginalContent.indexOf(searchContent);

if (exactIndex !== -1) {
  // 매치 성공
  result = 
    normalizedOriginalContent.substring(0, exactIndex) + 
    replaceContent + 
    normalizedOriginalContent.substring(exactIndex + searchContent.length);
}
```

### 3. 공백 문자 무시 매치 추가
모든 매치 시도가 실패한 경우, 공백 문자를 무시하고 매치를 시도합니다.

```javascript
// 공백 문자 무시 매치
const noWhitespaceOriginal = normalizedOriginalContent.replace(/\s+/g, "");
const noWhitespaceSearch = searchContent.replace(/\s+/g, "");

const noWhitespaceIndex = noWhitespaceOriginal.indexOf(noWhitespaceSearch);

if (noWhitespaceIndex !== -1) {
  // 공백 무시 매치 성공
  // 원본 내용에서 대략적인 위치 찾기
  // ...
}
```

## 테스트 및 검증

버그를 재현하고 해결책을 검증하기 위해 테스트 스크립트를 작성했습니다. 이 스크립트는 `test-files/replace_in_file_test.js` 파일에 저장되어 있습니다.

### 테스트 실행 방법
```
node test-files/replace_in_file_test.js
```

### 테스트 결과
테스트 결과, 해결책이 효과적으로 작동하는 것을 확인했습니다:

1. 줄 바꿈 문자 정규화가 성공적으로 수행되었습니다.
2. 정규화된 내용으로 정확한 매치가 성공했습니다.
3. JSON 블록이 성공적으로 삭제되었습니다.

## 결론

`replace_in_file` 도구의 버그는 줄 바꿈 문자 처리 문제, 매치 알고리즘 한계, 공백 문자 처리 문제로 인해 발생했습니다. 이를 해결하기 위해 줄 바꿈 문자 정규화, 정규화된 내용으로 정확한 매치 시도, 공백 문자 무시 매치 추가 등의 방법을 적용했습니다. 테스트 결과, 해결책이 효과적으로 작동하는 것을 확인했습니다.

## 향후 개선 사항

1. 더 강력한 매치 알고리즘 개발: 현재 알고리즘은 기본적인 문자열 매치에 의존하고 있습니다. 더 강력한 매치 알고리즘을 개발하여 더 복잡한 경우에도 정확한 매치가 가능하도록 개선할 수 있습니다.

2. 사용자 피드백 개선: 매치 실패 시 더 자세한 오류 메시지를 제공하여 사용자가 문제를 더 쉽게 해결할 수 있도록 개선할 수 있습니다.

3. 테스트 케이스 확장: 더 다양한 테스트 케이스를 추가하여 다양한 상황에서의 동작을 검증할 수 있습니다.
