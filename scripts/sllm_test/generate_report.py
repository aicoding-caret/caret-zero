#!/usr/bin/env python3
import argparse
import json
import os
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from typing import List, Dict, Tuple, Optional

# --- Helper Functions ---

def is_valid_df(df: Optional[pd.DataFrame], columns: List[str]) -> bool:
    """Checks if a DataFrame is not empty and contains required columns."""
    return df is not None and not df.empty and all(col in df.columns for col in columns)

def safe_mean(series: pd.Series) -> float:
    """Calculates mean, returning np.nan if series is empty or all NaN."""
    if series.empty or series.isna().all():
        return np.nan
    return series.mean()

def safe_median(series: pd.Series) -> float:
    """Calculates median, returning np.nan if series is empty or all NaN."""
    if series.empty or series.isna().all():
        return np.nan
    return series.median()

def safe_min(series: pd.Series) -> float:
    """Calculates min, returning np.nan if series is empty or all NaN."""
    if series.empty or series.isna().all():
        return np.nan
    return series.min()
    
def safe_max(series: pd.Series) -> float:
    """Calculates max, returning np.nan if series is empty or all NaN."""
    if series.empty or series.isna().all():
        return np.nan
    return series.max()

def safe_idxmin(series: pd.Series) -> Optional[str]:
    """Finds index of min value, handling empty/all NaN cases."""
    if series.empty or series.isna().all():
        return None
    try:
        return series.idxmin()
    except ValueError:
        return None

def safe_idxmax(series: pd.Series) -> Optional[str]:
    """Finds index of max value, handling empty/all NaN cases."""
    if series.empty or series.isna().all():
        return None
    try:
        return series.idxmax()
    except ValueError:
        return None

# --- Data Loading and Analysis ---

def load_results(results_dir: str, timestamp: str) -> Tuple[List[Dict], List[Dict]]:
    """Loads initial and continuous results separately."""
    initial_results = []
    continuous_results = []
    
    print(f"Loading results from: {results_dir} with timestamp: {timestamp}")
    found_files = 0
    for filename in os.listdir(results_dir):
        # Ensure we only process files matching the timestamp and ending with .json
        if timestamp in filename and filename.endswith('.json'):
            filepath = os.path.join(results_dir, filename)
            print(f"Processing file: {filename}")
            found_files += 1
            with open(filepath, 'r', encoding='utf-8-sig') as f:
                content = f.read()
                # Find the first '{' character to start parsing JSON
                json_start_index = content.find('{')
                if json_start_index != -1:
                    json_content = content[json_start_index:]
                    try:
                        data = json.loads(json_content)
                        # Basic validation
                        if 'test_type' in data and 'test_results' in data:
                            if data.get('test_type') == 'initial':
                                initial_results.append(data)
                            elif data.get('test_type') == 'continuous':
                                continuous_results.append(data)
                            else:
                                print(f"Warning: Unknown test_type '{data.get('test_type')}' in file {filename}")
                        else:
                             print(f"Warning: Missing 'test_type' or 'test_results' in file {filename}")
                    except json.JSONDecodeError as e:
                        print(f"Error decoding JSON from file {filename}: {e}")
                else:
                    print(f"Could not find JSON start in file {filename}")
    
    print(f"Found {found_files} files matching the timestamp.")
    print(f"Loaded {len(initial_results)} initial results and {len(continuous_results)} continuous results.")
    return initial_results, continuous_results

