// run-unit-tests.js
const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

// ts-node/register를 프로그래밍 방식으로 로드 (require 사용)
// tsconfig.unit-test.json 설정을 사용하도록 지정
require('ts-node').register({
    project: './tsconfig.unit-test.json'
});

// Mocha 인스턴스 생성
const mocha = new Mocha({
    timeout: 10000, // 타임아웃 증가 (필요시 조정)
    reporter: 'spec' // 리포터 지정 (선택적)
});

// 순수 단위 테스트 파일이 있는 디렉토리 경로 (vscode API 미사용 테스트)
const unitTestDir = path.resolve(__dirname, './src/test/suite'); // 경로 수정: src/test -> src/test/suite

// 테스트 파일 찾기 함수 (재귀적으로 .test.ts 파일만)
function findTestFiles(dir, fileList = []) {
    try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                // node_modules 같은 제외 디렉토리 추가 가능
                if (file !== 'node_modules') {
                    findTestFiles(filePath, fileList);
                }
            } else if (file.endsWith('.test.ts')) {
                fileList.push(filePath);
            }
        });
    } catch (err) {
        // 디렉토리가 존재하지 않는 경우 등 오류 처리
        console.warn(`Warning: Could not read directory ${dir}: ${err.message}`);
    }
    return fileList;
}

// 테스트 파일 추가
try {
    console.log(`Searching for unit test files in: ${unitTestDir}`); // 로그 수정
    const testFiles = findTestFiles(unitTestDir); // 수정된 경로 사용

    if (testFiles.length === 0) {
        console.error(`Error: No unit test files found in ${unitTestDir} or its subdirectories.`); // 로그 수정
        process.exitCode = 1;
    } else {
        console.log(`Found ${testFiles.length} unit test file(s):`); // 로그 수정
        testFiles.forEach(file => {
            console.log(`- Adding file: ${file}`);
            mocha.addFile(file);
        });

        // 테스트 실행
        console.log('\nRunning unit tests...'); // 로그 수정
        mocha.run(failures => {
            process.exitCode = failures ? 1 : 0; // 실패 시 종료 코드 1 반환
            console.log(`\nUnit tests finished with ${failures} failure(s).`); // 로그 수정
        });
    }

} catch (err) {
    console.error('Error setting up or running unit tests:', err); // 로그 수정
    process.exitCode = 1;
}
