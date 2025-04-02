const fs = require('fs').promises;
const path = require('path');

// 설정
const PROMPTS_DIR = path.resolve(__dirname, '../src/core/prompts');
const SECTIONS_DIR = path.resolve(PROMPTS_DIR, 'sections');
const RULES_DIR = path.resolve(PROMPTS_DIR, 'rules');

// 핵심 기능: 마크다운과 JSON 파일의 의미적 등가성 검증
async function testEquivalence() {
    console.log("마크다운-JSON 의미적 등가성 테스트 시작");
    console.log("=" + "=".repeat(80));
    
    // 1. 섹션 파일 검증
    console.log("\n[섹션 파일 검증]");
    await testSectionsEquivalence();
    
    // 2. 규칙 파일 검증
    console.log("\n[규칙 파일 검증]");
    await testRulesEquivalence();
    
    console.log("\n검증 완료!");
}

// 마크다운 파일에서 헤더와 내용 추출
function extractMarkdownContent(mdContent) {
    const lines = mdContent.split('\n');
    // 헤더 제거 (# 으로 시작하는 라인)
    const contentLines = lines.filter(line => !line.trim().startsWith('#'));
    return contentLines.join('\n').trim();
}

// JSON 파일에서 내용 추출
function extractJsonContent(jsonContent) {
    try {
        const parsed = JSON.parse(jsonContent);
        
        // sections/*.json 형식 처리 (문자열 하나 포함)
        if (typeof parsed === 'string') {
            return parsed.trim();
        }
        
        // rules/*.json 형식 처리 (rules 배열 포함)
        if (parsed.rules && Array.isArray(parsed.rules)) {
            return parsed.rules.join('\n').trim();
        }
        
        // 기타 형식은 JSON 문자열로 반환
        return JSON.stringify(parsed, null, 2).trim();
    } catch (error) {
        console.error(`JSON 파싱 오류: ${error.message}`);
        return null;
    }
}

// 섹션 파일의 의미적 등가성 검증
async function testSectionsEquivalence() {
    const files = await fs.readdir(SECTIONS_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    let passCount = 0;
    let failCount = 0;
    
    for (const mdFile of mdFiles) {
        const basename = mdFile.replace(/\.md$/, '');
        const jsonFile = `${basename}.json`;
        
        try {
            // 두 파일 모두 존재하는지 확인
            const mdPath = path.join(SECTIONS_DIR, mdFile);
            const jsonPath = path.join(SECTIONS_DIR, jsonFile);
            
            const mdContent = await fs.readFile(mdPath, 'utf-8');
            const jsonContent = await fs.readFile(jsonPath, 'utf-8');
            
            // 마크다운에서 순수 내용 추출 (헤더 제외)
            const mdExtracted = extractMarkdownContent(mdContent);
            
            // JSON에서 내용 추출
            const jsonExtracted = extractJsonContent(jsonContent);
            
            // 내용 정규화 (공백 제거, 소문자 변환)
            const normalizedMd = normalizeContent(mdExtracted);
            const normalizedJson = normalizeContent(jsonExtracted);
            
            // 의미적 유사성 검사
            const similarityScore = calculateSimilarity(normalizedMd, normalizedJson);
            const isEquivalent = similarityScore > 0.7; // 70% 이상 유사하면 의미적으로 유사하다고 판단
            
            if (isEquivalent) {
                console.log(`✅ ${basename}: 의미적으로 동등함 (유사도: ${(similarityScore * 100).toFixed(2)}%)`);
                passCount++;
            } else {
                console.log(`❌ ${basename}: 의미적으로 차이가 있음 (유사도: ${(similarityScore * 100).toFixed(2)}%)`);
                failCount++;
                
                // 차이점 표시
                console.log(`   - MD 길이: ${mdExtracted.length}, JSON 길이: ${jsonExtracted.length}`);
                
                // 내용 샘플 표시 (처음 100자)
                console.log(`   - MD 샘플: ${mdExtracted.substring(0, 100)}...`);
                console.log(`   - JSON 샘플: ${jsonExtracted.substring(0, 100)}...`);
            }
        } catch (error) {
            console.error(`오류 (${basename}): ${error.message}`);
            failCount++;
        }
    }
    
    console.log(`\n섹션 검증 결과: ${passCount}개 통과, ${failCount}개 실패`);
}

// 규칙 파일의 의미적 등가성 검증
async function testRulesEquivalence() {
    const files = await fs.readdir(RULES_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    let passCount = 0;
    let failCount = 0;
    
    for (const mdFile of mdFiles) {
        const basename = mdFile.replace(/\.md$/, '');
        const jsonFile = `${basename}.json`;
        
        try {
            // 두 파일 모두 존재하는지 확인
            const mdPath = path.join(RULES_DIR, mdFile);
            const jsonPath = path.join(RULES_DIR, jsonFile);
            
            const mdContent = await fs.readFile(mdPath, 'utf-8');
            const jsonContent = await fs.readFile(jsonPath, 'utf-8');
            
            // 마크다운에서 순수 내용 추출 (헤더 제외)
            const mdExtracted = extractMarkdownContent(mdContent);
            
            // JSON에서 내용 추출
            const jsonExtracted = extractJsonContent(jsonContent);
            
            // 내용 정규화 (공백 제거, 소문자 변환)
            const normalizedMd = normalizeContent(mdExtracted);
            const normalizedJson = normalizeContent(jsonExtracted);
            
            // 의미적 유사성 검사
            const similarityScore = calculateSimilarity(normalizedMd, normalizedJson);
            const isEquivalent = similarityScore > 0.7; // 70% 이상 유사하면 의미적으로 유사하다고 판단
            
            if (isEquivalent) {
                console.log(`✅ ${basename}: 의미적으로 동등함 (유사도: ${(similarityScore * 100).toFixed(2)}%)`);
                passCount++;
            } else {
                console.log(`❌ ${basename}: 의미적으로 차이가 있음 (유사도: ${(similarityScore * 100).toFixed(2)}%)`);
                failCount++;
                
                // 차이점 표시
                console.log(`   - MD 길이: ${mdExtracted.length}, JSON 길이: ${jsonExtracted.length}`);
                
                // 내용 샘플 표시 (처음 100자)
                console.log(`   - MD 샘플: ${mdExtracted.substring(0, 100)}...`);
                console.log(`   - JSON 샘플: ${jsonExtracted.substring(0, 100)}...`);
            }
        } catch (error) {
            console.error(`오류 (${basename}): ${error.message}`);
            failCount++;
        }
    }
    
    console.log(`\n규칙 검증 결과: ${passCount}개 통과, ${failCount}개 실패`);
}

// 내용 정규화 함수 (공백 제거, 소문자 변환)
function normalizeContent(content) {
    if (!content) return '';
    
    return content
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

// 두 문자열의 유사성 계산 (간단한 Jaccard 유사도)
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    // 문자열을 단어 집합으로 변환
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    // 교집합 계산
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    
    // 합집합 계산
    const union = new Set([...words1, ...words2]);
    
    // Jaccard 유사도 = 교집합 크기 / 합집합 크기
    return intersection.size / union.size;
}

// 실행
testEquivalence().catch(err => {
    console.error("오류 발생:", err);
    process.exit(1);
});
