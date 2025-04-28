import React, { useEffect } from "react";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ApiConfiguration } from "../../../../../src/shared/api"
import { vscode } from "../../../utils/vscode";

interface Props {
  apiConfiguration: ApiConfiguration;
  setApiConfiguration: (config: ApiConfiguration) => void;
}

// 다른 옵션과 동일하게 handleInputChange 헬퍼 사용
const handleInputChange = (apiConfiguration: ApiConfiguration, setApiConfiguration: (config: ApiConfiguration) => void) => (field: keyof ApiConfiguration) => (event: any) => {
  const newConfig = {
    ...apiConfiguration,
    [field]: event.target.value,
  };
  setApiConfiguration(newConfig);
  vscode.postMessage({ type: "didUpdateSettings", apiConfiguration: newConfig });
};

const HyperClovaXOptions: React.FC<Props> = ({ apiConfiguration, setApiConfiguration }) => {
  const onInput = handleInputChange(apiConfiguration, setApiConfiguration)("hyperclovaxUrl");

  useEffect(() => {
    // 저장 트리거 시점에 로그 출력
    if (apiConfiguration.hyperclovaxUrl !== undefined) {
      // 값이 비어있을 때와 아닐 때 모두 로그
      if (typeof apiConfiguration.hyperclovaxUrl === "string" && apiConfiguration.hyperclovaxUrl.trim().length > 0) {
        console.log("[Caret][HyperClovaXOptions] Saving hyperclovaxUrl:", apiConfiguration.hyperclovaxUrl)
      } else {
        console.log("[Caret][HyperClovaXOptions] Removing hyperclovaxUrl (empty):", apiConfiguration.hyperclovaxUrl)
      }
    }
  }, [apiConfiguration.hyperclovaxUrl])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <VSCodeTextField
        value={(apiConfiguration as any).hyperclovaxUrl || ""}
        onInput={onInput}
        placeholder="http://localhost:8000 (SLLM 서버 URL)"
        style={{ width: "100%" }}
        type="url"
      >
        SLLM 서버 URL (필수)
      </VSCodeTextField>
      {/* hyperclovaxDevice 입력란 제거 */}
      <div style={{ fontSize: 13, color: "var(--vscode-descriptionForeground)", marginBottom: 8 }}>
        SLLM 서버가 실행 중이어야 하며, Vision Inference Panel에서 이미지를 업로드해 사용할 수 있습니다.<br />
        별도의 API Key는 필요하지 않습니다.<br />
        SLLM 서버 URL이 올바르게 입력되어야 정상 동작합니다.
      </div>
    </div>
  );
};

export default HyperClovaXOptions;
