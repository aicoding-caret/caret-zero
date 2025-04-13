/**
 * Attempts a line-trimmed fallback match for the given search content in the original content.
 * It tries to match `searchContent` lines against a block of lines in `originalContent` starting
 * from `lastProcessedIndex`. Lines are matched by trimming leading/trailing whitespace and ensuring
 * they are identical afterwards.
 *
 * Returns [matchIndexStart, matchIndexEnd] if found, or false if not found.
 */
function lineTrimmedFallbackMatch(originalContent: string, searchContent: string, startIndex: number): [number, number] | false {
	// Split both contents into lines
	const originalLines = originalContent.split("\n")
	const searchLines = searchContent.split("\n")

	// Trim trailing empty line if exists (from the trailing \n in searchContent)
	if (searchLines[searchLines.length - 1] === "") {
		searchLines.pop()
	}

	// Find the line number where startIndex falls
	let startLineNum = 0
	let currentIndex = 0
	while (currentIndex < startIndex && startLineNum < originalLines.length) {
		currentIndex += originalLines[startLineNum].length + 1 // +1 for \n
		startLineNum++
	}

	// For each possible starting position in original content
	for (let i = startLineNum; i <= originalLines.length - searchLines.length; i++) {
		let matches = true

		// Try to match all search lines from this position
		for (let j = 0; j < searchLines.length; j++) {
			const originalTrimmed = originalLines[i + j].trim()
			const searchTrimmed = searchLines[j].trim()

			if (originalTrimmed !== searchTrimmed) {
				matches = false
				break
			}
		}

		// If we found a match, calculate the exact character positions
		if (matches) {
			// Find start character index
			let matchStartIndex = 0
			for (let k = 0; k < i; k++) {
				matchStartIndex += originalLines[k].length + 1 // +1 for \n
			}

			// Find end character index
			let matchEndIndex = matchStartIndex
			for (let k = 0; k < searchLines.length; k++) {
				matchEndIndex += originalLines[i + k].length + 1 // +1 for \n
			}

			return [matchStartIndex, matchEndIndex]
		}
	}

	return false
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
	const originalLines = originalContent.split("\n")
	const searchLines = searchContent.split("\n")

	// Only use this approach for blocks of 3+ lines
	if (searchLines.length < 3) {
		return false
	}

	// Trim trailing empty line if exists
	if (searchLines[searchLines.length - 1] === "") {
		searchLines.pop()
	}

	const firstLineSearch = searchLines[0].trim()
	const lastLineSearch = searchLines[searchLines.length - 1].trim()
	const searchBlockSize = searchLines.length

	// Find the line number where startIndex falls
	let startLineNum = 0
	let currentIndex = 0
	while (currentIndex < startIndex && startLineNum < originalLines.length) {
		currentIndex += originalLines[startLineNum].length + 1
		startLineNum++
	}

	// Look for matching start and end anchors
	for (let i = startLineNum; i <= originalLines.length - searchBlockSize; i++) {
		// Check if first line matches
		if (originalLines[i].trim() !== firstLineSearch) {
			continue
		}

		// Check if last line matches at the expected position
		if (originalLines[i + searchBlockSize - 1].trim() !== lastLineSearch) {
			continue
		}

		// Calculate exact character positions
		let matchStartIndex = 0
		for (let k = 0; k < i; k++) {
			matchStartIndex += originalLines[k].length + 1
		}

		let matchEndIndex = matchStartIndex
		for (let k = 0; k < searchBlockSize; k++) {
			matchEndIndex += originalLines[i + k].length + 1
		}

		return [matchStartIndex, matchEndIndex]
	}

	return false
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
	return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
}

