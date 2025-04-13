// 간단한 replace_in_file 작동 테스트 스크립트
const fs = require('fs').promises;
const path = require('path');

// 테스트 파일 경로
const TEST_FILE_PATH = path.resolve(__dirname, './replace-in-file-bug-test.md');
const BACKUP_FILE_PATH = path.resolve(__dirname, './replace-in-file-bug-test.md.bak');

// 테스트 케이스 정의
const TEST_CASES = [
    {
        name: "단순 한 줄 교체",
        search: "이 텍스트는 교체될 예정입니다.",
        replace: "이 텍스트는 성공적으로 교체되었습니다.",
        description: "간단한 한 줄 텍스트 교체 테스트"
    },
    {
        name: "복잡한 JSON 블록 삭제",
        search: `## 테스트 시나리오 2: 복잡한 여러 줄 블록 삭제
아래 JSON 블록을 삭제해 봅시다:

\`\`\`json
{
  "name": "test-block",
  "version": "1.0.0",
  "description": "This is a test block that should be deleted",
  "properties": {
    "test1": "value1",
    "test2": "value2",
    "test3": "value3"
  },
  "nestedObject": {
    "nested1": {
      "item1": "nestedValue1",
      "item2": "nestedValue2"
    }
  },
  "arrayProperty": [
    "item1",
    "item2",
    "item3"
  ]
}
\`\`\``,
        replace: "",
        description: "여러 줄로 된 복잡한 JSON 블록 삭제 테스트"
    },
    {
        name: "마크다운 블록 삭제",
        search: `## 테스트 시나리오 3: 여러 줄 마크다운 블록 삭제
아래 마크다운 블록을 삭제해 봅시다:

### 하위 제목
- 항목 1
- 항목 2
  - 하위 항목 2.1
  - 하위 항목 2.2
- 항목 3

1. 번호 항목 1
2. 번호 항목 2
   - 섞인 항목
   - 섞인 항목 2
3. 번호 항목 3`,
        replace: "",
        description: "여러 줄로 된 마크다운 블록 삭제 테스트"
    }
];

// 줄바꿈 문자 정규화 함수 (우리가 수정한 부분)
function normalizeLineEndings(text) {
    return text.replace(/\r\n|\r/g, "\n");
}

// 파일 백업 함수
async function backupTestFile() {
    try {
        const content = await fs.readFile(TEST_FILE_PATH, 'utf-8');
        await fs.writeFile(BACKUP_FILE_PATH, content, 'utf-8');
        console.log(`파일 백업 생성: ${BACKUP_FILE_PATH}`);
        return content;
    } catch (error) {
        console.error(`파일 백업 실패:`, error);
        throw error;
    }
}

// 파일 복원 함수
async function restoreTestFile() {
    try {
        const content = await fs.readFile(BACKUP_FILE_PATH, 'utf-8');
        await fs.writeFile(TEST_FILE_PATH, content, 'utf-8');
        console.log(`파일 복원 완료: ${TEST_FILE_PATH}`);
    } catch (error) {
        console.error(`파일 복원 실패:`, error);
    }
}

// replace_in_file 동작 시뮬레이션 함수
async function simulateReplaceInFile(search, replace) {
    try {
        let content = await fs.readFile(TEST_FILE_PATH, 'utf-8');
        
        // 줄바꿈 문자 정규화 (버그 수정 부분)
        const normalizedContent = normalizeLineEndings(content);
        const normalizedSearch = normalizeLineEndings(search);
        
        console.log(`원본 파일 크기: ${content.length} 바이트`);
        console.log(`검색 내용 크기: ${search.length} 바이트`);
        
        // 검색 내용이 파일에 있는지 확인
        if (!normalizedContent.includes(normalizedSearch)) {
            console.error('검색 내용이 파일에 없습니다!');
            return false;
        }
        
        // 내용 교체
        const newContent = normalizedContent.replace(normalizedSearch, replace);
        
        // 원본과 다른지 확인
        if (newContent === normalizedContent) {
            console.error('내용이 변경되지 않았습니다!');
            return false;
        }
        
        // 파일에 새 내용 저장
        await fs.writeFile(TEST_FILE_PATH, newContent, 'utf-8');
        console.log(`파일 수정 완료, 새 크기: ${newContent.length} 바이트`);
        
        // 검색 내용이 제대로 제거되었는지 확인
        const updatedContent = await fs.readFile(TEST_FILE_PATH, 'utf-8');
        const normalizedUpdatedContent = normalizeLineEndings(updatedContent);
        const stillContainsSearch = normalizedUpdatedContent.includes(normalizedSearch);
        
        console.log(`검색 내용이 여전히 존재하는지: ${stillContainsSearch ? '예 (실패)' : '아니오 (성공)'}`);
        return !stillContainsSearch;
    } catch (error) {
        console.error('파일 수정 중 오류 발생:', error);
        return false;
    }
}

// 테스트 실행 함수
async function runTests() {
    console.log("===== replace_in_file 버그 수정 테스트 =====");
    
    try {
        // 테스트 파일 존재 확인
        await fs.access(TEST_FILE_PATH);
        console.log(`테스트 파일 확인: ${TEST_FILE_PATH}`);
        
        // 파일 백업
        const originalContent = await backupTestFile();
        
        // 각 테스트 케이스 실행
        const results = [];
        for (const testCase of TEST_CASES) {
            console.log(`\n----- 테스트 케이스: ${testCase.name} -----`);
            console.log(`설명: ${testCase.description}`);
            
            // 테스트 실행
            const result = await simulateReplaceInFile(testCase.search, testCase.replace);
            console.log(`결과: ${result ? '성공' : '실패'}`);
            
            // 테스트 후 파일 복원
            await restoreTestFile();
            
            results.push({
                name: testCase.name,
                result
            });
        }
        
        // 결과 요약
        console.log("\n===== 테스트 결과 요약 =====");
        for (const result of results) {
            console.log(`${result.name}: ${result.result ? '성공 ✓' : '실패 ✗'}`);
        }
        
        // 백업 파일 삭제
        await fs.unlink(BACKUP_FILE_PATH);
        console.log(`백업 파일 삭제 완료: ${BACKUP_FILE_PATH}`);
        
    } catch (error) {
        console.error('테스트 실행 중 오류 발생:', error);
    }
}

// 테스트 실행
runTests();
