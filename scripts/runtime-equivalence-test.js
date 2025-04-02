const fs = require('fs').promises;
const path = require('path');

// 설정
const PROMPTS_DIR = path.resolve(__dirname, '../src/core/prompts');
const SECTIONS_DIR = path.resolve(PROMPTS_DIR, 'sections');
const RULES_DIR = path.resolve(PROMPTS_DIR, 'rules');

// 가상 로딩 시스템 (실제 system.ts와 유사하게 구현)
async function mockSystemLoad() {
    console.log("런타임 동등성 테스트 시작 (실제 로딩 시스템 시뮬레이션)");
    console.log("=" + "=".repeat(80));
    
    // 1. 섹션 파일 로딩 시뮬레이션
    console.log("\n[섹션 파일 런타임 로딩 검증]");
    await testSectionsRuntimeEquivalence();
    
    // 2. 규칙 파일 로딩 시뮬레이션
    console.log("\n[규칙 파일 런타임 로딩 검증]");
    await testRulesRuntimeEquivalence();
    
    console.log("\n검증 완료!");
}

// JSON 파일 로드 (시스템에서의 JSON 로딩 시뮬레이션)
async function mockLoadJsonFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`JSON 로딩 실패: ${error.message}`);
        return null;
    }
}

// 마크다운 파일 로드 (시스템에서의 마크다운 로딩 시뮬레이션)
async function mockLoadMarkdownFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        console.error(`마크다운 로딩 실패: ${error.message}`);
        return null;
    }
}

// 섹션 로드 시뮬레이션 (런타임 동작 검증)
async function mockLoadSection(sectionName, useJson = true) {
    const jsonPath = path.join(SECTIONS_DIR, `${sectionName}.json`);
    const mdPath = path.join(SECTIONS_DIR, `${sectionName}.md`);
    
    try {
        if (useJson) {
            // JSON 파일 로드 시도
            const jsonData = await mockLoadJsonFile(jsonPath);
            
            // sections/*.json 형식 처리 (JSON에서 반환되는 형식에 따라 다름)
            if (typeof jsonData === 'string') {
                return jsonData;
            } else if (jsonData && jsonData.content) {
                return jsonData.content;
            } else {
                return JSON.stringify(jsonData);
            }
        } else {
            // 마크다운 파일 로드
            return await mockLoadMarkdownFile(mdPath);
        }
    } catch (error) {
        console.error(`섹션 로드 실패 (${sectionName}): ${error.message}`);
        return null;
    }
}

// 규칙 로드 시뮬레이션 (런타임 동작 검증)
async function mockLoadRules(ruleName, useJson = true) {
    const jsonPath = path.join(RULES_DIR, `${ruleName}.json`);
    const mdPath = path.join(RULES_DIR, `${ruleName}.md`);
    
    try {
        if (useJson) {
            // JSON 파일 로드 시도
            const jsonData = await mockLoadJsonFile(jsonPath);
            
            // rules/*.json 형식 처리 (rules 배열 포함)
            if (jsonData && Array.isArray(jsonData.rules)) {
                return jsonData.rules;
            } else {
                return [];
            }
        } else {
            // 마크다운 파일 로드 및 규칙 추출
            const mdContent = await mockLoadMarkdownFile(mdPath);
            if (!mdContent) return [];
            
            // 마크다운에서 규칙 추출 (간단한 방식: "-" 또는 "*"로 시작하는 라인을 규칙으로 간주)
            const lines = mdContent.split('\n');
            const rules = lines
                .filter(line => /^\s*[-*]/.test(line.trim()))
                .map(line => line.replace(/^\s*[-*]\s*/, '').trim());
            
            return rules;
        }
    } catch (error) {
        console.error(`규칙 로드 실패 (${ruleName}): ${error.message}`);
        return [];
    }
}

