/**
 * Todo 리스트 UI 관리
 */
document.addEventListener("DOMContentLoaded", () => {
	// DOM 요소
	const todoInput = document.getElementById("todo-input")
	const addButton = document.getElementById("add-button")
	const todoList = document.getElementById("todo-list")
	const todoCount = document.getElementById("todo-count")

	// TodoManager 인스턴스 생성
	const todoManager = new TodoManager()

	/**
	 * Todo 목록을 UI에 렌더링합니다.
	 */
	function renderTodos() {
		const todos = todoManager.getTodos()

		// Todo 목록 비우기
		todoList.innerHTML = ""

		// 각 Todo 항목 렌더링
		todos.forEach((todo) => {
			const li = document.createElement("li")
			li.className = `todo-item ${todo.completed ? "todo-completed" : ""}`
			li.dataset.id = todo.id

			// 체크박스
			const checkbox = document.createElement("input")
			checkbox.type = "checkbox"
			checkbox.className = "todo-checkbox"
			checkbox.checked = todo.completed

			// 텍스트
			const span = document.createElement("span")
			span.className = "todo-text"
			span.textContent = todo.text

			// 삭제 버튼
			const deleteButton = document.createElement("button")
			deleteButton.className = "todo-delete"
			deleteButton.innerHTML = "&times;"
			deleteButton.setAttribute("aria-label", "삭제")

			// 요소 추가
			li.appendChild(checkbox)
			li.appendChild(span)
			li.appendChild(deleteButton)
			todoList.appendChild(li)
		})

		// Todo 개수 업데이트
		updateTodoCount()
	}

	/**
	 * Todo 개수를 업데이트합니다.
	 */
	function updateTodoCount() {
		const todos = todoManager.getTodos()
		const remainingCount = todos.filter((todo) => !todo.completed).length

		todoCount.textContent = `${remainingCount}개의 할 일`
	}

	/**
	 * 새 Todo 항목을 추가합니다.
	 */
	function addTodo() {
		const text = todoInput.value.trim()

		if (text) {
			todoManager.addTodo(text)
			todoInput.value = ""
			renderTodos()
			todoInput.focus()
		}
	}

	// 이벤트 리스너 등록

	// 추가 버튼 클릭
	addButton.addEventListener("click", addTodo)

	// 엔터 키 입력
	todoInput.addEventListener("keypress", (event) => {
		if (event.key === "Enter") {
			addTodo()
		}
	})

	// Todo 항목 이벤트 (이벤트 위임)
	todoList.addEventListener("click", (event) => {
		const todoItem = event.target.closest(".todo-item")
		if (!todoItem) return

		const todoId = todoItem.dataset.id

		// 체크박스 클릭
		if (event.target.classList.contains("todo-checkbox")) {
			todoManager.toggleTodo(todoId)
			renderTodos()
		}

		// 삭제 버튼 클릭
		if (event.target.classList.contains("todo-delete")) {
			todoManager.deleteTodo(todoId)
			renderTodos()
		}
	})

	// 초기 Todo 목록 렌더링
	renderTodos()

	// 테스트 출력 리다이렉션 (개발 중에만 활성화)
	const testOutput = document.getElementById("test-output")
	if (testOutput) {
		// 콘솔 출력을 테스트 결과 영역으로 리다이렉션
		const originalConsoleLog = console.log
		const originalConsoleError = console.error

		console.log = function (...args) {
			originalConsoleLog.apply(console, args)
			testOutput.innerHTML += args.join(" ") + "<br>"
		}

		console.error = function (...args) {
			originalConsoleError.apply(console, args)
			testOutput.innerHTML += '<span style="color: red;">' + args.join(" ") + "</span><br>"
		}
	}
})
