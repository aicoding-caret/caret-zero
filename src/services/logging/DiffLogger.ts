import * as vscode from "vscode"
import { EnhancedLogger } from "./EnhancedLogger"
import { ILogger } from "./ILogger"

/**
 * replace_in_file 도구의 diff 관련 로깅을 위한 특수 로거 클래스
 * EnhancedLogger를 확장하여 diff 관련 디버깅에 특화된 기능을 제공합니다.
 */
export class DiffLogger extends EnhancedLogger {
	/**
	 * DiffLogger 생성자
	 * @param context VSCode 확장 컨텍스트
	 */
	constructor(context: vscode.ExtensionContext) {
		super("Cline Diff", context, {
			logToFile: true,
			logFileName: "cline-diff.log",
		})
	}

	/**
	 * SEARCH/REPLACE 블록을 로깅합니다.
	 * @param searchContent 검색 내용
	 * @param replaceContent 대체 내용
	 * @param matchIndex 매치된 인덱스 (없으면 -1)
	 */
	logDiffBlock(searchContent: string, replaceContent: string, matchIndex: number): void {
		this.debug("SEARCH/REPLACE 블록", {
			searchLength: searchContent.length,
			searchLines: searchContent.split("\n").length,
			replaceLength: replaceContent.length,
			replaceLines: replaceContent.split("\n").length,
			matchIndex,
			searchPreview: this.truncateForPreview(searchContent),
			replacePreview: this.truncateForPreview(replaceContent),
		})
	}

	/**
	 * 매치 시도 결과를 로깅합니다.
	 * @param matchType 매치 유형 (exact, lineTrimmed, blockAnchor)
	 * @param success 성공 여부
	 * @param startIndex 시작 인덱스
	 * @param endIndex 종료 인덱스
	 * @param searchContent 검색 내용
	 */
	logMatchAttempt(
		matchType: "exact" | "lineTrimmed" | "blockAnchor",
		success: boolean,
		startIndex: number,
		endIndex: number,
		searchContent: string,
	): void {
		this.debug(`매치 시도 (${matchType})`, {
			success,
			startIndex,
			endIndex,
			matchLength: endIndex - startIndex,
			searchContentLength: searchContent.length,
			searchContentLines: searchContent.split("\n").length,
			searchPreview: this.truncateForPreview(searchContent),
		})
	}

	/**
	 * 파일 내용 변경 결과를 로깅합니다.
	 * @param originalContent 원본 내용
	 * @param newContent 새 내용
	 * @param isFinal 최종 결과 여부
	 */
	logContentChange(originalContent: string, newContent: string, isFinal: boolean): void {
		this.debug("파일 내용 변경", {
			originalLength: originalContent.length,
			originalLines: originalContent.split("\n").length,
			newLength: newContent.length,
			newLines: newContent.split("\n").length,
			isFinal,
			originalPreview: this.truncateForPreview(originalContent),
			newPreview: this.truncateForPreview(newContent),
		})
	}

	/**
	 * 줄 단위 매치 시도를 로깅합니다.
	 * @param originalLine 원본 줄
	 * @param searchLine 검색 줄
	 * @param lineNumber 줄 번호
	 * @param matches 매치 여부
	 */
	logLineMatch(originalLine: string, searchLine: string, lineNumber: number, matches: boolean): void {
		this.debug(`줄 매치 (${lineNumber})`, {
			originalLine: this.truncateForPreview(originalLine, 100),
			searchLine: this.truncateForPreview(searchLine, 100),
			originalTrimmed: this.truncateForPreview(originalLine.trim(), 100),
			searchTrimmed: this.truncateForPreview(searchLine.trim(), 100),
			matches,
		})
	}

	/**
	 * 블록 앵커 매치 시도를 로깅합니다.
	 * @param firstLineSearch 첫 줄 검색 내용
	 * @param lastLineSearch 마지막 줄 검색 내용
	 * @param firstLineOriginal 첫 줄 원본 내용
	 * @param lastLineOriginal 마지막 줄 원본 내용
	 * @param position 위치 정보
	 * @param matches 매치 여부
	 */
	logBlockAnchorMatch(
		firstLineSearch: string,
		lastLineSearch: string,
		firstLineOriginal: string,
		lastLineOriginal: string,
		position: { start: number; end: number },
		matches: boolean,
	): void {
		this.debug("블록 앵커 매치", {
			firstLineSearch: this.truncateForPreview(firstLineSearch, 100),
			lastLineSearch: this.truncateForPreview(lastLineSearch, 100),
			firstLineOriginal: this.truncateForPreview(firstLineOriginal, 100),
			lastLineOriginal: this.truncateForPreview(lastLineOriginal, 100),
			position,
			matches,
		})
	}

	/**
	 * 오류 상황을 자세히 로깅합니다.
	 * @param error 오류 객체
	 * @param context 오류 컨텍스트
	 */
	logDiffError(
		error: Error,
		context: {
			diffContent: string
			originalContent: string
			lastProcessedIndex: number
			currentSearchContent?: string
		},
	): void {
		this.error(error, {
			...context,
			diffContentPreview: this.truncateForPreview(context.diffContent),
			originalContentPreview: this.truncateForPreview(context.originalContent),
			currentSearchContentPreview: context.currentSearchContent
				? this.truncateForPreview(context.currentSearchContent)
				: undefined,
		})
	}

	/**
	 * 긴 문자열을 미리보기용으로 잘라냅니다.
	 * @param content 내용
	 * @param maxLength 최대 길이 (기본값: 200)
	 * @returns 잘라낸 내용
	 */
	private truncateForPreview(content: string, maxLength: number = 200): string {
		if (!content) {
			return ""
		} // Added braces

		if (content.length <= maxLength) {
			return content
		}

		return content.substring(0, maxLength) + "..."
	}
}

// 싱글톤 인스턴스
let diffLoggerInstance: DiffLogger | null = null

/**
 * DiffLogger 인스턴스를 초기화합니다.
 * @param context VSCode 확장 컨텍스트
 * @returns DiffLogger 인스턴스
 */
export function initializeDiffLogger(context: vscode.ExtensionContext): DiffLogger {
	if (!diffLoggerInstance) {
		diffLoggerInstance = new DiffLogger(context)
	}
	return diffLoggerInstance
}

/**
 * DiffLogger 인스턴스를 가져옵니다.
 * @returns DiffLogger 인스턴스
 * @throws 초기화되지 않은 경우 오류 발생
 */
export function getDiffLogger(): DiffLogger {
	if (!diffLoggerInstance) {
		throw new Error("DiffLogger가 초기화되지 않았습니다. initializeDiffLogger를 먼저 호출하세요.")
	}
	return diffLoggerInstance
}
