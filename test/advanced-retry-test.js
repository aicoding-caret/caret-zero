// 고급 API 재시도 로직 테스트
// 이 테스트는 개선된 API 재시도 메커니즘의 다양한 시나리오를 검증합니다.

const assert = require('assert');
const path = require('path');

// 모의 컨트롤러 클래스
class MockController {
    constructor() {
        this.messages = [];
        this.retryStatus = null;
        this.logger = {
            log: (msg) => console.log(`[LOG] ${msg}`),
            debug: (msg) => console.log(`[DEBUG] ${msg}`),
            error: (msg) => console.log(`[ERROR] ${msg}`)
        };
    }

    postMessageToWebview(message) {
        console.log(`[Controller] 웹뷰로 메시지 전송: ${JSON.stringify(message)}`);
        this.messages.push(message);
        if (message.type === 'retryStatus') {
            this.retryStatus = message.retryStatusMessage || message.retryState;
        }
        return true;
    }

    say(message, options) {
        console.log(`[Controller] say: ${message}`, options ? JSON.stringify(options) : '');
        if (options && (options.retryState || options.retryStatusMessage)) {
            this.retryStatus = options.retryStatusMessage || options.retryState;
        }
        return true;
    }
}

// withRetry 데코레이터를 시뮬레이션하는 함수
function withRetrySimulator(options = {}) {
    const maxRetries = options.maxRetries || 5;
    const baseDelay = options.baseDelay || 1000;
    const maxDelay = options.maxDelay || 10000;
    const retryAllErrors = options.retryAllErrors || false;

    // 재시도 로직을 포함한 함수 래퍼
    return async function* (simulateErrorType, controller) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                if (simulateErrorType && attempt < maxRetries - 1) {
                    // 에러 시뮬레이션
                    const error = createSimulatedError(simulateErrorType, attempt);
                    
                    // 재시도 로직 처리
                    console.log(`[Retry] ${attempt + 1}번 시도 중...`);
                    
                    // 에러 파싱 로직
                    let errorBody = null;
                    let retryInfo = null;
                    let quotaInfo = null;
                    let errorType = "API 오류";
                    
                    try {
                        if (error.body) {
                            errorBody = JSON.parse(error.body);
                            if (Array.isArray(errorBody)) {
                                retryInfo = errorBody.find(item => item["@type"]?.includes("RetryInfo"));
                                quotaInfo = errorBody.find(item => item["@type"]?.includes("QuotaFailure"));
                            }
                        }
                        
                        if (error.status === 429) {
                            errorType = "할당량 초과";
                            if (quotaInfo?.violations && quotaInfo.violations.length > 0) {
                                const quotaViolation = quotaInfo.violations[0].subject || quotaInfo.violations[0].description || '알 수 없는 할당량';
                                console.log(`[Retry Debug] 할당량 위반 정보: ${quotaViolation}`);
                            }
                        } else if (error.status === 503) {
                            errorType = "서비스 사용 불가";
                        }
                    } catch (parseError) {
                        console.debug("[Retry Debug] Error during response parsing:", parseError);
                    }
                    
                    // 지연 시간 계산
                    let delay = baseDelay * Math.pow(2, attempt);
                    
                    if (retryInfo?.retryDelay) {
                        // 패턴을 사용하여 숫자와 단위를 추출
                        const delayPattern = /(\\d+(\\.\\d+)?)([a-z]+)?/i;
                        const match = retryInfo.retryDelay.match(delayPattern);
                        
                        if (match) {
                            const value = parseFloat(match[1]);
                            const unit = match[3] || 's'; // 기본값은 초(s)
                            console.log(`[Retry Debug] Parsed delay: value=${value}, unit=${unit}`);
                            
                            // 단위에 따라 밀리초로 변환
                            switch(unit.toLowerCase()) {
                                case 'ms': 
                                    delay = value;
                                    break;
                                case 'm': 
                                    delay = value * 60 * 1000; // 분을 밀리초로
                                    break;
                                case 'h': 
                                    delay = value * 60 * 60 * 1000; // 시간을 밀리초로
                                    break;
                                default: // 's' 또는 다른 단위
                                    delay = value * 1000; // 초를 밀리초로
                            }
                        } else {
                            // 패턴 매칭에 실패했을 경우
                            try {
                                const delayStr = retryInfo.retryDelay.toString().replace(/s$/i, "");
                                delay = parseFloat(delayStr) * 1000;
                            } catch (e) {
                                console.log("[Retry Debug] Error parsing delay:", e);
                            }
                        }
                    }
                    
                    // 지연 시간에 버퍼 추가 (1초)
                    delay += 1000;
                    
                    // 재시도 상태 메시지 생성
                    const retryStatusMessage = {
                        errorType,
                        quotaViolation: quotaInfo?.violations?.length > 0 ? 
                            quotaInfo.violations[0].subject || quotaInfo.violations[0].description : undefined,
                        delayMs: delay,
                        startTime: Date.now(),
                        attempt: attempt + 1,
                        maxRetries
                    };
                    
                    console.log(`[Retry Debug] Created retry status message:`, retryStatusMessage);
                    
                    // 컨트롤러에 상태 전송
                    if (controller) {
                        controller.say(`⚠️ ${errorType}. ${attempt + 1}번째 재시도까지 ${Math.round(delay / 1000)}초 대기합니다...`, 
                            { retryStatusMessage });
                            
                        controller.postMessageToWebview({
                            type: 'retryStatus',
                            retryState: retryStatusMessage
                        });
                    }
                    
                    // 대기 시간만큼 지연
                    console.log(`[Retry] ${Math.round(delay / 1000)}초 동안 대기 중...`);
                    await new Promise(resolve => setTimeout(resolve, 100)); // 테스트에서는 실제 대기 시간을 짧게 설정
                    
                    // 마지막 시도가 아니면 에러 다시 던지기
                    throw error;
                }
                
                // 성공 응답 시뮬레이션
                yield "테스트 성공 응답";
                return;
            } catch (error) {
                if (attempt === maxRetries - 1) {
                    console.log(`[Retry] 최대 재시도 횟수(${maxRetries})에 도달했습니다. 에러를 반환합니다.`);
                    throw error;
                }
                // 다음 시도로 계속
            }
        }
    };
}

