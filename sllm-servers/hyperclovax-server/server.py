import os
import base64
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from dotenv import load_dotenv
from transformers import AutoModelForCausalLM, AutoProcessor, AutoTokenizer, TextIteratorStreamer
from PIL import Image
from io import BytesIO
import tempfile
import logging
from datetime import datetime
import torch
from fastapi.responses import StreamingResponse
import threading
import numpy as np

# 환경변수 로드
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

MODEL_PATH = os.environ.get('MODEL_PATH')
DEVICE = os.environ.get('DEVICE', 'cpu')
HUGGINGFACE_TOKEN = os.environ.get('HUGGINGFACE_TOKEN', None)
LOGGING = os.environ.get('LOGGING', 'false').lower() == 'true'
LOG_DIR = os.environ.get('LOG_DIR', './logs')

# 로그 파일명: <현재 디렉토리명>-YYYY-MM-DD.log
if LOGGING:
    current_dir_name = os.path.basename(os.path.abspath(os.path.dirname(__file__)))
    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR)
    log_filename = os.path.join(LOG_DIR, f"{current_dir_name}-{datetime.now().strftime('%Y-%m-%d')}.log")
    logging.basicConfig(
        filename=log_filename,
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s"
    )
else:
    logging.basicConfig(level=logging.CRITICAL)  # 사실상 로깅 안함

def to_dtype(obj, dtype):
    import torch
    import numpy as np
    if isinstance(obj, torch.Tensor):
        return obj.to(dtype=dtype)
    elif isinstance(obj, np.ndarray):
        # numpy도 float16/float32로 변환
        if dtype == torch.float16:
            return obj.astype(np.float16)
        elif dtype == torch.float32:
            return obj.astype(np.float32)
        else:
            return obj
    elif isinstance(obj, list):
        return [to_dtype(x, dtype) for x in obj]
    elif isinstance(obj, dict):
        return {k: to_dtype(v, dtype) for k, v in obj.items()}
    elif hasattr(obj, 'items'):
        return {k: to_dtype(v, dtype) for k, v in obj.items()}
    else:
        return obj

app = FastAPI()

# 모델 및 프로세서 로딩 (서버 시작 시)
model = None
processor = None
tokenizer = None

@app.on_event("startup")
def load_model():
    global model, processor, tokenizer
    if not MODEL_PATH:
        raise RuntimeError("MODEL_PATH 환경변수가 필요합니다.")
    # 경로를 절대경로로 변환
    abs_model_path = os.path.abspath(MODEL_PATH)
    print(f"[INFO] 모델 로딩 중: {abs_model_path} (device={DEVICE})")
    processor = AutoProcessor.from_pretrained(
        abs_model_path,
        token=HUGGINGFACE_TOKEN,
        trust_remote_code=True
    )
    tokenizer = AutoTokenizer.from_pretrained(
        abs_model_path,
        token=HUGGINGFACE_TOKEN,
        trust_remote_code=True
    )
    model = AutoModelForCausalLM.from_pretrained(
        abs_model_path,
        token=HUGGINGFACE_TOKEN,
        trust_remote_code=True
    ).to(torch.float32).to(DEVICE)
    print("[INFO] 모델 로딩 완료!")

class VisionRequest(BaseModel):
    prompt: str
    image_base64: str

