import requests
import base64
import time

API_URL = "http://localhost:8000/tool/generate_hyperclovax_vision"
API_URL_STREAM = "http://localhost:8000/tool/generate_hyperclovax_vision_stream"

# (1) 이미지 없는 프롬프트 (텍스트만)
def test_no_image(stream=False):
    data = {
        "prompt": "이 모델의 주요 특징을 요약해줘.",
        "image_base64": ""
    }
    url = API_URL + ("?stream=true" if stream else "")
    start = time.time()
    resp = requests.post(url, json=data, stream=stream)
    elapsed = None
    if stream:
        print("--- 스트리밍(이미지X) ---")
        received = 0
        for chunk in resp.iter_content(chunk_size=None):
            print(chunk.decode("utf-8"), end="", flush=True)
            received += len(chunk)
        print()
        elapsed = time.time() - start
        print(f"[스트리밍(이미지X) TPS] 전체 소요: {elapsed:.2f}s, 총 바이트: {received}")
    else:
        print("--- 일반(이미지X) ---")
        print(resp.json())
        elapsed = time.time() - start
        print(f"[일반(이미지X) TPS] 전체 소요: {elapsed:.2f}s")

# (2) 이미지 포함 (base64 인코딩)
def test_with_image(stream=False):
    with open("caret_feature.png", "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")
    data = {
        "prompt": "이 이미지를 설명해줘.",
        "image_base64": img_b64
    }
    url = API_URL + ("?stream=true" if stream else "")
    start = time.time()
    resp = requests.post(url, json=data, stream=stream)
    elapsed = None
    if stream:
        print("--- 스트리밍(이미지O) ---")
        received = 0
        for chunk in resp.iter_content(chunk_size=None):
            print(chunk.decode("utf-8"), end="", flush=True)
            received += len(chunk)
        print()
        elapsed = time.time() - start
        print(f"[스트리밍(이미지O) TPS] 전체 소요: {elapsed:.2f}s, 총 바이트: {received}")
    else:
        print("--- 일반(이미지O) ---")
        print(resp.json())
        elapsed = time.time() - start
        print(f"[일반(이미지O) TPS] 전체 소요: {elapsed:.2f}s")

# (3) 별도 스트리밍 엔드포인트 (이미지/텍스트)
def test_stream_endpoint(with_image=False):
    if with_image:
        with open("caret_feature.png", "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode("utf-8")
        data = {"prompt": "이 이미지를 설명해줘.", "image_base64": img_b64}
        print("--- 별도 스트림 엔드포인트(이미지O) ---")
    else:
        data = {"prompt": "텍스트만 설명해줘.", "image_base64": ""}
        print("--- 별도 스트림 엔드포인트(이미지X) ---")
    start = time.time()
    resp = requests.post(API_URL_STREAM, json=data, stream=True)
    received = 0
    for chunk in resp.iter_content(chunk_size=None):
        print(chunk.decode("utf-8"), end="", flush=True)
        received += len(chunk)
    print()
    elapsed = time.time() - start
    print(f"[별도 스트림 엔드포인트{'(이미지O)' if with_image else '(이미지X)'} TPS] 전체 소요: {elapsed:.2f}s, 총 바이트: {received}")

if __name__ == "__main__":
    # 1. 일반 응답 (이미지X)
    test_no_image(stream=False)
    # 2. 일반 응답 (이미지O)
    test_with_image(stream=False)
    # 3. 스트리밍 응답 (이미지X)
    test_no_image(stream=True)
    # 4. 스트리밍 응답 (이미지O)
    test_with_image(stream=True)
    # 5. 별도 스트림 엔드포인트 (이미지X)
    test_stream_endpoint(with_image=False)
    # 6. 별도 스트림 엔드포인트 (이미지O)
    test_stream_endpoint(with_image=True)
