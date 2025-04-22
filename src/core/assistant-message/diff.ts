import { ILogger } from "../../services/logging/ILogger"
import * as crypto from "crypto"

// 내용의 해시값을 생성하는 헬퍼 함수
function generateContentHash(content: string): string {
	return crypto.createHash("sha256").update(content).digest("hex").substring(0, 8)
}

/**
 * 내용을 정규화하는 함수
 * - 줄바꿈 정규화 (CRLF -> LF)
 * - 들여쓰기 보존
 * - 연속된 공백을 단일 공백으로 (줄 시작 공백은 보존)
 * - 한글 문자 정규화 (NFKC)
 */
function normalizeContent(content: string): string {
	// 입력 내용 로깅
	console.debug(`[normalizeContent 입력]`, {
		원본내용: content,
		길이: content.length,
		줄바꿈수: (content.match(/\n/g) || []).length,
	});

	// CRLF를 LF로 변환
	content = content.replace(/\r\n/g, '\n');
	
	// 줄별로 처리하여 들여쓰기 보존
	const lines = content.split('\n');
	const normalizedLines = lines.map(line => {
		// 줄 시작의 공백 보존
		const leadingSpaces = line.match(/^\s*/)?.[0] || '';
		// 나머지 부분의 연속된 공백을 단일 공백으로 변환
		const restOfLine = line.slice(leadingSpaces.length).replace(/[ \t]+/g, ' ');
		return leadingSpaces + restOfLine;
	});
	
	content = normalizedLines.join('\n');
	
	// 빈 줄 정규화 (3개 이상의 연속된 줄바꿈을 2개로)
	content = content.replace(/\n{3,}/g, '\n\n');
	
	// 한글 문자 정규화 (NFKC 정규화)
	content = content.normalize('NFKC');

	// 결과 로깅
	console.debug(`[normalizeContent 결과]`, {
		정규화된내용: content,
		길이: content.length,
		줄바꿈수: (content.match(/\n/g) || []).length,
	});

	return content;
}

/**
 * 라인 트림된 대체 매칭을 시도하는 함수
 * - 들여쓰기 차이를 허용
 * - 부분 매칭 지원
 */
function lineTrimmedFallbackMatch(originalContent: string, searchContent: string, startIndex: number): [number, number] | false {
	// 내용 정규화
	originalContent = normalizeContent(originalContent);
	searchContent = normalizeContent(searchContent);

	// Split both contents into lines
	const originalLines = originalContent.split("\n");
	const searchLines = searchContent.split("\n");

	// Trim trailing empty line if exists
	if (searchLines[searchLines.length - 1] === "") {
		searchLines.pop();
	}

	// Find the line number where startIndex falls
	let startLineNum = 0;
	let currentIndex = 0;
	while (currentIndex < startIndex && startLineNum < originalLines.length) {
		currentIndex += originalLines[startLineNum].length + 1; // +1 for \n
		startLineNum++;
	}

	// For each possible starting position in original content
	for (let i = startLineNum; i <= originalLines.length - searchLines.length; i++) {
		let matches = true;
		let totalIndentDiff = 0;

		// Try to match all search lines from this position
		for (let j = 0; j < searchLines.length; j++) {
			const originalLine = originalLines[i + j];
			const searchLine = searchLines[j];
			
			// 들여쓰기 차이 계산
			const originalIndent = originalLine.match(/^\s*/)?.[0].length || 0;
			const searchIndent = searchLine.match(/^\s*/)?.[0].length || 0;
			const indentDiff = originalIndent - searchIndent;
			
			// 첫 번째 줄의 들여쓰기 차이를 기준으로 사용
			if (j === 0) {
				totalIndentDiff = indentDiff;
			}
			
			// 들여쓰기 차이를 고려하여 비교
			const originalTrimmed = originalLine.slice(originalIndent);
			const searchTrimmed = searchLine.slice(searchIndent);

			// 한글 문자 비교 시 유니코드 정규화 적용
			if (originalTrimmed.normalize('NFKC') !== searchTrimmed.normalize('NFKC')) {
				matches = false;
				break;
			}
		}

		// If we found a match, calculate the exact character positions
		if (matches) {
			// Find start character index
			let matchStartIndex = 0;
			for (let k = 0; k < i; k++) {
				matchStartIndex += originalLines[k].length + 1; // +1 for \n
			}

			// Find end character index
			let matchEndIndex = matchStartIndex;
			for (let k = 0; k < searchLines.length; k++) {
				matchEndIndex += originalLines[i + k].length + 1; // +1 for \n
			}

			return [matchStartIndex, matchEndIndex];
		}
	}

	return false;
}

