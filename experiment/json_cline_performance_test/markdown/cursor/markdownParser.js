/**
 * markdownParser.js
 * 마크다운 텍스트를 HTML로 변환하는 파서
 */

/**
 * 마크다운 텍스트를 HTML로 변환하는 메인 함수
 * @param {string} markdown - 변환할 마크다운 텍스트
 * @returns {string} - 변환된 HTML 텍스트
 */
function parseMarkdown(markdown) {
  // 줄 바꿈 기준으로 텍스트 분리
  let lines = markdown.split('\n');
  let html = '';
  let inList = false;
  let listType = '';
  let inCodeBlock = false;
  let tempCodeBlock = '';

  // 각 줄을 순회하며 처리
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // 코드 블록 처리
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        tempCodeBlock = '';
      } else {
        html += `<pre><code>${tempCodeBlock}</code></pre>`;
        inCodeBlock = false;
      }
      continue;
    }

    if (inCodeBlock) {
      tempCodeBlock += line + '\n';
      continue;
    }

    // 빈 줄 처리
    if (line === '') {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      continue;
    }

    // 제목 처리 (h1 ~ h6)
    if (line.startsWith('#')) {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }

      const level = line.match(/^#+/)[0].length;
      if (level >= 1 && level <= 6) {
        const title = line.substring(level).trim();
        html += `<h${level}>${title}</h${level}>`;
        continue;
      }
    }

    // 수평선 처리
    if (line.match(/^(\-{3,}|\*{3,}|_{3,})$/)) {
      html += '<hr>';
      continue;
    }

    // 목록 처리
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const item = line.substring(2);
      
      if (!inList || listType !== 'ul') {
        if (inList) {
          html += listType === 'ul' ? '</ul>' : '</ol>';
        }
        html += '<ul>';
        listType = 'ul';
        inList = true;
      }
      
      html += `<li>${parseLine(item)}</li>`;
      continue;
    }

    // 순서 있는 목록 처리
    const orderedListMatch = line.match(/^(\d+)\. (.+)$/);
    if (orderedListMatch) {
      const item = orderedListMatch[2];
      
      if (!inList || listType !== 'ol') {
        if (inList) {
          html += listType === 'ul' ? '</ul>' : '</ol>';
        }
        html += '<ol>';
        listType = 'ol';
        inList = true;
      }
      
      html += `<li>${parseLine(item)}</li>`;
      continue;
    }

    // 인용구 처리
    if (line.startsWith('> ')) {
      // 인용구가 여러 줄인 경우 합치기
      let quote = line.substring(2);
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith('> ')) {
        quote += '\n' + lines[j].trim().substring(2);
        i = j;
        j++;
      }
      html += `<blockquote>${quote}</blockquote>`;
      continue;
    }

    // 위의 어떤 조건도 만족하지 않는 경우 일반 텍스트로 처리
    if (inList) {
      html += listType === 'ul' ? '</ul>' : '</ol>';
      inList = false;
    }

    html += `<p>${parseLine(line)}</p>`;
  }

  // 마지막에 열린 목록 태그가 있으면 닫기
  if (inList) {
    html += listType === 'ul' ? '</ul>' : '</ol>';
  }

  return html;
}

/**
 * 인라인 마크다운 요소를 HTML로 변환하는 함수
 * @param {string} line - 변환할 한 줄의 텍스트
 * @returns {string} - 인라인 요소가 변환된 HTML
 */
function parseLine(line) {
  // 볼드 이탤릭 (***텍스트***)
  line = line.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  
  // 볼드 (**텍스트**)
  line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // 이탤릭 (*텍스트*)
  line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // 인라인 코드 (`코드`)
  line = line.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // 링크 ([텍스트](URL))
  line = line.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  
  return line;
}

// Node.js 환경에서 export, 브라우저 환경에서는 전역 객체로 등록
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseMarkdown };
} 