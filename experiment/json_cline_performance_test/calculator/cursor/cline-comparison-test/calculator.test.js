/**
 * 계산기 로직 테스트 코드
 */

// 테스트 유틸리티 함수
function describe(testSuiteName, callback) {
	console.log(`\n테스트 스위트: ${testSuiteName}`)
	callback()
}

function it(testName, callback) {
	try {
		callback()
		console.log(`✓ ${testName}`)
	} catch (error) {
		console.error(`✗ ${testName}`)
		console.error(`  ${error.message}`)
	}
}

function expect(actual) {
	return {
		toBe: (expected) => {
			if (actual !== expected) {
				throw new Error(`예상: ${expected}, 실제: ${actual}`)
			}
		},
		toBeCloseTo: (expected, precision = 2) => {
			const factor = Math.pow(10, precision)
			const actualRounded = Math.round(actual * factor) / factor
			const expectedRounded = Math.round(expected * factor) / factor

			if (actualRounded !== expectedRounded) {
				throw new Error(`예상: ${expected}, 실제: ${actual}`)
			}
		},
		toThrow: (expectedError) => {
			try {
				actual()
				throw new Error("예외가 발생하지 않았습니다")
			} catch (error) {
				if (expectedError && !error.message.includes(expectedError)) {
					throw new Error(`예상 에러 메시지: ${expectedError}, 실제 에러 메시지: ${error.message}`)
				}
			}
		},
	}
}

// 계산기 로직 테스트
describe("계산기 로직 테스트", () => {
	// 기본 연산 테스트
	describe("기본 연산", () => {
		it("덧셈: 두 양수", () => {
			expect(Calculator.add(2, 3)).toBe(5)
		})

		it("덧셈: 음수와 양수", () => {
			expect(Calculator.add(-2, 5)).toBe(3)
		})

		it("뺄셈: 큰 수에서 작은 수", () => {
			expect(Calculator.subtract(5, 3)).toBe(2)
		})

		it("뺄셈: 작은 수에서 큰 수", () => {
			expect(Calculator.subtract(3, 5)).toBe(-2)
		})

		it("곱셈: 양수들", () => {
			expect(Calculator.multiply(4, 5)).toBe(20)
		})

		it("곱셈: 양수와 음수", () => {
			expect(Calculator.multiply(4, -5)).toBe(-20)
		})

		it("나눗셈: 나누어 떨어지는 경우", () => {
			expect(Calculator.divide(10, 2)).toBe(5)
		})

		it("나눗셈: 나누어 떨어지지 않는 경우", () => {
			expect(Calculator.divide(10, 3)).toBeCloseTo(3.33, 2)
		})

		it("나눗셈: 0으로 나누기", () => {
			expect(() => Calculator.divide(5, 0)).toThrow("Cannot divide by zero")
		})

		it("제곱 연산", () => {
			expect(Calculator.power(3, 2)).toBe(9)
		})

		it("백분율 계산", () => {
			expect(Calculator.percentage(200, 10)).toBe(20)
		})
	})

	// 소수점 연산 테스트
	describe("소수점 연산", () => {
		it("소수점이 있는 덧셈", () => {
			expect(Calculator.add(0.1, 0.2)).toBeCloseTo(0.3, 1)
		})

		it("소수점이 있는 뺄셈", () => {
			expect(Calculator.subtract(0.5, 0.2)).toBeCloseTo(0.3, 1)
		})

		it("소수점이 있는 곱셈", () => {
			expect(Calculator.multiply(0.1, 0.2)).toBeCloseTo(0.02, 2)
		})

		it("소수점이 있는 나눗셈", () => {
			expect(Calculator.divide(0.6, 0.2)).toBeCloseTo(3, 1)
		})
	})

	// 연속 연산 테스트
	describe("연속 계산", () => {
		it("연속 덧셈", () => {
			const calc = new Calculator()
			calc.setDisplay(5)
			calc.setOperation("+")
			calc.setDisplay(3)
			calc.calculate()
			expect(calc.getDisplay()).toBe(8)

			calc.setOperation("+")
			calc.setDisplay(2)
			calc.calculate()
			expect(calc.getDisplay()).toBe(10)
		})

		it("혼합 연산", () => {
			const calc = new Calculator()
			calc.setDisplay(10)
			calc.setOperation("-")
			calc.setDisplay(4)
			calc.calculate()
			expect(calc.getDisplay()).toBe(6)

			calc.setOperation("*")
			calc.setDisplay(3)
			calc.calculate()
			expect(calc.getDisplay()).toBe(18)

			calc.setOperation("/")
			calc.setDisplay(2)
			calc.calculate()
			expect(calc.getDisplay()).toBe(9)
		})
	})

	// 초기화 및 삭제 테스트
	describe("초기화 및 삭제 기능", () => {
		it("초기화 기능", () => {
			const calc = new Calculator()
			calc.setDisplay(15)
			calc.clear()
			expect(calc.getDisplay()).toBe(0)
		})

		it("마지막 입력 삭제", () => {
			const calc = new Calculator()
			calc.setDisplay(156)
			calc.backspace()
			expect(calc.getDisplay()).toBe(15)
		})
	})

	// 예외 처리 테스트
	describe("예외 처리", () => {
		it("0으로 나누기 시도", () => {
			const calc = new Calculator()
			calc.setDisplay(10)
			calc.setOperation("/")
			calc.setDisplay(0)
			calc.calculate()
			expect(calc.getError()).toBe(true)
			expect(calc.getDisplay()).toBe("Error")
		})

		it("연속 연산자 입력 처리", () => {
			const calc = new Calculator()
			calc.setDisplay(5)
			calc.setOperation("+")
			// 연산자를 다시 설정하면 기존 연산자 대체
			calc.setOperation("-")
			calc.setDisplay(3)
			calc.calculate()
			expect(calc.getDisplay()).toBe(2)
		})

		it("소수점 중복 입력 방지", () => {
			const calc = new Calculator()
			calc.inputDigit("1")
			calc.inputDecimal()
			calc.inputDigit("5")
			calc.inputDecimal() // 중복 입력 시도
			calc.inputDigit("5")
			expect(calc.getDisplay()).toBe(1.55)
		})
	})
})

// 테스트 실행
// 계산기 로직 구현 후 실행할 수 있습니다
