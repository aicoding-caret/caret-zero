// script.js
// 마크다운 뷰어 애플리케이션의 동작 로직

document.addEventListener('DOMContentLoaded', function() {
  // 필요한 DOM 요소 가져오기
  const markdownInput = document.getElementById('markdown-input');
  const htmlOutput = document.getElementById('html-output');
  
  // 기본 마크다운 샘플 텍스트
  const defaultMarkdown = `# 마크다운 뷰어에 오신 것을 환영합니다!

이 애플리케이션은 마크다운 텍스트를 실시간으로 HTML로 변환해줍니다.

## 마크다운 문법 예시

### 텍스트 강조

*이탤릭체*로 강조하거나 **볼드체**로 강조할 수 있습니다.
_이렇게_나 __이렇게__도 가능합니다. ~~취소선~~도 지원합니다.

### 목록

순서 없는 목록:
- 항목 1
- 항목 2
- 항목 3

순서 있는 목록:
1. 첫 번째 항목
2. 두 번째 항목
3. 세 번째 항목

### 링크와 이미지

[링크 텍스트](https://example.com)

![이미지 설명](https://via.placeholder.com/150)

### 인용구

> 인용구는 이렇게 표시됩니다.
> 여러 줄도 가능합니다.

### 코드

인라인 코드는 \`코드\`처럼 표시됩니다.

코드 블록:
\`\`\`
function hello() {
  console.log("안녕하세요!");
}
\`\`\`

### 수평선

---

위 예시들을 자유롭게 수정하여 마크다운 변환을 테스트해보세요!`;
  
  // 기본 마크다운 샘플 텍스트 설정
  markdownInput.value = defaultMarkdown;
  
  // 초기 변환 실행
  updatePreview();
  
  // 입력 영역의 내용이 변경될 때마다 변환 실행
  markdownInput.addEventListener('input', updatePreview);
  
  // 마크다운을 HTML로 변환하고 출력 영역에 표시하는 함수
  function updatePreview() {
    const markdown = markdownInput.value;
    const html = markdownToHtml(markdown);
    htmlOutput.innerHTML = html;
  }
  
  // 텍스트 영역 크기 자동 조정 (선택 사항)
  markdownInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
});
