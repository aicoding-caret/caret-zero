const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// 줄바꿈 타입 검출 및 변환 도구
const EOL = {
  LF: '\n',        // Unix/Linux/macOS
  CRLF: '\r\n',    // Windows
  CR: '\r'         // Old Mac
};

// 테스트 디렉토리 및 파일 설정
const TEST_DIR = path.join(__dirname, 'temp-eol-test');
const TEST_CASES = {
  WINDOWS_EOL: path.join(TEST_DIR, 'windows-eol.txt'),
  UNIX_EOL: path.join(TEST_DIR, 'unix-eol.txt'),
  MIXED_EOL: path.join(TEST_DIR, 'mixed-eol.txt')
};

// 줄바꿈 타입 검출 함수
function detectEOL(text) {
  if (text.includes(EOL.CRLF)) return EOL.CRLF;
  if (text.includes(EOL.LF)) return EOL.LF;
  if (text.includes(EOL.CR)) return EOL.CR;
  return EOL.LF; // 기본값
}

// 텍스트 정규화 함수 (모든 줄바꿈을 LF로 변환)
function normalizeToLF(text) {
  return text.replace(/\r\n|\r/g, EOL.LF);
}

// 해시 생성 함수
function generateContentHash(content) {
  return crypto.createHash('md5').update(content || '').digest('hex').substring(0, 8);
}

// 테스트 파일 생성 함수
async function createTestFiles() {
  try {
    // 테스트 디렉토리 생성
    await fs.mkdir(TEST_DIR, { recursive: true });
    
    // Windows EOL 파일 생성 (CRLF)
    const windowsContent = '첫 번째 줄입니다.\r\n두 번째 줄은 조금 더 길어요.\r\n세 번째 줄입니다.\r\n마지막 네 번째 줄.';
    await fs.writeFile(TEST_CASES.WINDOWS_EOL, windowsContent, { encoding: 'utf8' });
    
    // Unix EOL 파일 생성 (LF)
    const unixContent = '첫 번째 줄입니다.\n두 번째 줄은 조금 더 길어요.\n세 번째 줄입니다.\n마지막 네 번째 줄.';
    await fs.writeFile(TEST_CASES.UNIX_EOL, unixContent, { encoding: 'utf8' });
    
    // 혼합 EOL 파일 생성 (mixed)
    const mixedContent = '첫 번째 줄입니다.\r\n두 번째 줄은 조금 더 길어요.\n세 번째 줄입니다.\r\n마지막 네 번째 줄.';
    await fs.writeFile(TEST_CASES.MIXED_EOL, mixedContent, { encoding: 'utf8' });
    
    console.log('테스트 파일 생성 완료!');
    return true;
  } catch (err) {
    console.error('테스트 파일 생성 실패:', err);
    return false;
  }
}

