const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const util = require('util');
const { exec } = require('child_process');
const execPromise = util.promisify(exec);

// 테스트 디렉토리 및 파일 설정
const TEST_DIR = path.join(__dirname, 'temp-midline-test');
const TEST_FILE = path.join(TEST_DIR, 'midline-break-test.txt');

// 줄바꿈 타입 검출 함수 
function detectEOL(text) {
  if (text.includes('\r\n')) return '\r\n';  // Windows
  if (text.includes('\n')) return '\n';      // Unix
  if (text.includes('\r')) return '\r';      // Old Mac
  return '\n';  // 기본값
}

// 해시 생성 함수
function generateContentHash(content) {
  return crypto.createHash('md5').update(content || '').digest('hex').substring(0, 8);
}

// 테스트 파일 생성
async function createTestFile() {
  try {
    // 테스트 디렉토리 생성
    await fs.mkdir(TEST_DIR, { recursive: true });
    
    // 테스트 파일 내용 (Windows 줄바꿈 사용)
    const content = '첫 번째 줄입니다.\r\n두 번째 줄은 조금 더 길어요.\r\n세 번째 줄입니다.\r\n마지막 네 번째 줄.';
    
    // 파일 작성
    await fs.writeFile(TEST_FILE, content, 'utf8');
    console.log('테스트 파일 생성 완료:', TEST_FILE);
    console.log('파일 내용:', content);
    
    return content;
  } catch (err) {
    console.error('테스트 파일 생성 실패:', err);
    throw err;
  }
}

// 줄 중간에 줄바꿈 추가 테스트
async function testMidlineBreak() {
  console.log('\n===== 줄 중간에 줄바꿈 추가 테스트 =====');
  
  try {
    // 테스트 파일 생성
    const originalContent = await createTestFile();
    const originalHash = generateContentHash(originalContent);
    const originalEOL = detectEOL(originalContent);
    
    console.log('원본 파일 정보:', {
      eolType: originalEOL === '\r\n' ? 'Windows (CRLF)' : 'Unix (LF)',
      contentLength: originalContent.length,
      hash: originalHash,
      lines: originalContent.split(/\r\n|\n/).length
    });
    
    // 핵심 테스트: 두 번째 줄 중간에 줄바꿈 추가
    console.log('\n--- 테스트 1: 줄 중간에 줄바꿈 추가 ---');
    
    // diff 내용 생성
    const searchLine = '두 번째 줄은 조금 더 길어요.';
    const replaceLine = '두 번째 줄은\r\n조금 더 길어요.';  // Windows 줄바꿈으로 분리
    
    const diffContent = `
<<<<<<< SEARCH
${searchLine}
=======
${replaceLine}
>>>>>>> REPLACE
`;
    
    // 임시 diff 파일 생성
    const diffFilePath = path.join(TEST_DIR, 'diff.txt');
    await fs.writeFile(diffFilePath, diffContent, 'utf8');
    
    console.log('생성된 diff 내용:', {
      searchLine,
      replaceLine,
      diffContent
    });
    
    // 직접 테스트 (정규 표현식 방식)
    console.log('\n--- 직접 문자열 치환 테스트 ---');
    const manualReplaced = originalContent.replace(searchLine, replaceLine);
    await fs.writeFile(path.join(TEST_DIR, 'manual-result.txt'), manualReplaced, 'utf8');
    
    console.log('수동 치환 결과:', {
      contentLength: manualReplaced.length,
      hash: generateContentHash(manualReplaced),
      lines: manualReplaced.split(/\r\n|\n/).length,
      sample: manualReplaced.substring(0, 50)
    });
    
    // 내용 확인 - 원시 방식 (16진수로 내용 확인)
    const manualResultBinary = Buffer.from(manualReplaced.substring(0, 50)).toString('hex');
    console.log('수동 치환 결과 (16진수):', manualResultBinary);
    
    // 줄 중간 줄바꿈 검사
    const hasMiddleLineBreak = manualReplaced.includes('두 번째 줄은\r\n조금 더 길어요');
    const splitLines = manualReplaced.split(/\r\n|\n/);
    
    console.log('줄 중간 줄바꿈 검사:', {
      hasMiddleLineBreak,
      totalLines: splitLines.length,
      linesBefore: originalContent.split(/\r\n|\n/).length,
      linesAfter: manualReplaced.split(/\r\n|\n/).length,
      breakIsVisible: splitLines.some(line => line === '두 번째 줄은' || line === '조금 더 길어요.')
    });
    
    // split 검사 시각화
    console.log('줄 분리 확인:');
    splitLines.forEach((line, i) => {
      console.log(`  ${i+1}: "${line}"`);
    });
    
    console.log('\n테스트 완료! 파일 확인:', TEST_DIR);
    return true;
  } catch (err) {
    console.error('테스트 실패:', err);
    return false;
  }
}

