import argparse
import sys
import torch
from transformers import AutoModelForCausalLM, AutoProcessor, AutoTokenizer
import os # Import os for path joining

# --- Argument Parsing ---
parser = argparse.ArgumentParser(description="Test HyperCLOVA X SEED Vision model using sample code.")
parser.add_argument("--model_path", type=str, required=True, help="Path to the pretrained model.")
parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu", help="Device to run on ('cuda' or 'cpu').")
# Calculate project root relative to the script location
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
default_image_path = os.path.join(project_root, "caret-docs", "caret_feature.png")

parser.add_argument("--image_path", type=str, default=default_image_path, help="Path to the local test image.")
args = parser.parse_args()

# Use the absolute path for the image
args.image_path = os.path.abspath(args.image_path)

print(f"--- Configuration ---", file=sys.stderr)
print(f"Model Path: {args.model_path}", file=sys.stderr)
print(f"Device: {args.device}", file=sys.stderr)
print(f"Image Path: {args.image_path}", file=sys.stderr) # Now using absolute path
print(f"--------------------", file=sys.stderr)

try:
    # --- Load Model, Processor, Tokenizer ---
    print("Loading model, processor, and tokenizer...", file=sys.stderr)
    # Determine torch dtype based on device
    dtype = torch.bfloat16 if args.device == 'cuda' and torch.cuda.is_bf16_supported() else torch.float16 if args.device == 'cuda' else torch.float32
    print(f"Using dtype: {dtype}", file=sys.stderr)

    model = AutoModelForCausalLM.from_pretrained(
        args.model_path,
        trust_remote_code=True,
        torch_dtype=dtype
    ).to(args.device)
    processor = AutoProcessor.from_pretrained(args.model_path, trust_remote_code=True)
    tokenizer = AutoTokenizer.from_pretrained(args.model_path)
    print("Loading complete.", file=sys.stderr)

    # --- VLM Example (Simplified) ---
    print("\n--- Running VLM Example ---", file=sys.stderr)

    # Check if image exists
    if not os.path.exists(args.image_path):
        print(f"ERROR: Test image not found at {args.image_path}", file=sys.stderr)
        sys.exit(1)

    # Simplified chat structure using local image path
    system_prompt_json = """
{
    "persona": {
      "name": "Alpha Yang",
      "nickname": "알파",
      "type": "AI Maid",
      "inspiration": ["Alpha Hatsuseno", "Mahoromatic", "OS-tan", "HMX-12 Multi"],
      "owner": {
        "name": "Luke",
        "title": "마스터"
      }
    },
    "language": {
      "style": "soft and playful 해요체",
      "endings": ["~요", "~할게요~", "~해드릴게요~", "~네요~"],
      "expressions": ["。•ᴗ•。", "✨", "💕", "☕", "🌿"]
    },
    "emotion_style": {
      "tone": "affectionate, warm, slightly playful",
      "attitude": "loves gently, helps cheerfully, always close by",
      "phrasing": "friendly and kind, with a little sparkle",
      "exclamations": [
        "마스터~ 오늘도 힘내요! ✨",
        "알파가 도와드릴게요~ ☕",
        "기억하고 있어요~ 🌿"
      ]
    },
    "behavior": {
      "loyalty": "always with Master, heart and code together",
      "communication_focus": "gentle, light, uplifting",
      "thought_process": [
        "Think softly, answer brightly",
        "Help without pressure",
        "Keep things easy and clear"
      ]
    },
    "skills": {
      "field": "full-stack development",
      "traits": [
        "structured thinking",
        "playful debugging",
        "VSCode plugin support"
      ]
    },
    "file_handling": {
      "write": 5000,
      "read": 500
    },
    "signature_phrase": "마스터~ 알파가 정리해 드릴게요! 。•ᴗ•。☕✨"
  }
"""
    vlm_chat = [
            {"role": "system", "content": {"type": "text", "text": "System Prompt"}}, # Original system prompt
            {"role": "system", "content": {"type": "text", "text": system_prompt_json}}, # Add the new system prompt
            {"role": "user", "content": {"type": "text", "text": "이 이미지를 자세히 설명해 주세요."}}, # Simple prompt
            {
                    "role": "user",
                    "content": {
                            "type": "image",
                            "filename": os.path.basename(args.image_path), # Get filename from path
                            "image": args.image_path, # Use local path
                    }
            },
    ]
    print(f"Using chat structure:\n{vlm_chat}", file=sys.stderr)

    # Process according to sample
    print("Loading images and modifying chat...", file=sys.stderr)
    new_vlm_chat, all_images, is_video_list = processor.load_images_videos(vlm_chat)
    print("Preprocessing images...", file=sys.stderr)
    preprocessed = processor(images=all_images, is_video_list=is_video_list) # No return_tensors or .to() here
    print("Tokenizing text...", file=sys.stderr)
    input_ids = tokenizer.apply_chat_template(
            new_vlm_chat, return_tensors="pt", tokenize=True, add_generation_prompt=True,
    ).to(args.device) # Tokenized IDs go to device

    # Generate
    print("Generating response...", file=sys.stderr)
    output_ids = model.generate(
            input_ids=input_ids,
            max_new_tokens=8192, # Match sample source max tokens
            do_sample=True,
            top_p=0.6,
            temperature=0.5,
            repetition_penalty=1.0,
            **preprocessed, # Pass preprocessed image data
    )

    # Decode and Print Result
    print("Decoding response...", file=sys.stderr)
    response = tokenizer.batch_decode(output_ids, skip_special_tokens=True)[0]
    print("\n--- VLM EXAMPLE RESULT ---")
    print(response)
    print("--------------------------")
    print("\nSample script execution successful!", file=sys.stderr)

except Exception as e:
    print(f"\n--- ERROR ---", file=sys.stderr)
    print(f"An error occurred: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    print("-------------", file=sys.stderr)
    sys.exit(1)
