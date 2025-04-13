# replace_in_file 버그 테스트 파일

이 파일은 `replace_in_file` 도구의 버그를 테스트하기 위한 파일입니다.

## 테스트 시나리오 1: 단순 한 줄 교체
아래 텍스트를 교체해 봅시다:
이 텍스트는 교체될 예정입니다.

## 테스트 시나리오 2: 복잡한 여러 줄 블록 삭제
아래 JSON 블록을 삭제해 봅시다:

```json
{
  "name": "test-block",
  "version": "1.0.0",
  "description": "This is a test block that should be deleted",
  "properties": {
    "test1": "value1",
    "test2": "value2",
    "test3": "value3"
  },
  "nestedObject": {
    "nested1": {
      "item1": "nestedValue1",
      "item2": "nestedValue2"
    }
  },
  "arrayProperty": [
    "item1",
    "item2",
    "item3"
  ]
}
```

## 테스트 시나리오 3: 여러 줄 마크다운 블록 삭제
아래 마크다운 블록을 삭제해 봅시다:

### 하위 제목
- 항목 1
- 항목 2
  - 하위 항목 2.1
  - 하위 항목 2.2
- 항목 3

1. 번호 항목 1
2. 번호 항목 2
   - 섞인 항목
   - 섞인 항목 2
3. 번호 항목 3

## 파일 끝 부분
테스트가 끝났습니다.