def analyze_performance(results: List[Dict], test_type: str) -> pd.DataFrame:
    """Analyzes performance metrics and returns a DataFrame."""
    performance_data = []
    
    if not results:
        print(f"Warning: No results provided for analysis (test_type: {test_type}).")
        return pd.DataFrame(performance_data) # Return empty DataFrame

    for result in results:
        model = result.get('model', 'Unknown Model')
        context_length = result.get('context_length', 'N/A')
        api_type = result.get('api_type', 'unknown') 

        if not result.get('test_results'):
            print(f"Warning: No 'test_results' found for model {model} in {test_type} data.")
            continue

        for test in result['test_results']:
            scenario_id = test.get('scenario_id', 'Unknown Scenario')
            test_result = test.get('result', {})
            
            if test_result.get('success'):
                metrics = test_result.get('metrics', {})
                
                # Safely get GPU stats
                gpu_stats_start = metrics.get('gpu_stats_start') if isinstance(metrics.get('gpu_stats_start'), list) else []
                gpu_stats_end = metrics.get('gpu_stats_end') if isinstance(metrics.get('gpu_stats_end'), list) else []
                
                gpu_memory_util = None
                gpu_util = None
                
                try:
                    if gpu_stats_start and gpu_stats_end:
                        start_memory = max((stat.get('memory_util', 0) for stat in gpu_stats_start), default=0)
                        end_memory = max((stat.get('memory_util', 0) for stat in gpu_stats_end), default=0)
                        gpu_memory_util = max(start_memory, end_memory)
                        
                        start_util = max((stat.get('gpu_util', 0) for stat in gpu_stats_start), default=0)
                        end_util = max((stat.get('gpu_util', 0) for stat in gpu_stats_end), default=0)
                        gpu_util = max(start_util, end_util)
                except Exception as e:
                    print(f"Warning: Error processing GPU stats for {model}, scenario {scenario_id}: {e}")


                performance_data.append({
                    'model': model,
                    'context_length': context_length,
                    'test_type': test_type,
                    'api_type': api_type, 
                    'scenario': scenario_id,
                    'total_time': metrics.get('total_time'),
                    'time_to_first_token': metrics.get('time_to_first_token'),
                    'tokens_per_second': metrics.get('tokens_per_second_calculated'), # Use calculated TPS
                    'api_tokens_per_second': metrics.get('api_tokens_per_second'), # API reported TPS (if available)
                    'generated_tokens': metrics.get('generated_tokens'),
                    'gpu_memory_util': gpu_memory_util,
                    'gpu_util': gpu_util
                })
            else:
                 print(f"Skipping failed test result for model {model}, scenario {scenario_id}.")

    return pd.DataFrame(performance_data)

# --- Plotting ---

