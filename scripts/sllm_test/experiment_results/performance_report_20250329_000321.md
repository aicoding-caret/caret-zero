# sLLM Performance Test Report
Generated: 2025-03-29 00:23:13

## 1. Test Environment
- Test Time: 20250329_000321
- Tested Models: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ, Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- Context Lengths: 

## 2. Performance Analysis Summary

### 2.1 Initial Loading Performance (Aggregated)
```
                                          total_time                                  tokens_per_second                                  gpu_memory_util                                 
                                                mean     median        min        max              mean     median        min        max            mean     median        min        max
model                                                                                                                                                                                    
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ        18.558631  18.558631  18.558631  18.558631         17.700693  17.700693  17.700693  17.700693       96.504720  96.504720  96.504720  96.504720
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4  16.092790  16.092790  16.092790  16.092790         22.375030  22.375030  22.375030  22.375030       97.208659  97.208659  97.208659  97.208659
```

### 2.2 Continuous Response Performance (Aggregated)
```
                                          total_time                                  tokens_per_second                                  gpu_memory_util                                 
                                                mean     median        min        max              mean     median        min        max            mean     median        min        max
model                                                                                                                                                                                    
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ        17.503308  17.503308  17.503308  17.503308         17.673075  17.673075  17.673075  17.673075       96.435547  96.435547  96.435547  96.435547
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4  11.490424  11.490424  11.490424  11.490424         23.862683  23.862683  23.862683  23.862683       97.184245  97.184245  97.184245  97.184245
```

### 2.3 Performance Metrics by Model

#### Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- Initial Loading:
  * Avg. Response Time: 18.56s
  * Avg. Tokens/Second: 17.70
  * Avg. Max GPU Memory: 96.50%
  * Avg. Max GPU Utilization: 94.00%
- Continuous Response:
  * Avg. Response Time: 17.50s
  * Avg. Tokens/Second: 17.67
  * Avg. Max GPU Memory: 96.44%
  * Avg. Max GPU Utilization: 92.00%
- Performance Change (Time): 5.69%

#### Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- Initial Loading:
  * Avg. Response Time: 16.09s
  * Avg. Tokens/Second: 22.38
  * Avg. Max GPU Memory: 97.21%
  * Avg. Max GPU Utilization: 91.00%
- Continuous Response:
  * Avg. Response Time: 11.49s
  * Avg. Tokens/Second: 23.86
  * Avg. Max GPU Memory: 97.18%
  * Avg. Max GPU Utilization: 91.00%
- Performance Change (Time): 28.60%

## 3. GPU Resource Usage Summary

### 3.1 Memory Utilization & GPU Load (Aggregated)
```
Initial Loading:
                                          gpu_memory_util                                  gpu_util                   
                                                     mean     median        min        max     mean median   min   max
model                                                                                                                 
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             96.504720  96.504720  96.504720  96.504720     94.0   94.0  94.0  94.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       97.208659  97.208659  97.208659  97.208659     91.0   91.0  91.0  91.0

Continuous Response:
                                          gpu_memory_util                                  gpu_util                   
                                                     mean     median        min        max     mean median   min   max
model                                                                                                                 
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             96.435547  96.435547  96.435547  96.435547     92.0   92.0  92.0  92.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       97.184245  97.184245  97.184245  97.184245     91.0   91.0  91.0  91.0
```

## 4. Scenario-based Performance Analysis (Continuous Tests)

### code-completion
```
Performance Metrics:
                                          total_time                                  tokens_per_second                                 
                                                mean     median        min        max              mean     median        min        max
model                                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ        17.503308  17.503308  17.503308  17.503308         17.673075  17.673075  17.673075  17.673075
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4  11.490424  11.490424  11.490424  11.490424         23.862683  23.862683  23.862683  23.862683

GPU Usage:
                                          gpu_memory_util                                  gpu_util                   
                                                     mean     median        min        max     mean median   min   max
model                                                                                                                 
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             96.435547  96.435547  96.435547  96.435547     92.0   92.0  92.0  92.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       97.184245  97.184245  97.184245  97.184245     91.0   91.0  91.0  91.0
```

## 5. Conclusions and Recommendations

### 5.1 Model Characteristics Summary

#### Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- Initial Loading Avg: 18.56s (TPS: 17.70, Memory: 96.50%)
- Continuous Response Avg: 17.50s (TPS: 17.67, Memory: 96.44%)
- Characteristics: Slow initial loading, Low throughput, Efficient memory usage

#### Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- Initial Loading Avg: 16.09s (TPS: 22.38, Memory: 97.21%)
- Continuous Response Avg: 11.49s (TPS: 23.86, Memory: 97.18%)
- Characteristics: Fast initial loading, High throughput, High memory usage

### 5.2 Recommended Usage Scenarios
- Quick Start: Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- Long-running Tasks: Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- High Throughput Needs: Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- Limited Memory Environment: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ

## 6. Attachments
- plots_20250329_000321/response_time_comparison.png: Model Response Time Comparison
- plots_20250329_000321/gpu_memory_comparison.png: Model GPU Memory Utilization Comparison
- plots_20250329_000321/tokens_per_second_comparison.png: Model Tokens Per Second Comparison

---
*This report was automatically generated.*
