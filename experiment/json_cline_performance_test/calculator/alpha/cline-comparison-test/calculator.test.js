/**
 * 웹 계산기 애플리케이션 테스트 코드
 * 요구사항 명세서에 따른 TDD 방식 개발
 */

// 계산기 로직 테스트
describe('계산기 로직 테스트', () => {
  
  // 각 테스트 전에 DOM 초기화
  beforeEach(() => {
    // 테스트를 위한 가상 DOM 환경 설정
    document.body.innerHTML = `
      <div id="display">0</div>
      <div id="expression"></div>
    `;
    
    // 계산기 초기화
    resetCalculator();
  });
  
  // 1. 기본 연산 테스트
  describe('기본 연산 테스트', () => {
    
    test('덧셈 연산이 정확히 수행되어야 함', () => {
      // 5 + 3 = 8
      pressDigit(5);
      pressOperator('+');
      pressDigit(3);
      pressEquals();
      expect(getDisplayValue()).toBe('8');
      
      // 소수점 덧셈
      resetCalculator();
      pressDigit(1);
      pressDecimal();
      pressDigit(5);
      pressOperator('+');
      pressDigit(2);
      pressDecimal();
      pressDigit(5);
      pressEquals();
      expect(getDisplayValue()).toBe('4');
    });
    
    test('뺄셈 연산이 정확히 수행되어야 함', () => {
      // 10 - 7 = 3
      pressDigit(1);
      pressDigit(0);
      pressOperator('-');
      pressDigit(7);
      pressEquals();
      expect(getDisplayValue()).toBe('3');
      
      // 음수 결과
      resetCalculator();
      pressDigit(5);
      pressOperator('-');
      pressDigit(8);
      pressEquals();
      expect(getDisplayValue()).toBe('-3');
    });
    
    test('곱셈 연산이 정확히 수행되어야 함', () => {
      // 6 × 7 = 42
      pressDigit(6);
      pressOperator('×');
      pressDigit(7);
      pressEquals();
      expect(getDisplayValue()).toBe('42');
    });
    
    test('나눗셈 연산이 정확히 수행되어야 함', () => {
      // 10 ÷ 2 = 5
      pressDigit(1);
      pressDigit(0);
      pressOperator('÷');
      pressDigit(2);
      pressEquals();
      expect(getDisplayValue()).toBe('5');
    });
    
    test('백분율 계산이 정확히 수행되어야 함', () => {
      // 50% = 0.5
      pressDigit(5);
      pressDigit(0);
      pressPercent();
      expect(getDisplayValue()).toBe('0.5');
    });
  });
  
  // 2. 에지 케이스 테스트
  describe('에지 케이스 테스트', () => {
    
    test('0으로 나누기 시 오류 메시지를 표시해야 함', () => {
      // 5 ÷ 0 = Error
      pressDigit(5);
      pressOperator('÷');
      pressDigit(0);
      pressEquals();
      expect(getDisplayValue()).toBe('Error');
    });
    
    test('부호 변경 기능이 정확히 작동해야 함', () => {
      // 5 → -5
      pressDigit(5);
      pressNegate();
      expect(getDisplayValue()).toBe('-5');
      
      // -5 → 5
      pressNegate();
      expect(getDisplayValue()).toBe('5');
    });
  });
  
  // 3. 사용자 입력 테스트
  describe('사용자 입력 테스트', () => {
    test('AC와 C 버튼의 기능을 검증해야 함', () => {
      // AC 테스트
      pressDigit(5);
      pressOperator('+');
      pressDigit(3);
      pressAllClear();
      expect(getDisplayValue()).toBe('0');
      expect(getExpressionValue()).toBe('');
    });
  });
});

// 테스트를 위한 헬퍼 함수들
function getDisplayValue() {
  return document.getElementById('display').textContent;
}

function getExpressionValue() {
  return document.getElementById('expression').textContent;
}

function pressDigit(digit) {
  // 실제 구현에서는 handleDigit 함수를 호출
  handleDigit(digit);
}

function pressOperator(operator) {
  // 실제 구현에서는 handleOperator 함수를 호출
  handleOperator(operator);
}

function pressEquals() {
  // 실제 구현에서는 calculateResult 함수를 호출
  calculateResult();
}

function pressDecimal() {
  // 실제 구현에서는 handleDecimal 함수를 호출
  handleDecimal();
}

function pressPercent() {
  // 실제 구현에서는 handlePercent 함수를 호출
  handlePercent();
}

function pressNegate() {
  // 실제 구현에서는 handleNegate 함수를 호출
  handleNegate();
}

function pressAllClear() {
  // 실제 구현에서는 handleAllClear 함수를 호출
  handleAllClear();
}

function pressClear() {
  // 실제 구현에서는 handleClear 함수를 호출
  handleClear();
}