def generate_performance_plots(initial_df: pd.DataFrame, continuous_df: pd.DataFrame, output_dir: str, timestamp: str):
    """Generates performance metric plots."""
    plt.style.use('default')
    sns.set_palette("husl")

    # Create a subdirectory for plots specific to this run
    plot_dir = os.path.join(output_dir, f"plots_{timestamp}") 
    os.makedirs(plot_dir, exist_ok=True)
    print(f"Saving plots to: {plot_dir}")

    # Plot 1: Response Time Comparison
    if is_valid_df(initial_df, ['model', 'total_time']) or is_valid_df(continuous_df, ['model', 'total_time']):
        plt.figure(figsize=(15, 7))
        plot_data = []
        if is_valid_df(initial_df, ['model', 'total_time']):
            plot_data.append(initial_df[['model', 'total_time']].assign(type='Initial Loading'))
        if is_valid_df(continuous_df, ['model', 'total_time']):
             plot_data.append(continuous_df[['model', 'total_time']].assign(type='Continuous Response'))
        
        if plot_data:
            data = pd.concat(plot_data)
            sns.boxplot(data=data, x='model', y='total_time', hue='type')
            plt.title('Model Response Time Comparison')
            plt.ylabel('Total Time (seconds)')
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            plt.savefig(os.path.join(plot_dir, 'response_time_comparison.png'))
        else:
             print("Warning: No data available for Response Time Comparison plot.")
    else:
        print("Warning: Insufficient columns in DataFrames for Response Time Comparison plot.")
    plt.close()

    # Plot 2: GPU Memory Utilization Comparison
    if is_valid_df(initial_df, ['model', 'gpu_memory_util']) or is_valid_df(continuous_df, ['model', 'gpu_memory_util']):
        plt.figure(figsize=(15, 7))
        plot_data = []
        if is_valid_df(initial_df, ['model', 'gpu_memory_util']):
             plot_data.append(initial_df[['model', 'gpu_memory_util']].assign(type='Initial Loading').dropna(subset=['gpu_memory_util']))
        if is_valid_df(continuous_df, ['model', 'gpu_memory_util']):
             plot_data.append(continuous_df[['model', 'gpu_memory_util']].assign(type='Continuous Response').dropna(subset=['gpu_memory_util']))
             
        if plot_data:
            data = pd.concat(plot_data)
            if not data.empty:
                sns.boxplot(data=data, x='model', y='gpu_memory_util', hue='type')
                plt.title('Model GPU Memory Utilization Comparison')
                plt.ylabel('GPU Memory Utilization (%)')
                plt.xticks(rotation=45, ha='right')
                plt.tight_layout()
                plt.savefig(os.path.join(plot_dir, 'gpu_memory_comparison.png'))
            else:
                print("Warning: No valid GPU memory utilization data after dropping NaNs.")
        else:
             print("Warning: No data available for GPU Memory Comparison plot.")
    else:
        print("Warning: Insufficient columns in DataFrames for GPU Memory Comparison plot.")
    plt.close()

    # Plot 3: Tokens Per Second Comparison (Using calculated TPS)
    if is_valid_df(initial_df, ['model', 'tokens_per_second']) or is_valid_df(continuous_df, ['model', 'tokens_per_second']):
        plt.figure(figsize=(15, 7))
        plot_data = []
        if is_valid_df(initial_df, ['model', 'tokens_per_second']):
             plot_data.append(initial_df[['model', 'tokens_per_second']].assign(type='Initial Loading'))
        if is_valid_df(continuous_df, ['model', 'tokens_per_second']):
             plot_data.append(continuous_df[['model', 'tokens_per_second']].assign(type='Continuous Response'))
        
        if plot_data:
            data = pd.concat(plot_data)
            sns.boxplot(data=data, x='model', y='tokens_per_second', hue='type')
            plt.title('Model Tokens Per Second Comparison (Calculated)')
            plt.ylabel('Tokens per Second')
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            plt.savefig(os.path.join(plot_dir, 'tokens_per_second_comparison.png')) # Save in plot subdir
        else:
             print("Warning: No data available for Tokens Per Second Comparison plot.")
    else:
        print("Warning: Insufficient columns in DataFrames for Tokens Per Second Comparison plot.")
    plt.close()

# --- Report Generation ---

