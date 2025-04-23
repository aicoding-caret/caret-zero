/**
 * Todo 리스트 애플리케이션 로직
 */
class TodoList {
	constructor() {
		this.todos = []
		this.loadFromLocalStorage()
	}

	/**
	 * 새로운 Todo 항목 추가
	 * @param {string} text - Todo 항목 텍스트
	 * @returns {object} 추가된 Todo 항목
	 */
	addTodo(text) {
		if (!text.trim()) return null

		const newTodo = {
			id: Date.now().toString(),
			text: text.trim(),
			completed: false,
			createdAt: new Date(),
		}

		this.todos.push(newTodo)
		this.saveToLocalStorage()
		return newTodo
	}

	/**
	 * 모든 Todo 항목 조회
	 * @returns {Array} 모든 Todo 항목 배열
	 */
	getAll() {
		return [...this.todos]
	}

	/**
	 * 특정 상태의 Todo 항목 필터링
	 * @param {string} filter - 필터 유형 ('all', 'active', 'completed')
	 * @returns {Array} 필터링된 Todo 항목 배열
	 */
	getFiltered(filter) {
		switch (filter) {
			case "active":
				return this.todos.filter((todo) => !todo.completed)
			case "completed":
				return this.todos.filter((todo) => todo.completed)
			default:
				return this.getAll()
		}
	}

	/**
	 * Todo 항목 완료 상태 토글
	 * @param {string} id - 토글할 Todo 항목 ID
	 * @returns {object|null} 업데이트된 Todo 항목 또는 찾지 못한 경우 null
	 */
	toggleTodo(id) {
		const todoIndex = this.todos.findIndex((todo) => todo.id === id)
		if (todoIndex === -1) return null

		this.todos[todoIndex].completed = !this.todos[todoIndex].completed
		this.saveToLocalStorage()
		return this.todos[todoIndex]
	}

	/**
	 * Todo 항목 삭제
	 * @param {string} id - 삭제할 Todo 항목 ID
	 * @returns {boolean} 삭제 성공 여부
	 */
	deleteTodo(id) {
		const initialLength = this.todos.length
		this.todos = this.todos.filter((todo) => todo.id !== id)

		if (initialLength !== this.todos.length) {
			this.saveToLocalStorage()
			return true
		}
		return false
	}

	/**
	 * Todo 항목을 로컬 스토리지에 저장
	 */
	saveToLocalStorage() {
		localStorage.setItem("todos", JSON.stringify(this.todos))
	}

	/**
	 * 로컬 스토리지에서 Todo 항목 로드
	 */
	loadFromLocalStorage() {
		const storedTodos = localStorage.getItem("todos")
		if (storedTodos) {
			try {
				this.todos = JSON.parse(storedTodos)
			} catch (e) {
				console.error("로컬 스토리지에서 Todo 항목을 로드하는 중 오류 발생:", e)
				this.todos = []
			}
		}
	}
}

// DOM 조작 로직
document.addEventListener("DOMContentLoaded", () => {
	const todoList = new TodoList()
	let currentFilter = "all"

	// DOM 요소
	const todoForm = document.getElementById("todo-form")
	const todoInput = document.getElementById("todo-input")
	const todoListElement = document.getElementById("todo-list")
	const filterButtons = document.querySelectorAll(".filter-btn")

	// Todo 항목 렌더링
	function renderTodos() {
		const todos = todoList.getFiltered(currentFilter)
		todoListElement.innerHTML = ""

		todos.forEach((todo) => {
			const todoItem = document.createElement("li")
			todoItem.className = "todo-item"
			todoItem.dataset.id = todo.id

			const checkbox = document.createElement("input")
			checkbox.type = "checkbox"
			checkbox.className = "todo-checkbox"
			checkbox.checked = todo.completed

			const todoText = document.createElement("span")
			todoText.className = "todo-text"
			todoText.textContent = todo.text
			if (todo.completed) {
				todoText.classList.add("completed")
			}

			const deleteButton = document.createElement("button")
			deleteButton.className = "delete-btn"
			deleteButton.innerHTML = "&times;"

			todoItem.appendChild(checkbox)
			todoItem.appendChild(todoText)
			todoItem.appendChild(deleteButton)
			todoListElement.appendChild(todoItem)

			// 이벤트 리스너
			checkbox.addEventListener("change", () => {
				todoList.toggleTodo(todo.id)
				renderTodos()
			})

			deleteButton.addEventListener("click", () => {
				todoList.deleteTodo(todo.id)
				renderTodos()
			})
		})
	}

	// 필터 버튼 활성화
	function setActiveFilter(filter) {
		filterButtons.forEach((btn) => {
			if (btn.dataset.filter === filter) {
				btn.classList.add("active")
			} else {
				btn.classList.remove("active")
			}
		})
	}

	// 폼 제출 이벤트
	todoForm.addEventListener("submit", (e) => {
		e.preventDefault()
		const text = todoInput.value.trim()
		if (text) {
			todoList.addTodo(text)
			todoInput.value = ""
			renderTodos()
		}
	})

	// 필터 버튼 이벤트
	filterButtons.forEach((btn) => {
		btn.addEventListener("click", () => {
			currentFilter = btn.dataset.filter
			setActiveFilter(currentFilter)
			renderTodos()
		})
	})

	// 초기 렌더링
	setActiveFilter("all")
	renderTodos()
})
