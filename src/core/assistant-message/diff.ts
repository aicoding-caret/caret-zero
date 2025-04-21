/**
 * Attempts a line-trimmed fallback match for the given search content in the original content.
 * It tries to match `searchContent` lines against a block of lines in `originalContent` starting
 * from `lastProcessedIndex`. Lines are matched by trimming leading/trailing whitespace and ensuring
 * they are identical afterwards.
 *
 * Returns [matchIndexStart, matchIndexEnd] if found, or false if not found.
 */
import { ILogger } from "../../services/logging/ILogger"; // Import ILogger
import * as crypto from "crypto";

function normalizeContent(content: string): string {
	const originalInput = content;
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
	console.debug(`[normalizeContent] Input (start): "${originalInput.substring(0, 50)}...", Output (end): "${content.substring(0, 50)}..."`);
	return content;
}

function lineTrimmedFallbackMatch(originalContent: string, searchContent: string, startIndex: number): [number, number] | false {
	console.debug(`[lineTrimmedFallbackMatch] Attempting match... startIndex: ${startIndex}`);
	originalContent = normalizeContent(originalContent);
	searchContent = normalizeContent(searchContent);
	const originalLines = originalContent.split("\n");
	const searchLines = searchContent.split("\n");
	if (searchLines[searchLines.length - 1] === "") {
		searchLines.pop();
	}
	let startLineNum = 0;
	let currentIndex = 0;
	while (currentIndex < startIndex && startLineNum < originalLines.length) {
		currentIndex += originalLines[startLineNum].length + 1;
		startLineNum++;
	}
	for (let i = startLineNum; i <= originalLines.length - searchLines.length; i++) {
		let matches = true;
		for (let j = 0; j < searchLines.length; j++) {
			const originalTrimmed = originalLines[i + j].trim();
			const searchTrimmed = searchLines[j].trim();
			if (originalTrimmed.normalize('NFKC') !== searchTrimmed.normalize('NFKC')) {
				matches = false;
				break;
			}
		}
		if (matches) {
            let matchStartIndex = 0;
			for (let k = 0; k < i; k++) {
				matchStartIndex += originalLines[k].length + 1;
			}
			let matchEndIndex = matchStartIndex;
			for (let k = 0; k < searchLines.length; k++) {
				matchEndIndex += originalLines[i + k].length + 1;
			}
            console.debug(`[lineTrimmedFallbackMatch] Match found: [${matchStartIndex}, ${matchEndIndex}]`);
			return [matchStartIndex, matchEndIndex];
		}
	}
    console.debug(`[lineTrimmedFallbackMatch] No match found.`);
	return false;
}

function blockAnchorFallbackMatch(originalContent: string, searchContent: string, startIndex: number): [number, number] | false {
    console.debug(`[blockAnchorFallbackMatch] Attempting match... startIndex: ${startIndex}`);
    originalContent = normalizeContent(originalContent);
	searchContent = normalizeContent(searchContent);
	const originalLines = originalContent.split("\n");
	const searchLines = searchContent.split("\n");
	if (searchLines[searchLines.length - 1] === "") {
		searchLines.pop();
	}
	if (searchLines.length < 3) {
        console.debug(`[blockAnchorFallbackMatch] Block too short (< 3 lines).`);
		return false;
	}
	const firstLine = searchLines[0].trim();
	const lastLine = searchLines[searchLines.length - 1].trim();
	let startLineNum = 0;
	let currentIndex = 0;
	while (currentIndex < startIndex && startLineNum < originalLines.length) {
		currentIndex += originalLines[startLineNum].length + 1;
		startLineNum++;
	}
	for (let i = startLineNum; i <= originalLines.length - searchLines.length; i++) {
		if (originalLines[i].trim().normalize('NFKC') === firstLine.normalize('NFKC') &&
			originalLines[i + searchLines.length - 1].trim().normalize('NFKC') === lastLine.normalize('NFKC')) {
			let matches = true;
			// Optional: Add check for intermediate lines if needed, currently checks only first/last
            /*
			for (let j = 1; j < searchLines.length - 1; j++) {
				if (originalLines[i + j].trim().normalize('NFKC') !== searchLines[j].trim().normalize('NFKC')) {
					matches = false;
                    console.debug(`[blockAnchorFallbackMatch] Intermediate line mismatch at index ${j}`);
					break;
				}
			}
            */
			if (matches) { // Assuming intermediate check passes or is skipped
				let matchStartIndex = 0;
				for (let k = 0; k < i; k++) {
					matchStartIndex += originalLines[k].length + 1;
				}
				let matchEndIndex = matchStartIndex;
				for (let k = 0; k < searchLines.length; k++) {
					matchEndIndex += originalLines[i + k].length + 1;
				}
                console.debug(`[blockAnchorFallbackMatch] Match found: [${matchStartIndex}, ${matchEndIndex}]`);
				return [matchStartIndex, matchEndIndex];
			}
		}
	}
    console.debug(`[blockAnchorFallbackMatch] No match found.`);
	return false;
}