// 텍스트 변환 후 원래 EOL 유지 테스트
async function testEOLPreservation() {
  console.log('\n===== 줄바꿈 형식 보존 테스트 =====');
  
  const testResults = {};
  
  for (const [caseType, filePath] of Object.entries(TEST_CASES)) {
    try {
      console.log(`\n[테스트] ${caseType} 파일 테스트 시작...`);
      
      // 원본 파일 읽기
      const originalContent = await fs.readFile(filePath, 'utf8');
      const originalEOL = detectEOL(originalContent);
      const originalHash = generateContentHash(originalContent);
      
      console.log(`- 원본 파일 정보:`, {
        eolType: originalEOL === EOL.CRLF ? 'Windows (CRLF)' : 
                (originalEOL === EOL.LF ? 'Unix (LF)' : 'Mac (CR)'),
        contentLength: originalContent.length,
        hash: originalHash,
        containsCRLF: originalContent.includes('\r\n'),
        containsLF: originalContent.includes('\n') && !originalContent.includes('\r\n')
      });
      
      // 수정할 내용 (두 번째 줄을 수정)
      const searchContent = originalEOL === EOL.CRLF 
        ? '두 번째 줄은 조금 더 길어요.'
        : '두 번째 줄은 조금 더 길어요.';
      
      const replaceContent = '두 번째 줄을 수정했어요. 더 길게 만들었습니다.';
      
      // 내용 정규화 (모든 줄바꿈을 LF로)
      const normalizedContent = normalizeToLF(originalContent);
      
      // 바꿀 내용 찾기
      const searchIndex = normalizedContent.indexOf(searchContent);
      if (searchIndex === -1) {
        console.error(`- 찾을 내용이 파일에 없습니다: ${searchContent}`);
        testResults[caseType] = { passed: false, error: '찾을 내용 없음' };
        continue;
      }
      
      // 수정할 부분 추출
      const beforePart = normalizedContent.substring(0, searchIndex);
      const afterPart = normalizedContent.substring(searchIndex + searchContent.length);
      
      // LF로 정규화된 상태로 내용 바꾸기
      let modifiedContent = beforePart + replaceContent + afterPart;
      
      // 원래 EOL 형식으로 다시 변환 (중요!)
      let finalContent;
      if (originalEOL === EOL.CRLF) {
        finalContent = modifiedContent.replace(/\n/g, '\r\n');
      } else {
        finalContent = modifiedContent;
      }
      
      // 파일로 저장
      await fs.writeFile(filePath, finalContent, 'utf8');
      
      // 결과 확인
      const savedContent = await fs.readFile(filePath, 'utf8');
      const savedEOL = detectEOL(savedContent);
      const savedHash = generateContentHash(savedContent);
      
      // 줄바꿈 형식이 보존되었는지 확인
      const eolPreserved = originalEOL === savedEOL;
      // 내용이 제대로 변경되었는지 확인 (해시가 달라야 함)
      const contentChanged = originalHash !== savedHash;
      // 줄의 개수가 동일한지 확인
      const originalLineCount = originalContent.split(/\r\n|\n/).length;
      const savedLineCount = savedContent.split(/\r\n|\n/).length;
      const lineCountPreserved = originalLineCount === savedLineCount;
      
      // 결과 출력
      console.log(`- 변경된 파일 정보:`, {
        eolType: savedEOL === EOL.CRLF ? 'Windows (CRLF)' : 
                (savedEOL === EOL.LF ? 'Unix (LF)' : 'Mac (CR)'),
        contentLength: savedContent.length,
        hash: savedHash,
        containsCRLF: savedContent.includes('\r\n'),
        containsLF: savedContent.includes('\n') && !savedContent.includes('\r\n')
      });
      
      const testPassed = eolPreserved && contentChanged && lineCountPreserved;
      console.log(`- 테스트 결과:`, {
        eolPreserved: eolPreserved ? '✅ 성공' : '❌ 실패',
        contentChanged: contentChanged ? '✅ 성공' : '❌ 실패',
        lineCountPreserved: lineCountPreserved ? '✅ 성공' : '❌ 실패',
        overallResult: testPassed ? '✅ 테스트 통과' : '❌ 테스트 실패'
      });
      
      testResults[caseType] = { passed: testPassed };
      
    } catch (err) {
      console.error(`- 테스트 실패 (${caseType}):`, err);
      testResults[caseType] = { passed: false, error: err.message };
    }
  }
  
  // 테스트 결과 요약
  console.log('\n===== 테스트 결과 요약 =====');
  let allPassed = true;
  
  for (const [caseType, result] of Object.entries(testResults)) {
    console.log(`${caseType}: ${result.passed ? '✅ 통과' : '❌ 실패' + (result.error ? ` (${result.error})` : '')}`);
    if (!result.passed) allPassed = false;
  }
  
  console.log(`\n전체 테스트 결과: ${allPassed ? '✅ 모든 테스트 통과' : '❌ 일부 테스트 실패'}`);
  return allPassed;
}

