/**
 * 웹 계산기 애플리케이션 UI 및 추가 기능
 * 요구사항 명세서에 따른 TDD 방식 개발
 */

// 백분율 버튼 처리 함수
function handlePercent() {
  const inputValue = parseFloat(displayValue);
  const percentValue = inputValue / 100;
  displayValue = percentValue.toString();
  updateDisplay();
}

// 부호 변경 버튼 처리 함수
function handleNegate() {
  const inputValue = parseFloat(displayValue);
  displayValue = (-inputValue).toString();
  updateDisplay();
}

// 모두 지우기(AC) 버튼 처리 함수
function handleAllClear() {
  resetCalculator();
}

// 현재 입력 지우기(C) 버튼 처리 함수
function handleClear() {
  displayValue = '0';
  if (waitingForSecondOperand) {
    waitingForSecondOperand = false;
  }
  updateDisplay();
}

// 키보드 입력 처리 함수
function handleKeyboardInput(event) {
  // 숫자 키 (0-9)
  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    handleDigit(parseInt(event.key));
  }
  // 연산자 키
  else if (event.key === '+') {
    event.preventDefault();
    handleOperator('+');
  }
  else if (event.key === '-') {
    event.preventDefault();
    handleOperator('-');
  }
  else if (event.key === '*') {
    event.preventDefault();
    handleOperator('×');
  }
  else if (event.key === '/') {
    event.preventDefault();
    handleOperator('÷');
  }
  // 등호 키 (Enter 또는 =)
  else if (event.key === '=' || event.key === 'Enter') {
    event.preventDefault();
    calculateResult();
  }
  // 소수점 키
  else if (event.key === '.') {
    event.preventDefault();
    handleDecimal();
  }
  // 백스페이스 키 (C 기능)
  else if (event.key === 'Backspace') {
    event.preventDefault();
    handleClear();
  }
  // Escape 키 (AC 기능)
  else if (event.key === 'Escape') {
    event.preventDefault();
    handleAllClear();
  }
  // % 키
  else if (event.key === '%') {
    event.preventDefault();
    handlePercent();
  }
}

// 버튼 클릭 이벤트 설정 함수
function setupButtonListeners() {
  // 숫자 버튼 (0-9)
  document.querySelectorAll('.digit').forEach(button => {
    button.addEventListener('click', () => {
      handleDigit(parseInt(button.textContent));
    });
  });
  
  // 연산자 버튼
  document.querySelectorAll('.operator').forEach(button => {
    button.addEventListener('click', () => {
      handleOperator(button.textContent);
    });
  });
  
  // 등호 버튼
  document.querySelector('.equals').addEventListener('click', calculateResult);
  
  // 소수점 버튼
  document.querySelector('.decimal').addEventListener('click', handleDecimal);
  
  // 백분율 버튼
  document.querySelector('.percent').addEventListener('click', handlePercent);
  
  // 부호 변경 버튼
  document.querySelector('.negate').addEventListener('click', handleNegate);
  
  // AC 버튼
  document.querySelector('.all-clear').addEventListener('click', handleAllClear);
  
  // C 버튼
  document.querySelector('.clear').addEventListener('click', handleClear);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  resetCalculator();
  
  // 버튼 이벤트 리스너 설정
  setupButtonListeners();
  
  // 키보드 이벤트 리스너 설정
  document.addEventListener('keydown', handleKeyboardInput);
});
