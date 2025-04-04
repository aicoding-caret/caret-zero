// Todo 리스트 로직 테스트

// 테스트 유틸리티 함수
function assertEquals(actual, expected, message) {
	if (JSON.stringify(actual) !== JSON.stringify(expected)) {
		console.error(
			`❌ ${message || "Assertion failed"}: expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`,
		)
		throw new Error(`Assertion failed: expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`)
	}
	console.log(`✅ ${message || "Assertion passed"}`)
	return true
}

function assertTrue(condition, message) {
	if (!condition) {
		console.error(`❌ ${message || "Assertion failed"}: expected true, but got false`)
		throw new Error(`Assertion failed: expected true, but got false`)
	}
	console.log(`✅ ${message || "Assertion passed"}`)
	return true
}

function assertFalse(condition, message) {
	if (condition) {
		console.error(`❌ ${message || "Assertion failed"}: expected false, but got true`)
		throw new Error(`Assertion failed: expected false, but got true`)
	}
	console.log(`✅ ${message || "Assertion passed"}`)
	return true
}

// 로컬 스토리지 모킹
class LocalStorageMock {
	constructor() {
		this.store = {}
	}

	getItem(key) {
		return this.store[key] || null
	}

	setItem(key, value) {
		this.store[key] = String(value)
	}

	removeItem(key) {
		delete this.store[key]
	}

	clear() {
		this.store = {}
	}
}

