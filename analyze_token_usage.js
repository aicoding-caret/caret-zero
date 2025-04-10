const fs = require('fs').promises;
const path = require('path');

// 대상 폴더 경로 (마스터의 환경에 맞게 설정)
const tasksDir = path.join('C:', 'Users', 'luke', 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'tasks');

// 집계할 기간 설정 (YYYY-MM-DD)
const startDate = new Date('2025-04-09');
const endDate = new Date('2025-04-10');
endDate.setHours(23, 59, 59, 999); // endDate를 해당 날짜의 끝으로 설정

async function analyzeTokenUsage() {
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let processedFiles = 0;
    let errorFiles = 0;

    try {
        const taskFolders = await fs.readdir(tasksDir, { withFileTypes: true });

        for (const dirent of taskFolders) {
            if (dirent.isDirectory()) {
                const folderPath = path.join(tasksDir, dirent.name);
                try {
                    const stats = await fs.stat(folderPath);
                    const modifiedTime = stats.mtime; // 폴더 수정 시간

                    console.log(`Checking folder: ${dirent.name}`); // 폴더 확인 로그
                    console.log(`Checking folder: ${dirent.name}`); // 폴더 확인 로그
                    // 기간 필터링
                    if (modifiedTime >= startDate && modifiedTime <= endDate) {
                        console.log(`  - Date match: ${modifiedTime.toLocaleDateString()}`); // 날짜 매칭 로그
                        const uiMessagesPath = path.join(folderPath, 'ui_messages.json'); // 파일 이름 수정
                        try {
                            console.log(`  Attempting to read: ${uiMessagesPath}`); // 파일 읽기 시도 로그
                            await fs.access(uiMessagesPath); // 파일 존재 확인

                            const fileContent = await fs.readFile(uiMessagesPath, 'utf8');
                            console.log(`  Successfully read ui_messages.json.`); // 파일 읽기 성공 로그
                            const messages = JSON.parse(fileContent);

                            if (Array.isArray(messages)) {
                                let taskInputTokens = 0;
                                let taskOutputTokens = 0;
                                const taskFilesRead = new Set();
                                const taskFilesWritten = new Set();
                                let apiReqCount = 0;

                                messages.forEach((message, index) => {
                                    // 'api_req_started' 메시지에서 토큰 정보 추출
                                    if (message.type === 'say' && message.say === 'api_req_started' && message.text) {
                                        apiReqCount++;
                                        try {
                                            const apiInfo = JSON.parse(message.text);
                                            if (typeof apiInfo.tokensIn === 'number') {
                                                taskInputTokens += apiInfo.tokensIn;
                                            }
                                            if (typeof apiInfo.tokensOut === 'number') {
                                                taskOutputTokens += apiInfo.tokensOut;
                                            }
                                        } catch (parseError) {
                                            // console.warn(`    - Could not parse api_req_started text in message ${index}: ${parseError.message}`);
                                        }
                                    }

                                    // 파일 작업 관련 메시지 분석
                                    if (message.type === 'say' || message.type === 'ask') {
                                        const toolInfo = message.say === 'tool' || message.ask === 'tool' ? JSON.parse(message.text || '{}') : null;
                                        if (toolInfo) {
                                            if (toolInfo.tool === 'readFile' && toolInfo.path) {
                                                taskFilesRead.add(toolInfo.path);
                                            } else if ((toolInfo.tool === 'editedExistingFile' || toolInfo.tool === 'newFileCreated') && toolInfo.path) {
                                                taskFilesWritten.add(toolInfo.path);
                                            }
                                            // 'replace_in_file'이나 'write_to_file' 자체의 tool_use 블록은 현재 스크립트에서 직접 파싱하지 않음
                                            // 대신 'editedExistingFile', 'newFileCreated' 결과 메시지를 통해 추적
                                        }
                                    }
                                });

                                totalInputTokens += taskInputTokens;
                                totalOutputTokens += taskOutputTokens;
                                processedFiles++;
                                console.log(`  -> Processed Task: ${dirent.name}`);
                                console.log(`     - API Requests: ${apiReqCount}`);
                                console.log(`     - Tokens (In/Out): ${taskInputTokens} / ${taskOutputTokens}`);
                                if (taskFilesRead.size > 0) console.log(`     - Files Read: ${[...taskFilesRead].join(', ')}`);
                                if (taskFilesWritten.size > 0) console.log(`     - Files Written: ${[...taskFilesWritten].join(', ')}`);

                            } else {
                                console.warn(`  -> Skipping ${dirent.name}: ui_messages.json content is not an array.`);
                                errorFiles++;
                            }
                        } catch (err) {
                            if (err.code === 'ENOENT') {
                                // 정확한 파일 이름을 로그에 남기도록 수정
                                console.log(`  -> Skipping ${dirent.name}: ${path.basename(uiMessagesPath)} not found.`);
                            } else if (err instanceof SyntaxError) {
                                console.error(`  -> Error parsing JSON in ${dirent.name} (${path.basename(uiMessagesPath)}): ${err.message}`);
                                errorFiles++;
                            } else {
                                console.error(`  -> Error processing file in ${dirent.name}: ${err.message}`);
                                errorFiles++;
                            }
                        }
                    } else {
                         console.log(`  - Date mismatch: ${modifiedTime.toLocaleDateString()} (Skipping)`); // 날짜 불일치 로그
                    }
                } catch (statErr) {
                    console.error(`Error getting stats for folder ${dirent.name}: ${statErr.message}`);
                }
            }
        }

        console.log('\\n--- Token Usage Summary ---');
        console.log(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
        console.log(`Processed Task Files: ${processedFiles}`);
        console.log(`Files with Errors/Skipped: ${errorFiles}`);
        console.log(`Total Input Tokens: ${totalInputTokens}`);
        console.log(`Total Output Tokens: ${totalOutputTokens}`);
        console.log(`Total Tokens: ${totalInputTokens + totalOutputTokens}`);

    } catch (err) {
        console.error(`Error reading tasks directory ${tasksDir}: ${err.message}`);
        if (err.code === 'ENOENT') {
            console.error('Please verify the tasks directory path.');
        }
    }
}

analyzeTokenUsage();
