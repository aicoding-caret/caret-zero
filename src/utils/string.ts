/**
 * Fixes incorrectly escaped HTML entities in AI model outputs
 * @param text String potentially containing incorrectly escaped HTML entities from AI models
 * @returns String with HTML entities converted back to normal characters
 */
export function fixModelHtmlEscaping(text: string): string {
	return text
		.replace(/&gt;/g, ">")
		.replace(/&lt;/g, "<")
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, "&")
		.replace(/&apos;/g, "'")
}

/**
 * Removes invalid characters (like the replacement character �) from a string
 * @param text String potentially containing invalid characters
 * @returns String with invalid characters removed
 */
export function removeInvalidChars(text: string): string {
	return text.replace(/\uFFFD/g, "")
}

/**
 * 줄바꿈 타입 열거형
 */
export enum EOLType {
	LF = "\n", // Unix/Linux/macOS
	CRLF = "\r\n", // Windows
	CR = "\r", // Old Mac (pre-OSX)
}

/**
 * 텍스트의 줄바꿈 타입을 감지합니다.
 * @param text 줄바꿈 타입을 감지할 텍스트
 * @returns 감지된 줄바꿈 타입, 기본값은 LF(\n)
 */
export function detectEOL(text: string): EOLType {
	if (!text) {
		return EOLType.LF
	}

	if (text.includes(EOLType.CRLF)) {
		return EOLType.CRLF
	}
	if (text.includes(EOLType.CR) && !text.includes(EOLType.LF)) {
		return EOLType.CR
	}
	return EOLType.LF
}

/**
 * 텍스트의 모든 줄바꿈 문자를 LF(\n)로 정규화합니다.
 * @param text 정규화할 텍스트
 * @returns 모든 줄바꿈이 LF(\n)로 정규화된 텍스트
 */
export function normalizeToLF(text: string): string {
	if (!text) {
		return text
	}
	return text.replace(/\r\n|\r/g, EOLType.LF).normalize("NFC")
}

/**
 * 텍스트의 모든 줄바꿈 문자를 특정 EOL 타입으로 변환합니다.
 * @param text 변환할 텍스트
 * @param targetEOL 대상 EOL 타입
 * @returns 지정된 EOL 타입으로 모든 줄바꿈이 변환된 텍스트
 */
export function convertToEOL(text: string, targetEOL: EOLType): string {
	if (!text) {
		return text
	}
	// 먼저 모든 줄바꿈을 LF로 정규화한 다음 대상 EOL로 변환
	return normalizeToLF(text).replace(/\n/g, targetEOL)
}

/**
 * VS Code 문서의 EOL 타입에 맞게 텍스트의 줄바꿈을 변환합니다.
 * @param text 변환할 텍스트
 * @param documentText 기준이 되는 문서 텍스트
 * @returns 문서와 같은 EOL 타입으로 변환된 텍스트
 */
export function convertToDocumentEOL(text: string, documentText: string): string {
	if (!text) {
		return text
	}
	const documentEOL = detectEOL(documentText)

	// 로그 추가 - 호출 확인용
	console.log(`convertToDocumentEOL 호출됨:`, {
		textLength: text.length,
		documentTextLength: documentText.length,
		detectedEOL: documentEOL === "\r\n" ? "CRLF (Windows)" : documentEOL === "\n" ? "LF (Unix)" : "CR (Mac)",
		textSample: text.substring(0, Math.min(20, text.length)),
		documentTextSample: documentText.substring(0, Math.min(20, documentText.length)),
	})

	const result = convertToEOL(text, documentEOL)

	// 변환 결과 로그
	console.log(`convertToDocumentEOL 변환 결과:`, {
		beforeLength: text.length,
		afterLength: result.length,
		hasWindowsEOL: result.includes("\r\n"),
		resultSample: result.substring(0, Math.min(20, result.length)),
	})

	return result
}
