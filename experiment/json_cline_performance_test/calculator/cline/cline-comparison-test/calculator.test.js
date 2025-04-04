/**
 * 웹 계산기 애플리케이션 테스트 코드
 * 
 * 이 파일은 계산기 로직에 대한 테스트 케이스를 포함합니다.
 * TDD 방식으로 개발하기 위해 먼저 테스트를 작성한 후 실제 코드를 구현합니다.
 */

// 테스트 프레임워크 함수들
function describe(description, callback) {
  console.log(`\n${description}`);
  callback();
}

function it(description, callback) {
  try {
    callback();
    console.log(`✓ ${description}`);
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toBeCloseTo: (expected, precision = 10) => {
      const factor = Math.pow(10, precision);
      const actualRounded = Math.round(actual * factor) / factor;
      const expectedRounded = Math.round(expected * factor) / factor;
      
      if (actualRounded !== expectedRounded) {
        throw new Error(`Expected ${expected} to be close to ${actual}`);
      }
    },
    toThrow: (expectedError) => {
      try {
        actual();
        throw new Error(`Expected function to throw an error, but it didn't`);
      } catch (error) {
        if (expectedError && !error.message.includes(expectedError)) {
          throw new Error(`Expected error message to include "${expectedError}", but got "${error.message}"`);
        }
      }
    }
  };
}

