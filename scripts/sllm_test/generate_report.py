#!/usr/bin/env python3
import argparse
import json
import os
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from typing import List, Dict, Tuple

def load_results(results_dir: str, timestamp: str) -> Tuple[List[Dict], List[Dict]]:
    """초기 로딩과 연속 응답 결과를 분리하여 로드합니다."""
    initial_results = []
    continuous_results = []
    
    for filename in os.listdir(results_dir):
        if timestamp in filename and filename.endswith('.json'):
            with open(os.path.join(results_dir, filename), 'r', encoding='utf-8-sig') as f:
                content = f.read()
                # Find the first '{' character to start parsing JSON
                json_start_index = content.find('{')
                if json_start_index != -1:
                    json_content = content[json_start_index:]
                    try:
                        data = json.loads(json_content)
                        if data.get('test_type') == 'initial':
                            initial_results.append(data)
                        elif data.get('test_type') == 'continuous':
                            continuous_results.append(data)
                    except json.JSONDecodeError as e:
                        print(f"Error decoding JSON from file {filename}: {e}")
                else:
                    print(f"Could not find JSON start in file {filename}")
    
    return initial_results, continuous_results

def analyze_performance(results: List[Dict], test_type: str) -> pd.DataFrame:
    """성능 메트릭을 분석합니다."""
    performance_data = []
    
    for result in results:
        model = result['model']
        context_length = result.get('context_length', 'N/A')
        
        for test in result['test_results']:
            if test['result']['success']:
                metrics = test['result']['metrics']
                
                # Get GPU stats from both start and end measurements
                gpu_stats_start = metrics.get('gpu_stats_start', [])
                gpu_stats_end = metrics.get('gpu_stats_end', [])
                
                # Calculate average GPU utilization
                gpu_memory_util = None
                gpu_util = None
                if gpu_stats_start and gpu_stats_end:
                    # Use maximum memory utilization from any GPU
                    start_memory = max(stat.get('memory_util', 0) for stat in gpu_stats_start)
                    end_memory = max(stat.get('memory_util', 0) for stat in gpu_stats_end)
                    gpu_memory_util = max(start_memory, end_memory)
                    
                    # Use maximum GPU utilization from any GPU
                    start_util = max(stat.get('gpu_util', 0) for stat in gpu_stats_start)
                    end_util = max(stat.get('gpu_util', 0) for stat in gpu_stats_end)
                    gpu_util = max(start_util, end_util)

                performance_data.append({
                    'model': model,
                    'context_length': context_length,
                    'test_type': test_type,
                    'scenario': test['scenario_id'],
                    'total_time': metrics.get('total_time'),
                    'time_to_first_token': metrics.get('time_to_first_token'),
                    'tokens_per_second': metrics.get('tokens_per_second_calculated'),
                    'ollama_tokens_per_second': metrics.get('ollama_tokens_per_second'),
                    'generated_tokens': metrics.get('generated_tokens'),
                    'gpu_memory_util': gpu_memory_util,
                    'gpu_util': gpu_util
                })
    
    return pd.DataFrame(performance_data)

def generate_performance_plots(initial_df: pd.DataFrame, continuous_df: pd.DataFrame, output_dir: str):
    """성능 지표 그래프를 생성합니다."""
    plt.style.use('default')
    sns.set_palette("husl")
    
    # 1. 초기 로딩 vs 연속 응답 시간 비교
    plt.figure(figsize=(15, 7))
    data = pd.concat([
        initial_df[['model', 'total_time']].assign(type='Initial Loading'),
        continuous_df[['model', 'total_time']].assign(type='Continuous Response')
    ])
    sns.boxplot(data=data, x='model', y='total_time', hue='type')
    plt.title('Model Response Time Comparison')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'response_time_comparison.png'))
    plt.close()
    
    # 2. GPU 메모리 사용률 비교
    plt.figure(figsize=(15, 7))
    data = pd.concat([
        initial_df[['model', 'gpu_memory_util']].assign(type='Initial Loading').dropna(subset=['gpu_memory_util']),
        continuous_df[['model', 'gpu_memory_util']].assign(type='Continuous Response').dropna(subset=['gpu_memory_util'])
    ])
    if not data.empty:
        sns.boxplot(data=data, x='model', y='gpu_memory_util', hue='type')
        plt.title('Model GPU Memory Utilization Comparison')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'gpu_memory_comparison.png'))
    else:
        print("Warning: No valid GPU memory utilization data to plot.")
    plt.close()
    
    # 3. Tokens Per Second 비교
    plt.figure(figsize=(15, 7))
    data = pd.concat([
        initial_df[['model', 'tokens_per_second']].assign(type='Initial Loading'),
        continuous_df[['model', 'tokens_per_second']].assign(type='Continuous Response')
    ])
    sns.boxplot(data=data, x='model', y='tokens_per_second', hue='type')
    plt.title('Model Tokens Per Second Comparison')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'tokens_per_second_comparison.png'))
    plt.close()

