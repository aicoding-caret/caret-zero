/**
 * Attempts a line-trimmed fallback match for the given search content in the original content.
 * It tries to match `searchContent` lines against a block of lines in `originalContent` starting
 * from `lastProcessedIndex`. Lines are matched by trimming leading/trailing whitespace and ensuring
 * they are identical afterwards.
 *
 * Returns [matchIndexStart, matchIndexEnd] if found, or false if not found.
 */
function normalizeContent(content: string): string {
	// 입력 내용 로깅
	console.debug(`[normalizeContent 입력]`, {
		원본내용: content,
		길이: content.length,
		줄바꿈수: (content.match(/\n/g) || []).length,
	});

	// 줄바꿈 정규화 (CRLF -> LF)
	content = content.replace(/\r\n/g, '\n');
	
	// 연속된 공백 정규화 (탭, 스페이스 등)
	content = content.replace(/[ \t]+/g, ' ');
	
	// 줄 끝의 공백 제거
	content = content.replace(/[ \t]+$/gm, '');
	
	// 빈 줄 정규화
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

function lineTrimmedFallbackMatch(originalContent: string, searchContent: string, startIndex: number): [number, number] | false {
	// 내용 정규화
	originalContent = normalizeContent(originalContent);
	searchContent = normalizeContent(searchContent);

	// Split both contents into lines
	const originalLines = originalContent.split("\n");
	const searchLines = searchContent.split("\n");

	// Trim trailing empty line if exists (from the trailing \n in searchContent)
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

		// Try to match all search lines from this position
		for (let j = 0; j < searchLines.length; j++) {
			const originalTrimmed = originalLines[i + j].trim();
			const searchTrimmed = searchLines[j].trim();

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
 * Attempts to match blocks of code by using the first and last lines as anchors.
 * This is a third-tier fallback strategy that helps match blocks where we can identify
 * the correct location by matching the beginning and end, even if the exact content
 * differs slightly.
 *
 * The matching strategy:
 * 1. Only attempts to match blocks of 3 or more lines to avoid false positives
 * 2. Extracts from the search content:
 *    - First line as the "start anchor"
 *    - Last line as the "end anchor"
 * 3. For each position in the original content:
 *    - Checks if the next line matches the start anchor
 *    - If it does, jumps ahead by the search block size
 *    - Checks if that line matches the end anchor
 *    - All comparisons are done after trimming whitespace
 *
 * This approach is particularly useful for matching blocks of code where:
 * - The exact content might have minor differences
 * - The beginning and end of the block are distinctive enough to serve as anchors
 * - The overall structure (number of lines) remains the same
 *
 * @param originalContent - The full content of the original file
 * @param searchContent - The content we're trying to find in the original file
 * @param startIndex - The character index in originalContent where to start searching
 * @returns A tuple of [startIndex, endIndex] if a match is found, false otherwise
 */
function blockAnchorFallbackMatch(originalContent: string, searchContent: string, startIndex: number): [number, number] | false {
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

/**
 * This function reconstructs the file content by applying a streamed diff (in a
 * specialized SEARCH/REPLACE block format) to the original file content. It is designed
 * to handle both incremental updates and the final resulting file after all chunks have
 * been processed.
 *
 * The diff format is a custom structure that uses three markers to define changes:
 *
 *   <<<<<<< SEARCH
 *   [Exact content to find in the original file]
 *   =======
 *   [Content to replace with]
 *   >>>>>>> REPLACE
 *
 * Behavior and Assumptions:
 * 1. The file is processed chunk-by-chunk. Each chunk of `diffContent` may contain
 *    partial or complete SEARCH/REPLACE blocks. By calling this function with each
 *    incremental chunk (with `isFinal` indicating the last chunk), the final reconstructed
 *    file content is produced.
 *
 * 2. Matching Strategy (in order of attempt):
 *    a. Exact Match: First attempts to find the exact SEARCH block text in the original file
 *    b. Line-Trimmed Match: Falls back to line-by-line comparison ignoring leading/trailing whitespace
 *    c. Block Anchor Match: For blocks of 3+ lines, tries to match using first/last lines as anchors
 *    If all matching strategies fail, an error is thrown.
 *
 * 3. Empty SEARCH Section:
 *    - If SEARCH is empty and the original file is empty, this indicates creating a new file
 *      (pure insertion).
 *    - If SEARCH is empty and the original file is not empty, this indicates a complete
 *      file replacement (the entire original content is considered matched and replaced).
 *
 * 4. Applying Changes:
 *    - Before encountering the "=======" marker, lines are accumulated as search content.
 *    - After "=======" and before ">>>>>>> REPLACE", lines are accumulated as replacement content.
 *    - Once the block is complete (">>>>>>> REPLACE"), the matched section in the original
 *      file is replaced with the accumulated replacement lines, and the position in the original
 *      file is advanced.
 *
 * 5. Incremental Output:
 *    - As soon as the match location is found and we are in the REPLACE section, each new
 *      replacement line is appended to the result so that partial updates can be viewed
 *      incrementally.
 *
 * 6. Partial Markers:
 *    - If the final line of the chunk looks like it might be part of a marker but is not one
 *      of the known markers, it is removed. This prevents incomplete or partial markers
 *      from corrupting the output.
 *
 * 7. Finalization:
 *    - Once all chunks have been processed (when `isFinal` is true), any remaining original
 *      content after the last replaced section is appended to the result.
 *    - Trailing newlines are not forcibly added. The code tries to output exactly what is specified.
 *
 * Errors:
 * - If the search block cannot be matched using any of the available matching strategies,
 *   an error is thrown.
 */
import { ILogger } from "../../services/logging/ILogger"
import * as crypto from "crypto"

// 내용의 해시값을 생성하는 헬퍼 함수
function generateContentHash(content: string): string {
	return crypto.createHash("sha256").update(content).digest("hex").substring(0, 8)
}

function normalizeDiffContent(content: string): string {
	// 입력 내용 로깅
	console.debug(`[normalizeDiffContent 입력]`, {
		원본내용: content,
		길이: content.length,
		줄바꿈수: (content.match(/\n/g) || []).length,
		CDATA존재: content.includes('<![CDATA['),
		CDATA시작위치: content.indexOf('<![CDATA['),
		CDATA끝위치: content.indexOf(']]>'),
	});

	// CDATA 섹션 처리
	if (content.includes('<![CDATA[')) {
		const startIndex = content.indexOf('<![CDATA[');
		const endIndex = content.indexOf(']]>', startIndex);
		
		if (startIndex !== -1 && endIndex !== -1) {
			const cdataContent = content.substring(startIndex + '<![CDATA['.length, endIndex);
			
			console.debug(`[CDATA 처리 상세]`, {
				시작위치: startIndex,
				끝위치: endIndex,
				CDATA내용: cdataContent,
				CDATA길이: cdataContent.length,
				CDATA줄바꿈수: (cdataContent.match(/\n/g) || []).length,
			});
			
			content = cdataContent;
		} else {
			// CDATA 끝이 없는 경우, SEARCH & REPLACE 블록만 추출
			const searchStart = content.indexOf('<<<<<<< SEARCH');
			const separator = content.indexOf('=======');
			const replaceEnd = content.indexOf('>>>>>>> REPLACE');
			
			if (searchStart !== -1 && separator !== -1) {
				const searchContent = content.substring(searchStart, separator).trim();
				let replaceContent = content.substring(separator + '======='.length).trim();
				
				// REPLACE 블록이 불완전한 경우 처리
				if (replaceEnd === -1) {
					// 마지막 줄이 불완전한 경우 제거
					const lastNewline = replaceContent.lastIndexOf('\n');
					if (lastNewline !== -1) {
						replaceContent = replaceContent.substring(0, lastNewline).trim();
					}
					
					// REPLACE 마커 추가
					content = `${searchContent}\n=======\n${replaceContent}\n>>>>>>> REPLACE`;
					
					console.debug(`[불완전한 REPLACE 블록 처리]`, {
						SEARCH시작: searchStart,
						구분자위치: separator,
						REPLACE끝: replaceEnd,
						처리된내용: content,
					});
				} else {
					content = `${searchContent}\n=======\n${replaceContent}`;
					
					console.debug(`[불완전한 CDATA 처리]`, {
						SEARCH시작: searchStart,
						구분자위치: separator,
						REPLACE끝: replaceEnd,
						처리된내용: content,
					});
				}
			} else {
				console.debug(`[CDATA 처리 실패]`, {
					시작위치: startIndex,
					끝위치: endIndex,
					SEARCH시작: searchStart,
					구분자위치: separator,
					REPLACE끝: replaceEnd,
				});
			}
		}
	}

	// HTML 엔티티 디코딩
	content = content.replace(/&lt;/g, '<')
					.replace(/&gt;/g, '>')
					.replace(/&amp;/g, '&');

	// 줄바꿈 정규화
	content = content.replace(/\r\n/g, '\n');

	// SEARCH & REPLACE 블록 형식 정규화
	content = content.replace(/<<<<<<<\s*SEARCH/g, '<<<<<<< SEARCH')
					.replace(/=======/g, '=======')
					.replace(/>>>>>>>\s*REPLACE/g, '>>>>>>> REPLACE');

	// 결과 로깅
	console.debug(`[normalizeDiffContent 결과]`, {
		정규화된내용: content,
		길이: content.length,
		줄바꿈수: (content.match(/\n/g) || []).length,
		SEARCH존재: content.includes('<<<<<<< SEARCH'),
		구분자존재: content.includes('======='),
		REPLACE존재: content.includes('>>>>>>> REPLACE'),
	});

	return content;
}

function isMessageComplete(message: string): boolean {
	// CDATA 섹션 확인
	if (!message.includes('<![CDATA[') || !message.includes(']]>')) {
		return false;
	}
	
	// SEARCH/REPLACE 블록 확인
	const hasCompleteSearchBlock = message.includes('<<<<<<< SEARCH') && 
								  message.includes('=======') && 
								  message.includes('>>>>>>> REPLACE');
	
	if (!hasCompleteSearchBlock) {
		return false;
	}
	
	// REPLACE 블록 내용 확인
	const replaceContent = message.split('=======')[1]?.split('>>>>>>> REPLACE')[0] || '';
	const hasCompleteReplaceBlock = replaceContent.trim().endsWith(');');
	
	return hasCompleteReplaceBlock;
}

export async function constructNewFileContent(
	diffContent: string,
	originalContent: string,
	isFinal: boolean,
	logger?: ILogger,
): Promise<string> {
	// ILogger가 없는 경우 콘솔에만 출력
	const log = logger || console
	
	// 1-1: 초기 입력 로깅
	log.debug(`[1-1] 초기 입력 상태`, {
		diffContentLength: diffContent.length,
		originalContentLength: originalContent.length,
		isFinal,
		diffContentHash: generateContentHash(diffContent),
		originalContentHash: generateContentHash(originalContent)
	});
	
	// 1-2: diff 내용 정규화
	diffContent = normalizeDiffContent(diffContent);
	log.debug(`[1-2] 정규화된 diff 내용`, {
		normalizedDiffContent: diffContent,
		normalizedLength: diffContent.length,
		normalizedHash: generateContentHash(diffContent)
	});
	
	// 1-3: 내용 정규화
	diffContent = normalizeContent(diffContent);
	originalContent = normalizeContent(originalContent);
	log.debug(`[1-3] 최종 정규화된 내용`, {
		diffContentLength: diffContent.length,
		originalContentLength: originalContent.length,
		diffContentHash: generateContentHash(diffContent),
		originalContentHash: generateContentHash(originalContent)
	});

	// 2-1: EOL 형식 감지
	const detectedEOL = originalContent.includes("\r\n") ? "\r\n" : "\n";
	log.debug(`[2-1] EOL 형식 감지`, {
		eolType: detectedEOL === "\r\n" ? "CRLF (Windows)" : "LF (Unix)"
	});

	let result = "";
	let lastProcessedIndex = 0;
	let currentSearchContent = "";
	let currentReplaceContent = "";
	let inSearch = false;
	let inReplace = false;
	let searchMatchIndex = -1;
	let searchEndIndex = -1;
	let remainderProcessed = false;

	// 2-2: 라인 분할
	const lines = diffContent.split("\n");
	log.debug(`[2-2] 라인 분할 결과`, {
		totalLines: lines.length,
		firstLine: lines[0],
		lastLine: lines[lines.length - 1]
	});

	// 2-3: 부분 마커 검사
	const lastLine = lines[lines.length - 1];
	if (lines.length > 0 &&
		(lastLine.startsWith("<") || lastLine.startsWith("=") || lastLine.startsWith(">")) &&
		lastLine !== "<<<<<<< SEARCH" &&
		lastLine !== "=======" &&
		lastLine !== ">>>>>>> REPLACE") {
		lines.pop();
		log.debug(`[2-3] 부분 마커 제거`, {
			removedLine: lastLine
		});
	}

	// 2-4: SEARCH/REPLACE 블록 형식 검증
	const hasSearchBlock = lines.includes("<<<<<<< SEARCH");
	const hasSeparator = lines.includes("=======");
	const hasReplaceBlock = lines.includes(">>>>>>> REPLACE");
	log.debug(`[2-4] 블록 형식 검증`, {
		hasSearchBlock,
		hasSeparator,
		hasReplaceBlock,
		isValid: hasSearchBlock && hasSeparator && hasReplaceBlock
	});

	if (!hasSearchBlock || !hasSeparator || !hasReplaceBlock) {
		log.debug(`[경고] SEARCH/REPLACE 블록 형식이 올바르지 않습니다`, {
			hasSearchBlock,
			hasSeparator,
			hasReplaceBlock,
			입력된내용: diffContent,
		});
		throw new Error("SEARCH/REPLACE 블록 형식이 올바르지 않습니다. <<<<<<< SEARCH, =======, >>>>>>> REPLACE 마커가 필요합니다.");
	}

	// 3-1: 라인별 처리 시작
	for (const line of lines) {
		if (line === "<<<<<<< SEARCH") {
			inSearch = true;
			currentSearchContent = "";
			log.debug(`[3-1] SEARCH 블록 시작`, {
				lineNumber: lines.indexOf(line) + 1
			});
			continue;
		}

		if (line === "=======") {
			inSearch = false;
			inReplace = true;
			currentSearchContent = normalizeContent(currentSearchContent);
			
			// 3-2: SEARCH 블록 매칭 시도
			log.debug(`[3-2] SEARCH 블록 매칭 시도`, {
				searchContent: currentSearchContent,
				searchLength: currentSearchContent.length,
				searchHash: generateContentHash(currentSearchContent)
			});

			// SEARCH 블록 내용 로깅
			log.debug(`[SEARCH 블록 내용]`, {
				길이: currentSearchContent.length,
				해시: generateContentHash(currentSearchContent),
				내용: currentSearchContent,
				줄바꿈수: (currentSearchContent.match(/\n/g) || []).length,
			});

			// 빈 SEARCH 블록 처리
			if (!currentSearchContent || currentSearchContent.trim() === "") {
				log.debug(`[경고] 빈 SEARCH 블록이 감지되었습니다. 파일 전체 대체를 원하는 경우 명시적으로 빈 SEARCH 블록을 사용하세요.`);
				throw new Error("빈 SEARCH 블록이 감지되었습니다. 변경하려는 내용을 SEARCH 블록에 명시하세요.");
			}

			// 매칭 전략 정의
			const matchingStrategies = [
				{
					name: "정확한 매칭",
					match: (original: string, search: string, startIndex: number) => {
						const normalizedOriginal = original.normalize('NFKC');
						const normalizedSearch = search.normalize('NFKC');
						const index = normalizedOriginal.indexOf(normalizedSearch, startIndex);
						return index !== -1 ? [index, index + search.length] : null;
					}
				},
				{
					name: "라인 트림 매칭",
					match: (original: string, search: string, startIndex: number) => {
						const searchLines = search.split('\n').map(line => line.trim());
						const originalLines = original.split('\n');
						
						for (let i = 0; i < originalLines.length - searchLines.length + 1; i++) {
							let match = true;
							for (let j = 0; j < searchLines.length; j++) {
								if (originalLines[i + j].trim() !== searchLines[j]) {
									match = false;
									break;
								}
							}
							if (match) {
								const start = originalLines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0);
								const end = start + search.length;
								return [start, end];
							}
						}
						return null;
					}
				},
				{
					name: "블록 앤커 매칭",
					match: (original: string, search: string, startIndex: number) => {
						const searchLines = search.split('\n');
						if (searchLines.length < 3) return null;
						
						const firstLine = searchLines[0].trim();
						const lastLine = searchLines[searchLines.length - 1].trim();
						
						const originalLines = original.split('\n');
						for (let i = 0; i < originalLines.length - searchLines.length + 1; i++) {
							if (originalLines[i].trim() === firstLine && 
								originalLines[i + searchLines.length - 1].trim() === lastLine) {
								const start = originalLines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0);
								const end = start + search.length;
								return [start, end];
							}
						}
						return null;
					}
				}
			];

			// 매칭 시도
			let matchResult = null;
			for (const strategy of matchingStrategies) {
				log.debug(`[${strategy.name} 시도]`);
				matchResult = strategy.match(originalContent, currentSearchContent, lastProcessedIndex);
				if (matchResult) {
					[searchMatchIndex, searchEndIndex] = matchResult;
					log.debug(`[${strategy.name} 성공]`, {
						시작위치: searchMatchIndex,
						끝위치: searchEndIndex,
						매칭된내용: originalContent.slice(searchMatchIndex, searchEndIndex),
					});
					break;
				}
			}

			if (!matchResult) {
				// 이전 변경사항을 고려한 매칭 시도
				const previousChanges = result.slice(lastProcessedIndex);
				const normalizedPrevious = previousChanges.normalize('NFKC');
				const normalizedSearch = currentSearchContent.normalize('NFKC');
				const previousMatchIndex = normalizedPrevious.indexOf(normalizedSearch);
				
				if (previousMatchIndex !== -1) {
					searchMatchIndex = lastProcessedIndex + previousMatchIndex;
					searchEndIndex = searchMatchIndex + currentSearchContent.length;
					log.debug(`[이전 변경사항 매칭 성공]`, {
						시작위치: searchMatchIndex,
						끝위치: searchEndIndex,
						매칭된내용: previousChanges.slice(previousMatchIndex, previousMatchIndex + currentSearchContent.length),
					});
				} else {
					log.debug(`[매칭 실패]`, {
						검색내용: currentSearchContent,
						원본내용: originalContent,
						이전변경사항: previousChanges,
					});
					throw new Error(`SEARCH 블록을 찾을 수 없습니다:\n${currentSearchContent}`);
				}
			}

			// 매칭 위치까지의 내용을 결과에 추가
			result += originalContent.slice(lastProcessedIndex, searchMatchIndex);
			continue;
		}

		if (line === ">>>>>>> REPLACE") {
			currentReplaceContent = normalizeContent(currentReplaceContent);
			
			// 3-3: REPLACE 블록 처리
			log.debug(`[3-3] REPLACE 블록 처리`, {
				replaceContent: currentReplaceContent,
				replaceLength: currentReplaceContent.length,
				replaceHash: generateContentHash(currentReplaceContent),
				matchStart: searchMatchIndex,
				matchEnd: searchEndIndex
			});

			// REPLACE 블록 내용 로깅
			log.debug(`[REPLACE 블록 내용]`, {
				길이: currentReplaceContent.length,
				해시: generateContentHash(currentReplaceContent),
				내용: currentReplaceContent,
				줄바꿈수: (currentReplaceContent.match(/\n/g) || []).length,
			});

			// 매칭된 내용을 REPLACE 내용으로 대체
			if (searchMatchIndex !== -1) {
				result += currentReplaceContent;
				lastProcessedIndex = searchEndIndex;
				log.debug(`[내용 대체 완료]`, {
					대체시작위치: searchMatchIndex,
					대체끝위치: searchEndIndex,
					대체된내용: currentReplaceContent,
				});
			}

			// 다음 블록을 위해 상태 초기화
			inSearch = false;
			inReplace = false;
			currentSearchContent = "";
			currentReplaceContent = "";
			searchMatchIndex = -1;
			searchEndIndex = -1;
			continue;
		}

		// 3-4: 라인 내용 누적
		if (inSearch) {
			currentSearchContent += line + "\n";
		} else if (inReplace) {
			currentReplaceContent += line + "\n";
		}
	}

	// 4-1: 마지막 처리
	if (isFinal && lastProcessedIndex < originalContent.length && !remainderProcessed) {
		result += originalContent.slice(lastProcessedIndex);
		remainderProcessed = true;
		log.debug(`[4-1] 마지막 처리`, {
			remainingLength: originalContent.length - lastProcessedIndex,
			addedContent: originalContent.slice(lastProcessedIndex)
		});
	}

	// 4-2: EOL 형식 변환
	result = result.replace(/\n/g, detectedEOL);
	log.debug(`[4-2] EOL 형식 변환`, {
		originalEOL: detectedEOL,
		resultLength: result.length,
		resultHash: generateContentHash(result)
	});

	// 5-1: 최종 결과 로깅
	log.debug(`[5-1] 최종 결과`, {
		originalLength: originalContent.length,
		resultLength: result.length,
		originalHash: generateContentHash(originalContent),
		resultHash: generateContentHash(result),
		hasChanges: result !== originalContent
	});

	return result;
}

enum MessageState {
	WAITING,
	PROCESSING,
	COMPLETE,
	ERROR
}

interface MessageRule {
	isComplete: (message: string) => boolean;
	normalize: (message: string) => string;
	validate: (message: string) => boolean;
}

const defaultMessageRule: MessageRule = {
	isComplete: (message: string) => {
		return message.includes('<![CDATA[') && 
			   message.includes(']]>') && 
			   message.includes('<<<<<<< SEARCH') && 
			   message.includes('=======') && 
			   message.includes('>>>>>>> REPLACE');
	},
	
	normalize: (message: string) => {
		// CDATA 섹션 추출
		const cdataStart = message.indexOf('<![CDATA[');
		const cdataEnd = message.indexOf(']]>', cdataStart);
		
		if (cdataStart === -1 || cdataEnd === -1) {
			return message;
		}
		
		return message.substring(cdataStart + '<![CDATA['.length, cdataEnd);
	},
	
	validate: (message: string) => {
		// SEARCH/REPLACE 블록 검증
		const searchStart = message.indexOf('<<<<<<< SEARCH');
		const separator = message.indexOf('=======');
		const replaceEnd = message.indexOf('>>>>>>> REPLACE');
		
		return searchStart !== -1 && 
			   separator !== -1 && 
			   replaceEnd !== -1 && 
			   searchStart < separator && 
			   separator < replaceEnd;
	}
};

class MessagePipeline {
	private rules: MessageRule[] = [];
	private processor: MessageProcessor;
	
	constructor() {
		this.processor = new MessageProcessor();
		this.rules.push(defaultMessageRule);
	}
	
	process(message: string): void {
		console.debug(`[MessagePipeline] 메시지 처리 시작`, {
			원본메시지길이: message.length,
			CDATA존재: message.includes('<![CDATA['),
			SEARCH존재: message.includes('<<<<<<< SEARCH'),
			구분자존재: message.includes('======='),
			REPLACE존재: message.includes('>>>>>>> REPLACE')
		});
		
		// 메시지 정규화
		const normalizedMessage = this.normalizeMessage(message);
		console.debug(`[MessagePipeline] 메시지 정규화 완료`, {
			정규화된메시지길이: normalizedMessage.length,
			정규화된메시지: normalizedMessage
		});
		
		// 메시지 검증
		if (!this.validateMessage(normalizedMessage)) {
			console.warn('[MessagePipeline] 메시지 검증 실패');
			return;
		}
		
		// 메시지 처리
		this.processor.processMessage(normalizedMessage);
	}
	
	private normalizeMessage(message: string): string {
		return this.rules.reduce((msg, rule) => rule.normalize(msg), message);
	}
	
	private validateMessage(message: string): boolean {
		return this.rules.every(rule => rule.validate(message));
	}
}

class MessageProcessor {
	private accumulatedMessage: string = '';
	private timeoutId: NodeJS.Timeout | null = null;
	private readonly TIMEOUT_MS = 45000;
	private state: MessageState = MessageState.WAITING;
	private pipeline: MessagePipeline;
	private partialMessageBuffer: string[] = [];
	private readonly MAX_BUFFER_SIZE = 200;
	private isAgentResponseComplete: boolean = false;
	private readonly AGENT_RESPONSE_END_MARKER = '<<<<<<< END_OF_AGENT_RESPONSE >>>>>>>';
	private readonly AGENT_RESPONSE_START_MARKER = '<<<<<<< START_OF_AGENT_RESPONSE >>>>>>>';
	private currentState: MessageState = MessageState.WAITING;
	private readonly MIN_BUFFER_SIZE = 30;
	private bufferSize = this.MIN_BUFFER_SIZE;
	private errorCount = 0;
	private lastErrorTime = 0;
	private readonly ERROR_RESET_INTERVAL = 45000;
	private tempChanges: Map<string, string> = new Map();
	private lastProcessedMessage: string = '';
	private cdataBuffer: string = '';
	private searchReplaceBuffer: string = '';
	private isProcessing: boolean = false;
	private readonly MIN_MESSAGE_LENGTH = 50;
	private readonly MAX_WAIT_TIME = 10000;
	private lastMessageTime: number = 0;
	private readonly MIN_CDATA_LENGTH = 30;
	private readonly MIN_SEARCH_REPLACE_LENGTH = 20;
	private readonly MAX_FILE_SIZE_CHANGE = 20;
	private originalFileSize: number = 0;
	private readonly PRESERVE_WHITESPACE = true;

	constructor() {
		this.pipeline = new MessagePipeline();
		console.debug('[MessageProcessor] 초기화 완료');
	}

	processMessage(message: string): void {
		try {
			if (this.isProcessing) {
				console.debug('[MessageProcessor] 이미 처리 중인 메시지가 있습니다. 버퍼에 추가');
				this.addToBuffer(message);
				return;
			}

			// 최소 메시지 길이 검사 (CDATA나 SEARCH/REPLACE 블록이 있는 경우 예외)
			if (message.length < this.MIN_MESSAGE_LENGTH && 
				!message.includes('partialMessage') && 
				!message.includes('<![CDATA[') && 
				!message.includes('<<<<<<< SEARCH')) {
				console.debug('[MessageProcessor] 메시지가 너무 짧습니다. 버퍼에 추가');
				this.addToBuffer(message);
				return;
			}

			this.isProcessing = true;
			this.lastMessageTime = Date.now();
			console.debug('[MessageProcessor] 메시지 처리 시작', { 
				messageLength: message.length,
				currentState: this.currentState,
				bufferSize: this.partialMessageBuffer.length,
				isPartial: message.includes('partialMessage')
			});

			// CDATA 섹션 처리 개선
			if (message.includes('<![CDATA[')) {
				const cdataStart = message.indexOf('<![CDATA[');
				const cdataEnd = message.indexOf(']]>', cdataStart);
				
				if (cdataEnd === -1) {
					console.debug('[MessageProcessor] 불완전한 CDATA 섹션 감지, 버퍼링 시작');
					this.cdataBuffer = message;
					this.addToBuffer(message);
					this.isProcessing = false;
					return;
				} else if (cdataEnd - cdataStart < this.MIN_CDATA_LENGTH) {
					console.debug('[MessageProcessor] CDATA 섹션이 너무 짧습니다. 버퍼에 추가');
					this.cdataBuffer = message;
					this.addToBuffer(message);
					this.isProcessing = false;
					return;
				} else {
					this.cdataBuffer = '';
				}
			}

			// SEARCH/REPLACE 블록 처리 개선
			if (message.includes('<<<<<<< SEARCH')) {
				const searchStart = message.indexOf('<<<<<<< SEARCH');
				const separator = message.indexOf('=======');
				const replaceEnd = message.indexOf('>>>>>>> REPLACE');
				
				if (separator === -1 || replaceEnd === -1) {
					console.debug('[MessageProcessor] 불완전한 SEARCH/REPLACE 블록 감지, 버퍼링 시작');
					this.searchReplaceBuffer = message;
					this.addToBuffer(message);
					this.isProcessing = false;
					return;
				} else if (replaceEnd - searchStart < this.MIN_SEARCH_REPLACE_LENGTH) {
					console.debug('[MessageProcessor] SEARCH/REPLACE 블록이 너무 짧습니다. 버퍼에 추가');
					this.searchReplaceBuffer = message;
					this.addToBuffer(message);
					this.isProcessing = false;
					return;
				} else {
					this.searchReplaceBuffer = '';
				}
			}

			// 메시지 누적 및 처리
			if (this.isContinuation(this.lastProcessedMessage, message)) {
				console.debug('[MessageProcessor] 연속된 메시지 감지');
				this.accumulatedMessage += message;
			} else {
				this.accumulatedMessage = message;
			}

			// 메시지 완성도 검사
			if (this.isMessageComplete(this.accumulatedMessage)) {
				console.debug('[MessageProcessor] 완전한 메시지 감지, 처리 시작');
				this.handleCompleteMessage(this.accumulatedMessage);
				this.lastProcessedMessage = this.accumulatedMessage;
				this.accumulatedMessage = '';
			} else {
				console.debug('[MessageProcessor] 불완전한 메시지, 버퍼에 추가');
				this.addToBuffer(this.accumulatedMessage);
			}

			this.isProcessing = false;
		} catch (error) {
			console.error('[MessageProcessor] 메시지 처리 중 오류 발생', error);
			this.handleError(error);
			this.isProcessing = false;
		}
	}

	private isContinuation(previous: string, current: string): boolean {
		// CDATA 연속성 검사
		if (previous.includes('<![CDATA[') && !previous.includes(']]>') && 
			!current.startsWith('<![CDATA[')) {
			return true;
		}

		// SEARCH/REPLACE 블록 연속성 검사
		if (previous.includes('<<<<<<< SEARCH')) {
			if (!previous.includes('=======') && !current.startsWith('<<<<<<< SEARCH')) {
				return true;
			}
			if (previous.includes('=======') && !previous.includes('>>>>>>> REPLACE') && 
				!current.startsWith('=======')) {
				return true;
			}
		}

		return false;
	}

	private isMessageComplete(message: string): boolean {
		// CDATA 섹션 검사
		if (message.includes('<![CDATA[') && !message.includes(']]>')) {
			return false;
		}

		// SEARCH/REPLACE 블록 검사
		if (message.includes('<<<<<<< SEARCH')) {
			const searchStart = message.indexOf('<<<<<<< SEARCH');
			const separator = message.indexOf('=======');
			const replaceEnd = message.indexOf('>>>>>>> REPLACE');
			
			if (separator === -1 || replaceEnd === -1 || 
				separator <= searchStart || replaceEnd <= separator) {
				return false;
			}
		}

		return true;
	}

	private handleError(error: Error): void {
		this.errorCount++;
		this.lastErrorTime = Date.now();
		
		// 임시 변경사항 보존
		if (this.tempChanges.size > 0) {
			console.debug('[MessageProcessor] 임시 변경사항 보존', {
				tempChangesCount: this.tempChanges.size
			});
		}

		// 에러 복구 시도
		if (this.errorCount < 3) {
			console.debug('[MessageProcessor] 에러 복구 시도', {
				errorCount: this.errorCount
			});
			this.state = MessageState.WAITING;
		} else {
			console.error('[MessageProcessor] 최대 에러 횟수 초과', {
				error: error.message
			});
			this.state = MessageState.ERROR;
			this.clearBuffer();
		}

		this.adjustBufferSize();
	}

	private addToBuffer(message: string): void {
		if (!message.includes('<![CDATA[') && this.partialMessageBuffer.length === 0) {
			console.debug(`[MessageProcessor] CDATA가 없는 메시지 무시`);
			return;
		}

		if (this.partialMessageBuffer.length >= this.MAX_BUFFER_SIZE) {
			console.warn(`[MessageProcessor] 버퍼 크기 초과로 이전 메시지 제거`);
			this.partialMessageBuffer.shift();
		}

		this.partialMessageBuffer.push(message);
		console.debug(`[MessageProcessor] 메시지 버퍼 상태`, {
			버퍼크기: this.partialMessageBuffer.length,
			누적길이: this.partialMessageBuffer.join('').length,
			CDATA완료: this.hasCompleteCDATASection(this.partialMessageBuffer.join('')),
			블록완료: this.isMessageComplete(this.partialMessageBuffer.join(''))
		});

		// 버퍼에 있는 메시지들을 합쳐서 완성도 검사
		const combinedMessage = this.partialMessageBuffer.join('');
		if (this.isMessageComplete(combinedMessage)) {
			console.debug('[MessageProcessor] 버퍼에서 완전한 메시지 발견, 처리 시작');
			this.handleCompleteMessage(combinedMessage);
			this.clearBuffer();
		} else if (Date.now() - this.lastMessageTime > this.MAX_WAIT_TIME) {
			// 최대 대기 시간 초과 시 버퍼 초기화
			console.warn('[MessageProcessor] 최대 대기 시간 초과, 버퍼 초기화');
			this.clearBuffer();
		}
	}

	private hasCompleteCDATASection(message: string): boolean {
		const cdataStart = message.indexOf('<![CDATA[');
		const cdataEnd = message.indexOf(']]>', cdataStart);
		
		if (cdataStart === -1 || cdataEnd === -1) {
			return false;
		}
		
		const cdataContent = message.substring(cdataStart + 9, cdataEnd);
		return cdataContent.includes('<<<<<<< SEARCH') && 
			   cdataContent.includes('=======') && 
			   cdataContent.includes('>>>>>>> REPLACE');
	}

	private handleCompleteMessage(message: string): void {
		try {
			console.debug(`[MessageProcessor] 메시지 처리 파이프라인 시작`);
			this.pipeline.process(message);
			this.state = MessageState.COMPLETE;
			this.clearBuffer();
			this.isAgentResponseComplete = false;
			console.debug(`[MessageProcessor] 메시지 처리 완료`);
		} catch (error) {
			console.error(`[MessageProcessor] 메시지 처리 중 오류 발생`, error);
			this.state = MessageState.ERROR;
		}
	}

	private clearBuffer(): void {
		console.debug(`[MessageProcessor] 버퍼 초기화 시작`, {
			이전버퍼크기: this.partialMessageBuffer.length
		});
		this.partialMessageBuffer = [];
		this.accumulatedMessage = '';
		this.cdataBuffer = '';
		this.searchReplaceBuffer = '';
		console.debug(`[MessageProcessor] 버퍼 초기화 완료`);
	}

	private adjustBufferSize(): void {
		if (this.errorCount > 0) {
			this.bufferSize = Math.min(this.MAX_BUFFER_SIZE, this.bufferSize + 10);
		} else {
			this.bufferSize = Math.max(this.MIN_BUFFER_SIZE, this.bufferSize - 1);
		}
		console.debug(`[MessageProcessor] 버퍼 크기 조정`, {
			새로운크기: this.bufferSize,
			에러횟수: this.errorCount
		});
	}

	private validateFileSizeChange(originalSize: number, newSize: number): boolean {
		const sizeChange = Math.abs(newSize - originalSize);
		console.debug(`[MessageProcessor] 파일 크기 변화 검증`, {
			원본크기: originalSize,
			새크기: newSize,
			변화량: sizeChange,
			허용범위: this.MAX_FILE_SIZE_CHANGE
		});

		if (sizeChange > this.MAX_FILE_SIZE_CHANGE) {
			console.warn(`[MessageProcessor] 파일 크기 변화가 허용 범위를 초과했습니다`, {
				변화량: sizeChange,
				허용범위: this.MAX_FILE_SIZE_CHANGE
			});
			return false;
		}

		return true;
	}
}