/**
 * 블록 앵커를 사용한 대체 매칭을 시도하는 함수
 */
function blockAnchorFallbackMatch(originalContent: string, searchContent: string, startIndex: number): [number, number] | false {
	// 내용 정규화
	originalContent = normalizeContent(originalContent);
	searchContent = normalizeContent(searchContent);

	// Split both contents into lines
	const originalLines = originalContent.split("\n");
	const searchLines = searchContent.split("\n");

	// Only use this method for blocks of 3 or more lines
	if (searchLines.length < 3) {
		return false;
	}

	// Get the first and last lines as anchors
	const firstLine = searchLines[0].trim();
	const lastLine = searchLines[searchLines.length - 1].trim();

	// Find the line number where startIndex falls
	let startLineNum = 0;
	let currentIndex = 0;
	while (currentIndex < startIndex && startLineNum < originalLines.length) {
		currentIndex += originalLines[startLineNum].length + 1; // +1 for \n 
		startLineNum++;
	}

	// For each possible starting position in original content
	for (let i = startLineNum; i <= originalLines.length - searchLines.length; i++) {
		// Check if first and last lines match with NFKC normalization
		if (originalLines[i].trim().normalize('NFKC') === firstLine.normalize('NFKC') && 
			originalLines[i + searchLines.length - 1].trim().normalize('NFKC') === lastLine.normalize('NFKC')) {
			
			// Verify all lines in between match
			let matches = true;
			for (let j = 1; j < searchLines.length - 1; j++) {
				if (originalLines[i + j].trim().normalize('NFKC') !== searchLines[j].trim().normalize('NFKC')) {
					matches = false;
					break;
				}
			}

			if (matches) {
				// Calculate the exact character positions
				let matchStartIndex = 0;
				for (let k = 0; k < i; k++) {
					matchStartIndex += originalLines[k].length + 1; // +1 for \n
				}

				let matchEndIndex = matchStartIndex;
				for (let k = 0; k < searchLines.length; k++) {
					matchEndIndex += originalLines[i + k].length + 1; // +1 for \n
				}

				return [matchStartIndex, matchEndIndex];
			}
		}
	}

	return false;
}

enum ProcessingState {
	Idle = 0,
	StateSearch = 1 << 0,
	StateReplace = 1 << 1,
}

class NewFileContentConstructor {
	private originalContent: string;
	private isFinal: boolean;
	private state: number;
	private pendingNonStandardLines: string[];
	private result: string;
	private lastProcessedIndex: number;
	private currentSearchContent: string;
	private currentReplaceContent: string;
	private searchMatchIndex: number;
	private searchEndIndex: number;
	private logger?: ILogger;

	constructor(originalContent: string, isFinal: boolean, logger?: ILogger) {
		this.originalContent = originalContent;
		this.isFinal = isFinal;
		this.pendingNonStandardLines = [];
		this.result = "";
		this.lastProcessedIndex = 0;
		this.state = ProcessingState.Idle;
		this.currentSearchContent = "";
		this.currentReplaceContent = "";
		this.searchMatchIndex = -1;
		this.searchEndIndex = -1;
		this.logger = logger;
	}

	private resetForNextBlock() {
		this.state = ProcessingState.Idle;
		this.currentSearchContent = "";
		this.currentReplaceContent = "";
		this.searchMatchIndex = -1;
		this.searchEndIndex = -1;
	}

