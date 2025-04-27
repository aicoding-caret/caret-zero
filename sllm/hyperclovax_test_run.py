import argparse
import sys
import json
import base64
from PIL import Image
import io
import torch
from transformers import AutoModelForCausalLM, AutoProcessor, AutoTokenizer # Added AutoTokenizer
import traceback

def main():
    parser = argparse.ArgumentParser(description="Run HyperCLOVA X SEED Vision model.")
    parser.add_argument("--model_path", type=str, required=True, help="Path to the pretrained model or model identifier from HuggingFace.")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu", help="Device to run the model on (e.g., 'cuda', 'cpu').")
    # Input will come via stdin as a JSON object: {"prompt": "...", "image_base64": "..."}

    args = parser.parse_args()

    # Use stderr for logging to keep stdout clean for JSON results
    print(f"Initializing HyperCLOVA X SEED script...", file=sys.stderr)
    print(f"Using device: {args.device}", file=sys.stderr)
    print(f"Loading model from: {args.model_path}", file=sys.stderr)

    try:
        # Determine torch dtype based on device
        dtype = torch.bfloat16 if args.device == 'cuda' and torch.cuda.is_bf16_supported() else torch.float16 if args.device == 'cuda' else torch.float32
        print(f"Using dtype: {dtype}", file=sys.stderr)

        # Load model and processor
        model = AutoModelForCausalLM.from_pretrained(
            args.model_path,
            trust_remote_code=True,
            torch_dtype=dtype
        ).to(args.device)
        processor = AutoProcessor.from_pretrained(args.model_path, trust_remote_code=True)
        tokenizer = AutoTokenizer.from_pretrained(args.model_path) # Load tokenizer

        print("Model, processor, and tokenizer loaded successfully.", file=sys.stderr)

        # Read input from stdin
        print("Waiting for input on stdin...", file=sys.stderr)
        input_data = json.load(sys.stdin)
        print("Received input data.", file=sys.stderr)

        prompt = input_data.get("prompt")
        image_base64 = input_data.get("image_base64")

        if not prompt:
            print(json.dumps({"error": "Input JSON must contain a 'prompt' field."}))
            sys.exit(1)

        # Prepare message format for the model (based on typical vision model patterns)
        messages = [{"role": "system", "content": {"type": "text", "text": "System Prompt"}}]
        messages.append({"role": "user", "content": [{"type": "text", "text": prompt}]})
        image = None
        if image_base64:
            print("Processing base64 image...", file=sys.stderr)
            try:
                image_bytes = base64.b64decode(image_base64)
                image = Image.open(io.BytesIO(image_bytes))
                # Add image placeholder to the message structure. The processor will handle the actual image data.
                messages[-1]["content"].append({"type": "image", "image": image})
                print("Image processed successfully.", file=sys.stderr)
            except Exception as e:
                print(f"Error decoding/opening image: {e}", file=sys.stderr)
                print(json.dumps({"error": f"Failed to process base64 image: {e}"}))
                sys.exit(1)
        else:
             print("No image provided.", file=sys.stderr)

        # Follow the sample source structure
        print("Applying chat template and preparing inputs...", file=sys.stderr)

        # 1. Load images/videos and modify chat structure
        new_vlm_chat, all_images, is_video_list = processor.load_images_videos(messages)

        # 2. Preprocess only images/videos if they exist
        generation_kwargs = {}
        if all_images:
            print("Preprocessing images...", file=sys.stderr)
            preprocessed = processor(images=all_images, is_video_list=is_video_list)
            generation_kwargs = preprocessed
        else:
            print("No images to preprocess.", file=sys.stderr)

        # 3. Tokenize the modified text chat structure
        input_ids = tokenizer.apply_chat_template(
            new_vlm_chat,
            return_tensors="pt",
            tokenize=True,
            add_generation_prompt=True
        ).to(args.device)

        print("Inputs prepared.", file=sys.stderr)

        print("Generating response...", file=sys.stderr)
        # 4. Generate response passing input_ids and preprocessed data (if any)
        output_sequences = model.generate(
            input_ids=input_ids,
            max_new_tokens=1024,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            **generation_kwargs # Pass preprocessed image/video data if it exists
        )

        print("Decoding response...", file=sys.stderr)
        # 5. Decode the output using the tokenizer
        response_text = tokenizer.batch_decode(output_sequences, skip_special_tokens=True)[0].strip()

        print("Generation complete.", file=sys.stderr)

        # Output the result as JSON to stdout
        print(json.dumps({"response": response_text}))
        print("Result sent to stdout.", file=sys.stderr)

    except Exception as e:
        print(f"Error during script execution: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr) # Print full traceback to stderr
        # Send error as JSON to stdout
        print(json.dumps({"error": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)

if __name__ == "__main__":
    main()
