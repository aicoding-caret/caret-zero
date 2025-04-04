#!/usr/bin/env python3
import argparse
import json
import sys
import time
import subprocess
import psutil
import GPUtil
import psutil # Added for system RAM monitoring
import requests
import openai # Added for OpenAI compatible APIs like TGI
from datetime import datetime
from evaluator import ResponseEvaluator, evaluate_model_responses
import tiktoken # Token counting

# Default URLs (can be overridden by command-line arguments)
DEFAULT_OLLAMA_URL = "http://localhost:11434"
DEFAULT_TGI_URL = "http://localhost:8080" # Common default for TGI (Kept for reference)
DEFAULT_VLLM_URL = "http://localhost:8000" # Default for vLLM OpenAI compatible server

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

def get_ram_stats():
    """시스템 RAM 상태 정보를 가져옵니다."""
    try:
        mem = psutil.virtual_memory()
        return {
            'total_gb': mem.total / (1024**3),
            'available_gb': mem.available / (1024**3),
            'percent_used': mem.percent,
            'used_gb': mem.used / (1024**3),
            'free_gb': mem.free / (1024**3),
        }
    except Exception as e:
        print(f"RAM stats error: {e}", file=sys.stderr)
        return "Error fetching RAM stats"

# Renamed function to be more generic
def run_api_query(api_type: str, api_url: str, model: str, prompt: str, system_prompt: str) -> dict:
    """API를 사용하여 쿼리를 실행하고 스트리밍으로 결과를 처리합니다."""
    start_time = time.time()
    first_token_time = None
    response_text = ""
    generated_tokens = 0
    generation_start_time = None
    final_metrics = {} # API specific final metrics
    gpu_stats_start = get_gpu_stats() # Get GPU stats before generation
    ram_stats_start = get_ram_stats() # Get RAM stats before generation

    try:
        if api_type == 'ollama':
            # --- Ollama API Call ---
            data = {
                "prompt": prompt,
                "model": model,
                "stream": True,
                "system": system_prompt,
                "raw": False # Assuming we want templating
            }
            ollama_api_endpoint = f"{api_url}/api/generate" # Construct endpoint URL

            with requests.post(ollama_api_endpoint, json=data, stream=True) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line.decode('utf-8'))
                            if 'response' in chunk and chunk['response'] and first_token_time is None:
                                first_token_time = time.time()
                                generation_start_time = first_token_time
                            if 'response' in chunk:
                                token_text = chunk['response']
                                response_text += token_text
                                generated_tokens += len(encoding.encode(token_text))
                            if chunk.get('done', False):
                                final_metrics = chunk # Store Ollama specific metrics
                                break
                        except json.JSONDecodeError as e:
                            print(f"JSON decode error in Ollama stream: {e} - Line: {line}", file=sys.stderr)
                        except Exception as e:
                            print(f"Error processing Ollama stream chunk: {e} - Chunk: {chunk}", file=sys.stderr)

        elif api_type == 'tgi' or api_type == 'vllm': # Handle both TGI and vLLM as OpenAI compatible
            # --- OpenAI Compatible API Call (TGI / vLLM) ---
            # Note: Specific parameters might differ slightly between TGI and vLLM
            # Use the provided api_url which should point to the correct base (e.g., http://host:port)
            client = openai.OpenAI(base_url=f"{api_url}/v1", api_key="dummy") # Use dummy key for local servers

            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            # Use the model name passed from the batch script
            # For vLLM, this should be the Hugging Face model ID (e.g., "Qwen/Qwen2.5-Coder-32B-Instruct")
            # For TGI, it was also the Hugging Face model ID
            stream = client.chat.completions.create(
                model=model, 
                messages=messages,
                stream=True,
                # Add other parameters if needed (e.g., max_tokens, temperature)
                # max_tokens=1024, # Example
            )

            for chunk in stream:
                if not chunk.choices: continue
                delta = chunk.choices[0].delta

                if delta.content:
                    if first_token_time is None:
                        first_token_time = time.time()
                        generation_start_time = first_token_time
                    token_text = delta.content
                    response_text += token_text
                    generated_tokens += len(encoding.encode(token_text))

            # OpenAI compatible APIs (TGI, vLLM) don't typically provide detailed final metrics like Ollama in the stream
            # We will rely on calculated metrics

        else:
            raise ValueError(f"Unsupported API type: {api_type}")

        end_time = time.time()
        gpu_stats_end = get_gpu_stats() # Get GPU stats after generation
        ram_stats_end = get_ram_stats() # Get RAM stats after generation

        # --- Calculate Metrics ---
        total_time = end_time - start_time
        time_to_first = first_token_time - start_time if first_token_time else None
        generation_time = end_time - generation_start_time if generation_start_time else None
        tokens_per_second_calculated = generated_tokens / generation_time if generation_time and generation_time > 0 else 0

        # Prepare metrics dictionary - more generic names
        metrics_output = {
            'total_time': total_time,
            'time_to_first_token': time_to_first,
            'generated_tokens': generated_tokens,
            'generation_time': generation_time,
            'tokens_per_second_calculated': tokens_per_second_calculated,
            'gpu_stats_start': gpu_stats_start,
            'gpu_stats_end': gpu_stats_end,
            'ram_stats_start': ram_stats_start, # Added RAM stats
            'ram_stats_end': ram_stats_end      # Added RAM stats
        }

        # Add API-specific metrics if available (primarily for Ollama)
        if api_type == 'ollama' and final_metrics:
            ollama_eval_count = final_metrics.get('eval_count', generated_tokens)
            ollama_eval_duration_ns = final_metrics.get('eval_duration', 0)
            ollama_tps = (ollama_eval_count / (ollama_eval_duration_ns / 1e9)) if ollama_eval_duration_ns > 0 else tokens_per_second_calculated
            metrics_output.update({
                'api_eval_count': ollama_eval_count, # Renamed
                'api_eval_duration_sec': ollama_eval_duration_ns / 1e9 if ollama_eval_duration_ns else None, # Renamed
                'api_tokens_per_second': ollama_tps, # Renamed
                'api_load_duration_sec': final_metrics.get('load_duration', 0) / 1e9 if final_metrics.get('load_duration') else None, # Renamed
                'api_prompt_eval_count': final_metrics.get('prompt_eval_count'), # Renamed
                'api_prompt_eval_duration_sec': final_metrics.get('prompt_eval_duration', 0) / 1e9 if final_metrics.get('prompt_eval_duration') else None # Renamed
            })

        return {
            'success': True,
            'response': response_text,
            'metrics': metrics_output
        }

    except (requests.exceptions.RequestException, openai.APIError) as e: # Catch both requests and openai errors
        return {
            'success': False,
            'error': f"API error: {e}" # Generic API error message
        }
    except Exception as e:
        return {
            'success': False,
            'error': f"General error: {str(e)}"
        }