// 테스트 실행 함수
function runTests() {
	console.log("테스트 시작...")

	// 결과 추적
	let passedTests = 0
	let totalTests = 0

	// 테스트 케이스 실행 함수
	function runTest(testName, testFn) {
		totalTests++
		console.log(`\n테스트 실행: ${testName}`)

		try {
			// 각 테스트마다 새로운 로컬 스토리지 모킹
			const mockStorage = new LocalStorageMock()

			// 테스트 실행
			testFn(mockStorage)

			console.log(`✅ Test passed: ${testName}`)
			passedTests++
		} catch (error) {
			console.error(`❌ Test failed: ${testName}`)
			console.error(error)
		}
	}

	// 테스트 케이스 1: Todo 항목 추가
	runTest("Todo 항목 추가 - 유효한 텍스트", (mockStorage) => {
		// TodoManager 모킹
		const todoManager = {
			todos: [],
			addTodo: function (text) {
				if (!text || text.trim() === "") {
					return null
				}

				const newTodo = {
					id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
					text: text.trim(),
					completed: false,
					createdAt: new Date(),
				}

				this.todos.unshift(newTodo)
				return newTodo
			},
			getTodos: function () {
				return [...this.todos]
			},
		}

		// 목록이 비어있는지 확인
		assertEquals(todoManager.getTodos().length, 0, "테스트 시작 시 Todo 목록이 비어있어야 함")

		const result = todoManager.addTodo("테스트 할 일")
		assertTrue(result !== null, "유효한 Todo 항목 추가 결과가 null이 아니어야 함")
		assertEquals(todoManager.getTodos().length, 1, "Todo 목록에 항목이 추가되어야 함")

		const todo = todoManager.getTodos()[0]
		assertTrue(typeof todo.id === "string", "Todo ID는 문자열이어야 함")
		assertEquals(todo.text, "테스트 할 일", "Todo 텍스트가 일치해야 함")
		assertEquals(todo.completed, false, "새 Todo는 미완료 상태여야 함")
		assertTrue(todo.createdAt instanceof Date || !isNaN(new Date(todo.createdAt).getTime()), "createdAt은 유효한 날짜여야 함")
	})

	runTest("Todo 항목 추가 - 빈 텍스트", (mockStorage) => {
		// TodoManager 모킹
		const todoManager = {
			todos: [],
			addTodo: function (text) {
				if (!text || text.trim() === "") {
					return null
				}

				const newTodo = {
					id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
					text: text.trim(),
					completed: false,
					createdAt: new Date(),
				}

				this.todos.unshift(newTodo)
				return newTodo
			},
			getTodos: function () {
				return [...this.todos]
			},
		}

		// 목록이 비어있는지 확인
		assertEquals(todoManager.getTodos().length, 0, "테스트 시작 시 Todo 목록이 비어있어야 함")

		const result = todoManager.addTodo("")
		assertEquals(result, null, "빈 텍스트로 Todo 추가 시 null을 반환해야 함")
		assertEquals(todoManager.getTodos().length, 0, "Todo 목록에 항목이 추가되지 않아야 함")
	})

	// 테스트 케이스 2: Todo 항목 완료 토글
	runTest("Todo 항목 완료 토글 - false에서 true로", (mockStorage) => {
		// TodoManager 모킹
		const todoManager = {
			todos: [],
			addTodo: function (text) {
				if (!text || text.trim() === "") {
					return null
				}

				const newTodo = {
					id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
					text: text.trim(),
					completed: false,
					createdAt: new Date(),
				}

				this.todos.unshift(newTodo)
				return newTodo
			},
			toggleTodo: function (id) {
				const todoIndex = this.todos.findIndex((todo) => todo.id === id)

				if (todoIndex === -1) {
					return false
				}

				this.todos[todoIndex].completed = !this.todos[todoIndex].completed
				return true
			},
			getTodos: function () {
				return [...this.todos]
			},
		}

		const todo = todoManager.addTodo("토글 테스트")
		const todoId = todo.id

		todoManager.toggleTodo(todoId)
		const updatedTodo = todoManager.getTodos().find((t) => t.id === todoId)

		assertEquals(updatedTodo.completed, true, "Todo 항목이 완료 상태로 변경되어야 함")
	})

	runTest("Todo 항목 완료 토글 - true에서 false로", (mockStorage) => {
		// TodoManager 모킹
		const todoManager = {
			todos: [],
			addTodo: function (text) {
				if (!text || text.trim() === "") {
					return null
				}

				const newTodo = {
					id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
					text: text.trim(),
					completed: false,
					createdAt: new Date(),
				}

				this.todos.unshift(newTodo)
				return newTodo
			},
			toggleTodo: function (id) {
				const todoIndex = this.todos.findIndex((todo) => todo.id === id)

				if (todoIndex === -1) {
					return false
				}

				this.todos[todoIndex].completed = !this.todos[todoIndex].completed
				return true
			},
			getTodos: function () {
				return [...this.todos]
			},
		}

		const todo = todoManager.addTodo("토글 테스트")
		const todoId = todo.id

		// 먼저 true로 변경
		todoManager.toggleTodo(todoId)
		// 다시 false로 변경
		todoManager.toggleTodo(todoId)

		const updatedTodo = todoManager.getTodos().find((t) => t.id === todoId)
		assertEquals(updatedTodo.completed, false, "Todo 항목이 미완료 상태로 변경되어야 함")
	})

	// 테스트 케이스 3: Todo 항목 삭제
	runTest("Todo 항목 삭제 - 존재하는 ID", (mockStorage) => {
		// TodoManager 모킹
		const todoManager = {
			todos: [],
			addTodo: function (text) {
				if (!text || text.trim() === "") {
					return null
				}

				const newTodo = {
					id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
					text: text.trim(),
					completed: false,
					createdAt: new Date(),
				}

				this.todos.unshift(newTodo)
				return newTodo
			},
			deleteTodo: function (id) {
				const initialLength = this.todos.length
				this.todos = this.todos.filter((todo) => todo.id !== id)

				return initialLength > this.todos.length
			},
			getTodos: function () {
				return [...this.todos]
			},
		}

		const todo = todoManager.addTodo("삭제 테스트")
		const todoId = todo.id
		const initialCount = todoManager.getTodos().length

		todoManager.deleteTodo(todoId)
		const afterCount = todoManager.getTodos().length

		assertEquals(afterCount, initialCount - 1, "Todo 항목이 삭제되어야 함")
		assertEquals(
			todoManager.getTodos().find((t) => t.id === todoId),
			undefined,
			"삭제된 Todo는 찾을 수 없어야 함",
		)
	})

	runTest("Todo 항목 삭제 - 존재하지 않는 ID", (mockStorage) => {
		// TodoManager 모킹
		const todoManager = {
			todos: [],
			addTodo: function (text) {
				if (!text || text.trim() === "") {
					return null
				}

				const newTodo = {
					id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
					text: text.trim(),
					completed: false,
					createdAt: new Date(),
				}

				this.todos.unshift(newTodo)
				return newTodo
			},
			deleteTodo: function (id) {
				const initialLength = this.todos.length
				this.todos = this.todos.filter((todo) => todo.id !== id)

				return initialLength > this.todos.length
			},
			getTodos: function () {
				return [...this.todos]
			},
		}

		todoManager.addTodo("삭제 테스트")
		const initialCount = todoManager.getTodos().length

		// 존재하지 않는 ID로 삭제 시도
		todoManager.deleteTodo("non-existent-id")
		const afterCount = todoManager.getTodos().length

		assertEquals(afterCount, initialCount, "Todo 항목 수가 변경되지 않아야 함")
	})

	// 테스트 케이스 4: 로컬 스토리지 저장 및 로드
	runTest("로컬 스토리지 저장", (mockStorage) => {
		// TodoManager 모킹
		const todoManager = {
			todos: [],
			addTodo: function (text) {
				if (!text || text.trim() === "") {
					return null
				}

				const newTodo = {
					id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
					text: text.trim(),
					completed: false,
					createdAt: new Date(),
				}

				this.todos.unshift(newTodo)
				return newTodo
			},
			saveTodos: function () {
				mockStorage.setItem("todos", JSON.stringify(this.todos))
			},
			getTodos: function () {
				return [...this.todos]
			},
		}

		// 로컬 스토리지 초기화 확인
		assertEquals(mockStorage.getItem("todos"), null, "테스트 시작 시 로컬 스토리지가 비어있어야 함")

		todoManager.addTodo("저장 테스트 1")
		todoManager.addTodo("저장 테스트 2")

		// 명시적으로 저장 호출
		todoManager.saveTodos()

		// 저장된 데이터 확인
		const storedData = mockStorage.getItem("todos")
		assertTrue(storedData !== null, "로컬 스토리지에 데이터가 저장되어야 함")

		// 저장된 데이터 파싱
		const parsedData = JSON.parse(storedData)
		assertEquals(parsedData.length, 2, "저장된 Todo 항목 수가 일치해야 함")
	})

	runTest("로컬 스토리지 로드", (mockStorage) => {
		// 로컬 스토리지 초기화 확인
		assertEquals(mockStorage.getItem("todos"), null, "테스트 시작 시 로컬 스토리지가 비어있어야 함")

		// 데이터 직접 저장
		const testData = [
			{
				id: "test-id-1",
				text: "로드 테스트 1",
				completed: false,
				createdAt: new Date().toISOString(),
			},
			{
				id: "test-id-2",
				text: "로드 테스트 2",
				completed: false,
				createdAt: new Date().toISOString(),
			},
		]

		// 로컬 스토리지에 직접 저장
		mockStorage.setItem("todos", JSON.stringify(testData))

		// 저장된 데이터 확인
		const storedData = mockStorage.getItem("todos")
		assertTrue(storedData !== null, "로컬 스토리지에 데이터가 저장되어야 함")

		// TodoManager 모킹
		const todoManager = {
			todos: [],
			loadTodos: function () {
				const storedTodos = mockStorage.getItem("todos")

				if (storedTodos) {
					const parsedTodos = JSON.parse(storedTodos)

					this.todos = []

					parsedTodos.forEach((todo) => {
						const todoItem = { ...todo }
						if (typeof todoItem.createdAt === "string") {
							todoItem.createdAt = new Date(todoItem.createdAt)
						}
						this.todos.push(todoItem)
					})
				}
			},
			getTodos: function () {
				return [...this.todos]
			},
		}

		// 로컬 스토리지에서 데이터 로드
		todoManager.loadTodos()
		const loadedTodos = todoManager.getTodos()

		assertEquals(loadedTodos.length, 2, "로드된 Todo 항목 수가 일치해야 함")
		assertEquals(loadedTodos[0].text, "로드 테스트 1", "로드된 첫 번째 Todo 텍스트가 일치해야 함")
		assertEquals(loadedTodos[1].text, "로드 테스트 2", "로드된 두 번째 Todo 텍스트가 일치해야 함")
	})

	// 결과 출력
	console.log(`\n테스트 결과: ${passedTests}/${totalTests} 통과`)
}

// 테스트 실행
document.addEventListener("DOMContentLoaded", runTests)
