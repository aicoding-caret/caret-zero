// 타입스크립트 컴파일 문제를 피하기 위한 JavaScript 버전 테스트 스크립트
const fs = require("fs").promises
const path = require("path")
const { constructNewFileContent } = require("../src/core/assistant-message/diff")

// 간단한 로거 객체
const logger = {
	debug: (message, data) => console.log(`[DEBUG] ${message}`, data ? data : ""),
	error: (message, data) => console.error(`[ERROR] ${message}`, data ? data : ""),
	log: (message, data) => console.log(`[LOG] ${message}`, data ? data : ""),
	warn: (message, data) => console.warn(`[WARN] ${message}`, data ? data : ""),
}

// 테스트 파일 경로
const TEST_FILE_PATH = path.resolve(__dirname, "./replace-in-file-bug-test.md")
const CWD = path.resolve(__dirname, "..")

// JSON 블록 테스트 케이스 (시나리오 2)
const TEST_CASE_JSON_BLOCK = `## 테스트 시나리오 2: 복잡한 여러 줄 블록 삭제
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
\`\`\``

// 마크다운 블록 테스트 케이스 (시나리오 3)
const TEST_CASE_MD_BLOCK = `## 테스트 시나리오 3: 여러 줄 마크다운 블록 삭제
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
3. 번호 항목 3`

// 간단한 한 줄 테스트 케이스 (시나리오 1)
const TEST_CASE_SINGLE_LINE = `이 텍스트는 교체될 예정입니다.`
const TEST_CASE_SINGLE_LINE_REPLACE = `이 텍스트는 성공적으로 교체되었습니다.`

// 테스트 케이스 함수 - 파일 내용을 읽고 diff를 적용한 후 결과를 비교
async function testReplaceInFile(searchContent, replaceContent = "", description) {
	console.log(`\n----- 테스트 케이스: ${description} -----`)

	try {
		// 원본 파일 내용 읽기
		const originalContent = await fs.readFile(TEST_FILE_PATH, "utf-8")
		console.log(`원본 파일 크기: ${originalContent.length} 바이트`)

		// diff 내용 생성
		const diffContent = `<<<<<<< SEARCH
${searchContent}
=======
${replaceContent}
>>>>>>> REPLACE`

		console.log(`SEARCH 블록 크기: ${searchContent.length} 바이트`)
		console.log(`REPLACE 블록 크기: ${replaceContent.length} 바이트`)

		// constructNewFileContent 함수를 사용하여 새 내용 생성 테스트
		console.log("\n1. constructNewFileContent 함수 테스트:")
		let newContent
		try {
			newContent = await constructNewFileContent(diffContent, originalContent, true, logger)
			console.log(`새 내용 생성 성공, 크기: ${newContent.length} 바이트`)

			// 원본 내용과 다른지 확인
			const changed = newContent !== originalContent
			console.log(`내용 변경 여부: ${changed ? "예" : "아니오"}`)

			// 검색 내용이 새 내용에 포함되어 있는지 확인
			const stillContainsSearch = newContent.includes(searchContent)
			console.log(`검색 내용이 여전히 포함되어 있는지: ${stillContainsSearch ? "예 (실패)" : "아니오 (성공)"}`)

			if (!changed || stillContainsSearch) {
				console.log("=> constructNewFileContent 함수 테스트 실패")
				return false
			} else {
				console.log("=> constructNewFileContent 함수 테스트 성공")
			}
		} catch (error) {
			console.error("constructNewFileContent 실행 중 오류:", error)
			return false
		}

		console.log("\n2. VS Code DiffViewProvider 테스트 생략 (의존성 때문에)")
		console.log(`=> constructNewFileContent 함수가 정상 동작하면 파일 저장 로직도 정상 작동할 것으로 예상됩니다.`)

		// 테스트 성공
		return true
	} catch (error) {
		console.error("테스트 실행 중 오류:", error)
		return false
	}
}

// 모든 테스트 케이스 실행
async function runAllTests() {
	console.log("===== replace_in_file 버그 테스트 스크립트 =====")

	// 테스트 파일 존재 확인
	try {
		await fs.access(TEST_FILE_PATH)
		console.log(`테스트 파일 확인: ${TEST_FILE_PATH}`)
	} catch (error) {
		console.error(`테스트 파일을 찾을 수 없습니다: ${TEST_FILE_PATH}`)
		return
	}

	// 각 테스트 케이스 실행
	const testResults = []

	// 테스트 1: 간단한 한 줄 교체 (통과 예상)
	testResults.push({
		name: "단순 한 줄 교체",
		result: await testReplaceInFile(TEST_CASE_SINGLE_LINE, TEST_CASE_SINGLE_LINE_REPLACE, "단순 한 줄 교체"),
	})

	// 테스트 2: 복잡한 JSON 블록 삭제 (실패 예상 - 버그 재현)
	testResults.push({
		name: "복잡한 JSON 블록 삭제",
		result: await testReplaceInFile(TEST_CASE_JSON_BLOCK, "", "복잡한 JSON 블록 삭제"),
	})

	// 테스트 3: 여러 줄 마크다운 블록 삭제 (실패 예상 - 버그 재현)
	testResults.push({
		name: "여러 줄 마크다운 블록 삭제",
		result: await testReplaceInFile(TEST_CASE_MD_BLOCK, "", "여러 줄 마크다운 블록 삭제"),
	})

	// 결과 요약
	console.log("\n===== 테스트 결과 요약 =====")
	for (const test of testResults) {
		console.log(`${test.name}: ${test.result ? "성공" : "실패"}`)
	}
}

// 테스트 실행
runAllTests().catch((error) => {
	console.error("테스트 실행 중 오류가 발생했습니다:", error)
})