// 실제 Cline replace_in_file 도구 테스트 (VS Code 확장 프로그램 방식 모방)
async function testRealToolEmulation() {
  console.log('\n===== Cline replace_in_file 도구 에뮬레이션 테스트 =====');
  
  try {
    const testFilePath = path.join(TEST_DIR, 'emulation-test.txt');
    
    // Windows EOL로 파일 생성
    const originalContent = '첫 번째 줄입니다.\r\n두 번째 줄은 조금 더 길어요.\r\n세 번째 줄입니다.\r\n마지막 네 번째 줄.';
    await fs.writeFile(testFilePath, originalContent, 'utf8');
    
    // 원본 데이터 분석
    const originalEOL = detectEOL(originalContent);
    const originalHash = generateContentHash(originalContent);
    
    console.log('- 원본 파일 정보:', {
      eolType: originalEOL === EOL.CRLF ? 'Windows (CRLF)' : 'Unix (LF)',
      contentLength: originalContent.length,
      hash: originalHash,
      sample: originalContent.substring(0, 20)
    });
    
    // diff 내용 생성 (1번째 대체 작업 - 첫 줄을 변경)
    const diffContent1 = '```diff\n-첫 번째 줄입니다.\n+첫 번째 줄을 수정했어요.\n```';
    
    // diff 내용 생성 (2번째 대체 작업 - 세번째 줄을 변경)
    const diffContent2 = '```diff\n-세 번째 줄입니다.\n+세 번째 줄도 완전히 수정했어요. 더 긴 문장입니다.\n```';
    
    // 최종 diff 내용 (두 부분을 모두 변경)
    const finalDiffContent = diffContent1 + '\n\n' + diffContent2;
    
    // 마치 diff.ts의 constructNewFileContent 함수처럼 중간 단계 구현
    console.log('- 변환 과정 에뮬레이션 시작...');
    
    // 1. 원본 내용 정규화
    const normalizedOriginalContent = normalizeToLF(originalContent);
    
    // 2. 첫 번째 패턴 교체
    let result = normalizedOriginalContent.replace('첫 번째 줄입니다.', '첫 번째 줄을 수정했어요.');
    
    // 3. 두 번째 패턴 교체
    result = result.replace('세 번째 줄입니다.', '세 번째 줄도 완전히 수정했어요. 더 긴 문장입니다.');
    
    // 4. 중요: 원래 EOL 형식으로 다시 변환 (이 부분이 버그 수정의 핵심)
    let finalResult;
    if (originalEOL === EOL.CRLF) {
      finalResult = result.replace(/\n/g, '\r\n');
    } else {
      finalResult = result;
    }
    
    // 파일로 저장
    await fs.writeFile(testFilePath, finalResult, 'utf8');
    
    // 결과 확인
    const savedContent = await fs.readFile(testFilePath, 'utf8');
    const savedEOL = detectEOL(savedContent);
    const savedHash = generateContentHash(savedContent);
    
    // 줄바꿈 형식이 보존되었는지 확인
    const eolPreserved = originalEOL === savedEOL;
    // 내용이 제대로 변경되었는지 확인 (해시가 달라야 함)
    const contentChanged = originalHash !== savedHash;
    
    console.log('- 변경된 파일 정보:', {
      eolType: savedEOL === EOL.CRLF ? 'Windows (CRLF)' : 'Unix (LF)',
      contentLength: savedContent.length,
      hash: savedHash,
      sample: savedContent.substring(0, 20),
      containsCRLF: savedContent.includes('\r\n')
    });
    
    const testPassed = eolPreserved && contentChanged;
    console.log('- 에뮬레이션 테스트 결과:', {
      eolPreserved: eolPreserved ? '✅ 성공' : '❌ 실패',
      contentChanged: contentChanged ? '✅ 성공' : '❌ 실패',
      overallResult: testPassed ? '✅ 테스트 통과' : '❌ 테스트 실패'
    });
    
    return testPassed;
    
  } catch (err) {
    console.error('- 에뮬레이션 테스트 실패:', err);
    return false;
  }
}

