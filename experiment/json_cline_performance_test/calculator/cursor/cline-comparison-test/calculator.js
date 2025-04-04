/**
 * 계산기 로직 구현
 */

// 정적 계산 메서드를 가진 Calculator 클래스
class Calculator {
  constructor() {
    this.clear();
  }

  // 상태 초기화
  clear() {
    this.displayValue = 0;
    this.firstOperand = null;
    this.waitingForSecondOperand = false;
    this.operator = null;
    this.error = false;
    this.hasDecimal = false;
  }

  // 디스플레이 값 가져오기
  getDisplay() {
    return this.displayValue;
  }

  // 에러 상태 가져오기
  getError() {
    return this.error;
  }

  // 디스플레이 값 설정
  setDisplay(value) {
    this.displayValue = value;
    this.hasDecimal = String(value).includes('.');
    return this;
  }

  // 연산자 설정
  setOperation(operator) {
    if (this.operator !== null && this.waitingForSecondOperand) {
      this.operator = operator;
      return this;
    }

    if (this.firstOperand === null) {
      this.firstOperand = this.displayValue;
    } else if (this.operator) {
      const result = this.performCalculation();
      this.displayValue = result;
      this.firstOperand = result;
    }

    this.waitingForSecondOperand = true;
    this.operator = operator;
    this.hasDecimal = false;
    return this;
  }

  // 숫자 입력
  inputDigit(digit) {
    if (this.waitingForSecondOperand) {
      this.displayValue = digit;
      this.waitingForSecondOperand = false;
      this.hasDecimal = false;
    } else {
      // 현재 표시 값이 0이거나 오류 상태면 그 값을 대체
      if (this.displayValue === 0 || this.displayValue === 'Error') {
        this.displayValue = digit;
        this.error = false;
      } else {
        // 그렇지 않으면 현재 값에 추가
        this.displayValue = this.displayValue + digit;
      }
    }
    return this;
  }

  // 소수점 입력
  inputDecimal() {
    if (this.hasDecimal) {
      return this; // 이미 소수점이 있으면 무시
    }
    
    if (this.waitingForSecondOperand) {
      this.displayValue = '0.';
      this.waitingForSecondOperand = false;
    } else {
      this.displayValue = this.displayValue + '.';
    }
    
    this.hasDecimal = true;
    return this;
  }

  // 백스페이스 - 마지막 입력 삭제
  backspace() {
    if (typeof this.displayValue === 'string') {
      if (this.displayValue.length > 1) {
        this.displayValue = this.displayValue.substring(0, this.displayValue.length - 1);
        this.hasDecimal = String(this.displayValue).includes('.');
      } else {
        this.displayValue = 0;
        this.hasDecimal = false;
      }
    } else if (this.displayValue !== 0) {
      this.displayValue = Math.floor(this.displayValue / 10);
      this.hasDecimal = String(this.displayValue).includes('.');
    }
    return this;
  }

  // 계산 실행
  calculate() {
    if (this.operator === null || this.firstOperand === null) {
      return this;
    }

    const result = this.performCalculation();
    
    // 상태 재설정
    this.displayValue = this.error ? 'Error' : result;
    this.firstOperand = result;
    this.waitingForSecondOperand = true;
    this.operator = null;
    this.hasDecimal = String(result).includes('.');
    
    return this;
  }

  // 실제 계산 로직
  performCalculation() {
    const firstOperand = parseFloat(this.firstOperand);
    const secondOperand = parseFloat(this.displayValue);
    let result = 0;
    this.error = false;

    try {
      switch (this.operator) {
        case '+':
          result = Calculator.add(firstOperand, secondOperand);
          break;
        case '-':
          result = Calculator.subtract(firstOperand, secondOperand);
          break;
        case '*':
          result = Calculator.multiply(firstOperand, secondOperand);
          break;
        case '/':
          result = Calculator.divide(firstOperand, secondOperand);
          break;
        case '%':
          result = Calculator.percentage(firstOperand, secondOperand);
          break;
        case '^':
          result = Calculator.power(firstOperand, secondOperand);
          break;
        default:
          return this.displayValue;
      }
    } catch (error) {
      this.error = true;
      return 'Error';
    }

    // 결과가 무한대이거나 NaN인 경우 오류 처리
    if (!isFinite(result) || isNaN(result)) {
      this.error = true;
      return 'Error';
    }

    return result;
  }

  // 정적 계산 메서드
  static add(a, b) {
    return a + b;
  }

  static subtract(a, b) {
    return a - b;
  }

  static multiply(a, b) {
    return a * b;
  }

  static divide(a, b) {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a / b;
  }

  static power(a, b) {
    return Math.pow(a, b);
  }

  static percentage(a, b) {
    return (a * b) / 100;
  }
}

// Node.js 환경에서 모듈로 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Calculator;
} 