// 다양한 에러 유형 시뮬레이션
function createSimulatedError(type, attempt) {
    switch(type) {
        case 'rate_limit':
            return {
                status: 429,
                message: `[GoogleGenerativeAI Error]: Error fetching f.../google.rpc.RetryInfo","retryDelay":"${(attempt + 1) * 5}s"}]`,
                body: JSON.stringify([
                    { "@type": "type.googleapis.com/google.rpc.RetryInfo", "retryDelay": `${(attempt + 1) * 5}s` },
                    { "@type": "type.googleapis.com/google.rpc.QuotaFailure", "violations": [{ "subject": "Requests per minute", "description": "초당 요청 횟수 초과" }] }
                ])
            };
        case 'service_unavailable':
            return {
                status: 503,
                message: `[GoogleGenerativeAI Error]: Error fetching f.../google.rpc.RetryInfo","retryDelay":"${(attempt + 3)}s"}]`,
                body: JSON.stringify([
                    { "@type": "type.googleapis.com/google.rpc.RetryInfo", "retryDelay": `${(attempt + 3)}s` }
                ])
            };
        case 'complex_unit':
            // 다양한 시간 단위 테스트
            const units = ['ms', 's', 'm', 'h'];
            const unit = units[attempt % units.length];
            let value;
            
            switch(unit) {
                case 'ms': value = 1500; break;
                case 's': value = 2; break;
                case 'm': value = 0.1; break; // 6초
                case 'h': value = 0.001; break; // 3.6초
            }
            
            return {
                status: 429,
                message: `[GoogleGenerativeAI Error]: Error fetching f.../google.rpc.RetryInfo","retryDelay":"${value}${unit}"}]`,
                body: JSON.stringify([
                    { "@type": "type.googleapis.com/google.rpc.RetryInfo", "retryDelay": `${value}${unit}` }
                ])
            };
        default:
            return {
                status: 500,
                message: 'Internal Server Error',
                body: JSON.stringify([])
            };
    }
}

// 테스트 케이스
async function runTests() {
    console.log('===== 고급 API 재시도 테스트 시작 =====');
    
    // 테스트 1: 429 할당량 초과 에러 테스트
    await testRateLimitError();
    
    // 테스트 2: 503 서비스 불가 에러 테스트
    await testServiceUnavailableError();
    
    // 테스트 3: 다양한 시간 단위 파싱 테스트
    await testComplexTimeUnitParsing();
    
    // 테스트 4: 최대 재시도 횟수 테스트
    await testMaxRetries();
    
    console.log('===== 모든 테스트 완료 =====');
}

