// markdown-parser.test.js
// 마크다운 변환 로직에 대한 테스트 코드

// 테스트 함수 정의
function runTest(testName, testFunction) {
  try {
    testFunction();
    console.log(`✅ 테스트 통과: ${testName}`);
    return true;
  } catch (error) {
    console.error(`❌ 테스트 실패: ${testName}`);
    console.error(`   원인: ${error.message}`);
    return false;
  }
}

// 어서션 함수 정의
function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `기대값: ${expected}, 실제값: ${actual}`);
  }
}

// 마크다운 파서 가져오기 (아직 구현되지 않음)
// 테스트 코드를 먼저 작성하고, 이후에 실제 구현을 진행합니다 (TDD 방식)
const { parseMarkdown } = require('./markdown-parser.js');

// 테스트 실행 함수
function runAllTests() {
  let passedTests = 0;
  let totalTests = 0;
  
  // 제목 변환 테스트
  totalTests++;
  if (runTest('제목 h1 변환 테스트', () => {
    const markdown = '# 제목 1';
    const expected = '<h1>제목 1</h1>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('제목 h2 변환 테스트', () => {
    const markdown = '## 제목 2';
    const expected = '<h2>제목 2</h2>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('제목 h3 변환 테스트', () => {
    const markdown = '### 제목 3';
    const expected = '<h3>제목 3</h3>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('제목 h6 변환 테스트', () => {
    const markdown = '###### 제목 6';
    const expected = '<h6>제목 6</h6>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('제목 앞 공백 처리 테스트', () => {
    const markdown = ' # 제목 공백';
    const expected = '<h1>제목 공백</h1>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  // 텍스트 강조 테스트
  totalTests++;
  if (runTest('기울임체 변환 테스트', () => {
    const markdown = '*기울임*';
    const expected = '<p><em>기울임</em></p>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('굵은 텍스트 변환 테스트', () => {
    const markdown = '**굵게**';
    const expected = '<p><strong>굵게</strong></p>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('굵은 기울임체 변환 테스트', () => {
    const markdown = '***굵은 기울임***';
    const expected = '<p><strong><em>굵은 기울임</em></strong></p>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  // 목록 변환 테스트
  totalTests++;
  if (runTest('순서 없는 목록 변환 테스트 (-)', () => {
    const markdown = '- 항목 1\n- 항목 2';
    const expected = '<ul><li>항목 1</li><li>항목 2</li></ul>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('순서 없는 목록 변환 테스트 (*)', () => {
    const markdown = '* 항목 1\n* 항목 2';
    const expected = '<ul><li>항목 1</li><li>항목 2</li></ul>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('순서 있는 목록 변환 테스트', () => {
    const markdown = '1. 항목 1\n2. 항목 2';
    const expected = '<ol><li>항목 1</li><li>항목 2</li></ol>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  // 링크 및 이미지 테스트
  totalTests++;
  if (runTest('링크 변환 테스트', () => {
    const markdown = '[링크 텍스트](https://example.com)';
    const expected = '<p><a href="https://example.com">링크 텍스트</a></p>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('이미지 변환 테스트', () => {
    const markdown = '![대체 텍스트](image.jpg)';
    const expected = '<p><img src="image.jpg" alt="대체 텍스트"></p>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  // 기타 요소 테스트
  totalTests++;
  if (runTest('인용문 변환 테스트', () => {
    const markdown = '> 인용문';
    const expected = '<blockquote>인용문</blockquote>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('인라인 코드 변환 테스트', () => {
    const markdown = '`인라인 코드`';
    const expected = '<p><code>인라인 코드</code></p>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('코드 블록 변환 테스트', () => {
    const markdown = '```\n코드 블록\n```';
    const expected = '<pre><code>코드 블록</code></pre>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('수평선 변환 테스트 (---)', () => {
    const markdown = '---';
    const expected = '<hr>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  totalTests++;
  if (runTest('수평선 변환 테스트 (***)', () => {
    const markdown = '***';
    const expected = '<hr>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  // 복합 테스트
  totalTests++;
  if (runTest('복합 마크다운 변환 테스트', () => {
    const markdown = '# 제목\n\n**굵은 텍스트**와 *기울임* 텍스트\n\n- 목록 1\n- 목록 2\n\n> 인용문\n\n`코드`';
    const expected = '<h1>제목</h1><p><strong>굵은 텍스트</strong>와 <em>기울임</em> 텍스트</p><ul><li>목록 1</li><li>목록 2</li></ul><blockquote>인용문</blockquote><p><code>코드</code></p>';
    const actual = parseMarkdown(markdown);
    assertEquals(actual, expected);
  })) passedTests++;
  
  // 결과 출력
  console.log(`\n테스트 결과: ${passedTests}/${totalTests} 통과`);
  
  return { passedTests, totalTests };
}

// 테스트 실행 (실제 구현이 완료된 후 주석 해제)
// runAllTests();

// Node.js 환경에서 직접 실행 시 테스트 실행
if (require.main === module) {
  console.log('마크다운 파서 테스트 실행 중...');
  runAllTests();
}

module.exports = { runAllTests };
