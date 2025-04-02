// @ts-nocheck
/* 테스트 파일은 타입 검사에서 제외합니다 */
import * as fs from "fs/promises"
import * as path from "path"

// 마크다운-JSON 쌍 토큰 사용량 비교 테스트
describe("마크다운-JSON 쌍 최적화 테스트", () => {
	const PROMPTS_DIR = path.resolve(__dirname, "../core/prompts")
	const SECTIONS_DIR = path.resolve(PROMPTS_DIR, "sections")

	// 문자열을 토큰 단위로 자르는 간단한 함수 (실제 토큰화보다 단순화된 버전)
	function approximateTokenCount(text: string): number {
		return Math.ceil(text.length / 4) // 평균적으로 4자당 1토큰으로 가정
	}

	// 파일 쌍 간의 토큰 비교 테스트
	async function compareTokens(basename: string): Promise<{
		mdTokens: number
		jsonTokens: number
		reduction: number
		reductionPercent: number
	}> {
		const mdPath = path.join(SECTIONS_DIR, `${basename}.md`)
		const jsonPath = path.join(SECTIONS_DIR, `${basename}.json`)

		// 두 파일 모두 존재하는지 확인
		try {
			await fs.access(mdPath)
			await fs.access(jsonPath)
		} catch (error) {
			throw new Error(`파일 존재하지 않음: ${error}`)
		}

		// 파일 내용 읽기
		const mdContent = await fs.readFile(mdPath, "utf-8")
		const jsonContent = await fs.readFile(jsonPath, "utf-8")

		// 토큰 수 계산
		const mdTokens = approximateTokenCount(mdContent)
		const jsonTokens = approximateTokenCount(jsonContent)

		// 결과 반환
		const reduction = mdTokens - jsonTokens
		const reductionPercent = (reduction / mdTokens) * 100

		return {
			mdTokens,
			jsonTokens,
			reduction,
			reductionPercent,
		}
	}

	// 모든 JSON-MD 쌍 찾기
	async function findAllPairs(): Promise<string[]> {
		const allFiles = await fs.readdir(SECTIONS_DIR)
		const mdFiles = allFiles.filter((file) => file.endsWith(".md"))

		// MD 파일 명에서 베이스네임 추출
		const baseNames = mdFiles.map((file) => file.replace(/\.md$/, ""))

		// 대응하는 JSON 파일이 있는지 확인
		const pairs: string[] = []
		for (const base of baseNames) {
			const jsonPath = path.join(SECTIONS_DIR, `${base}.json`)
			try {
				await fs.access(jsonPath)
				pairs.push(base)
			} catch {
				// JSON 파일이 없으면 쌍이 아님
				console.log(`${base}.md에 대응하는 JSON 파일 없음`)
			}
		}

		return pairs
	}

	// 개별 파일 쌍 테스트
	it.each([
		"CAPABILITIES_SUMMARY",
		"EDITING_FILES_GUIDE",
		"MCP_CONNECTED_SERVERS",
		"MCP_CREATION_GUIDE",
		"MCP_SERVERS_HEADER",
		"MODES_EXPLANATION",
		"OBJECTIVE",
		"RULES_HEADER",
		"SYSTEM_INFORMATION",
		"TOOL_DEFINITIONS",
		"TOOL_USE_EXAMPLES",
		"TOOL_USE_FORMAT",
		"TOOL_USE_GUIDELINES",
		"TOOLS_HEADER",
		"USER_INSTRUCTIONS_HEADER",
	])("파일 쌍 %s의 토큰 최적화 테스트", async (basename: string) => {
		const result = await compareTokens(basename)
		console.log(
			`${basename}: MD=${result.mdTokens} JSON=${result.jsonTokens} 절감=${result.reduction} (${result.reductionPercent.toFixed(2)}%)`,
		)

		// JSON 파일이 마크다운보다 작아야 함
		expect(result.jsonTokens).toBeLessThan(result.mdTokens)

		// 최소 10% 이상 축소 기대
		expect(result.reductionPercent).toBeGreaterThan(10)
	})

	// 전체 시스템 프롬프트 최적화 테스트
	it("전체 시스템 프롬프트 토큰 최적화 테스트", async () => {
		const pairs = await findAllPairs()
		const allResults = await Promise.all(
			pairs.map(async (basename) => {
				return await compareTokens(basename)
			}),
		)

		// 총합 계산
		const totalMd = allResults.reduce((sum, r) => sum + r.mdTokens, 0)
		const totalJson = allResults.reduce((sum, r) => sum + r.jsonTokens, 0)
		const totalReduction = totalMd - totalJson
		const totalReductionPercent = (totalReduction / totalMd) * 100

		console.log(`전체 합계: MD=${totalMd} JSON=${totalJson} 절감=${totalReduction} (${totalReductionPercent.toFixed(2)}%)`)

		// 전체적으로 15% 이상 축소 기대
		expect(totalReductionPercent).toBeGreaterThan(15)
	})
})
