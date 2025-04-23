/**
 * 계산기 UI와 로직 연결
 */

// DOM 요소 가져오기
const displayElement = document.getElementById("display")
const numberButtons = document.querySelectorAll(".number")
const operatorButtons = document.querySelectorAll(".operator")
const equalsButton = document.getElementById("equals")
const clearButton = document.getElementById("clear")
const backspaceButton = document.getElementById("backspace")
const decimalButton = document.getElementById("decimal")

// 계산기 인스턴스 생성
const calculator = new Calculator()

// 화면 업데이트 함수
function updateDisplay() {
	displayElement.textContent = calculator.getDisplay()
}

// 숫자 버튼 이벤트 리스너
numberButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const digit = button.getAttribute("data-number")
		calculator.inputDigit(digit)
		updateDisplay()
	})
})

// 연산자 버튼 이벤트 리스너
operatorButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const operator = button.getAttribute("data-operator")
		calculator.setOperation(operator)
		updateDisplay()
	})
})

// 등호 버튼 이벤트 리스너
equalsButton.addEventListener("click", () => {
	calculator.calculate()
	updateDisplay()
})

// 초기화 버튼 이벤트 리스너
clearButton.addEventListener("click", () => {
	calculator.clear()
	updateDisplay()
})

// 백스페이스 버튼 이벤트 리스너
backspaceButton.addEventListener("click", () => {
	calculator.backspace()
	updateDisplay()
})

// 소수점 버튼 이벤트 리스너
decimalButton.addEventListener("click", () => {
	calculator.inputDecimal()
	updateDisplay()
})

// 키보드 입력 지원
document.addEventListener("keydown", (event) => {
	const key = event.key

	// 숫자 키 (0-9)
	if (/^\d$/.test(key)) {
		calculator.inputDigit(key)
		updateDisplay()
	}

	// 연산자 키
	if (["+", "-", "*", "/", "%", "^"].includes(key)) {
		calculator.setOperation(key)
		updateDisplay()
	}

	// 엔터 키 (등호)
	if (key === "Enter") {
		calculator.calculate()
		updateDisplay()
	}

	// 백스페이스 키
	if (key === "Backspace") {
		calculator.backspace()
		updateDisplay()
	}

	// Escape 키 (초기화)
	if (key === "Escape") {
		calculator.clear()
		updateDisplay()
	}

	// 마침표 키 (소수점)
	if (key === ".") {
		calculator.inputDecimal()
		updateDisplay()
	}
})

// 최초 디스플레이 업데이트
updateDisplay()
