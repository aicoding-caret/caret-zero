import React, { useState } from "react";

// MCP Vision inference endpoint (임시 하드코딩, 추후 설정에서 받아오도록 개선)
const MCP_VISION_ENDPOINT = "http://localhost:8000/tool/generate_hyperclovax_vision";

const VisionInferencePanel: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setError("");
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Vision inference 요청
  const handleInference = async () => {
    setLoading(true);
    setResult("");
    setError("");
    try {
      let imageBase64 = "";
      if (imageFile) {
        // 파일을 base64로 변환
        const fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        imageBase64 = fileData;
      }
      const response = await fetch(MCP_VISION_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, image_base64: imageBase64 })
      });
      if (!response.ok) throw new Error("서버 오류: " + response.status);
      const data = await response.json();
      setResult(data.result || JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>🖼️ HyperClovaX Vision Inference</h2>
      <div style={{ marginBottom: 12 }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginBottom: 8 }}
        />
        {imagePreview && (
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <img src={imagePreview} alt="업로드 미리보기" style={{ maxWidth: 240, maxHeight: 180, borderRadius: 8 }} />
          </div>
        )}
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="프롬프트를 입력하세요 (예: 이 이미지를 설명해줘)"
          rows={3}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button onClick={handleInference} disabled={loading || !imageFile || !prompt} style={{ width: "100%", padding: 8 }}>
          {loading ? "분석 중..." : "Vision Inference 요청"}
        </button>
      </div>
      {error && <div style={{ color: "#e06c75", marginBottom: 8 }}>{error}</div>}
      {result && (
        <div style={{ background: "#222", color: "#fff", padding: 12, borderRadius: 8, marginTop: 12 }}>
          <strong>결과:</strong>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{result}</div>
        </div>
      )}
    </div>
  );
};

export default VisionInferencePanel;
