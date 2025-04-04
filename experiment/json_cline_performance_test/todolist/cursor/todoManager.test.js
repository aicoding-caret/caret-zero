// Todo 관리 로직 테스트

// Mock localStorage
let mockLocalStorage = {};

// localStorage 모의 구현
global.localStorage = {
  getItem: (key) => mockLocalStorage[key] || null,
  setItem: (key, value) => { mockLocalStorage[key] = value.toString(); },
  removeItem: (key) => { delete mockLocalStorage[key]; },
  clear: () => { mockLocalStorage = {}; }
};

// 테스트 전 TodoManager 가져오기
const TodoManager = require('./todoManager');

// 각 테스트 전에 localStorage와 TodoManager 초기화
beforeEach(() => {
  mockLocalStorage = {};
  TodoManager.initializeTodos();
});

describe('TodoManager', () => {
  // 1. Todo 항목 추가 테스트
  describe('addTodo', () => {
    test('새로운 Todo 항목이 올바르게 추가되어야 한다', () => {
      const todoText = '테스트 할 일';
      const todoId = TodoManager.addTodo(todoText);
      
      const todos = TodoManager.getTodos();
      expect(todos.length).toBe(1);
      expect(todos[0].text).toBe(todoText);
      expect(todos[0].id).toBe(todoId);
      expect(todos[0].completed).toBe(false);
    });
    
    test('빈 내용의 Todo 항목은 추가되지 않아야 한다', () => {
      TodoManager.addTodo('');
      
      const todos = TodoManager.getTodos();
      expect(todos.length).toBe(0);
    });
    
    test('공백만 있는 Todo 항목은 추가되지 않아야 한다', () => {
      TodoManager.addTodo('   ');
      
      const todos = TodoManager.getTodos();
      expect(todos.length).toBe(0);
    });
  });
  
  // 2. Todo 항목 조회 테스트
  describe('getTodos', () => {
    test('모든 Todo 항목이 올바르게 조회되어야 한다', () => {
      TodoManager.addTodo('첫 번째 할 일');
      TodoManager.addTodo('두 번째 할 일');
      
      const todos = TodoManager.getTodos();
      expect(todos.length).toBe(2);
      expect(todos[0].text).toBe('첫 번째 할 일');
      expect(todos[1].text).toBe('두 번째 할 일');
    });
    
    test('Todo 항목이 없을 때 빈 배열을 반환해야 한다', () => {
      const todos = TodoManager.getTodos();
      expect(todos).toEqual([]);
    });
  });
  
  // 3. Todo 항목 완료 토글 테스트
  describe('toggleTodo', () => {
    test('Todo 항목의 완료 상태가 올바르게 토글되어야 한다', () => {
      const todoId = TodoManager.addTodo('토글 테스트');
      
      // 미완료 -> 완료
      TodoManager.toggleTodo(todoId);
      let todos = TodoManager.getTodos();
      expect(todos[0].completed).toBe(true);
      
      // 완료 -> 미완료
      TodoManager.toggleTodo(todoId);
      todos = TodoManager.getTodos();
      expect(todos[0].completed).toBe(false);
    });
    
    test('존재하지 않는 ID로 토글 시 아무 변화가 없어야 한다', () => {
      const todoId = TodoManager.addTodo('테스트 항목');
      
      TodoManager.toggleTodo('nonexistent-id');
      const todos = TodoManager.getTodos();
      expect(todos[0].completed).toBe(false);
    });
  });
  
  // 4. Todo 항목 삭제 테스트
  describe('deleteTodo', () => {
    test('Todo 항목이 올바르게 삭제되어야 한다', () => {
      const todoId = TodoManager.addTodo('삭제 테스트');
      
      TodoManager.deleteTodo(todoId);
      const todos = TodoManager.getTodos();
      expect(todos.length).toBe(0);
    });
    
    test('존재하지 않는 ID로 삭제 시 아무 변화가 없어야 한다', () => {
      TodoManager.addTodo('테스트 항목');
      
      TodoManager.deleteTodo('nonexistent-id');
      const todos = TodoManager.getTodos();
      expect(todos.length).toBe(1);
    });
  });
  
  // 5. 데이터 저장 테스트
  describe('saveTodos', () => {
    test('Todo 항목이 localStorage에 올바르게 저장되어야 한다', () => {
      TodoManager.addTodo('저장 테스트1');
      TodoManager.addTodo('저장 테스트2');
      
      // localStorage에 저장됐는지 확인
      const savedTodos = JSON.parse(localStorage.getItem('todos'));
      expect(savedTodos.length).toBe(2);
      expect(savedTodos[0].text).toBe('저장 테스트1');
      expect(savedTodos[1].text).toBe('저장 테스트2');
    });
  });
  
  // 6. 데이터 로드 테스트
  describe('loadTodos', () => {
    test('localStorage에서 Todo 항목이 올바르게 로드되어야 한다', () => {
      // 테스트 데이터 준비
      const testTodos = [
        { id: '1', text: '로드 테스트1', completed: false },
        { id: '2', text: '로드 테스트2', completed: true }
      ];
      
      // localStorage에 직접 저장
      localStorage.setItem('todos', JSON.stringify(testTodos));
      
      // TodoManager 초기화 호출 (loadTodos 포함)
      TodoManager.initializeTodos();
      
      // 정상적으로 로드됐는지 확인
      const todos = TodoManager.getTodos();
      expect(todos.length).toBe(2);
      expect(todos[0].text).toBe('로드 테스트1');
      expect(todos[0].completed).toBe(false);
      expect(todos[1].text).toBe('로드 테스트2');
      expect(todos[1].completed).toBe(true);
    });
    
    test('localStorage에 데이터가 없을 때 빈 배열을 반환해야 한다', () => {
      // localStorage를 비움
      localStorage.clear();
      
      // TodoManager 초기화 호출
      TodoManager.initializeTodos();
      
      // 빈 배열이 반환되는지 확인
      const todos = TodoManager.getTodos();
      expect(todos).toEqual([]);
    });
  });
}); 