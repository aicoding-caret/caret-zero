# sLLM Performance Test Report
Generated: 2025-03-29 01:28:16

## 1. Test Environment
- Test Time: 20250329_005124
- Tested Models: Qwen/Qwen2.5-Coder-32B-Instruct-AWQ, Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- Context Lengths: 

## 2. Performance Analysis Summary

### 2.1 Initial Loading Performance (Aggregated)
```
                                          total_time                                tokens_per_second                                  gpu_memory_util                                 
                                                mean   median        min        max              mean     median        min        max            mean     median        min        max
model                                                                                                                                                                                  
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ        16.942429  16.0195  14.345609  20.462179         20.709398  20.755808  20.490907  20.881479       87.235514  87.239583  87.227376  87.239583
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4   7.368459   7.3862   6.406466   8.312710         49.910039  50.013536  49.623093  50.093487       84.865994  84.863281  84.863281  84.871419
```

### 2.2 Continuous Response Performance (Aggregated)
```
                                          total_time                                tokens_per_second                                  gpu_memory_util                                 
                                                mean    median       min        max              mean     median        min        max            mean     median        min        max
model                                                                                                                                                                                  
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ         9.575303  8.272864  2.259466  25.281219         42.258283  42.234063  41.632179  43.038633       84.818522  84.700521  84.700521  86.047363
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4   8.278730  6.782669  1.995967  24.202686         49.956091  49.882450  49.308424  51.161158       84.871419  84.871419  84.871419  84.871419
```

### 2.3 Performance Metrics by Model

#### Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- Initial Loading:
  * Avg. Response Time: 16.94s
  * Avg. Tokens/Second: 20.71
  * Avg. Max GPU Memory: 87.24%
  * Avg. Max GPU Utilization: 82.33%
- Continuous Response:
  * Avg. Response Time: 9.58s
  * Avg. Tokens/Second: 42.26
  * Avg. Max GPU Memory: 84.82%
  * Avg. Max GPU Utilization: 85.77%
- Performance Change (Time): 43.48%

#### Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- Initial Loading:
  * Avg. Response Time: 7.37s
  * Avg. Tokens/Second: 49.91
  * Avg. Max GPU Memory: 84.87%
  * Avg. Max GPU Utilization: 83.00%
- Continuous Response:
  * Avg. Response Time: 8.28s
  * Avg. Tokens/Second: 49.96
  * Avg. Max GPU Memory: 84.87%
  * Avg. Max GPU Utilization: 83.40%
- Performance Change (Time): -12.35%

## 3. GPU Resource Usage Summary

### 3.1 Memory Utilization & GPU Load (Aggregated)
```
Initial Loading:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             87.235514  87.239583  87.227376  87.239583  82.333333   86.0  69.0  92.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.865994  84.863281  84.863281  84.871419  83.000000   83.0  82.0  84.0

Continuous Response:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             84.818522  84.700521  84.700521  86.047363  85.766667   86.0  77.0  88.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.871419  84.871419  84.871419  84.871419  83.400000   84.0  77.0  86.0
```

## 4. Scenario-based Performance Analysis (Continuous Tests)

### algorithm
```
Performance Metrics:
                                          total_time                                 tokens_per_second                                 
                                                mean     median       min        max              mean     median        min        max
model                                                                                                                                  
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ        11.043454  12.069544  7.043376  15.422662         42.226398  42.279993  41.995449  42.425724
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4   8.907687   8.908986  5.641963  12.187941         49.774334  49.835590  49.447058  50.016810

GPU Usage:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             84.818070  84.700521  84.700521  85.066732  85.666667   86.0  82.0  87.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.871419  84.871419  84.871419  84.871419  83.222222   83.0  80.0  85.0
```

### architecture-design
```
Performance Metrics:
                                          total_time                                  tokens_per_second                                 
                                                mean     median        min        max              mean     median        min        max
model                                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ        19.906303  19.085221  15.723145  25.281219         41.948455  41.999702  41.632179  42.071243
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4  17.171990  16.820635  13.418267  24.202686         49.818841  49.881089  49.543617  50.066700

GPU Usage:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             84.775119  84.700521  84.700521  84.924316  85.444444   86.0  81.0  88.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.871419  84.871419  84.871419  84.871419  84.666667   85.0  83.0  86.0
```

### code-completion
```
Performance Metrics:
                                          total_time                                tokens_per_second                                 
                                                mean    median       min        max              mean     median        min        max
model                                                                                                                                 
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ         8.546160  8.467047  6.337544  10.353746         42.310925  42.497651  41.666364  42.835916
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4   7.280333  7.148780  5.866026   8.879714         49.874518  49.914614  49.308424  50.510548

GPU Usage:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             84.943757  84.700521  84.700521  86.047363  83.777778   84.0  77.0  87.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.871419  84.871419  84.871419  84.871419  81.666667   82.0  77.0  86.0
```

### code-review
```
Performance Metrics:
                                          total_time                                tokens_per_second                                 
                                                mean     median       min       max              mean     median        min        max
model                                                                                                                                 
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ        11.930051  11.880116  10.78267  13.87227         41.940342  42.000423  41.683154  42.175946
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4  10.485393  10.416255   6.91403  12.05550         49.845477  49.920867  49.410081  50.438805

GPU Usage:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             84.775119  84.700521  84.700521  84.924316  85.111111   86.0  79.0  88.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.871419  84.871419  84.871419  84.871419  84.222222   84.0  80.0  86.0
```

