// Todo 리스트 애플리케이션 테스트 코드

// 로컬 스토리지 모킹
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

// 전역 localStorage 모킹
global.localStorage = new LocalStorageMock();

// TodoList 클래스 테스트
describe('TodoList', () => {
  let todoList;

  // 각 테스트 전에 TodoList 인스턴스 초기화
  beforeEach(() => {
    localStorage.clear();
    todoList = new TodoList();
  });

  // 항목 추가 테스트
  test('새 Todo 항목 추가', () => {
    const initialCount = todoList.getAll().length;
    todoList.addTodo('테스트 항목');
    const newCount = todoList.getAll().length;
    
    expect(newCount).toBe(initialCount + 1);
    expect(todoList.getAll()[0].text).toBe('테스트 항목');
    expect(todoList.getAll()[0].completed).toBe(false);
  });

  // 항목 조회 테스트
  test('모든 Todo 항목 조회', () => {
    todoList.addTodo('첫 번째 항목');
    todoList.addTodo('두 번째 항목');
    
    const todos = todoList.getAll();
    
    expect(todos.length).toBe(2);
    expect(todos[0].text).toBe('첫 번째 항목');
    expect(todos[1].text).toBe('두 번째 항목');
  });

  // 완료 토글 테스트
  test('Todo 항목 완료 상태 토글', () => {
    todoList.addTodo('테스트 항목');
    const id = todoList.getAll()[0].id;
    
    // 초기 상태는 미완료
    expect(todoList.getAll()[0].completed).toBe(false);
    
    // 완료로 토글
    todoList.toggleTodo(id);
    expect(todoList.getAll()[0].completed).toBe(true);
    
    // 다시 미완료로 토글
    todoList.toggleTodo(id);
    expect(todoList.getAll()[0].completed).toBe(false);
  });

  // 항목 삭제 테스트
  test('Todo 항목 삭제', () => {
    todoList.addTodo('삭제할 항목');
    const id = todoList.getAll()[0].id;
    const initialCount = todoList.getAll().length;
    
    todoList.deleteTodo(id);
    const newCount = todoList.getAll().length;
    
    expect(newCount).toBe(initialCount - 1);
    expect(todoList.getAll().find(todo => todo.id === id)).toBeUndefined();
  });

  // 필터링 테스트
  test('Todo 항목 필터링', () => {
    todoList.addTodo('첫 번째 항목');
    todoList.addTodo('두 번째 항목');
    todoList.addTodo('세 번째 항목');
    
    const firstId = todoList.getAll()[0].id;
    const thirdId = todoList.getAll()[2].id;
    
    todoList.toggleTodo(firstId);
    todoList.toggleTodo(thirdId);
    
    // 모든 항목
    expect(todoList.getAll().length).toBe(3);
    
    // 완료된 항목
    expect(todoList.getFiltered('completed').length).toBe(2);
    
    // 활성 항목
    expect(todoList.getFiltered('active').length).toBe(1);
  });

  // 로컬 스토리지 저장 테스트
  test('Todo 항목 로컬 스토리지 저장', () => {
    todoList.addTodo('저장 테스트');
    
    // 새 인스턴스 생성하여 로컬 스토리지에서 데이터 로드
    const newTodoList = new TodoList();
    
    expect(newTodoList.getAll().length).toBe(1);
    expect(newTodoList.getAll()[0].text).toBe('저장 테스트');
  });
});