function generateContentHash(content: string): string {
	return crypto.createHash("sha256").update(content).digest("hex").substring(0, 8);
}

function normalizeDiffContent(content: string, log: ILogger | Console = console): string {
	const originalInput = content;
	log.debug(`[normalizeDiffContent] Input: "${originalInput.substring(0, 100)}..."`);

	// CDATA 섹션 처리 (단순화된 로깅)
	if (content.includes('<![CDATA[')) {
        log.debug(`[normalizeDiffContent] CDATA detected, attempting processing...`);
		const startIndex = content.indexOf('<![CDATA[');
		const endIndex = content.indexOf(']]>', startIndex);
		if (startIndex !== -1 && endIndex !== -1) {
			content = content.substring(startIndex + '<![CDATA['.length, endIndex);
            log.debug(`[normalizeDiffContent] Extracted content from CDATA.`);
		} else {
            log.warn(`[normalizeDiffContent] Incomplete CDATA section found.`);
            // Keep original content if CDATA is incomplete, avoid complex reconstruction logic for now
		}
	}

	// HTML 엔티티 디코딩 (단순화된 로깅)
    const contentBeforeHtmlDecode = content;
	content = content.replace(/</g, '<')
					.replace(/>/g, '>')
					.replace(/&/g, '&');
    if (content !== contentBeforeHtmlDecode) {
        log.debug(`[normalizeDiffContent] HTML entities decoded.`);
    }

	// 줄바꿈 정규화 (단순화된 로깅)
    const contentBeforeEolNorm = content;
	content = content.replace(/\r\n/g, '\n');
    if (content !== contentBeforeEolNorm) {
        log.debug(`[normalizeDiffContent] EOL normalized to LF.`);
    }

	log.debug(`[normalizeDiffContent] Final Output: "${content.substring(0, 100)}..."`);
	return content;
}

