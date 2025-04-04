/**
 * 간단한 테스트 러너 (Jest 없이 테스트하기 위한 파일)
 */

// markdownParser.js 파일에서 함수 가져오기
const { parseMarkdown } = require('./markdownParser');

// 테스트할 케이스 목록
const testCases = [
  {
    name: 'H1 변환 테스트',
    input: '# 제목1',
    expected: '<h1>제목1</h1>'
  },
  {
    name: '이탤릭 변환 테스트',
    input: '*이탤릭*',
    expected: '<em>이탤릭</em>'
  },
  {
    name: '볼드 변환 테스트',
    input: '**볼드**',
    expected: '<strong>볼드</strong>'
  },
  {
    name: '순서 없는 목록 변환 테스트',
    input: '- 항목1\n- 항목2',
    expected: '<ul><li>항목1</li><li>항목2</li></ul>'
  },
  {
    name: '인용구 변환 테스트',
    input: '> 인용문',
    expected: '<blockquote>인용문</blockquote>'
  },
  {
    name: '코드 블록 변환 테스트',
    input: '```\n코드 블록\n```',
    expected: '<pre><code>코드 블록\n</code></pre>'
  }
];

// 테스트 실행 함수
function runTests() {
  console.log('마크다운 파서 기본 테스트 시작...');
  console.log('----------------------------------------');
  
  let passed = 0;
  let failed = 0;
  
  // 각 테스트 케이스 실행
  testCases.forEach(test => {
    // HTML 문자열을 정규화 (공백 제거)
    const normalizeHTML = (html) => html.replace(/\s+/g, ' ').trim();
    
    const result = parseMarkdown(test.input);
    const normalizedResult = normalizeHTML(result);
    const normalizedExpected = normalizeHTML(test.expected);
    
    if (normalizedResult === normalizedExpected) {
      console.log(`✅ ${test.name} 통과`);
      passed++;
    } else {
      console.log(`❌ ${test.name} 실패`);
      console.log(`  예상: ${normalizedExpected}`);
      console.log(`  결과: ${normalizedResult}`);
      failed++;
    }
  });
  
  console.log('----------------------------------------');
  console.log(`테스트 결과: ${passed}개 통과, ${failed}개 실패`);
  console.log('마크다운 파서 테스트 완료');
}

// 테스트 실행
runTests(); 