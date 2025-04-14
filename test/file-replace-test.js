const fs = require("fs").promises
const path = require("path")

// 테스트용 임시 파일 경로
const TEST_DIR = path.join(__dirname, "temp-test-files")
const TEST_FILE = path.join(TEST_DIR, "test-file.txt")

// 파일 수정에 사용할 타입 정의 (JS에서는 인터페이스 필요 없음)
// diff 내용에서 변경할 패턴과 대체할 내용을 추출하는 함수
function extractReplacementsFromDiff(diff) {
	const replacements = []
	const lines = diff.split("\n")
	let inHunk = false
	let fromLines = []
	let toLines = []

	for (const line of lines) {
		if (line.startsWith("@@")) {
			// 새로운 diff 청크 시작
			inHunk = true
			fromLines = []
			toLines = []
		} else if (inHunk) {
			if (line.startsWith("-") && !line.startsWith("---")) {
				// 제거된 줄
				fromLines.push(line.substring(1))
			} else if (line.startsWith("+") && !line.startsWith("+++")) {
				// 추가된 줄
				toLines.push(line.substring(1))
			}
		}
	}

	// diff에서 추출한 패턴들로 치환 정보 생성
	if (fromLines.length > 0 && toLines.length > 0) {
		replacements.push({
			from: fromLines.join("\n").trim(),
			to: toLines.join("\n").trim(),
		})
	}

	return replacements
}

// 테스트 헬퍼 함수: 파일 생성 및 내용 작성
async function createTestFile(content) {
	await fs.mkdir(TEST_DIR, { recursive: true })
	await fs.writeFile(TEST_FILE, content, "utf8")
}

// 테스트 헬퍼 함수: 파일 읽기
async function readTestFile() {
	return await fs.readFile(TEST_FILE, "utf8")
}

// 테스트 헬퍼 함수: 테스트 결과 출력
function logTestResult(testName, passed, message) {
	if (passed) {
		console.log(`✅ ${testName}: 성공`)
	} else {
		console.error(`❌ ${testName}: 실패 - ${message}`)
	}
}

// 테스트: diff에서 패턴 추출 기능
async function testExtractReplacements() {
	const diff = `@@ -10,5 +10,5 @@
     function hello() {
-      console.log("Hello, world!");
+      console.log("Hello, universe!");
     }`

	const replacements = extractReplacementsFromDiff(diff)

	if (replacements.length !== 1) {
		logTestResult("패턴 추출 테스트", false, `replacements 길이가 1이 아님: ${replacements.length}`)
		return
	}

	if (replacements[0].from !== 'console.log("Hello, world!");') {
		logTestResult("패턴 추출 테스트", false, `from 값이 예상과 다름: ${replacements[0].from}`)
		return
	}

	if (replacements[0].to !== 'console.log("Hello, universe!");') {
		logTestResult("패턴 추출 테스트", false, `to 값이 예상과 다름: ${replacements[0].to}`)
		return
	}

	logTestResult("패턴 추출 테스트", true)
}

// 테스트: 단순 텍스트 치환
async function testSimpleReplacement() {
	const originalContent = "Hello, world! This is a test."
	await createTestFile(originalContent)

	// 수동으로 치환 적용
	const fileContent = await readTestFile()
	const newContent = fileContent.replace("world", "universe")
	await fs.writeFile(TEST_FILE, newContent, "utf8")

	const result = await readTestFile()
	if (result !== "Hello, universe! This is a test.") {
		logTestResult(
			"단순 텍스트 치환 테스트",
			false,
			`결과가
예상과 다름: ${result}`,
		)
		return
	}

	logTestResult("단순 텍스트 치환 테스트", true)
}

// 테스트: 여러 줄 패턴 치환
async function testMultilineReplacement() {
	const originalContent = `function test() {
  // 이것은 주석입니다
  console.log("테스트 함수");
  return true;
}`
	await createTestFile(originalContent)

	// 여러 줄 패턴 치환
	const fileContent = await readTestFile()
	const pattern = `  // 이것은 주석입니다
  console.log("테스트 함수");`
	const replacement = `  // 수정된 주석입니다
  console.log("수정된 테스트 함수");`
	const newContent = fileContent.replace(pattern, replacement)
	await fs.writeFile(TEST_FILE, newContent, "utf8")

	const result = await readTestFile()
	if (!result.includes("수정된 주석입니다") || !result.includes("수정된 테스트 함수")) {
		logTestResult("여러 줄 패턴 치환 테스트", false, `결과가 예상과 다름: ${result}`)
		return
	}

	logTestResult("여러 줄 패턴 치환 테스트", true)
}

// 테스트: 유니코드 문자 치환
async function testUnicodeReplacement() {
	const originalContent = "안녕하세요! 테스트 파일입니다."
	await createTestFile(originalContent)

	const fileContent = await readTestFile()
	const newContent = fileContent.replace("안녕하세요", "반갑습니다")
	await fs.writeFile(TEST_FILE, newContent, "utf8")

	const result = await readTestFile()
	if (result !== "반갑습니다! 테스트 파일입니다.") {
		logTestResult("유니코드 문자 치환 테스트", false, `결과가 예상과 다름: ${result}`)
		return
	}

	logTestResult("유니코드 문자 치환 테스트", true)
}

// 테스트: 정규식 패턴 치환
async function testRegexReplacement() {
	const originalContent = "test1, test2, test3, test4"
	await createTestFile(originalContent)

	const fileContent = await readTestFile()
	const regexPattern = /test\d/g
	const newContent = fileContent.replace(regexPattern, "replaced")
	await fs.writeFile(TEST_FILE, newContent, "utf8")

	const result = await readTestFile()
	if (result !== "replaced, replaced, replaced, replaced") {
		logTestResult("정규식 패턴 치환 테스트", false, `결과가 예상과 다름: ${result}`)
		return
	}

	logTestResult("정규식 패턴 치환 테스트", true)
}

// 테스트 실행 함수
async function runTests() {
	console.log("🧪 파일 수정 기능 테스트 시작\n")

	try {
		await testExtractReplacements()
		await testSimpleReplacement()
		await testMultilineReplacement()
		await testUnicodeReplacement()
		await testRegexReplacement()

		console.log("\n✨ 모든 테스트 완료!")
	} catch (error) {
		console.error("\n💥 테스트 실행 중 오류 발생:", error)
	} finally {
		// 테스트 파일 정리
		try {
			await fs.rm(TEST_DIR, { recursive: true, force: true })
			console.log("\n🧹 테스트 파일 정리 완료")
		} catch (err) {
			console.error("테스트 파일 정리 중 오류:", err)
		}
	}
}

// 테스트 실행
runTests()
