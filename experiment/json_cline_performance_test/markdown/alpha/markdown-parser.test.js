// markdown-parser.test.js
// 마크다운 변환 로직에 대한 테스트 코드

// 테스트 함수 정의
function runTest(testName, testFunction) {
  try {
    testFunction();
    console.log(`✅ 테스트 성공: ${testName}`);
    return true;
  } catch (error) {
    console.error(`❌ 테스트 실패: ${testName}`);
    console.error(`   오류 메시지: ${error.message}`);
    return false;
  }
}

// 어서션 함수 정의
function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `예상값: ${expected}, 실제값: ${actual}`);
  }
}

// 마크다운 파서 테스트 실행
function runAllTests() {
  console.log("마크다운 파서 테스트 시작...");
  
  let passedTests = 0;
  let totalTests = 0;
  
  // 헤더 변환 테스트
  totalTests++;
  if (runTest("헤더 변환 테스트", function() {
    assertEquals(markdownToHtml("# 제목 1").trim(), "<h1>제목 1</h1>");
    assertEquals(markdownToHtml("## 제목 2").trim(), "<h2>제목 2</h2>");
    assertEquals(markdownToHtml("###### 제목 6").trim(), "<h6>제목 6</h6>");
  })) passedTests++;
  
  // 강조 변환 테스트
  totalTests++;
  if (runTest("강조 변환 테스트", function() {
    assertEquals(markdownToHtml("*이탤릭체*").trim(), "<em>이탤릭체</em>");
    assertEquals(markdownToHtml("_이탤릭체_").trim(), "<em>이탤릭체</em>");
    assertEquals(markdownToHtml("**볼드체**").trim(), "<strong>볼드체</strong>");
    assertEquals(markdownToHtml("__볼드체__").trim(), "<strong>볼드체</strong>");
    assertEquals(markdownToHtml("~~취소선~~").trim(), "<del>취소선</del>");
  })) passedTests++;
  
  // 목록 변환 테스트
  totalTests++;
  if (runTest("목록 변환 테스트", function() {
    const ulMarkdown = "- 항목 1\n- 항목 2\n- 항목 3";
    const ulExpected = "<ul><li>항목 1</li><li>항목 2</li><li>항목 3</li></ul>";
    assertEquals(markdownToHtml(ulMarkdown).trim().replace(/\s+/g, ''), ulExpected.replace(/\s+/g, ''));
    
    const olMarkdown = "1. 항목 1\n2. 항목 2\n3. 항목 3";
    const olExpected = "<ol><li>항목 1</li><li>항목 2</li><li>항목 3</li></ol>";
    assertEquals(markdownToHtml(olMarkdown).trim().replace(/\s+/g, ''), olExpected.replace(/\s+/g, ''));
  })) passedTests++;
  
  // 링크 및 이미지 변환 테스트
  totalTests++;
  if (runTest("링크 및 이미지 변환 테스트", function() {
    assertEquals(markdownToHtml("[링크](https://example.com)").trim(), 
                '<a href="https://example.com">링크</a>');
    assertEquals(markdownToHtml("![대체 텍스트](image.jpg)").trim(), 
                '<img src="image.jpg" alt="대체 텍스트">');
  })) passedTests++;
  
  // 인용구 및 코드 변환 테스트
  totalTests++;
  if (runTest("인용구 및 코드 변환 테스트", function() {
    assertEquals(markdownToHtml("> 인용구").trim(), "<blockquote>인용구</blockquote>");
    assertEquals(markdownToHtml("`인라인 코드`").trim(), "<code>인라인 코드</code>");
    
    const codeBlockMd = "```\n코드 블록\n```";
    const codeBlockHtml = "<pre><code>코드 블록</code></pre>";
    assertEquals(markdownToHtml(codeBlockMd).trim().replace(/\s+/g, ''), 
                codeBlockHtml.replace(/\s+/g, ''));
  })) passedTests++;
  
  // 수평선 변환 테스트
  totalTests++;
  if (runTest("수평선 변환 테스트", function() {
    assertEquals(markdownToHtml("---").trim(), "<hr>");
    assertEquals(markdownToHtml("***").trim(), "<hr>");
    assertEquals(markdownToHtml("___").trim(), "<hr>");
  })) passedTests++;
  
  // 복합 요소 테스트
  totalTests++;
  if (runTest("복합 요소 테스트", function() {
    const markdown = "# 제목\n\n**굵은 텍스트**와 *기울임 텍스트*\n\n- 목록 1\n- 목록 2";
    const expected = "<h1>제목</h1><p><strong>굵은 텍스트</strong>와 <em>기울임 텍스트</em></p><ul><li>목록 1</li><li>목록 2</li></ul>";
    assertEquals(markdownToHtml(markdown).trim().replace(/\s+/g, ''), 
                expected.replace(/\s+/g, ''));
  })) passedTests++;
  
  // 결과 출력
  console.log(`테스트 완료: ${passedTests}/${totalTests} 통과`);
  
  return {
    passed: passedTests,
    total: totalTests
  };
}

// 테스트 실행 (markdownToHtml 함수가 정의된 후에 실행해야 함)
// runAllTests();
