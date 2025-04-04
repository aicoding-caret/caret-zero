// DOM 요소 참조
const markdownInput = document.getElementById('markdown-input');
const htmlOutput = document.getElementById('html-output');

// 예시 마크다운 텍스트
const defaultMarkdown = `# 마크다운 뷰어에 오신 것을 환영합니다!

이 애플리케이션은 **마크다운 문법**으로 작성된 텍스트를 *실시간*으로 HTML로 변환하여 보여줍니다.

## 마크다운이란?

마크다운은 텍스트 서식을 지정하는 간단한 마크업 언어입니다. 다음과 같은 기능을 제공합니다:

### 텍스트 강조

- *이탤릭체*: 텍스트를 *별표* 하나로 감싸기
- **볼드체**: 텍스트를 **별표 두 개**로 감싸기
- ***볼드 이탤릭***: 텍스트를 ***별표 세 개***로 감싸기

### 목록

순서 없는 목록:
- 항목 1
- 항목 2
- 항목 3

순서 있는 목록:
1. 첫 번째 항목
2. 두 번째 항목
3. 세 번째 항목

### 인용구

> 이것은 인용구입니다.
> 여러 줄에 걸쳐 작성할 수 있습니다.

### 코드

인라인 코드: \`console.log('Hello, World!');\`

코드 블록:
\`\`\`
function greet(name) {
  return 'Hello, ' + name + '!';
}
\`\`\`

### 링크

[구글로 이동](https://www.google.com)

### 수평선

---

이 텍스트 상자에 마크다운을 입력하고 결과를 오른쪽에서 확인하세요!`;

// 페이지 로드 시 기본 마크다운 텍스트 표시
window.addEventListener('DOMContentLoaded', () => {
    markdownInput.value = defaultMarkdown;
    updatePreview();
});

// 텍스트 입력 시마다 미리보기 업데이트
markdownInput.addEventListener('input', updatePreview);

/**
 * 입력된 마크다운 텍스트를 HTML로 변환하여 출력 영역에 표시
 */
function updatePreview() {
    try {
        // markdownParser.js에서 export한 parseMarkdown 함수 사용
        // (브라우저에서는 export/import가 아닌 전역 스코프로 로드됨)
        const html = parseMarkdown(markdownInput.value);
        htmlOutput.innerHTML = html;
    } catch (error) {
        console.error('마크다운 변환 중 오류 발생:', error);
        htmlOutput.innerHTML = `<p class="error">마크다운 변환 중 오류가 발생했습니다: ${error.message}</p>`;
    }
} 