/**
 * Todo 리스트 앱 UI 스크립트
 *
 * 이 스크립트는 TodoManager 모듈과 HTML UI 요소를 연결합니다.
 * DOM 조작, 이벤트 처리, UI 업데이트 등을 담당합니다.
 */

// DOM 요소 참조
const todoForm = document.getElementById("todo-form")
const todoInput = document.getElementById("todo-input")
const todoList = document.getElementById("todo-list")
const noTodosMessage = document.getElementById("no-todos")
const todoCountElement = document.getElementById("todo-count").querySelector("strong")
const todoCompletedElement = document.getElementById("todo-completed").querySelector("strong")

// TodoManager 초기화
TodoManager.initializeTodos()

// 앱 초기화
function initApp() {
	// 저장된 Todo 항목 로드 및 표시
	renderTodos()

	// 이벤트 리스너 추가
	todoForm.addEventListener("submit", handleTodoSubmit)
}

// Todo 항목 추가 핸들러
function handleTodoSubmit(event) {
	event.preventDefault()

	const todoText = todoInput.value.trim()

	// 입력값이 있는 경우에만 추가
	if (todoText) {
		// TodoManager를 통해 항목 추가
		TodoManager.addTodo(todoText)

		// 입력값 초기화
		todoInput.value = ""

		// UI 업데이트
		renderTodos()

		// 입력 필드에 포커스
		todoInput.focus()
	}
}

// Todo 항목 토글 핸들러
function handleTodoToggle(id) {
	// TodoManager를 통해 항목 토글
	TodoManager.toggleTodo(id)

	// UI 업데이트
	renderTodos()
}

// Todo 항목 삭제 핸들러
function handleTodoDelete(id) {
	// TodoManager를 통해 항목 삭제
	TodoManager.deleteTodo(id)

	// UI 업데이트
	renderTodos()
}

// Todo 리스트 렌더링
function renderTodos() {
	// TodoManager에서 모든 Todo 항목 가져오기
	const todos = TodoManager.getTodos()

	// Todo 리스트 초기화
	todoList.innerHTML = ""

	// Todo 항목이 없는 경우 메시지 표시
	if (todos.length === 0) {
		noTodosMessage.classList.remove("hidden")
	} else {
		noTodosMessage.classList.add("hidden")

		// 각 Todo 항목 렌더링
		todos.forEach((todo) => {
			const todoItem = createTodoElement(todo)
			todoList.appendChild(todoItem)
		})
	}

	// 카운터 업데이트
	updateCounters(todos)
}

// Todo 항목 요소 생성
function createTodoElement(todo) {
	// Todo 항목 컨테이너
	const todoItem = document.createElement("li")
	todoItem.classList.add("todo-item")
	if (todo.completed) {
		todoItem.classList.add("completed")
	}

	// 체크박스
	const checkbox = document.createElement("input")
	checkbox.type = "checkbox"
	checkbox.classList.add("todo-checkbox")
	checkbox.checked = todo.completed
	checkbox.addEventListener("change", () => handleTodoToggle(todo.id))

	// Todo 항목 텍스트
	const todoText = document.createElement("span")
	todoText.classList.add("todo-text")
	todoText.textContent = todo.text

	// 삭제 버튼
	const deleteButton = document.createElement("button")
	deleteButton.classList.add("delete-btn")
	deleteButton.innerHTML = '<i class="fas fa-trash"></i>'
	deleteButton.addEventListener("click", () => handleTodoDelete(todo.id))

	// 요소들 추가
	todoItem.appendChild(checkbox)
	todoItem.appendChild(todoText)
	todoItem.appendChild(deleteButton)

	return todoItem
}

// Todo 카운터 업데이트
function updateCounters(todos) {
	// 전체 항목 수
	todoCountElement.textContent = todos.length

	// 완료된 항목 수
	const completedCount = todos.filter((todo) => todo.completed).length
	todoCompletedElement.textContent = completedCount
}

// 앱 초기화
document.addEventListener("DOMContentLoaded", initApp)
