// test_diff_function.js
const fs = require('fs').promises;
const path = require('path');
const crypto = require("crypto"); // crypto 모듈 추가

// --- diff.ts 에서 필요한 함수들 복사 시작 ---

function normalizeContent(content) {
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

function lineTrimmedFallbackMatch(originalContent, searchContent, startIndex) {
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
			// Match end index should be exclusive, but the logic includes the last newline.
            // Adjust if necessary based on how the original function handles it.
            // Let's assume the original logic is correct for now.
			return [matchStartIndex, matchEndIndex];
		}
	}
	return false;
}

function blockAnchorFallbackMatch(originalContent, searchContent, startIndex) {
    originalContent = normalizeContent(originalContent);
	searchContent = normalizeContent(searchContent);
	const originalLines = originalContent.split("\n");
	const searchLines = searchContent.split("\n");
	if (searchLines[searchLines.length - 1] === "") {
		searchLines.pop();
	}
	if (searchLines.length < 3) {
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
			for (let j = 1; j < searchLines.length - 1; j++) {
				if (originalLines[i + j].trim().normalize('NFKC') !== searchLines[j].trim().normalize('NFKC')) {
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
                // Adjust end index if needed, similar to lineTrimmedFallbackMatch
				return [matchStartIndex, matchEndIndex];
			}
		}
	}
	return false;
}

function generateContentHash(content) {
	return crypto.createHash("sha256").update(content).digest("hex").substring(0, 8);
}

function normalizeDiffContent(content) {
    // Simplified version for testing, assuming no CDATA or HTML entities in test data
    console.debug(`[normalizeDiffContent 입력]`, { /* simplified logging */ });
	content = content.replace(/\r\n/g, '\n');
    console.debug(`[normalizeDiffContent 결과]`, { /* simplified logging */ });
	return content;
}

