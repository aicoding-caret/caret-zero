/**
 * Attempts a line-trimmed fallback match for the given search content in the original content.
 * It tries to match `searchContent` lines against a block of lines in `originalContent` starting
 * from `lastProcessedIndex`. Lines are matched by trimming leading/trailing whitespace and ensuring
 * they are identical afterwards.
 *
 * Returns [matchIndexStart, matchIndexEnd] if found, or false if not found.
 */
function normalizeContent(content: string): string {
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

export async function constructNewFileContent(
	diffContent: string,
	originalContent: string,
	isFinal: boolean,
	logger?: ILogger,
): Promise<string> {
	// ILogger가 없는 경우 콘솔에만 출력
	const log = logger || console
	
	// diff 내용 정규화
	diffContent = normalizeDiffContent(diffContent);
	log.debug(`[정규화된 diff 내용]`, {
		내용: diffContent,
		줄바꿈수: (diffContent.match(/\n/g) || []).length,
		해시: generateContentHash(diffContent),
		SEARCH존재: diffContent.includes('<<<<<<< SEARCH'),
		구분자존재: diffContent.includes('======='),
		REPLACE존재: diffContent.includes('>>>>>>> REPLACE'),
	});
	
	// 내용 정규화
	diffContent = normalizeContent(diffContent);
	originalContent = normalizeContent(originalContent);

	// EOL 형식 감지 및 유지
	const detectedEOL = originalContent.includes("\r\n") ? "\r\n" : "\n";
	log.debug(`감지된 EOL 형식: ${detectedEOL === "\r\n" ? "CRLF (Windows)" : "LF (Unix)"}`);

	// 원본 파일 내용 로깅
	log.debug(`[원본 파일 내용]`, {
		길이: originalContent.length,
		해시: generateContentHash(originalContent),
		내용: originalContent,
		줄바꿈수: (originalContent.match(/\n/g) || []).length,
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

	const lines = diffContent.split("\n");
	log.debug(`처리할 라인 수: ${lines.length}`);
	log.debug(`[입력된 diff 내용]`, {
		내용: diffContent,
		줄바꿈수: (diffContent.match(/\n/g) || []).length,
	});

	// 마지막 라인이 부분적인 마커인 경우 제거
	const lastLine = lines[lines.length - 1];
	if (lines.length > 0 &&
		(lastLine.startsWith("<") || lastLine.startsWith("=") || lastLine.startsWith(">")) &&
		lastLine !== "<<<<<<< SEARCH" &&
		lastLine !== "=======" &&
		lastLine !== ">>>>>>> REPLACE") {
		lines.pop();
		log.debug(`[부분 마커 제거]`, {
			제거된라인: lastLine,
		});
	}

	// SEARCH/REPLACE 블록 형식 검증
	const hasSearchBlock = lines.includes("<<<<<<< SEARCH");
	const hasSeparator = lines.includes("=======");
	const hasReplaceBlock = lines.includes(">>>>>>> REPLACE");

	log.debug(`[SEARCH/REPLACE 블록 형식 검증]`, {
		SEARCH블록존재: hasSearchBlock,
		구분자존재: hasSeparator,
		REPLACE블록존재: hasReplaceBlock,
		전체라인수: lines.length,
		라인내용: lines,
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

	for (const line of lines) {
		if (line === "<<<<<<< SEARCH") {
			inSearch = true;
			currentSearchContent = "";
			currentReplaceContent = "";
			log.debug(`[SEARCH 블록 시작]`, {
				현재라인: lines.indexOf(line) + 1,
				총라인수: lines.length,
			});
			continue;
		}

		if (line === "=======") {
			inSearch = false;
			inReplace = true;

			// SEARCH 블록 내용 정규화
			currentSearchContent = normalizeContent(currentSearchContent);

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

			// 정확한 매칭 시도 (NFKC 정규화 적용)
			const normalizedOriginal = originalContent.normalize('NFKC');
			const normalizedSearch = currentSearchContent.normalize('NFKC');
			const exactIndex = normalizedOriginal.indexOf(normalizedSearch, lastProcessedIndex);
			
			if (exactIndex !== -1) {
				searchMatchIndex = exactIndex;
				searchEndIndex = exactIndex + currentSearchContent.length;
				log.debug(`[정확한 매칭 성공]`, {
					시작위치: searchMatchIndex,
					끝위치: searchEndIndex,
					매칭된내용: originalContent.slice(searchMatchIndex, searchEndIndex),
				});
			} else {
				// 대체 매칭 시도
				const lineMatch = lineTrimmedFallbackMatch(originalContent, currentSearchContent, lastProcessedIndex);
				if (lineMatch) {
					[searchMatchIndex, searchEndIndex] = lineMatch;
					log.debug(`[라인 트림 매칭 성공]`, {
						시작위치: searchMatchIndex,
						끝위치: searchEndIndex,
						매칭된내용: originalContent.slice(searchMatchIndex, searchEndIndex),
					});
				} else {
					const blockMatch = blockAnchorFallbackMatch(originalContent, currentSearchContent, lastProcessedIndex);
					if (blockMatch) {
						[searchMatchIndex, searchEndIndex] = blockMatch;
						log.debug(`[블록 앤커 매칭 성공]`, {
							시작위치: searchMatchIndex,
							끝위치: searchEndIndex,
							매칭된내용: originalContent.slice(searchMatchIndex, searchEndIndex),
						});
					} else {
						// 이전 변경사항을 고려한 매칭 시도
						const previousChanges = result.slice(lastProcessedIndex);
						const normalizedPrevious = previousChanges.normalize('NFKC');
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
				}
			}

			// 매칭 위치까지의 내용을 결과에 추가
			result += originalContent.slice(lastProcessedIndex, searchMatchIndex);
			continue;
		}

		if (line === ">>>>>>> REPLACE") {
			// REPLACE 블록 내용 정규화
			currentReplaceContent = normalizeContent(currentReplaceContent);

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

		// SEARCH 또는 REPLACE 블록에 라인 추가
		if (inSearch) {
			currentSearchContent += line + "\n";
		} else if (inReplace) {
			currentReplaceContent += line + "\n";
		}
	}

	// 마지막 처리
	if (isFinal && lastProcessedIndex < originalContent.length && !remainderProcessed) {
		result += originalContent.slice(lastProcessedIndex);
		remainderProcessed = true;
		log.debug(`[마지막 처리]`, {
			남은내용길이: originalContent.length - lastProcessedIndex,
			추가된내용: originalContent.slice(lastProcessedIndex),
		});
	}

	// 결과의 줄바꿈 문자를 원본 파일의 형식으로 변환
	result = result.replace(/\n/g, detectedEOL);

	// 최종 결과 로깅
	log.debug(`[최종 결과]`, {
		원본길이: originalContent.length,
		결과길이: result.length,
		원본해시: generateContentHash(originalContent),
		결과해시: generateContentHash(result),
		변경사항: result !== originalContent ? "변경됨" : "변경없음",
	});

	return result;
}
