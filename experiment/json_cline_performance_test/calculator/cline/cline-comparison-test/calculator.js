/**
 * 웹 계산기 애플리케이션 로직
 * 
 * 이 파일은 계산기의 핵심 로직을 구현합니다.
 * TDD 방식으로 개발되었으며, calculator.test.js의 테스트를 통과하도록 구현되었습니다.
 */

/**
 * Calculator 클래스 - 계산기의 모든 기능을 구현합니다.
 */
class Calculator {
  constructor() {
    this.reset();
  }

  /**
   * 계산기 상태를 초기화합니다.
   */
  reset() {
    this.displayValue = '0';
    this.firstOperand = null;
    this.waitingForSecondOperand = false;
    this.operator = null;
    this.errorState = false;
  }

  /**
   * 현재 디스플레이 값을 반환합니다.
   * @returns {string} 현재 디스플레이 값
   */
  getDisplayValue() {
    return this.displayValue;
  }

  /**
   * 첫 번째 피연산자 값을 반환합니다.
   * @returns {number|null} 첫 번째 피연산자 값
   */
  getFirstOperand() {
    return this.firstOperand;
  }

  /**
   * 현재 연산자를 반환합니다.
   * @returns {string|null} 현재 연산자
   */
  getOperator() {
    return this.operator;
  }

  /**
   * 숫자를 입력합니다.
   * @param {string} digit - 입력할 숫자 (0-9)
   */
  inputDigit(digit) {
    if (this.errorState) {
      this.reset();
    }

    if (this.waitingForSecondOperand) {
      this.displayValue = digit;
      this.waitingForSecondOperand = false;
    } else {
      // 현재 디스플레이 값이 '0'이면 새 숫자로 대체, 아니면 추가
      this.displayValue = this.displayValue === '0' ? digit : this.displayValue + digit;
    }
  }

  /**
   * 소수점을 입력합니다.
   */
  inputDecimal() {
    if (this.errorState) {
      this.reset();
      this.displayValue = '0.';
      return;
    }

    // 이미 소수점이 있으면 무시
    if (this.displayValue.includes('.')) {
      return;
    }

    // 두 번째 피연산자를 기다리는 상태면 '0.'으로 시작
    if (this.waitingForSecondOperand) {
      this.displayValue = '0.';
      this.waitingForSecondOperand = false;
      return;
    }

    // 소수점 추가
    this.displayValue += '.';
  }

  /**
   * 연산자를 입력합니다.
   * @param {string} nextOperator - 입력할 연산자 (+, -, *, /)
   */
  inputOperator(nextOperator) {
    if (this.errorState) {
      this.reset();
    }

    const inputValue = parseFloat(this.displayValue);

    // 이미 첫 번째 피연산자와 연산자가 있고, 두 번째 피연산자를 기다리는 상태가 아니면 계산 수행
    if (this.operator && !this.waitingForSecondOperand) {
      this.performCalculation();
      // 오류 상태면 여기서 중단
      if (this.errorState) {
        return;
      }
    }

    this.operator = nextOperator;
    this.firstOperand = inputValue;
    this.waitingForSecondOperand = true;
  }

  /**
   * 계산을 수행합니다.
   */
  performCalculation() {
    if (this.errorState) {
      return;
    }

    const inputValue = parseFloat(this.displayValue);
    
    if (this.operator === '/' && inputValue === 0) {
      this.displayValue = 'Error';
      this.errorState = true;
      return;
    }

    let result;
    switch (this.operator) {
      case '+':
        result = Calculator.add(this.firstOperand, inputValue);
        break;
      case '-':
        result = Calculator.subtract(this.firstOperand, inputValue);
        break;
      case '*':
        result = Calculator.multiply(this.firstOperand, inputValue);
        break;
      case '/':
        result = Calculator.divide(this.firstOperand, inputValue);
        break;
      default:
        // 연산자가 없으면 현재 입력값 유지
        return;
    }

    // 결과를 문자열로 변환하여 표시
    this.displayValue = String(result);
    this.firstOperand = result;
    this.waitingForSecondOperand = true;
    this.operator = null;
  }

  /**
   * 백스페이스 기능 - 마지막 입력을 삭제합니다.
   */
  backspace() {
    if (this.errorState) {
      this.reset();
      return;
    }

    if (this.waitingForSecondOperand) {
      return;
    }

    if (this.displayValue.length === 1) {
      this.displayValue = '0';
    } else {
      this.displayValue = this.displayValue.slice(0, -1);
    }
  }

  /**
   * 두 숫자를 더합니다.
   * @param {number} a - 첫 번째 숫자
   * @param {number} b - 두 번째 숫자
   * @returns {number} 덧셈 결과
   */
  static add(a, b) {
    return a + b;
  }

  /**
   * 첫 번째 숫자에서 두 번째 숫자를 뺍니다.
   * @param {number} a - 첫 번째 숫자
   * @param {number} b - 두 번째 숫자
   * @returns {number} 뺄셈 결과
   */
  static subtract(a, b) {
    return a - b;
  }

  /**
   * 두 숫자를 곱합니다.
   * @param {number} a - 첫 번째 숫자
   * @param {number} b - 두 번째 숫자
   * @returns {number} 곱셈 결과
   */
  static multiply(a, b) {
    return a * b;
  }

  /**
   * 첫 번째 숫자를 두 번째 숫자로 나눕니다.
   * @param {number} a - 첫 번째 숫자
   * @param {number} b - 두 번째 숫자
   * @returns {number} 나눗셈 결과
   * @throws {Error} 0으로 나누려고 할 때 오류 발생
   */
  static divide(a, b) {
    if (b === 0) {
      throw new Error('divide by zero');
    }
    return a / b;
  }
}

// 브라우저 환경에서 전역 객체로 노출
if (typeof window !== 'undefined') {
  window.Calculator = Calculator;
}

// Node.js 환경에서 모듈로 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Calculator;
}