// 계산기 로직 테스트
describe('계산기 로직 테스트', () => {
  // 덧셈 연산 테스트
  describe('덧셈 연산', () => {
    it('두 양수를 더할 수 있어야 함', () => {
      expect(Calculator.add(5, 3)).toBe(8);
    });

    it('양수와 음수를 더할 수 있어야 함', () => {
      expect(Calculator.add(5, -3)).toBe(2);
    });

    it('두 음수를 더할 수 있어야 함', () => {
      expect(Calculator.add(-5, -3)).toBe(-8);
    });

    it('소수점이 있는 숫자를 더할 수 있어야 함', () => {
      expect(Calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
    });

    it('큰 숫자를 더할 수 있어야 함', () => {
      expect(Calculator.add(999999, 1)).toBe(1000000);
    });
  });

  // 뺄셈 연산 테스트
  describe('뺄셈 연산', () => {
    it('두 양수를 뺄 수 있어야 함', () => {
      expect(Calculator.subtract(5, 3)).toBe(2);
    });

    it('양수에서 더 큰 양수를 뺄 수 있어야 함', () => {
      expect(Calculator.subtract(3, 5)).toBe(-2);
    });

    it('양수에서 음수를 뺄 수 있어야 함', () => {
      expect(Calculator.subtract(5, -3)).toBe(8);
    });

    it('음수에서 양수를 뺄 수 있어야 함', () => {
      expect(Calculator.subtract(-5, 3)).toBe(-8);
    });

    it('소수점이 있는 숫자를 뺄 수 있어야 함', () => {
      expect(Calculator.subtract(0.3, 0.1)).toBeCloseTo(0.2);
    });
  });

  // 곱셈 연산 테스트
  describe('곱셈 연산', () => {
    it('두 양수를 곱할 수 있어야 함', () => {
      expect(Calculator.multiply(5, 3)).toBe(15);
    });

    it('양수와 음수를 곱할 수 있어야 함', () => {
      expect(Calculator.multiply(5, -3)).toBe(-15);
    });

    it('두 음수를 곱할 수 있어야 함', () => {
      expect(Calculator.multiply(-5, -3)).toBe(15);
    });

    it('소수점이 있는 숫자를 곱할 수 있어야 함', () => {
      expect(Calculator.multiply(0.1, 0.2)).toBeCloseTo(0.02);
    });

    it('0과 곱하면 0이 되어야 함', () => {
      expect(Calculator.multiply(5, 0)).toBe(0);
    });
  });

  // 나눗셈 연산 테스트
  describe('나눗셈 연산', () => {
    it('두 양수를 나눌 수 있어야 함', () => {
      expect(Calculator.divide(6, 3)).toBe(2);
    });

    it('양수와 음수를 나눌 수 있어야 함', () => {
      expect(Calculator.divide(6, -3)).toBe(-2);
    });

    it('두 음수를 나눌 수 있어야 함', () => {
      expect(Calculator.divide(-6, -3)).toBe(2);
    });

    it('소수점이 있는 숫자를 나눌 수 있어야 함', () => {
      expect(Calculator.divide(0.6, 0.2)).toBeCloseTo(3);
    });

    it('0으로 나누면 오류가 발생해야 함', () => {
      expect(() => Calculator.divide(5, 0)).toThrow('divide by zero');
    });
  });

  // 계산 상태 관리 테스트
  describe('계산 상태 관리', () => {
    let calculator;

    beforeEach(() => {
      calculator = new Calculator();
    });

    it('숫자를 입력할 수 있어야 함', () => {
      calculator.inputDigit('1');
      calculator.inputDigit('2');
      calculator.inputDigit('3');
      expect(calculator.getDisplayValue()).toBe('123');
    });

    it('소수점을 입력할 수 있어야 함', () => {
      calculator.inputDigit('1');
      calculator.inputDecimal();
      calculator.inputDigit('5');
      expect(calculator.getDisplayValue()).toBe('1.5');
    });

    it('소수점은 한 번만 입력할 수 있어야 함', () => {
      calculator.inputDigit('1');
      calculator.inputDecimal();
      calculator.inputDecimal(); // 두 번째 소수점은 무시되어야 함
      calculator.inputDigit('5');
      expect(calculator.getDisplayValue()).toBe('1.5');
    });

    it('연산자를 입력할 수 있어야 함', () => {
      calculator.inputDigit('5');
      calculator.inputOperator('+');
      calculator.inputDigit('3');
      expect(calculator.getFirstOperand()).toBe(5);
      expect(calculator.getOperator()).toBe('+');
      expect(calculator.getDisplayValue()).toBe('3');
    });

    it('계산을 수행할 수 있어야 함', () => {
      calculator.inputDigit('5');
      calculator.inputOperator('+');
      calculator.inputDigit('3');
      calculator.performCalculation();
      expect(calculator.getDisplayValue()).toBe('8');
    });

    it('연속 계산을 수행할 수 있어야 함', () => {
      calculator.inputDigit('5');
      calculator.inputOperator('+');
      calculator.inputDigit('3');
      calculator.performCalculation(); // 결과: 8
      calculator.inputOperator('*');
      calculator.inputDigit('2');
      calculator.performCalculation(); // 결과: 16
      expect(calculator.getDisplayValue()).toBe('16');
    });

    it('초기화할 수 있어야 함', () => {
      calculator.inputDigit('5');
      calculator.inputOperator('+');
      calculator.inputDigit('3');
      calculator.reset();
      expect(calculator.getDisplayValue()).toBe('0');
      expect(calculator.getFirstOperand()).toBe(null);
      expect(calculator.getOperator()).toBe(null);
    });

    it('백스페이스로 마지막 입력을 삭제할 수 있어야 함', () => {
      calculator.inputDigit('1');
      calculator.inputDigit('2');
      calculator.inputDigit('3');
      calculator.backspace();
      expect(calculator.getDisplayValue()).toBe('12');
    });

    it('0으로 나누기 시도 시 오류 메시지를 표시해야 함', () => {
      calculator.inputDigit('5');
      calculator.inputOperator('/');
      calculator.inputDigit('0');
      calculator.performCalculation();
      expect(calculator.getDisplayValue()).toBe('Error');
    });
  });
});

// 테스트 실행을 위한 헬퍼 함수
function beforeEach(callback) {
  callback();
}

// 테스트 실행
function runTests() {
  // 테스트가 실행되기 전에 Calculator 클래스가 정의되어 있어야 합니다.
  if (typeof Calculator === 'undefined') {
    console.error('Calculator 클래스가 정의되지 않았습니다. 테스트를 실행할 수 없습니다.');
    return;
  }
  
  // 모든 테스트 실행
  describe('계산기 테스트 실행', () => {
    describe('계산기 로직 테스트', () => {
      // 테스트 실행
    });
  });
}

// 브라우저 환경에서 테스트 실행
if (typeof window !== 'undefined') {
  window.onload = runTests;
} else {
  // Node.js 환경에서 테스트 실행
  runTests();
}
