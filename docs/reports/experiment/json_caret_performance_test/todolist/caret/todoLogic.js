/**
 * Todo 리스트 관리 클래스
 */
class TodoManager {
	/**
	 * TodoManager 생성자
	 * 로컬 스토리지에서 기존 Todo 항목을 로드합니다.
	 */
	constructor() {
		this.todos = []
		this.loadTodos()
	}

	/**
	 * 새로운 Todo 항목을 추가합니다.
	 * @param {string} text - Todo 항목의 텍스트
	 * @returns {Object|null} 추가된 Todo 객체 또는 실패 시 null
	 */
	addTodo(text) {
		if (!text || text.trim() === "") {
			return null
		}

		const newTodo = {
			id: this._generateId(),
			text: text.trim(),
			completed: false,
			createdAt: new Date(),
		}

		this.todos.unshift(newTodo) // 목록의 맨 위에 추가
		this.saveTodos()

		return newTodo
	}

	/**
	 * Todo 항목의 완료 상태를 토글합니다.
	 * @param {string} id - 토글할 Todo 항목의 ID
	 * @returns {boolean} 토글 성공 여부
	 */
	toggleTodo(id) {
		const todoIndex = this.todos.findIndex((todo) => todo.id === id)

		if (todoIndex === -1) {
			return false
		}

		this.todos[todoIndex].completed = !this.todos[todoIndex].completed
		this.saveTodos()

		return true
	}

	/**
	 * Todo 항목을 삭제합니다.
	 * @param {string} id - 삭제할 Todo 항목의 ID
	 * @returns {boolean} 삭제 성공 여부
	 */
	deleteTodo(id) {
		const initialLength = this.todos.length
		this.todos = this.todos.filter((todo) => todo.id !== id)

		const deleted = initialLength > this.todos.length

		if (deleted) {
			this.saveTodos()
		}

		return deleted
	}

	/**
	 * 모든 Todo 항목을 반환합니다.
	 * @returns {Array} Todo 항목 배열
	 */
	getTodos() {
		return [...this.todos]
	}

	/**
	 * Todo 항목을 로컬 스토리지에 저장합니다.
	 */
	saveTodos() {
		try {
			localStorage.setItem("todos", JSON.stringify(this.todos))
		} catch (error) {
			console.error("로컬 스토리지에 Todo 항목을 저장하는 중 오류 발생:", error)
		}
	}

	/**
	 * 로컬 스토리지에서 Todo 항목을 로드합니다.
	 */
	loadTodos() {
		try {
			const storedTodos = localStorage.getItem("todos")

			if (storedTodos) {
				const parsedTodos = JSON.parse(storedTodos)

				// 테스트 환경에서는 이전 테스트의 데이터가 남아있을 수 있으므로 초기화
				this.todos = []

				// Date 객체 복원
				parsedTodos.forEach((todo) => {
					const todoItem = { ...todo }
					if (typeof todoItem.createdAt === "string") {
						todoItem.createdAt = new Date(todoItem.createdAt)
					}
					this.todos.push(todoItem)
				})
			}
		} catch (error) {
			console.error("로컬 스토리지에서 Todo 항목을 로드하는 중 오류 발생:", error)
			this.todos = []
		}
	}

	/**
	 * 고유한 ID를 생성합니다.
	 * @returns {string} 생성된 ID
	 * @private
	 */
	_generateId() {
		return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
	}
}
