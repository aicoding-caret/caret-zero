# vLLM 서버에 긴 응답 생성을 요청하고 전체 JSON 응답을 출력하는 스크립트

# HTTP 요청 헤더 설정
$headers = @{
    "Content-Type" = "application/json"
}

# PowerShell 해시테이블로 요청 본문 구조 정의
$requestBodyObject = @{
    model = "Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4"
    messages = @(
        @{ role = "system"; content = "You are a helpful assistant." }
        @{ role = "user"; content = "Write a very long story about a robot exploring a vast, ancient forest." }
    )
    max_tokens = 32734 # 서버 한도(32768-34 : 왜인지는 모르겟음. 이래야 32768로 넘어감감) 
    temperature = 0.7
    top_p = 1.0
    n = 1
    stream = $false
}

# 해시테이블을 JSON 문자열로 변환
$bodyJsonString = $requestBodyObject | ConvertTo-Json -Depth 10

# Invoke-RestMethod를 사용하여 API 요청 보내고 응답 받기
Write-Host "vLLM 서버에 요청을 보냅니다..."
# Write-Host "보내는 JSON: $bodyJsonString" # 디버깅용: 보내는 JSON 확인
$response = Invoke-RestMethod -Uri 'http://localhost:8000/v1/chat/completions' -Method Post -Headers $headers -Body $bodyJsonString -ContentType 'application/json'

# 받은 응답 객체를 JSON 문자열로 변환하여 출력 (Depth를 높여 중첩된 객체도 잘 보이도록 함)
Write-Host "서버로부터 받은 전체 응답 (JSON):"
$response | ConvertTo-Json -Depth 10

Write-Host "스크립트 실행 완료."