def generate_markdown_report(initial_df: pd.DataFrame, continuous_df: pd.DataFrame, output_dir: str, timestamp: str):
    """Generates a markdown report summarizing the performance."""
    
    report = f"""# sLLM Performance Test Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 1. Test Environment
- Test Time: {timestamp}
"""
    # Safely get unique models and contexts
    all_models = set()
    if is_valid_df(initial_df, ['model']): all_models.update(initial_df['model'].unique())
    if is_valid_df(continuous_df, ['model']): all_models.update(continuous_df['model'].unique())
    
    all_contexts = set()
    if is_valid_df(initial_df, ['context_length']): all_contexts.update(initial_df['context_length'].unique())
    if is_valid_df(continuous_df, ['context_length']): all_contexts.update(continuous_df['context_length'].unique())
    
    report += f"- Tested Models: {', '.join(sorted(list(all_models))) if all_models else 'N/A'}\n"
    report += f"- Context Lengths: {', '.join(map(str, sorted([c for c in all_contexts if c != 'N/A']))) if all_contexts else 'N/A'}\n" # Filter out N/A

    report += """
## 2. Performance Analysis Summary
"""

    if is_valid_df(initial_df, ['model', 'total_time', 'tokens_per_second', 'gpu_memory_util']):
        try:
            report += """
### 2.1 Initial Loading Performance (Aggregated)
```
{}
```
""".format(initial_df.groupby('model')[['total_time', 'tokens_per_second', 'gpu_memory_util']].agg(['mean', 'median', 'min', 'max']).to_string())
        except Exception as e:
             report += f"\n### 2.1 Initial Loading Performance (Aggregated)\nError generating summary: {e}\n"
    else:
        report += "\n### 2.1 Initial Loading Performance (Aggregated)\nNo valid data available.\n"

    if is_valid_df(continuous_df, ['model', 'total_time', 'tokens_per_second', 'gpu_memory_util']):
        try:
            report += """
### 2.2 Continuous Response Performance (Aggregated)
```
{}
```
""".format(continuous_df.groupby('model')[['total_time', 'tokens_per_second', 'gpu_memory_util']].agg(['mean', 'median', 'min', 'max']).to_string())
        except Exception as e:
            report += f"\n### 2.2 Continuous Response Performance (Aggregated)\nError generating summary: {e}\n"
    else:
        report += "\n### 2.2 Continuous Response Performance (Aggregated)\nNo valid data available.\n"


    report += """
### 2.3 Performance Metrics by Model
"""
    
    if all_models:
        metrics_available = False
        for model in sorted(list(all_models)):
            model_init = initial_df[initial_df['model'] == model] if is_valid_df(initial_df, ['model']) else pd.DataFrame()
            model_cont = continuous_df[continuous_df['model'] == model] if is_valid_df(continuous_df, ['model']) else pd.DataFrame()
            
            # Check if there's any data for this model
            if model_init.empty and model_cont.empty:
                report += f"\n#### {model}\nNo valid test results found for this model.\n"
                continue

            metrics_available = True # Mark that we have data for at least one model

            initial_time = safe_mean(model_init['total_time']) if is_valid_df(model_init, ['total_time']) else np.nan
            continuous_time = safe_mean(model_cont['total_time']) if is_valid_df(model_cont, ['total_time']) else np.nan
            improvement = ((initial_time - continuous_time) / initial_time) * 100 if not np.isnan(initial_time) and not np.isnan(continuous_time) and initial_time != 0 else np.nan
            
            initial_tps = safe_mean(model_init['tokens_per_second']) if is_valid_df(model_init, ['tokens_per_second']) else np.nan
            continuous_tps = safe_mean(model_cont['tokens_per_second']) if is_valid_df(model_cont, ['tokens_per_second']) else np.nan
            
            initial_mem = safe_mean(model_init['gpu_memory_util']) if is_valid_df(model_init, ['gpu_memory_util']) else np.nan
            continuous_mem = safe_mean(model_cont['gpu_memory_util']) if is_valid_df(model_cont, ['gpu_memory_util']) else np.nan
            initial_gpu = safe_mean(model_init['gpu_util']) if is_valid_df(model_init, ['gpu_util']) else np.nan
            continuous_gpu = safe_mean(model_cont['gpu_util']) if is_valid_df(model_cont, ['gpu_util']) else np.nan

            report += f"""
#### {model}
- Initial Loading:
  * Avg. Response Time: {initial_time:.2f}s
  * Avg. Tokens/Second: {initial_tps:.2f}
  * Avg. Max GPU Memory: {initial_mem:.2f}%
  * Avg. Max GPU Utilization: {initial_gpu:.2f}%
- Continuous Response:
  * Avg. Response Time: {continuous_time:.2f}s
  * Avg. Tokens/Second: {continuous_tps:.2f}
  * Avg. Max GPU Memory: {continuous_mem:.2f}%
  * Avg. Max GPU Utilization: {continuous_gpu:.2f}%
- Performance Change (Time): {improvement:.2f}%
"""
        if not metrics_available:
             report += "\nNo valid data available for performance metrics by model.\n"
    else:
         report += "\nNo models found in the results.\n"


    report += """
## 3. GPU Resource Usage Summary

### 3.1 Memory Utilization & GPU Load (Aggregated)
```
Initial Loading:
{}

Continuous Response:
{}
```
""".format(
    initial_df.groupby('model')[['gpu_memory_util', 'gpu_util']].agg(['mean', 'median', 'min', 'max']).to_string() if is_valid_df(initial_df, ['model', 'gpu_memory_util', 'gpu_util']) else "No valid data.",
    continuous_df.groupby('model')[['gpu_memory_util', 'gpu_util']].agg(['mean', 'median', 'min', 'max']).to_string() if is_valid_df(continuous_df, ['model', 'gpu_memory_util', 'gpu_util']) else "No valid data."
)

    # Scenario-based performance analysis
    report += """
## 4. Scenario-based Performance Analysis (Continuous Tests)
"""
    
    if is_valid_df(continuous_df, ['scenario', 'model', 'total_time', 'tokens_per_second', 'gpu_memory_util', 'gpu_util']):
        scenarios_found = False
        for scenario in sorted(list(continuous_df['scenario'].unique())):
            scenario_df = continuous_df[continuous_df['scenario'] == scenario]
            if not scenario_df.empty:
                scenarios_found = True
                report += f"""
### {scenario}
```
Performance Metrics:
{scenario_df.groupby('model')[['total_time', 'tokens_per_second']].agg(['mean', 'median', 'min', 'max']).to_string()}

GPU Usage:
{scenario_df.groupby('model')[['gpu_memory_util', 'gpu_util']].agg(['mean', 'median', 'min', 'max']).to_string()}
```
"""
        if not scenarios_found:
             report += "\nNo valid data available for scenario-based analysis.\n"
    else:
        report += "\nNo valid data available for scenario-based analysis.\n"


    # Conclusions and recommendations
    report += """
## 5. Conclusions and Recommendations

### 5.1 Model Characteristics Summary
"""
    
    if all_models:
        characteristics_available = False
        for model in sorted(list(all_models)):
            model_init = initial_df[initial_df['model'] == model] if is_valid_df(initial_df, ['model']) else pd.DataFrame()
            model_cont = continuous_df[continuous_df['model'] == model] if is_valid_df(continuous_df, ['model']) else pd.DataFrame()

            if model_init.empty and model_cont.empty:
                continue # Skip if no data for this model

            characteristics_available = True
            initial_time_mean = safe_mean(model_init['total_time'])
            continuous_time_mean = safe_mean(model_cont['total_time'])
            initial_tps_mean = safe_mean(model_init['tokens_per_second'])
            continuous_tps_mean = safe_mean(model_cont['tokens_per_second'])
            initial_mem_mean = safe_mean(model_init['gpu_memory_util'])
            continuous_mem_mean = safe_mean(model_cont['gpu_memory_util'])

            # Calculate overall means for comparison, handle potential NaN/empty data
            overall_initial_time_mean = safe_mean(initial_df['total_time']) if is_valid_df(initial_df, ['total_time']) else np.nan
            overall_continuous_tps_mean = safe_mean(continuous_df['tokens_per_second']) if is_valid_df(continuous_df, ['tokens_per_second']) else np.nan
            overall_initial_mem_mean = safe_mean(initial_df['gpu_memory_util']) if is_valid_df(initial_df, ['gpu_memory_util']) else np.nan

            char_loading = 'N/A'
            if not np.isnan(initial_time_mean) and not np.isnan(overall_initial_time_mean):
                char_loading = 'Fast initial loading' if initial_time_mean < overall_initial_time_mean else 'Slow initial loading'
            
            char_tps = 'N/A'
            if not np.isnan(continuous_tps_mean) and not np.isnan(overall_continuous_tps_mean):
                 char_tps = 'High throughput' if continuous_tps_mean > overall_continuous_tps_mean else 'Low throughput'

            char_mem = 'N/A'
            if not np.isnan(initial_mem_mean) and not np.isnan(overall_initial_mem_mean):
                 char_mem = 'Efficient memory usage' if initial_mem_mean < overall_initial_mem_mean else 'High memory usage'

            report += f"""
#### {model}
- Initial Loading Avg: {initial_time_mean:.2f}s (TPS: {initial_tps_mean:.2f}, Memory: {initial_mem_mean:.2f}%)
- Continuous Response Avg: {continuous_time_mean:.2f}s (TPS: {continuous_tps_mean:.2f}, Memory: {continuous_mem_mean:.2f}%)
- Characteristics: {char_loading}, {char_tps}, {char_mem}
"""
        if not characteristics_available:
            report += "\nNo valid data available for model characteristics.\n"
    else:
        report += "\nNo models found in the results.\n"


    # Get best models for different scenarios, handle potential errors if data is missing
    report += """
### 5.2 Recommended Usage Scenarios
"""
    fastest_initial = safe_idxmin(initial_df.groupby('model')['total_time'].mean()) if is_valid_df(initial_df, ['model', 'total_time']) else 'N/A'
    report += f"- Quick Start: {fastest_initial if fastest_initial else 'N/A'}\n"

    fastest_continuous = safe_idxmin(continuous_df.groupby('model')['total_time'].mean()) if is_valid_df(continuous_df, ['model', 'total_time']) else 'N/A'
    report += f"- Long-running Tasks: {fastest_continuous if fastest_continuous else 'N/A'}\n"

    highest_tps = safe_idxmax(continuous_df.groupby('model')['tokens_per_second'].mean()) if is_valid_df(continuous_df, ['model', 'tokens_per_second']) else 'N/A'
    report += f"- High Throughput Needs: {highest_tps if highest_tps else 'N/A'}\n"
    
    memory_efficient = 'N/A'
    if is_valid_df(initial_df, ['model', 'gpu_memory_util']):
         mem_series = initial_df.groupby('model')['gpu_memory_util'].mean()
         if not mem_series.isna().all():
             memory_efficient = safe_idxmin(mem_series)
    report += f"- Limited Memory Environment: {memory_efficient if memory_efficient else 'N/A'}\n"


    report += f"""
## 6. Attachments
- plots_{timestamp}/response_time_comparison.png: Model Response Time Comparison
- plots_{timestamp}/gpu_memory_comparison.png: Model GPU Memory Utilization Comparison
- plots_{timestamp}/tokens_per_second_comparison.png: Model Tokens Per Second Comparison

---
*This report was automatically generated.*
"""

    # Save report
    report_filename = f'performance_report_{timestamp}.md'
    report_path = os.path.join(output_dir, report_filename)
    try:
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"Report saved to: {report_path}")
    except Exception as e:
        print(f"Error saving report file {report_path}: {e}")

