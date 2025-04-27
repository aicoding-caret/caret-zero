import React from "react";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ApiConfiguration } from "../../../../src/shared/api";

interface Props {
  apiConfiguration: ApiConfiguration;
  setApiConfiguration: (config: ApiConfiguration) => void;
}

const HyperClovaXOptions: React.FC<Props> = ({ apiConfiguration, setApiConfiguration }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <VSCodeTextField
        value={apiConfiguration.hyperclovaxModelPath || ""}
        onInput={e =>
          setApiConfiguration({ ...apiConfiguration, hyperclovaxModelPath: (e.target as HTMLInputElement).value })
        }
        placeholder="/absolute/path/to/model or huggingface id"
        style={{ width: "100%" }}
      >
        모델 경로 (필수)
      </VSCodeTextField>
      <VSCodeTextField
        value={apiConfiguration.hyperclovaxDevice || "cuda"}
        onInput={e =>
          setApiConfiguration({ ...apiConfiguration, hyperclovaxDevice: (e.target as HTMLInputElement).value })
        }
        placeholder="cuda 또는 cpu"
        style={{ width: "100%" }}
      >
        디바이스 (cuda/cpu, 기본값: cuda)
      </VSCodeTextField>
      <div style={{ fontSize: 13, color: "var(--vscode-descriptionForeground)", marginBottom: 8 }}>
        MCP 서버가 실행 중이어야 하며, Vision Inference Panel에서 이미지를 업로드해 사용할 수 있습니다.<br />
        별도의 API Key는 필요하지 않습니다.<br />
        모델 경로가 올바르게 입력되어야 정상 동작합니다.
      </div>
    </div>
  );
};

export default HyperClovaXOptions;