export async function constructNewFileContent(diffContent: string, originalContent: string, isFinal: boolean, logger?: ILogger): Promise<string> {
	// ILogger가 없는 경우 콘솔에만 출력
	const log = logger || console;
	const diffHash = generateContentHash(diffContent);
	const originalHash = generateContentHash(originalContent);
	
	log.debug(`=== constructNewFileContent 디버그 시작 ===`, {
		diffContentLength: diffContent.length,
		originalContentLength: originalContent.length,
		isFinal,
		diffHash,
		originalHash
	});

	// 입력된 diff의 정확한 내용 로깅 - 줄바꿈과 중요 문자 확인용
	log.debug(`[RAW DIFF CONTENT] ${diffContent.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}`);

	// diff의 16진수 로깅 - 숨겨진 문자 확인
	let hexDiff = '';
	for (let i = 0; i < Math.min(diffContent.length, 100); i++) {
		hexDiff += diffContent.charCodeAt(i).toString(16).padStart(2, '0') + ' ';
	}
	log.debug(`[HEX DIFF] ${hexDiff}${diffContent.length > 100 ? '...' : ''}`);

	// 원본 내용의 정확한 로깅
	if (originalContent.length > 200) {
		log.debug(`원본 내용 미리보기: \n시작(100자): ${originalContent.slice(0, 100).replace(/\n/g, '\\n').replace(/\r/g, '\\r')}... \n끝(100자): ...${originalContent.slice(-100).replace(/\n/g, '\\n').replace(/\r/g, '\\r')}`);
	} else {
		log.debug(`원본 내용 전체: \n${originalContent.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}`);
	}

	let result = ""
	let lastProcessedIndex = 0

	let currentSearchContent = ""
	let currentReplaceContent = ""
	let inSearch = false
	let inReplace = false

	let searchMatchIndex = -1
	let searchEndIndex = -1
	
	// 남은 내용 처리 플래그 - 중복 추가 방지
	let remainderProcessed = false
	
	// EOL 처리를 위한 변수 - 파일 시스템에 따라 자동 감지
	const detectedEOL = originalContent.includes('\r\n') ? '\r\n' : '\n'
	log.debug(`감지된 EOL 형식: ${detectedEOL === '\r\n' ? 'CRLF (Windows)' : 'LF (Unix)'}`);

	let lines = diffContent.split("\n")
	log.debug(`처리할 라인 수: ${lines.length}`)

	// If the last line looks like a partial marker but isn't recognized,
	// remove it because it might be incomplete.
	const lastLine = lines[lines.length - 1]
	if (
		lines.length > 0 &&
		(lastLine.startsWith("<") || lastLine.startsWith("=") || lastLine.startsWith(">")) &&
		lastLine !== "<<<<<<< SEARCH" &&
		lastLine !== "=======" &&
		lastLine !== ">>>>>>> REPLACE"
	) {
		lines.pop()
	}

	// 처리할 라인 각각의 16진수 로깅
	log.debug(`[LINES HEX DUMP]`);
	for (let i = 0; i < Math.min(lines.length, 10); i++) {
		let hexLine = '';
		for (let j = 0; j < Math.min(lines[i].length, 20); j++) {
			hexLine += lines[i].charCodeAt(j).toString(16).padStart(2, '0') + ' ';
		}
		log.debug(`  라인 ${i}: '${lines[i].replace(/\n/g, '\\n').replace(/\r/g, '\\r')}' => [${hexLine}${lines[i].length > 20 ? '...' : ''}]`);
	}
	if (lines.length > 10) {
		log.debug(`  ... 추가 ${lines.length - 10}개 라인 ...`);
	}

	for (const line of lines) {
		log.debug(`현재 처리할 라인: '${line.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`);
		
		if (line === "<<<<<<< SEARCH") {
			inSearch = true
			currentSearchContent = ""
			currentReplaceContent = ""
			log.debug(`SEARCH 블록 시작 발견!`);
			continue
		}

		if (line === "=======") {
			inSearch = false
			inReplace = true
			
			// SEARCH 블록의 정확한 내용 로깅 (줄바꿈 및 특수문자 포함)
			log.debug(`SEARCH 블록 RAW 내용: '${currentSearchContent.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`);

			// SEARCH 블록 내용의 16진수 로깅 - 숨겨진 문자 확인
			let hexSearch = '';
			for (let i = 0; i < Math.min(currentSearchContent.length, 50); i++) {
				hexSearch += currentSearchContent.charCodeAt(i).toString(16).padStart(2, '0') + ' ';
			}
			log.debug(`SEARCH 블록 HEX: [${hexSearch}${currentSearchContent.length > 50 ? '...' : ''}]`);
			
			log.debug(`SEARCH 블록 완료, REPLACE 블록 시작`, {
				searchContentLength: currentSearchContent.length,
				searchContentLines: currentSearchContent.split("\n").length,
				searchContentFirstChars: currentSearchContent.length > 0 ? currentSearchContent.slice(0, Math.min(20, currentSearchContent.length)).replace(/\n/g, '\\n').replace(/\r/g, '\\r') : '(empty)',
				searchContentHash: generateContentHash(currentSearchContent)
			});

			// Remove trailing linebreak for adding the === marker
			// if (currentSearchContent.endsWith("\r\n")) {
			// 	currentSearchContent = currentSearchContent.slice(0, -2)
			// } else if (currentSearchContent.endsWith("\n")) {
			// 	currentSearchContent = currentSearchContent.slice(0, -1)
			// }

			if (!currentSearchContent || currentSearchContent.trim() === "") {
				// 빈 SEARCH 블록인지 확인 - 정확한 네이티브 문자열 길이와 트림 후 길이 모두 로깅
				log.debug(`빈 SEARCH 블록 검색 결과:`, {
					currentSearchContent: `'${currentSearchContent}'`,
					length: currentSearchContent.length,
					trimmedLength: currentSearchContent.trim().length,
					hasOnlyWhitespace: currentSearchContent.length > 0 && currentSearchContent.trim() === "",
					charCodes: Array.from(currentSearchContent).map(c => c.charCodeAt(0)),
					is_null_or_empty: !currentSearchContent || currentSearchContent === ""
				});
				
				// Empty search block
				if (originalContent.length === 0) {
					// New file scenario: nothing to match, just start inserting
					searchMatchIndex = 0
					searchEndIndex = 0
					log.debug(`빈 SEARCH 블록 (새 파일 생성 시나리오)`);
				} else {
					// Complete file replacement scenario: treat the entire file as matched
					searchMatchIndex = 0
					searchEndIndex = originalContent.length
					log.debug(`빈 SEARCH 블록 (파일 전체 대체 시나리오) - 원본 내용 ${originalContent.length}바이트 전체 대체 예정`);
				}
			} else {
				// Add check for inefficient full-file search
				// if (currentSearchContent.trim() === originalContent.trim()) {
				// 	throw new Error(
				// 		"The SEARCH block contains the entire file content. Please either:\n" +
				// 			"1. Use an empty SEARCH block to replace the entire file, or\n" +
				// 			"2. Make focused changes to specific parts of the file that need modification.",
				// 	)
				// }

				// Exact search match scenario
				const exactIndex = originalContent.indexOf(currentSearchContent, lastProcessedIndex)
				if (exactIndex !== -1) {
					searchMatchIndex = exactIndex
					searchEndIndex = exactIndex + currentSearchContent.length
					log.debug(`정확한 매칭 성공:`, {
						matchType: "exact",
						searchMatchIndex,
						searchEndIndex,
						matched: true
					});
				} else {
					log.debug(`정확한 매칭 실패, 대체 매칭 시도...`);
					// Attempt fallback line-trimmed matching
					const lineMatch = lineTrimmedFallbackMatch(originalContent, currentSearchContent, lastProcessedIndex)
					if (lineMatch) {
						;[searchMatchIndex, searchEndIndex] = lineMatch
						log.debug(`라인 트림 매칭 성공:`, {
							matchType: "lineTrimmed",
							searchMatchIndex,
							searchEndIndex,
							matched: true
						});
					} else {
						log.debug(`라인 트림 매칭 실패, 블록 앤커 매칭 시도...`);
						// Try block anchor fallback for larger blocks
						const blockMatch = blockAnchorFallbackMatch(originalContent, currentSearchContent, lastProcessedIndex)
						if (blockMatch) {
							;[searchMatchIndex, searchEndIndex] = blockMatch
							log.debug(`블록 앤커 매칭 성공:`, {
								matchType: "blockAnchor",
								searchMatchIndex,
								searchEndIndex,
								matched: true
							});
						} else {
							log.debug(`모든 매칭 시도 실패, 오류 발생`)
							throw new Error(
								`The SEARCH block:\n${currentSearchContent.trimEnd()}\n...does not match anything in the file.`,
							)
						}
					}
				}
			}

			// Output everything up to the match location
			result += originalContent.slice(lastProcessedIndex, searchMatchIndex)
			log.debug(`매칭 위치까지의 내용을 결과에 추가`, {
				lastProcessedIndex,
				searchMatchIndex,
				addedContentLength: searchMatchIndex - lastProcessedIndex
			});
			continue
		}

		if (line === ">>>>>>> REPLACE") {
			// Finished one replace block
			log.debug(`REPLACE 블록 완료`, {
				replaceContentLength: currentReplaceContent.length,
				replaceContentLines: currentReplaceContent.split("\n").length,
				replaceContentFirstChars: currentReplaceContent.length > 0 ? currentReplaceContent.slice(0, Math.min(20, currentReplaceContent.length)).replace(/\n/g, '\\n').replace(/\r/g, '\\r') : '(empty)',
				replaceContentHash: generateContentHash(currentReplaceContent)
			});
			
			// REPLACE 블록 내용의 16진수 로깅 - 숨겨진 문자 확인
			let hexReplace = '';
			for (let i = 0; i < Math.min(currentReplaceContent.length, 50); i++) {
				hexReplace += currentReplaceContent.charCodeAt(i).toString(16).padStart(2, '0') + ' ';
			}
			log.debug(`REPLACE 블록 HEX: [${hexReplace}${currentReplaceContent.length > 50 ? '...' : ''}]`);

			// 버그 수정: 여기서 파일 내용을 제대로 구성
			// 1. searchMatchIndex까지의 내용은 유지
			// 2. 현재 result는 그대로 보존 (이미 searchMatchIndex까지의 내용을 포함)
			// 3. currentReplaceContent를 추가 (마지막 줄바꿈 제거)
			// 4. originalContent의 나머지 부분을 추가 (이전에는 isFinal일 때만 처리)
			if (searchMatchIndex !== -1) {
				// 마지막 줄바꿈 관리 개선
				let processedReplaceContent = currentReplaceContent;
				
				// 원본 텍스트 줄바꿈 상태 확인
				const originalMatchedText = originalContent.slice(searchMatchIndex, searchEndIndex);
				const originalEndsWithLineBreak = originalMatchedText.endsWith(detectedEOL) || originalMatchedText.endsWith('\n');
				
				log.debug(`원본 텍스트 줄바꿈 검사:`, {
					originalMatchedLength: originalMatchedText.length,
					originalEndsWithLineBreak,
					originalLastChars: originalMatchedText.slice(-Math.min(10, originalMatchedText.length)).replace(/\n/g, '\\n').replace(/\r/g, '\\r'),
					replaceLastChars: processedReplaceContent.slice(-Math.min(10, processedReplaceContent.length)).replace(/\n/g, '\\n').replace(/\r/g, '\\r')
				});
				
				// REPLACE 내용 마지막 줄바꿈 처리
				if (processedReplaceContent.endsWith(detectedEOL)) {
					// 원본에 줄바꿈이 없고 REPLACE 내용에만 있는 경우만 제거
					if (!originalEndsWithLineBreak) {
						processedReplaceContent = processedReplaceContent.slice(0, -(detectedEOL.length));
						log.debug(`REPLACE 블록 마지막 줄바꿈 제거 (${detectedEOL === '\r\n' ? 'CRLF' : 'LF'})`);
					} else {
						log.debug(`REPLACE 블록 마지막 줄바꿈 유지 (원본과 일치)`);
					}
				} else if (processedReplaceContent.endsWith('\n')) {
					// 원본에 줄바꿈이 없고 REPLACE 내용에만 있는 경우만 제거
					if (!originalEndsWithLineBreak) {
						processedReplaceContent = processedReplaceContent.slice(0, -1);
						log.debug(`REPLACE 블록 마지막 줄바꿈 제거 (LF)`);
					} else {
						log.debug(`REPLACE 블록 마지막 줄바꿈 유지 (원본과 일치)`);
					}
				}

				// 이전 버전의 result 임시 저장 (검증용)
				const prevResult = result;
				
				// 지금까지 누적된 REPLACE 내용 추가
				result += processedReplaceContent;
				
				// *** 핵심 개선: 중간 청크에서도 나머지 원본 내용 추가 ***
				// 이 단계에서 나머지 모든 내용을 추가하여 각 블록 처리가 완전한 파일 상태를 유지하도록 함
				const remainingContent = originalContent.slice(searchEndIndex);
				if (remainingContent.length > 0) {
					log.debug(`블록 간 나머지 원본 내용 추가:`, {
						길이: remainingContent.length,
						미리보기: remainingContent.length > 100 ? 
							`${remainingContent.slice(0, 50)}...${remainingContent.slice(-50)}` : 
							remainingContent
					});
					result += remainingContent;
					remainderProcessed = true; // 남은 내용 처리 완료 표시
				}
				
				// 변경 결과 로깅
				log.debug(`[개선된 처리] REPLACE 블록 처리 완료:`, {
					이전결과길이: prevResult.length,
					새결과길이: result.length,
					processedReplaceContentLength: processedReplaceContent.length
				});
			}

			// Advance lastProcessedIndex to after the matched section
			lastProcessedIndex = searchEndIndex
			log.debug(`lastProcessedIndex 이동: ${lastProcessedIndex}`);

			// Reset for next block
			inSearch = false
			inReplace = false
			currentSearchContent = ""
			currentReplaceContent = ""
			searchMatchIndex = -1
			searchEndIndex = -1
			continue
		}

		// Accumulate content for search or replace
		// (currentReplaceContent is not being used for anything right now since we directly append to result.)
		// (We artificially add a linebreak since we split on \n at the beginning. In order to not include a trailing linebreak in the final search/result blocks we need to remove it before using them. This allows for partial line matches to be correctly identified.)
		// NOTE: search/replace blocks must be arranged in the order they appear in the file due to how we build the content using lastProcessedIndex. We also cannot strip the trailing newline since for non-partial lines it would remove the linebreak from the original content. (If we remove end linebreak from search, then we'd also have to remove it from replace but we can't know if it's a partial line or not since the model may be using the line break to indicate the end of the block rather than as part of the search content.) We require the model to output full lines in order for our fallbacks to work as well.
		if (inSearch) {
			// SEARCH 블록에 라인 추가 전/후 로깅
			const beforeLength = currentSearchContent.length;
			currentSearchContent += line + "\n"
			log.debug(`SEARCH 블록에 라인 추가: '${line.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`, {
				이전길이: beforeLength,
				현재길이: currentSearchContent.length,
				누적라인수: currentSearchContent.split('\n').length
			});
		} else if (inReplace) {
			// REPLACE 블록에 라인 추가 전/후 로깅
			const beforeLength = currentReplaceContent.length;
			currentReplaceContent += line + "\n"
			log.debug(`REPLACE 블록에 라인 추가: '${line.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`, {
				이전길이: beforeLength,
				현재길이: currentReplaceContent.length,
				누적라인수: currentReplaceContent.split('\n').length
			});
			
			// 수정된 로직: REPLACE 내용을 임시 변수에 저장
			// 이후 블록 전체가 처리된 후 한 번에 파일 내용을 구성
			if (searchMatchIndex !== -1) {
				log.debug(`[개선된 처리] REPLACE 라인 누적: "${line}"`, {
					라인번호: currentReplaceContent.split('\n').length,
					현재누적길이: currentReplaceContent.length,
					searchMatchIndex: searchMatchIndex,
					searchEndIndex: searchEndIndex
				});
				// 여기서는 currentReplaceContent에만 누적하고 result에는 아직 추가하지 않음
				// 블록 완료 후 ">>>>>>> REPLACE" 처리 시 일괄 대체
			}
		}
	}

	// 최종 정리 단계에서 남은 내용 추가 (모든 블록 처리 완료 후 최종 확인)
	// 이미 각 블록 처리 후 result에 원본 내용을 추가했지만, 안전장치로 유지
	if (isFinal && lastProcessedIndex < originalContent.length && !remainderProcessed) {
		log.debug(`[파일 종료 처리] 마지막 확인: 남은 원본 내용 있음`, {
			lastProcessedIndex,
			remainingContentLength: originalContent.length - lastProcessedIndex,
			현재Result길이: result.length,
			현재ResultHash: generateContentHash(result),
			remainderProcessed: remainderProcessed,
			추가할내용미리보기: originalContent.length - lastProcessedIndex > 100 ? 
				`${originalContent.slice(lastProcessedIndex, lastProcessedIndex + 50)}...${originalContent.slice(originalContent.length - 50)}` : 
				originalContent.slice(lastProcessedIndex)
		});
		
		// 블록 처리 중 마지막 내용이 추가되지 않은 경우에 대한 안전장치
		result += originalContent.slice(lastProcessedIndex);
		log.debug(`[파일 종료 처리] 마지막 내용 추가 완료:`, {
			lastProcessedIndex,
			originalContentLength: originalContent.length,
			remainderLength: originalContent.length - lastProcessedIndex
		});
	} else if (isFinal && remainderProcessed) {
		// 이미 남은 내용이 처리된 경우 로그 추가
		log.debug(`[파일 종료 처리] 남은 내용이 이미 처리되어 중복 추가 하지 않음`, {
			lastProcessedIndex,
			현재Result길이: result.length,
			현재ResultHash: generateContentHash(result)
		});
	}

	const resultHash = generateContentHash(result);
	log.debug(`constructNewFileContent 완료`, {
		originalContentLength: originalContent.length,
		resultContentLength: result.length,
		change: result.length - originalContent.length > 0 ? `+${result.length - originalContent.length}` : result.length - originalContent.length,
		originalHash: generateContentHash(originalContent),
		resultHash
	});

	// 파일 내용 비교
	log.debug(`파일 내용 비교 (diff result)`, {
		beforeLines: originalContent.split('\n').length,
		afterLines: result.split('\n').length,
		beforeSize: originalContent.length,
		afterSize: result.length,
		changeSize: result.length - originalContent.length,
		hash: resultHash
	});

	// 최종 결과 요약 로깅
	log.debug(`=== constructNewFileContent 완료 ===`, {
		원본길이: originalContent.length,
		결과길이: result.length,
		원본해시: originalHash,
		결과해시: generateContentHash(result),
		isFinal: isFinal,
		성공여부: '처리 완료'
	});
	
	return result
}
