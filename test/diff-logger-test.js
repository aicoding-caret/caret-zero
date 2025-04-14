// diff-logger-test.js
// 로그 추가된 diff.ts 테스트를 위한 스크립트

const fs = require("fs")
const path = require("path")
const { constructNewFileContent } = require("../out/core/assistant-message/diff")

// 테스트 파일 경로
const TEST_FILE = path.join(__dirname, "test-file.txt")

// 테스트 실행 함수
async function runTest() {
	console.log("========== DIFF 테스트 시작 ==========")

	// 테스트 파일 생성
	const originalContent = [
		"첫 번째 줄입니다.",
		"두 번째 줄입니다.",
		"세 번째 줄입니다.",
		"네 번째 줄입니다.",
		"다섯 번째 줄입니다.",
	].join("\n")

	fs.writeFileSync(TEST_FILE, originalContent)
	console.log("테스트 파일 생성 완료")
	console.log("원본 내용:")
	console.log(originalContent)

	// SEARCH/REPLACE 블록 생성
	const diffContent = ["<<<<<<< SEARCH", "세 번째 줄입니다.", "=======", "수정된 세 번째 줄입니다.", ">>>>>>> REPLACE"].join(
		"\n",
	)

	console.log("\n적용할 DIFF:")
	console.log(diffContent)

	try {
		// constructNewFileContent 함수 호출 (로그 출력 활성화)
		console.log("\n변환 처리 시작...")
		const newContent = await constructNewFileContent(diffContent, originalContent, true)

		console.log("\n변환 결과:")
		console.log(newContent)

		// 결과 검증
		const expectedContent = [
			"첫 번째 줄입니다.",
			"두 번째 줄입니다.",
			"수정된 세 번째 줄입니다.",
			"네 번째 줄입니다.",
			"다섯 번째 줄입니다.",
		].join("\n")

		console.log("\n검증 결과:")
		if (newContent === expectedContent) {
			console.log("✅ 성공: 예상 결과와 일치합니다.")
		} else {
			console.log("❌ 실패: 예상 결과와 일치하지 않습니다.")
			console.log("--- 예상 결과 ---")
			console.log(expectedContent)
			console.log("--- 실제 결과 ---")
			console.log(newContent)
			console.log("--- 차이점 분석 ---")
			analyzeContentDifference(expectedContent, newContent)
		}
	} catch (error) {
		console.error("오류 발생:", error.message)
	}

	// 테스트 파일 삭제
	fs.unlinkSync(TEST_FILE)
}

// 컨텐츠 차이점 분석 함수
function analyzeContentDifference(expected, actual) {
	const expectedLines = expected.split("\n")
	const actualLines = actual.split("\n")

	console.log(`예상 라인 수: ${expectedLines.length}, 실제 라인 수: ${actualLines.length}`)

	// 각 라인 비교
	const minLength = Math.min(expectedLines.length, actualLines.length)
	for (let i = 0; i < minLength; i++) {
		if (expectedLines[i] !== actualLines[i]) {
			console.log(`라인 ${i + 1} 불일치:`)
			console.log(`  예상: "${expectedLines[i]}"`)
			console.log(`  실제: "${actualLines[i]}"`)
		}
	}

	// 추가 라인 확인
	if (expectedLines.length > actualLines.length) {
		console.log("누락된 라인:")
		for (let i = actualLines.length; i < expectedLines.length; i++) {
			console.log(`  라인 ${i + 1}: "${expectedLines[i]}"`)
		}
	} else if (actualLines.length > expectedLines.length) {
		console.log("추가된 라인:")
		for (let i = expectedLines.length; i < actualLines.length; i++) {
			console.log(`  라인 ${i + 1}: "${actualLines[i]}"`)
		}
	}
}

// 최상위 비동기 함수
;(async () => {
	try {
		await runTest()
	} catch (error) {
		console.error("테스트 실행 오류:", error)
	}
})()
