from transformers import AutoModelForCausalLM, AutoProcessor, AutoTokenizer

model_name = "naver-hyperclovax/HyperCLOVAX-SEED-Vision-Instruct-3B"
model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True).to(device="cuda")
preprocessor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# LLM Example
# It is recommended to use the chat template with HyperCLOVAX models.
# Using the chat template allows you to easily format your input in ChatML style.
chat = [
        {"role": "system", "content": "you are helpful assistant!"},
        {"role": "user", "content": "Hello, how are you?"},
        {"role": "assistant", "content": "I'm doing great. How can I help you today?"},
        {"role": "user", "content": "I'd like to show off how chat templating works!"},
]
input_ids = tokenizer.apply_chat_template(chat, return_tensors="pt", tokenize=True)
input_ids = input_ids.to(device="cuda")

# Please adjust parameters like top_p appropriately for your use case.
output_ids = model.generate(
        input_ids,
        max_new_tokens=64,
        do_sample=True,
        top_p=0.6,
        temperature=0.5,
        repetition_penalty=1.0,
)
print("=" * 80)
print("LLM EXAMPLE")
print(tokenizer.batch_decode(output_ids)[0])
print("=" * 80)

# VLM Example
# For image and video inputs, you can use url, local_path, base64, or bytes.
vlm_chat = [
        {"role": "system", "content": {"type": "text", "text": "System Prompt"}},
        {"role": "user", "content": {"type": "text", "text": "User Text 1"}},
        {
                "role": "user",
                "content": {
                        "type": "image",
                        "filename": "tradeoff_sota.png",
                        "image": "https://github.com/naver-ai/rdnet/blob/main/resources/images/tradeoff_sota.png?raw=true",
                        "ocr": "List the words in the image in raster order. Even if the word order feels unnatural for reading, the model will handle it as long as it follows raster order.",
                        "lens_keywords": "Gucci Ophidia, cross bag, Ophidia small, GG, Supreme shoulder bag",
                        "lens_local_keywords": "[0.07, 0.21, 0.92, 0.90] Gucci Ophidia",
                }
        },
        {
                "role": "user",
                "content": {
                        "type": "image",
                        "filename": "tradeoff.png",
                        "image": "https://github.com/naver-ai/rdnet/blob/main/resources/images/tradeoff.png?raw=true",
                }
        },
        {"role": "assistant", "content": {"type": "text", "text": "Assistant Text 1"}},
        {"role": "user", "content": {"type": "text", "text": "User Text 2"}},
        {
                "role": "user",
                "content": {
                        "type": "video",
                        "filename": "rolling-mist-clouds.mp4",
                        "video": "freenaturestock-rolling-mist-clouds.mp4",
                }
        },
        {"role": "user", "content": {"type": "text", "text": "User Text 3"}},
]

new_vlm_chat, all_images, is_video_list = preprocessor.load_images_videos(vlm_chat)
preprocessed = preprocessor(all_images, is_video_list=is_video_list)
input_ids = tokenizer.apply_chat_template(
        new_vlm_chat, return_tensors="pt", tokenize=True, add_generation_prompt=True,
)

output_ids = model.generate(
        input_ids=input_ids.to(device="cuda"),
        max_new_tokens=8192,
        do_sample=True,
        top_p=0.6,
        temperature=0.5,
        repetition_penalty=1.0,
        **preprocessed,
)
print(tokenizer.batch_decode(output_ids)[0])