### debugging
```
Performance Metrics:
                                          total_time                               tokens_per_second                                 
                                                mean    median       min       max              mean     median        min        max
model                                                                                                                                
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ         4.940487  4.204515  3.444494  8.818444         42.381139  42.414457  42.059266  42.636099
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4   3.949350  3.894264  2.546662  5.656777         49.933775  49.883810  49.422561  50.548384

GPU Usage:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             84.775119  84.700521  84.700521  84.924316  86.777778   87.0  86.0  88.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.871419  84.871419  84.871419  84.871419  82.555556   83.0  79.0  85.0
```

### documentation
```
Performance Metrics:
                                          total_time                               tokens_per_second                                 
                                                mean    median       min       max              mean     median        min        max
model                                                                                                                                
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ         5.796239  4.869171  4.585836  8.446681         42.258526  42.272203  42.015084  42.592479
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4   5.299756  4.978366  3.115267  8.008894         49.880553  49.844982  49.563527  50.236715

GPU Usage:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             84.815809  84.700521  84.700521  85.046387  86.000000   86.0  84.0  87.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.871419  84.871419  84.871419  84.871419  83.555556   84.0  81.0  86.0
```

### refactoring
```
Performance Metrics:
                                          total_time                               tokens_per_second                                 
                                                mean    median       min       max              mean     median        min        max
model                                                                                                                                
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ         4.105453  4.262926  2.259466  6.261837         42.492370  42.373921  42.036378  43.038633
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4   3.607915  3.389377  1.995967  5.611767         50.151776  50.024227  49.338382  51.161158

GPU Usage:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             84.834798  84.700521  84.700521  85.103353  87.000000   87.0  85.0  88.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.871419  84.871419  84.871419  84.871419  81.444444   81.0  78.0  85.0
```

### regex
```
Performance Metrics:
                                          total_time                                tokens_per_second                                 
                                                mean    median       min        max              mean     median        min        max
model                                                                                                                                 
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ         8.660010  7.760232  6.157278  13.498805         42.301256  42.294014  41.975367  42.598373
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4   7.870271  6.695811  5.257574  11.377815         50.049732  49.977910  49.697787  50.658509

GPU Usage:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             84.815809  84.700521  84.700521  85.046387  85.888889   86.0  83.0  88.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.871419  84.871419  84.871419  84.871419  84.111111   85.0  78.0  86.0
```

### sql-query
```
Performance Metrics:
                                          total_time                               tokens_per_second                                 
                                                mean    median       min       max              mean     median        min        max
model                                                                                                                                
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ         4.094245  3.518105  2.536331  6.386986         42.595704  42.682275  42.233717  42.845631
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4   3.639991  3.206069  2.270629  5.471580         50.291732  50.203900  49.786055  50.885521

GPU Usage:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             84.815809  84.700521  84.700521  85.046387  86.777778   87.0  86.0  88.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.871419  84.871419  84.871419  84.871419  84.555556   84.0  84.0  86.0
```

### unit-test
```
Performance Metrics:
                                          total_time                                  tokens_per_second                                 
                                                mean     median        min        max              mean     median        min        max
model                                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ        16.730623  16.178740  12.633537  22.609929         42.127716  42.124589  41.941898  42.291932
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4  14.574612  13.928354  12.897146  20.097317         49.940174  49.807261  49.532556  50.723505

GPU Usage:
                                          gpu_memory_util                                    gpu_util                   
                                                     mean     median        min        max       mean median   min   max
model                                                                                                                   
Qwen/Qwen2.5-Coder-32B-Instruct-AWQ             84.815809  84.700521  84.700521  85.046387  85.222222   85.0  82.0  88.0
Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4       84.871419  84.871419  84.871419  84.871419  84.000000   84.0  79.0  86.0
```

## 5. Conclusions and Recommendations

### 5.1 Model Characteristics Summary

#### Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
- Initial Loading Avg: 16.94s (TPS: 20.71, Memory: 87.24%)
- Continuous Response Avg: 9.58s (TPS: 42.26, Memory: 84.82%)
- Characteristics: Slow initial loading, Low throughput, High memory usage

#### Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- Initial Loading Avg: 7.37s (TPS: 49.91, Memory: 84.87%)
- Continuous Response Avg: 8.28s (TPS: 49.96, Memory: 84.87%)
- Characteristics: Fast initial loading, High throughput, Efficient memory usage

### 5.2 Recommended Usage Scenarios
- Quick Start: Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- Long-running Tasks: Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- High Throughput Needs: Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4
- Limited Memory Environment: Qwen/Qwen2.5-Coder-32B-Instruct-GPTQ-Int4

## 6. Attachments
- plots_20250329_005124/response_time_comparison.png: Model Response Time Comparison
- plots_20250329_005124/gpu_memory_comparison.png: Model GPU Memory Utilization Comparison
- plots_20250329_005124/tokens_per_second_comparison.png: Model Tokens Per Second Comparison

---
*This report was automatically generated.*
