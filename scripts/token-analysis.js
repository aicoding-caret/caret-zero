const fs = require("fs").promises
const path = require("path")

// 설정
const PROMPTS_DIR = path.resolve(__dirname, "../src/core/prompts")
const SECTIONS_DIR = path.resolve(PROMPTS_DIR, "sections")

// 문자열을 토큰 단위로 자르는 간단한 함수 (실제 토큰화보다 단순화된 버전)
function approximateTokenCount(text) {
	return Math.ceil(text.length / 4) // 평균적으로 4자당 1토큰으로 가정
}

// 파일 쌍 간의 토큰 비교 테스트
async function compareTokens(basename) {
	const mdPath = path.join(SECTIONS_DIR, `${basename}.md`)
	const jsonPath = path.join(SECTIONS_DIR, `${basename}.json`)

	// 두 파일 모두 존재하는지 확인
	try {
		await fs.access(mdPath)
		await fs.access(jsonPath)
	} catch (error) {
		console.error(`파일 존재하지 않음: ${error}`)
		return null
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
		basename,
		mdTokens,
		jsonTokens,
		reduction,
		reductionPercent,
	}
}

// 모든 JSON-MD 쌍 찾기
async function findAllPairs() {
	const allFiles = await fs.readdir(SECTIONS_DIR)
	const mdFiles = allFiles.filter((file) => file.endsWith(".md"))

	// MD 파일 명에서 베이스네임 추출
	const baseNames = mdFiles.map((file) => file.replace(/\.md$/, ""))

	// 대응하는 JSON 파일이 있는지 확인
	const pairs = []
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

// 메인 함수
async function main() {
	console.log("마크다운-JSON 쌍 토큰 최적화 분석 시작")
	console.log("=" + "=".repeat(80))

	const basenames = await findAllPairs()
	console.log(`총 ${basenames.length}개의 파일 쌍을 발견했습니다.`)

	// 개별 파일 쌍 분석
	const results = []
	for (const basename of basenames) {
		const result = await compareTokens(basename)
		if (result) {
			console.log(
				`${result.basename}: MD=${result.mdTokens} JSON=${result.jsonTokens} 절감=${result.reduction} (${result.reductionPercent.toFixed(2)}%)`,
			)
			results.push(result)
		}
	}

	// 총합 계산
	if (results.length > 0) {
		const totalMd = results.reduce((sum, r) => sum + r.mdTokens, 0)
		const totalJson = results.reduce((sum, r) => sum + r.jsonTokens, 0)
		const totalReduction = totalMd - totalJson
		const totalReductionPercent = (totalReduction / totalMd) * 100

		console.log("\n총합 분석 결과:")
		console.log("=" + "=".repeat(80))
		console.log(`전체 마크다운 토큰 수: ${totalMd}`)
		console.log(`전체 JSON 토큰 수: ${totalJson}`)
		console.log(`총 절감 토큰 수: ${totalReduction}`)
		console.log(`총 절감율: ${totalReductionPercent.toFixed(2)}%`)

		// 목표 달성 여부 체크
		if (totalReductionPercent > 15) {
			console.log("\n✅ 목표 달성: 15% 이상의 토큰 절감율을 달성했습니다!")
		} else {
			console.log("\n❌ 목표 미달성: 15% 이상의 토큰 절감율에 도달하지 못했습니다.")
		}
	} else {
		console.log("분석할 수 있는 파일 쌍이 없습니다.")
	}
}

// 실행
main().catch((err) => {
	console.error("오류 발생:", err)
	process.exit(1)
})
