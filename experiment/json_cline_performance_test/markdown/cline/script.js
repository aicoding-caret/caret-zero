// script.js
// 마크다운 뷰어 애플리케이션의 메인 스크립트

// DOM 요소 가져오기
const markdownInput = document.getElementById('markdown-input');
const htmlOutput = document.getElementById('html-output');

/**
 * 마크다운 입력을 HTML로 변환하여 출력 영역에 표시합니다.
 */
function renderMarkdown() {
  const markdown = markdownInput.value;
  const html = parseMarkdown(markdown);
  htmlOutput.innerHTML = html;
}

/**
 * 브라우저 환경에서 마크다운 파서를 사용할 수 있도록 합니다.
 * Node.js 모듈 시스템과 브라우저 환경의 차이를 처리합니다.
 */
function setupMarkdownParser() {
  // 브라우저 환경에서 모듈이 로드되지 않은 경우 처리
  if (typeof parseMarkdown !== 'function') {
    console.error('마크다운 파서를 찾을 수 없습니다.');
    htmlOutput.innerHTML = '<p class="error">마크다운 파서를 로드하는 중 오류가 발생했습니다.</p>';
    return false;
  }
  return true;
}

/**
 * 이벤트 리스너를 설정합니다.
 */
function setupEventListeners() {
  // 입력 영역의 내용이 변경될 때마다 마크다운 렌더링
  markdownInput.addEventListener('input', renderMarkdown);
}

/**
 * 애플리케이션을 초기화합니다.
 */
function initApp() {
  if (setupMarkdownParser()) {
    setupEventListeners();
    // 초기 마크다운 렌더링
    renderMarkdown();
    console.log('마크다운 뷰어가 초기화되었습니다.');
  }
}

// 페이지 로드 시 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', initApp);
