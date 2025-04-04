/**
 * 웹 계산기 UI 스크립트
 * 
 * 이 파일은 계산기 UI와 로직을 연결합니다.
 * calculator.js에서 정의된 Calculator 클래스를 사용하여 계산기 기능을 구현합니다.
 */

document.addEventListener('DOMContentLoaded', function() {
  // 계산기 인스턴스 생성
  const calculator = new Calculator();
  
  // DOM 요소 참조
  const display = document.getElementById('display');
  const keys = document.querySelector('.calculator-keys');
  const testButton = document.getElementById('run-tests');
  const testOutput = document.getElementById('test-output');
  
  // 디스플레이 업데이트 함수
  function updateDisplay() {
    display.textContent = calculator.getDisplayValue();
  }
  
  // 키 이벤트 처리
  keys.addEventListener('click', (event) => {
    const target = event.target;
    
    // 클릭된 요소가 버튼이 아니면 무시
    if (!target.matches('button')) {
      return;
    }
    
    // 숫자 버튼
    if (target.classList.contains('key-number')) {
      calculator.inputDigit(target.textContent);
      updateDisplay();
      return;
    }
    
    // 소수점 버튼
    if (target.classList.contains('key-decimal')) {
      calculator.inputDecimal();
      updateDisplay();
      return;
    }
    
    // 연산자 버튼
    if (target.classList.contains('key-operator')) {
      const action = target.dataset.action;
      let operator;
      
      switch (action) {
        case 'add':
          operator = '+';
          break;
        case 'subtract':
          operator = '-';
          break;
        case 'multiply':
          operator = '*';
          break;
        case 'divide':
          operator = '/';
          break;
      }
      
      calculator.inputOperator(operator);
      updateDisplay();
      return;
    }
    
    // 등호 버튼
    if (target.classList.contains('key-equal')) {
      calculator.performCalculation();
      updateDisplay();
      return;
    }
    
    // 초기화 버튼
    if (target.classList.contains('key-clear')) {
      calculator.reset();
      updateDisplay();
      return;
    }
    
    // 백스페이스 버튼
    if (target.classList.contains('key-backspace')) {
      calculator.backspace();
      updateDisplay();
      return;
    }
  });
  
  // 키보드 이벤트 처리
  document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    // 숫자 키
    if (/^[0-9]$/.test(key)) {
      calculator.inputDigit(key);
      updateDisplay();
      return;
    }
    
    // 소수점 키
    if (key === '.') {
      calculator.inputDecimal();
      updateDisplay();
      return;
    }
    
    // 연산자 키
    if (['+', '-', '*', '/'].includes(key)) {
      calculator.inputOperator(key);
      updateDisplay();
      return;
    }
    
    // 엔터 키 (등호)
    if (key === 'Enter') {
      calculator.performCalculation();
      updateDisplay();
      return;
    }
    
    // 이스케이프 키 (초기화)
    if (key === 'Escape') {
      calculator.reset();
      updateDisplay();
      return;
    }
    
    // 백스페이스 키
    if (key === 'Backspace') {
      calculator.backspace();
      updateDisplay();
      return;
    }
  });
  
  // 테스트 실행 버튼 이벤트 처리
  testButton.addEventListener('click', () => {
    // 콘솔 출력을 캡처하기 위한 설정
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    let testLogs = [];
    
    console.log = function(message) {
      testLogs.push(message);
      originalConsoleLog.apply(console, arguments);
    };
    
    console.error = function(message) {
      testLogs.push(`<span style="color: red;">${message}</span>`);
      originalConsoleError.apply(console, arguments);
    };
    
    // 테스트 실행
    try {
      runTests();
      testOutput.innerHTML = testLogs.join('<br>');
    } catch (error) {
      testOutput.innerHTML = `<span style="color: red;">테스트 실행 중 오류 발생: ${error.message}</span>`;
    } finally {
      // 원래 콘솔 함수 복원
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    }
  });
  
  // 초기 디스플레이 업데이트
  updateDisplay();
});