# --- Main Execution ---

def main():
    parser = argparse.ArgumentParser(description='Generate sLLM performance test report')
    parser.add_argument('--results-dir', required=True, help='Directory containing JSON result files')
    parser.add_argument('--timestamp', required=True, help='Timestamp used in the result filenames (e.g., YYYYMMDD_HHMMSS)')
    args = parser.parse_args()
    
    if not os.path.isdir(args.results_dir):
        print(f"Error: Results directory not found: {args.results_dir}")
        return

    # Load results
    initial_results, continuous_results = load_results(args.results_dir, args.timestamp)
    
    if not initial_results and not continuous_results:
        print("Error: No valid result files found for the given timestamp. Cannot generate report.")
        return
        
    # Analyze performance data
    initial_df = analyze_performance(initial_results, 'initial')
    continuous_df = analyze_performance(continuous_results, 'continuous')
    
    # Generate plots (only if data exists)
    if not initial_df.empty or not continuous_df.empty:
        generate_performance_plots(initial_df, continuous_df, args.results_dir, args.timestamp)
    else:
        print("Skipping plot generation as no valid performance data was loaded.")
        
    # Generate report
    generate_markdown_report(initial_df, continuous_df, args.results_dir, args.timestamp)

if __name__ == '__main__':
    main()