// 실제 diff.ts의 마지막 합치기 과정 시뮬레이션
async function testOriginalContentAppending() {
  console.log('\n===== 원본 내용 합치기 테스트 =====');
  
  try {
    const testFilePath = path.join(TEST_DIR, 'append-test.txt');
    
    // Windows EOL로 파일 생성
    const originalContent = '첫 번째 줄입니다.\r\n두 번째 줄은 조금 더 길어요.\r\n세 번째 줄입니다.\r\n마지막 네 번째 줄.';
    await fs.writeFile(testFilePath, originalContent, 'utf8');
    
    // 원본 데이터 분석
    const originalEOL = detectEOL(originalContent);
    const originalHash = generateContentHash(originalContent);
    
    console.log('- 원본 파일 정보:', {
      eolType: originalEOL === EOL.CRLF ? 'Windows (CRLF)' : 'Unix (LF)',
      contentLength: originalContent.length,
      hash: originalHash,
      sample: originalContent.substring(0, 20)
    });
    
    // 1. 원본 내용 정규화
    const normalizedOriginalContent = normalizeToLF(originalContent);
    
    // 2. 첫번째 줄만 변경하는 시나리오 (나머지는 원본 유지)
    const lastProcessedIndex = normalizedOriginalContent.indexOf('\n') + 1; // 첫 줄 다음부터
    
    // 3. 변경된 첫번째 줄
    let result = '첫 번째 줄을 수정했어요.\n';
    
    // 4-A. 기존 방식: 나머지 원본 내용 추가 (정규화된 상태로 - 버그가 있는 방식)
    const buggyResult = result + normalizedOriginalContent.slice(lastProcessedIndex);
    
    // 4-B. 수정된 방식: 나머지 원본 내용 추가 (원래 EOL 유지 - 수정된 방식)
    // normalizedIndex를 원래 파일에서의 인덱스로 변환 (근사값)
    const approximateOriginalIndex = originalContent.indexOf('\r\n') + 2;
    console.log('실제 첫 줄 이후 내용:', JSON.stringify(originalContent.slice(approximateOriginalIndex).substring(0, 20)));
    
    // 이게 진짜 문제인지 확인: 그냥 result 변수에 LF가 있나?
    console.log('result 변수 줄바꿈 확인:', JSON.stringify(result.substring(0, 20)));
    
    // 원본 추가 전 변환 시도
    const resultWithCorrectEOL = result.replace(/\n/g, '\r\n');
    console.log('변환된 result:', JSON.stringify(resultWithCorrectEOL.substring(0, 20)));
    
    // 이제 합치기 시도
    const fixedResult = resultWithCorrectEOL + originalContent.slice(approximateOriginalIndex);
    console.log('최종 fixedResult:', JSON.stringify(fixedResult.substring(0, 20)));
    
    // 5. 최종 결과를 원래 EOL 형식으로 변환
    let finalBuggyResult, finalFixedResult;
    
    if (originalEOL === EOL.CRLF) {
      finalBuggyResult = buggyResult.replace(/\n/g, '\r\n');
      // 수정된 방식은 이미 원본 EOL이 유지되므로 추가 변환 불필요
      finalFixedResult = fixedResult;
    } else {
      finalBuggyResult = buggyResult;
      finalFixedResult = fixedResult;
    }
    
    // 각 결과 파일 저장
    const buggyFilePath = path.join(TEST_DIR, 'buggy-append.txt');
    const fixedFilePath = path.join(TEST_DIR, 'fixed-append.txt');
    
    await fs.writeFile(buggyFilePath, finalBuggyResult, 'utf8');
    await fs.writeFile(fixedFilePath, finalFixedResult, 'utf8');
    
    // 결과 확인
    const buggyContent = await fs.readFile(buggyFilePath, 'utf8');
    const fixedContent = await fs.readFile(fixedFilePath, 'utf8');
    
    const buggyEOL = detectEOL(buggyContent);
    const fixedEOL = detectEOL(fixedContent);
    
    // 원래 내용과 EOF 일관성 확인하기 위한 루프
    let buggyConsistent = true;
    for (let i = 0; i < buggyContent.length - 1; i++) {
      if (buggyContent[i] === '\r' && buggyContent[i+1] !== '\n') {
        buggyConsistent = false;
        break;
      }
      if (buggyContent[i] === '\n' && (i === 0 || buggyContent[i-1] !== '\r')) {
        buggyConsistent = false;
        break;
      }
    }
    
    let fixedConsistent = true;
    for (let i = 0; i < fixedContent.length - 1; i++) {
      if (fixedContent[i] === '\r' && fixedContent[i+1] !== '\n') {
        fixedConsistent = false;
        break;
      }
      if (fixedContent[i] === '\n' && (i === 0 || fixedContent[i-1] !== '\r')) {
        fixedConsistent = false;
        break;
      }
    }
    
    console.log('- 버그 있는 방식 결과:', {
      eolType: buggyEOL === EOL.CRLF ? 'Windows (CRLF)' : 'Unix (LF)',
      contentLength: buggyContent.length,
      eolConsistent: buggyConsistent ? '✅ 일관됨' : '❌ 불일치 발생',
      containsCRLF: buggyContent.includes('\r\n'),
      sample: buggyContent.substring(0, 30)
    });
    
    console.log('- 수정된 방식 결과:', {
      eolType: fixedEOL === EOL.CRLF ? 'Windows (CRLF)' : 'Unix (LF)',
      contentLength: fixedContent.length,
      eolConsistent: fixedConsistent ? '✅ 일관됨' : '❌ 불일치 발생',
      containsCRLF: fixedContent.includes('\r\n'),
      sample: fixedContent.substring(0, 30)
    });
    
    const buggyCorrect = buggyEOL === originalEOL && buggyConsistent;
    const fixedCorrect = fixedEOL === originalEOL && fixedConsistent;
    
    console.log('- 테스트 결과:', {
      buggyMethod: buggyCorrect ? '✅ 정상 (우연히)' : '❌ 문제 있음',
      fixedMethod: fixedCorrect ? '✅ 정상' : '❌ 문제 있음',
      comparison: fixedCorrect && !buggyCorrect ? '✅ 수정 방식이 더 나음' : 
                  buggyCorrect && fixedCorrect ? '✅ 두 방식 모두 작동' :
                  '❌ 두 방식 모두 문제 있음'
    });
    
    return { buggyCorrect, fixedCorrect };
    
  } catch (err) {
    console.error('- 원본 내용 합치기 테스트 실패:', err);
    return { buggyCorrect: false, fixedCorrect: false };
  }
}