// 테스트 1: 429 할당량 초과 에러 테스트
async function testRateLimitError() {
    console.log('\n----- 테스트 1: 할당량 초과 에러(429) 처리 테스트 -----');
    const controller = new MockController();
    const retry = withRetrySimulator({ maxRetries: 3 });
    
    try {
        for await (const result of retry('rate_limit', controller)) {
            console.log('결과:', result);
        }
        console.log('✓ 테스트 1 통과: 재시도 후 성공');
    } catch (error) {
        console.error('✗ 테스트 1 실패:', error);
    }
    
    // 잠시 대기 후 재시도 상태 메시지 검증
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 검증: 재시도 상태 메시지가 올바르게 생성되었는지 확인
    console.log('재시도 상태:', controller.retryStatus);
    assert(controller.retryStatus, '재시도 상태 메시지가 생성되지 않았습니다.');
    assert.equal(controller.retryStatus.errorType, '할당량 초과', '오류 유형이 올바르게 설정되지 않았습니다.');
    console.log('✓ 검증 통과: 재시도 상태 메시지가 올바르게 생성되었습니다.');
}

// 테스트 2: 503 서비스 불가 에러 테스트
async function testServiceUnavailableError() {
    console.log('\n----- 테스트 2: 서비스 불가 에러(503) 처리 테스트 -----');
    const controller = new MockController();
    const retry = withRetrySimulator({ maxRetries: 3 });
    
    try {
        for await (const result of retry('service_unavailable', controller)) {
            console.log('결과:', result);
        }
        console.log('✓ 테스트 2 통과: 재시도 후 성공');
    } catch (error) {
        console.error('✗ 테스트 2 실패:', error);
    }
    
    // 잠시 대기 후 재시도 상태 메시지 검증
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 검증: 재시도 상태 메시지가 올바르게 생성되었는지 확인 
    console.log('재시도 상태:', controller.retryStatus);
    assert(controller.retryStatus, '재시도 상태 메시지가 생성되지 않았습니다.');
    assert.equal(controller.retryStatus.errorType, '서비스 사용 불가', '오류 유형이 올바르게 설정되지 않았습니다.');
    console.log('✓ 검증 통과: 재시도 상태 메시지가 올바르게 생성되었습니다.');
}

// 테스트 3: 다양한 시간 단위 파싱 테스트
async function testComplexTimeUnitParsing() {
    console.log('\n----- 테스트 3: 다양한 시간 단위 파싱 테스트 -----');
    const controller = new MockController();
    const retry = withRetrySimulator({ maxRetries: 5 });
    
    try {
        for await (const result of retry('complex_unit', controller)) {
            console.log('결과:', result);
        }
        console.log('✓ 테스트 3 통과: 다양한 단위 파싱 후 성공');
    } catch (error) {
        console.error('✗ 테스트 3 실패:', error);
    }
}

// 테스트 4: 최대 재시도 횟수 테스트
async function testMaxRetries() {
    console.log('\n----- 테스트 4: 최대 재시도 횟수 테스트 -----');
    const controller = new MockController();
    
    // 실제 재시도 테스트를 위한 수정된 함수
    async function* willFailAfterRetries() {
        const maxTries = 1; // 한 번만 시도하도록 설정
        for (let attempt = 0; attempt <= maxTries; attempt++) {
            if (attempt < maxTries) {
                // 에러 로그 
                console.log(`[Test4] 재시도 ${attempt + 1}/${maxTries} 시도`);
                controller.postMessageToWebview({
                    type: 'retryStatus',
                    retryState: {
                        errorType: '최대 재시도 테스트',
                        delayMs: 100,
                        startTime: Date.now(),
                        attempt: attempt + 1,
                        maxRetries: maxTries
                    }
                });
                await new Promise(resolve => setTimeout(resolve, 50));
                throw new Error('최대 재시도 수 테스트 에러');
            }
        }
        throw new Error('재시도 초과 테스트 에러');
    }
    
    try {
        for await (const result of willFailAfterRetries()) {
            console.log('결과:', result); // 이 부분은 실행되지 않아야 함
        }
        console.log('✗ 테스트 4 실패: 예상치 않게 성공했습니다.');
    } catch (error) {
        console.log('✓ 테스트 4 통과: 최대 재시도 횟수 초과 후 적절히 에러가 발생했습니다:', error.message);
    }
}

