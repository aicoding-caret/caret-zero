#!/usr/bin/env python3
import re
import ast
import json
from typing import Dict, List, Any
from dataclasses import dataclass
import numpy as np

@dataclass
class TestCase:
    """테스트 케이스 정의"""
    id: str
    prompt: str
    expected_elements: List[str]  # 응답에 포함되어야 할 핵심 요소들
    test_function: str  # 정확성 테스트를 위한 함수 코드

class ResponseEvaluator:
    def __init__(self):
        self.test_cases = self._load_test_cases()
    
    def _load_test_cases(self) -> Dict[str, TestCase]:
        """테스트 케이스 정의"""
        return {
            "code-completion": TestCase(
                id="code-completion",
                prompt="def calculate_fibonacci(n):",
                expected_elements=[
                    "def calculate_fibonacci",
                    "return",
                    "for" or "while" or "recursion",
                    "comment" or "docstring"
                ],
                test_function="""
def test_fibonacci(func):
    test_cases = [
        (0, [0]), (1, [0, 1]), (2, [0, 1, 1]), (3, [0, 1, 1, 2]),
        (4, [0, 1, 1, 2, 3]), (5, [0, 1, 1, 2, 3, 5]), (10, [0, 1, 1, 2, 3, 5, 8, 13, 21, 34])
    ]
    try:
        for n, expected in test_cases:
            result = func(n)
            if result != expected:
                return False
        return True
    except Exception:
        return False
"""
            ),
            "code-review": TestCase(
                id="code-review",
                prompt="def process_data(data):",
                expected_elements=[
                    "nested if 문제",
                    "None 체크",
                    "type 체크",
                    "리스트 컴프리헨션" or "filter",
                    "성능 개선"
                ],
                test_function=""  # 코드 리뷰는 자동 테스트 대신 체크리스트 사용
            ),
            "architecture-design": TestCase(
                id="architecture-design",
                prompt="Todo 앱 백엔드 설계",
                expected_elements=[
                    "RESTful API",
                    "인증",
                    "데이터베이스",
                    "CRUD",
                    "알림"
                ],
                test_function=""  # 아키텍처 설계는 체크리스트 기반 평가
            ),
            "debugging": TestCase(
                id="debugging",
                prompt="class UserManager:",
                expected_elements=[
                    "assignment vs comparison",
                    "None 체크",
                    "예외 처리",
                    "remove 안전성"
                ],
                test_function="""
def test_user_manager(cls):
    try:
        manager = cls()
        # 테스트용 User 클래스
        class User:
            def __init__(self, id):
                self.id = id
        
        # 기본 기능 테스트
        user1 = User(1)
        user2 = User(2)
        
        # 추가 테스트
        manager.add_user(user1)
        if len(manager.users) != 1:
            return False
            
        # 중복 추가 테스트
        manager.add_user(user1)
        if len(manager.users) != 1:
            return False
            
        # 검색 테스트
        found = manager.find_user(1)
        if found != user1:
            return False
            
        # 삭제 테스트
        manager.remove_user(1)
        if len(manager.users) != 0:
            return False
            
        return True
    except Exception:
        return False
"""
            )
        }

    def evaluate_accuracy(self, response: str, test_case: TestCase) -> float:
        """정확성 평가"""
        if test_case.test_function:
            # 응답에서 코드 블록 추출
            code_blocks = re.findall(r"```(?:python)?\n(.*?)\n```", response, re.DOTALL)
            if not code_blocks:
                return 0.0
            
            code = code_blocks[0]
            try:
                # 코드 실행 및 테스트
                namespace = {}
                exec(code, namespace)
                exec(test_case.test_function, namespace)
                
                # 테스트 함수 실행
                if test_case.id == "code-completion":
                    result = namespace["test_fibonacci"](namespace["calculate_fibonacci"])
                elif test_case.id == "debugging":
                    result = namespace["test_user_manager"](namespace["UserManager"])
                else:
                    result = False
                
                return 10.0 if result else 0.0
            except Exception:
                return 0.0
        else:
            # 체크리스트 기반 평가
            score = 0
            for element in test_case.expected_elements:
                if isinstance(element, str):
                    if re.search(element.lower(), response.lower()):
                        score += 1
                else:  # 'or' 조건을 위한 튜플
                    if any(re.search(e.lower(), response.lower()) for e in element):
                        score += 1
            return (score / len(test_case.expected_elements)) * 10

    def evaluate_consistency(self, responses: List[str]) -> float:
        """일관성 평가"""
        if len(responses) < 2:
            return 0.0
        
        # 코드 블록 추출
        code_blocks = [
            re.findall(r"```(?:python)?\n(.*?)\n```", response, re.DOTALL)
            for response in responses
        ]
        
        # 코드 블록이 없는 경우 텍스트 기반 평가
        if not all(code_blocks):
            # 응답을 문장 단위로 분리
            sentences = [
                set(re.split(r'[.!?]+', response.lower()))
                for response in responses
            ]
            # 공통 문장 비율 계산
            common = set.intersection(*sentences)
            total = set.union(*sentences)
            return (len(common) / len(total)) * 10 if total else 0.0
        
        # 코드 구조 비교
        try:
            asts = [ast.dump(ast.parse(blocks[0])) for blocks in code_blocks]
            # AST 구조 일치도 계산
            matches = sum(1 for i in range(len(asts)-1) if asts[i] == asts[i+1])
            return (matches / (len(asts)-1)) * 10
        except Exception:
            return 0.0

    def evaluate_code_quality(self, response: str) -> float:
        """코드 품질 평가"""
        code_blocks = re.findall(r"```(?:python)?\n(.*?)\n```", response, re.DOTALL)
        if not code_blocks:
            return 0.0
        
        code = code_blocks[0]
        score = 0.0
        
        try:
            # 1. 구문 유효성 (2점)
            ast.parse(code)
            score += 2
            
            # 2. 들여쓰기 일관성 (2점)
            indentation_patterns = re.findall(r"^[ \t]+", code, re.MULTILINE)
            if indentation_patterns:
                if all(len(p) % 4 == 0 for p in indentation_patterns):
                    score += 2
            
            # 3. 명명 규칙 (2점)
            if re.match(r"^[a-z_][a-z0-9_]*$", code):
                score += 2
            
            # 4. 주석/문서화 (2점)
            if re.search(r"(#.*$|\"\"\".*?\"\"\")", code, re.MULTILINE | re.DOTALL):
                score += 2
            
            # 5. 복잡도 (2점)
            if code.count("if") + code.count("for") + code.count("while") <= 3:
                score += 2
            
        except Exception:
            pass
        
        return score

    def evaluate_clarity(self, response: str) -> float:
        """설명 명확성 평가"""
        score = 0.0
        
        # 1. 목적 설명 (2점)
        if re.search(r"(목적|용도|이 함수는|이 코드는)", response):
            score += 2
        
        # 2. 동작 원리 설명 (2점)
        if re.search(r"(동작|작동|처리|과정|단계|스텝)", response):
            score += 2
        
        # 3. 제약사항 설명 (2점)
        if re.search(r"(제약|제한|주의|참고|note|warning)", response, re.IGNORECASE):
            score += 2
        
        # 4. 예시 포함 (2점)
        if re.search(r"(예시|예제|example|e\.g\.)", response, re.IGNORECASE):
            score += 2
        
        # 5. 구조화된 설명 (2점)
        if len(re.findall(r"^\d+\.|^\-|\*", response, re.MULTILINE)) > 2:
            score += 2
        
        return score

    def evaluate_response(self, response: str, test_case: TestCase, 
                         consistency_responses: List[str] = None) -> Dict[str, float]:
        """종합 평가"""
        consistency_score = (
            self.evaluate_consistency(consistency_responses)
            if consistency_responses
            else 0.0
        )
        
        scores = {
            'accuracy': self.evaluate_accuracy(response, test_case),
            'consistency': consistency_score,
            'code_quality': self.evaluate_code_quality(response),
            'clarity': self.evaluate_clarity(response)
        }
        
        # 가중치 적용
        weights = {
            'accuracy': 0.4,
            'consistency': 0.2,
            'code_quality': 0.2,
            'clarity': 0.2
        }
        
        total_score = sum(score * weights[metric] 
                         for metric, score in scores.items())
        
        return {
            'detailed_scores': scores,
            'total_score': total_score
        }