// 테스트 청소 함수
async function cleanupTests() {
  try {
    // 테스트 후 디렉토리 정리 (선택 사항)
    // await fs.rm(TEST_DIR, { recursive: true, force: true });
    
    console.log('테스트 환경 유지됨. 필요시 수동으로 삭제: ' + TEST_DIR);
    return true;
  } catch (err) {
    console.error('테스트 청소 실패:', err);
    return false;
  }
}

// 모든 테스트 실행
async function runAllTests() {
  console.log('===== 줄바꿈 형식 보존 테스트 시작 =====');
  console.log('테스트 환경:', {
    nodeVersion: process.version,
    platform: process.platform,
    testDir: TEST_DIR
  });
  
  // 테스트 파일 생성
  if (!(await createTestFiles())) {
    console.error('테스트 파일 생성 실패. 테스트를 중단합니다.');
    return;
  }
  
  // 테스트 실행
  const eolPreservationResult = await testEOLPreservation();
  const emulationResult = await testRealToolEmulation();
  const appendingResult = await testOriginalContentAppending();
  
  // 테스트 결과 요약
  console.log('\n===== 종합 테스트 결과 =====');
  console.log(`1. 줄바꿈 형식 보존 테스트: ${eolPreservationResult ? '✅ 통과' : '❌ 실패'}`);
  console.log(`2. replace_in_file 에뮬레이션 테스트: ${emulationResult ? '✅ 통과' : '❌ 실패'}`);
  console.log(`3. 원본 내용 합치기 테스트: ${appendingResult.fixedCorrect ? '✅ 통과' : '❌ 실패'}`);
  console.log(`   - 버그 있는 방식: ${appendingResult.buggyCorrect ? '✅ 정상 (우연히)' : '❌ 문제 있음'}`);
  console.log(`   - 수정된 방식: ${appendingResult.fixedCorrect ? '✅ 정상' : '❌ 문제 있음'}`);
  
  // 테스트 환경 정리
  await cleanupTests();
}

// 테스트 실행
runAllTests().catch(err => {
  console.error('테스트 실행 중 오류 발생:', err);
  process.exit(1);
});