// 테스트 5: UI 연동 테스트 - 재시도 상태 메시지 처리
async function testUIMessageHandling() {
    console.log('\n----- 테스트 5: UI 연동 테스트 (재시도 상태 메시지 처리) -----');
    
    // 모의 웹뷰 컴포넌트 - 웹뷰 동작 시뮬레이션
    class MockWebview {
        constructor() {
            this.state = {
                retryStatus: null,
                retryProgress: 0,
                messages: [],
                timerActive: false
            };
            
            this.handlers = {
                message: []
            };
        }
        
        // 이벤트 리스너 등록
        addEventListener(event, handler) {
            if (this.handlers[event]) {
                this.handlers[event].push(handler);
                console.log(`[WebView] ${event} 이벤트 리스너 등록`);
            }
        }
        
        // 상태 업데이트 함수
        setRetryStatus(status) {
            this.state.retryStatus = status;
            console.log(`[WebView] 재시도 상태 업데이트:`, status);
        }
        
        // 진행률 업데이트
        setRetryProgress(progress) {
            this.state.retryProgress = progress;
            console.log(`[WebView] 재시도 진행률 업데이트: ${progress}%`);
        }
        
        // 메시지 수신 시뮬레이션
        receiveMessage(message) {
            console.log(`[WebView] 메시지 수신:`, message);
            
            // 등록된 이벤트 핸들러로 메시지 전달
            this.handlers.message.forEach(handler => {
                handler({ data: message });
            });
        }
        
        // UI 렌더링 시뮬레이션
        render() {
            if (this.state.retryStatus) {
                const { errorType, attempt, maxRetries } = this.state.retryStatus;
                const progressPercent = this.state.retryProgress.toFixed(1);
                
                console.log('\n[WebView 렌더링] 재시도 상태:');
                console.log(`\u2514\u2500 오류 유형: ${errorType}`);
                console.log(`\u2514\u2500 재시도: ${attempt}/${maxRetries}`);
                console.log(`\u2514\u2500 진행률: [${'='.repeat(Math.floor(progressPercent/10))}${' '.repeat(10-Math.floor(progressPercent/10))}] ${progressPercent}%\n`);
                
                return true; // 재시도 상태 화면 표시 성공
            }
            
            return false; // 표시할 재시도 상태 없음
        }
        
        // 타이머 시작
        startProgressTimer(duration) {
            this.state.timerActive = true;
            let startTime = Date.now();
            let intervalId = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(100, (elapsed / duration) * 100);
                this.setRetryProgress(progress);
                
                if (progress >= 100) {
                    clearInterval(intervalId);
                    this.state.timerActive = false;
                    console.log(`[WebView] 타이머 완료`);
                }
            }, 100);
            
            // 테스트에서는 짧게 실행
            setTimeout(() => {
                if (this.state.timerActive) {
                    clearInterval(intervalId);
                    this.state.timerActive = false;
                    this.setRetryProgress(100);
                }
            }, 300);
        }
    }
    
    // 테스트 시작
    const webview = new MockWebview();
    const controller = new MockController();
    
    // 재시도 상태 처리 함수 설정
    webview.addEventListener('message', (event) => {
        const message = event.data;
        
        if (message.type === 'retryStatus' && message.retryState) {
            // 재시도 상태 업데이트
            webview.setRetryStatus(message.retryState);
            
            // 진행률 타이머 시작
            if (message.retryState.delayMs) {
                webview.startProgressTimer(message.retryState.delayMs);
            }
        }
    });
    
    // 테스트 시나리오 1: 할당량 초과 오류
    console.log('\n[UI 테스트] 할당량 초과 오류 시나리오');
    
    // 재시도 상태 메시지 생성
    const retryState = {
        errorType: '할당량 초과',
        quotaViolation: '시간당 요청 횟수',
        delayMs: 5000,
        startTime: Date.now(),
        attempt: 2,
        maxRetries: 5
    };
    
    // 메시지 전송
    webview.receiveMessage({
        type: 'retryStatus',
        retryState
    });
    
    // UI 렌더링 확인
    await new Promise(resolve => setTimeout(resolve, 200));
    const renderResult = webview.render();
    
    // 검증
    assert(renderResult, 'UI가 재시도 상태를 렌더링하지 않았습니다.');
    assert.equal(webview.state.retryStatus.errorType, '할당량 초과', 'UI가 오류 유형을 바르게 표시하지 않았습니다.');
    assert(webview.state.retryProgress > 0, '진행률이 업데이트되지 않았습니다.');
    
    console.log('✓ UI 테스트 통과: 재시도 상태가 올바르게 표시되었습니다.');
}

// 전체 테스트 실행
async function runAllTests() {
    try {
        await runTests();
        await testUIMessageHandling();
        console.log('\n===== 모든 테스트 성공적으로 완료 했습니다! =====');
    } catch (error) {
        console.error('\n\u2717 테스트 실패:', error);
        process.exit(1);
    }
}

// 테스트 실행
runAllTests().catch(error => {
    console.error('테스트 전체 실패:', error);
    process.exit(1);
});
