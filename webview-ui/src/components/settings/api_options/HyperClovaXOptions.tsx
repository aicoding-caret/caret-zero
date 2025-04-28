import React from "react";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ApiConfiguration } from "../../../../../src/shared/api"

interface Props {
  apiConfiguration: ApiConfiguration;
  setApiConfiguration: (config: ApiConfiguration) => void;
}

const HyperClovaXOptions: React.FC<Props> = ({ apiConfiguration, setApiConfiguration }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <VSCodeTextField
        value={apiConfiguration.hyperclovaxMcpUrl || ""}
        onInput={e =>
          setApiConfiguration({ ...apiConfiguration, hyperclovaxMcpUrl: (e.target as HTMLInputElement).value })
        }
        placeholder="http://localhost:8000 (MCP 서버 URL)"
        style={{ width: "100%" }}
        type="url"
      >
        MCP 서버 URL (필수)
      </VSCodeTextField>
      {/* hyperclovaxDevice 입력란 제거 */}
      <div style={{ fontSize: 13, color: "var(--vscode-descriptionForeground)", marginBottom: 8 }}>
        MCP 서버가 실행 중이어야 하며, Vision Inference Panel에서 이미지를 업로드해 사용할 수 있습니다.<br />
        별도의 API Key는 필요하지 않습니다.<br />
        MCP 서버 URL이 올바르게 입력되어야 정상 동작합니다.
      </div>
    </div>
  );
};

export default HyperClovaXOptions;