	private findLastMatchingLineIndex(regx: RegExp, lineLimit: number) {
		for (let i = lineLimit; i > 0; ) {
			i--;
			if (this.pendingNonStandardLines[i].match(regx)) {
				return i;
			}
		}
		return -1;
	}

	private updateProcessingState(newState: ProcessingState) {
		const isValidTransition =
			(this.state === ProcessingState.Idle && newState === ProcessingState.StateSearch) ||
			(this.state === ProcessingState.StateSearch && newState === ProcessingState.StateReplace);

		if (!isValidTransition) {
			throw new Error(
				`Invalid state transition.\n` +
				"Valid transitions are:\n" +
				"- Idle → StateSearch\n" +
				"- StateSearch → StateReplace"
			);
		}

		this.state |= newState;
	}

	private isStateActive(state: ProcessingState): boolean {
		return (this.state & state) === state;
	}

	private activateReplaceState() {
		this.updateProcessingState(ProcessingState.StateReplace);
	}

	private activateSearchState() {
		this.updateProcessingState(ProcessingState.StateSearch);
		this.currentSearchContent = "";
		this.currentReplaceContent = "";
	}

	private isSearchingActive(): boolean {
		return this.isStateActive(ProcessingState.StateSearch);
	}

	private isReplacingActive(): boolean {
		return this.isStateActive(ProcessingState.StateReplace);
	}

	private hasPendingNonStandardLines(pendingNonStandardLineLimit: number): boolean {
		return this.pendingNonStandardLines.length - pendingNonStandardLineLimit < this.pendingNonStandardLines.length;
	}

	public processLine(line: string) {
		this.internalProcessLine(line, true, this.pendingNonStandardLines.length);
	}

	public getResult() {
		if (this.isFinal && this.lastProcessedIndex < this.originalContent.length) {
			this.result += this.originalContent.slice(this.lastProcessedIndex);
		}
		if (this.isFinal && this.state !== ProcessingState.Idle) {
			throw new Error("File processing incomplete - SEARCH/REPLACE operations still active during finalization");
		}
		return this.result;
	}

	private internalProcessLine(
		line: string,
		canWritePendingNonStandardLines: boolean,
		pendingNonStandardLineLimit: number,
	): number {
		let removeLineCount = 0;
		
		if (line === "^SEARCH^") {
			removeLineCount = this.trimPendingNonStandardTrailingEmptyLines(pendingNonStandardLineLimit);
			if (removeLineCount > 0) {
				pendingNonStandardLineLimit = pendingNonStandardLineLimit - removeLineCount;
			}
			if (this.hasPendingNonStandardLines(pendingNonStandardLineLimit)) {
				this.tryFixSearchReplaceBlock(pendingNonStandardLineLimit);
				canWritePendingNonStandardLines && (this.pendingNonStandardLines.length = 0);
			}
			this.activateSearchState();
		} else if (line === "^=====^") {
			if (!this.isSearchingActive()) {
				this.tryFixSearchBlock(pendingNonStandardLineLimit);
				canWritePendingNonStandardLines && (this.pendingNonStandardLines.length = 0);
			}
			this.activateReplaceState();
			this.beforeReplace();
		} else if (line === "^REPLACE^") {
			if (!this.isReplacingActive()) {
				this.tryFixReplaceBlock(pendingNonStandardLineLimit);
				canWritePendingNonStandardLines && (this.pendingNonStandardLines.length = 0);
			}
			this.lastProcessedIndex = this.searchEndIndex;
			this.resetForNextBlock();
		} else {
			if (this.isReplacingActive()) {
				this.currentReplaceContent += line + "\n";
				if (this.searchMatchIndex !== -1) {
					this.result += line + "\n";
				}
			} else if (this.isSearchingActive()) {
				this.currentSearchContent += line + "\n";
			} else {
				if (canWritePendingNonStandardLines) {
					this.pendingNonStandardLines.push(line);
				}
			}
		}
		return removeLineCount;
	}