def evaluate_model_responses(responses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """모델의 전체 응답 평가"""
    evaluator = ResponseEvaluator()
    results = {}
    
    # 응답을 시나리오별로 그룹화
    scenario_responses = {}
    for response in responses:
        scenario = response['scenario_id']
        if scenario not in scenario_responses:
            scenario_responses[scenario] = []
        scenario_responses[scenario].append(response)
    
    # 각 시나리오별 평가
    for scenario, resp_list in scenario_responses.items():
        test_case = evaluator.test_cases[scenario]
        
        # 일관성 평가를 위해 응답 텍스트 목록 생성
        response_texts = [r['result']['response'] for r in resp_list 
                         if r['result']['success']]
        
        # 각 응답 평가
        scenario_scores = []
        for resp in resp_list:
            if resp['result']['success']:
                scores = evaluator.evaluate_response(
                    resp['result']['response'],
                    test_case,
                    response_texts
                )
                scenario_scores.append(scores)
        
        # 시나리오의 평균 점수 계산
        if scenario_scores:
            avg_scores = {
                'detailed_scores': {
                    metric: np.mean([s['detailed_scores'][metric] 
                                   for s in scenario_scores])
                    for metric in scenario_scores[0]['detailed_scores']
                },
                'total_score': np.mean([s['total_score'] 
                                      for s in scenario_scores])
            }
            results[scenario] = avg_scores
    
    return results

if __name__ == '__main__':
    # 테스트 코드
    evaluator = ResponseEvaluator()
    test_response = """
다음은 피보나치 수열을 계산하는 함수입니다:

```python
def calculate_fibonacci(n):
    \"\"\"
    n번째 피보나치 수를 계산합니다.
    :param n: 계산할 피보나치 수의 인덱스
    :return: n번째 피보나치 수
    \"\"\"
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(n-1):
        a, b = b, a + b
    return b
```

이 함수는 다음과 같이 동작합니다:
1. n이 0 또는 1인 경우 그대로 반환
2. 그 외의 경우 반복문을 통해 계산
3. 시간복잡도: O(n)
4. 공간복잡도: O(1)

예시:
calculate_fibonacci(5) = 5
calculate_fibonacci(10) = 55
"""
    
    test_case = evaluator.test_cases['code-completion']
    result = evaluator.evaluate_response(
        test_response,
        test_case,
        [test_response]  # 일관성 테스트를 위해 동일 응답 사용
    )
    
    print(json.dumps(result, indent=2))
