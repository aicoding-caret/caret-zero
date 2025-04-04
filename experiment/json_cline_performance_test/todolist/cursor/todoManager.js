/**
 * TodoManager - Todo 항목 관리 모듈
 *
 * 이 모듈은 Todo 리스트의 핵심 기능(추가, 조회, 완료 토글, 삭제)과
 * 데이터 지속성(localStorage 저장/로드)을 담당합니다.
 */

// Todo 항목 저장 배열
let todos = []

// localStorage 키 상수
const STORAGE_KEY = "todos"

/**
 * TodoManager 모듈
 */
const TodoManager = {
	/**
	 * TodoManager 초기화 - localStorage에서 Todo 항목 로드
	 */
	initializeTodos: function () {
		this.loadTodos()
	},

	/**
	 * 새 Todo 항목 추가
	 * @param {string} text - Todo 항목 내용
	 * @returns {string|null} - 추가된 Todo의 ID 또는 빈 내용일 경우 null
	 */
	addTodo: function (text) {
		// 빈 내용이나 공백만 있는 항목은 추가하지 않음
		const trimmedText = text.trim()
		if (!trimmedText) {
			return null
		}

		// 최대 항목 수 제한 (100개)
		if (todos.length >= 100) {
			return null
		}

		// 새 Todo 항목 생성
		const newTodo = {
			id: this.generateId(),
			text: trimmedText,
			completed: false,
		}

		// 배열에 추가
		todos.push(newTodo)

		// localStorage에 저장
		this.saveTodos()

		return newTodo.id
	},

	/**
	 * 모든 Todo 항목 조회
	 * @returns {Array} - Todo 항목 배열
	 */
	getTodos: function () {
		return [...todos] // 배열 복사본 반환
	},

	/**
	 * Todo 항목 완료 상태 토글
	 * @param {string} id - 토글할 Todo 항목의 ID
	 */
	toggleTodo: function (id) {
		// ID와 일치하는 항목 찾기
		const todoIndex = todos.findIndex((todo) => todo.id === id)

		// 일치하는 항목이 없으면 아무 작업도 하지 않음
		if (todoIndex === -1) {
			return
		}

		// 완료 상태 토글
		todos[todoIndex].completed = !todos[todoIndex].completed

		// localStorage에 저장
		this.saveTodos()
	},

	/**
	 * Todo 항목 삭제
	 * @param {string} id - 삭제할 Todo 항목의 ID
	 */
	deleteTodo: function (id) {
		// ID와 일치하는 항목 필터링
		const originalLength = todos.length
		todos = todos.filter((todo) => todo.id !== id)

		// 항목이 삭제된 경우에만 localStorage에 저장
		if (todos.length !== originalLength) {
			this.saveTodos()
		}
	},

	/**
	 * Todo 항목을 localStorage에 저장
	 */
	saveTodos: function () {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
	},

	/**
	 * localStorage에서 Todo 항목 로드
	 */
	loadTodos: function () {
		const storedTodos = localStorage.getItem(STORAGE_KEY)

		// 저장된 항목이 있으면 파싱하여 배열에 저장
		if (storedTodos) {
			todos = JSON.parse(storedTodos)
		} else {
			todos = []
		}
	},

	/**
	 * 고유 ID 생성
	 * @returns {string} - 생성된 고유 ID
	 */
	generateId: function () {
		return Date.now().toString() + Math.random().toString(36).substr(2, 5)
	},
}

// Node.js 환경에서 모듈 내보내기
if (typeof module !== "undefined" && module.exports) {
	module.exports = TodoManager
}
