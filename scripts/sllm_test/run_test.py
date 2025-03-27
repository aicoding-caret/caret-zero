#!/usr/bin/env python3
import argparse
import json
import sys
import time
import subprocess
import psutil
import GPUtil
import requests
from datetime import datetime
from evaluator import ResponseEvaluator, evaluate_model_responses
import tiktoken # Token counting

OLLAMA_API_URL = "http://localhost:11434/api/generate"

# Initialize tokenizer (using tiktoken as an example, adjust if needed for the specific model)
# Using cl100k_base which is common for many models like GPT-4
try:
    encoding = tiktoken.get_encoding("cl100k_base")
except:
    encoding = tiktoken.encoding_for_model("gpt-4") # Fallback

def get_gpu_stats():
    """GPU 상태 정보를 가져옵니다."""
    try:
        gpus = GPUtil.getGPUs()
        stats = []
        for gpu in gpus:
            stats.append({
                'id': gpu.id,
                'memory_used': gpu.memoryUsed,
                'memory_total': gpu.memoryTotal,
                'memory_util': gpu.memoryUtil * 100,
                'gpu_util': gpu.load * 100
            })
        return stats
    except Exception as e:
        print(f"GPU stats error: {e}", file=sys.stderr)
        return "Error fetching GPU stats"

def run_ollama_query(model: str, prompt: str, system_prompt: str) -> dict:
    """Ollama API를 사용하여 쿼리를 실행하고 스트리밍으로 결과를 처리합니다."""
    start_time = time.time()
    first_token_time = None
    response_text = ""
    generated_tokens = 0
    generation_start_time = None
    final_metrics = {}
    gpu_stats_start = get_gpu_stats() # Get GPU stats before generation

    try:
        data = {
            "prompt": prompt,
            "model": model,
            "stream": True, # Enable streaming
            "system": system_prompt
        }

        with requests.post(OLLAMA_API_URL, json=data, stream=True) as response:
            response.raise_for_status() # Check for HTTP errors early

            for line in response.iter_lines():
                if line:
                    try:
                        chunk = json.loads(line.decode('utf-8'))
                        
                        # Capture first token time
                        if 'response' in chunk and chunk['response'] and first_token_time is None:
                            first_token_time = time.time()
                            generation_start_time = first_token_time # Mark generation start

                        # Append response text and count tokens
                        if 'response' in chunk:
                            token_text = chunk['response']
                            response_text += token_text
                            # Count tokens for the generated chunk
                            generated_tokens += len(encoding.encode(token_text))

                        # Check if generation is done
                        if chunk.get('done', False):
                            final_metrics = chunk # Store final metrics from Ollama
                            break # Exit loop once done

                    except json.JSONDecodeError as e:
                        print(f"JSON decode error in stream: {e} - Line: {line}", file=sys.stderr)
                        continue # Skip malformed lines
                    except Exception as e:
                         print(f"Error processing stream chunk: {e} - Chunk: {chunk}", file=sys.stderr)
                         continue


        end_time = time.time()
        gpu_stats_end = get_gpu_stats() # Get GPU stats after generation

        # Calculate metrics
        total_time = end_time - start_time
        time_to_first = first_token_time - start_time if first_token_time else None
        
        # Calculate tokens per second using generation time and token count
        generation_time = end_time - generation_start_time if generation_start_time else None
        tokens_per_second = generated_tokens / generation_time if generation_time and generation_time > 0 else 0

        # Use Ollama's final metrics if available, otherwise use calculated ones
        ollama_eval_count = final_metrics.get('eval_count', generated_tokens) # Total generated tokens
        ollama_eval_duration_ns = final_metrics.get('eval_duration', 0) # Generation duration in ns
        ollama_tps = (ollama_eval_count / (ollama_eval_duration_ns / 1e9)) if ollama_eval_duration_ns > 0 else tokens_per_second

        return {
            'success': True,
            'response': response_text,
            'metrics': {
                'total_time': total_time,
                'time_to_first_token': time_to_first,
                'generated_tokens': generated_tokens, # Calculated tokens
                'generation_time': generation_time, # Calculated generation time
                'tokens_per_second_calculated': tokens_per_second, # Calculated TPS
                'ollama_eval_count': ollama_eval_count,
                'ollama_eval_duration_sec': ollama_eval_duration_ns / 1e9 if ollama_eval_duration_ns else None,
                'ollama_tokens_per_second': ollama_tps, # TPS reported by Ollama
                'ollama_load_duration_sec': final_metrics.get('load_duration', 0) / 1e9 if final_metrics.get('load_duration') else None,
                'ollama_prompt_eval_count': final_metrics.get('prompt_eval_count'),
                'ollama_prompt_eval_duration_sec': final_metrics.get('prompt_eval_duration', 0) / 1e9 if final_metrics.get('prompt_eval_duration') else None,
                'gpu_stats_start': gpu_stats_start,
                'gpu_stats_end': gpu_stats_end
            }
        }

    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': f"HTTP error: {e}"
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"General error: {str(e)}"
        }

def main():
    parser = argparse.ArgumentParser(description='Run sLLM performance tests')
    parser.add_argument('--model', required=True, help='Model name')
    parser.add_argument('--context', type=int, required=False, help='Context length (informational, not used by script logic)')
    parser.add_argument('--test-type', required=True, choices=['initial', 'continuous'], help='Test type')
    args = parser.parse_args()

    # 시스템 프롬프트 정의
    system_prompt = "You are a helpful AI assistant." # Simplified system prompt
    
    # 평가기 초기화
    evaluator = ResponseEvaluator()
    
    # 결과 저장을 위한 데이터 구조
    results = {
        'model': args.model,
        'test_type': args.test_type,
        'timestamp': datetime.now().isoformat(),
        'test_results': []
    }

    if args.context:
        results['context_length'] = args.context

    # 테스트 케이스 선택 (초기 로딩은 첫 번째 테스트만, 연속은 모든 테스트)
    test_cases = list(evaluator.test_cases.values())
    if args.test_type == 'initial':
        test_cases = [test_cases[0]]  # 첫 번째 테스트만 실행
    
    # 테스트 실행
    for test_case in test_cases:
        print(f"\nRunning test: {test_case.id} for model {args.model}", file=sys.stderr)

        test_result_data = run_ollama_query(
            args.model,
            test_case.prompt,
            system_prompt
        )
        
        results['test_results'].append({
            'scenario_id': test_case.id,
            'result': test_result_data # Renamed variable
        })
        
        # Print intermediate results for debugging/monitoring
        if test_result_data['success']:
             metrics = test_result_data['metrics']
             print(f"  Scenario {test_case.id}: TTFT: {metrics.get('time_to_first_token'):.4f}s, TPS (Ollama): {metrics.get('ollama_tokens_per_second'):.2f}", file=sys.stderr)
        else:
             print(f"  Scenario {test_case.id}: FAILED - {test_result_data.get('error')}", file=sys.stderr)


    # 정성적 평가 수행 (연속 테스트에서만)
    if args.test_type == 'continuous' and results['test_results']:
         # Filter successful results for evaluation
        successful_results = [res for res in results['test_results'] if res['result']['success']]
        if successful_results:
            quality_scores = evaluate_model_responses(successful_results)
            results['quality_evaluation'] = quality_scores
        else:
            print("No successful results to evaluate qualitatively.", file=sys.stderr)

    
    # 결과를 JSON으로 출력
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    main()