	private beforeReplace() {
		if (!this.currentSearchContent) {
			if (this.originalContent.length === 0) {
				this.searchMatchIndex = 0;
				this.searchEndIndex = 0;
			} else {
				this.searchMatchIndex = 0;
				this.searchEndIndex = this.originalContent.length;
			}
		} else {
			try {
				// 정규식 패턴 매칭 추가
				const searchPattern = new RegExp(
					this.currentSearchContent
						.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 특수문자 이스케이프
						.replace(/\n/g, '\\s*') // 줄바꿈을 유연한 공백으로 처리
				);
				
				const exactIndex = this.originalContent.search(searchPattern);
				if (exactIndex !== -1) {
					this.searchMatchIndex = exactIndex;
					this.searchEndIndex = exactIndex + this.currentSearchContent.length;
				} else {
					const lineMatch = lineTrimmedFallbackMatch(
						this.originalContent,
						this.currentSearchContent,
						this.lastProcessedIndex
					);
					if (lineMatch) {
						[this.searchMatchIndex, this.searchEndIndex] = lineMatch;
					} else {
						const blockMatch = blockAnchorFallbackMatch(
							this.originalContent,
							this.currentSearchContent,
							this.lastProcessedIndex
						);
						if (blockMatch) {
							[this.searchMatchIndex, this.searchEndIndex] = blockMatch;
						} else {
							throw new Error(
								`검색 블록이 파일의 어느 부분과도 일치하지 않습니다:\n${this.currentSearchContent.trimEnd()}`
							);
						}
					}
				}
				
				if (this.searchMatchIndex < this.lastProcessedIndex) {
					throw new Error(
						`검색 블록이 잘못된 위치에서 일치했습니다:\n${this.currentSearchContent.trimEnd()}`
					);
				}
				
				this.result += this.originalContent.slice(this.lastProcessedIndex, this.searchMatchIndex);
			} catch (error) {
				console.error('치환 작업 중 오류 발생:', error);
				throw error;
			}
		}
	}

	private tryFixSearchBlock(lineLimit: number): number {
		let removeLineCount = 0;
		if (lineLimit < 0) {
			lineLimit = this.pendingNonStandardLines.length;
		}
		if (!lineLimit) {
			throw new Error("Invalid SEARCH/REPLACE block structure - no lines available to process");
		}
		
		const searchTagRegexp = /^[<]{3,} SEARCH$/;
		const searchTagIndex = this.findLastMatchingLineIndex(searchTagRegexp, lineLimit);
		
		if (searchTagIndex !== -1) {
			const fixLines = this.pendingNonStandardLines.slice(searchTagIndex, lineLimit);
			fixLines[0] = "^SEARCH^";
			for (const line of fixLines) {
				removeLineCount += this.internalProcessLine(line, false, searchTagIndex);
			}
		} else {
			throw new Error(
				`Invalid REPLACE marker detected - could not find matching SEARCH block starting from line ${searchTagIndex + 1}`
			);
		}
		return removeLineCount;
	}

	private tryFixReplaceBlock(lineLimit: number): number {
		let removeLineCount = 0;
		if (lineLimit < 0) {
			lineLimit = this.pendingNonStandardLines.length;
		}
		if (!lineLimit) {
			throw new Error("Invalid line limit");
		}
		
		const replaceBeginTagRegexp = /^[=]{3,}$/;
		const replaceBeginTagIndex = this.findLastMatchingLineIndex(replaceBeginTagRegexp, lineLimit);
		
		if (replaceBeginTagIndex !== -1) {
			const fixLines = this.pendingNonStandardLines.slice(replaceBeginTagIndex - removeLineCount, lineLimit - removeLineCount);
			fixLines[0] = "^=====^";
			for (const line of fixLines) {
				removeLineCount += this.internalProcessLine(line, false, replaceBeginTagIndex - removeLineCount);
			}
		} else {
			throw new Error(`Malformed REPLACE block - missing valid separator after line ${replaceBeginTagIndex + 1}`);
		}
		return removeLineCount;
	}