def generate_markdown_report(initial_df: pd.DataFrame, continuous_df: pd.DataFrame, results: List[Dict], output_dir: str, timestamp: str):
    """마크다운 형식의 보고서를 생성합니다."""
    report = f"""# sLLM Performance Test Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 1. Test Environment
- Test Time: {timestamp}
- Tested Models: {', '.join(initial_df['model'].unique())}
- Context Lengths: {', '.join(map(str, initial_df['context_length'].unique()))}

## 2. Performance Analysis

### 2.1 Initial Loading Performance
```
{initial_df.groupby('model')[['total_time', 'tokens_per_second', 'gpu_memory_util']].describe().to_string()}
```

### 2.2 Continuous Response Performance
```
{continuous_df.groupby('model')[['total_time', 'tokens_per_second', 'gpu_memory_util']].describe().to_string()}
```

### 2.3 Performance Metrics
"""
    
    # Calculate performance metrics for each model
    for model in initial_df['model'].unique():
        model_init = initial_df[initial_df['model'] == model]
        model_cont = continuous_df[continuous_df['model'] == model]
        
        initial_time = model_init['total_time'].mean()
        continuous_time = model_cont['total_time'].mean()
        improvement = ((initial_time - continuous_time) / initial_time) * 100
        
        initial_tps = model_init['tokens_per_second'].mean()
        continuous_tps = model_cont['tokens_per_second'].mean()
        
        report += f"""
#### {model}
- Initial Loading:
  * Response Time: {initial_time:.2f}s
  * Tokens/Second: {initial_tps:.2f}
  * GPU Memory: {model_init['gpu_memory_util'].mean():.2f}%
  * GPU Utilization: {model_init['gpu_util'].mean():.2f}%
- Continuous Response:
  * Response Time: {continuous_time:.2f}s
  * Tokens/Second: {continuous_tps:.2f}
  * GPU Memory: {model_cont['gpu_memory_util'].mean():.2f}%
  * GPU Utilization: {model_cont['gpu_util'].mean():.2f}%
- Performance Change: {improvement:.2f}%
"""

    report += """
## 3. GPU Resource Usage

### 3.1 Memory Utilization
```
Initial Loading:
{}

Continuous Response:
{}
```
""".format(
    initial_df.groupby('model')[['gpu_memory_util', 'gpu_util']].describe().to_string(),
    continuous_df.groupby('model')[['gpu_memory_util', 'gpu_util']].describe().to_string()
)

    # Scenario-based performance analysis
    report += """
## 4. Scenario-based Performance Analysis
"""
    
    for scenario in continuous_df['scenario'].unique():
        scenario_df = continuous_df[continuous_df['scenario'] == scenario]
        report += f"""
### {scenario}
```
Performance Metrics:
{scenario_df.groupby('model')[['total_time', 'tokens_per_second']].describe().to_string()}

GPU Usage:
{scenario_df.groupby('model')[['gpu_memory_util', 'gpu_util']].describe().to_string()}
```
"""

    # Conclusions and recommendations
    report += """
## 5. Conclusions and Recommendations

### 5.1 Model Characteristics
"""
    
    for model in initial_df['model'].unique():
        model_init = initial_df[initial_df['model'] == model]
        model_cont = continuous_df[continuous_df['model'] == model]
        
        report += f"""
#### {model}
- Initial Loading: {model_init['total_time'].mean():.2f}s (TPS: {model_init['tokens_per_second'].mean():.2f}, Memory: {model_init['gpu_memory_util'].mean():.2f}%)
- Continuous Response: {model_cont['total_time'].mean():.2f}s (TPS: {model_cont['tokens_per_second'].mean():.2f}, Memory: {model_cont['gpu_memory_util'].mean():.2f}%)
- Characteristics: {'Fast initial loading' if model_init['total_time'].mean() < initial_df['total_time'].mean() else 'Slow initial loading'}, \
{'High throughput' if model_cont['tokens_per_second'].mean() > continuous_df['tokens_per_second'].mean() else 'Low throughput'}, \
{'Efficient memory usage' if model_init['gpu_memory_util'].mean() < initial_df['gpu_memory_util'].mean() else 'High memory usage'}
"""

    # Get best models for different scenarios
    fastest_initial = initial_df.groupby('model')['total_time'].mean().idxmin()
    fastest_continuous = continuous_df.groupby('model')['total_time'].mean().idxmin()
    highest_tps = continuous_df.groupby('model')['tokens_per_second'].mean().idxmax()
    
    # Only include memory-based recommendation if we have valid memory data
    memory_efficient = None
    if not initial_df['gpu_memory_util'].isna().all():
        memory_efficient = initial_df.groupby('model')['gpu_memory_util'].mean().idxmin()

    report += """
### 5.2 Recommended Usage Scenarios
"""
    report += f"- Quick Start: {fastest_initial}\n"
    report += f"- Long-running Tasks: {fastest_continuous}\n"
    report += f"- High Throughput Needs: {highest_tps}\n"
    if memory_efficient:
        report += f"- Limited Memory Environment: {memory_efficient}\n"

    report += """
## 6. Attachments
- response_time_comparison.png: Model Response Time Comparison
- gpu_memory_comparison.png: Model GPU Memory Utilization Comparison
- tokens_per_second_comparison.png: Model Tokens Per Second Comparison

---
*This report was automatically generated.*
"""

    # Save report
    report_path = os.path.join(output_dir, f'performance_report_{timestamp}.md')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

def main():
    parser = argparse.ArgumentParser(description='Generate sLLM performance test report')
    parser.add_argument('--results-dir', required=True, help='Results directory')
    parser.add_argument('--timestamp', required=True, help='Test timestamp')
    args = parser.parse_args()
    
    # Load results
    initial_results, continuous_results = load_results(args.results_dir, args.timestamp)
    
    # Analyze performance data
    initial_df = analyze_performance(initial_results, 'initial')
    continuous_df = analyze_performance(continuous_results, 'continuous')
    
    # Generate plots
    generate_performance_plots(initial_df, continuous_df, args.results_dir)
    
    # Generate report
    generate_markdown_report(initial_df, continuous_df, initial_results + continuous_results, args.results_dir, args.timestamp)

if __name__ == '__main__':
    main()