async function constructNewFileContent(diffContent, originalContent, isFinal, logger) {
	const log = logger || console;
	diffContent = normalizeDiffContent(diffContent);
    log.debug(`[정규화된 diff 내용]`, { /* simplified logging */ });
	diffContent = normalizeContent(diffContent);
	originalContent = normalizeContent(originalContent);
	const detectedEOL = originalContent.includes("\r\n") ? "\r\n" : "\n";
    log.debug(`감지된 EOL 형식: ${detectedEOL === "\r\n" ? "CRLF" : "LF"}`);
    log.debug(`[원본 파일 내용]`, { /* simplified logging */ });

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
    log.debug(`[입력된 diff 내용]`, { /* simplified logging */ });

	const lastLine = lines[lines.length - 1];
	if (lines.length > 0 &&
		(lastLine.startsWith("<") || lastLine.startsWith("=") || lastLine.startsWith(">")) &&
		lastLine !== "^SEARCH^" &&
		lastLine !== "^======^" &&
		lastLine !== "^REPLACE^") {
		lines.pop();
        log.debug(`[부분 마커 제거]`, { 제거된라인: lastLine });
	}

    // Use the flexible marker check
	const hasSearchBlock = lines.some(line => line.includes("^SEARCH^"));
	const hasSeparator = lines.some(line => line.includes("^======^"));
	const hasReplaceBlock = lines.some(line => line.includes("^REPLACE^"));

    log.debug(`[SEARCH/REPLACE 블록 형식 검증]`, { hasSearchBlock, hasSeparator, hasReplaceBlock });

	if (!hasSearchBlock || !hasSeparator || !hasReplaceBlock) {
        log.debug(`[경고] SEARCH/REPLACE 블록 형식이 올바르지 않습니다`, { hasSearchBlock, hasSeparator, hasReplaceBlock, 입력된내용: diffContent });
		throw new Error("SEARCH/REPLACE 블록 형식이 올바르지 않습니다. ^SEARCH^, =======, ^REPLACE^ 마커가 필요합니다.");
	}

	for (const line of lines) {
        // Need to handle the case where marker might not be on its own line after normalization
        if (line.trim() === "^SEARCH^") { // Trim potential whitespace
			inSearch = true;
			inReplace = false; // Ensure correct state
			currentSearchContent = "";
			currentReplaceContent = "";
            log.debug(`[SEARCH 블록 시작]`);
			continue;
		}

		if (line.trim() === "^======^") { // Trim potential whitespace
            if (!inSearch) { // Separator without preceding SEARCH
                log.debug(`[경고] ^======^ 마커가 ^SEARCH^ 블록 없이 나타났습니다.`);
                throw new Error("잘못된 형식: ^======^ 마커가 ^SEARCH^ 블록 없이 나타났습니다.");
            }
			inSearch = false;
			inReplace = true;
			currentSearchContent = normalizeContent(currentSearchContent); // Normalize accumulated search content
            log.debug(`[SEARCH 블록 내용]`, { 내용: currentSearchContent });

			if (!currentSearchContent || currentSearchContent.trim() === "") {
                log.debug(`[경고] 빈 SEARCH 블록 감지됨.`);
				throw new Error("빈 SEARCH 블록이 감지되었습니다.");
			}

			const normalizedOriginal = originalContent; // Already normalized
			const normalizedSearch = currentSearchContent; // Already normalized
			const exactIndex = normalizedOriginal.indexOf(normalizedSearch, lastProcessedIndex);

			if (exactIndex !== -1) {
				searchMatchIndex = exactIndex;
				searchEndIndex = exactIndex + currentSearchContent.length;
                log.debug(`[정확한 매칭 성공]`, { 시작: searchMatchIndex, 끝: searchEndIndex });
			} else {
				const lineMatch = lineTrimmedFallbackMatch(originalContent, currentSearchContent, lastProcessedIndex);
				if (lineMatch) {
					[searchMatchIndex, searchEndIndex] = lineMatch;
                    log.debug(`[라인 트림 매칭 성공]`, { 시작: searchMatchIndex, 끝: searchEndIndex });
				} else {
					const blockMatch = blockAnchorFallbackMatch(originalContent, currentSearchContent, lastProcessedIndex);
					if (blockMatch) {
						[searchMatchIndex, searchEndIndex] = blockMatch;
                        log.debug(`[블록 앤커 매칭 성공]`, { 시작: searchMatchIndex, 끝: searchEndIndex });
					} else {
                        // Simplified: No previous changes matching for this direct test
                        log.debug(`[매칭 실패]`, { 검색내용: currentSearchContent });
						throw new Error(`SEARCH 블록을 찾을 수 없습니다:\n${currentSearchContent}`);
					}
				}
			}
			result += originalContent.slice(lastProcessedIndex, searchMatchIndex);
			continue;
		}

		if (line.trim() === "^REPLACE^") { // Trim potential whitespace
            if (!inReplace) { // REPLACE without preceding SEPARATOR
                 log.debug(`[경고] ^REPLACE^ 마커가 ^======^ 블록 없이 나타났습니다.`);
                throw new Error("잘못된 형식: ^REPLACE^ 마커가 ^======^ 블록 없이 나타났습니다.");
            }
			inReplace = false; // End of replace block
			currentReplaceContent = normalizeContent(currentReplaceContent); // Normalize accumulated replace content
            log.debug(`[REPLACE 블록 내용]`, { 내용: currentReplaceContent });

			if (searchMatchIndex !== -1) {
				result += currentReplaceContent;
				lastProcessedIndex = searchEndIndex;
                log.debug(`[내용 대체 완료]`, { 새인덱스: lastProcessedIndex });
			} else {
                 log.debug(`[경고] 매칭된 내용 없이 ^REPLACE^ 마커 발견됨.`);
                // Decide how to handle this - error or ignore? Let's error for now.
                throw new Error("잘못된 형식: 매칭된 내용 없이 ^REPLACE^ 마커가 나타났습니다.");
            }

			// Reset for next potential block
			currentSearchContent = "";
			currentReplaceContent = "";
			searchMatchIndex = -1;
			searchEndIndex = -1;
			continue;
		}

		if (inSearch) {
			// Append line, preserving original newline from split
            // Check if it's the first line added to avoid leading newline if marker was trimmed
            currentSearchContent += (currentSearchContent === "" ? "" : "\n") + line;
		} else if (inReplace) {
			currentReplaceContent += (currentReplaceContent === "" ? "" : "\n") + line;
		}
	}

	if (isFinal && lastProcessedIndex < originalContent.length && !remainderProcessed) {
		result += originalContent.slice(lastProcessedIndex);
		remainderProcessed = true;
        log.debug(`[마지막 처리] 남은 내용 추가됨`);
	}

	result = result.replace(/\n/g, detectedEOL);
    log.debug(`[최종 결과]`, { 결과길이: result.length });
	return result;
}

// --- diff.ts 에서 필요한 함수들 복사 끝 ---


async function runTest() {
  try {
    console.log('constructNewFileContent 함수 직접 실행 테스트 시작.');

    // 테스트 데이터 정의
    const originalContent = `첫 번째 줄이 수정되었습니다. (write_to_file 사용)
이 줄은 replace_in_file로 수정되었습니다.
세 번째 줄 최종 수정! (write_to_file 사용)
`; // 마지막 줄바꿈 포함

    const diffContent = `^SEARCH^
이 줄은 replace_in_file로 수정되었습니다.
^======^
두 번째 줄 재수정 테스트
^REPLACE^`;

    const expectedResult = `첫 번째 줄이 수정되었습니다. (write_to_file 사용)
두 번째 줄 재수정 테스트
세 번째 줄 최종 수정! (write_to_file 사용)
`; // 마지막 줄바꿈 포함

    console.log('--- 입력 데이터 ---');
    console.log('Original Content:\n', originalContent);
    console.log('Diff Content:\n', diffContent);
    console.log('------------------');

    // 함수 실행 (간단한 콘솔 로거 전달)
    const result = await constructNewFileContent(diffContent, originalContent, true, console);

    console.log('--- 실행 결과 ---');
    console.log('Result Content:\n', result);
    console.log('------------------');

    // 결과 비교
    if (result === expectedResult) {
      console.log('테스트 성공: 결과가 예상과 일치합니다.');
    } else {
      console.error('테스트 실패: 결과가 예상과 다릅니다.');
      console.log('Expected:\n', expectedResult);
    }

  } catch (error) {
    console.error('테스트 실행 중 오류 발생:', error);
  }
}

runTest();
