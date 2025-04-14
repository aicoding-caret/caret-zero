import fs from "fs/promises"
import path from "path"
import { describe, it, beforeEach, afterEach } from "mocha"
import { expect } from "chai"

// 파일 수정에 사용할 타입 정의
interface Replacement {
	from: string | RegExp
	to: string
}

// diff 내용에서 변경할 패턴과 대체할 내용을 추출하는 함수
function extractReplacementsFromDiff(diff: string): Replacement[] {
	const replacements: Replacement[] = []
	const lines = diff.split("\n")
	let inHunk = false
	let fromLines: string[] = []
	let toLines: string[] = []

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
			} else if (!line.startsWith("\\") && line.trim() !== "") {
				// diff 청크 내 변경되지 않은 줄은 무시
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

// 테스트용 임시 파일 경로
const TEST_DIR = path.join(__dirname, "temp-test-files")
const TEST_FILE = path.join(TEST_DIR, "test-file.txt")

describe("파일 수정 기능 테스트", () => {
	// 각 테스트 전에 실행
	beforeEach(async () => {
		// 테스트 디렉토리 생성
		await fs.mkdir(TEST_DIR, { recursive: true })
	})

	// 각 테스트 후에 실행
	afterEach(async () => {
		// 테스트 파일 및 디렉토리 정리
		try {
			await fs.rm(TEST_DIR, { recursive: true, force: true })
		} catch (err) {
			console.error("테스트 파일 정리 중 오류:", err)
		}
	})

	// 테스트 헬퍼 함수: 파일 생성 및 내용 작성
	async function createTestFile(content: string): Promise<void> {
		await fs.writeFile(TEST_FILE, content, "utf8")
	}

	// 테스트 헬퍼 함수: 파일 읽기
	async function readTestFile(): Promise<string> {
		return await fs.readFile(TEST_FILE, "utf8")
	}

	// diff에서 패턴 추출 기능 테스트
	it("extractReplacementsFromDiff가 패턴을 올바르게 추출해야 함", () => {
		const diff = `@@ -10,5 +10,5 @@
     function hello() {
-      console.log("Hello, world!");
+      console.log("Hello, universe!");
     }`

		const replacements = extractReplacementsFromDiff(diff)
		expect(replacements).to.be.an("array")
		expect(replacements.length).to.equal(1)
		expect(replacements[0].from).to.equal('console.log("Hello, world!");')
		expect(replacements[0].to).to.equal('console.log("Hello, universe!");')
	})

	// 단순 텍스트 치환 테스트
	it("단순 텍스트 치환이 정상 작동해야 함", async () => {
		const originalContent = "Hello, world! This is a test."
		await createTestFile(originalContent)

		// 수동으로 치환 적용
		const fileContent = await readTestFile()
		const newContent = fileContent.replace("world", "universe")
		await fs.writeFile(TEST_FILE, newContent, "utf8")

		const result = await readTestFile()
		expect(result).to.equal("Hello, universe! This is a test.")
	})

	// 여러 줄 패턴 치환 테스트
	it("여러 줄 패턴 치환이 정상 작동해야 함", async () => {
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
		expect(result).to.include("수정된 주석입니다")
		expect(result).to.include("수정된 테스트 함수")
	})

	// 유니코드 문자 치환 테스트
	it("유니코드(한글) 문자 치환이 정상 작동해야 함", async () => {
		const originalContent = "안녕하세요! 테스트 파일입니다."
		await createTestFile(originalContent)

		const fileContent = await readTestFile()
		const newContent = fileContent.replace("안녕하세요", "반갑습니다")
		await fs.writeFile(TEST_FILE, newContent, "utf8")

		const result = await readTestFile()
		expect(result).to.equal("반갑습니다! 테스트 파일입니다.")
	})

	// 정규식 패턴 치환 테스트
	it("정규식 패턴 치환이 정상 작동해야 함", async () => {
		const originalContent = "test1, test2, test3, test4"
		await createTestFile(originalContent)

		const fileContent = await readTestFile()
		const regexPattern = /test\d/g
		const newContent = fileContent.replace(regexPattern, "replaced")
		await fs.writeFile(TEST_FILE, newContent, "utf8")

		const result = await readTestFile()
		expect(result).to.equal("replaced, replaced, replaced, replaced")
	})

	// 빈 파일 처리 테스트
	it("빈 파일 처리가 오류 없이 진행되어야 함", async () => {
		await createTestFile("")

		const fileContent = await readTestFile()
		expect(fileContent).to.equal("")

		// 빈 파일에 내용 추가
		const newContent = "새로운 내용"
		await fs.writeFile(TEST_FILE, newContent, "utf8")

		const result = await readTestFile()
		expect(result).to.equal("새로운 내용")
	})

	// 큰 파일 처리 테스트
	it("큰 파일 처리가 정상 작동해야 함", async () => {
		// 10,000줄의 큰 파일 생성
		const largeContent = Array(10000).fill("This is a line of test content.").join("\n")
		await createTestFile(largeContent)

		// 내용 확인
		const fileContent = await readTestFile()
		expect(fileContent.split("\n").length).to.equal(10000)

		// 특정 줄 수정
		const lines = fileContent.split("\n")
		lines[5000] = "This is a modified line."
		const newContent = lines.join("\n")
		await fs.writeFile(TEST_FILE, newContent, "utf8")

		const result = await readTestFile()
		expect(result.split("\n")[5000]).to.equal("This is a modified line.")
	})
})