export async function constructNewFileContent(
    diffContent: string,
    originalContent: string,
    isFinal: boolean,
    logger?: ILogger | Console // Allow Console type for direct testing
): Promise<string> {
	const log = logger || console;
	log.debug(`[constructNewFileContent] --- Function Start ---`);
	log.debug(`[constructNewFileContent] Initial diffContent (start): "${diffContent.substring(0, 100)}..."`);
	log.debug(`[constructNewFileContent] Initial originalContent (start): "${originalContent.substring(0, 100)}..."`);

	// diff 내용 정규화
	const diffContentBeforeNormDiff = diffContent;
	diffContent = normalizeDiffContent(diffContent, log);
	if (diffContent !== diffContentBeforeNormDiff) {
		log.debug(`[constructNewFileContent] diffContent after normalizeDiffContent: "${diffContent.substring(0, 100)}..."`);
	} else {
        log.debug(`[constructNewFileContent] diffContent unchanged after normalizeDiffContent.`);
    }
	
	// 내용 정규화
	const diffContentBeforeNormContent = diffContent;
	diffContent = normalizeContent(diffContent); // diffContent에도 normalizeContent 적용
    if (diffContent !== diffContentBeforeNormContent) {
	    log.debug(`[constructNewFileContent] diffContent after normalizeContent: "${diffContent.substring(0, 100)}..."`);
    } else {
        log.debug(`[constructNewFileContent] diffContent unchanged after normalizeContent.`);
    }

	const originalContentBeforeNormContent = originalContent;
	originalContent = normalizeContent(originalContent); // originalContent에도 normalizeContent 적용
    if (originalContent !== originalContentBeforeNormContent) {
	    log.debug(`[constructNewFileContent] originalContent after normalizeContent: "${originalContent.substring(0, 100)}..."`);
    } else {
        log.debug(`[constructNewFileContent] originalContent unchanged after normalizeContent.`);
    }

	// EOL 형식 감지 및 유지
	const detectedEOL = originalContent.includes("\r\n") ? "\r\n" : "\n";
	log.debug(`[constructNewFileContent] Detected EOL: ${detectedEOL === "\r\n" ? "CRLF" : "LF"}`);

	log.debug(`[constructNewFileContent] Normalized originalContent length: ${originalContent.length}, hash: ${generateContentHash(originalContent)}`);

	let result: string = "";
	let lastProcessedIndex: number = 0;
	let currentSearchContent: string = "";
	let currentReplaceContent: string = "";
	let inSearch: boolean = false;
	let inReplace: boolean = false;
	let searchMatchIndex: number = -1;
	let searchEndIndex: number = -1;
	let remainderProcessed: boolean = false;

    log.debug(`[constructNewFileContent] Splitting normalized diffContent by '\\n'...`);
	const lines: string[] = diffContent.split("\n");
	log.debug(`[constructNewFileContent] Number of lines: ${lines.length}`);
	log.debug(`[constructNewFileContent] First 10 lines (or fewer):`, lines.slice(0, 10).map((l, i) => `${i}: "${l}"`)); 

	// 부분 마커 제거 로직은 유지
	const lastLine = lines[lines.length - 1];
	if (lines.length > 0 &&
		(lastLine.startsWith("<") || lastLine.startsWith("=") || lastLine.startsWith(">")) &&
		!["^SEARCH^", "^======^", "^REPLACE^"].includes(lastLine.trim())) { // Use trim here too
		lines.pop();
        log.warn(`[constructNewFileContent] Removed potential partial marker line: "${lastLine}"`);
	}

	// SEARCH/REPLACE 블록 형식 검증 (유연한 방식 유지)
    log.debug(`[constructNewFileContent] Verifying marker presence...`);
	const hasSearchBlock = lines.some(line => line.includes("^SEARCH^"));
	const hasSeparator = lines.some(line => line.includes("^======^"));
	const hasReplaceBlock = lines.some(line => line.includes("^REPLACE^"));
	log.debug(`[constructNewFileContent] Marker check results: hasSearch=${hasSearchBlock}, hasSeparator=${hasSeparator}, hasReplace=${hasReplaceBlock}`);

	if (!hasSearchBlock || !hasSeparator || !hasReplaceBlock) {
		log.error(`[constructNewFileContent] ERROR: Invalid SEARCH/REPLACE block format. Markers missing.`, { hasSearchBlock, hasSeparator, hasReplaceBlock });
        log.error(`[constructNewFileContent] Failing diffContent was:\n${diffContent}`);
		throw new Error("SEARCH/REPLACE 블록 형식이 올바르지 않습니다. ^SEARCH^, =======, ^REPLACE^ 마커가 필요합니다.");
	}

    log.debug(`[constructNewFileContent] Starting line-by-line processing...`);
	for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        log.debug(`[Loop ${i}] Processing line: "${line}" (trimmed: "${trimmedLine}") | State: inSearch=${inSearch}, inReplace=${inReplace}`);

        if (trimmedLine === "^SEARCH^") { 
			if (inSearch || inReplace) log.warn(`[Loop ${i}] Unexpected ^SEARCH^ marker found while already in a block.`);
			inSearch = true;
			inReplace = false; 
			currentSearchContent = ""; // Reset content
			currentReplaceContent = "";
            log.debug(`[Loop ${i}] ---> Entered SEARCH block`);
			continue;
		}

		if (trimmedLine === "^======^") { 
            if (!inSearch) { 
                log.error(`[Loop ${i}] ERROR: ^======^ marker found without preceding ^SEARCH^ block.`);
                throw new Error("잘못된 형식: ^======^ 마커가 ^SEARCH^ 블록 없이 나타났습니다.");
            }
			inSearch = false;
			inReplace = true;
            const accumulatedSearchBeforeNormalize = currentSearchContent;
			currentSearchContent = normalizeContent(currentSearchContent); // Normalize accumulated search content
            log.debug(`[Loop ${i}] ---> Found SEPARATOR. Normalized SEARCH content (start): "${currentSearchContent.substring(0,50)}..."`);

			if (!currentSearchContent || currentSearchContent.trim() === "") {
                log.error(`[Loop ${i}] ERROR: Empty SEARCH block detected.`);
				throw new Error("빈 SEARCH 블록이 감지되었습니다.");
			}

			// 매칭 로직
			const normalizedOriginal = originalContent; 
			const normalizedSearch = currentSearchContent; 
            log.debug(`[Loop ${i}] Attempting exact match for SEARCH block starting from index ${lastProcessedIndex}...`);
			const exactIndex = normalizedOriginal.indexOf(normalizedSearch, lastProcessedIndex);

			if (exactIndex !== -1) {
				searchMatchIndex = exactIndex;
				searchEndIndex = exactIndex + currentSearchContent.length;
                log.debug(`[Loop ${i}] Exact match SUCCESS: [${searchMatchIndex}, ${searchEndIndex}]`);
			} else {
                log.debug(`[Loop ${i}] Exact match failed. Trying fallback matches...`);
				const lineMatch = lineTrimmedFallbackMatch(originalContent, currentSearchContent, lastProcessedIndex);
				if (lineMatch) {
					[searchMatchIndex, searchEndIndex] = lineMatch;
                    log.debug(`[Loop ${i}] Line-trimmed match SUCCESS: [${searchMatchIndex}, ${searchEndIndex}]`);
				} else {
					const blockMatch = blockAnchorFallbackMatch(originalContent, currentSearchContent, lastProcessedIndex);
					if (blockMatch) {
						[searchMatchIndex, searchEndIndex] = blockMatch;
                        log.debug(`[Loop ${i}] Block-anchor match SUCCESS: [${searchMatchIndex}, ${searchEndIndex}]`);
					} else {
                        log.error(`[Loop ${i}] ERROR: All matching strategies failed for SEARCH block.`, { searchContent: currentSearchContent });
						throw new Error(`SEARCH 블록을 찾을 수 없습니다:\n${currentSearchContent}`);
					}
				}
			}
            const sliceToAdd = originalContent.slice(lastProcessedIndex, searchMatchIndex);
			result += sliceToAdd;
            log.debug(`[Loop ${i}] Appended content before match: ${sliceToAdd.length} chars. Result length: ${result.length}`);
			continue; // Move to next line after finding separator and match
		}

		if (trimmedLine === "^REPLACE^") { 
            if (!inReplace) { 
                 log.error(`[Loop ${i}] ERROR: ^REPLACE^ marker found without preceding ^======^ marker.`);
                throw new Error("잘못된 형식: ^REPLACE^ 마커가 ^======^ 블록 없이 나타났습니다.");
            }
			inReplace = false; // End of replace block state
            const accumulatedReplaceBeforeNormalize = currentReplaceContent;
			currentReplaceContent = normalizeContent(currentReplaceContent); // Normalize accumulated replace content
            log.debug(`[Loop ${i}] ---> Found REPLACE marker. Normalized REPLACE content (start): "${currentReplaceContent.substring(0,50)}..."`);

			if (searchMatchIndex !== -1 && searchEndIndex !== -1) { // Ensure match was found
				result += currentReplaceContent;
				lastProcessedIndex = searchEndIndex;
                log.debug(`[Loop ${i}] Applied replacement. New lastProcessedIndex: ${lastProcessedIndex}. Result length: ${result.length}`);
			} else {
                 log.error(`[Loop ${i}] ERROR: ^REPLACE^ marker found, but no preceding match was successful (searchMatchIndex: ${searchMatchIndex}).`);
                throw new Error("잘못된 형식: 매칭된 내용 없이 ^REPLACE^ 마커가 나타났습니다.");
            }

			// Reset for next potential block
			currentSearchContent = "";
			currentReplaceContent = "";
			searchMatchIndex = -1;
			searchEndIndex = -1;
			continue; // Move to next line after processing REPLACE marker
		}

		// Accumulate content if inside a block
		if (inSearch) {
            // Append line, handling potential leading newline if marker was trimmed
            currentSearchContent += (currentSearchContent === "" && line !== trimmedLine ? "" : "\n") + line;
            // log.debug(`[Loop ${i}] Accumulated SEARCH: "${currentSearchContent.substring(currentSearchContent.length - 60)}"`); // Log tail
		} else if (inReplace) {
			currentReplaceContent += (currentReplaceContent === "" && line !== trimmedLine ? "" : "\n") + line;
            // log.debug(`[Loop ${i}] Accumulated REPLACE: "${currentReplaceContent.substring(currentReplaceContent.length - 60)}"`); // Log tail
		} else {
            log.warn(`[Loop ${i}] Line processed outside of any block: "${line}"`);
            // Decide how to handle this - ignore? Append to result? Error?
            // Let's ignore for now, assuming valid diffs always enclose content.
        }
	}

    log.debug(`[constructNewFileContent] Finished processing lines. Final state: inSearch=${inSearch}, inReplace=${inReplace}, lastProcessedIndex=${lastProcessedIndex}`);

    // Check for unterminated blocks
    if (inSearch) {
        log.error(`[constructNewFileContent] ERROR: File ended while still in SEARCH block.`);
        throw new Error("Diff content ended unexpectedly within a SEARCH block.");
    }
    if (inReplace) {
        log.error(`[constructNewFileContent] ERROR: File ended while still in REPLACE block (missing ^REPLACE^ marker?).`);
        throw new Error("Diff content ended unexpectedly within a REPLACE block.");
    }


	// 마지막 처리
	if (isFinal && lastProcessedIndex < originalContent.length && !remainderProcessed) {
        const remainingContent = originalContent.slice(lastProcessedIndex);
		result += remainingContent;
		remainderProcessed = true;
        log.debug(`[constructNewFileContent] Appended remaining original content: ${remainingContent.length} chars. Final result length: ${result.length}`);
	} else if (isFinal && !remainderProcessed) {
         log.debug(`[constructNewFileContent] No remaining original content to append or already processed.`);
    }

	// EOL 변환
    const resultBeforeEol = result;
	result = result.replace(/\n/g, detectedEOL);
    if (result !== resultBeforeEol) {
        log.debug(`[constructNewFileContent] Converted EOL back to ${detectedEOL === "\r\n" ? "CRLF" : "LF"}.`);
    }

    log.debug(`[constructNewFileContent] --- Function End --- Returning final result. Length: ${result.length}`);
	return result;
}

// --- 테스트 실행 코드 (제거 - 이 파일은 라이브러리로 사용됨) ---
// async function runTest() { ... }
// runTest();
