# sLLM 성능 테스트 보고서 (한글)
생성일: 2025-03-28 16:52:59

## 1. 테스트 환경
- 테스트 시간: 20250328_162621
- 테스트 모델: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- 컨텍스트 길이: 12800, 41200, 51200, 76800

## 2. 성능 분석 요약

### 2.1 초기 로딩 성능 (종합)
```
                                    total_time (총 시간)                         tokens_per_second (초당 토큰)                      gpu_memory_util (GPU 메모리 사용률)                     
                                          mean     median        min        max              mean     median        min        max            mean     median        min        max
model (모델)                                                                                                                                                                         
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ   13.98825  13.017969  11.804251  18.112813         20.412122  20.443485  20.306283  20.455236        96.96757  97.092692  96.496582  97.188314
```

### 2.2 연속 응답 성능 (종합)
```
                                    total_time (총 시간)                        tokens_per_second (초당 토큰)                      gpu_memory_util (GPU 메모리 사용률)                    
                                          mean     median      min        max              mean     median        min        max            mean     median        min       max
model (모델)                                                                                                                                                                        
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ  25.532556  28.931845  4.25067  46.501197         21.523041  20.441373  19.747956  25.730352       96.799631  96.944173  96.195475  97.32666
```

### 2.3 모델별 성능 지표

#### Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- 초기 로딩:
  * 평균 응답 시간: 13.99초
  * 평균 초당 토큰: 20.41
  * 평균 최대 GPU 메모리: 96.97%
  * 평균 최대 GPU 사용률: 87.50%
- 연속 응답:
  * 평균 응답 시간: 25.53초
  * 평균 초당 토큰: 21.52
  * 평균 최대 GPU 메모리: 96.80%
  * 평균 최대 GPU 사용률: 90.09%
- 성능 변화 (시간): -82.53%

## 3. GPU 리소스 사용량 요약

### 3.1 메모리 사용률 & GPU 부하 (종합)
```
초기 로딩:
                                    gpu_memory_util (GPU 메모리 사용률)                     gpu_util (GPU 사용률)                   
                                               mean     median        min        max     mean median   min   max
model (모델)                                                                                                           
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ        96.96757  97.092692  96.496582  97.188314     87.5   91.5  74.0  93.0

연속 응답:
                                    gpu_memory_util (GPU 메모리 사용률)                      gpu_util (GPU 사용률)                   
                                               mean     median        min       max       mean median   min   max
model (모델)                                                                                                            
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ       96.799631  96.944173  96.195475  97.32666  90.090909   92.0  72.0  94.0
```

## 4. 시나리오 기반 성능 분석 (연속 테스트)

### architecture-design (아키텍처 설계)
```
성능 지표:
                                    total_time (총 시간)                         tokens_per_second (초당 토큰)                     
                                          mean     median        min        max              mean     median        min        max
model (모델)                                                                                                                             
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ  39.597383  39.885551  35.650131  46.501197         25.089408  25.335084  23.918564  25.730352

GPU 사용량:
                                    gpu_memory_util (GPU 메모리 사용률)                     gpu_util (GPU 사용률)                   
                                               mean     median        min        max       mean median   min   max
model (모델)                                                                                                             
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ       96.801758  96.944173  96.362305  97.224935  91.454545   92.0  87.0  93.0
```

### code-completion (코드 완성)
```
성능 지표:
                                    total_time (총 시간)                        tokens_per_second (초당 토큰)                     
                                          mean    median        min        max              mean     median        min        max
model (모델)                                                                                                                            
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ  17.157129  14.97298  11.121469  32.174838         20.337571  20.347458  20.097222  20.556489

GPU 사용량:
                                    gpu_memory_util (GPU 메모리 사용률)                      gpu_util (GPU 사용률)                   
                                               mean     median        min       max       mean median   min   max
model (모델)                                                                                                            
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ       96.889426  97.070312  96.240234  97.32666  88.727273   91.0  72.0  93.0
```

### code-review (코드 리뷰)
```
성능 지표:
                                    total_time (총 시간)                      tokens_per_second (초당 토큰)                     
                                          mean    median      min        max              mean     median        min        max
model (모델)                                                                                                                          
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ  13.681504  8.219838  4.25067  39.219025         20.397688  20.466736  19.747956  20.787875

GPU 사용량:
                                    gpu_memory_util (GPU 메모리 사용률)                     gpu_util (GPU 사용률)                   
                                               mean     median        min        max       mean median   min   max
model (모델)                                                                                                             
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ       96.826172  97.021484  96.199544  97.294108  89.818182   92.0  74.0  94.0
```

### debugging (디버깅)
```
성능 지표:
                                    total_time (총 시간)                        tokens_per_second (초당 토큰)                     
                                          mean     median        min       max              mean     median        min        max
model (모델)                                                                                                                            
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ  31.694206  32.785789  26.197013  35.02844         20.267495  20.257781  20.019648  20.476081

GPU 사용량:
                                    gpu_memory_util (GPU 메모리 사용률)                     gpu_util (GPU 사용률)                   
                                               mean     median        min        max       mean median   min   max
model (모델)                                                                                                             
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ       96.681167  96.671549  96.195475  97.062174  90.363636   92.0  78.0  94.0
```

## 5. 결론 및 권장 사항

### 5.1 모델 특성 요약

#### Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- 초기 로딩 평균: 13.99초 (TPS: 20.41, 메모리: 96.97%)
- 연속 응답 평균: 25.53초 (TPS: 21.52, 메모리: 96.80%)
- 특징: 느린 초기 로딩, 낮은 처리량, 높은 메모리 사용량

### 5.2 권장 사용 시나리오
- 빠른 시작: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- 장기 실행 작업: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- 높은 처리량 필요: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- 제한된 메모리 환경: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ

## 6. 첨부 파일
- plots_20250328_162621/response_time_comparison.png: 모델 응답 시간 비교
- plots_20250328_162621/gpu_memory_comparison.png: 모델 GPU 메모리 사용률 비교
- plots_20250328_162621/tokens_per_second_comparison.png: 모델 초당 토큰 처리량 비교

---
*이 보고서는 자동으로 생성되었습니다.*