@app.post("/tool/generate_hyperclovax_vision")
def generate_vision(req: VisionRequest, stream: bool = Query(False, description="Stream response as tokens")):
    if stream:
        return generate_vision_stream(req)
    if model is None or processor is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="모델이 아직 로딩되지 않았습니다.")
    tmp_path = None
    try:
        if LOGGING:
            logging.info(f"[INPUT] prompt: {req.prompt}")
        logging.info(f"[TRACE] [START] generate_vision: req = {req}")
        vlm_chat = [
            {"role": "system", "content": {"type": "text", "text": "You are a helpful assistant."}},
            {"role": "user", "content": {"type": "text", "text": req.prompt}}
        ]
        all_images = []
        is_video_list = []
        logging.info(f"[TRACE] vlm_chat initialized: {vlm_chat}")
        if req.image_base64:
            try:
                logging.info(f"[TRACE] Decoding image_base64 (len={len(req.image_base64)})")
                image_data = base64.b64decode(req.image_base64)
                with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                    tmp.write(image_data)
                    tmp_path = tmp.name
                logging.info(f"[TRACE] Temp image file created: {tmp_path}")
                from PIL import Image
                try:
                    with Image.open(tmp_path) as img:
                        img = img.copy()
                    logging.info(f"[TRACE] PIL.Image loaded successfully: {img}")
                except Exception as e:
                    logging.error(f"[ERROR] Failed to load image with PIL: {e}")
                    raise HTTPException(status_code=400, detail=f"Image load error: {e}")
                import os
                vlm_chat.append({
                    "role": "user",
                    "content": {
                        "type": "image",
                        "filename": os.path.basename(tmp_path),
                        "image": tmp_path
                    }
                })
                logging.info(f"[TRACE] vlm_chat after image append: {vlm_chat}")
            except Exception as e:
                logging.error(f"[ERROR] Exception in image processing: {e}")
                raise
        # 1. 이미지/비디오 분리 및 chat 변환
        try:
            logging.info(f"[TRACE] Calling processor.load_images_videos with vlm_chat: {vlm_chat}")
            new_vlm_chat, all_images, is_video_list = processor.load_images_videos(vlm_chat)
            logging.info(f"[TRACE] processor.load_images_videos returned new_vlm_chat: {new_vlm_chat}, all_images: {all_images}, is_video_list: {is_video_list}")
        except Exception as e:
            logging.error(f"[ERROR] processor.load_images_videos failed: {e}")
            if not req.image_base64:
                vlm_chat = [
                    {"role": "system", "content": [{"type": "text", "text": "You are a helpful assistant."}]},
                    {"role": "user", "content": [{"type": "text", "text": req.prompt}]}
                ]
                logging.info(f"[TRACE] Retrying processor.load_images_videos with fallback vlm_chat: {vlm_chat}")
                new_vlm_chat, all_images, is_video_list = processor.load_images_videos(vlm_chat)
                logging.info(f"[TRACE] Fallback processor.load_images_videos returned new_vlm_chat: {new_vlm_chat}, all_images: {all_images}, is_video_list: {is_video_list}")
            else:
                raise HTTPException(status_code=500, detail=f"preprocess error: {e}")
        if LOGGING:
            logging.info(f"[TRACE] new_vlm_chat: {new_vlm_chat}")
            logging.info(f"[TRACE] all_images: {all_images}")
            logging.info(f"[TRACE] is_video_list: {is_video_list}")
        import torch
        model_dtype = getattr(model, 'dtype', None)
        # 불필요한 TRACE/DEBUG 로그 제거 (INFO/ERROR만 유지)
        if not all_images:
            preprocessed = {}
        else:
            try:
                preprocessed = processor(
                    all_images,
                    is_video_list=is_video_list            
                )
            except Exception as e:
                logging.error(f"[ERROR] processor() failed: {e}")
                raise
        if model_dtype is not None:
            try:
                # dtype 변환 전후 dtype 로깅 (디버깅용)
                if LOGGING:
                    if isinstance(preprocessed, dict):
                        logging.info(f"[DEBUG] [BEFORE to_dtype] preprocessed dtypes: " + str({k: (v.dtype if hasattr(v, 'dtype') else type(v)) for k, v in preprocessed.items()}))
                    elif hasattr(preprocessed, 'dtype'):
                        logging.info(f"[DEBUG] [BEFORE to_dtype] preprocessed dtype: {preprocessed.dtype}")
                preprocessed = to_dtype(preprocessed, model_dtype)
                if LOGGING:
                    if isinstance(preprocessed, dict):
                        logging.info(f"[DEBUG] [AFTER to_dtype] preprocessed dtypes: " + str({k: (v.dtype if hasattr(v, 'dtype') else type(v)) for k, v in preprocessed.items()}))
                    elif hasattr(preprocessed, 'dtype'):
                        logging.info(f"[DEBUG] [AFTER to_dtype] preprocessed dtype: {preprocessed.dtype}")
            except Exception as e:
                logging.error(f"[ERROR] to_dtype failed: {e}")
                raise
        try:
            logging.info(f"[TRACE] Calling tokenizer.apply_chat_template with new_vlm_chat: {new_vlm_chat}")
            input_ids = tokenizer.apply_chat_template(
                new_vlm_chat, return_tensors="pt", tokenize=True, add_generation_prompt=True,
            )
            input_ids = input_ids.to(device=DEVICE, dtype=torch.long)
        except Exception as e:
            logging.error(f"[ERROR] tokenizer.apply_chat_template failed: {e}")
            raise
        try:
            logging.info(f"[TRACE] Calling model.generate with input_ids and preprocessed")
            output_ids = model.generate(
                input_ids=input_ids,
                max_new_tokens=8192,
                do_sample=True,
                top_p=0.6,
                temperature=0.5,
                repetition_penalty=1.0,
                **preprocessed,
            )
            result = tokenizer.batch_decode(output_ids, skip_special_tokens=True)[0]
            logging.info(f"[TRACE] tokenizer.batch_decode returned result: {result}")
            return {"result": result}
        except Exception as e:
            logging.error(f"[ERROR] model.generate or decode failed: {e}")
            raise
    except Exception as e:
        if LOGGING:
            import traceback
            logging.error(f"[FATAL ERROR] Uncaught exception: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass

@app.post("/tool/generate_hyperclovax_vision_stream")
def generate_vision_stream(req: VisionRequest):
    if model is None or processor is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="모델이 아직 로딩되지 않았습니다.")
    tmp_path = None
    try:
        if LOGGING:
            logging.info(f"[INPUT] prompt: {req.prompt}")
        vlm_chat = [
            {"role": "system", "content": {"type": "text", "text": "You are a helpful assistant."}},
            {"role": "user", "content": {"type": "text", "text": req.prompt}}
        ]
        all_images = []
        is_video_list = []
        if req.image_base64:
            image_data = base64.b64decode(req.image_base64)
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                tmp.write(image_data)
                tmp_path = tmp.name
            from PIL import Image
            try:
                with Image.open(tmp_path) as img:
                    img = img.copy()
                if LOGGING:
                    logging.info(f"[DEBUG] PIL.Image loaded successfully: {img}")
            except Exception as e:
                if LOGGING:
                    logging.error(f"[ERROR] Failed to load image with PIL: {e}")
                raise HTTPException(status_code=400, detail=f"Image load error: {e}")
            import os
            vlm_chat.append({
                "role": "user",
                "content": {
                    "type": "image",
                    "filename": os.path.basename(tmp_path),
                    "image": tmp_path
                }
            })
        # 1. 이미지/비디오 분리 및 chat 변환
        try:
            new_vlm_chat, all_images, is_video_list = processor.load_images_videos(vlm_chat)
        except Exception as e:
            if not req.image_base64:
                vlm_chat = [
                    {"role": "system", "content": [{"type": "text", "text": "You are a helpful assistant."}]},
                    {"role": "user", "content": [{"type": "text", "text": req.prompt}]}
                ]
                new_vlm_chat, all_images, is_video_list = processor.load_images_videos(vlm_chat)
            else:
                raise HTTPException(status_code=500, detail=f"preprocess error: {e}")
        model_dtype = getattr(model, 'dtype', None)
        # 간결하게: 이미지 없으면 preprocessed 빈 dict, 있으면 processor 호출
        if not all_images:
            preprocessed = {}
        else:
            try:
                preprocessed = processor(
                    all_images,
                    is_video_list=is_video_list
                )
            except Exception as e:
                logging.error(f"[ERROR] processor() failed: {e}")
                raise
        if model_dtype is not None:
            preprocessed = to_dtype(preprocessed, model_dtype)
        input_ids = tokenizer.apply_chat_template(
            new_vlm_chat, return_tensors="pt", tokenize=True, add_generation_prompt=True,
        )
        input_ids = input_ids.to(device=DEVICE, dtype=torch.long)
        streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
        thread = threading.Thread(target=model.generate, kwargs={
            "input_ids": input_ids,
            "max_new_tokens": 8192,
            "do_sample": True,
            "top_p": 0.6,
            "temperature": 0.5,
            "repetition_penalty": 1.0,
            **preprocessed,
            "streamer": streamer
        })
        thread.start()
        def event_stream():
            for new_text in streamer:
                yield new_text
        return StreamingResponse(event_stream(), media_type="text/plain")
    except Exception as e:
        if LOGGING:
            logging.error(f"[ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
