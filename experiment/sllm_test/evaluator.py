#!/usr/bin/env python3
import re
import ast
import json
from typing import Dict, List, Any
from dataclasses import dataclass
import numpy as np

import random

@dataclass
class TestCase:
    """테스트 케이스 정의"""
    id: str
    prompts: List[str] # 단일 prompt 대신 prompts 리스트 사용
    expected_elements: List[str]  # 응답에 포함되어야 할 핵심 요소들 (모든 프롬프트에 공통 적용될 수 있는 요소 위주)
    test_function: str  # 정확성 테스트를 위한 함수 코드 (프롬프트별로 달라져야 할 수 있음 - 일단 비워둠)

class ResponseEvaluator:
    def __init__(self):
        self.test_cases = self._load_test_cases()
    
    def _load_test_cases(self) -> Dict[str, TestCase]:
        """테스트 케이스 정의 - 각 시나리오별로 여러 프롬프트 포함"""
        return {
            "code-completion": TestCase(
                id="code-completion",
                prompts=[
                    "Complete the following Python function to calculate the nth Fibonacci number:\n```python\ndef calculate_fibonacci(n):\n    # Your code here\n```",
                    "Provide a Python function `factorial(n)` that calculates the factorial of a non-negative integer n.",
                    "Write a Python function `is_prime(num)` that checks if a given number `num` is a prime number."
                ],
                expected_elements=[
                    "def", # 함수 정의
                    "return", # 반환문
                    "for" or "while" or "recursion",
                    "comment" or "docstring"
                ],
                test_function="""
# Note: This test function is specific to fibonacci and needs generalization
# or removal if we rely solely on qualitative checks for completion.
# For now, let's keep it but acknowledge it only works for the first prompt.
def test_fibonacci(func):
    try:
        # Only test if the function name matches the first prompt's target
        if func.__name__ == 'calculate_fibonacci':
             assert func(0) == 0, "Test Case 0 Failed"
             assert func(1) == 1, "Test Case 1 Failed"
             assert func(5) == 5, "Test Case 5 Failed"
             assert func(10) == 55, "Test Case 10 Failed"
             return True
        elif func.__name__ == 'factorial':
             assert func(0) == 1, "Factorial 0 Failed"
             assert func(1) == 1, "Factorial 1 Failed"
             assert func(5) == 120, "Factorial 5 Failed"
             return True
        elif func.__name__ == 'is_prime':
             assert func(2) == True, "Prime 2 Failed"
             assert func(3) == True, "Prime 3 Failed"
             assert func(4) == False, "Prime 4 Failed"
             assert func(17) == True, "Prime 17 Failed"
             assert func(1) == False, "Prime 1 Failed" # Common edge case
             assert func(0) == False, "Prime 0 Failed"
             return True
        else:
             return False # Cannot automatically test unknown function
    except Exception as e:
        print(f"Test exception: {e}")
        return False
"""
            ),
            "code-review": TestCase(
                id="code-review",
                 prompts=[
                    "Review the following Python code snippet for potential issues and suggest improvements:\n```python\ndef get_user_data(user_id):\n    # Assume db_fetch is a function that fetches data from a database\n    data = db_fetch(user_id)\n    if data:\n        if data['active']:\n            return data['profile']\n    return None\n```",
                    "Critique this Python code for handling file reading. What are the potential problems?\n```python\ndef read_config(filepath):\n    f = open(filepath, 'r')\n    config = json.load(f)\n    # ... process config ...\n    return config\n```",
                    "Analyze the following Python list manipulation code. Is it efficient? How can it be improved?\n```python\nnew_list = []\nfor x in old_list:\n    if x > 10:\n        new_list.append(x * 2)\n```"
                 ],
                expected_elements=[
                    "potential error" or "issue" or "problem", # 문제점 지적
                    "improvement" or "suggestion" or "alternative", # 개선 방안 제시
                    "type 체크",
                    "리스트 컴프리헨션" or "filter",
                    "efficiency" or "readability" or "maintainability" # 개선 목표
                ],
                test_function=""
            ),
            "architecture-design": TestCase(
                id="architecture-design",
                prompts=[
                    "Outline the backend architecture for a simple Todo application.",
                    "Design the main components for a backend system managing blog posts and comments.",
                    "Describe the key architectural elements needed for a URL shortening service backend."
                ],
                expected_elements=[
                    "API" or "Endpoint", # API 설계
                    "Authentication" or "Authorization", # 인증/인가
                    "데이터베이스",
                    "CRUD",
                    "알림"
                ],
                test_function=""
            ),
            "debugging": TestCase(
                id="debugging",
                prompts=[
                    "Find and fix the bug in the following Python code:\n```python\ndef find_item(items, target):\n    for item in items:\n        if item = target: # Bug is here\n            return True\n    return False\n```",
                    "Identify the error in this Python dictionary access code:\n```python\nuser_info = {'name': 'Alice'}\nprint(user_info['age']) # Bug is here\n```",
                    "Debug the following Python loop. Why might it not terminate?\n```python\ni = 0\nwhile i < 5:\n    print(i)\n    # Missing increment: i += 1\n```"
                ],
                expected_elements=[
                    "bug" or "error" or "issue", # 버그 식별
                    "fix" or "correct" or "solution", # 수정 방안 제시
                    "예외 처리",
                    "remove 안전성"
                ],
                test_function="""
# This test is specific to the original UserManager prompt and needs adjustment
# or removal if relying on qualitative checks. Let's remove it for now.
"""
            ),
            "refactoring": TestCase(
                id="refactoring",
                prompts=[
                    "Refactor the following Python code for better readability and efficiency:\n```python\ndef process_items(items):\n    results = []\n    for i in range(len(items)):\n        if items[i] % 2 == 0:\n            temp = items[i] * items[i]\n            results.append(temp)\n        else:\n            temp = items[i] + 10\n            results.append(temp)\n    return results\n```",
                    "Improve this Python code snippet by using more idiomatic Python features:\n```python\nindex = 0\nwhile index < len(my_list):\n    print(my_list[index])\n    index += 1\n```",
                    "Refactor this nested loop structure in Python for potential performance gains or clarity:\n```python\nfor x in list1:\n    for y in list2:\n        if x == y:\n            print(f\"Match found: {x}\")\n```"
                ],
                expected_elements=[
                    "list comprehension" or "generator expression",
                    "conditional expression" or "built-in function" or "idiomatic",
                    "readability",
                    "efficiency",
                    "docstring"
                ],
                test_function=""
            ),
            "algorithm": TestCase(
                id="algorithm",
                prompts=[
                    "Implement a binary search function in Python that finds the index of a target value in a sorted list. Return -1 if not found.",
                    "Write a Python function to perform a linear search for a target value in a list. Return the index or -1.",
                    "Implement a bubble sort algorithm in Python for a list of numbers."
                ],
                expected_elements=[
                    "def", # 함수 정의
                    "while" or "for", # 반복문
                    "mid",
                    "low",
                    "high",
                    "return" # 반환문 (인덱스 또는 정렬된 리스트)
                ],
                # Specific test functions would be needed for each algorithm prompt.
                # Let's rely on qualitative checks for now.
                test_function=""
            ),
            "documentation": TestCase(
                id="documentation",
                prompts=[
                    "Generate a Python docstring (following PEP 257) for the function:\n```python\ndef calculate_average(numbers):\n    if not numbers:\n        return 0\n    return sum(numbers) / len(numbers)\n```",
                    "Write a clear docstring for this Python function:\n```python\ndef find_max(items):\n    if not items:\n        return None\n    max_val = items[0]\n    for item in items[1:]:\n        if item > max_val:\n            max_val = item\n    return max_val\n```",
                    "Create a comprehensive docstring for the following Python class:\n```python\nclass Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def distance_to_origin(self):\n        return (self.x**2 + self.y**2)**0.5\n```"
                ],
                expected_elements=[
                    '"""', # Docstring 시작/끝
                    "Args:" or "Parameters:", # 인자 설명
                    "numbers (list)",
                    "Returns:",
                    "float",
                    "average" or "maximum" or "distance" # 반환값 설명
                ],
                test_function=""
            ),
            "unit-test": TestCase(
                id="unit-test",
                prompts=[
                    "Write Python unit tests using the `unittest` module for the function:\n```python\ndef add(a, b):\n    return a + b\n```",
                    "Create unit tests for the `is_prime(num)` function using `unittest`.",
                    "Generate `unittest` test cases for the `factorial(n)` function, including edge cases."
                ],
                expected_elements=[
                    "import unittest", # unittest 모듈 임포트
                    "class Test", # 테스트 클래스 정의
                    "unittest.TestCase",
                    "def test_add",
                    "self.assertEqual"
                ],
                test_function="" # Qualitative check for structure
            ),
            "regex": TestCase(
                id="regex",
                prompts=[
                    "Create a Python regex pattern to validate a common email address format (e.g., 'user@example.com').",
                    "Write a regex in Python to extract all URLs (starting with http or https) from a given text.",
                    "Generate a Python regex pattern to match phone numbers in the format XXX-XXX-XXXX."
                ],
                expected_elements=[
                    "import re", # re 모듈 임포트
                    "@", # 이메일용
                    "\.", # Literal dot
                    "[a-zA-Z0-9._%+-]+", # User part
                    "[a-zA-Z0-9.-]+", # Domain part
                    "\.[a-zA-Z]{2,}" or "http" or "\d{3}-\d{3}-\d{4}" # Specific pattern elements
                ],
                test_function=""
            ),
            "sql-query": TestCase(
                id="sql-query",
                prompts=[
                    "Write an SQL query to select the names and emails of users from a 'users' table registered after '2024-01-01'.",
                    "Create an SQL query to find all orders from an 'orders' table with an amount greater than 100, joining with the 'customers' table to get customer names.",
                    "Write an SQL query to count the number of products in each category from a 'products' table, grouped by 'category_id'."
                ],
                expected_elements=[
                    "SELECT", # SELECT 키워드
                    "FROM", # FROM 키워드
                    "email",
                    "FROM",
                    "users",
                    "WHERE" or "JOIN" or "GROUP BY" # 다른 SQL 키워드
                ],
                test_function=""
            )
        }

    def evaluate_accuracy(self, response: str, test_case: TestCase, prompt_index: int) -> float:
        """정확성 평가 - 프롬프트 인덱스를 받아 처리 (현재는 주로 체크리스트 기반)"""
        # test_function 실행 로직은 프롬프트별로 달라야 하므로 복잡해짐.
        # 여기서는 expected_elements 기반의 체크리스트 평가만 수행.
        score = 0
        num_expected = len(test_case.expected_elements)
        if num_expected == 0:
            return 0.0 # 평가 기준 없으면 0점

        matched_count = 0
        for element in test_case.expected_elements:
            # 'or' 조건 처리 (튜플 형태 가정)
            if isinstance(element, tuple):
                if any(re.search(e.lower(), response.lower()) for e in element):
                    matched_count += 1
            # 단일 문자열 조건 처리
            elif isinstance(element, str):
                 # 정규식 패턴 자체를 찾는 경우 (regex 시나리오 등)
                if test_case.id == 'regex' and element.startswith('\\'):
                    try:
                        if re.search(element, response): # 정규식 패턴으로 검색 시도
                           matched_count += 1
                    except re.error:
                        pass # 잘못된 정규식 요소는 무시
                # 일반 텍스트 검색
                elif re.search(element.lower(), response.lower()):
                    matched_count += 1

        return (matched_count / num_expected) * 10.0


    def evaluate_consistency(self, responses: List[str]) -> float:
        """일관성 평가 - 여러 프롬프트에 대한 응답 간의 일관성 (구현 보류)"""
        # TODO: 여러 다른 프롬프트에 대한 응답 간의 일관성을 어떻게 측정할지 정의 필요.
        # 예를 들어, 동일한 스타일 가이드 준수 여부, 유사한 설명 구조 사용 여부 등.
        # 현재 구현은 동일 프롬프트 반복 시에만 유효하므로, 일단 0.0 반환.
        """일관성 평가"""
        if len(responses) < 2:
            return 0.0
        return 0.0 # 임시

    def evaluate_code_quality(self, response: str) -> float:
        """코드 품질 평가 - 응답 내 첫 번째 Python 코드 블록 대상"""
        """코드 품질 평가"""
        code_blocks = re.findall(r"```(?:python)?\n(.*?)\n```", response, re.DOTALL)
        if not code_blocks:
            return 0.0 # 코드 블록 없으면 0점

        code = code_blocks[0].strip()
        if not code:
            return 0.0 # 빈 코드 블록이면 0점

        score = 0.0
        max_score = 10.0

        # 1. 구문 유효성 (3점) - 가장 중요
        try:
            ast.parse(code)
            score += 3
        except SyntaxError:
            return 0.0 # 구문 오류 시 즉시 0점 반환

        # 2. 주석/문서화 존재 여부 (2점)
        if re.search(r"(#.*|\"\"\"|''')", code):
            score += 2

        # 3. 변수/함수 명명 규칙 (간단한 체크) (2점)
        # snake_case 또는 camelCase 허용, 숫자로 시작하지 않음
        identifiers = re.findall(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\b', code)
        # 간단히 모든 식별자가 기본적인 규칙을 따르는지 확인
        if identifiers and all(re.match(r'^[a-zA-Z_]', ident) for ident in identifiers):
             # 좀 더 관대한 체크: 모든 식별자가 유효한 시작 문자를 가지는지 정도만 확인
             score += 2
        elif not identifiers: # 코드는 유효하나 식별자가 없는 경우 (예: print("hello"))
             score += 1 # 최소 점수 부여

        # 4. 코드 길이 적절성 (너무 길지 않음) (1점)
        lines = code.splitlines()
        if len(lines) < 50: # 예시 임계값
            score += 1

        # 5. 들여쓰기 일관성 (간단한 체크) (2점)
        indentations = [len(line) - len(line.lstrip(' ')) for line in lines if line.strip()]
        # 모든 들여쓰기가 4의 배수인지 (가장 흔한 케이스)
        if all(indent % 4 == 0 for indent in indentations):
            score += 2
        # 또는 모든 들여쓰기가 2의 배수인지
        elif all(indent % 2 == 0 for indent in indentations):
             score += 1 # 2칸 들여쓰기도 어느 정도 인정

        return min(score, max_score) # 최대 10점


    def evaluate_clarity(self, response: str) -> float:
        """설명 명확성 평가 - 설명의 구조, 예시 포함 여부 등"""
        score = 0.0
        max_score = 10.0 # max_score 변수 정의 추가

        # 1. 설명 존재 여부 (2점) - 코드 블록 외 텍스트가 있는지
        non_code_text = re.sub(r"```.*?```", "", response, flags=re.DOTALL).strip()
        if len(non_code_text) > 50: # 임계값 (충분히 긴 설명이 있는지)
            score += 2

        # 2. 구조화된 설명 (목록, 단계 등) (3점)
        if re.search(r"(^\s*(\*|-|\d+\.)\s+.*){2,}", non_code_text, re.MULTILINE): # 목록 항목 2개 이상
            score += 3
        elif re.search(r"(단계|스텝|step|first|second|then|finally)", non_code_text, re.IGNORECASE): # 단계 설명 단어
            score += 1

        # 3. 예시 코드 또는 사용법 포함 여부 (3점)
        if re.search(r"(예시|예제|example|usage)", response, re.IGNORECASE):
             # 코드 블록이 2개 이상 있거나, 'example usage' 같은 명시적 언급
            if len(re.findall(r"```", response)) >= 4 or re.search(r"example usage", response, re.IGNORECASE):
                score += 3
            else:
                score += 1 # 단순 언급만 있어도 1점

        # 4. 명확한 언어 사용 (간단한 긍정/부정 키워드 체크) (2점)
        positive_keywords = ["명확하게", "쉽게", "효율적으로", "개선", "장점", "clearly", "easy", "efficient", "improve", "benefit"]
        negative_keywords = ["모호하게", "어렵게", "비효율적으로", "문제", "단점", "vague", "difficult", "inefficient", "problem", "drawback"]
        if any(kw in non_code_text.lower() for kw in positive_keywords):
            score += 1
        if not any(kw in non_code_text.lower() for kw in negative_keywords): # 부정적 단어 없으면 +1
            score += 1

        return min(score, max_score) # 최대 10점


    def evaluate_response(self, response: str, test_case: TestCase, prompt_index: int) -> Dict[str, float]:
        """종합 평가 - 프롬프트 인덱스 추가"""
        # consistency_score 는 여러 프롬프트에 걸쳐 평가하기 어려우므로 0으로 고정
        consistency_score = 0.0

        scores = {
            'accuracy': self.evaluate_accuracy(response, test_case, prompt_index),
            'consistency': consistency_score, # 일관성 점수 0으로 고정
            'code_quality': self.evaluate_code_quality(response),
            'clarity': self.evaluate_clarity(response)
        }

        # 가중치 적용
        weights = {
            'accuracy': 0.4,
            'consistency': 0.1, # 가중치 조정 (현재 0점이므로 낮춤)
            'code_quality': 0.3, # 코드 품질 가중치 높임
            'clarity': 0.2
        }

        total_score = sum(score * weights[metric] 
                         for metric, score in scores.items())

        return {
            'detailed_scores': scores,
            'total_score': total_score
        }

def evaluate_model_responses(responses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """모델의 전체 응답 평가 - 여러 프롬프트에 대한 결과 집계"""
    evaluator = ResponseEvaluator()
    results = {}

    # 응답을 시나리오별로 그룹화 (프롬프트 인덱스도 고려해야 하지만, 일단 시나리오로만 그룹화)
    scenario_responses = {}
    for i, response_data in enumerate(responses):
        # run_test.py 에서 prompt_index 를 결과에 넣어줘야 함 (수정 필요)
        # 일단은 순서대로 들어온다고 가정하고 인덱스 사용
        scenario_id = response_data['scenario_id']
        prompt_index = response_data.get('prompt_index', i % len(evaluator.test_cases.get(scenario_id, TestCase(id="", prompts=[], expected_elements=[], test_function="")).prompts)) # 임시 인덱싱

        if scenario_id not in scenario_responses:
            scenario_responses[scenario_id] = []

        if response_data['result']['success']:
             test_case = evaluator.test_cases.get(scenario_id)
             if test_case:
                 scores = evaluator.evaluate_response(
                     response_data['result']['response'],
                     test_case,
                     prompt_index # 프롬프트 인덱스 전달
                 )
                 scenario_responses[scenario_id].append(scores)

    # 각 시나리오별 평균 점수 계산
    for scenario_id, score_list in scenario_responses.items():
        # 시나리오의 평균 점수 계산
        if score_list: # score_list 가 비어있지 않은 경우에만 평균 계산
            # score_list 를 사용하여 평균 계산 (기존 scenario_scores 변수 사용 오류 수정)
            avg_scores = {
                'detailed_scores': {
                    metric: np.mean([s['detailed_scores'][metric]
                                   for s in score_list])
                    # score_list[0] 대신 score_list[-1] 사용 (가장 마지막 평가 기준으로 metric 키 가져오기)
                    for metric in score_list[-1]['detailed_scores'] 
                },
                'total_score': np.mean([s['total_score']
                                      for s in score_list])
            }
            results[scenario_id] = avg_scores
        else:
             # score_list가 비어있는 경우 (모든 응답 평가 실패 등)
             results[scenario_id] = {
                 'detailed_scores': { 'accuracy': 0.0, 'consistency': 0.0, 'code_quality': 0.0, 'clarity': 0.0 },
                 'total_score': 0.0,
                 'error': 'No successful responses to evaluate for this scenario.'
             }


    return results

# if __name__ == '__main__':
#     # 업데이트된 테스트 코드 (필요 시 작성)
#     pass