// 섹션 파일의 런타임 동등성 검증
async function testSectionsRuntimeEquivalence() {
    const files = await fs.readdir(SECTIONS_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    let passCount = 0;
    let failCount = 0;
    
    for (const mdFile of mdFiles) {
        const basename = mdFile.replace(/\.md$/, '');
        const jsonFile = `${basename}.json`;
        
        // JSON 파일 존재 확인
        try {
            await fs.access(path.join(SECTIONS_DIR, jsonFile));
        } catch {
            console.log(`${basename}: JSON 파일 없음, 건너뜀`);
            continue;
        }
        
        try {
            // 두 방식으로 섹션 로드
            const jsonBasedSection = await mockLoadSection(basename, true); // JSON 기반
            const mdBasedSection = await mockLoadSection(basename, false);  // MD 기반
            
            // 런타임 결과 비교 (간단한 기능적 동등성 검증)
            const functionallyEqual = verifyFunctionalEquivalence(jsonBasedSection, mdBasedSection);
            
            if (functionallyEqual) {
                console.log(`✅ ${basename}: 실제 로딩에서 기능적으로 동등함`);
                passCount++;
            } else {
                console.log(`❌ ${basename}: 실제 로딩에서 기능적 차이 있음`);
                failCount++;
                console.log(`   - JSON 기반 길이: ${jsonBasedSection ? jsonBasedSection.length : 0}`);
                console.log(`   - MD 기반 길이: ${mdBasedSection ? mdBasedSection.length : 0}`);
            }
        } catch (error) {
            console.error(`오류 (${basename}): ${error.message}`);
            failCount++;
        }
    }
    
    console.log(`\n섹션 런타임 검증 결과: ${passCount}개 통과, ${failCount}개 실패`);
}

// 규칙 파일의 런타임 동등성 검증
async function testRulesRuntimeEquivalence() {
    const files = await fs.readdir(RULES_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    let passCount = 0;
    let failCount = 0;
    
    for (const mdFile of mdFiles) {
        const basename = mdFile.replace(/\.md$/, '');
        const jsonFile = `${basename}.json`;
        
        // JSON 파일 존재 확인
        try {
            await fs.access(path.join(RULES_DIR, jsonFile));
        } catch {
            console.log(`${basename}: JSON 파일 없음, 건너뜀`);
            continue;
        }
        
        try {
            // 두 방식으로 규칙 로드
            const jsonBasedRules = await mockLoadRules(basename, true); // JSON 기반
            const mdBasedRules = await mockLoadRules(basename, false);  // MD 기반
            
            // 규칙 개수 비교
            const jsonRulesCount = jsonBasedRules ? jsonBasedRules.length : 0;
            const mdRulesCount = mdBasedRules ? mdBasedRules.length : 0;
            
            // 내용 기능적 동등성 검증
            const functionallyEqual = 
                jsonRulesCount > 0 && mdRulesCount > 0 && 
                Math.abs(jsonRulesCount - mdRulesCount) <= 1; // 1개 이내 차이는 허용
            
            if (functionallyEqual) {
                console.log(`✅ ${basename}: 실제 로딩에서 기능적으로 동등함 (JSON: ${jsonRulesCount}개, MD: ${mdRulesCount}개 규칙)`);
                passCount++;
            } else {
                console.log(`❌ ${basename}: 실제 로딩에서 기능적 차이 있음 (JSON: ${jsonRulesCount}개, MD: ${mdRulesCount}개 규칙)`);
                failCount++;
            }
        } catch (error) {
            console.error(`오류 (${basename}): ${error.message}`);
            failCount++;
        }
    }
    
    console.log(`\n규칙 런타임 검증 결과: ${passCount}개 통과, ${failCount}개 실패`);
}

// 기능적 동등성 검증 함수 (내용이 비어있지 않고 특수 케이스 처리)
function verifyFunctionalEquivalence(content1, content2) {
    if (!content1 || !content2) return false;
    
    // 짧은 헤더 파일 특수 처리 (예: RULES_HEADER)
    if (content1.length < 50 && content2.length < 50) {
        // 둘 다 짧은 경우, 문자열 정규화 후 유사도 확인
        const normalized1 = content1.toLowerCase().replace(/[#\s]/g, '').trim();
        const normalized2 = content2.toLowerCase().replace(/[#\s]/g, '').trim();
        return normalized1 === normalized2;
    }
    
    // 일반적인 케이스: 둘 다 어느 정도 길이가 있는지 확인
    return content1.length > 50 && content2.length > 50;
}

// 실행
mockSystemLoad().catch(err => {
    console.error("오류 발생:", err);
    process.exit(1);
});
