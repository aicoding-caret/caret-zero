# sLLM Performance Test Report
Generated: 2025-03-28 16:52:59

## 1. Test Environment
- Test Time: 20250328_162621
- Tested Models: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- Context Lengths: 12800, 41200, 51200, 76800

## 2. Performance Analysis Summary

### 2.1 Initial Loading Performance (Aggregated)
```
                                    total_time                                  tokens_per_second                                  gpu_memory_util                                 
                                          mean     median        min        max              mean     median        min        max            mean     median        min        max
model                                                                                                                                                                              
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ   13.98825  13.017969  11.804251  18.112813         20.412122  20.443485  20.306283  20.455236        96.96757  97.092692  96.496582  97.188314
```

### 2.2 Continuous Response Performance (Aggregated)
```
                                    total_time                                tokens_per_second                                  gpu_memory_util                                
                                          mean     median      min        max              mean     median        min        max            mean     median        min       max
model                                                                                                                                                                           
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ  25.532556  28.931845  4.25067  46.501197         21.523041  20.441373  19.747956  25.730352       96.799631  96.944173  96.195475  97.32666
```

### 2.3 Performance Metrics by Model

#### Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- Initial Loading:
  * Avg. Response Time: 13.99s
  * Avg. Tokens/Second: 20.41
  * Avg. Max GPU Memory: 96.97%
  * Avg. Max GPU Utilization: 87.50%
- Continuous Response:
  * Avg. Response Time: 25.53s
  * Avg. Tokens/Second: 21.52
  * Avg. Max GPU Memory: 96.80%
  * Avg. Max GPU Utilization: 90.09%
- Performance Change (Time): -82.53%

## 3. GPU Resource Usage Summary

### 3.1 Memory Utilization & GPU Load (Aggregated)
```
Initial Loading:
                                    gpu_memory_util                                  gpu_util                   
                                               mean     median        min        max     mean median   min   max
model                                                                                                           
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ        96.96757  97.092692  96.496582  97.188314     87.5   91.5  74.0  93.0

Continuous Response:
                                    gpu_memory_util                                   gpu_util                   
                                               mean     median        min       max       mean median   min   max
model                                                                                                            
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ       96.799631  96.944173  96.195475  97.32666  90.090909   92.0  72.0  94.0
```

## 4. Scenario-based Performance Analysis (Continuous Tests)

### architecture-design
```
Performance Metrics:
                                    total_time                                  tokens_per_second                                 
                                          mean     median        min        max              mean     median        min        max
model                                                                                                                             
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ  39.597383  39.885551  35.650131  46.501197         25.089408  25.335084  23.918564  25.730352

GPU Usage:
                                    gpu_memory_util                                    gpu_util                   
                                               mean     median        min        max       mean median   min   max
model                                                                                                             
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ       96.801758  96.944173  96.362305  97.224935  91.454545   92.0  87.0  93.0
```

### code-completion
```
Performance Metrics:
                                    total_time                                 tokens_per_second                                 
                                          mean    median        min        max              mean     median        min        max
model                                                                                                                            
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ  17.157129  14.97298  11.121469  32.174838         20.337571  20.347458  20.097222  20.556489

GPU Usage:
                                    gpu_memory_util                                   gpu_util                   
                                               mean     median        min       max       mean median   min   max
model                                                                                                            
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ       96.889426  97.070312  96.240234  97.32666  88.727273   91.0  72.0  93.0
```

### code-review
```
Performance Metrics:
                                    total_time                               tokens_per_second                                 
                                          mean    median      min        max              mean     median        min        max
model                                                                                                                          
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ  13.681504  8.219838  4.25067  39.219025         20.397688  20.466736  19.747956  20.787875

GPU Usage:
                                    gpu_memory_util                                    gpu_util                   
                                               mean     median        min        max       mean median   min   max
model                                                                                                             
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ       96.826172  97.021484  96.199544  97.294108  89.818182   92.0  74.0  94.0
```

### debugging
```
Performance Metrics:
                                    total_time                                 tokens_per_second                                 
                                          mean     median        min       max              mean     median        min        max
model                                                                                                                            
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ  31.694206  32.785789  26.197013  35.02844         20.267495  20.257781  20.019648  20.476081

GPU Usage:
                                    gpu_memory_util                                    gpu_util                   
                                               mean     median        min        max       mean median   min   max
model                                                                                                             
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ       96.681167  96.671549  96.195475  97.062174  90.363636   92.0  78.0  94.0
```

## 5. Conclusions and Recommendations

### 5.1 Model Characteristics Summary

#### Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- Initial Loading Avg: 13.99s (TPS: 20.41, Memory: 96.97%)
- Continuous Response Avg: 25.53s (TPS: 21.52, Memory: 96.80%)
- Characteristics: Slow initial loading, Low throughput, High memory usage

### 5.2 Recommended Usage Scenarios
- Quick Start: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- Long-running Tasks: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- High Throughput Needs: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- Limited Memory Environment: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ

## 6. Attachments
- plots_20250328_162621/response_time_comparison.png: Model Response Time Comparison
- plots_20250328_162621/gpu_memory_comparison.png: Model GPU Memory Utilization Comparison
- plots_20250328_162621/tokens_per_second_comparison.png: Model Tokens Per Second Comparison

---
*This report was automatically generated.*