// 줄 중간에 여러 줄바꿈 추가 테스트 (이스케이프 시퀀스 확인)
async function testEscapedBreaks() {
  console.log('\n===== 이스케이프된 줄바꿈 테스트 =====');
  
  try {
    // 다른 테스트 파일 생성
    const testFile2 = path.join(TEST_DIR, 'escape-test.txt');
    const originalContent = '첫 번째 줄입니다.\r\n두 번째 줄은 조금 더 길어요.\r\n세 번째 줄입니다.\r\n마지막 네 번째 줄.';
    await fs.writeFile(testFile2, originalContent, 'utf8');
    
    // 이스케이프 시퀀스 추가 테스트 (JS 리터럴을 문자열로 작성)
    console.log('\n--- 테스트 2: 이스케이프 시퀀스 변환 테스트 ---');
    
    // diff 내용 생성 (직접 줄바꿈 리터럴)
    const searchLine = '두 번째 줄은 조금 더 길어요.';
    
    // 리터럴로 표현된 줄바꿈
    const replaceLineRaw = '두 번째 줄은\\n조금 더 길어요.';
    
    // 직접 변환 실험
    console.log('\n--- 문자열 리터럴 확인 ---');
    
    // 1. 리터럴 그대로
    console.log('리터럴 그대로:', replaceLineRaw);
    
    // 2. 리터럴의 \\n을 실제 \n으로 변환
    const replaceLine1 = replaceLineRaw.replace(/\\n/g, '\n');
    console.log('\\n → \\n 변환:', replaceLine1);
    
    // 3. 리터럴의 \\n을 실제 \r\n으로 변환
    const replaceLine2 = replaceLineRaw.replace(/\\n/g, '\r\n');
    console.log('\\n → \\r\\n 변환:', replaceLine2);
    
    // 바이너리로 확인
    console.log('바이너리 확인:');
    console.log('  원본:', Buffer.from(replaceLineRaw).toString('hex'));
    console.log('  \\n 변환:', Buffer.from(replaceLine1).toString('hex'));
    console.log('  \\r\\n 변환:', Buffer.from(replaceLine2).toString('hex'));
    
    // 수동 테스트
    const manualReplaced1 = originalContent.replace(searchLine, replaceLine1);
    const manualReplaced2 = originalContent.replace(searchLine, replaceLine2);
    
    await fs.writeFile(path.join(TEST_DIR, 'escape-result1.txt'), manualReplaced1, 'utf8');
    await fs.writeFile(path.join(TEST_DIR, 'escape-result2.txt'), manualReplaced2, 'utf8');
    
    console.log('\n수동 치환 결과 1 (\\n):', {
      contentLength: manualReplaced1.length,
      lines: manualReplaced1.split(/\r\n|\n/).length
    });
    
    console.log('수동 치환 결과 2 (\\r\\n):', {
      contentLength: manualReplaced2.length,
      lines: manualReplaced2.split(/\r\n|\n/).length
    });
    
    return true;
  } catch (err) {
    console.error('이스케이프 테스트 실패:', err);
    return false;
  }
}

// 실제 diff.ts 비슷한 방식으로 처리 테스트
async function testDiffSimulation() {
  console.log('\n===== diff.ts 처리 시뮬레이션 테스트 =====');
  
  try {
    // 이전에 만든 파일 읽기
    const originalContent = await fs.readFile(TEST_FILE, 'utf8');
    
    // diff.ts 처리 방식 시뮬레이션
    const searchLine = '두 번째 줄은 조금 더 길어요.';
    const replaceLine = '두 번째 줄은\r\n조금 더 길어요.';
    
    // 1. 줄바꿈 정규화 (diff.ts의 방식)
    const normalizedOriginalContent = originalContent.replace(/\r\n|\r/g, '\n');
    const normalizedSearchLine = searchLine.replace(/\r\n|\r/g, '\n');
    const normalizedReplaceLine = replaceLine.replace(/\r\n|\r/g, '\n');
    
    console.log('정규화 후 내용:', {
      originalLines: normalizedOriginalContent.split('\n').length,
      searchLineNormalized: normalizedSearchLine,
      replaceLineNormalized: normalizedReplaceLine
    });
    
    // 2. 줄 단위 분할 및 처리 (diff.ts와 유사하게)
    const originalLines = normalizedOriginalContent.split('\n');
    const searchLineIndex = originalLines.findIndex(line => line === normalizedSearchLine);
    
    console.log('줄 단위 검색 결과:', {
      searchLineIndex,
      matchingLine: searchLineIndex >= 0 ? originalLines[searchLineIndex] : 'not found'
    });
    
    // 3. 다중 줄 치환이 어떻게 처리되는지 시뮬레이션
    if (searchLineIndex >= 0) {
      // normalizedReplaceLine이 여러 줄을 포함하는 경우
      const replaceLines = normalizedReplaceLine.split('\n');
      
      console.log('치환 줄 분석:', {
        isMultipleLines: replaceLines.length > 1,
        lineCount: replaceLines.length,
        lines: replaceLines
      });
      
      // 시뮬레이션: 원래 줄을 제거하고 새 줄 추가 방식
      const resultLines = [...originalLines];
      resultLines.splice(searchLineIndex, 1, ...replaceLines);
      
      const simulatedResult = resultLines.join('\n');
      const finalResult = simulatedResult.replace(/\n/g, '\r\n'); // 원래 EOL로 변환
      
      await fs.writeFile(path.join(TEST_DIR, 'simulation-result.txt'), finalResult, 'utf8');
      
      console.log('시뮬레이션 결과:', {
        originalLineCount: originalLines.length,
        resultLineCount: resultLines.length,
        finalLineCount: finalResult.split('\r\n').length,
        success: resultLines.length > originalLines.length
      });
      
      // 줄 분리 확인 
      console.log('결과 줄 확인:');
      finalResult.split('\r\n').forEach((line, i) => {
        console.log(`  ${i+1}: "${line}"`);
      });
    }
    
    return true;
  } catch (err) {
    console.error('시뮬레이션 테스트 실패:', err);
    return false;
  }
}

// 모든 테스트 실행
async function runAllTests() {
  console.log('===== 줄 중간 줄바꿈 테스트 시작 =====');
  
  await testMidlineBreak();
  await testEscapedBreaks();
  await testDiffSimulation();
  
  console.log('\n===== 테스트 완료 =====');
  console.log('모든 테스트 결과 파일 위치:', TEST_DIR);
}

// 테스트 실행
runAllTests().catch(err => console.error('테스트 실행 중 오류:', err));
