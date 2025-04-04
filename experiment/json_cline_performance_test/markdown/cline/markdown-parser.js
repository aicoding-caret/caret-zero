// markdown-parser.js
// 마크다운 텍스트를 HTML로 변환하는 파서

/**
 * 마크다운 텍스트를 HTML로 변환합니다.
 * @param {string} markdown - 변환할 마크다운 텍스트
 * @return {string} 변환된 HTML
 */

function parseMarkdown(markdown) {
  let html = markdown;
  
  // 줄바꿈 정규화
  html = html.replace(/\r\n/g, '\n');
  
  // 단락 처리 (빈 줄로 구분된 텍스트 블록)
  const blocks = html.split(/\n\n+/);
  html = blocks.map(block => processBlock(block)).join('');
  
  return html;
}

/**
 * 마크다운 블록을 처리합니다.
 * @param {string} block - 처리할 마크다운 블록
 * @return {string} 변환된 HTML
 */
function processBlock(block) {
  // 앞뒤 공백 제거
  block = block.trim();
  
  // 빈 블록 처리
  if (block === '') return '';
  
  // 수평선 처리
  if (block === '---' || block === '***') {
    return '<hr>';
  }
  
  // 제목 처리
  const headingMatch = block.match(/^(#{1,6})\s+(.+)$/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const content = headingMatch[2].trim();
    return `<h${level}>${content}</h${level}>`;
  }
  
  // 인용문 처리
  if (block.startsWith('> ')) {
    const content = block.substring(2).trim();
    return `<blockquote>${content}</blockquote>`;
  }
  
  // 코드 블록 처리
  if (block.startsWith('```') && block.endsWith('```')) {
    const content = block.substring(3, block.length - 3).trim();
    return `<pre><code>${content}</code></pre>`;
  }
  
  // 목록 처리
  if (block.match(/^[-*]\s+.+(\n[-*]\s+.+)*$/)) {
    // 순서 없는 목록
    const items = block.split('\n').map(item => {
      return `<li>${item.replace(/^[-*]\s+/, '')}</li>`;
    }).join('');
    return `<ul>${items}</ul>`;
  }
  
  if (block.match(/^\d+\.\s+.+(\n\d+\.\s+.+)*$/)) {
    // 순서 있는 목록
    const items = block.split('\n').map(item => {
      return `<li>${item.replace(/^\d+\.\s+/, '')}</li>`;
    }).join('');
    return `<ol>${items}</ol>`;
  }
  
  // 일반 텍스트 처리 (인라인 요소 처리 포함)
  return `<p>${processInline(block)}</p>`;
}

/**
 * 인라인 마크다운 요소를 처리합니다.
 * @param {string} text - 처리할 텍스트
 * @return {string} 변환된 HTML
 */
function processInline(text) {
  // 이미지 처리 (링크보다 먼저 처리해야 함)
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');
  
  // 링크 처리
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  
  // 굵은 기울임체 처리 (굵은 텍스트와 기울임체보다 먼저 처리해야 함)
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  
  // 굵은 텍스트 처리
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 기울임체 처리
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // 인라인 코드 처리
  text = text.replace(/`(.*?)`/g, '<code>$1</code>');
  
  return text;
}

// 브라우저 환경에서 사용할 수 있도록 전역 함수로 정의
if (typeof window !== 'undefined') {
  window.parseMarkdown = parseMarkdown;
}

// Node.js 환경에서 테스트를 위해 조건부로 export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseMarkdown };
}