def main():
    parser = argparse.ArgumentParser(description='Run sLLM performance tests')
    parser.add_argument('--api-type', default='ollama', choices=['ollama', 'tgi', 'vllm'], help='Type of API endpoint') # Added vllm
    parser.add_argument('--api-url', help=f'Base URL for the API endpoint (e.g., {DEFAULT_OLLAMA_URL} for Ollama, {DEFAULT_VLLM_URL} for vLLM)') # Updated help text
    parser.add_argument('--model', required=True, help='Model name (specific to the API type)')
    parser.add_argument('--context', type=int, required=False, help='Context length (informational, not used by script logic)')
    parser.add_argument('--test-type', required=True, choices=['initial', 'continuous'], help='Test type')
    parser.add_argument('--limit-scenarios', type=int, default=None, help='Limit the number of scenarios to run')
    parser.add_argument('--limit-prompts', type=int, default=None, help='Limit the number of prompts per scenario')
    args = parser.parse_args()

    # Determine API URL
    api_url = args.api_url
    if not api_url:
        if args.api_type == 'ollama':
            api_url = DEFAULT_OLLAMA_URL
        elif args.api_type == 'tgi': # Keep TGI default for reference if needed later
            api_url = DEFAULT_TGI_URL
        elif args.api_type == 'vllm':
            api_url = DEFAULT_VLLM_URL
        else:
            print(f"Error: Default URL not known for API type '{args.api_type}'. Please provide --api-url.", file=sys.stderr)
            sys.exit(1)

    # 시스템 프롬프트 정의
    system_prompt = "You are a helpful AI assistant." # Simplified system prompt
    
    # 평가기 초기화
    evaluator = ResponseEvaluator()
    
    # 결과 저장을 위한 데이터 구조
    results = {
        'api_type': args.api_type, # Added api_type to results
        'api_url': api_url,       # Added api_url to results
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
    
    # Apply scenario limit if provided
    if args.limit_scenarios is not None:
        test_cases = test_cases[:args.limit_scenarios]
        print(f"Limiting to first {args.limit_scenarios} scenarios.", file=sys.stderr)

    # 테스트 실행 - 각 시나리오의 모든 프롬프트에 대해 실행
    all_prompt_results = [] # 개별 프롬프트 결과를 임시 저장
    for test_case in test_cases:
        print(f"\nRunning scenario: {test_case.id} via {args.api_type} for model {args.model}", file=sys.stderr)
        scenario_prompt_results = [] # 현재 시나리오의 프롬프트 결과 저장

        prompts_to_run = test_case.prompts
        # Apply prompt limit if provided
        if args.limit_prompts is not None:
            prompts_to_run = prompts_to_run[:args.limit_prompts]
            print(f"  Limiting to first {args.limit_prompts} prompts for this scenario.", file=sys.stderr)

        for i, prompt_text in enumerate(prompts_to_run):
            print(f"  Running prompt {i+1}/{len(prompts_to_run)}...", file=sys.stderr)
            test_result_data = run_api_query(
                args.api_type,
                api_url,
                args.model,
                prompt_text, # 개별 프롬프트 사용
                system_prompt
            )

            # 결과에 시나리오 ID와 프롬프트 인덱스 추가
            prompt_result = {
                'scenario_id': test_case.id,
                'prompt_index': i,
                'prompt': prompt_text, # 어떤 프롬프트였는지 기록
                'result': test_result_data
            }
            scenario_prompt_results.append(prompt_result)
            all_prompt_results.append(prompt_result) # 전체 결과에도 추가

            # Print intermediate results for debugging/monitoring per prompt
            if test_result_data['success']:
                 metrics = test_result_data['metrics']
                 tps_to_print = metrics.get('tokens_per_second_calculated', 0)
                 api_tps = metrics.get('api_tokens_per_second')
                 tps_source = "calculated" if api_tps is None else "API"
                 if api_tps is not None:
                     tps_to_print = api_tps
                 print(f"    Prompt {i+1}: TTFT: {metrics.get('time_to_first_token'):.4f}s, TPS ({tps_source}): {tps_to_print:.2f}", file=sys.stderr)
            else:
                 print(f"    Prompt {i+1}: FAILED - {test_result_data.get('error')}", file=sys.stderr)

        # 시나리오별 평균 메트릭 계산 (선택적 - 일단 개별 결과 저장)
        # results['test_results'] 에 scenario_prompt_results 를 넣거나,
        # 아니면 모든 개별 결과를 all_prompt_results 로 저장하고 나중에 처리
        # 여기서는 모든 개별 결과를 저장하는 방식을 사용
        # (evaluate_model_responses 에서 시나리오별 평균 점수를 계산하므로)

    # 최종 결과 구조에 모든 개별 프롬프트 결과 저장
    results['test_results'] = all_prompt_results

    # 정성적 평가 수행 (연속 테스트에서만, 모든 성공한 결과 대상)
    if args.test_type == 'continuous' and results['test_results']:
         successful_results = [res for res in results['test_results'] if res['result']['success']]
         if successful_results:
             # evaluate_model_responses 가 prompt_index 를 사용하도록 수정 필요 (evaluator.py 에서 이미 반영 시도)
             quality_scores = evaluate_model_responses(successful_results)
             results['quality_evaluation'] = quality_scores
         else:
             print("No successful results to evaluate qualitatively.", file=sys.stderr)


    # 결과를 JSON으로 출력
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    main()
