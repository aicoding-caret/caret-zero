// 직접 diff 로직을 테스트하는 간단한 스크립트
const fs = require("fs")
const path = require("path")

// 테스트 파일 생성
const TEST_FILE = path.join(__dirname, "replace-test-file.txt")
const ORIGINAL_CONTENT = `첫 번째 줄입니다.
두 번째 줄입니다.
세 번째 줄입니다.
네 번째 줄입니다.
다섯 번째 줄입니다.`

// 테스트 파일 생성
console.log("====== replace_in_file 버그 테스트 ======")
console.log("테스트 파일 생성 중...")
fs.writeFileSync(TEST_FILE, ORIGINAL_CONTENT)
console.log("테스트 파일 생성 완료! 원본 내용:")
console.log(ORIGINAL_CONTENT)
console.log("---------------------------------------")

// 버그가 발생하는 핵심 코드 로직 모방
function buggyReplaceInFile(original, searchText, replaceText) {
	console.log(`- SEARCH: "${searchText}"`)
	console.log(`- REPLACE: "${replaceText}"`)

	// 1. 위치 찾기
	const searchIndex = original.indexOf(searchText)
	if (searchIndex === -1) {
		console.log("❌ 검색 텍스트를 찾을 수 없습니다!")
		return original
	}

	// 2. 대체 전 내용 추가 (원본 코드 로직처럼)
	let result = original.slice(0, searchIndex)
	console.log(`- 대체 전 내용 추가 (0~${searchIndex}): "${result}"`)

	// 3. 대체 내용 추가 (버그 포함된 버전)
	result = "" // 🐛 버그 - 이전 결과 무시
	result += replaceText
	console.log(`- 대체 내용 추가 후: "${result}"`)

	// 4. 마지막 처리 (이 단계가 실행되지 않는 경우 시뮬레이션)
	const endIndex = searchIndex + searchText.length
	const finalProcessing = false // 🐛 버그 - 마지막 처리 안 함

	if (finalProcessing && endIndex < original.length) {
		const remainingContent = original.slice(endIndex)
		console.log(`- 나머지 내용 추가 (${endIndex}~끝): "${remainingContent}"`)
		result += remainingContent
	} else {
		console.log("❌ 나머지 내용 추가되지 않음! (isFinal = false 상황)")
	}

	return result
}

// 올바른 대체 로직 (참조용)
function correctReplaceInFile(original, searchText, replaceText) {
	console.log(`[정상] SEARCH: "${searchText}"`)
	console.log(`[정상] REPLACE: "${replaceText}"`)

	const searchIndex = original.indexOf(searchText)
	if (searchIndex === -1) {
		return original
	}

	const beforeContent = original.slice(0, searchIndex)
	const afterContent = original.slice(searchIndex + searchText.length)

	return beforeContent + replaceText + afterContent
}

// 테스트 실행
console.log("\n1️⃣ 버그가 있는 대체 로직 테스트:")
const searchText = "세 번째 줄입니다."
const replaceText = "수정된 세 번째 줄입니다."

// 버그 있는 버전 실행
const buggyResult = buggyReplaceInFile(ORIGINAL_CONTENT, searchText, replaceText)
console.log("\n버그 있는 결과:")
console.log(buggyResult)

// 정상 버전 결과
console.log("\n2️⃣ 정상 작동하는 대체 로직 비교:")
const correctResult = correctReplaceInFile(ORIGINAL_CONTENT, searchText, replaceText)
console.log("\n정상 결과:")
console.log(correctResult)

// 결과 비교
console.log("\n3️⃣ 버그 분석:")
console.log(`- 원본 길이: ${ORIGINAL_CONTENT.length} 글자`)
console.log(`- 버그 결과 길이: ${buggyResult.length} 글자`)
console.log(`- 정상 결과 길이: ${correctResult.length} 글자`)

// 테스트 파일 삭제
fs.unlinkSync(TEST_FILE)
console.log("\n테스트 파일 삭제 완료")
console.log("====== 테스트 종료 ======")
