/**
 * 웹 계산기 애플리케이션 핵심 로직
 * 요구사항 명세서에 따른 TDD 방식 개발
 */

// 계산기 상태 변수
let displayValue = "0"
let firstOperand = null
let operator = null
let waitingForSecondOperand = false
let expressionValue = ""

// 계산기 초기화 함수
function resetCalculator() {
	displayValue = "0"
	firstOperand = null
	operator = null
	waitingForSecondOperand = false
	expressionValue = ""
	updateDisplay()
}

// 화면 업데이트 함수
function updateDisplay() {
	if (document.getElementById("display")) {
		document.getElementById("display").textContent = displayValue
	}
	if (document.getElementById("expression")) {
		document.getElementById("expression").textContent = expressionValue
	}
}

// 숫자 버튼 처리 함수
function handleDigit(digit) {
	if (waitingForSecondOperand) {
		displayValue = digit.toString()
		waitingForSecondOperand = false
	} else {
		displayValue = displayValue === "0" || displayValue === "Error" ? digit.toString() : displayValue + digit.toString()
	}
	updateDisplay()
}

// 소수점 버튼 처리 함수
function handleDecimal() {
	if (displayValue.includes(".")) return

	if (waitingForSecondOperand) {
		displayValue = "0."
		waitingForSecondOperand = false
	} else {
		displayValue += "."
	}
	updateDisplay()
}

// 연산자 버튼 처리 함수
function handleOperator(nextOperator) {
	const inputValue = parseFloat(displayValue)

	if (displayValue === "Error") return

	if (operator && waitingForSecondOperand) {
		operator = nextOperator
		expressionValue = expressionValue.slice(0, -2) + " " + nextOperator
		updateDisplay()
		return
	}

	if (firstOperand === null) {
		firstOperand = inputValue
	} else if (operator) {
		const result = performCalculation()
		displayValue = result
		firstOperand = parseFloat(result)
	}

	waitingForSecondOperand = true
	operator = nextOperator
	expressionValue = firstOperand + " " + nextOperator
	updateDisplay()
}

// 계산 실행 함수
function calculateResult() {
	if (displayValue === "Error") return

	const inputValue = parseFloat(displayValue)

	if (operator && firstOperand !== null) {
		const result = performCalculation()
		expressionValue += " " + inputValue + " = "
		displayValue = result
		firstOperand = null
		operator = null
		waitingForSecondOperand = true
		updateDisplay()
	}
}

// 실제 계산 수행 함수
function performCalculation() {
	const secondOperand = parseFloat(displayValue)
	let result

	switch (operator) {
		case "+":
			result = firstOperand + secondOperand
			break
		case "-":
			result = firstOperand - secondOperand
			break
		case "×":
			result = firstOperand * secondOperand
			break
		case "÷":
			if (secondOperand === 0) {
				return "Error"
			}
			result = firstOperand / secondOperand
			break
		default:
			return secondOperand
	}

	// 부동 소수점 정밀도 문제 처리
	const resultStr = result.toString()
	if (resultStr.includes(".") && resultStr.length > 12) {
		return parseFloat(result.toFixed(10)).toString()
	}

	return result.toString()
}