	private tryFixSearchReplaceBlock(lineLimit: number): number {
		let removeLineCount = 0;
		if (lineLimit < 0) {
			lineLimit = this.pendingNonStandardLines.length;
		}
		if (!lineLimit) {
			throw new Error("Invalid line limit");
		}

		const replaceEndTagRegexp = /^[>]{3,} REPLACE$/;
		const replaceEndTagIndex = this.findLastMatchingLineIndex(replaceEndTagRegexp, lineLimit);
		const likeReplaceEndTag = replaceEndTagIndex === lineLimit - 1;
		
		if (likeReplaceEndTag) {
			const fixLines = this.pendingNonStandardLines.slice(replaceEndTagIndex - removeLineCount, lineLimit - removeLineCount);
			fixLines[fixLines.length - 1] = "^REPLACE^";
			for (const line of fixLines) {
				removeLineCount += this.internalProcessLine(line, false, replaceEndTagIndex - removeLineCount);
			}
		} else {
			throw new Error("Malformed SEARCH/REPLACE block structure: Missing valid closing REPLACE marker");
		}
		return removeLineCount;
	}

	private trimPendingNonStandardTrailingEmptyLines(lineLimit: number): number {
		let removedCount = 0;
		let i = Math.min(lineLimit, this.pendingNonStandardLines.length) - 1;

		while (i >= 0 && this.pendingNonStandardLines[i].trim() === "") {
			this.pendingNonStandardLines.pop();
			removedCount++;
			i--;
		}

		return removedCount;
	}
}

export async function constructNewFileContent(
	diffContent: string,
	originalContent: string,
	isFinal: boolean,
	logger?: ILogger,
): Promise<string> {
	// ILogger가 없는 경우 콘솔에만 출력
	const log = logger || console;
	
	// 초기 입력 로깅
	log.debug(`[constructNewFileContent] 초기 입력 상태`, {
		diffContentLength: diffContent.length,
		originalContentLength: originalContent.length,
		isFinal,
		diffContentHash: generateContentHash(diffContent),
		originalContentHash: generateContentHash(originalContent)
	});
	
	// 내용 정규화
	diffContent = normalizeContent(diffContent);
	originalContent = normalizeContent(originalContent);
	
	// EOL 형식 감지
	const detectedEOL = originalContent.includes("\r\n") ? "\r\n" : "\n";
	log.debug(`[constructNewFileContent] EOL 형식 감지`, {
		eolType: detectedEOL === "\r\n" ? "CRLF (Windows)" : "LF (Unix)"
	});

	// 파일 내용 생성기 초기화
	const constructor = new NewFileContentConstructor(originalContent, isFinal, logger);
	
	// 라인 분할 및 처리
	const lines = diffContent.split("\n");
	
	// 부분 마커 검사
	const lastLine = lines[lines.length - 1];
	if (lines.length > 0 &&
		(lastLine.startsWith("<") || lastLine.startsWith("=") || lastLine.startsWith(">")) &&
		lastLine !== "^SEARCH^" &&
		lastLine !== "^=====^" &&
		lastLine !== "^REPLACE^") {
		lines.pop();
		log.debug(`[constructNewFileContent] 부분 마커 제거`, {
			removedLine: lastLine
		});
	}

	// 각 라인 처리
	for (const line of lines) {
		constructor.processLine(line);
	}

	// 결과 반환
	const result = constructor.getResult();
	
	// EOL 형식 변환
	const finalResult = result.replace(/\n/g, detectedEOL);
	
	// 최종 결과 로깅
	log.debug(`[constructNewFileContent] 최종 결과`, {
		originalLength: originalContent.length,
		resultLength: finalResult.length,
		originalHash: generateContentHash(originalContent),
		resultHash: generateContentHash(finalResult),
		hasChanges: finalResult !== originalContent
	});

	return finalResult;
} 